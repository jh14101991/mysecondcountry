import { z } from "zod";

/**
 * Confidence tier. Locked by ADR-0002. Rendered as a visible badge on every page:
 * high = filled, medium = half, low = hollow. A low value is shown, never suppressed.
 */
export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

/**
 * Geographic scope of the UNDERLYING data, independent of the Place it attaches to
 * (ADR-0003). A country-level figure on a town page renders "national figure shown
 * for [town]"; the web layer enforces that label.
 */
export const GranularitySchema = z.enum(["country", "region", "town"]);
export type Granularity = z.infer<typeof GranularitySchema>;

/**
 * Subject category of a claim. Drives the visa/tax/residency staleness rule
 * (CITATIONS.md, 90-day window) and the engine fence warnings.
 */
export const CitedCategorySchema = z.enum([
  "identity",
  "cost",
  "climate",
  "connectivity",
  "healthcare",
  "safety",
  "residency",
  "tax",
  "visa",
]);
export type CitedCategory = z.infer<typeof CitedCategorySchema>;

const HTTPS_URL = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), { message: "sourceUrl must use https://" });

const ISO_DATE = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "verifiedDate must be YYYY-MM-DD")
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), {
    message: "verifiedDate must be a real date",
  })
  .refine((d) => d <= new Date().toISOString().slice(0, 10), {
    message: "verifiedDate must not be in the future",
  });

/**
 * CitedValue: the citation-as-type fence (ADR-0002). Every factual field is one of
 * these; a bare scalar is a type error. Required core fields are the six locked in
 * ADR-0002. The optional provenance fields (archiveUrl, excerpt, category,
 * stalenessDays) support the CITATIONS.md rot-detection and staleness model without
 * contradicting the locked shape.
 */
export function citedValue<T extends z.ZodTypeAny>(value: T) {
  return z.object({
    value,
    sourceUrl: HTTPS_URL,
    sourceName: z.string().min(1),
    verifiedDate: ISO_DATE,
    confidence: ConfidenceSchema,
    granularity: GranularitySchema,
    // optional provenance / rot-detection (CITATIONS.md)
    category: CitedCategorySchema.optional(),
    archiveUrl: HTTPS_URL.optional(),
    excerpt: z.string().min(1).optional(),
    // per-field staleness override in days (e.g. Greek digital nomad visa = 60)
    stalenessDays: z.number().int().positive().optional(),
  });
}

/**
 * High-liability claim (visa, tax, residency). DOD (b) forbids "low" confidence on
 * these fields, and the category is fixed so the staleness check can find them.
 */
function highLiabilityValue<T extends z.ZodTypeAny>(
  value: T,
  category: "residency" | "tax" | "visa",
) {
  return citedValue(value).extend({
    confidence: z.enum(["high", "medium"]),
    category: z.literal(category),
  });
}

export const VisaValueSchema = highLiabilityValue(z.number().positive(), "visa");
export const TaxValueSchema = highLiabilityValue(z.number(), "tax");
export const ResidencyValueSchema = highLiabilityValue(z.number(), "residency");

/**
 * Ergonomic TS view of a CitedValue. The Zod factory is the runtime source of truth;
 * this interface is for authoring and engine code.
 */
export interface CitedValue<T = unknown> {
  value: T;
  sourceUrl: string;
  sourceName: string;
  verifiedDate: string;
  confidence: Confidence;
  granularity: Granularity;
  category?: CitedCategory;
  archiveUrl?: string;
  excerpt?: string;
  stalenessDays?: number;
}

/** One ancestor in a Place's path, ordered country -> ... -> immediate parent. */
export const AncestorSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be url-safe"),
  granularity: GranularitySchema,
});
export type Ancestor = z.infer<typeof AncestorSchema>;

/**
 * Place: the atomic object at country / region / town granularity. Every factual
 * claim is a CitedValue. `id` is stable and opaque (never reused, never deleted, see
 * id-stability test); `slug` is URL-mutable and redirects on change.
 */
export const PlaceSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "id must be a lowercase opaque slug"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be url-safe"),
  granularity: GranularitySchema,
  parentId: z.string().min(1).nullable(),
  name: z.string().min(1),
  country: z.string().min(1),
  coordinates: z.object({ lat: z.number(), lon: z.number() }).optional(),
  // Denormalized ancestry for URL building and breadcrumbs. Normalized to a places
  // index in Phase A; deliberately easy to delete then.
  ancestry: z.array(AncestorSchema),
  // Human-authored. Drives <title> and the programmatic-SEO uniqueness gate.
  description: z.string().min(80, "description must be >= 80 chars (anti-thin-content)"),
  status: z.enum(["active", "retired"]).default("active"),
  costOfLiving: z.object({
    priceLevelIndexEU27: citedValue(z.number().positive()),
  }),
  climate: z.object({
    averageJanuaryHighC: citedValue(z.number()),
    averageJulyHighC: citedValue(z.number()),
    averageAnnualSunHours: citedValue(z.number().nonnegative()),
    koppenClass: citedValue(z.string().min(1)),
  }),
  residency: z
    .object({
      digitalNomadVisa: VisaValueSchema,
    })
    .optional(),
  tax: z
    .object({
      headlinePersonalIncomeTaxRate: TaxValueSchema,
    })
    .optional(),
});
export type Place = z.infer<typeof PlaceSchema>;

/** Canonical URL path for a Place (ADR-0010): /places/[country]/[region]/[town]. */
export function placePath(place: Pick<Place, "slug" | "ancestry">): string {
  const segments = [...place.ancestry.map((a) => a.slug), place.slug];
  return `/places/${segments.join("/")}`;
}

/** Walk every CitedValue on a Place, with a dotted field path. Used by tests + engine. */
export function collectCitedValues(place: Place): { path: string; cited: CitedValue }[] {
  const out: { path: string; cited: CitedValue }[] = [];
  const visit = (node: unknown, path: string): void => {
    if (node && typeof node === "object") {
      if ("value" in node && "sourceUrl" in node && "verifiedDate" in node) {
        out.push({ path, cited: node as CitedValue });
        return;
      }
      for (const [key, child] of Object.entries(node)) {
        visit(child, path ? `${path}.${key}` : key);
      }
    }
  };
  visit(place.costOfLiving, "costOfLiving");
  visit(place.climate, "climate");
  if (place.residency) visit(place.residency, "residency");
  if (place.tax) visit(place.tax, "tax");
  return out;
}

/** Default staleness window (days) per category. Visa/tax/residency are the hard 90. */
export const DEFAULT_STALENESS_DAYS: Record<CitedCategory, number> = {
  identity: 365,
  cost: 180,
  climate: 365,
  connectivity: 180,
  healthcare: 365,
  safety: 365,
  residency: 90,
  tax: 90,
  visa: 90,
};

/** Days between a verifiedDate and a reference date (default today). */
export function ageInDays(verifiedDate: string, today: Date = new Date()): number {
  const verified = Date.parse(`${verifiedDate}T00:00:00Z`);
  const ref = Date.parse(`${today.toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.floor((ref - verified) / 86_400_000);
}

/** A CitedValue is stale if older than its override or its category default. */
export function isStale(cited: CitedValue, today: Date = new Date()): boolean {
  const limit =
    cited.stalenessDays ?? (cited.category ? DEFAULT_STALENESS_DAYS[cited.category] : 180);
  return ageInDays(cited.verifiedDate, today) > limit;
}
