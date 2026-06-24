import { type CitedValue, collectCitedValues, isStale, type Place } from "@where/data";
import {
  CONFIDENCE_FACTOR,
  DEFAULT_MATCH_WEIGHTS,
  type MatchDimension,
  type MatchWeights,
} from "./weights.js";

/**
 * User-supplied constraints. Each provided field becomes one screening dimension. The
 * cost ceiling is on the EU27=100 price level scale (the granularity we can cite), not
 * raw EUR, until a cited town-level EUR cost source exists.
 */
export interface ScreeningCriteria {
  maxPriceLevelIndexEU27?: number;
  minJanuaryHighC?: number;
  maxJulyHighC?: number;
  minAnnualSunHours?: number;
  provableMonthlyIncomeEUR?: number;
  maxIncomeTaxRate?: number;
}

export interface DimensionResult {
  dimension: MatchDimension;
  applicable: boolean;
  matched: boolean | null;
  weight: number;
  confidenceFactor: number | null;
  /** Neutral, factual description. Never a per-person verdict (FENCE.md). */
  detail: string;
}

export interface FenceWarning {
  path: string;
  reason: "low-confidence" | "stale";
  category?: string;
  message: string;
}

export interface ScreeningResult {
  placeId: string;
  /** 0-100, confidence-weighted fraction of the user's stated criteria that match. */
  score: number;
  matchedCount: number;
  applicableCount: number;
  breakdown: DimensionResult[];
  /** Fields the reader should treat with caution: low confidence or past their staleness window. */
  fenceWarnings: FenceWarning[];
}

export interface ScreenOptions {
  weights?: MatchWeights;
  /** Reference date for staleness checks. Pass a fixed date for deterministic tests. */
  now?: Date;
}

interface DimensionSpec {
  dimension: MatchDimension;
  cited: CitedValue<number> | undefined;
  criterion: number | undefined;
  /** Does the cited value satisfy the criterion? */
  test: (value: number, criterion: number) => boolean;
  describe: (value: CitedValue<number> | undefined, criterion: number | undefined) => string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Screen one Place against one user's criteria. Pure: no I/O, deterministic given
 * (place, criteria, options). Output is a match score and a per-dimension breakdown,
 * never a recommendation or a per-person eligibility verdict (FENCE.md).
 */
export function screenPlace(
  place: Place,
  criteria: ScreeningCriteria,
  options: ScreenOptions = {},
): ScreeningResult {
  const weights = options.weights ?? DEFAULT_MATCH_WEIGHTS;
  const now = options.now ?? new Date();

  const specs: DimensionSpec[] = [
    {
      dimension: "cost",
      cited: place.costOfLiving.priceLevelIndexEU27,
      criterion: criteria.maxPriceLevelIndexEU27,
      test: (v, c) => v <= c,
      describe: (v, c) =>
        `Price level index (EU27=100): ${v?.value}. Your ceiling: ${c}. ${v?.granularity === "country" ? "National figure." : ""}`.trim(),
    },
    {
      dimension: "winterWarmth",
      cited: place.climate.averageJanuaryHighC,
      criterion: criteria.minJanuaryHighC,
      test: (v, c) => v >= c,
      describe: (v, c) => `Average January high: ${v?.value} C. Your floor: ${c} C.`,
    },
    {
      dimension: "summerComfort",
      cited: place.climate.averageJulyHighC,
      criterion: criteria.maxJulyHighC,
      test: (v, c) => v <= c,
      describe: (v, c) => `Average July high: ${v?.value} C. Your ceiling: ${c} C.`,
    },
    {
      dimension: "sunshine",
      cited: place.climate.averageAnnualSunHours,
      criterion: criteria.minAnnualSunHours,
      test: (v, c) => v >= c,
      describe: (v, c) => `Mean annual sunshine: ${v?.value} hours. Your floor: ${c} hours.`,
    },
    {
      dimension: "digitalNomadVisa",
      cited: place.residency?.digitalNomadVisa,
      criterion: criteria.provableMonthlyIncomeEUR,
      // The published floor must be at or below the income the user states they can prove.
      test: (floor, income) => income >= floor,
      describe: (v, c) =>
        `Digital nomad permit published minimum net income: ${v?.value} EUR/month. Your stated income: ${c} EUR/month.`,
    },
    {
      dimension: "incomeTax",
      cited: place.tax?.headlinePersonalIncomeTaxRate,
      criterion: criteria.maxIncomeTaxRate,
      test: (rate, max) => rate <= max,
      describe: (v, c) =>
        `Top marginal income tax rate: ${v?.value} percent. Your ceiling: ${c} percent.`,
    },
  ];

  const breakdown: DimensionResult[] = specs.map((spec) => {
    const applicable = spec.cited !== undefined && spec.criterion !== undefined;
    const weight = weights[spec.dimension];
    if (!applicable || spec.cited === undefined || spec.criterion === undefined) {
      return {
        dimension: spec.dimension,
        applicable: false,
        matched: null,
        weight,
        confidenceFactor: null,
        detail: spec.describe(spec.cited, spec.criterion),
      };
    }
    const matched = spec.test(spec.cited.value, spec.criterion);
    return {
      dimension: spec.dimension,
      applicable: true,
      matched,
      weight,
      confidenceFactor: CONFIDENCE_FACTOR[spec.cited.confidence],
      detail: spec.describe(spec.cited, spec.criterion),
    };
  });

  let weightedMatch = 0;
  let weightedTotal = 0;
  let matchedCount = 0;
  let applicableCount = 0;
  for (const dim of breakdown) {
    if (!dim.applicable || dim.confidenceFactor === null) continue;
    applicableCount += 1;
    if (dim.matched) matchedCount += 1;
    const effectiveWeight = dim.weight * dim.confidenceFactor;
    weightedTotal += effectiveWeight;
    if (dim.matched) weightedMatch += effectiveWeight;
  }

  const score = weightedTotal === 0 ? 0 : round2((weightedMatch / weightedTotal) * 100);

  const fenceWarnings: FenceWarning[] = [];
  for (const { path, cited } of collectCitedValues(place)) {
    if (cited.confidence === "low") {
      fenceWarnings.push({
        path,
        reason: "low-confidence",
        category: cited.category,
        message: `${path}: low-confidence source (${cited.sourceName}). Verify before relying on it.`,
      });
    }
    if (isStale(cited, now)) {
      fenceWarnings.push({
        path,
        reason: "stale",
        category: cited.category,
        message: `${path}: last verified ${cited.verifiedDate}, past its staleness window. Check the source directly.`,
      });
    }
  }

  return { placeId: place.id, score, matchedCount, applicableCount, breakdown, fenceWarnings };
}
