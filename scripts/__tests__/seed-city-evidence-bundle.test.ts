import { PlaceEvidenceBundleInputSchema } from "@where/data";
import { describe, expect, it } from "vitest";
import { extractRepresentativeCoordinate } from "../run-city-matrix-adapters.js";
import { buildSeedCityEvidenceBundle } from "../seed-city-evidence-bundle.js";

const lisbonInput = {
  id: "pt-lisbon",
  city: "Lisbon",
  country: "Portugal",
  countryPlaceId: "pt",
  region: "Lisbon",
  lat: 38.7077507,
  lon: -9.1365919,
  coordinateSourceUrl: "https://www.openstreetmap.org/relation/5400890",
  coordinateSourceName: "OpenStreetMap relation 5400890, Lisboa administrative boundary",
} as const;

describe("seed city evidence bundle", () => {
  it("creates a valid 254-row bundle without pretending it is page-ready", () => {
    const result = buildSeedCityEvidenceBundle(lisbonInput);

    expect(result.bundle.rows).toHaveLength(254);
    expect(result.bundle.status).toBe("source_gap");
    expect(result.bundle.publicationRecommendation).toBe("hold");
    expect(result.report.pageFactoryBlocked).toBe(true);
    expect(result.report.sourceSearchRows.length).toBeGreaterThan(200);

    const schemaResult = PlaceEvidenceBundleInputSchema.safeParse(result.bundle);
    expect(schemaResult.success).toBe(true);
  });

  it("inherits only existing country CitedValues as national context", () => {
    const result = buildSeedCityEvidenceBundle(lisbonInput);

    expect(result.inheritedRows.sort()).toEqual([
      "dnv_income_floor",
      "golden_visa_status",
      "gpi_score",
      "physicians_per_1k",
      "price_level_index",
      "special_inbound_regime",
      "top_pit_rate",
    ]);

    const price = result.bundle.rows.find((row) => row.key === "price_level_index");
    expect(price?.coverageStatus).toBe("inherited_national");
    expect(price?.observedGranularity).toBe("country");
    expect(price?.cited).toEqual({ ref: "place:pt#costOfLiving.priceLevelIndexEU27" });

    const monthlyHigh = result.bundle.rows.find((row) => row.key === "temp_monthly_high");
    expect(monthlyHigh?.coverageStatus).toBe("blocked");
    expect(monthlyHigh?.sourceGapReason).toBe("source_search_required");
    expect(monthlyHigh?.cited).toBeUndefined();
  });

  it("turns known runtime and source-policy rows into completed gaps", () => {
    const result = buildSeedCityEvidenceBundle(lisbonInput);

    expect(result.completedGapRows).toContain("tax_treaty");
    expect(result.completedGapRows).toContain("rent_1bed_city");
    expect(result.completedGapRows).toContain("sale_inventory_count");

    const treaty = result.bundle.rows.find((row) => row.key === "tax_treaty");
    expect(treaty?.coverageStatus).toBe("deferred");
    expect(treaty?.sourceGapReason).toBe("out_of_slice");

    const rent = result.bundle.rows.find((row) => row.key === "rent_1bed_city");
    expect(rent?.coverageStatus).toBe("blocked");
    expect(rent?.sourceGapReason).toBe("source_exists_but_paywalled");

    const saleInventory = result.bundle.rows.find((row) => row.key === "sale_inventory_count");
    expect(saleInventory?.coverageStatus).toBe("blocked");
    expect(saleInventory?.sourceGapReason).toBe("source_terms_block_reuse");
  });

  it("stores internal adapter coordinates without adding a public matrix row", () => {
    const result = buildSeedCityEvidenceBundle(lisbonInput);

    expect(extractRepresentativeCoordinate(result.bundle)).toEqual({
      lat: 38.7077507,
      lon: -9.1365919,
    });
    expect(result.bundle.adapterInput?.coordinates?.sourceUrl).toBe(
      "https://www.openstreetmap.org/relation/5400890",
    );
    expect(result.bundle.rows.some((row) => row.key === "coordinates")).toBe(false);
  });
});
