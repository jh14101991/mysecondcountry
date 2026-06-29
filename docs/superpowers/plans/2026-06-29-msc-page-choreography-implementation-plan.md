# MSC Page Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the page choreography and anti-slop spec into a route contract, route briefs, rendered QA, missing route cleanup, and a minimum-sufficient-information pass across the current MSC public surfaces.

**Architecture:** Build a route-level governance layer first, then improve pages against that contract. Do not start from components. The first execution slices add route metadata, public-route checks, route briefs, and visual QA, then apply the homepage and flow cleanup using the v5 Broadsheet Ledger system already in `packages/web`.

**Tech Stack:** pnpm workspace, Astro static site in `packages/web`, TypeScript scripts under `scripts`, Vitest, existing `verify:build` guards, Playwright only if added for rendered QA, v5 CSS in `packages/web/src/styles/system.css`, and cited data from `packages/data`.

---

## Current constraints

- The source spec is `docs/superpowers/specs/2026-06-29-msc-page-choreography-and-anti-slop.md`.
- The active visual source map is `docs/design/README.md`.
- v5 Broadsheet Ledger remains the active system.
- The primary nav stays compact: `Compare`, `Shortlists`, `Guides`, `Sources`, `Build my shortlist`.
- The homepage follows the minimum-sufficient-information rule: one promise, one proof object, one next action, compact source cues, deeper proof one click lower.
- The Chania dossier template build remains blocked until Data Desk promotes both `gr-crete-region` and `gr-crete-chania` to `data_bundle_ready` with publish recommendation, or Command Center records an explicit override.
- The repo is dirty. Stage with tight pathspecs only.

## File map

### New reference files

- `docs/design/routes.json`: machine-readable route contract.
- `docs/design/routes/README.md`: route brief index.
- `docs/design/routes/home.md`: homepage route brief.
- `docs/design/routes/screener.md`: screener route brief.
- `docs/design/routes/compare.md`: compare route brief.
- `docs/design/routes/shortlists.md`: shortlists route brief.
- `docs/design/routes/guides.md`: guides and answer corridors route brief.
- `docs/design/routes/sources-methodology.md`: sources and methodology route brief.
- `docs/design/routes/places.md`: places and Chania gate route brief.
- `docs/design/routes/legal.md`: privacy, terms, affiliate disclosure, screening notice route brief.

### New verification files

- `scripts/assert-route-contract.ts`: verifies that public routes are discoverable from the product map, footer, hub, related routes, or a documented planned state.
- `scripts/visual-qa-page-choreography.ts`: captures rendered proof for key routes and checks reveal, overflow, mobile nav, reduced motion, and no-JS content visibility.
- `scripts/__tests__/assert-route-contract.test.ts`: unit tests the route-contract helper functions.
- `scripts/lib/route-contract.ts`: typed route contract loader and helpers.

### Modified files

- `package.json`: add `verify:routes` in Task 1 and `qa:visual` in Task 3.
- `packages/web/src/layouts/Base.astro`: footer links for about, screening notice, and route contract alignment.
- `packages/web/src/pages/sitemap.xml.ts`: include new public routes.
- `packages/web/src/pages/index.astro`: homepage minimum-sufficient-information pass.
- `packages/web/src/pages/screener.astro`: screener progressive-disclosure pass.
- `packages/web/src/pages/compare/greece-portugal-spain.astro`: compare progressive-disclosure pass.
- `packages/web/src/pages/sources.astro`: source passport pass.
- `packages/web/src/pages/methodology.astro`: method page pass.
- `packages/web/src/pages/guides.astro`: hub grouping pass.
- `packages/web/src/pages/places/index.astro`: readiness state pass.
- `packages/web/src/pages/shortlists/index.astro`: shortlist contract pass.
- `packages/web/src/pages/privacy.astro`, `terms.astro`, `affiliate-disclosure.astro`: legal route-link pass.
- New pages: `packages/web/src/pages/about.astro`, `packages/web/src/pages/compare/index.astro`, `packages/web/src/pages/screening-notice.astro`.

## Task 1: Preserve the spec and establish the route contract

**Files:**

