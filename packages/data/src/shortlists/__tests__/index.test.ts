import { places } from "@where/data";
import { evaluateShortlist } from "@where/engine";
import { describe, expect, it } from "vitest";
import { shortlistById, shortlistBySlug, shortlists } from "../index.js";

// Use country-level places only for predictable eval (Chania inherits DNV from Greece)
const countryPlaces = places.filter((p) => p.granularity === "country");

describe("shortlists index", () => {
  it("exports at least 2 entries", () => {
    expect(shortlists.length).toBeGreaterThanOrEqual(2);
  });

  it("shortlistBySlug resolves the DNV entry", () => {
    expect(shortlistBySlug("eu-residency-under-3700-a-month")).toBeDefined();
  });

  it("shortlistById resolves the expat tax entry", () => {
    expect(shortlistById("eu-expat-tax-regimes-by-rate")).toBeDefined();
  });

  it("each shortlist evaluates to >= 2 ranked items when run over country places", () => {
    for (const sl of shortlists) {
      const items = evaluateShortlist(sl.constraint, countryPlaces);
      expect(
        items.length,
        `${sl.id}: expected >= 2 items, got ${items.length}`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("each evaluated item has cited fields with sourceUrl", () => {
    for (const sl of shortlists) {
      const items = evaluateShortlist(sl.constraint, countryPlaces);
      for (const item of items) {
        expect(item.citedFields.length, `${sl.id} ${item.name}: no citedFields`).toBeGreaterThan(0);
        for (const field of item.citedFields) {
          expect(
            field.cited.sourceUrl,
            `${sl.id} ${item.name} ${field.key}: sourceUrl missing`,
          ).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("each shortlist's total cited fields across all items >= 4 (anti-thin)", () => {
    for (const sl of shortlists) {
      const items = evaluateShortlist(sl.constraint, countryPlaces);
      const totalFields = items.reduce((sum, item) => sum + item.citedFields.length, 0);
      expect(
        totalFields,
        `${sl.id}: only ${totalFields} total cited fields across items (need >= 4)`,
      ).toBeGreaterThanOrEqual(4);
    }
  });
});
