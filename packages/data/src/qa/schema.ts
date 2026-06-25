import { z } from "zod";
import { FactRefSchema } from "../refs.js";
import { CitedCategorySchema, type CitedValue, citedValue } from "../schema.js";

const URL_SAFE = z.string().regex(/^[a-z0-9-]+$/, "must be url-safe");

// answerFact inline option: high-liability (tax|visa|residency, high|medium), number or string.
const AnswerFactInline = citedValue(z.union([z.number(), z.string()])).extend({
  confidence: z.enum(["high", "medium"]),
  category: z.enum(["tax", "visa", "residency"]),
});
// supportingFact inline option: any category, number or string.
const SupportingFactInline = citedValue(z.union([z.number(), z.string()]));
// Authoring shape for a supporting fact: an authored label plus a CitedValue or FactRef.
const SupportingFactInputSchema = z.object({
  label: z.string().min(1),
  cited: z.union([FactRefSchema, SupportingFactInline]),
});

export const QaInputSchema = z.object({
  id: URL_SAFE,
  slug: URL_SAFE,
  question: z.string().min(12),
  polarity: z.enum(["yes", "no", "qualified", "n-a"]),
  answer: z.string().min(12).max(240),
  answerFact: z.union([FactRefSchema, AnswerFactInline]),
  supportingFacts: z.array(SupportingFactInputSchema).max(3),
  rule: z.string().min(80),
  category: CitedCategorySchema,
  relatedSlugs: z.array(URL_SAFE).max(6),
});
export type QaInput = z.infer<typeof QaInputSchema>;

/** Resolved qa entry: every fact field is a plain CitedValue. */
export interface Qa {
  id: string;
  slug: string;
  question: string;
  polarity: "yes" | "no" | "qualified" | "n-a";
  answer: string;
  answerFact: CitedValue;
  supportingFacts: { label: string; cited: CitedValue }[];
  rule: string;
  category: z.infer<typeof CitedCategorySchema>;
  relatedSlugs: string[];
}