- Read: `docs/superpowers/specs/2026-06-29-msc-page-choreography-and-anti-slop.md`
- Create: `docs/design/routes.json`
- Create: `scripts/lib/route-contract.ts`
- Create: `scripts/assert-route-contract.ts`
- Create: `scripts/__tests__/assert-route-contract.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Confirm current branch and dirty tree**

Run:

```bash
git branch --show-current
git status --short
```

Expected:

- You are on the current MSC working branch.
- The tree is dirty.
- Do not stage anything at this step.

- [ ] **Step 2: Create `docs/design/routes.json`**

Create `docs/design/routes.json` with this exact content:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-06-29",
  "primaryNav": [
    "/compare/greece-portugal-spain",
    "/shortlists",
    "/guides",
    "/sources",
    "/screener"
  ],
  "routes": [
    {
      "route": "/",
      "status": "live",
      "surface": "marketing",
      "discoverability": ["primaryNav", "footer", "sitemap"],
      "sitemap": true,
      "firstAction": "/screener",
      "brief": "docs/design/routes/home.md"
    },
    {
      "route": "/screener",
      "status": "live",
      "surface": "product",
      "discoverability": ["primaryNav", "homepage", "footer", "sitemap"],
      "sitemap": true,
      "firstAction": "/compare/greece-portugal-spain",
      "brief": "docs/design/routes/screener.md"
    },
    {
      "route": "/compare",
      "status": "planned",
      "surface": "hub",
      "discoverability": ["planned"],
      "sitemap": false,
      "firstAction": "/compare/greece-portugal-spain",
      "brief": "docs/design/routes/compare.md"
    },
    {
      "route": "/compare/greece-portugal-spain",
      "status": "live",
      "surface": "evidence",
      "discoverability": ["primaryNav", "homepage", "sitemap", "related"],
      "sitemap": true,
      "firstAction": "/screener",
      "brief": "docs/design/routes/compare.md"
    },
    {
      "route": "/shortlists",
      "status": "live",
      "surface": "hub",
      "discoverability": ["primaryNav", "footer", "sitemap"],
      "sitemap": true,
      "firstAction": "/screener",
      "brief": "docs/design/routes/shortlists.md"
    },
    {
      "route": "/guides",
      "status": "live",
      "surface": "hub",
      "discoverability": ["primaryNav", "footer", "sitemap"],
      "sitemap": true,
      "firstAction": "/sources",
      "brief": "docs/design/routes/guides.md"
    },
    {
      "route": "/sources",
      "status": "live",
      "surface": "evidence",
      "discoverability": ["primaryNav", "footer", "sitemap", "related"],
      "sitemap": true,
      "firstAction": "/methodology",
      "brief": "docs/design/routes/sources-methodology.md"
    },
    {
      "route": "/methodology",
      "status": "live",
      "surface": "evidence",
      "discoverability": ["guides", "sources", "footer", "sitemap"],
      "sitemap": true,
      "firstAction": "/sources",
      "brief": "docs/design/routes/sources-methodology.md"
    },
    {
      "route": "/places",
      "status": "live",
      "surface": "hub",
      "discoverability": ["homepage", "footer", "sitemap", "related"],
      "sitemap": true,
      "firstAction": "/places/greece/crete/chania",
      "brief": "docs/design/routes/places.md"
    },
    {
      "route": "/places/greece/crete/chania",
      "status": "held",
      "surface": "coverage",
      "discoverability": ["places", "sitemap"],
      "sitemap": true,
      "firstAction": "/sources",
      "brief": "docs/design/routes/places.md",
      "gate": "Chania is coverage-only until Data Desk clears gr-crete-region and gr-crete-chania."
    },
    {
      "route": "/privacy",
      "status": "live",
      "surface": "legal",
      "discoverability": ["footer", "sitemap"],
      "sitemap": true,
      "firstAction": "/terms",
      "brief": "docs/design/routes/legal.md"
    },
    {
      "route": "/terms",
      "status": "live",
      "surface": "legal",
      "discoverability": ["footer", "sitemap"],
      "sitemap": true,
      "firstAction": "/privacy",
      "brief": "docs/design/routes/legal.md"
    },
    {
      "route": "/affiliate-disclosure",
      "status": "live",
      "surface": "legal",
      "discoverability": ["footer", "sources", "sitemap"],
      "sitemap": true,
      "firstAction": "/sources",
      "brief": "docs/design/routes/legal.md"
    },
    {
      "route": "/about",
      "status": "planned",
      "surface": "trust",
      "discoverability": ["planned"],
      "sitemap": false,
      "firstAction": "/methodology",
      "brief": "docs/design/routes/legal.md"
    },
    {
      "route": "/screening-notice",
      "status": "planned",
      "surface": "legal",
      "discoverability": ["planned"],
      "sitemap": false,
      "firstAction": "/sources",
      "brief": "docs/design/routes/legal.md"
    }
  ]
}
```

- [ ] **Step 3: Create `scripts/lib/route-contract.ts`**

Create `scripts/lib/route-contract.ts` with this code:

```ts
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

export function loadRouteContract(path = "docs/design/routes.json"): RouteContract {
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as RouteContract;
  if (parsed.schemaVersion !== 1) {
    throw new Error(`Unsupported route contract schemaVersion: ${parsed.schemaVersion}`);
  }
  return parsed;
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
  const humanChannels = new Set(["primaryNav", "homepage", "footer", "guides", "sources", "places", "related"]);
  return entry.discoverability.some((channel) => humanChannels.has(channel));
}
```

- [ ] **Step 4: Create `scripts/assert-route-contract.ts`**

Create `scripts/assert-route-contract.ts` with this code:

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  hasHumanDiscoverability,
  isPubliclyRequired,
  loadRouteContract,
  routeBriefExists,
  routeIsBuilt,
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

