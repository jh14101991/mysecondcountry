import { z } from "zod";
import { citedValue, TaxRegimeValueSchema, TaxValueSchema } from "../schema.js";

// Local residency string wrapper: the only exported string-residency factory is
// GoldenVisaValueSchema, whose name is misleading for pensioner regime eligibility.
const StringResidencyValueSchema = citedValue(z.string().min(1)).extend({
  confidence: z.enum(["high", "medium"]),
  category: z.literal("residency"),
});

export const RegimeSchema = z.object({
  /** URL-safe lowercase identifier, unique across regimes. */
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** URL slug (no country prefix). */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Human-readable display name. */
  name: z.string().min(1),
  /** Place id of the country that administers this regime (e.g. "gr"). */
  countryId: z.string().min(1),
  /** Only "tax" regimes exist today; extend with a union when needed. */
  regimeType: z.literal("tax"),
  /** How the headline rate reads: a percent of income, or a fixed annual lump sum in EUR. */
  rateType: z.enum(["percent", "lumpSum"]).default("percent"),
  /** The income the headline rate applies to, e.g. "foreign-source income". */
  incomeBasis: z.string().min(3).default("foreign-source income"),
  /** The headline percentage rate (numeric, high|medium confidence). */
  headlineRate: TaxValueSchema,
  /** Maximum regime duration in years (numeric, high|medium confidence). */
  durationYears: TaxValueSchema,
  eligibility: z.object({
    /** Prior non-residency requirement, in prose. */
    priorNonResidency: StringResidencyValueSchema,
    /** Qualifying country of transfer, in prose. */
    qualifyingCountry: StringResidencyValueSchema.optional(),
    /** Residency obligation during the regime, in prose. */
    residencyObligation: StringResidencyValueSchema.optional(),
    /** Deadline to apply for the regime, in prose. */
    applicationWindow: TaxRegimeValueSchema.optional(),
    /** Notable condition or caveat, in prose. */
    knownCatch: TaxRegimeValueSchema,
    /** Optional: a minimum investment condition (e.g. Greece Article 5A). */
    investmentRequirement: TaxRegimeValueSchema.optional(),
    /** Optional: exclusion of prior beneficiaries of another regime (e.g. IFICI vs NHR). */
    priorRegimeExclusion: TaxRegimeValueSchema.optional(),
  }),
  /**
   * Human-authored prose summary. Minimum 80 characters enforces substantive
   * content: a one-liner cannot satisfy the cited-data disclaimer requirement.
   */
  summary: z.string().min(80),
});

export type Regime = z.infer<typeof RegimeSchema>;

/** Validated regime id: URL-safe lowercase. */
export const RegimeIdSchema = z.string().regex(/^[a-z0-9-]+$/);
export type RegimeId = z.infer<typeof RegimeIdSchema>;
