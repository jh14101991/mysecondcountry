import { describe, expect, it } from "vitest";
import { ageInDays, isStale } from "../../schema.js";
import { collectToolCitedValues } from "../facts.js";
import { tools } from "../index.js";

describe("tool facts (freshness back-date proof)", () => {
  it("collectToolCitedValues returns at least one cited requirement per tool", () => {
    for (const tool of tools) {
      const fields = collectToolCitedValues(tool);
      expect(
        fields.length,
        `${tool.id}: collectToolCitedValues should return >= 1 field`,
      ).toBeGreaterThan(0);
    }
  });

  it("every cited requirement path follows the steps.<i>.requirement pattern", () => {
    for (const tool of tools) {
      for (const { path } of collectToolCitedValues(tool)) {
        expect(path, `${tool.id}: path must match steps.<i>.requirement`).toMatch(
          /^steps\.\d+\.requirement$/,
        );
      }
    }
  });

  it("isStale returns true for a back-dated tool requirement (proving freshness covers tools)", () => {
    const tool = tools[0];
    if (!tool) throw new Error("no tools");
    const fields = collectToolCitedValues(tool);
    const first = fields[0];
    if (!first) throw new Error("no cited fields on tool");

    // Build a copy that is 400 days old; limit is 90 for tax/residency.
    const backDated = {
      ...first.cited,
      verifiedDate: new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10),
    };
    expect(ageInDays(backDated.verifiedDate)).toBeGreaterThan(90);
    expect(isStale(backDated)).toBe(true);
  });
});
