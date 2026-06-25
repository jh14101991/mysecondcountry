import { describe, expect, it } from "vitest";
import { placeById } from "../../index.js";
import { PlaceSchema } from "../../schema.js";
import itRaw from "../it.json" with { type: "json" };

describe("places index - Italy", () => {
  it("placeById('it') resolves", () => {
    expect(placeById("it")).toBeDefined();
  });

  it("it.json parses through PlaceSchema", () => {
    const result = PlaceSchema.safeParse(itRaw);
    expect(result.success).toBe(true);
  });

  it("Italy has the expected core fields", () => {
    const place = placeById("it");
    expect(place).toBeDefined();
    if (!place) return;
    expect(place.name).toBe("Italy");
    expect(place.granularity).toBe("country");
    expect(place.residency?.digitalNomadVisa.value).toBe(2066);
    expect(place.tax?.headlinePersonalIncomeTaxRate.value).toBe(43);
  });
});
