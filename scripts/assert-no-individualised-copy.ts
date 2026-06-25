// No individualised recommendation language (FENCE.md "No individualized recommendations").
// We state the general rule, cite the source, and route to a licensed professional. We never
// direct an individual's decision. Runs on visible copy.

import { ensureBuilt, htmlFiles, read, rel, visibleText } from "./lib/dist.js";

ensureBuilt();

// "we recommend" is allowed only when recommending a source (FENCE.md exception).
const BANNED: RegExp[] = [
  /\byou should\b/i,
  /\bbest for you\b/i,
  /\bin your case\b/i,
  /\byour best option\b/i,
  /\bwe recommend\b(?!\s+(?:a\s+source|this\s+source|these\s+sources|the\s+source))/i,
];

let failures = 0;
for (const file of htmlFiles()) {
  const text = visibleText(read(file));
  for (const re of BANNED) {
    const m = text.match(re);
    if (m) {
      const at = m.index ?? 0;
      const context = text
        .slice(Math.max(0, at - 25), at + 35)
        .replace(/\s+/g, " ")
        .trim();
      console.error(`COPY  ${rel(file)}: individualised phrase "${m[0]}" near "...${context}..."`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\nassert-no-individualised-copy: ${failures} individualised-copy violation(s).`);
  process.exit(1);
}
console.log("assert-no-individualised-copy: no individualised recommendation language.");
