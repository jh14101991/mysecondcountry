import { places } from "@where/data";
import { describe, expect, it } from "vitest";
import { evaluateShortlist } from "../shortlist.js";

// Real places: gr (3500), pt (3680), es (2763) for dnv_income_floor
// special_tax_regime == true for all three
// Note: Chania (gr-crete-chania) inherits the gr dnv_income_floor (3500) and also qualifies.

const countryPlaces = places.filter((p) => p.granularity === "country");

describe("evaluateShortlist", () => {
  it("dnv_income_floor <= 3700 ranked asc returns Spain, Greece, Portugal in that order (country places)", () => {
    const items = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
      countryPlaces,
    );

    // All three countries qualify
    expect(items.length).toBeGreaterThanOrEqual(3);

    // First three are Spain (2763), Greece (3500), Portugal (3680) in ascending order
    const [first, second, third] = items;
    expect(first?.name).toBe("Spain");
    expect(second?.name).toBe("Greece");
    expect(third?.name).toBe("Portugal");

    // Ranks are sequential
    expect(first?.rank).toBe(1);
    expect(second?.rank).toBe(2);
    expect(third?.rank).toBe(3);
  });

  it("each item's citedFields includes dnv_income_floor CitedValue with a sourceUrl", () => {
    const items = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
      countryPlaces,
    );

    for (const item of items) {
      const field = item.citedFields.find((f) => f.key === "dnv_income_floor");
      expect(field, `${item.name} should have dnv_income_floor field`).toBeDefined();
      expect(field?.cited.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("special_tax_regime == true returns 3 items when filtered to country places", () => {
    const items = evaluateShortlist(
      {
        filters: [{ key: "special_tax_regime", op: "==", value: true }],
        rank: { byKey: "top_income_tax_rate", dir: "asc" },
      },
      countryPlaces,
    );

    // gr, pt, es all have special_tax_regime
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.name)).toContain("Greece");
    expect(items.map((i) => i.name)).toContain("Portugal");
    expect(items.map((i) => i.name)).toContain("Spain");
  });

  it("returns empty array when no places match", () => {
    const items = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 100 }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
      countryPlaces,
    );

    expect(items).toHaveLength(0);
  });

  it("rank field is the first entry in citedFields (rank key appears before filter keys)", () => {
    const items = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
      countryPlaces,
    );

    expect(items.length).toBeGreaterThan(0);
    // rank.byKey === filter key, so deduped: citedFields[0] should be dnv_income_floor
    const firstItem = items[0];
    expect(firstItem?.citedFields[0]?.key).toBe("dnv_income_floor");
  });

  it("desc ranking reverses order", () => {
    const asc = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
      countryPlaces,
    );
    const desc = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "desc" },
      },
      countryPlaces,
    );

    const ascNames = asc.map((i) => i.name);
    const descNames = desc.map((i) => i.name);
    expect(descNames).toEqual([...ascNames].reverse());
  });
});
