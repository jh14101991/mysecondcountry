import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  isFactRef,
  isStale,
  type MatrixRow,
  type PlaceEvidenceBundle,
  type PlaceEvidenceBundleInput,
  PlaceEvidenceBundleInputSchema,
  placeEvidenceBundles,
  resolveCitedOrRef,
} from "@where/data";

type PageFactoryStatus =
  | "blocked_source_search"
  | "blocked_high_liability"
  | "blocked_local_distinctness"
  | "data_bundle_ready"
  | "source_gap_review";

type HighLiabilityFreshnessBlocker = {
  key: string;
  reason: "low_confidence" | "stale";
  verifiedDate: string;
  confidence: string;
};

type OpenSourceGapRow = {
  key: string;
  label: string;
  sourceGapReason: NonNullable<MatrixRow["sourceGapReason"]>;
  coverageStatus: MatrixRow["coverageStatus"];
  intendedGranularity: MatrixRow["intendedGranularity"];
  observedGranularity?: MatrixRow["observedGranularity"];
};

type BundleReadiness = {
  id: string;
  placeName: string;
  granularity: PlaceEvidenceBundle["granularity"];
  bundleStatus: PlaceEvidenceBundle["status"];
  publicationRecommendation: PlaceEvidenceBundle["publicationRecommendation"];
  rowCount: number;
  citedRows: number;
  completedGapRows: number;
  sourceSearchRows: number;
  highLiabilityFreshnessBlockers: HighLiabilityFreshnessBlocker[];
  localDistinctValues: number;
  localDailyLifeValues: number;
  gapReasons: Record<string, number>;
  sourceGapRows: OpenSourceGapRow[];
  openSourceGapRows: OpenSourceGapRow[];
  blockers: string[];
  pageFactoryStatus: PageFactoryStatus;
  readyForPageFactory: boolean;
};

type PublishGate = {
  requiresAllRowsAttempted: true;
  requiresAllRowsFilled: false;
  minimumTownDistinctValues: number;
  minimumLocalDailyLifeValues: number;
  blockers: string[];
};

type BundleReadinessReport = {
  generatedDate: string;
  publishGate: PublishGate;
  bundles: BundleReadiness[];
  rawBundles: PlaceEvidenceBundle[];
};

const CRETE_BUNDLE_IDS = [
  "gr-crete-region",
  "gr-crete-chania",
  "gr-crete-heraklion",
  "gr-crete-rethymno",
  "gr-crete-agios-nikolaos",
] as const;
const HIGH_LIABILITY_CATEGORIES = new Set(["tax", "visa", "residency"]);
const ACCEPTED_SOURCE_GAP_REASONS = new Set([
  "no_public_source_found",
  "source_exists_but_paywalled",
  "source_terms_block_reuse",
  "source_bot_blocked_manual_needed",
  "out_of_slice",
]);
const LOCAL_DAILY_LIFE_CATEGORIES = new Set([
  "money",
  "climate",
  "travel_connectivity",
  "health_family_schooling",
  "nature_environment",
  "culture_services",
]);
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
    "open_source_gap_rows",
    "bundle_status_source_gap",
  ],
};

function readArgValue(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  return argv[index + 1];
}

function resolveBundleInput(input: PlaceEvidenceBundleInput): PlaceEvidenceBundle {
  return {
    ...input,
    rows: input.rows.map((row) => {
      const { cited, ...rowWithoutCited } = row;
      const resolved: MatrixRow = { ...rowWithoutCited };
      if (cited) {
        resolved.cited = isFactRef(cited) ? resolveCitedOrRef(cited) : cited;
      }
      return resolved;
    }),
  };
}

function loadBundleById(id: string): PlaceEvidenceBundle {
  const bundlePath = resolve("packages/data/src/place-bundles", `${id}.json`);
  const raw = JSON.parse(readFileSync(bundlePath, "utf8")) as unknown;
  return resolveBundleInput(PlaceEvidenceBundleInputSchema.parse(raw));
}

