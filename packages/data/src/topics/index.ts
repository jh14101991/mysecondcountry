import { resolveCitedOrRef } from "../resolve.js";
import greeceTiersRaw from "./greece-golden-visa-price-tiers.json" with { type: "json" };
import portugalIficiRaw from "./portugal-ifici-the-nhr-successor.json" with { type: "json" };
import { type Topic, TopicInputSchema } from "./schema.js";

const RAW: unknown[] = [portugalIficiRaw, greeceTiersRaw];

function resolveTopic(raw: unknown): Topic {
  const input = TopicInputSchema.parse(raw);
  return {
    ...input,
    facts: input.facts.map((f) => ({
      key: f.key,
      label: f.label,
      cited: resolveCitedOrRef(f.cited),
    })),
  };
}

export const topics: Topic[] = RAW.map(resolveTopic);

export function topicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function topicById(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
