// Data refresh (ADR-0006). Given a place id (or --all-greece), re-fetch the fields that
// have an automatable primary source, stamp verifiedDate, re-validate against the schema,
// and write the JSON back. Manual-only fields (visa via migration.gov.gr, tax via AADE/PwC,
// climate normals) are intentionally left untouched: SOURCES.md keeps those on the human
// merge gate, and check-freshness surfaces their staleness. The pipeline opens a PR; a
// human merges. Resilient: a failed fetch keeps the existing value and logs a warning.

import { readFileSync, writeFileSync } from "node:fs";
import { PlaceSchema, places } from "@where/data";
import { fetchEurostat, latestEurostatValue } from "../packages/data/src/clients/eurostat.js";

const TODAY = new Date().toISOString().slice(0, 10);
const PLACES_DIR = "packages/data/src/places";

const arg = process.argv[2] ?? "--all-greece";
const targets =
  arg === "--all-greece"
    ? places.filter((p) => p.country === "Greece")
    : places.filter((p) => p.id === arg);

if (targets.length === 0) {
  console.error(`refresh-place: no places match "${arg}".`);
  process.exit(1);
}

let totalChanged = 0;

for (const place of targets) {
  const file = `${PLACES_DIR}/${place.id}.json`;
  // biome-ignore lint/suspicious/noExplicitAny: raw JSON is reshaped then re-validated.
  const raw = JSON.parse(readFileSync(file, "utf8")) as any;
  let changed = false;

  // Auto-refresh: national price level from Eurostat tec00120 (the one automatable cost
  // source; Numbeo is paid/ToS-restricted and only runs when a key is present).
  const cost = raw.costOfLiving?.priceLevelIndexEU27;
  if (cost && typeof cost.sourceName === "string" && cost.sourceName.includes("Eurostat")) {
    try {
      const resp = await fetchEurostat("tec00120", { geo: "EL" });
      const latest = latestEurostatValue(resp);
      if (latest) {
        const excerpt = `Greece price level index for actual individual consumption (EU27 = 100): ${latest.value} in ${latest.year} (100 = EU average).`;
        if (
          cost.value !== latest.value ||
          cost.excerpt !== excerpt ||
          cost.verifiedDate !== TODAY
        ) {
          changed = true;
        }
        cost.value = latest.value;
        cost.excerpt = excerpt;
        cost.verifiedDate = TODAY;
        console.log(`[${place.id}] cost -> ${latest.value} (${latest.year}), verified ${TODAY}`);
      } else {
        console.warn(`[${place.id}] eurostat returned no value; keeping existing.`);
      }
    } catch (err) {
      console.warn(
        `[${place.id}] eurostat refresh failed, keeping existing: ${(err as Error).message}`,
      );
    }
  }

  // Never write an invalid Place.
  PlaceSchema.parse(raw);

  if (changed) {
    writeFileSync(file, `${JSON.stringify(raw, null, 2)}\n`);
    totalChanged += 1;
    console.log(`[${place.id}] wrote ${file}`);
  } else {
    console.log(`[${place.id}] no change`);
  }
}

console.log(`\nrefresh-place: ${targets.length} place(s) processed, ${totalChanged} changed.`);
