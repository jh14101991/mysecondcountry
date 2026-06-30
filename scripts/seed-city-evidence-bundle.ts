import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { placeById } from "@where/data";
import { buildCityMatrixRun, parseVariableRegistry } from "./plan-city-matrix.js";

type Granularity = "country" | "region" | "town";
type CoverageStatus =
  | "local"
  | "regional"
  | "national"
  | "inherited_national"
  | "inherited_regional"
  | "proxy"
  | "relational"
  | "unavailable"
  | "blocked"
  | "deferred";
type MatrixCategory =
  | "identity"
  | "money"
  | "tax_residency"
  | "climate"
  | "travel_connectivity"
  | "health_family_schooling"
  | "safety_rights"
  | "nature_environment"
  | "culture_services";
type SourceGapReason =
  | "no_public_source_found"
  | "source_exists_but_paywalled"
  | "source_terms_block_reuse"
  | "source_bot_blocked_manual_needed"
  | "local_source_too_sparse"
  | "official_source_only_national"
  | "requires_geospatial_build"
  | "requires_manual_maps_check"
  | "source_search_required"
  | "out_of_slice";

type MatrixRow = {
  key: string;
  label: string;
  matrixCategory: MatrixCategory;
  intendedGranularity: Granularity;
  observedGranularity?: Granularity;
  coverageStatus: CoverageStatus;
  cited?: { ref: string };
  unit?: string;
  sourceGapReason?: SourceGapReason;
  notes?: string;
};

type AdapterInput = {
  coordinates?: {
    lat: number;
    lon: number;
    sourceUrl: string;
    sourceName: string;
    verifiedDate: string;
  };
};

export type SeedCityEvidenceBundleInput = {
  id: string;
  city: string;
  country: string;
  region?: string | null;
  candidateId?: string;
  placeId?: string | null;
  parentId?: string | null;
  countryPlaceId?: string | null;
  publishTier?: "pilot" | "standard" | "flagship";
  lat?: number;
  lon?: number;
  coordinateSourceUrl?: string;
  coordinateSourceName?: string;
  verifiedDate?: string;
};

type SeededPlaceEvidenceBundle = {
  id: string;
  candidateId: string;
  placeId: string | null;
  placeName: string;
  granularity: "town";
  parentId: string | null;
  publishTier: "pilot" | "standard" | "flagship";
  status: "source_gap";
  summary: string;
  publicationRecommendation: "hold";
  adapterInput?: AdapterInput;
  rows: MatrixRow[];
};

export type SeedCityEvidenceBundleResult = {
  bundle: SeededPlaceEvidenceBundle;
  report: {
    schemaVersion: 1;
    generatedAt: string;
    bundleId: string;
    placeName: string;
    country: string;
    region: string | null;
    rowCount: number;
    inheritedRows: string[];
    completedGapRows: string[];
    sourceSearchRows: string[];
    gapReasonCounts: Record<string, number>;
    laneCounts: Record<string, number>;
    laneRunOrder: string[];
    nextBatches: Array<{
      compilerLane: string;
      rowCount: number;
      sourceFamilies: string[];
      batchScopes: string[];
    }>;
    pageFactoryBlocked: true;
    blockerSummary: string;
  };
  inheritedRows: string[];
  completedGapRows: string[];
  sourceSearchRows: string[];
};

