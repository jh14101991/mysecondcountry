import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type RegistryRow = {
  section: string;
  registryKey: string;
  key: string;
  label: string;
  source: string;
  registryGranularity: string;
  autoMode: string;
  confidence: string;
};

type PlannedMatrixRow = RegistryRow & {
  coverageStatus: "blocked";
  sourceGapReason: "source_search_required";
  primarySource: string;
  fallbackSources: string[];
  nextAction: string;
};

type RequestedPlace = {
  city: string;
  region: string | null;
  country: string | null;
  id: string;
};

type SourceStrategy =
  | "api_or_open_data"
  | "geospatial_build"
  | "ai_crawl_official"
  | "licensed_or_terms_limited"
  | "relational_runtime"
  | "completed_gap_candidate";

type CompilerLane =
  | "inherited_national"
  | "inherited_regional"
  | "api_adapter"
  | "geospatial_adapter"
  | "ai_official_crawl"
  | "derived_formula"
  | "licensed_or_manual"
  | "relational_runtime"
  | "final_gap";

type BatchScope = "country" | "region" | "cluster" | "town" | "runtime" | "manual_batch";

type MatrixRunRow = PlannedMatrixRow & {
  place: RequestedPlace;
  sourceStrategy: SourceStrategy;
  compilerLane: CompilerLane;
  sourceFamily: string;
  batchScope: BatchScope;
  automationTier: "adapter" | "geospatial" | "ai_crawl" | "terms_gate" | "runtime" | "gap";
  outputRule: string;
  crawler: {
    enabled: boolean;
    termsGate: boolean;
    queries: string[];
    acceptanceCriteria: string[];
    failureGapReasons: string[];
    extractionSchema: string[];
  };
};

type CrawlTask = {
  key: string;
  label: string;
  matrixCategory: string;
  sourceStrategy: SourceStrategy;
  termsGate: boolean;
  place: RequestedPlace;
  primarySource: string;
  queries: string[];
  acceptanceCriteria: string[];
  failureGapReasons: string[];
  extractionSchema: string[];
};

type LaneBatch = {
  compilerLane: CompilerLane;
  rowCount: number;
  rowKeys: string[];
  sourceFamilies: string[];
  batchScopes: BatchScope[];
  executionRule: string;
};

type PublishGate = {
  requiresAllRowsAttempted: true;
  requiresAllRowsFilled: false;
  minimumTownDistinctValues: number;
  minimumLocalDailyLifeValues: number;
  blockers: string[];
};

type PlaceInventoryItem = {
  id: string;
  name: string;
  country: string;
  granularity: string;
  parentId: string | null;
};

type CityMatrixPayloadInput = {
  city: string;
  region?: string | null;
  country?: string | null;
  id?: string | null;
  run?: boolean;
};

const REGISTRY_PATH = "docs/data/variable-registry.md";
const PLACES_DIR = "packages/data/src/places";
const BUNDLES_DIR = "packages/data/src/place-bundles";
const DEFAULT_OUTPUT_DIR = "docs/data/city-matrix-runs";
const LANE_RUN_ORDER: CompilerLane[] = [
  "inherited_national",
  "inherited_regional",
  "api_adapter",
  "geospatial_adapter",
  "derived_formula",
  "ai_official_crawl",
  "licensed_or_manual",
  "relational_runtime",
  "final_gap",
];
const PUBLISH_GATE: PublishGate = {
  requiresAllRowsAttempted: true,
  requiresAllRowsFilled: false,
  minimumTownDistinctValues: 3,
  minimumLocalDailyLifeValues: 6,
  blockers: [
    "source_search_required",
    "stale_high_liability_cited_value",
    "low_confidence_high_liability_cited_value",
    "missing_local_distinctness",
    "unlabelled_proxy",
    "unlabelled_inherited_granularity",
  ],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function isDataRow(line: string): boolean {
  if (!line.startsWith("|")) return false;
  const firstCell = line.split("|")[1]?.trim();
  return Boolean(firstCell && firstCell !== "key" && !firstCell.startsWith("---"));
}

export function parseVariableRegistry(registryPath = REGISTRY_PATH): RegistryRow[] {
  const text = readFileSync(registryPath, "utf8");
  const rows: RegistryRow[] = [];
  let section = "unknown";
  let inKeepTable = false;

  for (const line of text.split("\n")) {
    const heading = line.match(/^## (\d+)\. (.+?)(?: {2}|\(|$)/);
    if (heading) {
      section = `${heading[1]}. ${heading[2]?.trim() ?? ""}`;
      inKeepTable = false;
      continue;
    }
    if (line.trim() === "### KEEP") {
      inKeepTable = true;
      continue;
    }
    if (line.startsWith("### DROP")) {
      inKeepTable = false;
      continue;
    }
    if (!inKeepTable || !isDataRow(line)) continue;

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 6) {
      throw new Error(`Invalid registry row: ${line}`);
    }
    const [registryKey, label, source, registryGranularity, autoMode, confidence] = cells as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];

    rows.push({
      section,
      registryKey,
      key: normalizeKey(registryKey),
      label,
      source,
      registryGranularity,
      autoMode,
      confidence,
    });
  }

  return rows;
}

