// Cited data ships in real tables, not div grids (DESIGN.md, DOD j). Every <table> must
// carry a <caption> and at least one <th scope>, and must not use a <div> as a structural
// child of table/thead/tbody/tfoot/tr (a div inside a <td>/<th> cell is fine).

import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

let failures = 0;
let checked = 0;
for (const file of htmlFiles()) {
  const doc = new JSDOM(read(file)).window.document;
  for (const table of doc.querySelectorAll("table")) {
    checked += 1;
    const where = rel(file);
    if (!table.querySelector("caption")) {
      console.error(`TABLE  ${where}: <table> without a <caption>.`);
      failures += 1;
    }
    if (!table.querySelector("th[scope]")) {
      console.error(`TABLE  ${where}: <table> without a scoped <th scope>.`);
      failures += 1;
    }
    const strayDiv = table.querySelector(
      "table > div, thead > div, tbody > div, tfoot > div, tr > div",
    );
    if (strayDiv) {
      console.error(`TABLE  ${where}: <div> used as a structural table child (not inside a cell).`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\nassert-table-semantics: ${failures} table-semantics problem(s).`);
  process.exit(1);
}
console.log(
  `assert-table-semantics: ${checked} table(s) carry caption + scoped headers, no div cells.`,
);