const TEMPLATE_BUNDLE_PATH = "packages/data/src/place-bundles/gr-crete-chania.json";
const BUNDLE_DIR = "packages/data/src/place-bundles";
const RUN_DIR = "docs/data/city-matrix-runs";
const COUNTRY_FACT_REFS: Record<string, string> = {
  dnv_income_floor: "residency.digitalNomadVisa",
  golden_visa_status: "residency.goldenVisa",
  gpi_score: "safety.peaceIndexScore",
  physicians_per_1k: "healthcare.physiciansPer1000",
  price_level_index: "costOfLiving.priceLevelIndexEU27",
  special_inbound_regime: "tax.specialRegime",
  top_pit_rate: "tax.headlinePersonalIncomeTaxRate",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeReadTemplateRows(): Map<string, Partial<MatrixRow>> {
  try {
    const raw = JSON.parse(readFileSync(TEMPLATE_BUNDLE_PATH, "utf8")) as { rows?: MatrixRow[] };
    return new Map((raw.rows ?? []).map((row) => [row.key, row]));
  } catch {
    return new Map();
  }
}

function matrixCategoryFromSection(section: string): MatrixCategory {
  if (section.startsWith("1.")) return "money";
  if (section.startsWith("2.") || section.startsWith("3.")) return "tax_residency";
  if (section.startsWith("4.")) return "climate";
  if (section.startsWith("5.")) return "travel_connectivity";
  if (section.startsWith("6.")) return "nature_environment";
  if (section.startsWith("7.")) return "health_family_schooling";
  if (section.startsWith("8.")) return "safety_rights";
  return "culture_services";
}

function granularityFromRegistry(value: string): Granularity {
  const normalized = value.toLowerCase();
  if (normalized.includes("town") || normalized.includes("city") || normalized.includes("point")) {
    return "town";
  }
  if (normalized.includes("region") || normalized.includes("nuts")) return "region";
  return "country";
}

function gapReasonCounts(rows: MatrixRow[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    if (!row.sourceGapReason) return acc;
    acc[row.sourceGapReason] = (acc[row.sourceGapReason] ?? 0) + 1;
    return acc;
  }, {});
}

function hasPath(root: unknown, dottedPath: string): boolean {
  let current = root;
  for (const segment of dottedPath.split(".")) {
    if (!current || typeof current !== "object" || !(segment in current)) return false;
    current = (current as Record<string, unknown>)[segment];
  }
  return Boolean(current && typeof current === "object" && "value" in current);
}

function termsGapReason(sourceFamily: string, primarySource: string): SourceGapReason {
  const text = `${sourceFamily} ${primarySource}`.toLowerCase();
  if (text.includes("numbeo")) return "source_exists_but_paywalled";
  return "source_terms_block_reuse";
}

function buildCoordinateInput(input: SeedCityEvidenceBundleInput): AdapterInput | undefined {
  if (input.lat === undefined && input.lon === undefined) return undefined;
  if (input.lat === undefined || input.lon === undefined) {
    throw new Error("--lat and --lon must be supplied together");
  }
  if (!input.coordinateSourceUrl || !input.coordinateSourceName) {
    throw new Error(
      "--coordinate-source-url and --coordinate-source-name are required when seeding coordinates",
    );
  }
  return {
    coordinates: {
      lat: input.lat,
      lon: input.lon,
      sourceUrl: input.coordinateSourceUrl,
      sourceName: input.coordinateSourceName,
      verifiedDate: input.verifiedDate ?? todayStamp(),
    },
  };
}

function sourceSearchNotes(row: ReturnType<typeof buildCityMatrixRun>["rows"][number]): string {
  return [
    `Compiler lane ${row.compilerLane}; source family ${row.sourceFamily}; batch scope ${row.batchScope}.`,
    `Primary source: ${row.primarySource}.`,
    `Next action: ${row.nextAction}`,
    "This is a seeded blocker, not a zero, absence claim, or publishable fact.",
  ].join(" ");
}

function completedGapRow(
  row: ReturnType<typeof buildCityMatrixRun>["rows"][number],
  template: Partial<MatrixRow> | undefined,
  sourceGapReason: SourceGapReason,
  notes: string,
): MatrixRow {
  return {
    key: row.key,
    label: row.label,
    matrixCategory: template?.matrixCategory ?? matrixCategoryFromSection(row.section),
    intendedGranularity:
      template?.intendedGranularity ?? granularityFromRegistry(row.registryGranularity),
    coverageStatus: sourceGapReason === "out_of_slice" ? "deferred" : "blocked",
    sourceGapReason,
    ...(template?.unit ? { unit: template.unit } : {}),
    notes,
  };
}

