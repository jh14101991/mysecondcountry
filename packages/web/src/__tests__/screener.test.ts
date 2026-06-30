import { describe, expect, it } from "vitest";
import { parseCriteria, rankPlaces } from "../lib/screener.ts";

describe("parseCriteria", () => {
  it("keeps provided numeric fields, strips commas, drops blanks and unknown keys", () => {
    const c = parseCriteria({
      provableMonthlyIncomeEUR: "3,500",
      maxPriceLevelIndexEU27: "100",
      minAnnualSunHours: "",
      scenario: "lower-taxes",
    });
    expect(c).toEqual({ provableMonthlyIncomeEUR: 3500, maxPriceLevelIndexEU27: 100 });
  });

  it("returns an empty object when nothing usable is provided", () => {
    expect(parseCriteria({ minAnnualSunHours: "", scenario: "exploring" })).toEqual({});
  });
});

describe("rankPlaces", () => {
  it("returns scored places sorted high to low, only where a criterion applied", () => {
    const ranked = rankPlaces({ maxIncomeTaxRate: 45 }, { now: new Date("2026-06-30") });
    expect(ranked.length).toBeGreaterThan(0);
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
    for (const r of ranked) {
      expect(r.applicableCount).toBeGreaterThan(0);
      expect(r.routePath.startsWith("/places/")).toBe(true);
    }
  });

  it("returns nothing applicable when no criteria are given", () => {
    expect(rankPlaces({}, { now: new Date("2026-06-30") })).toEqual([]);
  });
});
