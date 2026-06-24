import { describe, expect, it } from "vitest";
import { chania } from "../index.js";
import { collectCitedValues, PlaceSchema } from "../schema.js";

describe("Chania fixture (golden canary)", () => {
  it("parses through PlaceSchema with zero errors", () => {
    const result = PlaceSchema.safeParse(chania);
    expect(result.success).toBe(true);
  });

  it("populates the bootstrap-required fields (DOD a)", () => {
    expect(chania.granularity).toBe("town");
    expect(chania.country).toBe("Greece");
    expect(chania.costOfLiving.priceLevelIndexEU27.value).toBeTypeOf("number");
    expect(chania.climate.averageAnnualSunHours.value).toBeGreaterThan(0);
    expect(chania.residency?.digitalNomadVisa.value).toBeGreaterThan(0);
    expect(chania.tax?.headlinePersonalIncomeTaxRate.value).toBeGreaterThan(0);
    expect(chania.description.length).toBeGreaterThanOrEqual(80);
  });

  it("carries at least three CitedValues, each with all required fields", () => {
    const cited = collectCitedValues(chania);
    expect(cited.length).toBeGreaterThanOrEqual(3);
    for (const { path, cited: c } of cited) {
      expect(c.sourceUrl, path).toMatch(/^https:\/\//);
      expect(c.sourceName, path).not.toBe("");
      expect(c.verifiedDate, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["high", "medium", "low"], path).toContain(c.confidence);
      expect(["country", "region", "town"], path).toContain(c.granularity);
    }
  });
});
