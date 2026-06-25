// DOD (f): every programmatic page below country granularity must carry at least 4
// CitedValue fields whose sourceUrl differs from the parent place's corresponding field.
// This is the primary guard against scaled thin content. It only enforces where the
// parent Place exists in the dataset; with a single town and no parent objects yet it
// reports a skip. Phase A (which adds the country/region Places) turns it into a hard gate.

import {
  collectCitedValues,
  collectQaCitedValues,
  collectRegimeCitedValues,
  collectTopicsCitedValues,
  type Place,
  placeById,
  places,
  qa,
  regimes,
  topics,
} from "@where/data";

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

// Topic (regime) pages have no parent to differ from; the anti-thin floor is instead a
// minimum of distinct cited fields, each carrying its own sourceUrl (a single authoritative
// source can legitimately back several distinct facts, so we count fields, not URLs).
let regimesChecked = 0;
for (const regime of regimes) {
  regimesChecked += 1;
  const citedFields = collectRegimeCitedValues(regime).filter(({ cited }) => cited.sourceUrl);
  if (citedFields.length < MIN_UNIQUE) {
    console.error(
      `THIN  ${regime.id}: only ${citedFields.length} cited field(s) (need ${MIN_UNIQUE}).`,
    );
    failures += 1;
  }
}

// qa pages have no parent; anti-thin floor is >= 4 distinct cited fields with sourceUrl.
let qaChecked = 0;
for (const entry of qa) {
  qaChecked += 1;
  const citedFields = collectQaCitedValues(entry).filter(({ cited }) => cited.sourceUrl);
  if (citedFields.length < MIN_UNIQUE) {
    console.error(
      `THIN  ${entry.id}: only ${citedFields.length} cited field(s) (need ${MIN_UNIQUE}).`,
    );
    failures += 1;
  }
}

// topics pages have no parent; anti-thin floor is >= 4 distinct cited fields with sourceUrl.
let topicsChecked = 0;
for (const topic of topics) {
  topicsChecked += 1;
  const citedFields = collectTopicsCitedValues(topic).filter(({ cited }) => cited.sourceUrl);
  if (citedFields.length < MIN_UNIQUE) {
    console.error(
      `THIN  ${topic.id}: only ${citedFields.length} cited field(s) (need ${MIN_UNIQUE}).`,
    );
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\nassert-uniqueness: ${failures} thin page(s).`);
  process.exit(1);
}
console.log(
  `assert-uniqueness: ok (${checked} place(s) checked, ${skipped} skipped pending parents, ${regimesChecked} regime(s) checked, ${qaChecked} qa entry/entries checked, ${topicsChecked} topic(s) checked).`,
);
