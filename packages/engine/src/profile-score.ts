import { type Place, type Profile, placeVariables, variableByKey } from "@where/data";
import { CONFIDENCE_FACTOR } from "./weights.js";

export interface ProfileScore {
  placeId: string;
  /** 0-100, two decimal places. */
  score: number;
  /** Surfaced keys that had a known value and were included in the score. */
  usedKeys: string[];
  /** Surfaced keys with no value; renormalised out, never penalised. */
  missingKeys: string[];
  dealBreakerFailed: boolean;
}

/**
 * Round to two decimal places.
 * Matches the convention in screen.ts.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Returns 1 when the value satisfies the criterion, 0 when it does not.
 *
 * Rules (spec order):
 * - No criterion: 1 (key does not push the score down).
 * - direction "neutral": 1 (informational; a bound does not make a place better or worse).
 * - Non-numeric value against a numeric bound: 1 (cannot evaluate; do not penalise).
 * - Otherwise: check min/max bounds and return 1 if satisfied, 0 if not.
 */
function normalisedGoodness(
  value: unknown,
  criterion: { min?: number; max?: number } | undefined,
  direction: "higherBetter" | "lowerBetter" | "neutral",
): 0 | 1 {
  if (criterion === undefined) return 1;
  if (direction === "neutral") return 1;
  if (typeof value !== "number") return 1;

  const satisfied =
    (criterion.min === undefined || value >= criterion.min) &&
    (criterion.max === undefined || value <= criterion.max);

  return satisfied ? 1 : 0;
}

/**
 * Score a Place against a Profile.
 *
 * Pure and deterministic: no I/O, no Date.now(), no mutation.
 * Unknown variables (no cited value on the place) are renormalised out of the
 * denominator so the place is never penalised for data we have not gathered
 * (ADR-0016).
 *
 * Deal-breakers are evaluated separately and only set a flag; they do not
 * change the numeric score.
 */
export function scoreByProfile(
  place: Place,
  profile: Profile,
  criteria?: Record<string, { min?: number; max?: number }>,
): ProfileScore {
  const vars = placeVariables(place);
  const usedKeys: string[] = [];
  const missingKeys: string[] = [];
  let numerator = 0;
  let denominator = 0;

  for (const key of profile.surfaced) {
    const cited = vars[key];
    if (cited === undefined || cited.value === undefined) {
      missingKeys.push(key);
      continue;
    }

    usedKeys.push(key);
    const weight = profile.weights[key] ?? 0;
    const cf = CONFIDENCE_FACTOR[cited.confidence];
    const direction = variableByKey(key)?.direction ?? "neutral";
    const goodness = normalisedGoodness(cited.value, criteria?.[key], direction);

    numerator += weight * cf * goodness;
    denominator += weight * cf;
  }

  const score = denominator === 0 ? 0 : round2((numerator / denominator) * 100);

  // Evaluate deal-breakers. Unknown values are never a failure.
  let dealBreakerFailed = false;
  for (const db of profile.dealBreakers) {
    const cited = vars[db.key];
    if (cited === undefined || cited.value === undefined) continue;

    const v = cited.value;
    let violated = false;

    if (db.op === "<=") {
      violated = typeof v !== "number" || v > (db.value as number);
    } else if (db.op === ">=") {
      violated = typeof v !== "number" || v < (db.value as number);
    } else if (db.op === "==") {
      violated = v !== db.value;
    } else if (db.op === "in") {
      violated = !Array.isArray(db.value) || !(db.value as unknown[]).includes(v);
    }

    if (violated) {
      dealBreakerFailed = true;
      break;
    }
  }

  return {
    placeId: place.id,
    score,
    usedKeys,
    missingKeys,
    dealBreakerFailed,
  };
}
