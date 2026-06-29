import { describe, expect, it } from "vitest";
import {
  canonicalUrlForRoute,
  hasHumanDiscoverability,
  isPubliclyRequired,
  parseSitemapLocs,
  type RouteContractEntry,
  routeToDistFile,
  validateRouteContract,
} from "../lib/route-contract.js";

const baseEntry: RouteContractEntry = {
  route: "/sources",
  status: "live",
  surface: "evidence",
  discoverability: ["primaryNav", "footer", "sitemap"],
  sitemap: true,
  firstAction: "/methodology",
  brief: "docs/design/routes/sources-methodology.md",
};

const methodologyEntry: RouteContractEntry = {
  ...baseEntry,
  route: "/methodology",
  discoverability: ["guides", "sources", "footer", "sitemap"],
  firstAction: "/sources",
};

describe("route contract helpers", () => {
  it("maps root and nested routes to Astro dist files", () => {
    expect(routeToDistFile("/")).toBe("packages/web/dist/index.html");
    expect(routeToDistFile("/compare/greece-portugal-spain")).toBe(
      "packages/web/dist/compare/greece-portugal-spain/index.html",
    );
  });

  it("treats live and held routes as public requirements", () => {
    expect(isPubliclyRequired(baseEntry)).toBe(true);
    expect(isPubliclyRequired({ ...baseEntry, status: "held" })).toBe(true);
    expect(isPubliclyRequired({ ...baseEntry, status: "planned" })).toBe(false);
    expect(isPubliclyRequired({ ...baseEntry, status: "internal" })).toBe(false);
  });

  it("requires at least one human discoverability channel", () => {
    expect(hasHumanDiscoverability(baseEntry)).toBe(true);
    expect(hasHumanDiscoverability({ ...baseEntry, discoverability: ["sitemap"] })).toBe(false);
    expect(hasHumanDiscoverability({ ...baseEntry, discoverability: ["planned"] })).toBe(false);
  });

  it("parses exact sitemap loc values without substring matches", () => {
    const sitemapLocs = parseSitemapLocs(`
      <urlset>
        <url><loc>https://mysecondcountry.com/</loc></url>
        <url><loc>https://mysecondcountry.com/compare/greece-portugal-spain</loc></url>
        <url><loc>https://mysecondcountry.com/sources</loc></url>
      </urlset>
    `);

    expect(canonicalUrlForRoute("/")).toBe("https://mysecondcountry.com/");
    expect(sitemapLocs.has(canonicalUrlForRoute("/"))).toBe(true);
    expect(sitemapLocs.has(canonicalUrlForRoute("/compare/greece-portugal-spain"))).toBe(true);
    expect(sitemapLocs.has(canonicalUrlForRoute("/compare"))).toBe(false);
  });

  it("validates route contract structure", () => {
    const validContract = {
      schemaVersion: 1,
      updatedAt: "2026-06-29",
      primaryNav: ["/sources"],
      routes: [baseEntry, methodologyEntry],
    };

    expect(validateRouteContract(validContract)).toEqual(validContract);
  });

  it("rejects malformed routes and missing references", () => {
    const validContract = {
      schemaVersion: 1,
      updatedAt: "2026-06-29",
      primaryNav: ["/sources"],
      routes: [baseEntry, methodologyEntry],
    };

    expect(() =>
      validateRouteContract({
        ...validContract,
        routes: [{ ...baseEntry, route: "/compare?draft=true" }, methodologyEntry],
      }),
    ).toThrow("route must not include query, hash, //, or ..");

    expect(() =>
      validateRouteContract({
        ...validContract,
        routes: [{ ...baseEntry, firstAction: "/missing" }, methodologyEntry],
      }),
    ).toThrow("/sources: firstAction target /missing is not present in contract");
  });
});