for (const entry of contract.routes) {
  if (!entry.route.startsWith("/")) fail(`${entry.route}: route must start with /`);
  if (!entry.firstAction.startsWith("/")) fail(`${entry.route}: firstAction must start with /`);
  if (!routeBriefExists(entry)) fail(`${entry.route}: brief missing at ${entry.brief}`);

  if (isPubliclyRequired(entry)) {
    if (!routeIsBuilt(entry.route)) fail(`${entry.route}: status ${entry.status} but route is not built`);
    if (!hasHumanDiscoverability(entry)) {
      fail(`${entry.route}: public route has no human discoverability channel`);
    }
  }

  if (entry.status === "planned" && routeIsBuilt(entry.route)) {
    fail(`${entry.route}: route is built but contract still says planned`);
  }

  const canonical = `https://mysecondcountry.com${entry.route === "/" ? "" : entry.route}`;
  if (entry.sitemap && !sitemap.includes(canonical)) {
    fail(`${entry.route}: sitemap missing ${canonical}`);
  }
  if (!entry.sitemap && sitemap.includes(canonical)) {
    fail(`${entry.route}: sitemap includes route marked sitemap=false`);
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
```

- [ ] **Step 5: Create `scripts/__tests__/assert-route-contract.test.ts`**

Create `scripts/__tests__/assert-route-contract.test.ts` with this code:

```ts
import { describe, expect, it } from "vitest";
import {
  hasHumanDiscoverability,
  isPubliclyRequired,
  routeToDistFile,
  type RouteContractEntry,
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
});
```

- [ ] **Step 6: Add the route script to `package.json`**

Modify the root `package.json` scripts block so it includes:

```json
"verify:routes": "tsx scripts/assert-route-contract.ts"
```

Keep existing scripts. After this step, the relevant section should include:

```json
"verify:build": "tsx scripts/assert-fence.ts && tsx scripts/assert-fence-before-claim.ts && tsx scripts/assert-h1-count.ts && tsx scripts/assert-table-semantics.ts && tsx scripts/assert-confidence-marks.ts && tsx scripts/assert-no-em-dashes.ts && tsx scripts/assert-no-individualised-copy.ts && tsx scripts/validate-jsonld.ts && tsx scripts/assert-date-modified.ts && tsx scripts/assert-faq-jsonld.ts && tsx scripts/assert-robots.ts && tsx scripts/check-a11y.ts",
"verify:links": "tsx scripts/assert-public-links.ts",
"verify:routes": "tsx scripts/assert-route-contract.ts",
```

- [ ] **Step 7: Run route helper tests**

Run:

```bash
corepack pnpm test -- scripts/__tests__/assert-route-contract.test.ts
```

Expected:

- The new helper tests pass.

- [ ] **Step 8: Commit Task 1**

Run:

```bash
git add docs/design/routes.json scripts/lib/route-contract.ts scripts/assert-route-contract.ts scripts/__tests__/assert-route-contract.test.ts package.json
git diff --cached --stat
git commit -m "test(web): add MSC route contract gate"
```

Expected:

- Only the route contract, helper, assertion script, tests, and package script changes are committed.

## Task 2: Create route briefs for the current public surfaces

**Files:**

- Create: `docs/design/routes/README.md`
- Create: `docs/design/routes/home.md`
- Create: `docs/design/routes/screener.md`
- Create: `docs/design/routes/compare.md`
- Create: `docs/design/routes/shortlists.md`
- Create: `docs/design/routes/guides.md`
- Create: `docs/design/routes/sources-methodology.md`
- Create: `docs/design/routes/places.md`
- Create: `docs/design/routes/legal.md`

- [ ] **Step 1: Create `docs/design/routes/README.md`**

Create `docs/design/routes/README.md` with this content:

```markdown
# My Second Country route briefs

This folder holds route briefs for the active public page system. It is a reference folder, not a process document.

Every brief follows the same rule: minimum sufficient information first, deeper evidence one click lower.

The route contract is `docs/design/routes.json`.
The governing spec is `docs/superpowers/specs/2026-06-29-msc-page-choreography-and-anti-slop.md`.

Chania dossier implementation is blocked until Data Desk clears the bundle handoff.
```

- [ ] **Step 2: Create `docs/design/routes/home.md`**

Create `docs/design/routes/home.md` with this content:

```markdown
# Route brief: homepage

Date: 2026-06-29
Owner: MSC Design Desk
Route: `/`
Status: live, cleanup required
Primary reader: internationally mobile person deciding whether MSC is worth using
Reader moment: they distrust stale relocation advice and want a clearer first screen
Main question: can this product help me compare places without pretending to advise me?
Product job: explain the engine and route to screener, compare, sources, or places
Business job: make the product legible enough to earn the first click
Data state: public proof glimpses only
Fence state: visible because the page references cost, tax, residency, and screening
Primary next action: `/screener`
Secondary next action: `/compare/greece-portugal-spain`

## Page spine

1. First viewport: one promise and one live product artifact.
2. Fence or boundary: compact screening-not-advice cue above the first claim.
3. First proof object: one cited comparison or shortlist artifact, not a table.
4. Interpretation: one problem beat about stale, uncited relocation numbers.
5. Source trail: compact source cue with link to `/sources`.
6. Gap or caveat: held pages and source gaps route to `/places` or `/sources`.
7. Next action: build a shortlist.

## Evidence contract

- Values shown: no more than one prominent proof object per section.
- Source display: compact cue only, with deeper source trail linked.
- Verified date display: shown where a number appears.
- Confidence display: shown where a number appears.
- Granularity display: shown only where a location-specific claim appears.
- Gap display: do not present Chania as a finished dossier.
- Machine-readable output: homepage metadata and canonical only.

## Visual register

- Surface type: marketing editorial.
- Primary hierarchy move: one large promise and a stable product artifact.
- Allowed image or engraving use: hero and final bands only.
- Components allowed: nav, CTA, proof artifact, open-file links.
- Components banned: full comparison table, full methodology, full dossier matrix.
- Motion allowed: restrained brand reveal, no content hidden forever.

## Discoverability

- Primary nav: yes.
- Footer: yes.
- Hub: not required.
- Related routes: screener, compare, sources, places.
- Sitemap: yes.

## Rendered proof required

- Desktop viewport: first screen and middle proof sections.
- Tablet viewport: no orphaned proof object or overflow.
- Mobile viewport: first promise, proof cue, and CTA visible without crowding.
- Scroll-state proof: no blank bands after scrolling.
- Reduced-motion proof: all content visible.
- No-JS or JS-failure proof: content and CTAs visible.
- Accessibility check: landmarks, h1, alt, focus states.
- Link check: no `href="#"`.

## Risks

- Data risk: source detail may appear too dense for homepage.
- Fence risk: compact cue must not become hidden fine print.
- UX risk: every section trying to prove the full product.
- Launch risk: linking to held Chania as if it is finished.
```

- [ ] **Step 3: Create `docs/design/routes/screener.md`**

Create `docs/design/routes/screener.md` with this content:

```markdown
# Route brief: screener

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/screener`
Status: live, cleanup required
Primary reader: person ready to enter constraints
Reader moment: they want a shortlist without receiving advice
Main question: what places match the criteria I chose, based on published facts?
Product job: capture minimum useful inputs and show source-backed results
Business job: create the first product habit and evidence of demand
Data state: uses current country and corridor data, not Chania dossier data
Fence state: visible before result interpretation
Primary next action: inspect a result or compare
Secondary next action: sources

## Page spine

1. First viewport: product header, compact promise, first required inputs.
2. Fence or boundary: screening-not-advice cue beside the task.
3. First proof object: source-read strip naming what the engine reads.
4. Interpretation: results with score, reasons, confidence, and gaps.
5. Source trail: source links attached to shown reasons.
6. Gap or caveat: unknown data excluded from scoring, not scored as zero.
7. Next action: compare or inspect sources.

## Evidence contract

- Values shown: only values needed for visible reasons.
- Source display: attached to each reason.
- Verified date display: attached to each reason.
- Confidence display: word and mark.
- Granularity display: shown when result inherits national or regional data.
- Gap display: visible in result explanation.
- Machine-readable output: not required for user-state results.

## Visual register

- Surface type: product instrument.
- Primary hierarchy move: stable sections and predictable controls.
- Allowed image or engraving use: none in the task body.
- Components allowed: field groups, chips, result rows, source chips.
- Components banned: marketing hero choreography, equal decorative cards.
- Motion allowed: selection state and result update only.

## Discoverability

- Primary nav: `Build my shortlist`.
- Footer: yes.
- Hub: homepage and shortlists.
- Related routes: compare, sources, methodology.
- Sitemap: yes or noindex decision must be explicit.

## Rendered proof required

- Desktop viewport: input and result area.
- Tablet viewport: field groups do not crowd.
- Mobile viewport: touch targets at least 44 px.
- Scroll-state proof: result explanation visible after interaction.
- Reduced-motion proof: no task content depends on animation.
- No-JS or JS-failure proof: page explains if interactive scoring is unavailable.
- Accessibility check: labels, fieldsets, errors, focus state.
- Link check: all source and next-action links resolve.

## Risks

- Data risk: result reasons may imply more precision than data supports.
- Fence risk: score language can become individualized advice.
- UX risk: asking for more inputs than the first useful shortlist needs.
- Launch risk: analytics events missing or noisy.
```

- [ ] **Step 4: Create the remaining route brief files**

Create the remaining files with these exact headings and key decisions:

`docs/design/routes/compare.md`:

```markdown
# Route brief: compare

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/compare/greece-portugal-spain`, future `/compare`
Status: live flagship, hub planned
Primary reader: person comparing a small set of countries or regimes
Reader moment: they need differences, not a winner
Main question: what changes between these places under the same evidence standard?
Product job: show a neutral comparison with sources, confidence, and scenario filters
Business job: make the flagship artifact shareable and quotable
Data state: current country-level and corridor-level cited values
Fence state: visible before tax, residency, cost, or financial claims
Primary next action: `/screener`
Secondary next action: `/sources`

## Page spine

1. Neutral thesis with no winner.
2. Fence and freshness cue.
3. Scenario choice before dense dimensions.
4. Comparison table with source-adjacent values.
5. Interpretation bands for differences that matter.
6. Sources and methodology.
7. Next action to screener.

## Evidence contract

- Values shown: scenario-relevant first, full dimensions lower.
- Source display: in table cells or immediate row detail.
- Verified date display: near each value.
- Confidence display: word and mark.
- Granularity display: country, region, or town as applicable.
- Gap display: visible if a dimension is unavailable or proxy.
- Machine-readable output: ItemList and Dataset where available.

## Visual register

- Surface type: evidence.
- Primary hierarchy move: table with clear reading order.
- Allowed image or engraving use: none in the core comparison.
- Components allowed: comparison table, scenario tabs, source list.
- Components banned: per-country color winners, decorative rankings.
- Motion allowed: tab/filter state only.

## Discoverability

- Primary nav: direct flagship until `/compare` hub exists.
- Footer: yes after hub exists.
- Hub: `/compare` planned.
- Related routes: screener, sources, methodology.
- Sitemap: yes.

## Risks

- Data risk: hardcoded display values drift from data.
- Fence risk: scenario copy implies a recommendation.
- UX risk: too many dimensions visible before the reader chooses a concern.
- Launch risk: mobile table overflow.
```

`docs/design/routes/shortlists.md`:

```markdown
# Route brief: shortlists

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/shortlists`
Status: live, cleanup required
Primary reader: person comparing ranked example scenarios
Reader moment: they want to understand why a place is near the top
Main question: what does this ranking mean, and what evidence drives it?
Product job: show ranked examples without individualized advice
Business job: bridge homepage and screener
Data state: current scored places and scenario examples
Fence state: visible near score interpretation
Primary next action: `/screener`
Secondary next action: `/sources`

## Page spine

1. Scenario label and criteria.
2. Ranking key and fence.
3. First result with only the decisive reasons visible.
4. Expandable evidence for deeper inspection.
5. Source trail and gaps.
6. Next action to run the screener.

## Evidence contract

- Values shown: decisive reasons first.
- Source display: attached to each reason.
- Verified date display: attached to each reason.
- Confidence display: word and mark.
- Granularity display: visible for inherited data.
- Gap display: unknown excluded from score.
- Machine-readable output: ItemList where available.

## Risks

- Data risk: rank can imply precision.
- Fence risk: best-for-you language is banned.
- UX risk: every ranked item showing all evidence upfront.
- Launch risk: saved-shortlist promise outruns implementation.
```

`docs/design/routes/guides.md`:

```markdown
# Route brief: guides and answer corridors

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/guides`, `/answers/*`, `/topics/*`, `/tools/*`, `/tax`
Status: live, cleanup required
Primary reader: person looking for an explanation or a tool
Reader moment: they need a source-backed answer without learning the whole site
Main question: where is the relevant explanation?
Product job: group routes by reader task
Business job: reduce dead ends and route high-intent readers deeper
Data state: varies by route family
Fence state: visible for cost, tax, residency, visa, financial, and legal implications
Primary next action: relevant guide or tool
Secondary next action: sources

## Page spine

1. Hub promise.
2. Grouped entries by task.
3. Short provenance cue for high-liability topics.
4. Links to methodology and sources.

## Risks

- Data risk: guide cards imply full coverage where data is partial.
- Fence risk: answer pages sound advisory.
- UX risk: all entries same weight.
- Launch risk: route families scattered across hubs.
```

`docs/design/routes/sources-methodology.md`:

```markdown
# Route brief: sources and methodology

Date: 2026-06-29
Owner: MSC Design Desk and Source QA Desk
Route: `/sources`, `/methodology`
Status: live, cleanup required
Primary reader: skeptical reader or AI crawler checking provenance
Reader moment: they need to verify the product's evidence discipline
Main question: where did this claim come from, and how current is it?
Product job: make sources, confidence, freshness, and fence inspectable
Business job: turn trust into a product asset
Data state: current source register and methodology copy
Fence state: visible when explaining high-liability topics
Primary next action: inspect a source
Secondary next action: build shortlist or compare

## Page spine

1. Source passport summary.
2. Searchable source register.
3. Confidence tiers.
4. Freshness rules.
5. How a figure is built.
6. Screening notice.
7. Machine-readable pointers where safe.

## Risks

- Data risk: source register becomes a dump.
- Fence risk: methodology implies certification or advice.
- UX risk: confidence appears decorative.
- Launch risk: source gaps hidden.
```

`docs/design/routes/places.md`:

```markdown
# Route brief: places and Chania gate

Date: 2026-06-29
Owner: MSC Design Desk, Data Desk, and Page Factory
Route: `/places`, `/places/greece/crete/chania`
Status: places live, Chania held
Primary reader: person checking coverage and place readiness
Reader moment: they want to know what is real, held, or coming
Main question: which places have evidence, and which are not ready yet?
Product job: show coverage without fake breadth
Business job: protect the first town page gate
Data state: Chania source-gap review and publication hold
Fence state: visible on place pages with cost, tax, residency, or financial claims
Primary next action: sources or compare
Secondary next action: screener

## Page spine

1. Coverage promise.
2. Published, held, and upcoming states.
3. Country and region index.
4. Explanation of why held means held.
5. Link to sources and methodology.

## Risks

- Data risk: Chania presented as finished.
- Fence risk: place copy drifts into recommendation.
- UX risk: empty breadth presented as progress.
- Launch risk: dossier pressure before data gate.
```

`docs/design/routes/legal.md`:

```markdown
# Route brief: legal, about, and screening notice

Date: 2026-06-29
Owner: MSC Design Desk and Command Center
Route: `/privacy`, `/terms`, `/affiliate-disclosure`, planned `/about`, planned `/screening-notice`
Status: legal pages live, about and screening notice planned
Primary reader: person checking boundaries, privacy, disclosure, or who is behind MSC
Reader moment: they need plain trust infrastructure
Main question: what does MSC claim, collect, disclose, and refuse to do?
Product job: make boundaries legible
Business job: protect trust and launch readiness
Data state: policy and product-positioning content
Fence state: explicit
Primary next action: sources or methodology
Secondary next action: screener

## Page spine

1. Plain title.
2. Short summary.
3. Policy or role sections.
4. Related legal and source links.

## Risks

- Data risk: factual claims about processors or policies get stale.
- Fence risk: about page implies adviser role.
- UX risk: legal links only in footer.
- Launch risk: affiliate or email capture without policy completeness.
```

- [ ] **Step 5: Run route contract before commit**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:routes
```

Expected:

- Build passes.
- `verify:routes` fails only for planned routes if Task 1 script was made too strict. If it fails on live routes or missing briefs, fix before continuing.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add docs/design/routes
git diff --cached --stat
git commit -m "docs(design): add MSC route briefs"
```

Expected:

- Only route brief docs are committed.

## Task 3: Add rendered page-choreography QA

**Files:**

- Modify: `package.json`
- Create: `scripts/visual-qa-page-choreography.ts`
- Modify: `pnpm-lock.yaml` if adding Playwright

- [ ] **Step 1: Add Playwright as a dev dependency**

Run:

```bash
corepack pnpm add -D playwright
```

Expected:

- `package.json` and `pnpm-lock.yaml` change.
- No production dependency changes are introduced.

- [ ] **Step 2: Install the Chromium browser for local QA**

Run:

```bash
corepack pnpm exec playwright install chromium
```

Expected:

- Chromium installs locally for rendered QA.

- [ ] **Step 3: Create `scripts/visual-qa-page-choreography.ts`**

Create `scripts/visual-qa-page-choreography.ts` with this code:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser, type Page } from "playwright";

const baseUrl = process.env.MSC_QA_BASE_URL ?? "http://127.0.0.1:4321";
const outDir = process.env.MSC_QA_OUT_DIR ?? "output/visual-qa/page-choreography";

const routes = [
  "/",
  "/screener",
  "/compare/greece-portugal-spain",
  "/shortlists",
  "/guides",
  "/sources",
  "/methodology",
  "/places",
  "/places/greece/crete/chania",
  "/privacy",
  "/terms",
  "/affiliate-disclosure",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "tablet", width: 900, height: 1100 },
  { name: "mobile", width: 390, height: 900 },
];

type Result = {
  route: string;
  viewport: string;
  ok: boolean;
  issues: string[];
};

function routeSlug(route: string): string {
  return route === "/" ? "home" : route.replace(/^\/+/, "").replaceAll("/", "-");
}

async function hiddenRevealCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    return [...document.querySelectorAll<HTMLElement>("[data-reveal], [data-img-reveal]")].filter(
      (el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return rect.height > 8 && (style.opacity === "0" || style.visibility === "hidden");
      },
    ).length;
  });
}

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
}

async function visibleTextLength(page: Page): Promise<number> {
  return page.evaluate(() => document.body.innerText.trim().length);
}

async function checkRoute(browser: Browser, route: string, viewport: (typeof viewports)[number]) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const issues: string[] = [];
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: join(outDir, `${viewport.name}-${routeSlug(route)}.png`),
    fullPage: false,
  });
  await page.evaluate(() => window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.45)));
  await page.waitForTimeout(250);
  await page.screenshot({
    path: join(outDir, `${viewport.name}-${routeSlug(route)}-midscroll.png`),
    fullPage: false,
  });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(250);
  await page.screenshot({
    path: join(outDir, `${viewport.name}-${routeSlug(route)}-bottom.png`),
    fullPage: false,
  });

  if (await hasHorizontalOverflow(page)) issues.push("horizontal overflow");
  const hiddenReveals = await hiddenRevealCount(page);
  if (hiddenReveals > 0) issues.push(`${hiddenReveals} reveal element(s) still hidden after scroll`);
  if ((await visibleTextLength(page)) < 200) issues.push("visible text unexpectedly short");

  if (viewport.name === "mobile") {
    const menuButton = page.locator(".nav-toggle, [aria-controls='mobile-menu']").first();
    if ((await menuButton.count()) > 0) {
      await menuButton.click();
      const menuText = await page.locator("body").innerText();
      for (const label of ["Compare", "Shortlists", "Guides", "Sources", "Build my shortlist"]) {
        if (!menuText.includes(label)) issues.push(`mobile menu missing ${label}`);
      }
    }
  }

  await context.close();
  return { route, viewport: viewport.name, ok: issues.length === 0, issues } satisfies Result;
}

async function checkReducedMotion(browser: Browser, route: string): Promise<Result> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const issues: string[] = [];
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);
  if ((await hiddenRevealCount(page)) > 0) issues.push("reduced-motion content remains hidden");
  await page.screenshot({
    path: join(outDir, `reduced-motion-${routeSlug(route)}.png`),
    fullPage: false,
  });
  await context.close();
  return { route, viewport: "reduced-motion-mobile", ok: issues.length === 0, issues };
}

async function checkNoJs(browser: Browser, route: string): Promise<Result> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  const issues: string[] = [];
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
  if ((await visibleTextLength(page)) < 200) issues.push("no-JS visible text unexpectedly short");
  if ((await hiddenRevealCount(page)) > 0) issues.push("no-JS reveal content remains hidden");
  await page.screenshot({
    path: join(outDir, `no-js-${routeSlug(route)}.png`),
    fullPage: false,
  });
  await context.close();
  return { route, viewport: "no-js-mobile", ok: issues.length === 0, issues };
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results: Result[] = [];

for (const route of routes) {
  for (const viewport of viewports) {
    results.push(await checkRoute(browser, route, viewport));
  }
  results.push(await checkReducedMotion(browser, route));
  results.push(await checkNoJs(browser, route));
}

await browser.close();

writeFileSync(join(outDir, "results.json"), `${JSON.stringify(results, null, 2)}\n`);

const failures = results.filter((result) => !result.ok);
if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.route} ${failure.viewport}: ${failure.issues.join(", ")}`);
  }
  process.exit(1);
}

