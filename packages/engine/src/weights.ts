import type { Confidence } from "@where/data";

/**
 * Default match weights for the single-place screener (`screenPlace`). They weight the
 * user-criteria dimensions and sum to 1.0.
 *
 * NOTE: this is NOT the cohort-relative ranking model. The full confidence-aware,
 * cohort-normalized ranking with `packages/data/weights.json` (ADR-0009,
 * docs/engine-weights.md) lands in Phase A, once there are multiple Places to normalize
 * across. This object is the bootstrap precursor for screening one Place against one
 * user's stated criteria.
 */
export const DEFAULT_MATCH_WEIGHTS = {
  cost: 0.25,
  winterWarmth: 0.2,
  summerComfort: 0.1,
  sunshine: 0.1,
  digitalNomadVisa: 0.15,
  incomeTax: 0.2,
} as const;

export type MatchDimension = keyof typeof DEFAULT_MATCH_WEIGHTS;
export type MatchWeights = Record<MatchDimension, number>;

/**
 * Map the locked confidence enum (ADR-0002) onto a 0-1 factor so a low-confidence claim
 * contributes less to the match score. The enum is the source of truth; this is the
 * numeric projection the weights model uses.
 */
export const CONFIDENCE_FACTOR: Record<Confidence, number> = {
  high: 1.0,
  medium: 0.6,
  low: 0.4,
};
