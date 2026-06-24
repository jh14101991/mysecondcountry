import { chania } from "@where/data";
import { describe, expect, it } from "vitest";
import { type ScreeningCriteria, screenPlace } from "../index.js";

// Fixed reference date so staleness checks are deterministic. Equals the fixture's
// verifiedDate, so nothing is stale at this instant.
const NOW = new Date("2026-06-24T12:00:00Z");

const CRITERIA: ScreeningCriteria = {
  maxPriceLevelIndexEU27: 90, // 86.5 <= 90  -> match (high, factor 1.0, weight 0.25)
  minJanuaryHighC: 12, //         14.0 >= 12  -> match (low, 0.4, weight 0.20)
  maxJulyHighC: 32, //            30.5 <= 32  -> match (low, 0.4, weight 0.10)
  minAnnualSunHours: 2500, //   2813.7 >= 2500-> match (low, 0.4, weight 0.10)
  provableMonthlyIncomeEUR: 4000, // 4000 >= 3500 floor -> match (medium, 0.6, weight 0.15)
  maxIncomeTaxRate: 40, //         44 <= 40    -> NO match (medium, 0.6, weight 0.20)
};

describe("screenPlace (Chania)", () => {
  it("scores within the expected range under default weights", () => {
    const result = screenPlace(chania, CRITERIA, { now: NOW });
    // weightedMatch = 0.25 + 0.08 + 0.04 + 0.04 + 0.09 = 0.50
    // weightedTotal = weightedMatch + incomeTax(0.20*0.6=0.12) = 0.62
    // score = 0.50 / 0.62 * 100 = 80.65
    expect(result.score).toBeCloseTo(80.65, 2);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.matchedCount).toBe(5);
    expect(result.applicableCount).toBe(6);
  });

  it("is deterministic: same input, same output", () => {
    const a = screenPlace(chania, CRITERIA, { now: NOW });
    const b = screenPlace(chania, CRITERIA, { now: NOW });
    expect(a).toEqual(b);
  });

  it("raises a fence warning for every low-confidence claim", () => {
    const { fenceWarnings } = screenPlace(chania, CRITERIA, { now: NOW });
    const lowConf = fenceWarnings.filter((w) => w.reason === "low-confidence");
    // The three HNMS-via-Wikipedia climate normals are low confidence.
    expect(lowConf).toHaveLength(3);
    expect(fenceWarnings.filter((w) => w.reason === "stale")).toHaveLength(0);
  });

  it("raises a stale fence warning when a visa/tax claim ages past its window", () => {
    const staleVisaPlace = structuredClone(chania);
    // digital nomad visa has a 60-day window; backdate well beyond it.
    if (staleVisaPlace.residency) {
      staleVisaPlace.residency.digitalNomadVisa.verifiedDate = "2026-01-01";
    }
    const { fenceWarnings } = screenPlace(staleVisaPlace, CRITERIA, { now: NOW });
    const visaStale = fenceWarnings.find(
      (w) => w.path.includes("digitalNomadVisa") && w.reason === "stale",
    );
    expect(visaStale).toBeDefined();
    expect(visaStale?.category).toBe("visa");
  });

  it("never emits a per-person verdict (FENCE.md)", () => {
    const { breakdown } = screenPlace(chania, CRITERIA, { now: NOW });
    for (const dim of breakdown) {
      expect(dim.detail.toLowerCase()).not.toMatch(
        /you qualify|you should|best for you|you do not qualify/,
      );
    }
  });
});
