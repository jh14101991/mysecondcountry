// The liability fence sits above the first claim (FENCE.md). On any page that renders the
// fence and at least one claim (a data table or a cited cell), the fence must DOM-precede the
// first such claim. Pages that mention tax/visa/residency but lack a fence are caught by
// assert-fence; this guard checks ordering where the fence is present.

import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const CLAIM_SELECTOR = "table, [data-confidence]";

let failures = 0;
let checked = 0;
for (const file of htmlFiles()) {
  const dom = new JSDOM(read(file));
  const doc = dom.window.document;
  const fence = doc.querySelector(".fence");
  const firstClaim = doc.querySelector(CLAIM_SELECTOR);
  if (!fence || !firstClaim) continue;
  checked += 1;
  const following = dom.window.Node.DOCUMENT_POSITION_FOLLOWING;
  const precedes = (fence.compareDocumentPosition(firstClaim) & following) !== 0;
  if (!precedes) {
    console.error(`FENCE ORDER  ${rel(file)}: a claim appears before the fence.`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\nassert-fence-before-claim: ${failures} page(s) with a claim above the fence.`);
  process.exit(1);
}
console.log(`assert-fence-before-claim: fence precedes the first claim on ${checked} page(s).`);
