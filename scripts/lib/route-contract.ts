import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export type RouteStatus = "live" | "held" | "planned" | "internal";
export type RouteSurface =
  | "marketing"
  | "product"
  | "evidence"
  | "hub"
  | "coverage"
  | "legal"
  | "trust";

export interface RouteContractEntry {
  route: string;
  status: RouteStatus;
  surface: RouteSurface;
  discoverability: string[];
  sitemap: boolean;
  firstAction: string;
  brief: string;
  gate?: string;
}

export interface RouteContract {
  schemaVersion: number;
  updatedAt: string;
  primaryNav: string[];
  routes: RouteContractEntry[];
}

const routeStatuses = new Set<RouteStatus>(["live", "held", "planned", "internal"]);
const routeSurfaces = new Set<RouteSurface>([
  "marketing",
  "product",
  "evidence",
  "hub",
  "coverage",
  "legal",
  "trust",
]);

function defaultRouteContractPath(): string {
  const cwd = process.cwd();
  const primary = join(cwd, "docs/design/routes.json");
  const candidates = [
    primary,
    join(cwd, "../docs/design/routes.json"),
    join(cwd, "../../docs/design/routes.json"),
    fileURLToPath(new URL("../../docs/design/routes.json", import.meta.url)),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? primary;
}

export const DEFAULT_ROUTE_CONTRACT_PATH = defaultRouteContractPath();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function assertRoutePath(value: unknown, label: string): string {
  const route = assertString(value, `${label}: route`);
  if (!route.startsWith("/")) {
    throw new Error(`${label}: route must start with /`);
  }
  if (route.includes("?") || route.includes("#") || route.includes("//") || route.includes("..")) {
    throw new Error(`${label}: route must not include query, hash, //, or ..`);
  }
  return route;
}

export function validateRouteContract(contract: unknown): RouteContract {
  if (!isRecord(contract)) {
    throw new Error("Route contract must be an object");
  }
  if (contract.schemaVersion !== 1) {
    throw new Error(`Unsupported route contract schemaVersion: ${contract.schemaVersion}`);
  }
  const updatedAt = assertString(contract.updatedAt, "updatedAt");
  if (
    !Array.isArray(contract.primaryNav) ||
    !contract.primaryNav.every((route) => typeof route === "string")
  ) {
    throw new Error("primaryNav must be a string array");
  }
  if (!Array.isArray(contract.routes)) {
    throw new Error("routes must be an array");
  }

  const routes = contract.routes.map((rawEntry, index): RouteContractEntry => {
    if (!isRecord(rawEntry)) {
      throw new Error(`routes[${index}] must be an object`);
    }

    const route = assertRoutePath(rawEntry.route, String(rawEntry.route ?? `routes[${index}]`));
    const status = assertString(rawEntry.status, `${route}: status`);
    if (!routeStatuses.has(status as RouteStatus)) {
      throw new Error(`${route}: invalid status ${status}`);
    }
    const surface = assertString(rawEntry.surface, `${route}: surface`);
    if (!routeSurfaces.has(surface as RouteSurface)) {
      throw new Error(`${route}: invalid surface ${surface}`);
    }
    if (
      !Array.isArray(rawEntry.discoverability) ||
      !rawEntry.discoverability.every((channel) => typeof channel === "string")
    ) {
      throw new Error(`${route}: discoverability must be a string array`);
    }
    if (typeof rawEntry.sitemap !== "boolean") {
      throw new Error(`${route}: sitemap must be a boolean`);
    }
    const firstAction = assertRoutePath(rawEntry.firstAction, `${route}: firstAction`);
    const brief = assertString(rawEntry.brief, `${route}: brief`);
    if (rawEntry.gate !== undefined && typeof rawEntry.gate !== "string") {
      throw new Error(`${route}: gate must be a string when present`);
    }

    return {
      route,
      status: status as RouteStatus,
      surface: surface as RouteSurface,
      discoverability: rawEntry.discoverability,
      sitemap: rawEntry.sitemap,
      firstAction,
      brief,
      ...(rawEntry.gate === undefined ? {} : { gate: rawEntry.gate }),
    };
  });

  const routeSet = new Set<string>();
  for (const entry of routes) {
    if (routeSet.has(entry.route)) {
      throw new Error(`${entry.route}: duplicate route`);
    }
    routeSet.add(entry.route);
  }

  const primaryNav = contract.primaryNav.map((route) => assertRoutePath(route, route));
  for (const route of primaryNav) {
    if (!routeSet.has(route)) {
      throw new Error(`${route}: primaryNav route not present in contract`);
    }
  }
  for (const entry of routes) {
    if (!routeSet.has(entry.firstAction)) {
      throw new Error(
        `${entry.route}: firstAction target ${entry.firstAction} is not present in contract`,
      );
    }
  }

  return {
    schemaVersion: 1,
    updatedAt,
    primaryNav,
    routes,
  };
}

export function loadRouteContract(path = DEFAULT_ROUTE_CONTRACT_PATH): RouteContract {
  const raw = readFileSync(path, "utf8");
  return validateRouteContract(JSON.parse(raw));
}

export function canonicalUrlForRoute(
  route: string,
  origin = "https://mysecondcountry.com",
): string {
  return `${origin.replace(/\/+$/, "")}${route}`;
}

export function parseSitemapLocs(sitemap: string): Set<string> {
  const locPattern = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  return new Set(
    Array.from(sitemap.matchAll(locPattern), (match) => match[1]?.trim()).filter(
      (loc): loc is string => loc !== undefined,
    ),
  );
}

function canonicalVariantLoc(loc: string, origin: string): string | null {
  const expectedOrigin = origin.replace(/\/+$/, "");
  try {
    const url = new URL(loc);
    if (url.origin === expectedOrigin && (url.search || url.hash)) return loc;
  } catch {
    return null;
  }
  return null;
}

export function routeFromCanonicalUrl(
  loc: string,
  origin = "https://mysecondcountry.com",
): string | null {
  const expectedOrigin = origin.replace(/\/+$/, "");
  let url: URL;
  try {
    url = new URL(loc);
  } catch {
    return null;
  }
  if (url.origin !== expectedOrigin) return null;
  if (url.search || url.hash) return null;
  if (url.pathname === "/") return "/";
  return url.pathname.replace(/\/+$/, "");
}

export interface NormalizedSitemapRouteSet {
  routes: Set<string>;
  rejectedLocs: string[];
}

export function normalizedSitemapRouteSet(
  sitemap: string,
  origin = "https://mysecondcountry.com",
): NormalizedSitemapRouteSet {
  const routes = new Set<string>();
  const rejectedLocs: string[] = [];
  for (const loc of parseSitemapLocs(sitemap)) {
    const rejected = canonicalVariantLoc(loc, origin);
    if (rejected) {
      rejectedLocs.push(rejected);
      continue;
    }

    const route = routeFromCanonicalUrl(loc, origin);
    if (route) routes.add(route);
  }
  return { routes, rejectedLocs };
}

export function sitemapRoutesMissingFromContract(
  sitemap: string,
  contract: Pick<RouteContract, "routes">,
  origin = "https://mysecondcountry.com",
): string[] {
  const contractRoutes = new Set(contract.routes.map((entry) => entry.route));
  const missingRoutes = new Set<string>();
  for (const route of normalizedSitemapRouteSet(sitemap, origin).routes) {
    if (!contractRoutes.has(route)) missingRoutes.add(route);
  }
  return [...missingRoutes].sort();
}

export function routeIsHeld(contract: Pick<RouteContract, "routes">, route: string): boolean {
  return contract.routes.some((entry) => entry.route === route && entry.status === "held");
}

const heldPlaceDossierArtifactChecks: { label: string; pattern: RegExp }[] = [
  { label: "Dataset JSON-LD #dataset", pattern: /#dataset/ },
  { label: "Dataset JSON-LD variableMeasured", pattern: /variableMeasured/ },
  { label: "facts-table", pattern: /<table[^>]*\bfacts-table\b/ },
  { label: "place-data-table", pattern: /<table[^>]*\bplace-data-table\b/ },
  { label: "Sources on this page", pattern: /Sources on this page/ },
  { label: "screening-island", pattern: /screening-island/ },
  {
    label: "normal dossier CTA",
    pattern: /class="[^"]*\bcta-section\b|Find where you fit,\s*on the evidence\./,
  },
];

export function heldPlaceDossierArtifacts(html: string): string[] {
  return heldPlaceDossierArtifactChecks
    .filter((check) => check.pattern.test(html))
    .map((check) => check.label);
}

export function routeToDistFile(route: string, distRoot = "packages/web/dist"): string {
  if (route === "/") return join(distRoot, "index.html");
  return join(distRoot, route.replace(/^\/+/, "").replace(/\/+$/, ""), "index.html");
}

export function routeIsBuilt(route: string, distRoot = "packages/web/dist"): boolean {
  return existsSync(routeToDistFile(route, distRoot));
}

export function routeBriefExists(entry: RouteContractEntry): boolean {
  return existsSync(entry.brief);
}

export function isPubliclyRequired(entry: RouteContractEntry): boolean {
  return entry.status === "live" || entry.status === "held";
}

export function hasHumanDiscoverability(entry: RouteContractEntry): boolean {
  const humanChannels = new Set([
    "primaryNav",
    "homepage",
    "footer",
    "answers",
    "compare",
    "guides",
    "shortlists",
    "sources",
    "places",
    "tax",
    "topics",
    "tools",
    "related",
  ]);
  return entry.discoverability.some((channel) => humanChannels.has(channel));
}
