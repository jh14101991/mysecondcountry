// Regime sibling of collectCitedValues from ../schema.ts (ADR-0017).
// The small duplication of the visit shape is deliberate: regime roots differ from Place roots.
import type { CitedValue } from "../schema.js";
import type { Regime } from "./schema.js";

/** Walk every CitedValue on a Regime, with a dotted field path. */
export function collectRegimeCitedValues(regime: Regime): { path: string; cited: CitedValue }[] {
  const out: { path: string; cited: CitedValue }[] = [];
  const visit = (node: unknown, path: string): void => {
    if (node && typeof node === "object") {
      if ("value" in node && "sourceUrl" in node && "verifiedDate" in node) {
        out.push({ path, cited: node as CitedValue });
        return;
      }
      for (const [key, child] of Object.entries(node)) {
        visit(child, path ? `${path}.${key}` : key);
      }
    }
  };
  visit(regime.headlineRate, "headlineRate");
  visit(regime.durationYears, "durationYears");
  visit(regime.eligibility, "eligibility");
  return out;
}

/** Derive a stable fact id from a regime id and a dotted path. */
export function regimeFactId(regimeId: string, path: string): string {
  return `${regimeId}#${path}`;
}
