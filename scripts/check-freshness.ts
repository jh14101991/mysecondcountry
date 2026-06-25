// DOD (b): every visa/tax/residency CitedValue must be within its staleness window.
// CITATIONS.md 90-day rule, with per-field overrides (the digital nomad visa uses 60).
// Confidence "low" is structurally impossible on these fields (schema forbids it), so
// any stale high/medium value is a hard failure here.

import {
  ageInDays,
  type CitedValue,
  collectCitedValues,
  collectQaCitedValues,
  collectRegimeCitedValues,
  DEFAULT_STALENESS_DAYS,
  places,
  qa,
  regimes,
} from "@where/data";

const HIGH_LIABILITY = new Set(["visa", "tax", "residency"]);

// Per-field stalenessDays wins; otherwise the field's category default (90 for the
// visa/tax/residency categories, see DEFAULT_STALENESS_DAYS). The Greek visa/tax fields
// carry a 60-day override, which this honours (FENCE.md jurisdiction note).
function limitFor(cited: CitedValue): number {
  return cited.stalenessDays ?? (cited.category ? DEFAULT_STALENESS_DAYS[cited.category] : 90);
}

let failures = 0;
for (const place of places) {
  for (const { path, cited } of collectCitedValues(place)) {
    if (!cited.category || !HIGH_LIABILITY.has(cited.category)) continue;
    if (cited.confidence === "low") continue; // shown with caution, exempt from hard fail
    const limit = limitFor(cited);
    const age = ageInDays(cited.verifiedDate);
    if (age > limit) {
      console.error(
        `STALE  ${place.id} ${path}: verified ${cited.verifiedDate} (${age}d > ${limit}d), confidence ${cited.confidence}`,
      );
      failures += 1;
    }
  }
}

for (const regime of regimes) {
  for (const { path, cited } of collectRegimeCitedValues(regime)) {
    if (!cited.category || !HIGH_LIABILITY.has(cited.category)) continue;
    if (cited.confidence === "low") continue; // shown with caution, exempt from hard fail
    const limit = limitFor(cited);
    const age = ageInDays(cited.verifiedDate);
    if (age > limit) {
      console.error(
        `STALE  ${regime.id} ${path}: verified ${cited.verifiedDate} (${age}d > ${limit}d), confidence ${cited.confidence}`,
      );
      failures += 1;
    }
  }
}

for (const entry of qa) {
  for (const { path, cited } of collectQaCitedValues(entry)) {
    if (!cited.category || !HIGH_LIABILITY.has(cited.category)) continue;
    if (cited.confidence === "low") continue;
    const limit = limitFor(cited);
    const age = ageInDays(cited.verifiedDate);
    if (age > limit) {
      console.error(
        `STALE  ${entry.id} ${path}: verified ${cited.verifiedDate} (${age}d > ${limit}d), confidence ${cited.confidence}`,
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