export function buildSeedCityEvidenceBundle(
  input: SeedCityEvidenceBundleInput,
): SeedCityEvidenceBundleResult {
  const generatedAt = new Date().toISOString();
  const countryPlaceId = input.countryPlaceId ?? slugify(input.country);
  const countryPlace = countryPlaceId ? placeById(countryPlaceId) : undefined;
  const countryFactKeys = new Set<string>();
  if (countryPlace) {
    for (const [key, pathValue] of Object.entries(COUNTRY_FACT_REFS)) {
      if (hasPath(countryPlace, pathValue)) countryFactKeys.add(key);
    }
  }

  const templateRows = safeReadTemplateRows();
  const registryRows = parseVariableRegistry();
  const run = buildCityMatrixRun(registryRows, {
    city: input.city,
    region: input.region ?? null,
    country: input.country,
    id: input.id,
  });

  const rows: MatrixRow[] = run.rows.map((row) => {
    const template = templateRows.get(row.key);
    const base = {
      key: row.key,
      label: row.label,
      matrixCategory: template?.matrixCategory ?? matrixCategoryFromSection(row.section),
      intendedGranularity:
        template?.intendedGranularity ?? granularityFromRegistry(row.registryGranularity),
      ...(template?.unit ? { unit: template.unit } : {}),
    };

    const countryPath = COUNTRY_FACT_REFS[row.key];
    if (countryPath && countryPlace && countryFactKeys.has(row.key)) {
      return {
        ...base,
        observedGranularity: "country",
        coverageStatus: "inherited_national",
        cited: { ref: `place:${countryPlace.id}#${countryPath}` },
        notes: `Country-level ${input.country} CitedValue inherited for ${input.city}. This is not a local ${input.city} measurement and must render with inherited national labelling.`,
      };
    }

    if (row.compilerLane === "relational_runtime") {
      return completedGapRow(
        row,
        template,
        "out_of_slice",
        "Relational row. This depends on reader inputs such as home country, home hub, ancestry, or treaty pair, so it is not stored as a fixed place fact.",
      );
    }

    if (row.compilerLane === "licensed_or_manual") {
      const sourceGapReason = termsGapReason(row.sourceFamily, row.primarySource);
      return completedGapRow(
        row,
        template,
        sourceGapReason,
        `Known policy or licence gate for source family ${row.sourceFamily}. Use a licensed feed, written reuse permission, or a permitted manual source before turning this into a CitedValue.`,
      );
    }

    return {
      ...base,
      coverageStatus: "blocked",
      sourceGapReason: "source_search_required",
      notes: sourceSearchNotes(row),
    };
  });

  const adapterInput = buildCoordinateInput(input);
  const inheritedRows = rows.filter((row) => row.cited).map((row) => row.key);
  const completedGapRows = rows
    .filter((row) => row.sourceGapReason && row.sourceGapReason !== "source_search_required")
    .map((row) => row.key);
  const sourceSearchRows = rows
    .filter((row) => row.sourceGapReason === "source_search_required")
    .map((row) => row.key);

  const bundle: SeededPlaceEvidenceBundle = {
    id: input.id,
    candidateId: input.candidateId ?? input.id,
    placeId: input.placeId ?? null,
    placeName: input.city,
    granularity: "town",
    parentId: input.parentId ?? null,
    publishTier: input.publishTier ?? "standard",
    status: "source_gap",
    summary: `Seed evidence bundle for ${input.city}, ${input.country}. It instantiates all 254 canonical registry rows for the city matrix, inherits only existing country CitedValues from ${countryPlaceId}, closes known relational or source-policy rows as visible gaps, and leaves the rest as source_search_required blockers for source-family batches. It is not page-ready.`,
    publicationRecommendation: "hold",
    ...(adapterInput ? { adapterInput } : {}),
    rows,
  };

  const report = {
    schemaVersion: 1 as const,
    generatedAt,
    bundleId: bundle.id,
    placeName: bundle.placeName,
    country: input.country,
    region: input.region ?? null,
    rowCount: rows.length,
    inheritedRows,
    completedGapRows,
    sourceSearchRows,
    gapReasonCounts: gapReasonCounts(rows),
    laneCounts: run.summary.laneCounts,
    laneRunOrder: run.summary.laneRunOrder,
    nextBatches: run.laneBatches.map((batch) => ({
      compilerLane: batch.compilerLane,
      rowCount: batch.rowCount,
      sourceFamilies: batch.sourceFamilies,
      batchScopes: batch.batchScopes,
    })),
    pageFactoryBlocked: true as const,
    blockerSummary:
      "Seeded bundle is blocked from Page Factory until source_search_required rows are resolved to CitedValues, FactRefs, or completed source-gap reasons.",
  };

  return { bundle, report, inheritedRows, completedGapRows, sourceSearchRows };
}

