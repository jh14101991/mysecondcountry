// DOD (f): every programmatic page below country granularity must carry at least 4
// CitedValue fields whose sourceUrl differs from the parent place's corresponding field.
// This is the primary guard against scaled thin content. It only enforces where the
// parent Place exists in the dataset; with a single town and no parent objects yet it
// reports a skip. Phase A (which adds the country/region Places) turns it into a hard gate.

import { collectCitedValues, type Place, placeById, places } from "@where/data";

const MIN_UNIQUE = 4;

function sourceMap(place: Place): Map<string, string> {
  const m = new Map<string, string>();
  for (const { path, cited } of collectCitedValues(place)) m.set(path, cited.sourceUrl);
  return m;
}

let failures = 0;
let checked = 0;
let skipped = 0;

for (const place of places) {
  if (place.granularity === "country") continue;
  if (!place.parentId) continue;
  const parent = placeById(place.parentId);
  if (!parent) {
    skipped += 1;
    console.log(
      `assert-uniqueness: ${place.id} parent ${place.parentId} not in dataset yet, skipping.`,
    );
    continue;
  }
  checked += 1;
  const parentSources = sourceMap(parent);
  let unique = 0;
  for (const [path, url] of sourceMap(place)) {
    if (parentSources.get(path) !== url) unique += 1;
  }
  if (unique < MIN_UNIQUE) {
    console.error(
      `THIN  ${place.id}: only ${unique} CitedValue field(s) differ from ${parent.id} (need ${MIN_UNIQUE}).`,
    );
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\nassert-uniqueness: ${failures} thin page(s).`);
  process.exit(1);
}
console.log(`assert-uniqueness: ok (${checked} checked, ${skipped} skipped pending parents).`);
