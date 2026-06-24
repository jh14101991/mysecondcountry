import type { Place, Profile } from "@where/data";
import { describe, expect, it } from "vitest";
import { scoreByProfile } from "../index.js";

function cv(value: number | string, confidence: "high" | "medium" | "low" = "high") {
  return {
    value,
    sourceUrl: "https://example.org/s",
    sourceName: "t",
    verifiedDate: "2026-06-24",
    confidence,
    granularity: "country" as const,
  };
}

/** Minimal Place with only the required typed fields; extra variables injected via `variables`. */
function place(id: string, variables?: Record<string, ReturnType<typeof cv>>): Place {
  return {
    id,
    slug: id,
    granularity: "country",
    parentId: null,
    name: id,
    country: id,
    ancestry: [],
    description: "x".repeat(80),
    status: "active",
    costOfLiving: { priceLevelIndexEU27: cv(80) },
    climate: {
      averageJanuaryHighC: cv(10),
      averageJulyHighC: cv(30),
      averageAnnualSunHours: cv(2500),
      koppenClass: cv("Csa"),
    },
    variables,
  } as unknown as Place;
}

/**
 * Minimal profile surfaced on air_quality_pm25, english_proficiency,
 * cafe_density, gym_density with equal unit weights.
 */
function testProfile(overrides?: Partial<Profile>): Profile {
  return {
    id: "nomadFamily",
    label: "Test profile",
    weights: {
      air_quality_pm25: 1,
      english_proficiency: 1,
      cafe_density: 1,
      gym_density: 1,
    },
    surfaced: ["air_quality_pm25", "english_proficiency", "cafe_density", "gym_density"],
    dealBreakers: [],
    ...overrides,
  } as Profile;
}

// Place with only air and english known; cafe/gym absent.
const placePartial = place("p1", {
  air_quality_pm25: cv(10),
  english_proficiency: cv(60),
});

describe("scoreByProfile", () => {
  it("1 - renormalises unknown keys out; missing keys never drag score to zero", () => {
    const result = scoreByProfile(placePartial, testProfile(), {
      air_quality_pm25: { max: 25 },
      english_proficiency: { min: 50 },
    });

    expect(result.usedKeys).toEqual(["air_quality_pm25", "english_proficiency"]);
    expect(result.missingKeys).toEqual(["cafe_density", "gym_density"]);
    // Both present criteria satisfied; missing keys must not penalise the score.
    expect(result.score).toBe(100);
  });

  it("2 - a failing criterion gives a partial, non-zero score (==50)", () => {
    const result = scoreByProfile(placePartial, testProfile(), {
      air_quality_pm25: { max: 25 },
      english_proficiency: { min: 80 }, // 60 < 80 -> fails
    });

    // air satisfies (goodness 1), english fails (goodness 0).
    // equal weights (1) and high confidence (1.0 each):
    // score = round2(100 * 1 / 2) = 50
    expect(result.score).toBe(50);
  });

  it("3 - confidence weighting shifts the score (~71.43)", () => {
    const placeConfMixed = place("p2", {
      air_quality_pm25: cv(10, "high"), // satisfies max:25 -> goodness 1; cf 1.0
      english_proficiency: cv(60, "low"), // fails min:80 -> goodness 0; cf 0.4
    });

    const result = scoreByProfile(placeConfMixed, testProfile(), {
      air_quality_pm25: { max: 25 },
      english_proficiency: { min: 80 },
    });

    // numerator   = 1*1.0*1 = 1.0
    // denominator = 1*1.0 + 1*0.4 = 1.4
    // score = round2(100 * 1.0 / 1.4) = round2(71.4285...) = 71.43
    expect(result.score).toBeCloseTo(71.43, 2);
  });

  it("4 - deal-breaker breach sets dealBreakerFailed to true", () => {
    const profile = testProfile({
      dealBreakers: [{ key: "air_quality_pm25", op: "<=", value: 5 }],
    });
    // air = 10 > 5 -> violated
    const result = scoreByProfile(placePartial, profile);

    expect(result.dealBreakerFailed).toBe(true);
  });

  it("5 - unknown deal-breaker key does not fail", () => {
    const profile = testProfile({
      dealBreakers: [{ key: "cafe_density", op: "<=", value: 5 }],
    });
    // cafe_density absent on placePartial -> must not trigger failure
    const result = scoreByProfile(placePartial, profile);

    expect(result.dealBreakerFailed).toBe(false);
  });

  it("6 - determinism: same arguments, deep-equal output", () => {
    const criteria = {
      air_quality_pm25: { max: 25 },
      english_proficiency: { min: 50 },
    };
    const a = scoreByProfile(placePartial, testProfile(), criteria);
    const b = scoreByProfile(placePartial, testProfile(), criteria);

    expect(a).toEqual(b);
  });
});
