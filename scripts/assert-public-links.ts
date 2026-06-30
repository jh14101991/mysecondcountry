import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const distRoot = join(process.cwd(), "packages/web/dist");
const htmlPaths = htmlFiles().filter(
  (file) => !file.includes("/ops/") && !file.endsWith("/styleguide/index.html"),
);

function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href) || href.startsWith("//");
}

function isAsset(href: string): boolean {
  return /\.(png|jpg|jpeg|webp|svg|ico|json|xml|txt|webmanifest|css|js|pdf)$/i.test(href);
}

function routeExists(href: string): boolean {
  const clean = href.split("#")[0]?.split("?")[0] ?? "";
  if (clean === "" || clean === "/") return existsSync(join(distRoot, "index.html"));
  const withoutSlash = clean.replace(/^\/+/, "").replace(/\/+$/, "");
  if (isAsset(withoutSlash)) return existsSync(join(distRoot, withoutSlash));
  const htmlFile = join(distRoot, withoutSlash, "index.html");
  const directFile = join(distRoot, withoutSlash);
  return existsSync(htmlFile) || (existsSync(directFile) && statSync(directFile).isFile());
}

let failures = 0;

for (const file of htmlPaths) {
  const html = read(file);
  const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1] ?? "");
  for (const href of hrefs) {
    if (href === "#") {
      console.error(`DEAD HASH LINK ${rel(file)}`);
      failures += 1;
      continue;
    }
    if (href.startsWith("#") || isExternal(href)) continue;
    if (!routeExists(href)) {
      console.error(`BROKEN INTERNAL LINK ${rel(file)} -> ${href}`);
      failures += 1;
    }
  }
}

const sitemapPath = join(distRoot, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  console.error("MISSING sitemap.xml");
  failures += 1;
} else {
  const sitemap = readFileSync(sitemapPath, "utf8");
  for (const route of ["/guides", "/places", "/privacy", "/terms", "/methodology", "/sources"]) {
    if (!sitemap.includes(`https://mysecondcountry.com${route}`)) {
      console.error(`SITEMAP MISSING ${route}`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`assert-public-links: ${failures} problem(s).`);
  process.exit(1);
}

console.log(
  `assert-public-links: ${htmlPaths.length} HTML page(s) checked, no broken public links.`,
);
