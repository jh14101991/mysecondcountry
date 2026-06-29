import { describe, expect, it } from "vitest";
import {
  canonicalUrlForRoute,
  hasHumanDiscoverability,
  heldPlaceDossierArtifacts,
  isPubliclyRequired,
  normalizedSitemapRouteSet,
  parseSitemapLocs,
  type RouteContractEntry,
  routeFromCanonicalUrl,
  routeIsHeld,
  routeToDistFile,
  sitemapRoutesMissingFromContract,
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

  it("normalizes sitemap loc values back to contract routes", () => {
    expect(routeFromCanonicalUrl("https://mysecondcountry.com/")).toBe("/");
    expect(routeFromCanonicalUrl("https://mysecondcountry.com/compare/")).toBe("/compare");
    expect(routeFromCanonicalUrl("https://mysecondcountry.com/compare?utm=1")).toBe(null);
    expect(routeFromCanonicalUrl("https://mysecondcountry.com/compare#top")).toBe(null);
    expect(routeFromCanonicalUrl("https://example.com/compare")).toBe(null);
    expect(routeFromCanonicalUrl("not a url")).toBe(null);
  });

  it("builds a normalized sitemap route set from trailing slash locs", () => {
    const sitemap = `
      <urlset>
        <url><loc>https://mysecondcountry.com/sources/</loc></url>
        <url><loc>https://mysecondcountry.com/compare/greece-portugal-spain/</loc></url>
      </urlset>
    `;

    const normalized = normalizedSitemapRouteSet(sitemap);

    expect([...normalized.routes].sort()).toEqual(["/compare/greece-portugal-spain", "/sources"]);
    expect(normalized.rejectedLocs).toEqual([]);
  });

  it("rejects canonical sitemap locs with query or hash variants", () => {
    const sitemap = `
      <urlset>
        <url><loc>https://mysecondcountry.com/sources?utm=qa</loc></url>
        <url><loc>https://mysecondcountry.com/compare#top</loc></url>
        <url><loc>https://example.com/external?utm=qa</loc></url>
      </urlset>
    `;

    const normalized = normalizedSitemapRouteSet(sitemap);

    expect([...normalized.routes]).toEqual([]);
    expect(normalized.rejectedLocs).toEqual([
      "https://mysecondcountry.com/sources?utm=qa",
      "https://mysecondcountry.com/compare#top",
    ]);
  });

  it("finds mysecondcountry sitemap routes missing from the contract", () => {
    const contract = {
      routes: [
        baseEntry,
        methodologyEntry,
        {
          ...baseEntry,
          route: "/",
          surface: "marketing",
          firstAction: "/sources",
          brief: "docs/design/routes/home.md",
        },
      ],
    };

    const sitemap = `
      <urlset>
        <url><loc>https://mysecondcountry.com/</loc></url>
        <url><loc>https://mysecondcountry.com/sources</loc></url>
        <url><loc>https://mysecondcountry.com/about</loc></url>
        <url><loc>https://example.com/external</loc></url>
      </urlset>
    `;

    expect(sitemapRoutesMissingFromContract(sitemap, contract)).toEqual(["/about"]);
  });

  it("finds held routes from the route contract", () => {
    const contract = {
      routes: [
        baseEntry,
        methodologyEntry,
        { ...baseEntry, route: "/places/greece/crete/chania", status: "held" as const },
      ],
    };

    expect(routeIsHeld(contract, "/places/greece/crete/chania")).toBe(true);
    expect(routeIsHeld(contract, "/sources")).toBe(false);
    expect(routeIsHeld(contract, "/missing")).toBe(false);
  });

  it("detects full dossier artifacts in held place HTML", () => {
    const cleanHeldHtml = `
      <article class="held-coverage">
        <h1>Chania</h1>
        <p>Coverage held, publication gate active</p>
      </article>
    `;
    const fullDossierHtml = `
      <script type="application/ld+json">{"@id":"https://mysecondcountry.com/x#dataset","variableMeasured":[]}</script>
      <table class="facts-table"></table>
      <h2>Sources on this page</h2>
      <div id="screening-island"></div>
      <section class="cta-section"><h2>Find where you fit, on the evidence.</h2></section>
    `;

    expect(heldPlaceDossierArtifacts(cleanHeldHtml)).toEqual([]);
    expect(heldPlaceDossierArtifacts(fullDossierHtml)).toEqual([
      "Dataset JSON-LD #dataset",
      "Dataset JSON-LD variableMeasured",
      "facts-table",
      "Sources on this page",
      "screening-island",
      "normal dossier CTA",
    ]);
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
