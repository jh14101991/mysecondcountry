import euExpat from "./eu-expat-tax-regimes-by-rate.json" with { type: "json" };
import euResidency from "./eu-residency-under-3700-a-month.json" with { type: "json" };
import { type Shortlist, ShortlistSchema } from "./schema.js";

const RAW: unknown[] = [euResidency, euExpat];

function parseShortlist(raw: unknown): Shortlist {
  return ShortlistSchema.parse(raw);
}

export const shortlists: Shortlist[] = RAW.map(parseShortlist);

export function shortlistBySlug(slug: string): Shortlist | undefined {
  return shortlists.find((s) => s.slug === slug);
}

export function shortlistById(id: string): Shortlist | undefined {
  return shortlists.find((s) => s.id === id);
}
