// DOD (d): every Place page must emit a well-formed Place JSON-LD block in <head>.

import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const placePages = htmlFiles().filter((f) => f.includes(`${"/places/"}`));
let failures = 0;

for (const file of placePages) {
  const html = read(file);
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  if (blocks.length === 0) {
    console.error(`NO JSON-LD  ${rel(file)}`);
    failures += 1;
    continue;
  }

  let hasPlace = false;
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block ?? "");
    } catch {
      console.error(`BAD JSON-LD  ${rel(file)}`);
      failures += 1;
      continue;
    }
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    for (const node of nodes as Record<string, unknown>[]) {
      if (node["@type"] !== "Place") continue;
      hasPlace = true;
      if (!node["@context"]) {
        console.error(`Place missing @context  ${rel(file)}`);
        failures += 1;
      }
      for (const prop of ["name", "url"]) {
        if (!node[prop]) {
          console.error(`Place missing ${prop}  ${rel(file)}`);
          failures += 1;
        }
      }
    }
  }
  if (!hasPlace) {
    console.error(`No Place node  ${rel(file)}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\nvalidate-jsonld: ${failures} problem(s).`);
  process.exit(1);
}
console.log(`validate-jsonld: ${placePages.length} place page(s) carry valid Place JSON-LD.`);
