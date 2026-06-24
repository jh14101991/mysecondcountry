import { describe, expect, it } from "vitest";
import { places } from "../index.js";
import { collectCitedValues } from "../schema.js";

const HIGH_LIABILITY = new Set(["visa", "tax", "residency"]);
const today = new Date().toISOString().slice(0, 10);

describe("CitedValue invariants across every published place", () => {
  for (const place of places) {
    const cited = collectCitedValues(place);

    it(`${place.id}: every CitedValue is well-formed`, () => {
      expect(cited.length).toBeGreaterThan(0);
      for (const { path, cited: c } of cited) {
        expect(c.sourceUrl, path).toMatch(/^https:\/\//);
        expect(c.sourceName.length, path).toBeGreaterThan(0);
        expect(c.verifiedDate, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(c.verifiedDate <= today, `${path} verifiedDate must not be in the future`).toBe(
          true,
        );
        expect(["high", "medium", "low"], path).toContain(c.confidence);
      }
    });

    it(`${place.id}: visa/tax/residency claims are high or medium (DOD b)`, () => {
      for (const { path, cited: c } of cited) {
        if (c.category && HIGH_LIABILITY.has(c.category)) {
          expect(["high", "medium"], path).toContain(c.confidence);
        }
      }
    });
  }
});
