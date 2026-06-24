import { describe, expect, it } from "vitest";
import { placeById } from "../../index.js";
import { collectCitedValues } from "../../schema.js";
import { placeVariables } from "../from-place.js";

/** Look up a fixture place, throwing if the dataset is missing it (matches the index.ts idiom). */
function requirePlace(id: string) {
  const place = placeById(id);
  if (!place) throw new Error(`place ${id} not in dataset`);
  return place;
}

describe("placeVariables", () => {
  const greece = requirePlace("gr");

  it("maps core typed fields to catalogue keys for Greece", () => {
    const vars = placeVariables(greece);

    for (const key of [
      "cost_price_level",
      "top_income_tax_rate",
      "dnv_income_floor",
      "gpi_score",
    ]) {
      expect(vars).toHaveProperty(key);
      const cv = vars[key];
      if (!cv) throw new Error(`Missing key: ${key}`);
      expect(cv.sourceUrl).toMatch(/^https:\/\//);
      expect(cv.sourceName).toBeTruthy();
      expect(cv.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["high", "medium", "low"]).toContain(cv.confidence);
    }
  });

  it("omits keys with no backing data (absent means unknown, not null)", () => {
    const vars = placeVariables(greece);
    expect("air_quality_pm25" in vars).toBe(false);
    expect("cafe_density" in vars).toBe(false);
  });

  it("omits healthcare/safety keys for Chania (no healthcare/safety blocks)", () => {
    const chania = requirePlace("gr-crete-chania");
    const vars = placeVariables(chania);
    expect(vars).toHaveProperty("cost_price_level");
    expect(vars).toHaveProperty("dnv_income_floor");
    expect("physicians_per_1k" in vars).toBe(false);
    expect("gpi_score" in vars).toBe(false);
  });

  it("collectCitedValues covers the variables map after change B", () => {
    const thatPlace = {
      ...greece,
      variables: {
        test_var: {
          value: 1,
          sourceUrl: "https://example.org/x",
          sourceName: "Test",
          verifiedDate: "2026-06-24",
          confidence: "low" as const,
          granularity: "country" as const,
        },
      },
    };
    expect(
      collectCitedValues(thatPlace as typeof greece).some((c) => c.path === "variables.test_var"),
    ).toBe(true);
  });
});
