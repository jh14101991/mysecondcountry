import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canonicalUrlForRoute,
  hasHumanDiscoverability,
  heldPlaceDossierArtifacts,
  isPubliclyRequired,
  loadRouteContract,
  normalizedSitemapRouteSet,
  routeBriefExists,
  routeIsBuilt,
  routeToDistFile,
  sitemapRoutesMissingFromContract,
} from "./lib/route-contract.js";

const distRoot = "packages/web/dist";
const contract = loadRouteContract();
let failures = 0;

function fail(message: string): void {
  console.error(`ROUTE CONTRACT  ${message}`);
  failures += 1;
}

if (!existsSync(distRoot)) {
  fail(`${distRoot} not found. Run corepack pnpm --filter @where/web build first.`);
}

const sitemapPath = join(distRoot, "sitemap.xml");
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : "";
if (!sitemap) fail("sitemap.xml is missing from the built site.");
const sitemapRouteSet = normalizedSitemapRouteSet(sitemap);
for (const loc of sitemapRouteSet.rejectedLocs) {
  fail(`${loc}: sitemap loc must not include query or hash variants`);
}
const sitemapRoutesMissingFromContractList = sitemapRoutesMissingFromContract(sitemap, contract);
for (const route of sitemapRoutesMissingFromContractList) {
  fail(`${route}: sitemap route missing from docs/design/routes.json`);
}

for (const entry of contract.routes) {
  if (!entry.route.startsWith("/")) fail(`${entry.route}: route must start with /`);
  if (!entry.firstAction.startsWith("/")) fail(`${entry.route}: firstAction must start with /`);
  if (!routeBriefExists(entry)) fail(`${entry.route}: brief missing at ${entry.brief}`);

  if (isPubliclyRequired(entry)) {
    if (!routeIsBuilt(entry.route))
      fail(`${entry.route}: status ${entry.status} but route is not built`);
    if (!hasHumanDiscoverability(entry)) {
      fail(`${entry.route}: public route has no human discoverability channel`);
    }
  }

  if (entry.status === "planned" && routeIsBuilt(entry.route)) {
    fail(`${entry.route}: route is built but contract still says planned`);
  }

  const canonical = canonicalUrlForRoute(entry.route);
  if (entry.sitemap && !sitemapRouteSet.routes.has(entry.route)) {
    fail(`${entry.route}: sitemap missing ${canonical}`);
  }
  if (!entry.sitemap && sitemapRouteSet.routes.has(entry.route)) {
    fail(`${entry.route}: sitemap includes route marked sitemap=false`);
  }

  if (entry.status === "held" && entry.route.startsWith("/places/") && routeIsBuilt(entry.route)) {
    const html = readFileSync(routeToDistFile(entry.route, distRoot), "utf8");
    for (const artifact of heldPlaceDossierArtifacts(html)) {
      fail(`${entry.route}: held place route contains full dossier artifact: ${artifact}`);
    }
  }
}

for (const route of contract.primaryNav) {
  const entry = contract.routes.find((candidate) => candidate.route === route);
  if (!entry) {
    fail(`${route}: primaryNav route not present in contract`);
    continue;
  }
  if (!isPubliclyRequired(entry)) {
    fail(`${route}: primaryNav route must be live or held, found ${entry.status}`);
  }
}

if (failures > 0) {
  console.error(`assert-route-contract: ${failures} problem(s).`);
  process.exit(1);
}

console.log(`assert-route-contract: ${contract.routes.length} route(s) checked.`);