function fallbackSourcesFor(row: RegistryRow): string[] {
  const haystack = `${row.section} ${row.source}`.toLowerCase();
  const fallbacks: string[] = [];

  if (haystack.includes("eurostat")) {
    fallbacks.push(
      "National statistical authority table with matching geography",
      "OECD or World Bank indicator only when the concept matches",
      "Completed source gap if no comparable geography exists",
    );
  }
  if (haystack.includes("world bank")) {
    fallbacks.push(
      "Eurostat or OECD equivalent for EU/OECD countries",
      "National statistical authority series",
      "Completed source gap if no comparable indicator exists",
    );
  }
  if (haystack.includes("oecd")) {
    fallbacks.push(
      "Eurostat equivalent where available",
      "National ministry or statistical authority publication",
      "Completed source gap if the source is country-only and no local row exists",
    );
  }
  if (
    haystack.includes("osm") ||
    haystack.includes("openstreetmap") ||
    haystack.includes("overpass")
  ) {
    fallbacks.push(
      "Official municipal or national registry where one exists",
      "Manual official website check for named facilities",
      "local_source_too_sparse if mapped coverage is too weak",
    );
  }
  if (
    haystack.includes("worldclim") ||
    haystack.includes("open-meteo") ||
    haystack.includes("era5") ||
    haystack.includes("copernicus") ||
    haystack.includes("noaa")
  ) {
    fallbacks.push(
      "National meteorological service normals",
      "ERA5 or Open-Meteo gridded point sample with visible proxy label",
      "requires_geospatial_build until sampled",
    );
  }
  if (
    haystack.includes("indomio") ||
    haystack.includes("spitogatos") ||
    haystack.includes("property") ||
    haystack.includes("numbeo")
  ) {
    fallbacks.push(
      "Official property price index at the closest available geography",
      "Manual listing-portal read with LOW confidence and exact query URL",
      "no_public_source_found if no lawful public listing source is usable",
    );
  }
  if (
    haystack.includes("pwc") ||
    haystack.includes("aade") ||
    haystack.includes("tax") ||
    haystack.includes("treasury")
  ) {
    fallbacks.push(
      "Official tax authority or gazette publication",
      "PwC Worldwide Tax Summaries as labelled secondary synthesis",
      "source_bot_blocked_manual_needed for official pages that block automation",
    );
  }
  if (
    haystack.includes("migration") ||
    haystack.includes("immigration") ||
    haystack.includes("visa") ||
    haystack.includes("globalcit")
  ) {
    fallbacks.push(
      "Official national immigration or citizenship authority",
      "EU Immigration Portal or EUR-Lex where applicable",
      "source_bot_blocked_manual_needed for official pages that require manual verification",
    );
  }
  if (
    haystack.includes("airport") ||
    haystack.includes("ferry") ||
    haystack.includes("gtfs") ||
    haystack.includes("mobility") ||
    haystack.includes("ourairports") ||
    haystack.includes("osrm")
  ) {
    fallbacks.push(
      "Official airport, port, operator, or transport-authority timetable",
      "GTFS feed from Mobility Database if official and current",
      "OSM/OSRM proxy only for physical access, not timetable service",
    );
  }
  if (
    haystack.includes("tourism") ||
    haystack.includes("short-stay") ||
    haystack.includes("hotel") ||
    haystack.includes("cruise")
  ) {
    fallbacks.push(
      "Eurostat tourism or platform-accommodation table",
      "National statistical authority or port-authority table",
      "inherited_regional label when only regional tourism data exists",
    );
  }
  if (
    haystack.includes("drought") ||
    haystack.includes("water") ||
    haystack.includes("power") ||
    haystack.includes("heat")
  ) {
    fallbacks.push(
      "European Drought Observatory, WRI Aqueduct, CEER, or national regulator",
      "Municipality or utility notice only when official and dated",
      "inherited_regional or source gap when the source is not town-level",
    );
  }
  if (
    haystack.includes("pet") ||
    haystack.includes("veterinary") ||
    haystack.includes("wheelchair") ||
    haystack.includes("accessible") ||
    haystack.includes("sidewalk")
  ) {
    fallbacks.push(
      "EU or national official rules for regulatory rows",
      "Municipal accessibility page or named facility page",
      "OSM proxy with LOW or MEDIUM confidence where official source is absent",
    );
  }

  if (fallbacks.length === 0) {
    fallbacks.push(
      "Closest official national or regional source with visible inherited label",
      "Named institutional index or dataset with matching methodology",
      "Completed source gap if no lawful comparable source exists",
    );
  }

  return [...new Set(fallbacks)];
}

