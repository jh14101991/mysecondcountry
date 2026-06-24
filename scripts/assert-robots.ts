// DOD (e): robots.txt must name and allow the known AI crawlers and point to the sitemap.

import { existsSync, readFileSync } from "node:fs";

const ROBOTS = "packages/web/dist/robots.txt";

if (!existsSync(ROBOTS)) {
  console.error(`${ROBOTS} not found. Run the build first.`);
  process.exit(1);
}

const txt = readFileSync(ROBOTS, "utf8");
const required = ["GPTBot", "ClaudeBot", "PerplexityBot", "OAI-SearchBot", "Google-Extended"];

let failures = 0;
for (const ua of required) {
  if (!new RegExp(`User-agent:\\s*${ua}\\b`, "i").test(txt)) {
    console.error(`robots.txt missing "User-agent: ${ua}"`);
    failures += 1;
  }
}
if (!/^\s*Sitemap:\s*https?:\/\//im.test(txt)) {
  console.error("robots.txt missing a Sitemap: directive");
  failures += 1;
}

if (failures > 0) {
  console.error(`\nassert-robots: ${failures} problem(s).`);
  process.exit(1);
}
console.log("assert-robots: all named AI crawlers allowed and sitemap declared.");
