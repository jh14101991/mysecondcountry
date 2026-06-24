// DOD (c): no built page that mentions residency, visa, or tax may lack the fence string.
// The fence text is imported from its single source of truth so this and the rendered
// page can never drift apart.

import { FENCE_PRIMARY } from "../packages/web/src/lib/fence.js";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const LEGAL = /residency|visa|\btax\b/i;
let failures = 0;

for (const file of htmlFiles()) {
  const html = read(file);
  if (LEGAL.test(html) && !html.includes(FENCE_PRIMARY)) {
    console.error(
      `NO FENCE  ${rel(file)}: mentions residency/visa/tax but lacks the fence string.`,
    );
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\nassert-fence: ${failures} page(s) missing the fence.`);
  process.exit(1);
}
console.log("assert-fence: every page touching residency/visa/tax carries the fence string.");