function nextActionFor(row: RegistryRow): string {
  if (row.autoMode === "yes")
    return "Run the source client or scripted pull, then write CitedValue.";
  if (row.autoMode === "partial") {
    return "Run scripted/geospatial source discovery, then write CitedValue or completed gap.";
  }
  return "Manual-gate the primary source, archive/excerpt it, then write CitedValue or completed gap.";
}

export function buildCityMatrixPlan(rows: RegistryRow[]): PlannedMatrixRow[] {
  return rows.map((row) => ({
    ...row,
    coverageStatus: "blocked",
    sourceGapReason: "source_search_required",
    primarySource: row.source,
    fallbackSources: fallbackSourcesFor(row),
    nextAction: nextActionFor(row),
  }));
}

function classifySourceStrategy(row: RegistryRow): SourceStrategy {
  const haystack =
    `${row.key} ${row.registryKey} ${row.label} ${row.section} ${row.source}`.toLowerCase();

  if (
    row.registryGranularity === "pair" ||
    haystack.includes("home country") ||
    haystack.includes("home hub") ||
    haystack.includes("reader") ||
    haystack.includes("treaty with home") ||
    haystack.includes("totalization") ||
    haystack.includes("timezone overlap") ||
    haystack.includes("citizenship by descent")
  ) {
    return "relational_runtime";
  }

  if (
    haystack.includes("numbeo") ||
    haystack.includes("indomio") ||
    haystack.includes("spitogatos") ||
    haystack.includes("idealista") ||
    haystack.includes("property portal") ||
    haystack.includes("licensed portal") ||
    haystack.includes("written reuse") ||
    haystack.includes("source_terms_block_reuse") ||
    haystack.includes("happycow") ||
    haystack.includes("international schools database") ||
    haystack.includes("global property guide")
  ) {
    return "licensed_or_terms_limited";
  }

  if (
    haystack.includes("municipality") ||
    haystack.includes("municipal") ||
    haystack.includes("water-utility") ||
    haystack.includes("utility notices") ||
    haystack.includes("pharmacy duty") ||
    haystack.includes("port authority") ||
    haystack.includes("ferry-operator") ||
    haystack.includes("airport route") ||
    haystack.includes("airport route/timetable") ||
    haystack.includes("operator timetable") ||
    haystack.includes("school-fee") ||
    haystack.includes("clinic page") ||
    haystack.includes("official hospital registry") ||
    haystack.includes("blue flag") ||
    haystack.includes("accessibility pages") ||
    haystack.includes("gov.gr") ||
    haystack.includes("aade") ||
    haystack.includes("pwc") ||
    haystack.includes("migration") ||
    haystack.includes("immigration") ||
    haystack.includes("visa") ||
    haystack.includes("citizenship")
  ) {
    return "ai_crawl_official";
  }

  if (
    haystack.includes("osm") ||
    haystack.includes("openstreetmap") ||
    haystack.includes("overpass") ||
    haystack.includes("osrm") ||
    haystack.includes("worldclim") ||
    haystack.includes("open-meteo") ||
    haystack.includes("era5") ||
    haystack.includes("copernicus") ||
    haystack.includes("noaa") ||
    haystack.includes("ookla") ||
    haystack.includes("effis") ||
    haystack.includes("gwis") ||
    haystack.includes("jrc") ||
    haystack.includes("aqueduct") ||
    haystack.includes("drought") ||
    haystack.includes("srtm") ||
    haystack.includes("dem ") ||
    haystack.includes("drive time") ||
    haystack.includes("density") ||
    haystack.includes("distance") ||
    haystack.includes("proximity") ||
    haystack.includes("slope") ||
    haystack.includes("walkability") ||
    haystack.includes("car-dependency") ||
    haystack.includes("family amenity")
  ) {
    return "geospatial_build";
  }

  if (
    haystack.includes("eurostat") ||
    haystack.includes("world bank") ||
    haystack.includes("oecd") ||
    haystack.includes("ecb") ||
    haystack.includes("european commission") ||
    haystack.includes("ourairports") ||
    haystack.includes("openflights") ||
    haystack.includes("hief") ||
    haystack.includes("harvard dataverse") ||
    haystack.includes("ess") ||
    haystack.includes("european social survey") ||
    haystack.includes("who") ||
    haystack.includes("euda") ||
    haystack.includes("ilga") ||
    haystack.includes("equaldex") ||
    haystack.includes("rsf") ||
    haystack.includes("world governance") ||
    haystack.includes("wgi") ||
    haystack.includes("bank of greece") ||
    haystack.includes("data.gov.gr") ||
    row.autoMode === "yes"
  ) {
    return "api_or_open_data";
  }

  if (row.autoMode === "partial") return "geospatial_build";
  if (row.autoMode === "manual") return "ai_crawl_official";
  return "completed_gap_candidate";
}

