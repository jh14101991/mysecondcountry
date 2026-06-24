import { z } from "zod";
import { ConfidenceSchema } from "../schema.js";

const HTTPS = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), "must be https");

export const ProfileIdSchema = z.enum([
  "wealthyRetiree",
  "budgetRetiree",
  "recentExiter",
  "nomadFamily",
  "noKidCouple",
  "soloNomad",
  "employedRemote",
]);
export type ProfileId = z.infer<typeof ProfileIdSchema>;

export const VariableCategorySchema = z.enum([
  "cost",
  "tax",
  "visa",
  "climate",
  "nature",
  "travel",
  "health",
  "safety",
  "community",
]);

export const VariableDefSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/),
  label: z.string().min(1),
  category: VariableCategorySchema,
  unit: z.string().optional(),
  kind: z.enum(["intrinsic", "relational"]),
  filterType: z.enum(["toggle", "range", "select", "boolean"]),
  direction: z.enum(["higherBetter", "lowerBetter", "neutral"]),
  source: z.object({
    name: z.string().min(1),
    url: HTTPS,
    autoPull: z.enum(["yes", "partial", "manual"]),
  }),
  defaultConfidence: ConfidenceSchema,
  // z.record(enum, val) in Zod 4 is exhaustive; partialRecord produces the correct
  // Partial<Record<ProfileId, ...>> type and accepts incomplete objects.
  profileRelevance: z.partialRecord(ProfileIdSchema, z.enum(["high", "medium", "low"])),
});
export type VariableDef = z.infer<typeof VariableDefSchema>;

export const ProfileSchema = z.object({
  id: ProfileIdSchema,
  label: z.string().min(1),
  weights: z.record(z.string(), z.number().nonnegative()),
  surfaced: z.array(z.string()),
  dealBreakers: z.array(
    z.object({
      key: z.string(),
      op: z.enum(["<=", ">=", "==", "in"]),
      value: z.unknown(),
    }),
  ),
});
export type Profile = z.infer<typeof ProfileSchema>;
