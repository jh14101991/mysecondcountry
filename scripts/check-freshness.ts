// DOD (b): every visa/tax/residency CitedValue must be within its staleness window.
// CITATIONS.md 90-day rule, with per-field overrides (the digital nomad visa uses 60).
// Confidence "low" is structurally impossible on these fields (schema forbids it), so
// any stale high/medium value is a hard failure here.

import { ageInDays, collectCitedValues, places } from "@where/data";

const HIGH_LIABILITY = new Set(["visa", "tax", "residency"]);
const DEFAULT_LIMIT = 90;

let failures = 0;
for (const place of places) {
  for (const { path, cited } of collectCitedValues(place)) {
    if (!cited.category || !HIGH_LIABILITY.has(cited.category)) continue;
    if (cited.confidence === "low") continue; // shown with caution, exempt from hard fail
    const limit = cited.stalenessDays ?? DEFAULT_LIMIT;
    const age = ageInDays(cited.verifiedDate);
    if (age > limit) {
      console.error(
        `STALE  ${place.id} ${path}: verified ${cited.verifiedDate} (${age}d > ${limit}d), confidence ${cited.confidence}`,
      );
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(
    `\ncheck-freshness: ${failures} stale visa/tax/residency value(s). Refresh required.`,
  );
  process.exit(1);
}
console.log("check-freshness: all visa/tax/residency values are within their window.");