function bundleIdsFromArgs(argv: string[]): string[] | undefined {
  const bundle = readArgValue(argv, "--bundle");
  if (bundle) return [bundle];
  const bundles = readArgValue(argv, "--bundles");
  if (!bundles) return undefined;
  return bundles
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function dayStamp(today: Date): string {
  return today.toISOString().slice(0, 10);
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function citedValueText(row: MatrixRow): string {
  return JSON.stringify(row.cited?.value ?? null);
}

function matchingRegionBundle(
  bundle: PlaceEvidenceBundle,
  bundles: PlaceEvidenceBundle[],
): PlaceEvidenceBundle | undefined {
  if (bundle.granularity !== "town") return undefined;
  return (
    bundles.find((candidate) => candidate.id === "gr-crete-region") ??
    bundles.find((candidate) => candidate.granularity === "region")
  );
}

function countLocalDistinctValues(
  bundle: PlaceEvidenceBundle,
  bundles: PlaceEvidenceBundle[],
): number {
  const region = matchingRegionBundle(bundle, bundles);
  if (!region) return 0;
  const regionRows = new Map(region.rows.map((row) => [row.key, row]));
  return bundle.rows.filter((row) => {
    if (!row.cited || row.observedGranularity !== "town") return false;
    const regionRow = regionRows.get(row.key);
    if (!regionRow?.cited) return false;
    return citedValueText(row) !== citedValueText(regionRow);
  }).length;
}

function countLocalDailyLifeValues(bundle: PlaceEvidenceBundle): number {
  if (bundle.granularity !== "town") return 0;
  return bundle.rows.filter(
    (row) =>
      row.cited &&
      row.observedGranularity === "town" &&
      LOCAL_DAILY_LIFE_CATEGORIES.has(row.matrixCategory),
  ).length;
}

function highLiabilityBlockers(
  bundle: PlaceEvidenceBundle,
  today: Date,
): HighLiabilityFreshnessBlocker[] {
  const blockers: HighLiabilityFreshnessBlocker[] = [];
  for (const row of bundle.rows) {
    const cited = row.cited;
    if (!cited?.category || !HIGH_LIABILITY_CATEGORIES.has(cited.category)) continue;
    if (cited.confidence === "low") {
      blockers.push({
        key: row.key,
        reason: "low_confidence",
        verifiedDate: cited.verifiedDate,
        confidence: cited.confidence,
      });
      continue;
    }
    if (isStale(cited, today)) {
      blockers.push({
        key: row.key,
        reason: "stale",
        verifiedDate: cited.verifiedDate,
        confidence: cited.confidence,
      });
    }
  }
  return blockers;
}

function sourceGapRows(bundle: PlaceEvidenceBundle): OpenSourceGapRow[] {
  return bundle.rows.flatMap((row) => {
    if (!row.sourceGapReason) return [];
    return [
      {
        key: row.key,
        label: row.label,
        sourceGapReason: row.sourceGapReason,
        coverageStatus: row.coverageStatus,
        intendedGranularity: row.intendedGranularity,
        ...(row.observedGranularity ? { observedGranularity: row.observedGranularity } : {}),
      },
    ];
  });
}

function openSourceGapRows(rows: OpenSourceGapRow[]): OpenSourceGapRow[] {
  return rows.filter((row) => !ACCEPTED_SOURCE_GAP_REASONS.has(row.sourceGapReason));
}

function statusFromBlockers(
  bundle: PlaceEvidenceBundle,
  sourceSearchRows: number,
  openSourceGapRowCount: number,
  highLiabilityFreshnessBlockers: HighLiabilityFreshnessBlocker[],
  localDistinctValues: number,
  localDailyLifeValues: number,
): PageFactoryStatus {
  if (sourceSearchRows > 0) return "blocked_source_search";
  if (openSourceGapRowCount > 0) return "source_gap_review";
  if (highLiabilityFreshnessBlockers.length > 0) return "blocked_high_liability";
  if (
    bundle.granularity === "town" &&
    (localDistinctValues < PUBLISH_GATE.minimumTownDistinctValues ||
      localDailyLifeValues < PUBLISH_GATE.minimumLocalDailyLifeValues)
  ) {
    return "blocked_local_distinctness";
  }
  if (bundle.status === "data_bundle_ready" && bundle.publicationRecommendation === "publish") {
    return "data_bundle_ready";
  }
  return "source_gap_review";
}

export function evaluateBundleReadiness(
  bundle: PlaceEvidenceBundle,
  bundles: PlaceEvidenceBundle[],
  today = new Date(),
): BundleReadiness {
  const citedRows = bundle.rows.filter((row) => row.cited).length;
  const gapRows = bundle.rows.filter((row) => row.sourceGapReason);
  const sourceSearchRows = gapRows.filter(
    (row) => row.sourceGapReason === "source_search_required",
  ).length;
  const sourceGaps = sourceGapRows(bundle);
  const openSourceGaps = openSourceGapRows(sourceGaps);
  const completedGapRows = gapRows.length - sourceSearchRows;
  const highLiabilityFreshnessBlockers = highLiabilityBlockers(bundle, today);
  const localDistinctValues = countLocalDistinctValues(bundle, bundles);
  const localDailyLifeValues = countLocalDailyLifeValues(bundle);
  const pageFactoryStatus = statusFromBlockers(
    bundle,
    sourceSearchRows,
    openSourceGaps.length,
    highLiabilityFreshnessBlockers,
    localDistinctValues,
    localDailyLifeValues,
  );
  const blockers = [
    ...(sourceSearchRows > 0 ? ["source_search_required"] : []),
    ...highLiabilityFreshnessBlockers.map((blocker) =>
      blocker.reason === "stale"
        ? "stale_high_liability_cited_value"
        : "low_confidence_high_liability_cited_value",
    ),
    ...(openSourceGaps.length > 0 ? ["open_source_gap_rows"] : []),
    ...(bundle.granularity === "town" &&
    localDistinctValues < PUBLISH_GATE.minimumTownDistinctValues
      ? ["missing_local_distinctness"]
      : []),
    ...(bundle.granularity === "town" &&
    localDailyLifeValues < PUBLISH_GATE.minimumLocalDailyLifeValues
      ? ["missing_local_daily_life_values"]
      : []),
    ...(bundle.status !== "data_bundle_ready" ? [`bundle_status_${bundle.status}`] : []),
    ...(bundle.publicationRecommendation !== "publish"
      ? [`publication_${bundle.publicationRecommendation}`]
      : []),
  ];

  return {
    id: bundle.id,
    placeName: bundle.placeName,
    granularity: bundle.granularity,
    bundleStatus: bundle.status,
    publicationRecommendation: bundle.publicationRecommendation,
    rowCount: bundle.rows.length,
    citedRows,
    completedGapRows,
    sourceSearchRows,
    highLiabilityFreshnessBlockers,
    localDistinctValues,
    localDailyLifeValues,
    gapReasons: countBy(
      gapRows.flatMap((row) => (row.sourceGapReason ? [row.sourceGapReason] : [])),
    ),
    sourceGapRows: sourceGaps,
    openSourceGapRows: openSourceGaps,
    blockers: [...new Set(blockers)],
    pageFactoryStatus,
    readyForPageFactory: pageFactoryStatus === "data_bundle_ready",
  };
}

export function buildCreteBundleReadinessReport(
  today = new Date(),
  bundles = placeEvidenceBundles.filter((bundle) =>
    CRETE_BUNDLE_IDS.includes(bundle.id as (typeof CRETE_BUNDLE_IDS)[number]),
  ),
): BundleReadinessReport {
  return {
    generatedDate: dayStamp(today),
    publishGate: PUBLISH_GATE,
    rawBundles: bundles,
    bundles: bundles.map((bundle) => evaluateBundleReadiness(bundle, bundles, today)),
  };
}

export function buildBundleReadinessReport(
  bundleIds: string[],
  today = new Date(),
): BundleReadinessReport {
  const bundles = bundleIds.map(loadBundleById);
  return {
    generatedDate: dayStamp(today),
    publishGate: PUBLISH_GATE,
    rawBundles: bundles,
    bundles: bundles.map((bundle) => evaluateBundleReadiness(bundle, bundles, today)),
  };
}

export function formatBundleReadinessText(report: BundleReadinessReport): string {
  const lines = [
    "Crete bundle readiness",
    `generated: ${report.generatedDate}`,
    `requires all rows attempted: ${report.publishGate.requiresAllRowsAttempted}`,
    `requires all rows filled: ${report.publishGate.requiresAllRowsFilled}`,
    `minimum town distinct values: ${report.publishGate.minimumTownDistinctValues}`,
    `minimum local daily-life values: ${report.publishGate.minimumLocalDailyLifeValues}`,
    "",
  ];

  for (const bundle of report.bundles) {
    lines.push(
      `${bundle.id}: ${bundle.pageFactoryStatus}, rows ${bundle.rowCount}, cited ${bundle.citedRows}, completed gaps ${bundle.completedGapRows}, source-search ${bundle.sourceSearchRows}, local distinct ${bundle.localDistinctValues}, local daily-life ${bundle.localDailyLifeValues}`,
    );
    if (bundle.openSourceGapRows.length > 0) {
      lines.push(
        `  open source-gap rows: ${bundle.openSourceGapRows.map((row) => row.key).join(", ")}`,
      );
    }
    if (bundle.sourceGapRows.length > 0) {
      lines.push(
        `  visible source-gap rows: ${bundle.sourceGapRows.map((row) => row.key).join(", ")}`,
      );
    }
  }

  return lines.join("\n");
}

function reportForJson(report: BundleReadinessReport): Omit<BundleReadinessReport, "rawBundles"> {
  const { rawBundles: _rawBundles, ...publicReport } = report;
  return publicReport;
}

function main() {
  const bundleIds = bundleIdsFromArgs(process.argv.slice(2));
  const report = bundleIds
    ? buildBundleReadinessReport(bundleIds)
    : buildCreteBundleReadinessReport();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(reportForJson(report), null, 2));
    return;
  }
  console.log(formatBundleReadinessText(report));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
