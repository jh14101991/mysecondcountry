import { describe, expect, it } from "vitest";
import { placeById } from "../../index.js";
import { PlaceSchema } from "../../schema.js";
import cyRaw from "../cy.json" with { type: "json" };
import itRaw from "../it.json" with { type: "json" };
import mtRaw from "../mt.json" with { type: "json" };

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

describe("places index - Cyprus", () => {
  it("placeById('cy') resolves", () => {
    expect(placeById("cy")).toBeDefined();
  });

  it("cy.json parses through PlaceSchema", () => {
    const result = PlaceSchema.safeParse(cyRaw);
    expect(result.success).toBe(true);
  });
});

describe("places index - Malta", () => {
  it("placeById('mt') resolves", () => {
    expect(placeById("mt")).toBeDefined();
  });

  it("mt.json parses through PlaceSchema", () => {
    const result = PlaceSchema.safeParse(mtRaw);
    expect(result.success).toBe(true);
  });
});
