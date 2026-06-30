import { describe, expect, it } from "vitest";
import {
  buildCityMatrixPayload,
  buildCityMatrixPlan,
  buildCityMatrixRun,
  buildCrawlTasks,
  currentInventory,
  parseVariableRegistry,
} from "../plan-city-matrix.js";

describe("city matrix plan", () => {
  it("parses the full canonical registry row set", () => {
    const rows = parseVariableRegistry();
    expect(rows).toHaveLength(254);
    expect(new Set(rows.map((row) => row.key)).size).toBe(254);
  });

  it("normalizes registry keys for bundle-safe row ids", () => {
    const rows = parseVariableRegistry();
    expect(rows.some((row) => row.registryKey === "dog_park / vet")).toBe(true);
    expect(rows.some((row) => row.key === "dog_park_vet")).toBe(true);
    for (const row of rows) {
      expect(row.key).toMatch(/^[a-z0-9_]+$/);
    }
  });

  it("attaches fallback sources to every planned row", () => {
    const plan = buildCityMatrixPlan(parseVariableRegistry());
    expect(plan).toHaveLength(254);
    for (const row of plan) {
      expect(row.coverageStatus).toBe("blocked");
      expect(row.sourceGapReason).toBe("source_search_required");
      expect(row.primarySource.length).toBeGreaterThan(0);
      expect(row.fallbackSources.length, row.key).toBeGreaterThan(0);
    }
  });

  it("classifies every row into a repeatable automation strategy", () => {
    const run = buildCityMatrixRun(parseVariableRegistry(), {
      city: "Chania",
      region: "Crete",
      country: "Greece",
      id: "chania-crete-greece",
    });

    expect(run.rows).toHaveLength(254);
    expect(run.summary.rowCount).toBe(254);
    expect(run.summary.strategyCounts.api_or_open_data).toBeGreaterThan(50);
    expect(run.summary.strategyCounts.geospatial_build).toBeGreaterThan(20);
    expect(run.summary.strategyCounts.ai_crawl_official).toBeGreaterThan(10);
    expect(run.summary.strategyCounts.licensed_or_terms_limited).toBeGreaterThan(5);

    for (const row of run.rows) {
      expect(row.sourceStrategy, row.key).toMatch(
        /^(api_or_open_data|geospatial_build|ai_crawl_official|licensed_or_terms_limited|relational_runtime|completed_gap_candidate)$/,
      );
      expect(row.outputRule, row.key).toContain("CitedValue");
      expect(row.outputRule, row.key).toContain("source-gap");
    }
  });

  it("assigns compiler lanes, source families, and batch scopes to every row", () => {
    const run = buildCityMatrixRun(parseVariableRegistry(), {
      city: "Chania",
      region: "Crete",
      country: "Greece",
      id: "chania-crete-greece",
    });

    expect(run.summary.laneCounts.inherited_national).toBeGreaterThan(20);
    expect(run.summary.laneCounts.geospatial_adapter).toBeGreaterThan(20);
    expect(run.summary.laneCounts.ai_official_crawl).toBeGreaterThan(5);
    expect(run.summary.laneCounts.licensed_or_manual).toBeGreaterThan(5);
    expect(run.summary.laneCounts.derived_formula).toBeGreaterThan(0);

    for (const row of run.rows) {
      expect(row.compilerLane, row.key).toMatch(
        /^(inherited_national|inherited_regional|api_adapter|geospatial_adapter|ai_official_crawl|derived_formula|licensed_or_manual|relational_runtime|final_gap)$/,
      );
      expect(row.sourceFamily, row.key).toMatch(/^[a-z0-9_]+$/);
      expect(row.batchScope, row.key).toMatch(
        /^(country|region|cluster|town|runtime|manual_batch)$/,
      );
    }

    const price = run.rows.find((row) => row.key === "price_level_index");
    expect(price?.compilerLane).toBe("inherited_national");
    expect(price?.sourceFamily).toBe("eurostat_country");
    expect(price?.batchScope).toBe("country");

    const pm25 = run.rows.find((row) => row.key === "pm25_monthly");
    expect(pm25?.compilerLane).toBe("geospatial_adapter");
    expect(pm25?.batchScope).toBe("cluster");

    const treaty = run.rows.find((row) => row.key === "tax_treaty");
    expect(treaty?.compilerLane).toBe("relational_runtime");
    expect(treaty?.batchScope).toBe("runtime");

    const family = run.rows.find((row) => row.key === "family_amenity_density");
    expect(family?.compilerLane).toBe("derived_formula");
    expect(family?.sourceFamily).toBe("derived_city_signal");
  });

  it("groups the city pull by compiler lane and separates publish readiness from full completion", () => {
    const run = buildCityMatrixRun(parseVariableRegistry(), {
      city: "Chania",
      region: "Crete",
      country: "Greece",
      id: "chania-crete-greece",
    });

    expect(run.summary.laneRunOrder).toEqual([
      "inherited_national",
      "inherited_regional",
      "api_adapter",
      "geospatial_adapter",
      "derived_formula",
      "ai_official_crawl",
      "licensed_or_manual",
      "relational_runtime",
      "final_gap",
    ]);
    expect(run.laneBatches.map((batch) => batch.compilerLane)).toEqual(run.summary.laneRunOrder);
    expect(run.summary.publishGate.requiresAllRowsAttempted).toBe(true);
    expect(run.summary.publishGate.requiresAllRowsFilled).toBe(false);
    expect(run.summary.publishGate.minimumTownDistinctValues).toBe(3);
    expect(run.summary.publishGate.minimumLocalDailyLifeValues).toBe(6);
    expect(run.summary.publishGate.blockers).toContain("source_search_required");
  });

  it("creates AI crawl tasks with strict extraction and failure rules", () => {
    const run = buildCityMatrixRun(parseVariableRegistry(), {
      city: "Heraklion",
      region: "Crete",
      country: "Greece",
      id: "heraklion-crete-greece",
    });
    const crawlTasks = buildCrawlTasks(run.rows);

    expect(crawlTasks.length).toBeGreaterThan(10);
    expect(crawlTasks.every((task) => task.place.city === "Heraklion")).toBe(true);

    const municipal = crawlTasks.find((task) => task.key === "municipal_digital_services");
    expect(municipal?.queries.join(" ")).toContain("Heraklion");
    expect(municipal?.acceptanceCriteria.join(" ")).toContain("official");
    expect(municipal?.extractionSchema).toContain("sourceUrl");
    expect(municipal?.failureGapReasons).toContain("source_bot_blocked_manual_needed");

    const property = crawlTasks.find((task) => task.key === "sale_inventory_count");
    expect(property?.termsGate).toBe(true);
    expect(property?.failureGapReasons).toContain("source_terms_block_reuse");
  });

  it("builds a matrix-run payload for the slash skill command path", () => {
    const payload = buildCityMatrixPayload({
      city: "Rethymno",
      country: "Greece",
      region: "Crete",
      id: "gr-crete-rethymno",
      run: true,
    });

    expect(payload.kind).toBe("matrix-run");
    if (payload.kind !== "matrix-run") {
      throw new Error("expected matrix-run payload");
    }
    expect(payload.requestedPlace.id).toBe("gr-crete-rethymno");
    expect(payload.rowCount).toBe(254);
    expect(payload.rows).toHaveLength(254);
    expect(payload.crawlTasks.length).toBeGreaterThan(10);
    expect(payload.summary.invariant).toContain("Unknown is not zero");
    expect(payload.summary.publishGate.requiresAllRowsFilled).toBe(false);
    expect(payload.laneBatches).toHaveLength(9);
    expect(payload.laneBatches[0]?.compilerLane).toBe("inherited_national");
  });

  it("reports the current place inventory", () => {
    const inventory = currentInventory();
    expect(inventory.counts.countries).toBeGreaterThanOrEqual(6);
    expect(inventory.counts.regions).toBeGreaterThanOrEqual(1);
    expect(inventory.counts.towns).toBeGreaterThanOrEqual(1);
    expect(inventory.counts.bundles).toBeGreaterThanOrEqual(5);
  });
});
