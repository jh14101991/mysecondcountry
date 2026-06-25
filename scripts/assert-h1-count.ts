// Exactly one <h1> per built page. A second h1 (or none) breaks the document outline that
// both assistive tech and answer engines read. The Masthead component owns the single h1.

import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

let failures = 0;
for (const file of htmlFiles()) {
  const doc = new JSDOM(read(file)).window.document;
  const count = doc.querySelectorAll("h1").length;
  if (count !== 1) {
    console.error(`H1 COUNT  ${rel(file)}: found ${count} <h1>, expected exactly 1.`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\nassert-h1-count: ${failures} page(s) with the wrong <h1> count.`);
  process.exit(1);
}
console.log("assert-h1-count: every page has exactly one <h1>.");
