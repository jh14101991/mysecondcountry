import { isFactRef } from "../refs.js";
import { resolveCitedOrRef } from "../resolve.js";
import type { CitedValue } from "../schema.js";
import agiosNikolaosRaw from "./gr-crete-agios-nikolaos.json" with { type: "json" };
import chaniaRaw from "./gr-crete-chania.json" with { type: "json" };
import heraklionRaw from "./gr-crete-heraklion.json" with { type: "json" };
import creteRaw from "./gr-crete-region.json" with { type: "json" };
import rethymnoRaw from "./gr-crete-rethymno.json" with { type: "json" };
import {
  type MatrixRow,
  type PlaceEvidenceBundle,
  type PlaceEvidenceBundleInput,
  PlaceEvidenceBundleInputSchema,
} from "./schema.js";

const HIGH_LIABILITY = new Set(["tax", "visa", "residency"]);

function assertHighLiabilityConfidence(bundleId: string, row: MatrixRow, cited: CitedValue) {
  if (cited.category && HIGH_LIABILITY.has(cited.category) && cited.confidence === "low") {
    throw new Error(
      `place bundle ${bundleId} row ${row.key}: high-liability facts must be high or medium confidence`,
    );
  }
}

function resolveBundle(input: PlaceEvidenceBundleInput): PlaceEvidenceBundle {
  return {
    ...input,
    rows: input.rows.map((row) => {
      const { cited, ...rowWithoutCited } = row;
      const resolved: MatrixRow = { ...rowWithoutCited };
      if (cited) {
        resolved.cited = isFactRef(cited) ? resolveCitedOrRef(cited) : cited;
        assertHighLiabilityConfidence(input.id, resolved, resolved.cited);
      }
      return resolved;
    }),
  };
}

const RAW: unknown[] = [creteRaw, chaniaRaw, heraklionRaw, rethymnoRaw, agiosNikolaosRaw];

export const placeEvidenceBundles: PlaceEvidenceBundle[] = RAW.map((raw) =>
  resolveBundle(PlaceEvidenceBundleInputSchema.parse(raw)),
);

export function placeEvidenceBundleById(id: string): PlaceEvidenceBundle | undefined {
  return placeEvidenceBundles.find((bundle) => bundle.id === id);
}
