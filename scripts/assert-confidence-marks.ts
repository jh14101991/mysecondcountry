// Confidence is never colour alone (DESIGN.md "Colour-Plus-Mark Rule", DOD j). Every badge
// (any element carrying data-confidence) must render BOTH a glyph and a word.

import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const GLYPHS = ["✓", "~", "○"];
const WORDS = ["Verified", "Good", "Limited"];

let failures = 0;
let checked = 0;
for (const file of htmlFiles()) {
  const doc = new JSDOM(read(file)).window.document;
  for (const badge of doc.querySelectorAll("[data-confidence]")) {
    checked += 1;
    const text = badge.textContent ?? "";
    const hasGlyph = GLYPHS.some((g) => text.includes(g));
    const hasWord = WORDS.some((w) => text.includes(w));
    if (!hasGlyph || !hasWord) {
      console.error(
        `CONFIDENCE  ${rel(file)}: badge "${text.trim()}" missing ${!hasGlyph ? "glyph" : "word"}.`,
      );
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\nassert-confidence-marks: ${failures} badge(s) without glyph + word.`);
  process.exit(1);
}
console.log(`assert-confidence-marks: ${checked} confidence badge(s) carry a glyph and a word.`);
