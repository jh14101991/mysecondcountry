// No em dash, en dash, or double hyphen in visible copy (DESIGN.md / PRODUCT.md copy rule).
// Runs on visible text only: CSS custom properties (var(--x)) and inline scripts legitimately
// contain "--", so style/script/code/svg are stripped before the check.

import { ensureBuilt, htmlFiles, read, rel, visibleText } from "./lib/dist.js";

ensureBuilt();

const BANNED: [string, RegExp][] = [
  ["em dash (—)", /—/],
  ["en dash (–)", /–/],
  ["double hyphen (--)", /--/],
];

let failures = 0;
for (const file of htmlFiles()) {
  const text = visibleText(read(file));
  for (const [label, re] of BANNED) {
    const m = text.match(re);
    if (m) {
      const at = m.index ?? 0;
      const context = text
        .slice(Math.max(0, at - 30), at + 30)
        .replace(/\s+/g, " ")
        .trim();
      console.error(`DASH  ${rel(file)}: ${label} in copy near "...${context}..."`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\nassert-no-em-dashes: ${failures} dash violation(s) in visible copy.`);
  process.exit(1);
}
console.log("assert-no-em-dashes: no em/en dashes or double hyphens in visible copy.");
