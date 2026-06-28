// A FAQPage must not invent questions: every Question.name in the JSON-LD has to match visible
// page text (FAQ rich results policy, and our anti-fabrication rule). Multi-question sections
// use FaqItem h3s; direct-answer pages use their visible direct-answer heading.

import { JSDOM } from "jsdom";
import { ensureBuilt, htmlFiles, jsonLdNodes, read, rel } from "./lib/dist.js";

ensureBuilt();

const norm = (s: string): string => s.replace(/\s+/g, " ").trim();

let failures = 0;
let checked = 0;
for (const file of htmlFiles()) {
  const html = read(file);
  const faqNodes = jsonLdNodes(html).filter((n) => n["@type"] === "FAQPage");
  if (faqNodes.length === 0) continue;

  const doc = new JSDOM(html).window.document;
  const visibleText = norm(doc.body?.textContent ?? "");

  for (const node of faqNodes) {
    const questions = Array.isArray(node.mainEntity) ? node.mainEntity : [];
    for (const q of questions as Record<string, unknown>[]) {
      checked += 1;
      const name = typeof q.name === "string" ? norm(q.name) : "";
      if (!visibleText.includes(name)) {
        console.error(
          `FAQ  ${rel(file)}: FAQPage question not found in visible page text: "${name}"`,
        );
        failures += 1;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\nassert-faq-jsonld: ${failures} FAQ question(s) without a matching <h3>.`);
  process.exit(1);
}
console.log(`assert-faq-jsonld: ${checked} FAQ question(s) match visible page text.`);
