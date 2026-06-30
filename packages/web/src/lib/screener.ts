import { placePath, places } from "@where/data";
import { type ScreeningCriteria, type ScreeningResult, screenPlace } from "@where/engine";

const NUMERIC_FIELDS = [
  "maxPriceLevelIndexEU27",
  "minJanuaryHighC",
  "maxJulyHighC",
  "minAnnualSunHours",
  "provableMonthlyIncomeEUR",
  "maxIncomeTaxRate",
] as const;

type NumericField = (typeof NUMERIC_FIELDS)[number];

type CriteriaInput = Record<string, string> | URLSearchParams | FormData;

function readField(input: CriteriaInput, key: string): string | null {
  if (input instanceof URLSearchParams || input instanceof FormData) {
    const value = input.get(key);
    return typeof value === "string" ? value : null;
  }
  return key in input ? input[key] : null;
}

/** Build a ScreeningCriteria from form/query input. Blanks and unknown keys are dropped. */
export function parseCriteria(input: CriteriaInput): ScreeningCriteria {
  const criteria: ScreeningCriteria = {};
  for (const field of NUMERIC_FIELDS) {
    const raw = readField(input, field);
    if (raw === null) continue;
    const cleaned = raw.replace(/[,\s]/g, "");
    if (cleaned === "") continue;
    const n = Number(cleaned);
    if (Number.isFinite(n)) criteria[field as NumericField] = n;
  }
  return criteria;
}

export interface RankedPlace extends ScreeningResult {
  name: string;
  routePath: string;
}

/** Score every place against the criteria, drop those with no applicable dimension, sort high to low. */
export function rankPlaces(criteria: ScreeningCriteria, opts: { now?: Date } = {}): RankedPlace[] {
  return places
    .map((place) => {
      const result = screenPlace(place, criteria, opts.now ? { now: opts.now } : {});
      return { ...result, name: place.name, routePath: placePath(place) };
    })
    .filter((r) => r.applicableCount > 0)
    .sort((a, b) => b.score - a.score);
}
