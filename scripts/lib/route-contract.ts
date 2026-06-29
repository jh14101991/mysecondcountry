import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

export function loadRouteContract(path = "docs/design/routes.json"): RouteContract {
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
  return new Set(Array.from(sitemap.matchAll(locPattern), ([, loc]) => loc.trim()));
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
    "guides",
    "sources",
    "places",
    "related",
  ]);
  return entry.discoverability.some((channel) => humanChannels.has(channel));
}
