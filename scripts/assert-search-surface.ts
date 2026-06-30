import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { DIST, ensureBuilt } from "./lib/dist.js";
import {
  canonicalUrlForRoute,
  loadRouteContract,
  normalizedSitemapRouteSet,
  routeToDistFile,
} from "./lib/route-contract.js";

const SITE = "https://mysecondcountry.com";
const liveMode = process.argv.includes("--live");
let failures = 0;

function fail(message: string): void {
  console.error(`SEARCH SURFACE  ${message}`);
  failures += 1;
}

function textContent(doc: Document, selector: string): string {
  return doc.querySelector(selector)?.getAttribute("content")?.trim() ?? "";
}

function urlPath(url: string, origin = SITE): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== origin) return null;
    return parsed.pathname;
  } catch {
    return null;
  }
}

function builtFileForUrl(url: string): string | null {
  const pathname = urlPath(url);
  if (!pathname) return null;
  if (pathname === "/") return routeToDistFile("/", DIST);
  if (pathname.endsWith(".json") || pathname.endsWith(".xml") || pathname.endsWith(".txt")) {
    return join(DIST, pathname.replace(/^\/+/, ""));
  }
  return routeToDistFile(pathname.replace(/\/+$/, ""), DIST);
}

async function fetchText(url: string, label: string): Promise<string> {
  try {
    const response = await fetch(url, { redirect: "manual" });
    if (response.status >= 300 && response.status < 400) {
      fail(`${label}: redirects instead of returning 200`);
      return "";
    }
    if (!response.ok) {
      fail(`${label}: returned HTTP ${response.status}`);
      return "";
    }
    return await response.text();
  } catch (error) {
    fail(`${label}: fetch failed: ${String(error)}`);
    return "";
  }
}

async function remoteArtifactExists(url: string): Promise<boolean> {
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "manual" });
    if (response.status === 405) {
      response = await fetch(url, { method: "GET", redirect: "manual" });
    }
    return response.ok;
  } catch {
    return false;
  }
}

async function artifactExistsForUrl(url: string): Promise<boolean> {
  if (liveMode) return remoteArtifactExists(url);
  const builtFile = builtFileForUrl(url);
  return Boolean(builtFile && existsSync(builtFile));
}

async function main(): Promise<void> {
  if (!liveMode) ensureBuilt();

  const sitemapPath = join(DIST, "sitemap.xml");
  if (!liveMode && !existsSync(sitemapPath)) {
    fail("sitemap.xml is missing from the built site");
  }

  const sitemap = liveMode
    ? await fetchText(`${SITE}/sitemap.xml`, "production sitemap.xml")
    : existsSync(sitemapPath)
      ? readFileSync(sitemapPath, "utf8")
      : "";
  const sitemapRouteSet = normalizedSitemapRouteSet(sitemap, SITE);
  for (const loc of sitemapRouteSet.rejectedLocs) {
    fail(`${loc}: sitemap loc must not include query or hash variants`);
  }

  const contract = loadRouteContract();
  for (const entry of contract.routes) {
    if (entry.sitemap && !sitemapRouteSet.routes.has(entry.route)) {
      fail(`${entry.route}: contract marks sitemap=true but sitemap is missing it`);
    }
  }

  for (const route of [...sitemapRouteSet.routes].sort()) {
    const html = liveMode
      ? await fetchText(canonicalUrlForRoute(route, SITE), `${route}: production HTML`)
      : (() => {
          const file = routeToDistFile(route, DIST);
          if (!existsSync(file)) {
            fail(`${route}: sitemap route has no built HTML file`);
            return "";
          }
          return readFileSync(file, "utf8");
        })();
    if (!html) continue;

    const doc = new JSDOM(html).window.document;
    const canonical =
      doc.querySelector('link[rel="canonical"]')?.getAttribute("href")?.trim() ?? "";
    const expectedCanonical = canonicalUrlForRoute(route, SITE);
    if (canonical !== expectedCanonical) {
      fail(`${route}: canonical ${canonical || "(missing)"} should be ${expectedCanonical}`);
    }

    const robots = textContent(doc, 'meta[name="robots"]').toLowerCase();
    if (robots.includes("noindex")) {
      fail(`${route}: sitemap route must not include noindex`);
    }

    const description = textContent(doc, 'meta[name="description"]');
    if (description.length < 50) {
      fail(`${route}: meta description is missing or too thin`);
    }
  }

  const llmsPath = join(DIST, "llms.txt");
  if (!liveMode && !existsSync(llmsPath)) {
    fail("llms.txt is missing from the built site");
  } else {
    const llms = liveMode
      ? await fetchText(`${SITE}/llms.txt`, "production llms.txt")
      : readFileSync(llmsPath, "utf8");
    const urls = [...llms.matchAll(/https:\/\/mysecondcountry\.com[^\s<>)]+/g)].map(([url]) => url);
    for (const url of urls) {
      if (/[.,:;]$/.test(url)) {
        fail(`${url}: llms.txt URL has trailing punctuation`);
        continue;
      }
      if (!urlPath(url)) {
        fail(`${url}: llms.txt URL is not on ${SITE}`);
        continue;
      }
      if (!(await artifactExistsForUrl(url))) {
        fail(`${url}: llms.txt URL does not resolve to a built artifact`);
      }
    }
  }

  if (failures > 0) {
    console.error(`assert-search-surface: ${failures} problem(s).`);
    process.exit(1);
  }

  const scope = liveMode ? "production" : "local build";
  console.log(
    `assert-search-surface: ${sitemapRouteSet.routes.size} ${scope} sitemap route(s) checked.`,
  );
}

main().catch((error) => {
  console.error("assert-search-surface: unexpected error", error);
  process.exit(1);
});