console.log(`visual-qa-page-choreography: ${results.length} checks passed. Evidence in ${outDir}`);
```

- [ ] **Step 4: Add the visual QA script to `package.json`**

Modify the root `package.json` scripts block so it includes:

```json
"qa:visual": "tsx scripts/visual-qa-page-choreography.ts"
```

Keep `verify:routes` from Task 1.

- [ ] **Step 5: Run visual QA against local dev server**

Start the dev server:

```bash
corepack pnpm --filter @where/web dev --host 127.0.0.1 --port 4321
```

In another terminal, run:

```bash
MSC_QA_BASE_URL=http://127.0.0.1:4321 corepack pnpm qa:visual
```

Expected:

- This may fail on current reveal behavior. If it fails only because no-JS or reduced-motion reveal content remains hidden, keep the failure as the baseline and fix it in Task 6.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add package.json pnpm-lock.yaml scripts/visual-qa-page-choreography.ts
git diff --cached --stat
git commit -m "test(web): add page choreography visual QA"
```

Expected:

- Only visual QA script, package manifest, and lockfile are staged.

## Task 4: Add missing quiet trust routes

**Files:**

- Create: `packages/web/src/pages/about.astro`
- Create: `packages/web/src/pages/screening-notice.astro`
- Create: `packages/web/src/pages/compare/index.astro`
- Modify: `packages/web/src/layouts/Base.astro`
- Modify: `packages/web/src/pages/sitemap.xml.ts`
- Modify: `docs/design/routes.json`