function automationTierFor(strategy: SourceStrategy): MatrixRunRow["automationTier"] {
  if (strategy === "api_or_open_data") return "adapter";
  if (strategy === "geospatial_build") return "geospatial";
  if (strategy === "ai_crawl_official") return "ai_crawl";
  if (strategy === "licensed_or_terms_limited") return "terms_gate";
  if (strategy === "relational_runtime") return "runtime";
  return "gap";
}

function outputRuleFor(strategy: SourceStrategy): string {
  if (strategy === "relational_runtime") {
    return "Do not store as a fixed place fact. Compute from cited base CitedValue facts at runtime, or return a completed source-gap reason if the base facts are missing.";
  }
  if (strategy === "licensed_or_terms_limited") {
    return "Return a CitedValue only from licensed API/manual permitted reuse; otherwise return source_terms_block_reuse or source_bot_blocked_manual_needed as the completed source-gap reason.";
  }
  if (strategy === "completed_gap_candidate") {
    return "Attempt source discovery once. Return a CitedValue only if a lawful comparable source exists; otherwise return the precise completed source-gap reason.";
  }
  return "Return either a CitedValue/FactRef with sourceUrl, sourceName, verifiedDate, confidence, granularity, and excerpt, or a precise completed source-gap reason.";
}

function haystackFor(row: RegistryRow): string {
  return `${row.key} ${row.registryKey} ${row.label} ${row.section} ${row.source} ${row.registryGranularity}`.toLowerCase();
}

function isCountryRow(row: RegistryRow): boolean {
  return row.registryGranularity.trim().toLowerCase() === "country";
}

function isRegionalRow(row: RegistryRow): boolean {
  const granularity = row.registryGranularity.toLowerCase();
  return (
    granularity.includes("region") ||
    granularity.includes("regional") ||
    granularity.includes("nuts")
  );
}

function isDerivedRow(row: RegistryRow): boolean {
  const haystack = haystackFor(row);
  return (
    haystack.includes("derived") ||
    haystack.includes("computed") ||
    haystack.includes("proxy from") ||
    row.key === "car_dependency_proxy" ||
    row.key === "family_amenity_density"
  );
}

function compilerLaneFor(row: RegistryRow, strategy: SourceStrategy): CompilerLane {
  if (strategy === "relational_runtime") return "relational_runtime";
  if (isDerivedRow(row)) return "derived_formula";
  if (isCountryRow(row)) return "inherited_national";
  if (isRegionalRow(row)) return "inherited_regional";
  if (strategy === "licensed_or_terms_limited") return "licensed_or_manual";
  if (strategy === "geospatial_build") return "geospatial_adapter";
  if (strategy === "ai_crawl_official") return "ai_official_crawl";
  if (strategy === "api_or_open_data") return "api_adapter";
  return "final_gap";
}

