import { z } from "zod";
import { citedValue, TaxValueSchema } from "../schema.js";

/**
 * String-valued high-liability wrapper: confidence is high|medium only (no low),
 * category is fixed. Mirrors the module-private highLiabilityValue in schema.ts
 * but for string values (regime eligibility rules described in prose).
 */
function stringHighLiabilityValue(category: "residency" | "tax") {
  return citedValue(z.string().min(1)).extend({
    confidence: z.enum(["high", "medium"]),
    category: z.literal(category),
  });
}

const StringTaxValueSchema = stringHighLiabilityValue("tax");
const StringResidencyValueSchema = stringHighLiabilityValue("residency");

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
  /** The headline percentage rate (numeric, high|medium confidence). */
  headlineRate: TaxValueSchema,
  /** Maximum regime duration in years (numeric, high|medium confidence). */
  durationYears: TaxValueSchema,
  eligibility: z.object({
    /** Prior non-residency requirement, in prose. */
    priorNonResidency: StringResidencyValueSchema,
    /** Qualifying country of transfer, in prose. */
    qualifyingCountry: StringResidencyValueSchema,
    /** Residency obligation during the regime, in prose. */
    residencyObligation: StringResidencyValueSchema,
    /** Deadline to apply for the regime, in prose. */
    applicationWindow: StringTaxValueSchema,
    /** Notable condition or caveat, in prose. */
    knownCatch: StringTaxValueSchema,
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
