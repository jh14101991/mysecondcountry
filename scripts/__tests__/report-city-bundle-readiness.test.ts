import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildBundleReadinessReport,
  buildCreteBundleReadinessReport,
  evaluateBundleReadiness,
  formatBundleReadinessText,
} from "../report-city-bundle-readiness.js";

const CRETE_IDS = [
  "gr-crete-region",
  "gr-crete-chania",
  "gr-crete-heraklion",
  "gr-crete-rethymno",
  "gr-crete-agios-nikolaos",
];

describe("city bundle readiness reporter", () => {
  it("reports Crete bundle row counts, visible gaps, and Page Factory status", () => {
    const report = buildCreteBundleReadinessReport(new Date("2026-06-29T00:00:00Z"));

    expect(report.generatedDate).toBe("2026-06-29");
    expect(report.publishGate.requiresAllRowsAttempted).toBe(true);
    expect(report.publishGate.requiresAllRowsFilled).toBe(false);
    expect(report.bundles.map((bundle) => bundle.id).sort()).toEqual([...CRETE_IDS].sort());

    for (const bundle of report.bundles) {
      expect(bundle.rowCount, bundle.id).toBe(254);
      expect(bundle.citedRows, bundle.id).toBeGreaterThanOrEqual(194);
      expect(bundle.completedGapRows, bundle.id).toBeGreaterThan(0);
      expect(bundle.sourceSearchRows, bundle.id).toBe(0);
      expect(bundle.highLiabilityFreshnessBlockers, bundle.id).toEqual([]);
      expect(bundle.pageFactoryStatus, bundle.id).toBe("data_bundle_ready");
      expect(bundle.readyForPageFactory, bundle.id).toBe(true);
      expect(bundle.sourceGapRows.length, bundle.id).toBeGreaterThan(0);
      expect(bundle.openSourceGapRows, bundle.id).toEqual([]);
      expect(
        bundle.sourceGapRows.map((row) => row.sourceGapReason),
        bundle.id,
      ).toContain("source_bot_blocked_manual_needed");
      expect(bundle.blockers, bundle.id).not.toContain("bundle_status_source_gap");
      expect(bundle.blockers, bundle.id).not.toContain("open_source_gap_rows");
    }

    const chania = report.bundles.find((bundle) => bundle.id === "gr-crete-chania");
    expect(chania?.localDistinctValues).toBeGreaterThanOrEqual(3);
    expect(chania?.localDailyLifeValues).toBeGreaterThanOrEqual(6);
    expect(chania?.sourceGapRows.map((row) => row.key).sort()).toEqual(
      expect.arrayContaining([
        "airport_winter_direct_destinations",
        "airport_winter_route_ratio",
        "ferry_routes_summer",
        "ferry_routes_winter",
      ]),
    );
  });

  it("keeps completed manual or bot-blocked source gaps visible without blocking readiness", () => {
    const report = buildCreteBundleReadinessReport(new Date("2026-06-29T00:00:00Z"));
    const chania = report.bundles.find((bundle) => bundle.id === "gr-crete-chania");

    expect(chania?.sourceGapRows.map((row) => row.key).sort()).toEqual(
      expect.arrayContaining([
        "airport_winter_direct_destinations",
        "airport_winter_route_ratio",
        "ferry_routes_summer",
        "ferry_routes_winter",
      ]),
    );
    expect(chania?.openSourceGapRows).toEqual([]);
    expect(chania?.pageFactoryStatus).toBe("data_bundle_ready");
    expect(chania?.readyForPageFactory).toBe(true);
  });

  it("never marks a bundle ready when source-search rows remain", () => {
    const report = buildCreteBundleReadinessReport(new Date("2026-06-29T00:00:00Z"));
    const chania = report.rawBundles.find((bundle) => bundle.id === "gr-crete-chania");
    if (!chania) throw new Error("missing Chania bundle");

    const checked = evaluateBundleReadiness(
      {
        ...chania,
        status: "data_bundle_ready",
        publicationRecommendation: "publish",
        rows: chania.rows.map((row, index) =>
          index === 0
            ? {
                ...row,
                cited: undefined,
                coverageStatus: "blocked",
                sourceGapReason: "source_search_required",
              }
            : row,
        ),
      },
      report.rawBundles,
      new Date("2026-06-29T00:00:00Z"),
    );

    expect(checked.sourceSearchRows).toBe(1);
    expect(checked.pageFactoryStatus).toBe("blocked_source_search");
    expect(checked.readyForPageFactory).toBe(false);
    expect(checked.blockers).toContain("source_search_required");
  });

  it("never marks a bundle ready while non-accepted source-gap rows remain", () => {
    const report = buildCreteBundleReadinessReport(new Date("2026-06-29T00:00:00Z"));
    const chania = report.rawBundles.find((bundle) => bundle.id === "gr-crete-chania");
    if (!chania) throw new Error("missing Chania bundle");

    const checked = evaluateBundleReadiness(
      {
        ...chania,
        status: "data_bundle_ready",
        publicationRecommendation: "publish",
        rows: chania.rows.map((row, index) =>
          index === 0
            ? {
                ...row,
                cited: undefined,
                coverageStatus: "blocked",
                sourceGapReason: "requires_geospatial_build",
              }
            : row,
        ),
      },
      report.rawBundles,
      new Date("2026-06-29T00:00:00Z"),
    );

    expect(checked.openSourceGapRows.map((row) => row.key)).toEqual([chania.rows[0]?.key]);
    expect(checked.blockers).toContain("open_source_gap_rows");
    expect(checked.pageFactoryStatus).toBe("source_gap_review");
    expect(checked.readyForPageFactory).toBe(false);
  });

  it("formats a plain-text board and exposes the package script", () => {
    const report = buildCreteBundleReadinessReport(new Date("2026-06-29T00:00:00Z"));
    const text = formatBundleReadinessText(report);
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(text).toContain("Crete bundle readiness");
    expect(text).toContain("requires all rows filled: false");
    expect(text).toContain("gr-crete-chania");
    expect(text).toContain("visible source-gap rows: transit_pass");
    expect(packageJson.scripts["data:bundle-readiness"]).toBe(
      "tsx scripts/report-city-bundle-readiness.ts",
    );
  });

  it("can report explicit draft bundle ids without registering them globally", () => {
    const report = buildBundleReadinessReport(
      ["pt-lisbon", "pt-lisbon-ericeira"],
      new Date("2026-06-30T00:00:00Z"),
    );

    expect(report.bundles.map((bundle) => bundle.id)).toEqual(["pt-lisbon", "pt-lisbon-ericeira"]);

    for (const bundle of report.bundles) {
      expect(bundle.rowCount).toBe(254);
      expect(bundle.citedRows).toBe(20);
      expect(bundle.sourceSearchRows).toBe(217);
      expect(bundle.pageFactoryStatus).toBe("blocked_source_search");
      expect(bundle.readyForPageFactory).toBe(false);
      expect(bundle.blockers).toContain("source_search_required");
    }
  });
});