function sourceFamilyFor(row: RegistryRow, strategy: SourceStrategy): string {
  const haystack = haystackFor(row);

  if (isDerivedRow(row)) return "derived_city_signal";
  if (haystack.includes("eurostat")) return "eurostat_country";
  if (haystack.includes("world bank") || haystack.includes("wdi")) return "world_bank_country";
  if (haystack.includes("oecd")) return "oecd_country";
  if (haystack.includes("ecb") || haystack.includes("bank of greece"))
    return "banking_property_index";
  if (
    haystack.includes("pwc") ||
    haystack.includes("aade") ||
    haystack.includes("tax") ||
    haystack.includes("treasury") ||
    haystack.includes("tedb")
  ) {
    return "tax_residency_manual";
  }
  if (
    haystack.includes("migration") ||
    haystack.includes("immigration") ||
    haystack.includes("visa") ||
    haystack.includes("globalcit") ||
    haystack.includes("passport") ||
    haystack.includes("citizenship")
  ) {
    return "visa_citizenship_manual";
  }
  if (
    haystack.includes("open-meteo") ||
    haystack.includes("air quality") ||
    haystack.includes("pm2.5") ||
    haystack.includes("snowfall")
  ) {
    return "open_meteo_environment";
  }
  if (
    haystack.includes("terrain") ||
    haystack.includes("elevation") ||
    haystack.includes("srtm") ||
    haystack.includes("dem") ||
    haystack.includes("slope")
  ) {
    return "terrain_elevation";
  }
  if (
    haystack.includes("hiking") ||
    haystack.includes("mtb") ||
    haystack.includes("climbing") ||
    haystack.includes("surf") ||
    haystack.includes("piste") ||
    haystack.includes("protected") ||
    haystack.includes("national park") ||
    haystack.includes("peak")
  ) {
    return "outdoor_osm";
  }
  if (
    haystack.includes("osm") ||
    haystack.includes("openstreetmap") ||
    haystack.includes("overpass")
  ) {
    return haystack.includes("drive") || haystack.includes("distance") || haystack.includes("osrm")
      ? "osm_osrm_route"
      : "osm_access";
  }
  if (
    haystack.includes("worldclim") ||
    haystack.includes("era5") ||
    haystack.includes("copernicus") ||
    haystack.includes("noaa") ||
    haystack.includes("cams") ||
    haystack.includes("temis")
  ) {
    return "climate_raster";
  }
  if (
    haystack.includes("indomio") ||
    haystack.includes("spitogatos") ||
    haystack.includes("numbeo") ||
    haystack.includes("property") ||
    haystack.includes("rent")
  ) {
    return "property_terms_limited";
  }
  if (
    haystack.includes("airport") ||
    haystack.includes("ferry") ||
    haystack.includes("bus") ||
    haystack.includes("transit") ||
    haystack.includes("gtfs") ||
    haystack.includes("ourairports") ||
    haystack.includes("openflights")
  ) {
    return "transport_connectivity";
  }
  if (
    haystack.includes("tourism") ||
    haystack.includes("overnight") ||
    haystack.includes("bedplace") ||
    haystack.includes("cruise")
  ) {
    return "tourism_statistics";
  }
  if (
    haystack.includes("water") ||
    haystack.includes("drought") ||
    haystack.includes("wildfire") ||
    haystack.includes("power")
  ) {
    return "water_energy_risk";
  }
  if (strategy === "licensed_or_terms_limited") return "terms_limited_source";
  if (strategy === "relational_runtime") return "relational_runtime";
  if (strategy === "completed_gap_candidate") return "source_gap_discovery";
  return normalizeKey(row.section);
}

function batchScopeFor(lane: CompilerLane, row: RegistryRow): BatchScope {
  if (lane === "inherited_national") return "country";
  if (lane === "inherited_regional") return "region";
  if (lane === "relational_runtime") return "runtime";
  if (lane === "licensed_or_manual" || lane === "ai_official_crawl" || lane === "final_gap") {
    return "manual_batch";
  }
  if (lane === "api_adapter") {
    if (isCountryRow(row)) return "country";
    if (isRegionalRow(row)) return "region";
    return "town";
  }
  return "cluster";
}

function laneCountsFor(rows: MatrixRunRow[]): Record<CompilerLane, number> {
  return rows.reduce<Record<CompilerLane, number>>(
    (acc, row) => {
      acc[row.compilerLane] += 1;
      return acc;
    },
    Object.fromEntries(LANE_RUN_ORDER.map((lane) => [lane, 0])) as Record<CompilerLane, number>,
  );
}

