// The freshness signal must be honest: every Article and Dataset dateModified equals the
// newest verifiedDate actually rendered on the page. We derive the page's max verified date
// from the enriched PropertyValue descriptions ("...verified YYYY-MM-DD") and compare.

import { ensureBuilt, htmlFiles, jsonLdNodes, read, rel } from "./lib/dist.js";

ensureBuilt();

const DATE_RE = /verified (\d{4}-\d{2}-\d{2})/g;

function collectPropertyValueDates(nodes: Record<string, unknown>[]): string[] {
  const dates: string[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const v of value) walk(v);
    } else if (value && typeof value === "object") {
      const node = value as Record<string, unknown>;
      if (node["@type"] === "PropertyValue" && typeof node.description === "string") {
        for (const m of node.description.matchAll(DATE_RE)) if (m[1]) dates.push(m[1]);
      }
      for (const v of Object.values(node)) walk(v);
    }
  };
  for (const n of nodes) walk(n);
  return dates;
}

let failures = 0;
let checked = 0;
for (const file of htmlFiles()) {
  const nodes = jsonLdNodes(read(file));
  const dated = nodes.filter(
    (n) =>
      (n["@type"] === "Article" || n["@type"] === "Dataset") && typeof n.dateModified === "string",
  );
  if (dated.length === 0) continue;
  const dates = collectPropertyValueDates(nodes);
  if (dates.length === 0) continue; // no cited facts to derive a max from
  const maxDate = dates.reduce((a, b) => (b > a ? b : a));
  for (const node of dated) {
    checked += 1;
    if (node.dateModified !== maxDate) {
      console.error(
        `DATE MODIFIED  ${rel(file)}: ${node["@type"]} dateModified ${node.dateModified} != newest verified ${maxDate}.`,
      );
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\nassert-date-modified: ${failures} stale-or-wrong dateModified value(s).`);
  process.exit(1);
}
console.log(
  `assert-date-modified: ${checked} Article/Dataset node(s) match the newest verified date.`,
);
