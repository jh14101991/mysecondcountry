import type { CitedValue } from "../schema.js";
import type { Qa } from "./schema.js";

/** Walk every resolved CitedValue on a qa entry, with a dotted path. */
export function collectQaCitedValues(qa: Qa): { path: string; cited: CitedValue }[] {
  const out: { path: string; cited: CitedValue }[] = [{ path: "answerFact", cited: qa.answerFact }];
  for (let i = 0; i < qa.supportingFacts.length; i++) {
    const cited = qa.supportingFacts[i];
    if (cited) out.push({ path: `supportingFacts.${i}`, cited });
  }
  return out;
}

/** Stable fact id from a qa id and a dotted path. */
export function qaFactId(qaId: string, path: string): string {
  return `${qaId}#${path}`;
}
