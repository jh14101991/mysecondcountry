import type { Profile } from "../variables/schema.js";

// Slice-1 has no lgbt_* catalogue variable. The acceptance/legal deal-breaker
// (lgbt_social / lgbt_legal) lands in slice 2. Until then the overlay nudges
// english_proficiency and gpi_score and carries no deal-breaker.
export const LGBTQ_OVERLAY: {
  dealBreakers: Profile["dealBreakers"];
  weights: Record<string, number>;
} = {
  weights: { english_proficiency: 0.5, gpi_score: 0.5 },
  dealBreakers: [],
};

export const PROFILES: Profile[] = [
  {
    id: "wealthyRetiree",
    label: "Wealthy retiree",
    weights: {
      physicians_per_1k: 1.0,
      special_tax_regime: 0.9,
      gpi_score: 0.8,
      winter_high: 0.7,
      annual_sunshine: 0.7,
      golden_visa: 0.6,
      top_income_tax_rate: 0.5,
      summer_high: 0.4,
    },
    surfaced: [
      "physicians_per_1k",
      "special_tax_regime",
      "winter_high",
      "annual_sunshine",
      "gpi_score",
      "golden_visa",
    ],
    dealBreakers: [],
  },
  {
    id: "budgetRetiree",
    label: "Budget retiree",
    // english_proficiency is intentionally absent so the overlay merge test
    // can verify a clean additive add (0 + overlay value).
    weights: {
      cost_price_level: 1.0,
      physicians_per_1k: 0.9,
      gpi_score: 0.8,
      winter_high: 0.8,
      annual_sunshine: 0.7,
      summer_high: 0.4,
    },
    surfaced: [
      "cost_price_level",
      "physicians_per_1k",
      "gpi_score",
      "winter_high",
      "annual_sunshine",
    ],
    dealBreakers: [{ key: "cost_price_level", op: "<=", value: 100 }],
  },
  {
    id: "recentExiter",
    label: "Recent exiter (FIRE)",
    weights: {
      top_income_tax_rate: 1.0,
      special_tax_regime: 0.9,
      cost_price_level: 0.8,
      gpi_score: 0.6,
      english_proficiency: 0.6,
      winter_high: 0.5,
      golden_visa: 0.4,
    },
    surfaced: [
      "top_income_tax_rate",
      "special_tax_regime",
      "cost_price_level",
      "gpi_score",
      "english_proficiency",
    ],
    dealBreakers: [],
  },
  {
    id: "nomadFamily",
    label: "Digital nomad family",
    weights: {
      air_quality_pm25: 1.0,
      dnv_income_floor: 0.9,
      english_proficiency: 0.9,
      gpi_score: 0.9,
      physicians_per_1k: 0.7,
      cost_price_level: 0.6,
      winter_high: 0.5,
      koppen: 0.3,
    },
    surfaced: [
      "dnv_income_floor",
      "air_quality_pm25",
      "english_proficiency",
      "gpi_score",
      "physicians_per_1k",
      "cost_price_level",
    ],
    // Inert in slice 1: no place has air_quality_pm25 data yet. Unknown values
    // are never failed; the deal-breaker activates once a value lands.
    dealBreakers: [{ key: "air_quality_pm25", op: "<=", value: 25 }],
  },
  {
    id: "noKidCouple",
    label: "No-kid couple",
    weights: {
      cost_price_level: 0.7,
      top_income_tax_rate: 0.7,
      english_proficiency: 0.7,
      cafe_density: 0.6,
      winter_high: 0.6,
      annual_sunshine: 0.6,
      gpi_score: 0.6,
      gym_density: 0.5,
    },
    surfaced: [
      "cost_price_level",
      "english_proficiency",
      "cafe_density",
      "winter_high",
      "annual_sunshine",
      "gpi_score",
    ],
    dealBreakers: [],
  },
  {
    id: "soloNomad",
    label: "Solo nomad",
    weights: {
      dnv_income_floor: 0.9,
      english_proficiency: 0.9,
      cost_price_level: 0.8,
      cafe_density: 0.8,
      gym_density: 0.6,
      gpi_score: 0.6,
      winter_high: 0.5,
    },
    surfaced: [
      "dnv_income_floor",
      "cost_price_level",
      "english_proficiency",
      "cafe_density",
      "gpi_score",
    ],
    dealBreakers: [],
  },
  {
    id: "employedRemote",
    label: "Employed remote professional",
    weights: {
      english_proficiency: 0.9,
      dnv_income_floor: 0.8,
      top_income_tax_rate: 0.8,
      cost_price_level: 0.7,
      gpi_score: 0.7,
      physicians_per_1k: 0.5,
      winter_high: 0.4,
    },
    surfaced: [
      "dnv_income_floor",
      "top_income_tax_rate",
      "english_proficiency",
      "cost_price_level",
      "gpi_score",
    ],
    dealBreakers: [],
  },
];

/**
 * Merge an optional overlay into a base profile. Returns a new Profile object.
 * Does not mutate base or overlay.
 *
 * - weights: additive merge (base[k] ?? 0) + (overlay[k] ?? 0)
 * - surfaced: base.surfaced unchanged
 * - dealBreakers: [...base.dealBreakers, ...overlay.dealBreakers]
 * - label: appends " + LGBTQ+" when an overlay is provided
 */
export function composeProfile(
  base: Profile,
  overlay?: { dealBreakers: Profile["dealBreakers"]; weights: Record<string, number> },
): Profile {
  if (overlay === undefined) {
    return {
      ...base,
      weights: { ...base.weights },
      surfaced: [...base.surfaced],
      dealBreakers: [...base.dealBreakers],
    };
  }

  const mergedWeights: Record<string, number> = { ...base.weights };
  for (const [key, value] of Object.entries(overlay.weights)) {
    mergedWeights[key] = (base.weights[key] ?? 0) + value;
  }

  return {
    id: base.id,
    label: `${base.label} + LGBTQ+`,
    weights: mergedWeights,
    surfaced: [...base.surfaced],
    dealBreakers: [...base.dealBreakers, ...overlay.dealBreakers],
  };
}
