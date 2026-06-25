import { z } from "zod";
import { FactRefSchema } from "../refs.js";
import { citedValue } from "../schema.js";

const URL_SAFE = z.string().regex(/^[a-z0-9-]+$/, "must be url-safe");
const HTTPS = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), { message: "must use https://" });

/**
 * A single checklist step. The requirement is either a FactRef (pointing to an existing
 * regime or place CitedValue) or an inline CitedValue. It is optional: informational steps
 * with no citable requirement may omit it.
 */
export const StepInputSchema = z.object({
  order: z.number().int().positive(),
  title: z.string().min(3),
  detail: z.string().min(10),
  requirement: z.union([FactRefSchema, citedValue(z.union([z.number(), z.string()]))]).optional(),
  officialSourceUrl: HTTPS.optional(),
});
export type StepInput = z.infer<typeof StepInputSchema>;

/**
 * Forward-compat calculator config. No calculator entries are authored yet; this field
 * is kept so future calculator tools parse without a schema change.
 */
export const CalculatorConfigSchema = z.object({
  inputs: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      type: z.string().min(1),
    }),
  ),
  reads: z.string().min(1),
  formulaId: z.string().min(1),
});

export const ToolInputSchema = z.object({
  id: URL_SAFE,
  slug: URL_SAFE,
  title: z.string().min(12),
  toolType: z.enum(["checklist", "calculator"]),
  intro: z.string().min(80),
  steps: z.array(StepInputSchema).min(1),
  calculator: CalculatorConfigSchema.optional(),
  relatedSlugs: z.array(URL_SAFE).max(6),
});
export type ToolInput = z.infer<typeof ToolInputSchema>;

import type { CitedValue } from "../schema.js";

/** Resolved tool: every step's requirement (if present) is a plain CitedValue. */
export interface ResolvedStep {
  order: number;
  title: string;
  detail: string;
  requirement?: CitedValue;
  officialSourceUrl?: string;
}

export interface Tool {
  id: string;
  slug: string;
  title: string;
  toolType: "checklist" | "calculator";
  intro: string;
  steps: ResolvedStep[];
  relatedSlugs: string[];
}