function laneExecutionRule(lane: CompilerLane): string {
  if (lane === "inherited_national")
    return "Pull once per country, then inherit with country granularity.";
  if (lane === "inherited_regional")
    return "Pull once per parent region, then inherit with regional granularity.";
  if (lane === "api_adapter") return "Run deterministic source clients before any AI crawl.";
  if (lane === "geospatial_adapter")
    return "Run OSM, route, raster, point, or polygon adapters across the whole target cluster.";
  if (lane === "derived_formula") return "Compute only from existing cited component rows.";
  if (lane === "ai_official_crawl") return "Crawl only approved official or institutional sources.";
  if (lane === "licensed_or_manual")
    return "Use licensed, terms-permitted, or manual-gated source paths only.";
  if (lane === "relational_runtime")
    return "Do not store as fixed place facts. Resolve from reader context at runtime.";
  return "Return a precise completed source-gap reason after source discovery.";
}

function buildLaneBatches(rows: MatrixRunRow[]): LaneBatch[] {
  return LANE_RUN_ORDER.map((compilerLane) => {
    const laneRows = rows.filter((row) => row.compilerLane === compilerLane);
    return {
      compilerLane,
      rowCount: laneRows.length,
      rowKeys: laneRows.map((row) => row.key),
      sourceFamilies: [...new Set(laneRows.map((row) => row.sourceFamily))].sort(),
      batchScopes: [...new Set(laneRows.map((row) => row.batchScope))].sort(),
      executionRule: laneExecutionRule(compilerLane),
    };
  });
}