- [ ] **Step 1: Create `/about`**

Create `packages/web/src/pages/about.astro` with a v5 route using `Base.astro`. The visible copy must include these exact ideas:

```text
My Second Country is a cited relocation screening desk.
James and Amanda are relocators sharing sourced data, not advisers.
The product reports what named sources say, when they were checked, and how confident the evidence is.
It does not tell an individual what to do.
```

Required links:

- `/methodology`
- `/sources`
- `/screening-notice`
- `/screener`

Do not include professional, expert, adviser, consultant, or recommendation language for James or Amanda.

- [ ] **Step 2: Create `/screening-notice`**

Create `packages/web/src/pages/screening-notice.astro` with a plain legal/trust page. It must render this fence string verbatim:

```text
Sourced screening information, not legal, tax, immigration, or financial advice. Verify with a licensed professional before acting.
```

Required sections:

- What MSC reports.
- What MSC does not do.
- Why sources, dates, confidence, and granularity are visible.
- When to consult a licensed professional.

Required links:

- `/sources`
- `/methodology`
- `/privacy`
- `/terms`

- [ ] **Step 3: Create `/compare` hub**

Create `packages/web/src/pages/compare/index.astro` with one available file:

- `Greece, Portugal, and Spain`, href `/compare/greece-portugal-spain`

