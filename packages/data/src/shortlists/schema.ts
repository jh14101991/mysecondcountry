import { z } from "zod";

const URL_SAFE = z.string().regex(/^[a-z0-9-]+$/, "must be url-safe");
const HTTPS_URL = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), { message: "must be https" });

const FilterSchema = z.object({
  key: z.string().min(1),
  op: z.enum(["<=", ">=", "==", "in"]),
  value: z.union([z.number(), z.string(), z.boolean(), z.array(z.string())]),
});

const RankSchema = z.object({
  byKey: z.string().min(1),
  dir: z.enum(["asc", "desc"]),
});

const ConstraintSchema = z.object({
  filters: z.array(FilterSchema).min(1),
  rank: RankSchema,
  /** Extra catalogue keys shown as cited context columns, beyond the filter and rank keys. */
  display: z.array(z.string()).optional(),
});

export const ShortlistSchema = z.object({
  id: URL_SAFE,
  slug: URL_SAFE,
  title: z.string().min(12),
  intro: z.string().min(80),
  metaDescription: z.string().min(50).max(160),
  constraint: ConstraintSchema,
  relatedSlugs: z.array(URL_SAFE).max(6),
  screenerUrl: HTTPS_URL.optional(),
});

export type Shortlist = z.infer<typeof ShortlistSchema>;
export type ShortlistFilter = z.infer<typeof FilterSchema>;
export type ShortlistConstraint = z.infer<typeof ConstraintSchema>;
