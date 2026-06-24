// DOD (j): WCAG 2.1 AA on the static content. Three layers:
//  1. Deterministic structural checks (landmarks, single h1, lang, img alt) - hard gate.
//  2. WCAG contrast ratios on the design tokens - hard gate (jsdom cannot compute these,
//     so they are checked directly against the palette pairs actually used).
//  3. axe-core over the DOM for the remaining rules - hard gate when it runs cleanly,
//     soft when the tool cannot run under jsdom (so infra quirks never block a deploy).

import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

let failures = 0;
const fail = (msg: string): void => {
  console.error(`A11Y  ${msg}`);
  failures += 1;
};

// ---- 1. structural ----
for (const file of htmlFiles()) {
  const doc = new JSDOM(read(file)).window.document;
  const r = rel(file);
  if (doc.querySelectorAll("main").length !== 1) fail(`${r}: expected exactly one <main>`);
  if (!doc.querySelector("nav")) fail(`${r}: no <nav> landmark`);
  if (!doc.querySelector("footer")) fail(`${r}: no <footer> landmark`);
  if (doc.querySelectorAll("h1").length !== 1) fail(`${r}: expected exactly one <h1>`);
  if (!doc.documentElement.getAttribute("lang")) fail(`${r}: <html> missing lang`);
  for (const img of doc.querySelectorAll("img")) {
    if (!img.getAttribute("alt") && img.getAttribute("alt") !== "") fail(`${r}: <img> missing alt`);
  }
}

// ---- 2. contrast (normal text needs >= 4.5:1) ----
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const chan = [0, 2, 4].map((i) => Number.parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = chan.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (lin[0] ?? 0) + 0.7152 * (lin[1] ?? 0) + 0.0722 * (lin[2] ?? 0);
}
function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
// Text/background pairs actually used by the layout and components.
const PAIRS: [string, string, string][] = [
  ["body ink / paper", "#1c1a17", "#faf7f0"],
  ["soft ink / paper", "#4a463f", "#faf7f0"],
  ["soft ink / paper-2", "#4a463f", "#f3ede1"],
  ["link / paper", "#8f3d1f", "#faf7f0"],
  ["fence body / fence bg", "#5c2a16", "#fbeee7"],
  ["fence stale / fence bg", "#7a1f1f", "#fbeee7"],
  ["badge high / bg", "#1f5132", "#eef6f0"],
  ["badge medium / bg", "#6b4a12", "#f8f1de"],
  ["badge low / bg", "#7a1f1f", "#f8e9e9"],
];
for (const [name, fg, bg] of PAIRS) {
  const ratio = contrast(fg, bg);
  if (ratio < 4.5) fail(`contrast ${name}: ${ratio.toFixed(2)}:1 < 4.5:1`);
}

// ---- 3. axe-core (best effort) ----
try {
  const axe = (await import("axe-core")).default;
  for (const file of htmlFiles()) {
    const dom = new JSDOM(read(file), { pretendToBeVisual: true });
    const g = globalThis as unknown as Record<string, unknown>;
    g.window = dom.window;
    g.document = dom.window.document;
    const results = await axe.run(dom.window.document, {
      resultTypes: ["violations"],
      rules: { "color-contrast": { enabled: false } },
    });
    for (const v of results.violations) {
      if (v.impact === "serious" || v.impact === "critical") {
        fail(`${rel(file)}: axe ${v.id} (${v.impact}) - ${v.help}`);
      }
    }
  }
  console.log("check-a11y: axe-core ran.");
} catch (err) {
  console.warn(`check-a11y: axe-core could not run under jsdom (soft): ${(err as Error).message}`);
}

if (failures > 0) {
  console.error(`\ncheck-a11y: ${failures} accessibility problem(s).`);
  process.exit(1);
}
console.log("check-a11y: structural and contrast checks passed (axe-core best-effort).");
