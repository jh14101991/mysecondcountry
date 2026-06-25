import { places } from "@where/data";
import { describe, expect, it } from "vitest";
import { evaluateShortlist } from "../shortlist.js";

// Real places: it (2066), es (2763), gr (3500), cy (3500), mt (3500), pt (3680) for dnv_income_floor
// special_tax_regime == true for all six country places
// Note: Chania (gr-crete-chania) inherits the gr dnv_income_floor (3500) and also qualifies.

const countryPlaces = places.filter((p) => p.granularity === "country");

describe("evaluateShortlist", () => {
  it("dnv_income_floor <= 3700 ranked asc returns Italy, Spain, Greece, Cyprus, Malta, Portugal in that order (country places)", () => {
    const items = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
      countryPlaces,
    );

    // All six countries qualify
    expect(items.length).toBeGreaterThanOrEqual(6);

    // Italy (2066), Spain (2763), Greece (3500), Cyprus (3500), Malta (3500), Portugal (3680) ascending
    // Three-way tie at 3500 resolved by places-array order: gr, cy, mt
    const [first, second, third, fourth, fifth, sixth] = items;
    expect(first?.name).toBe("Italy");
    expect(second?.name).toBe("Spain");
    expect(third?.name).toBe("Greece");
    expect(fourth?.name).toBe("Cyprus");
    expect(fifth?.name).toBe("Malta");
    expect(sixth?.name).toBe("Portugal");

    // Ranks are sequential
    expect(first?.rank).toBe(1);
    expect(second?.rank).toBe(2);
    expect(third?.rank).toBe(3);
    expect(fourth?.rank).toBe(4);
    expect(fifth?.rank).toBe(5);
    expect(sixth?.rank).toBe(6);
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

  it("special_tax_regime == true returns 6 items when filtered to country places, ranked Cyprus, Malta, Italy, Greece, Spain, Portugal", () => {
    const items = evaluateShortlist(
      {
        filters: [{ key: "special_tax_regime", op: "==", value: true }],
        rank: { byKey: "top_income_tax_rate", dir: "asc" },
      },
      countryPlaces,
    );

    // gr, pt, es, it, cy, mt all have special_tax_regime
    expect(items).toHaveLength(6);

    // Ranked asc by top_income_tax_rate: cy (35), mt (35), it (43), gr (44), es (47), pt (48)
    // cy/mt tie at 35 resolved by places-array order
    const names = items.map((i) => i.name);
    expect(names[0]).toBe("Cyprus");
    expect(names[1]).toBe("Malta");
    expect(names[2]).toBe("Italy");
    expect(names[3]).toBe("Greece");
    expect(names[4]).toBe("Spain");
    expect(names[5]).toBe("Portugal");
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

  it("desc ranking puts the highest dnv_income_floor first and the lowest last", () => {
    const desc = evaluateShortlist(
      {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "desc" },
      },
      countryPlaces,
    );

    // Portugal (3680) must be first, Italy (2066) must be last.
    // Greece, Cyprus, Malta all tie at 3500 and occupy positions 2-4 (order within tie is stable).
    expect(desc[0]?.name).toBe("Portugal");
    expect(desc[desc.length - 1]?.name).toBe("Italy");

    // Ranks are assigned sequentially in desc order.
    expect(desc[0]?.rank).toBe(1);
    expect(desc[desc.length - 1]?.rank).toBe(desc.length);

    // Verify the 3500-tier trio all appear in the middle block.
    const names = desc.map((i) => i.name);
    expect(names).toContain("Greece");
    expect(names).toContain("Cyprus");
    expect(names).toContain("Malta");
  });
});
