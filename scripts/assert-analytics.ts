// DOD (h): analytics hooks exist for first-page measurement. This checks the
// provider script, then asserts the Chania place page exposes the demand and
// evidence-depth event contract Analytics Desk uses for Command Center reads.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const PLAUSIBLE_SRC = "https://plausible.io/js/script.outbound-links.tagged-events.js";
const SITE_DOMAIN = "mysecondcountry.com";
const REQUIRED_SOURCE_EVENTS = [
  "place_page_view",
  "source_link_click",
  "fence_viewed",
  "evidence_atlas_lens_selected",
  "evidence_atlas_search_used",
  "evidence_atlas_row_opened",
  "evidence_atlas_source_click",
  "screener_cta_click",
];
const SOURCE_ROOT = "packages/web/src";

let failures = 0;

function fail(message: string): void {
  console.error(`ANALYTICS  ${message}`);
  failures += 1;
}

function sourceFiles(dir: string = SOURCE_ROOT): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      out.push(...sourceFiles(path));
      continue;
    }
    if (/\.(astro|ts|tsx|js|jsx)$/.test(entry)) out.push(path);
  }
  return out;
}

const sourceText = sourceFiles()
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

for (const eventName of REQUIRED_SOURCE_EVENTS) {
  if (!sourceText.includes(eventName)) {
    fail(`source is missing named event "${eventName}"`);
  }
}

for (const file of htmlFiles()) {
  const html = read(file);
  const path = rel(file);
  const doc = new JSDOM(html).window.document;
  const plausible = [...doc.querySelectorAll("script")].some((script) => {
    const src = script.getAttribute("src") ?? "";
    const domain = script.getAttribute("data-domain") ?? "";
    return src === PLAUSIBLE_SRC && domain === SITE_DOMAIN;
  });
  if (!plausible) {
    fail(`${path}: missing Plausible script for ${SITE_DOMAIN}`);
  }

  if (doc.querySelector(".fence") && !html.includes("fence_viewed")) {
    fail(`${path}: renders a fence but does not define the fence_viewed event hook`);
  }

  if (path.includes("/places/") && doc.querySelector("[data-page='place']")) {
    for (const eventName of ["place_page_view", "source_link_click"]) {
      if (!html.includes(eventName)) {
        fail(`${path}: place page is missing the ${eventName} hook`);
      }
    }
  }

  if (doc.querySelector("[data-evidence-atlas]")) {
    for (const eventName of [
      "evidence_atlas_lens_selected",
      "evidence_atlas_search_used",
      "evidence_atlas_row_opened",
      "evidence_atlas_source_click",
    ]) {
      if (!html.includes(eventName)) {
        fail(`${path}: evidence atlas is missing the ${eventName} hook`);
      }
    }
  }

  if (path.includes("/places/") && [...doc.querySelectorAll("a[href='/screener']")].length > 0) {
    if (!html.includes("screener_cta_click")) {
      fail(`${path}: screener CTA is missing the screener_cta_click hook`);
    }
  }
}

if (failures > 0) {
  console.error(`\nassert-analytics: ${failures} analytics problem(s).`);
  process.exit(1);
}

console.log(
  `assert-analytics: ${htmlFiles().length} HTML page(s) checked; Plausible and named event hooks are present.`,
);
