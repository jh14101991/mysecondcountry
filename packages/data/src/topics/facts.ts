import type { CitedValue } from "../schema.js";
import type { Topic } from "./schema.js";

/** Walk every resolved CitedValue on a topic entry, with a dotted path. */
export function collectTopicsCitedValues(topic: Topic): { path: string; cited: CitedValue }[] {
  return topic.facts.map((fact, i) => ({ path: `facts.${i}`, cited: fact.cited }));
}

/** Stable fact id from a topic id and a dotted path. */
export function topicFactId(topicId: string, path: string): string {
  return `${topicId}#${path}`;
}