Copy rule:

- The hub must say that comparisons are neutral and source-backed.
- It must not say winner, best, or recommended.
- It must link to `/screener` and `/sources`.

- [ ] **Step 4: Update route contract statuses**

In `docs/design/routes.json`, update:

- `/compare` from `planned` to `live`.
- `/about` from `planned` to `live`.
- `/screening-notice` from `planned` to `live`.
- Set `sitemap` to `true` for all three.
- Replace their `discoverability` arrays with human channels:
  - `/compare`: `["primaryNav", "footer", "sitemap", "related"]`
  - `/about`: `["footer", "sitemap", "related"]`
  - `/screening-notice`: `["footer", "sources", "sitemap", "related"]`

- [ ] **Step 5: Update footer and sitemap**

Modify `packages/web/src/layouts/Base.astro` footer links so it includes:

- `/about`
- `/screening-notice`
- `/compare`

Modify `packages/web/src/pages/sitemap.xml.ts` so it includes:

- `/about`
- `/screening-notice`
- `/compare`

- [ ] **Step 6: Verify**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:links
corepack pnpm verify:routes
corepack pnpm verify:build
```

Expected:

- Build passes.
- Links pass.
- Route contract passes.
- Build guards pass.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add packages/web/src/pages/about.astro packages/web/src/pages/screening-notice.astro packages/web/src/pages/compare/index.astro packages/web/src/layouts/Base.astro packages/web/src/pages/sitemap.xml.ts docs/design/routes.json
git diff --cached --stat
git commit -m "feat(web): add MSC trust and compare hubs"
```

Expected:

- No data files are staged.

## Task 5: Fix reveal and no-JS visibility before page cleanup

**Files:**

- Modify: `packages/web/src/styles/system.css`
- Modify: `packages/web/src/layouts/Base.astro` only if needed for class wiring

- [ ] **Step 1: Inspect current reveal CSS**

Run:

```bash
rg -n "data-reveal|data-img-reveal|prefers-reduced-motion|opacity: 0|is-visible" packages/web/src/styles/system.css packages/web/src/layouts/Base.astro
```

Expected:

- Locate the CSS that hides reveal elements before JavaScript marks them visible.

- [ ] **Step 2: Patch reveal CSS for no-JS and reduced motion**

Modify the reveal CSS so content is visible by default when JavaScript does not run. The target behavior:

