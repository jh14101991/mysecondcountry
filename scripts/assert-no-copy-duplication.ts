// DOD (f): no two Place pages should share an identical body-copy block over
// 120 consecutive characters. This checks authored prose only, excluding shared
// chrome, data tables, the evidence atlas, source lists, CTAs, and fence text.

import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const MIN_COPY_CHARS = 121;
const SKIP_SELECTORS = [
  "script",
  "style",
  "code",
  "svg",
  "noscript",
  "header",
  "footer",
  "nav",
  ".breadcrumb",
  ".fence",
  ".evidence-atlas",
  ".atlas-metrics",
  ".atlas-controls",
  ".atlas-grid",
  ".place-data-table",
  ".sources-section",
  ".related",
  ".regions",
  ".section-note",
  ".how-to-read",
  ".cta-section",
].join(", ");

function normalize(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;!?])/g, "$1")
    .trim();
}

function bodyCopyBlocks(html: string): string[] {
  const doc = new JSDOM(html).window.document;
  for (const el of doc.querySelectorAll(SKIP_SELECTORS)) el.remove();

  const blocks = new Set<string>();
  for (const el of doc.querySelectorAll("article p, article li")) {
    const text = normalize(el.textContent ?? "");
    if (text.length >= MIN_COPY_CHARS) blocks.add(text);
  }
  return [...blocks];
}

const placeFiles = htmlFiles().filter((file) => {
  const path = rel(file);
  return path.startsWith("places/") && path !== "places/index.html";
});

const seen = new Map<string, string>();
let failures = 0;

for (const file of placeFiles) {
  const path = rel(file);
  for (const block of bodyCopyBlocks(read(file))) {
    const firstPath = seen.get(block);
    if (firstPath && firstPath !== path) {
      console.error(
        `COPY DUPLICATION  ${firstPath} and ${path}: identical body-copy block over 120 chars: "${block.slice(
          0,
          160,
        )}${block.length > 160 ? "..." : ""}"`,
      );
      failures += 1;
      continue;
    }
    seen.set(block, path);
  }
}

if (failures > 0) {
  console.error(
    `\nassert-no-copy-duplication: ${failures} duplicate body-copy block(s) across Place pages.`,
  );
  process.exit(1);
}

console.log(
  `assert-no-copy-duplication: ${placeFiles.length} Place page(s) checked, no duplicate authored prose blocks over 120 chars.`,
);
