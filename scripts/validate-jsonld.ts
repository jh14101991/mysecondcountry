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

const regimePages = htmlFiles().filter((f) => f.includes("/tax/"));

for (const file of regimePages) {
  const html = read(file);
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  if (blocks.length === 0) {
    console.error(`NO JSON-LD  ${rel(file)}`);
    failures += 1;
    continue;
  }

  let hasDataset = false;
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
      if (node["@type"] !== "Dataset") continue;
      hasDataset = true;
      if (!node["@context"]) {
        console.error(`Dataset missing @context  ${rel(file)}`);
        failures += 1;
      }
      for (const prop of ["name", "url"]) {
        if (!node[prop]) {
          console.error(`Dataset missing ${prop}  ${rel(file)}`);
          failures += 1;
        }
      }
    }
  }
  if (!hasDataset) {
    console.error(`No Dataset node  ${rel(file)}`);
    failures += 1;
  }
}

const answerPages = htmlFiles().filter((f) => f.includes("/answers/"));

for (const file of answerPages) {
  const html = read(file);
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  if (blocks.length === 0) {
    console.error(`NO JSON-LD  ${rel(file)}`);
    failures += 1;
    continue;
  }

  let hasQaPage = false;
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
      if (node["@type"] !== "QAPage") continue;
      hasQaPage = true;
      if (!node["@context"]) {
        console.error(`QAPage missing @context  ${rel(file)}`);
        failures += 1;
      }
      const mainEntity = node.mainEntity as Record<string, unknown> | undefined;
      if (!mainEntity || typeof mainEntity.name !== "string" || !mainEntity.name) {
        console.error(`QAPage missing question  ${rel(file)}`);
        failures += 1;
      }
    }
  }
  if (!hasQaPage) {
    console.error(`No QAPage node  ${rel(file)}`);
    failures += 1;
  }
}

const topicPages = htmlFiles().filter((f) => f.includes("/topics/"));

for (const file of topicPages) {
  const html = read(file);
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  if (blocks.length === 0) {
    console.error(`NO JSON-LD  ${rel(file)}`);
    failures += 1;
    continue;
  }

  let hasDataset = false;
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
      if (node["@type"] !== "Dataset") continue;
      hasDataset = true;
      if (!node["@context"]) {
        console.error(`Dataset missing @context  ${rel(file)}`);
        failures += 1;
      }
      for (const prop of ["name", "url"]) {
        if (!node[prop]) {
          console.error(`Dataset missing ${prop}  ${rel(file)}`);
          failures += 1;
        }
      }
    }
  }
  if (!hasDataset) {
    console.error(`No Dataset node  ${rel(file)}`);
    failures += 1;
  }
}

const shortlistPages = htmlFiles().filter((f) => f.includes("/shortlists/"));

for (const file of shortlistPages) {
  const html = read(file);
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  if (blocks.length === 0) {
    console.error(`NO JSON-LD  ${rel(file)}`);
    failures += 1;
    continue;
  }

  let hasItemList = false;
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
      if (node["@type"] !== "ItemList") continue;
      hasItemList = true;
      if (!node["@context"]) {
        console.error(`ItemList missing @context  ${rel(file)}`);
        failures += 1;
      }
      const itemListElement = node.itemListElement;
      if (!Array.isArray(itemListElement) || itemListElement.length === 0) {
        console.error(`ItemList missing non-empty itemListElement  ${rel(file)}`);
        failures += 1;
      }
    }
  }
  if (!hasItemList) {
    console.error(`No ItemList node  ${rel(file)}`);
    failures += 1;
  }
}

const toolPages = htmlFiles().filter((f) => f.includes("/tools/"));

for (const file of toolPages) {
  const html = read(file);
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  if (blocks.length === 0) {
    console.error(`NO JSON-LD  ${rel(file)}`);
    failures += 1;
    continue;
  }

  let hasHowTo = false;
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
      if (node["@type"] !== "HowTo") continue;
      hasHowTo = true;
      if (!node["@context"]) {
        console.error(`HowTo missing @context  ${rel(file)}`);
        failures += 1;
      }
      if (!node.name) {
        console.error(`HowTo missing name  ${rel(file)}`);
        failures += 1;
      }
      const step = node.step;
      if (!Array.isArray(step) || step.length === 0) {
        console.error(`HowTo missing non-empty step array  ${rel(file)}`);
        failures += 1;
      }
    }
  }
  if (!hasHowTo) {
    console.error(`No HowTo node  ${rel(file)}`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\nvalidate-jsonld: ${failures} problem(s).`);
  process.exit(1);
}
console.log(
  `validate-jsonld: ${placePages.length} place page(s) carry valid Place JSON-LD, ${regimePages.length} regime page(s) carry valid Dataset JSON-LD, ${answerPages.length} answer page(s) carry valid QAPage JSON-LD, ${topicPages.length} topic page(s) carry valid Dataset JSON-LD, ${shortlistPages.length} shortlist page(s) carry valid ItemList JSON-LD, ${toolPages.length} tool page(s) carry valid HowTo JSON-LD.`,
);