```css
html:not(.js) [data-reveal],
html:not(.js) [data-img-reveal] {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal],
  [data-img-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

If the site does not currently set `html.js`, add this tiny inline script before reveal code in `Base.astro`:

```astro
<script is:inline>document.documentElement.classList.add("js");</script>
```

- [ ] **Step 3: Verify visual QA no longer sees hidden reveal content**

Run the dev server and visual QA:

```bash
corepack pnpm --filter @where/web dev --host 127.0.0.1 --port 4321
MSC_QA_BASE_URL=http://127.0.0.1:4321 corepack pnpm qa:visual
```

Expected:

- No reduced-motion or no-JS hidden reveal failures.
- If other page choreography failures remain, record them for Tasks 6 to 9.

- [ ] **Step 4: Commit Task 5**

Run:

```bash
git add packages/web/src/styles/system.css packages/web/src/layouts/Base.astro
git diff --cached --stat
git commit -m "fix(web): keep reveal content visible without motion"
```

Expected:

- Only reveal-related CSS or script changes are staged.

## Task 6: Homepage minimum-sufficient-information pass

**Files:**

- Modify: `packages/web/src/pages/index.astro`
- Modify: `packages/web/src/styles/system.css` only for shared helpers used by two or more sections
- Read: `docs/design/routes/home.md`

- [ ] **Step 1: Inventory homepage sections**

Run:

```bash
rg -n "<section|dossierFiles|Open files|display-section|Fence|Build my shortlist|sources|methodology" packages/web/src/pages/index.astro
```

Expected:

- You can name every homepage section before editing.

- [ ] **Step 2: Enforce the homepage information budget**

Edit `packages/web/src/pages/index.astro` so the homepage follows these constraints:

- One primary idea per section.
- No full comparison table.
- No full methodology explanation.
- No source register on the homepage.
- No more than three `Open files`.
- Every visible file in `Open files` links to a live or held route with honest status.
- The first CTA remains `/screener`.
- The secondary CTA is `/compare/greece-portugal-spain` or `/sources`.

Allowed homepage proof objects:

- one stable hero artifact;
- one problem/proof beat;
- one source or confidence cue;
- one three-item open-files shelf.

Copy constraints:

- Do not use best, recommended, expert, adviser, or personalised.
- Do not use the banned AI-register words from `AGENTS.md`.
- Do not use em dashes.

- [ ] **Step 3: Make Chania status honest**

If the homepage links to `/places/greece/crete/chania`, the card copy must state that it is a held or coverage file, not a finished dossier. Use this copy:

```text
Chania coverage file
Held until the town and parent region clear the evidence gate. Current page shows coverage state, not a finished dossier.
```

- [ ] **Step 4: Verify homepage render**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
corepack pnpm verify:routes
```

Then run visual QA:

```bash
corepack pnpm --filter @where/web dev --host 127.0.0.1 --port 4321
MSC_QA_BASE_URL=http://127.0.0.1:4321 corepack pnpm qa:visual
```

Expected:

- Homepage first screen is clear on mobile.
- Homepage middle sections are not blank.
- Homepage is not a compressed sitemap or compressed dossier.

- [ ] **Step 5: Commit Task 6**

Run:

```bash
git add packages/web/src/pages/index.astro packages/web/src/styles/system.css
git diff --cached --stat
git commit -m "feat(web): simplify homepage proof rhythm"
```

Expected:

- Only homepage and narrowly necessary shared style changes are staged.

## Task 7: Product flow progressive-disclosure pass

**Files:**

- Modify: `packages/web/src/pages/screener.astro`
- Modify: `packages/web/src/pages/shortlists/index.astro`
- Modify: `packages/web/src/pages/shortlists/[slug].astro`
- Read: `docs/design/routes/screener.md`
- Read: `docs/design/routes/shortlists.md`

- [ ] **Step 1: Audit screener fields against engine inputs**

Run:

```bash
rg -n "criteria|budget|income|passport|climate|scenario|score|screenPlace|fence|source|confidence" packages/web/src/pages/screener.astro packages/engine/src
```

Expected:

- Every visible input maps to an engine input or is clearly marked as non-scoring context.

- [ ] **Step 2: Reduce screener first screen**

Edit `packages/web/src/pages/screener.astro` so the first screen asks only for the inputs needed to produce a useful first shortlist. Move secondary or explanatory detail below the first result or into expandable sections.

Required first-screen content:

- task title;
- fence cue;
- minimum input set;
- primary action naming the result.

Prohibited first-screen content:

- full methodology;
- all data dimensions;
- long source register;
- decorative proof cards.

- [ ] **Step 3: Reduce result-row default density**

Edit result display so each result defaults to:

- place name;
- score or match phrase;
- two to three decisive reasons;
- confidence and source cue for shown reasons;
- visible gap indicator when applicable;
- an inspect-more control.

The full explanation must be available deeper, but not visible in every result by default.

- [ ] **Step 4: Verify product flow**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
corepack pnpm verify:routes
```

Run visual QA:

```bash
corepack pnpm --filter @where/web dev --host 127.0.0.1 --port 4321
MSC_QA_BASE_URL=http://127.0.0.1:4321 corepack pnpm qa:visual
```

Expected:

- Mobile screener does not feel like a form dump.
- Result rows do not imply individualized advice.
- Source cues remain adjacent to shown claims.

- [ ] **Step 5: Commit Task 7**

Run:

```bash
git add packages/web/src/pages/screener.astro packages/web/src/pages/shortlists/index.astro packages/web/src/pages/shortlists/[slug].astro
git diff --cached --stat
git commit -m "feat(web): simplify screener and shortlist flows"
```

Expected:

- No data files are staged.

## Task 8: Compare, sources, methodology, and hubs cleanup

**Files:**

- Modify: `packages/web/src/pages/compare/greece-portugal-spain.astro`
- Modify: `packages/web/src/pages/sources.astro`
- Modify: `packages/web/src/pages/methodology.astro`
- Modify: `packages/web/src/pages/guides.astro`
- Modify: `packages/web/src/pages/places/index.astro`
- Read: `docs/design/routes/compare.md`
- Read: `docs/design/routes/sources-methodology.md`
- Read: `docs/design/routes/guides.md`
- Read: `docs/design/routes/places.md`

- [ ] **Step 1: Compare page progressive disclosure**

Edit `packages/web/src/pages/compare/greece-portugal-spain.astro` so:

- scenario or concern selection appears before dense dimensions;
- the first comparison view does not expose every dimension at once on mobile;
- full table remains available and source-backed;
- no country color implies a winner;
- source, verified date, confidence, and granularity remain adjacent to shown values.

- [ ] **Step 2: Sources page source-passport pass**

Edit `packages/web/src/pages/sources.astro` so it opens with:

- what MSC knows;
- what MSC trusts;
- what MSC refreshes;
- what MSC still marks as gaps.

The searchable source register remains lower on the page.

- [ ] **Step 3: Methodology page minimum explanation pass**

Edit `packages/web/src/pages/methodology.astro` so it explains:

- how a figure is built;
- confidence tiers;
- freshness;
- granularity;
- the fence.

Do not duplicate the full source register.

- [ ] **Step 4: Hub grouping pass**

Edit `packages/web/src/pages/guides.astro` and `packages/web/src/pages/places/index.astro` so entries are grouped by reader task and readiness state, not only by route type.

Places page must distinguish:

- published;
- held;
- upcoming;
- source gap.

Chania remains held or coverage-only until data gate clearance.

- [ ] **Step 5: Verify**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
corepack pnpm verify:routes
```