function crawlQueriesFor(
  row: RegistryRow,
  place: RequestedPlace,
  strategy: SourceStrategy,
): string[] {
  const locality = [place.city, place.region, place.country].filter(Boolean).join(" ");
  const source = row.source.replace(/`/g, "");
  if (strategy === "licensed_or_terms_limited") {
    return [
      `${row.label} ${locality} ${source} terms reuse`,
      `${row.label} ${locality} official source alternative`,
    ];
  }
  if (strategy === "ai_crawl_official") {
    return [
      `${row.label} ${locality} official source`,
      `${place.city} ${row.label} municipality official`,
      `${row.source} ${locality}`,
    ];
  }
  return [];
}

function acceptanceCriteriaFor(strategy: SourceStrategy): string[] {
  if (strategy === "licensed_or_terms_limited") {
    return [
      "Source terms permit reuse or a licensed/manual reuse path is documented.",
      "The extracted fact is visible on the cited page and tied to the requested place or declared inherited geography.",
      "The output includes an excerpt, checked date, confidence, and granularity.",
    ];
  }
  if (strategy === "ai_crawl_official") {
    return [
      "Source is official, institutional, or the registry-approved primary source.",
      "The page/PDF/table names the requested place or a clearly inherited country or region.",
      "The extracted fact is visible in the source and can be quoted as a short excerpt.",
      "High-liability visa, tax, or residency rows are medium or high confidence only.",
    ];
  }
  return [];
}

function failureGapReasonsFor(strategy: SourceStrategy): string[] {
  if (strategy === "licensed_or_terms_limited") {
    return [
      "source_terms_block_reuse",
      "source_bot_blocked_manual_needed",
      "source_exists_but_paywalled",
      "no_public_source_found",
    ];
  }
  if (strategy === "ai_crawl_official") {
    return [
      "source_bot_blocked_manual_needed",
      "no_public_source_found",
      "official_source_only_national",
      "requires_manual_maps_check",
      "source_exists_but_paywalled",
    ];
  }
  return [];
}

function extractionSchemaFor(strategy: SourceStrategy): string[] {
  if (strategy !== "ai_crawl_official" && strategy !== "licensed_or_terms_limited") return [];
  return [
    "value",
    "sourceUrl",
    "sourceName",
    "verifiedDate",
    "confidence",
    "granularity",
    "excerpt",
    "sourceGapReason",
  ];
}

export function buildCityMatrixRun(rows: RegistryRow[], requestedPlace: RequestedPlace) {
  const plannedRows = buildCityMatrixPlan(rows);
  const runRows: MatrixRunRow[] = plannedRows.map((row) => {
    const sourceStrategy = classifySourceStrategy(row);
    const compilerLane = compilerLaneFor(row, sourceStrategy);
    const crawler = {
      enabled:
        sourceStrategy === "ai_crawl_official" || sourceStrategy === "licensed_or_terms_limited",
      termsGate: sourceStrategy === "licensed_or_terms_limited",
      queries: crawlQueriesFor(row, requestedPlace, sourceStrategy),
      acceptanceCriteria: acceptanceCriteriaFor(sourceStrategy),
      failureGapReasons: failureGapReasonsFor(sourceStrategy),
      extractionSchema: extractionSchemaFor(sourceStrategy),
    };
    return {
      ...row,
      place: requestedPlace,
      sourceStrategy,
      compilerLane,
      sourceFamily: sourceFamilyFor(row, sourceStrategy),
      batchScope: batchScopeFor(compilerLane, row),
      automationTier: automationTierFor(sourceStrategy),
      outputRule: outputRuleFor(sourceStrategy),
      crawler,
    };
  });
  const strategyCounts = runRows.reduce<Record<SourceStrategy, number>>(
    (acc, row) => {
      acc[row.sourceStrategy] += 1;
      return acc;
    },
    {
      api_or_open_data: 0,
      geospatial_build: 0,
      ai_crawl_official: 0,
      licensed_or_terms_limited: 0,
      relational_runtime: 0,
      completed_gap_candidate: 0,
    },
  );
  const laneCounts = laneCountsFor(runRows);

  return {
    schemaVersion: 3,
    generatedAt: new Date().toISOString(),
    requestedPlace,
    summary: {
      rowCount: runRows.length,
      strategyCounts,
      laneCounts,
      laneRunOrder: LANE_RUN_ORDER,
      publishGate: PUBLISH_GATE,
      crawlerTaskCount: runRows.filter((row) => row.crawler.enabled).length,
      invariant:
        "Every row must resolve to a CitedValue/FactRef or a completed source-gap reason. Unknown is not zero.",
    },
    laneBatches: buildLaneBatches(runRows),
    rows: runRows,
    crawlTasks: buildCrawlTasks(runRows),
  };
}

export function buildCrawlTasks(rows: MatrixRunRow[]): CrawlTask[] {
  return rows
    .filter((row) => row.crawler.enabled)
    .map((row) => ({
      key: row.key,
      label: row.label,
      matrixCategory: row.section,
      sourceStrategy: row.sourceStrategy,
      termsGate: row.crawler.termsGate,
      place: row.place,
      primarySource: row.primarySource,
      queries: row.crawler.queries,
      acceptanceCriteria: row.crawler.acceptanceCriteria,
      failureGapReasons: row.crawler.failureGapReasons,
      extractionSchema: row.crawler.extractionSchema,
    }));
}

export function buildCityMatrixPayload(input: CityMatrixPayloadInput) {
  const rows = parseVariableRegistry();
  const country = input.country ?? null;
  const region = input.region ?? null;
  const slugParts = [input.city, region, country]
    .filter(Boolean)
    .map((part) => slugify(String(part)));
  const requestedPlace: RequestedPlace = {
    city: input.city,
    region,
    country,
    id: input.id ?? slugParts.join("-"),
  };
  const inventory = currentInventory();
  const base = {
    generatedAt: new Date().toISOString(),
    requestedPlace,
    currentInventory: inventory.counts,
    existingMatches: {
      places: inventory.places.filter(
        (place) =>
          place.name.toLowerCase() === input.city.toLowerCase() &&
          (!country || place.country.toLowerCase() === country.toLowerCase()),
      ),
      bundles: inventory.bundles.filter(
        (bundle) => bundle.placeName?.toLowerCase() === input.city.toLowerCase(),
      ),
    },
  };

  if (input.run) {
    const run = buildCityMatrixRun(rows, requestedPlace);
    return {
      kind: "matrix-run" as const,
      ...base,
      schemaVersion: run.schemaVersion,
      rowCount: run.summary.rowCount,
      summary: run.summary,
      laneBatches: run.laneBatches,
      rows: run.rows,
      crawlTasks: run.crawlTasks,
    };
  }

  const plannedRows = buildCityMatrixPlan(rows);
  return {
    kind: "matrix-plan" as const,
    ...base,
    schemaVersion: 1,
    rowCount: plannedRows.length,
    modeCounts: plannedRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.autoMode] = (acc[row.autoMode] ?? 0) + 1;
      return acc;
    }, {}),
    rows: plannedRows,
  };
}

function loadJsonFiles(dir: string): unknown[] {
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => JSON.parse(readFileSync(path.join(dir, file), "utf8")));
  } catch {
    return [];
  }
}

export function currentInventory(cwd = process.cwd()) {
  const places = loadJsonFiles(path.join(cwd, PLACES_DIR)) as PlaceInventoryItem[];
  const bundles = loadJsonFiles(path.join(cwd, BUNDLES_DIR)) as {
    id?: string;
    placeName?: string;
  }[];
  const byGranularity = places.reduce<Record<string, number>>((acc, place) => {
    acc[place.granularity] = (acc[place.granularity] ?? 0) + 1;
    return acc;
  }, {});

  return {
    places: places.map((place) => ({
      id: place.id,
      name: place.name,
      country: place.country,
      granularity: place.granularity,
      parentId: place.parentId,
    })),
    counts: {
      countries: byGranularity.country ?? 0,
      regions: byGranularity.region ?? 0,
      towns: byGranularity.town ?? 0,
      bundles: bundles.length,
    },
    bundles: bundles.map((bundle) => ({
      id: bundle.id,
      placeName: bundle.placeName,
    })),
  };
}

function parseArgs(argv: string[]) {
  const options: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token) continue;
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const key = token.slice(2);
    if (key === "write" || key === "json" || key === "run") {
      options[key] = true;
      continue;
    }
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    i += 1;
  }
  return { city: positional.join(" ").trim(), options };
}

function printUsage() {
  console.error(
    [
      'Usage: pnpm data:city-matrix "City" --country "Country" [--region "Region"] [--run] [--write] [--json]',
      "",
      'Example: pnpm data:city-matrix "Chania" --country Greece --region Crete --write',
      'Example: pnpm data:city-matrix "Chania" --country Greece --region Crete --id gr-crete-chania --run --write',
    ].join("\n"),
  );
}

function runCli() {
  const { city, options } = parseArgs(process.argv.slice(2));
  if (!city) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const country = typeof options.country === "string" ? options.country : null;
  const region = typeof options.region === "string" ? options.region : null;
  const payload = buildCityMatrixPayload({
    city,
    country,
    region,
    id: typeof options.id === "string" ? options.id : null,
    run: options.run === true,
  });

  if (options.write) {
    const outputDir = typeof options.out === "string" ? options.out : DEFAULT_OUTPUT_DIR;
    mkdirSync(outputDir, { recursive: true });
    const suffix = payload.kind === "matrix-run" ? "matrix-run" : "matrix-plan";
    const outputPath = path.join(outputDir, `${payload.requestedPlace.id}.${suffix}.json`);
    writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Wrote ${payload.rowCount} rows to ${outputPath}`);
    if (payload.kind === "matrix-run") {
      console.log(
        `Strategies: ${Object.entries(payload.summary.strategyCounts)
          .map(([strategy, count]) => `${strategy}=${count}`)
          .join(", ")}`,
      );
      console.log(`AI crawl tasks: ${payload.crawlTasks.length}`);
    } else {
      console.log(
        `Modes: ${Object.entries(payload.modeCounts)
          .map(([mode, count]) => `${mode}=${count}`)
          .join(", ")}`,
      );
    }
    return;
  }

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`${city}${region ? `, ${region}` : ""}${country ? `, ${country}` : ""}`);
  console.log(`Rows: ${payload.rowCount}`);
  if (payload.kind === "matrix-run") {
    console.log(
      `Strategies: ${Object.entries(payload.summary.strategyCounts)
        .map(([strategy, count]) => `${strategy}=${count}`)
        .join(", ")}`,
    );
    console.log(`AI crawl tasks: ${payload.crawlTasks.length}`);
  } else {
    console.log(
      `Modes: ${Object.entries(payload.modeCounts)
        .map(([mode, count]) => `${mode}=${count}`)
        .join(", ")}`,
    );
  }
  console.log(
    `Current dataset: countries=${payload.currentInventory.countries}, regions=${payload.currentInventory.regions}, towns=${payload.currentInventory.towns}, bundles=${payload.currentInventory.bundles}`,
  );
  if (payload.existingMatches.places.length || payload.existingMatches.bundles.length) {
    console.log(
      `Existing matches: places=${payload.existingMatches.places.length}, bundles=${payload.existingMatches.bundles.length}`,
    );
  }
  console.log(
    payload.kind === "matrix-run"
      ? "Use --write to create a JSON automation run with source strategies and AI crawl tasks."
      : "Use --run --write to create the full automation run with source strategies and AI crawl tasks.",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
