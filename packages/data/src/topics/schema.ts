import { z } from "zod";
import { FactRefSchema } from "../refs.js";
import { type CitedValue, citedValue } from "../schema.js";

const URL_SAFE = z.string().regex(/^[a-z0-9-]+$/, "must be url-safe");

// Authoring shape: fact.cited is CitedValue | FactRef.
const FactInputSchema = z.object({
  key: URL_SAFE,
  label: z.string().min(1),
  cited: z.union([FactRefSchema, citedValue(z.union([z.number(), z.string()]))]),
});

export const TopicInputSchema = z.object({
  id: URL_SAFE,
  slug: URL_SAFE,
  title: z.string().min(12),
  countryId: z.string().nullable(),
  facts: z.array(FactInputSchema).min(1),
  context: z.string().min(80),
  /** Short authored summary for the HTML meta description (SEO sweet spot ~155 chars). */
  metaDescription: z.string().min(50).max(160),
  definedTerm: z
    .object({
      name: z.string().min(1),
      description: z.string().min(1),
    })
    .optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .optional(),
  relatedSlugs: z.array(URL_SAFE).max(6),
});

export type TopicInput = z.infer<typeof TopicInputSchema>;

/** Resolved topic: every fact.cited is a plain CitedValue. */
export interface Topic {
  id: string;
  slug: string;
  title: string;
  countryId: string | null;
  facts: { key: string; label: string; cited: CitedValue }[];
  context: string;
  metaDescription: string;
  definedTerm?: { name: string; description: string };
  faqs?: { question: string; answer: string }[];
  relatedSlugs: string[];
}
