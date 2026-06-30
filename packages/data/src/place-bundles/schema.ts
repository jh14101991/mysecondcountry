import { z } from "zod";
import { FactRefSchema } from "../refs.js";
import { type CitedValue, citedValue, GranularitySchema } from "../schema.js";

const URL_SAFE = z.string().regex(/^[a-z0-9-]+$/, "must be url-safe");
const VARIABLE_KEY = z.string().regex(/^[a-z0-9_]+$/, "must be a variable key");

export const MatrixCategorySchema = z.enum([
  "identity",
  "money",
  "tax_residency",
  "climate",
  "travel_connectivity",
  "health_family_schooling",
  "safety_rights",
  "nature_environment",
  "culture_services",
]);
export type MatrixCategory = z.infer<typeof MatrixCategorySchema>;

export const CoverageStatusSchema = z.enum([
  "local",
  "regional",
  "national",
  "inherited_national",
  "inherited_regional",
  "proxy",
  "relational",
  "unavailable",
  "blocked",
  "deferred",
]);
export type CoverageStatus = z.infer<typeof CoverageStatusSchema>;

export const SourceGapReasonSchema = z.enum([
  "no_public_source_found",
  "source_exists_but_paywalled",
  "source_terms_block_reuse",
  "source_bot_blocked_manual_needed",
  "local_source_too_sparse",
  "official_source_only_national",
  "requires_geospatial_build",
  "requires_manual_maps_check",
  "source_search_required",
  "out_of_slice",
]);
export type SourceGapReason = z.infer<typeof SourceGapReasonSchema>;

const RowFactInputSchema = z.union([
  FactRefSchema,
  citedValue(z.union([z.number(), z.string(), z.boolean()])),
]);

export const MatrixRowInputSchema = z
  .object({
    key: VARIABLE_KEY,
    label: z.string().min(1),
    matrixCategory: MatrixCategorySchema,
    intendedGranularity: GranularitySchema,
    observedGranularity: GranularitySchema.optional(),
    coverageStatus: CoverageStatusSchema,
    cited: RowFactInputSchema.optional(),
    unit: z.string().min(1).optional(),
    sourceGapReason: SourceGapReasonSchema.optional(),
    notes: z.string().min(1).optional(),
  })
  .superRefine((row, ctx) => {
    const needsFact = [
      "local",
      "regional",
      "national",
      "inherited_national",
      "inherited_regional",
      "proxy",
      "relational",
    ].includes(row.coverageStatus);
    if (needsFact && !row.cited) {
      ctx.addIssue({
        code: "custom",
        path: ["cited"],
        message: `${row.coverageStatus} rows must carry a CitedValue or FactRef`,
      });
    }
    if (!needsFact && !row.sourceGapReason) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceGapReason"],
        message: `${row.coverageStatus} rows must explain the source gap`,
      });
    }
  });

export type MatrixRowInput = z.infer<typeof MatrixRowInputSchema>;

export const PlaceEvidenceBundleInputSchema = z.object({
  id: URL_SAFE,
  candidateId: URL_SAFE,
  placeId: URL_SAFE.nullable(),
  placeName: z.string().min(1),
  granularity: GranularitySchema,
  parentId: URL_SAFE.nullable(),
  publishTier: z.enum(["pilot", "standard", "flagship"]),
  status: z.enum(["researching", "source_gap", "data_bundle_ready"]),
  summary: z.string().min(80),
  publicationRecommendation: z.enum(["publish", "hold", "skip"]),
  rows: z.array(MatrixRowInputSchema).min(1),
});

export type PlaceEvidenceBundleInput = z.infer<typeof PlaceEvidenceBundleInputSchema>;

export interface MatrixRow {
  key: string;
  label: string;
  matrixCategory: MatrixCategory;
  intendedGranularity: z.infer<typeof GranularitySchema>;
  observedGranularity?: z.infer<typeof GranularitySchema>;
  coverageStatus: CoverageStatus;
  cited?: CitedValue;
  unit?: string;
  sourceGapReason?: SourceGapReason;
  notes?: string;
}

export interface PlaceEvidenceBundle {
  id: string;
  candidateId: string;
  placeId: string | null;
  placeName: string;
  granularity: z.infer<typeof GranularitySchema>;
  parentId: string | null;
  publishTier: "pilot" | "standard" | "flagship";
  status: "researching" | "source_gap" | "data_bundle_ready";
  summary: string;
  publicationRecommendation: "publish" | "hold" | "skip";
  rows: MatrixRow[];
}