Run visual QA:

```bash
corepack pnpm --filter @where/web dev --host 127.0.0.1 --port 4321
MSC_QA_BASE_URL=http://127.0.0.1:4321 corepack pnpm qa:visual
```

Expected:

- Compare page is inspectable without table overload.
- Sources page reads like a source passport before it becomes a list.
- Methodology explains the system without becoming the homepage.
- Places page is honest about readiness.

- [ ] **Step 6: Commit Task 8**

Run:

```bash
git add packages/web/src/pages/compare/greece-portugal-spain.astro packages/web/src/pages/sources.astro packages/web/src/pages/methodology.astro packages/web/src/pages/guides.astro packages/web/src/pages/places/index.astro
git diff --cached --stat
git commit -m "feat(web): clarify evidence hubs and compare flow"
```

Expected:

- No dossier template components are added.

## Task 9: Legal and footer alignment pass

**Files:**

- Modify: `packages/web/src/pages/privacy.astro`
- Modify: `packages/web/src/pages/terms.astro`
- Modify: `packages/web/src/pages/affiliate-disclosure.astro`
- Modify: `packages/web/src/layouts/Base.astro`
- Read: `docs/design/routes/legal.md`

- [ ] **Step 1: Legal page link audit**

Run:

```bash
rg -n "privacy|terms|affiliate|screening-notice|about|sources|methodology|professional|advice|adviser" packages/web/src/pages/privacy.astro packages/web/src/pages/terms.astro packages/web/src/pages/affiliate-disclosure.astro packages/web/src/layouts/Base.astro
```

Expected:

- Legal pages link to each other, sources, methodology, and screening notice.

- [ ] **Step 2: Make boundaries plain**

Edit legal pages so each starts with:

- plain title;
- one-paragraph summary;
- clear related links.

Do not add marketing copy.

- [ ] **Step 3: Verify**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
corepack pnpm verify:routes
```

Expected:

- All legal pages pass copy and link gates.

- [ ] **Step 4: Commit Task 9**

Run:

```bash
git add packages/web/src/pages/privacy.astro packages/web/src/pages/terms.astro packages/web/src/pages/affiliate-disclosure.astro packages/web/src/layouts/Base.astro
git diff --cached --stat
git commit -m "feat(web): align legal and trust routes"
```

Expected:

- Only legal and shared footer changes are staged.

## Task 10: Final verification and handoff

**Files:**

- Create: `docs/superpowers/plans/reports/2026-06-29-page-choreography-qa.md`
- Read: all changed files

- [ ] **Step 1: Run full verification suite**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
corepack pnpm verify:routes
corepack pnpm test
corepack pnpm verify:data
```

Expected:

- Web build passes.
- Build guards pass.
- Link and route contract checks pass.
- Tests pass.
- `verify:data` either passes or fails only on the known Chania data gate. If it fails on anything else, stop and route to Data Desk.

- [ ] **Step 2: Run visual QA**

Run:

```bash
corepack pnpm --filter @where/web dev --host 127.0.0.1 --port 4321
MSC_QA_BASE_URL=http://127.0.0.1:4321 MSC_QA_OUT_DIR=output/visual-qa/2026-06-29-page-choreography corepack pnpm qa:visual
```

Expected:

- Visual QA passes or produces an explicit list of route-level failures to fix before shipping.

- [ ] **Step 3: Write QA report**

Create `docs/superpowers/plans/reports/2026-06-29-page-choreography-qa.md` with this structure:

```markdown
# MSC page choreography QA

Date: 2026-06-29

## Scope

- Route contract
- Route briefs
- Missing trust routes
- Homepage minimum-sufficient-information pass
- Screener and shortlist progressive disclosure
- Compare and evidence hubs
- Legal route alignment

## Verification

- `corepack pnpm --filter @where/web build`: [pass/fail]
- `corepack pnpm verify:build`: [pass/fail]
- `corepack pnpm verify:links`: [pass/fail]
- `corepack pnpm verify:routes`: [pass/fail]
- `corepack pnpm test`: [pass/fail]
- `corepack pnpm verify:data`: [pass/fail with known Chania note if applicable]
- `corepack pnpm qa:visual`: [pass/fail]

## Rendered evidence

Screenshots are in `output/visual-qa/2026-06-29-page-choreography/`.

## Dossier gate

Chania dossier implementation remains blocked until Data Desk clears the parent region and town bundle handoff or Command Center records an explicit override.

## Residual risks

- [specific risk 1]
- [specific risk 2]
```

Replace bracketed values with the actual verification result before committing the report.

- [ ] **Step 4: Commit final QA report**

Run:

```bash
git add docs/superpowers/plans/reports/2026-06-29-page-choreography-qa.md
git diff --cached --stat
git commit -m "docs(qa): record MSC page choreography pass"
```

Expected:

- Only the QA report is staged.

## Dossier stop rule

Do not implement the dossier template in this plan. If a worker reaches the dossier task before data gate clearance:

1. Stop.
2. Read `docs/msc-room-state.json`.
3. Run `corepack pnpm data:bundle-readiness -- --place gr-crete-chania` if the script interface supports that place argument in the current checkout.
4. Report the blocker to Command Center and Data Desk.
5. Continue only on route briefs, QA, or non-dossier public route cleanup.

## Final acceptance

This plan is complete when:

- route contract exists and passes;
- route briefs exist;
- rendered QA script exists and catches hidden content;
- missing trust routes exist and are discoverable;
- homepage uses minimum sufficient information;
- screener, shortlists, compare, sources, methodology, hubs, and legal pages follow progressive disclosure;
- full verification is run;
- Chania dossier work remains blocked unless gate clearance is explicit.

## Execution choice after saving

Recommended execution mode: `superpowers:subagent-driven-development`.

Use one worker per task, then review the diff before dispatching the next worker. The repo is dirty and several workstreams overlap, so do not run broad staging or broad formatting.
