// DOD (j): WCAG 2.1 AA on the static content. Three layers:
//  1. Deterministic structural checks (landmarks, single h1, lang, img alt) - hard gate.
//  2. WCAG contrast ratios on the design tokens - hard gate (jsdom cannot compute these,
//     so they are checked directly against the palette pairs actually used).
//  3. axe-core over the DOM for the remaining rules - hard gate.

import axe from "axe-core";
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
  ["body ink / paper", "#151210", "#EFE9DF"],
  ["body ink / card", "#151210", "#F8F5EF"],
  ["muted / paper", "#6A6458", "#EFE9DF"],
  ["muted / card", "#6A6458", "#F8F5EF"],
  ["muted-strong / card", "#5A5248", "#F8F5EF"],
  ["primary link / paper", "#0A3D52", "#EFE9DF"],
  ["greece ink / paper", "#15639C", "#EFE9DF"],
  ["portugal ink / paper", "#9B2335", "#EFE9DF"],
  ["spain ink / paper", "#9C5717", "#EFE9DF"],
  ["greece ink / card", "#15639C", "#F8F5EF"],
  ["spain ink / card", "#9C5717", "#F8F5EF"],
  ["on-primary / teal", "#EDF1F2", "#0A3D52"],
  ["on-primary-soft / teal", "#AFC0C7", "#0A3D52"],
  ["greece on teal", "#63ADE8", "#0A3D52"],
  ["portugal on teal", "#E8919D", "#0A3D52"],
  ["spain on teal", "#E8A765", "#0A3D52"],
  ["fence ink / fence bg", "#2C2418", "#F4EAD4"],
  ["conf verified / card", "#1F6B3C", "#F8F5EF"],
  ["conf good / card", "#6E5E16", "#F8F5EF"],
  ["conf low / card", "#5A5248", "#F8F5EF"],
];
for (const [name, fg, bg] of PAIRS) {
  const ratio = contrast(fg, bg);
  if (ratio < 4.5) fail(`contrast ${name}: ${ratio.toFixed(2)}:1 < 4.5:1`);
}

// ---- 3. axe-core ----
type AxeWindow = Window & typeof globalThis & { axe?: typeof axe };

for (const file of htmlFiles()) {
  const dom = new JSDOM(read(file), {
    pretendToBeVisual: true,
    runScripts: "outside-only",
    url: `https://mysecondcountry.com/${rel(file).replace(/\/index\.html$/, "")}`,
  });
  const win = dom.window as unknown as AxeWindow;
  win.eval(axe.source);
  const results = await win.axe?.run(win.document, {
    resultTypes: ["violations"],
    rules: { "color-contrast": { enabled: false } },
  });
  for (const v of results?.violations ?? []) {
    if (v.impact === "serious" || v.impact === "critical") {
      fail(`${rel(file)}: axe ${v.id} (${v.impact}) - ${v.help}`);
    }
  }
}
console.log("check-a11y: axe-core ran.");

if (failures > 0) {
  console.error(`\ncheck-a11y: ${failures} accessibility problem(s).`);
  process.exit(1);
}
console.log("check-a11y: structural, contrast, and axe-core checks passed.");
