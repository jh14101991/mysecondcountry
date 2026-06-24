import type { Place } from "@where/data";
import { describe, expect, it } from "vitest";
import { applyFilters } from "../index.js";

function cv(value: number | string) {
  return {
    value,
    sourceUrl: "https://example.org/s",
    sourceName: "t",
    verifiedDate: "2026-06-24",
    confidence: "high" as const,
    granularity: "country" as const,
  };
}

function place(id: string, cost: number, koppen = "Csa"): Place {
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
    costOfLiving: { priceLevelIndexEU27: cv(cost) },
    climate: {
      averageJanuaryHighC: cv(10),
      averageJulyHighC: cv(30),
      averageAnnualSunHours: cv(2500),
      koppenClass: cv(koppen),
    },
  } as unknown as Place;
}

const ps = [place("a", 80), place("b", 90), place("c", 100)];

describe("applyFilters", () => {
  it("max filter: excludes place above threshold", () => {
    const result = applyFilters(ps, [{ key: "cost_price_level", max: 92 }]);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("min filter: excludes place below threshold", () => {
    const result = applyFilters(ps, [{ key: "cost_price_level", min: 85 }]);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["b", "c"]);
  });

  it("unknown passes when requireData is not set", () => {
    const result = applyFilters(ps, [{ key: "air_quality_pm25", max: 25 }]);
    expect(result).toHaveLength(3);
  });

  it("unknown is excluded when requireData is true", () => {
    const result = applyFilters(ps, [{ key: "air_quality_pm25", max: 25, requireData: true }]);
    expect(result).toHaveLength(0);
  });

  it("equals on a string variable", () => {
    const all = applyFilters(ps, [{ key: "koppen", equals: "Csa" }]);
    expect(all).toHaveLength(3);

    const none = applyFilters([place("d", 80, "Dfb")], [{ key: "koppen", equals: "Csa" }]);
    expect(none).toHaveLength(0);
  });

  it("multiple filters are AND-combined", () => {
    const result = applyFilters(ps, [
      { key: "cost_price_level", max: 92 },
      { key: "koppen", equals: "Csa" },
    ]);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["a", "b"]);
  });
});