function readArgValue(args: string[], name: string): string | null {
  const index = args.indexOf(name);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
  return value;
}

function parseArgs(
  argv: string[],
): SeedCityEvidenceBundleInput & { write: boolean; json: boolean } {
  const positional: string[] = [];
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (!token) continue;
    if (token.startsWith("--")) {
      index += token === "--write" || token === "--json" ? 0 : 1;
      continue;
    }
    positional.push(token);
  }
  const city = positional.join(" ").trim();
  if (!city) throw new Error("City name is required");

  const country = readArgValue(argv, "--country");
  if (!country) throw new Error("--country is required");

  const region = readArgValue(argv, "--region");
  const countryPlaceId = readArgValue(argv, "--country-place");
  const id =
    readArgValue(argv, "--id") ??
    [countryPlaceId ?? slugify(country), region, city]
      .filter(Boolean)
      .map((part) => slugify(String(part)))
      .join("-");
  const latRaw = readArgValue(argv, "--lat");
  const lonRaw = readArgValue(argv, "--lon");
  const publishTier = readArgValue(argv, "--publish-tier") ?? "standard";
  if (!["pilot", "standard", "flagship"].includes(publishTier)) {
    throw new Error("--publish-tier must be pilot, standard, or flagship");
  }

  return {
    id,
    city,
    country,
    region,
    candidateId: readArgValue(argv, "--candidate-id") ?? id,
    placeId: readArgValue(argv, "--place-id"),
    parentId: readArgValue(argv, "--parent-id"),
    countryPlaceId,
    publishTier: publishTier as "pilot" | "standard" | "flagship",
    ...(latRaw ? { lat: Number(latRaw) } : {}),
    ...(lonRaw ? { lon: Number(lonRaw) } : {}),
    coordinateSourceUrl: readArgValue(argv, "--coordinate-source-url") ?? undefined,
    coordinateSourceName: readArgValue(argv, "--coordinate-source-name") ?? undefined,
    write: argv.includes("--write"),
    json: argv.includes("--json"),
  };
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const { write, json, ...input } = args;
  const result = buildSeedCityEvidenceBundle(input);

  if (write) {
    mkdirSync(BUNDLE_DIR, { recursive: true });
    mkdirSync(RUN_DIR, { recursive: true });
    const bundlePath = path.join(BUNDLE_DIR, `${result.bundle.id}.json`);
    const reportPath = path.join(RUN_DIR, `${result.bundle.id}.seed-report.json`);
    writeFileSync(bundlePath, `${JSON.stringify(result.bundle, null, 2)}\n`);
    writeFileSync(reportPath, `${JSON.stringify(result.report, null, 2)}\n`);
    console.log(`Wrote ${result.bundle.rows.length} rows to ${bundlePath}`);
    console.log(`Wrote seed report to ${reportPath}`);
  }

  if (json || !write) {
    console.log(JSON.stringify(result.report, null, 2));
    return;
  }

  console.log(
    `Inherited=${result.inheritedRows.length}, completed gaps=${result.completedGapRows.length}, source_search_required=${result.sourceSearchRows.length}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
