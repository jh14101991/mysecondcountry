# My Second Country live readiness implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved v5 product feel, the evidence-corridor navigation cleanup, the Lazyweb and Hermes creative direction, and the dossier template spec into one execution path that gets My Second Country ready for a clean live push.

**Architecture:** Treat the dataset as the product and the public site as its proof surface. Ship the current v5 and IA cleanup first, then build the first source-backed Chania dossier through the reusable dossier component system, then harden legal, link, sitemap, analytics, and visual QA gates before production promotion.

**Tech stack:** pnpm workspace, Astro static site in `packages/web`, shared data in `packages/data`, pure screening logic in `packages/engine`, TypeScript, Zod, Vitest, Biome, Vercel Git deploys, Plausible, cited JSON data, and repo-local build gates.

## Status summary

### Implemented in the current dirty tree

- v5 Astro port is present on the homepage and core product pages.
- Primary navigation is now `Compare`, `Shortlists`, `Guides`, `Sources`, plus `Build my shortlist`.
- Homepage has an `Open files` evidence shelf.
- `/guides`, `/places`, `/privacy`, and `/terms` exist locally.
- `/answers`, `/topics`, `/tools`, `/tax`, and `/shortlists` have corridor-style hub pages instead of raw lists.
- Homepage and screener placeholder links to `#` were removed.
- `sitemap.xml` now includes `/guides`, `/places`, `/privacy`, `/terms`, `/methodology`, and `/sources`.
- `scripts/validate-jsonld.ts` excludes `/places/index.html` from Place-page JSON-LD checks, because it is a coverage index.

### Verified in the current dirty tree

- `corepack pnpm --filter @where/web build` passed.
- `corepack pnpm verify:build` passed.
- `corepack pnpm test` passed, 337 tests in 37 files.
- `corepack pnpm exec biome check scripts/validate-jsonld.ts` passed.
- Live dev routes returned 200 for `/`, `/guides`, `/places`, `/privacy`, and `/terms`.
- Built HTML inspection found the unified nav and zero `href="#"` dead links in the inspected public routes.
- `corepack pnpm verify:data` still fails on the known Chania data gate in this checkout. Room state says the newer evidence-bundle tooling now passes local distinctness, but Chania remains held at `source_gap` until completed gaps and publication hold are closed.

### Active source documents

These are active inputs for execution:

- `AGENTS.md`, `CITATIONS.md`, `FENCE.md`, and `SHIP.md`.
- `DEFINITION_OF_DONE.md`.
- `docs/msc-operating-ledger.md`.
- `docs/msc-room-state.json`.
- `docs/superpowers/specs/2026-06-24-v1-design.md`.
- `docs/superpowers/plans/2026-06-24-v1-implementation-plan.md`.
- `docs/superpowers/plans/2026-06-27-msc-design-system-and-page-buildout.md`.
- `docs/superpowers/plans/2026-06-28-v5-astro-port.md`.
- `docs/superpowers/specs/2026-06-29-dossier-page-template-system.md`.
- `/tmp/msc-nav-audit-2026-06-29/audit-notes.md`, captured as the navigation and discoverability audit that led to the corridor cleanup.
- Lazyweb report from 2026-06-29, used as external product-UI evidence.
- Hermes creative ideation result from 2026-06-29, using Jobs To Be Done, which produced the evidence corridors, dossier shelf, and source passport ideas.

These are reference-only until reconciled:

- `docs/design/HANDOFF.md`, because it asks for a refero-led restart that predates the now-approved v5 Astro port.
- `docs/design/page-prompts/*`, useful for page content and structure, not authoritative over v5 visual direction.
- `docs/design/page-prompts/almanac-slop-kill-comprehensive.md`, useful as an anti-slop checklist, but it names an older Almanac palette and fonts that must not override v5.
- `docs/page-roadmap.md`, useful as a demand-led backlog, not a build contract.

## Non-negotiables

- The brand is My Second Country. The canonical host is `mysecondcountry.com`.
- My Second Country is cited relocation screening intelligence, never legal, tax, immigration, or financial advice.
- Every fact that could be wrong is a `CitedValue`.
- No residency, visa, tax, legal, financial, cost, or climate claim ships without source URL, source name, verified date, confidence, and granularity.
- High-liability public claims are high or medium confidence only.
- National, regional, local, inherited, proxy, unavailable, and blocked states are visible. They are not softened into local certainty.
- No individualized recommendation language ships.
- The first serious proof remains one real Greek town page, Chania, passing the evidence and page gates.
- Design approval is separate from data approval.
- Do not deploy with unrelated work accidentally staged.
- Do not start breadth before the Chania page gate.

## Product and design rules to preserve

- v5 Broadsheet Ledger is the active visual system.
- Marketing surfaces are visual-first and engine-led. They show proof glimpses, not full data dumps.
- Data surfaces are evidence-first. They show source, verified date, confidence, fence, and granularity near the claim.
- Top navigation stays compact. It should orient the reader, not expose every route.
- Evidence corridors are the product map:
  - `Compare`, for side-by-side decision files.
  - `Shortlists`, for ranked screens with visible filters and rank keys.
  - `Guides`, for answers, tax regimes, topics, and tools.
  - `Sources`, for proof and bibliography.
  - `Build my shortlist`, for the screener.
- The homepage shelf is called `Open files` or an equivalent evidence-file phrase. It links to live public artifacts only.
- `Sources` should feel like a source passport over time: a reader can see what the product knows, what it trusts, and what is still a gap.
- Dossier pages should feel like serious editorial dossiers, not travel articles and not admin dashboards.
- Engravings and large visual moments belong on marketing, place, and CTA surfaces when they help orientation. Evidence sections use type, hairline rules, ledgers, maps, and citations.
- Cards are allowed for repeated items only. No nested cards.
- Maps are evidence maps, not decorative maps.

## Target live sequence

1. Package the current v5 and IA cleanup in a tight commit.
2. Decide deploy eligibility while documenting the known data gate.
3. Harden launch basics: link audit, privacy and terms completeness, affiliate disclosure route if any affiliate surface is live, sitemap, robots, llms, and noindex rules.
4. Build the Chania dossier component system only after Data Desk promotes Chania from `source_gap` to `data_bundle_ready`.
5. Run visual QA from rendered pages, not only code review.
6. Push or deploy through the normal Vercel Git path once the chosen gate policy is satisfied.
7. After live, prepare the first public-safe market artifact from the source-literacy lane or from the first Chania page if that page is live.

## Task 1: freeze and package the current v5 and corridor cleanup

**Files:**

- Modify: `packages/web/src/layouts/Base.astro`
- Modify: `packages/web/src/styles/system.css`
- Modify: `packages/web/src/pages/index.astro`
- Modify: `packages/web/src/pages/screener.astro`
- Modify: `packages/web/src/pages/sitemap.xml.ts`
- Modify: `packages/web/src/pages/answers/index.astro`
- Modify: `packages/web/src/pages/shortlists/index.astro`
- Modify: `packages/web/src/pages/tax/index.astro`
- Modify: `packages/web/src/pages/topics/index.astro`
- Modify: `packages/web/src/pages/tools/index.astro`
- Modify: `scripts/validate-jsonld.ts`
- Create: `packages/web/src/pages/guides.astro`
- Create: `packages/web/src/pages/places/index.astro`
- Create: `packages/web/src/pages/privacy.astro`
- Create: `packages/web/src/pages/terms.astro`

- [ ] **Step 1: Confirm the branch and dirty tree**

Run:

```bash
git branch --show-current
git status --short
```

Expected:

- Branch is `feat/v5-port`, or a branch explicitly chosen by Command Center.
- The files above are present in the dirty tree.
- Other modified or untracked files remain unstaged.

- [ ] **Step 2: Re-run the tight v5 and IA verification**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm test
corepack pnpm verify:data
```

Expected:

- Web build passes.
- `verify:build` passes.
- Tests pass.
- `verify:data` either passes or fails only on the known Chania source-gap or uniqueness gate. If it fails on anything else, stop and route to Data Desk.

- [ ] **Step 3: Re-run dead-link and nav inspection**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const path = require("path");
const root = "packages/web/dist";
const routes = [
  "index.html",
  "guides/index.html",
  "places/index.html",
  "privacy/index.html",
  "terms/index.html",
  "shortlists/index.html",
  "tax/index.html",
  "tools/index.html",
  "topics/index.html",
  "answers/index.html",
];
for (const route of routes) {
  const html = fs.readFileSync(path.join(root, route), "utf8");
  const deadLinks = [...html.matchAll(/href="#"/g)].length;
  const nav = [...html.matchAll(/<a class="nav-link" href="([^"]+)">([^<]+)<\/a>/g)]
    .slice(0, 4)
    .map((match) => `${match[2]}:${match[1]}`);
  console.log(`${route} deadLinks=${deadLinks} nav=${nav.join(", ")}`);
}
NODE
```

Expected:

- Every listed route reports `deadLinks=0`.
- Every listed route reports `Compare`, `Shortlists`, `Guides`, `Sources`.

- [ ] **Step 4: Stage only the v5 and IA cleanup files**

Run:

```bash
git restore --staged .
git add \
  packages/web/src/layouts/Base.astro \
  packages/web/src/styles/system.css \
  packages/web/src/pages/index.astro \
  packages/web/src/pages/screener.astro \
  packages/web/src/pages/sitemap.xml.ts \
  packages/web/src/pages/answers/index.astro \
  packages/web/src/pages/shortlists/index.astro \
  packages/web/src/pages/tax/index.astro \
  packages/web/src/pages/topics/index.astro \
  packages/web/src/pages/tools/index.astro \
  packages/web/src/pages/guides.astro \
  packages/web/src/pages/places/index.astro \
  packages/web/src/pages/privacy.astro \
  packages/web/src/pages/terms.astro \
  scripts/validate-jsonld.ts
git diff --cached --stat
```

Expected:

- Only the files listed in this task are staged.
- No data matrix, ops, mockup bulk, package-lock, workflow, or room-state files are staged unless Command Center explicitly asks.

- [ ] **Step 5: Commit the package**

Run:

```bash
git commit -m "feat(web): unify MSC navigation and evidence corridors"
```

Expected:

- Commit succeeds.
- Worktree remains dirty only with unrelated pre-existing or separately owned work.

## Task 2: create the canonical design and planning source map

**Files:**

- Create: `docs/design/README.md`
- Modify: none of the four process docs.

- [ ] **Step 1: Create the design source map**

Write `docs/design/README.md` with this content:

```markdown
# My Second Country design source map

This is a reference document, not a process document.

## Active visual system

The active system is v5 Broadsheet Ledger, ported to Astro in `packages/web`.

Use:

- `packages/web/src/styles/system.css` for live tokens and shared styles.
- `packages/web/src/layouts/Base.astro` for live chrome.
- `packages/web/src/pages/index.astro` for the approved homepage implementation.
- `docs/superpowers/plans/2026-06-29-msc-live-readiness-implementation-plan.md` for the current execution path.

## Active product map

Top navigation:

- Compare
- Shortlists
- Guides
- Sources
- Build my shortlist

The homepage may show a small set of live files. It should not expose draft routes.

## Historical references

`docs/design/page-prompts/*` are content and structure references. They do not override v5.

`docs/design/page-prompts/almanac-slop-kill-comprehensive.md` is an anti-slop checklist. It does not override v5 palette, fonts, or approved page flow.

`docs/design/HANDOFF.md` is historical. It asks for a refero restart and should not steer the current v5 implementation.

## Next design build

The next design build is the Chania dossier template system, after Data Desk promotes Chania to `data_bundle_ready`.
```

- [ ] **Step 2: Verify the source map avoids process-doc drift**

Run:

```bash
rg -n "process document|reference document|v5|Historical references" docs/design/README.md
git diff -- docs/design/README.md
```

Expected:

- The file states it is a reference document.
- It does not add a fifth process doc.
- It names current v5 implementation files, not old visual directions.

- [ ] **Step 3: Commit the source map**

Run:

```bash
git add docs/design/README.md
git commit -m "docs(design): add MSC design source map"
```

Expected:

- Commit succeeds with one file.

## Task 3: add an automated public-link and discoverability gate

**Files:**

- Create: `scripts/assert-public-links.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the link assertion script**

Create `scripts/assert-public-links.ts`:

```ts
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ensureBuilt, htmlFiles, read, rel } from "./lib/dist.js";

ensureBuilt();

const distRoot = join(process.cwd(), "packages/web/dist");
const htmlPaths = htmlFiles().filter((file) => !file.includes("/ops/") && !file.endsWith("/styleguide/index.html"));

function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
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

console.log(`assert-public-links: ${htmlPaths.length} HTML page(s) checked, no broken public links.`);
```

- [ ] **Step 2: Wire the script into `package.json`**

Add a script:

```json
"verify:links": "tsx scripts/assert-public-links.ts"
```

Do not replace existing scripts.

- [ ] **Step 3: Run the link gate**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:links
```

Expected:

- Build passes.
- `verify:links` reports checked pages and no broken public links.

- [ ] **Step 4: Commit the gate**

Run:

```bash
git add scripts/assert-public-links.ts package.json
git commit -m "test(web): assert public navigation links"
```

Expected:

- Commit succeeds with only those two files.

## Task 4: harden legal launch basics

**Files:**

- Modify: `packages/web/src/pages/privacy.astro`
- Modify: `packages/web/src/pages/terms.astro`
- Create: `packages/web/src/pages/affiliate-disclosure.astro`
- Modify: `packages/web/src/pages/sitemap.xml.ts`

- [ ] **Step 1: Convert privacy from minimal page to launch page**

Update `privacy.astro` so it includes:

- controller identity if James has confirmed it;
- contact email `hello@mysecondcountry.com`;
- Plausible analytics;
- Vercel hosting;
- Resend only if email capture is enabled;
- Stripe only if checkout or paid fake-door is enabled;
- data categories;
- purpose and lawful basis;
- retention periods;
- user rights;
- transfer and processor note.

If the legal entity is not confirmed, state:

```text
The legal entity name is pending founder confirmation before public promotion or email collection.
```

Expected:

- The page is honest and public-safe.
- It does not pretend DPAs are complete if they are not complete.

- [ ] **Step 2: Harden terms**

Update `terms.astro` so it includes:

- sourced screening only;
- no advice;
- rules can change;
- no individualized recommendations;
- professional verification;
- source and confidence limitation;
- contact email.

Expected:

- The page uses the fence wording.
- It does not create legal promises about accuracy, suitability, or eligibility.

- [ ] **Step 3: Add affiliate disclosure**

Create `packages/web/src/pages/affiliate-disclosure.astro` with:

- title `Affiliate disclosure`;
- clear statement that pages may contain affiliate links only when disclosed;
- no current affiliate program list unless programs are approved;
- statement that no fee can buy placement or ranking;
- link back to `/sources` and `/methodology`.

- [ ] **Step 4: Add affiliate disclosure to sitemap and footer if relevant**

Add `/affiliate-disclosure` to `sitemap.xml.ts`.

Add footer link only if the public site contains or is about to contain affiliate links. If no affiliate link is live, keep it in sitemap but not primary footer.

- [ ] **Step 5: Verify legal pages**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
```

Expected:

- All pass.

- [ ] **Step 6: Commit legal hardening**

Run:

```bash
git add \
  packages/web/src/pages/privacy.astro \
  packages/web/src/pages/terms.astro \
  packages/web/src/pages/affiliate-disclosure.astro \
  packages/web/src/pages/sitemap.xml.ts
git commit -m "feat(web): harden legal launch pages"
```

Expected:

- Commit succeeds with only legal and sitemap files.

## Task 5: wait for the Chania data gate, then build the dossier view model

**Files:**

- Create: `packages/web/src/lib/dossier/types.ts`
- Create: `packages/web/src/lib/dossier/view-model.ts`
- Create: `packages/web/src/lib/dossier/evidence.ts`
- Create: `packages/web/src/lib/dossier/map-pins.ts`
- Test: `packages/web/src/lib/dossier/__tests__/view-model.test.ts`

- [ ] **Step 1: Confirm Data Desk promotion before building**

Run:

```bash
node - <<'NODE'
const fs = require("fs");
const state = JSON.parse(fs.readFileSync("docs/msc-room-state.json", "utf8"));
const handoff = state.handoffs.find((item) => item.id === "handoff-data-page-chania-evidence-bundle");
console.log(JSON.stringify({
  status: handoff?.status,
  acceptanceCondition: handoff?.acceptanceCondition,
}, null, 2));
NODE
```

Expected:

- Status is not `pending_data`.
- Data Desk or Command Center has explicitly marked the Chania bundle `data_bundle_ready`, or has given a written override for a pilot publish.

If status remains `pending_data`, stop this task. Continue only with Task 1 through Task 4 and Task 9.

- [ ] **Step 2: Define dossier types**

Create `packages/web/src/lib/dossier/types.ts`:

```ts
import type { CitedValue, Confidence, Granularity, Place } from "@where/data";

export type DossierTemplate = "country" | "region" | "place";
export type PlaceMode = "large_city" | "small_town" | "island_or_coastal" | "inland_or_mountain";

export type EvidenceCoverageStatus =
  | "local"
  | "regional"
  | "national"
  | "inherited_national"
  | "inherited_regional"
  | "proxy"
  | "unavailable"
  | "blocked";

export interface EvidenceExplorerRow {
  rowKey: string;
  label: string;
  category: string;
  coverageStatus: EvidenceCoverageStatus;
  granularity: Granularity;
  confidence?: Confidence;
  cited?: CitedValue;
  sourceName?: string;
  verifiedDate?: string;
  note: string;
}

export interface DossierSignal {
  key: string;
  label: string;
  cited: CitedValue;
  note: string;
}

export interface EvidenceMapPin {
  id: string;
  label: string;
  category:
    | "place_center"
    | "airport"
    | "ferry_port"
    | "hospital"
    | "school"
    | "childcare"
    | "transit"
    | "beach"
    | "protected_area"
    | "government_office"
    | "market_or_centre"
    | "coverage_child_place"
    | "source_gap";
  coordinates: { lat: number; lon: number };
  evidenceRowKey?: string;
  coverageStatus: EvidenceCoverageStatus;
  sourceUrl: string;
  sourceName: string;
  verifiedDate: string;
  confidence: Confidence;
  granularity: Granularity;
  note?: string;
}

export interface DossierSource {
  url: string;
  name: string;
  verifiedDate: string;
  confidence: Confidence;
  covers: string[];
}

export interface DossierViewModel {
  place: Place;
  template: DossierTemplate;
  placeMode?: PlaceMode;
  canonicalUrl: string;
  dateline: string;
  freshness: {
    newestVerifiedDate: string;
    staleDays: number | null;
    highLiabilityBlockers: string[];
  };
  summarySignals: DossierSignal[];
  mapPins: EvidenceMapPin[];
  evidenceRows: EvidenceExplorerRow[];
  sources: DossierSource[];
  jsonLd: unknown[];
}
```

- [ ] **Step 3: Build evidence rows from the bundle**

Create `packages/web/src/lib/dossier/evidence.ts` with functions that:

- read the publishable `Place`;
- read the matching evidence bundle if it exists;
- reject `source_search_required`;
- convert completed gaps into `EvidenceExplorerRow` with status `unavailable` or `blocked`;
- convert inherited values into `inherited_national` or `inherited_regional`;
- convert proxy values into `proxy` with a method note;
- keep all row keys stable.

Expected behavior:

- Chania returns 254 rows after Data Desk handoff.
- A bundle with any `source_search_required` throws.
- Empty source-gap values render as gaps, not zeros.

- [ ] **Step 4: Build map pins from sourced rows**

Create `packages/web/src/lib/dossier/map-pins.ts` with a function `buildEvidenceMapPins(modelRows, place)`.

Rules:

- The place center pin may use `place.coordinates` only if the Place object has coordinates.
- A pin cannot render without source URL, source name, verified date, confidence, and granularity.
- OSM-derived rows are labelled as mapped-feature proxies.
- If a source-backed row is unavailable, create a `source_gap` pin only when it helps the reader understand missing evidence.

- [ ] **Step 5: Build the view model**

Create `packages/web/src/lib/dossier/view-model.ts`:

```ts
import { collectCitedValues, placePath, type Confidence, type Place } from "@where/data";
import { maxVerifiedDate } from "../jsonld.ts";
import { buildEvidenceRows } from "./evidence";
import { buildEvidenceMapPins } from "./map-pins";
import type { DossierTemplate, DossierViewModel, PlaceMode } from "./types";

const SITE = "https://mysecondcountry.com";

function templateFor(place: Place): DossierTemplate {
  if (place.granularity === "country") return "country";
  if (place.granularity === "region") return "region";
  return "place";
}

function modeFor(place: Place): PlaceMode | undefined {
  if (place.granularity !== "town") return undefined;
  const name = place.name.toLowerCase();
  if (name.includes("chania") || name.includes("heraklion")) return "island_or_coastal";
  return "small_town";
}

export function buildDossierViewModel(place: Place): DossierViewModel {
  const canonicalUrl = `${SITE}${placePath(place)}`;
  const citedFacts = collectCitedValues(place).map((fact) => fact.cited);
  const evidenceRows = buildEvidenceRows(place);
  const newestVerifiedDate = maxVerifiedDate([
    ...citedFacts,
    ...evidenceRows.flatMap((row) => (row.cited ? [row.cited] : [])),
  ]);
  const summarySignals = evidenceRows
    .filter((row) => row.cited)
    .slice(0, 9)
    .map((row) => ({
      key: row.rowKey,
      label: row.label,
      cited: row.cited!,
      note: row.note,
    }));
  const mapPins = buildEvidenceMapPins(evidenceRows, place);
  const sourcesByUrl = new Map<string, { name: string; verifiedDate: string; confidence: Confidence; covers: string[] }>();
  for (const row of evidenceRows) {
    if (!row.cited) continue;
    const hit = sourcesByUrl.get(row.cited.sourceUrl) ?? {
      name: row.cited.sourceName,
      verifiedDate: row.cited.verifiedDate,
      confidence: row.cited.confidence,
      covers: [],
    };
    if (row.cited.verifiedDate > hit.verifiedDate) hit.verifiedDate = row.cited.verifiedDate;
    hit.covers.push(row.label);
    sourcesByUrl.set(row.cited.sourceUrl, hit);
  }
  return {
    place,
    template: templateFor(place),
    placeMode: modeFor(place),
    canonicalUrl,
    dateline: newestVerifiedDate,
    freshness: {
      newestVerifiedDate,
      staleDays: null,
      highLiabilityBlockers: [],
    },
    summarySignals,
    mapPins,
    evidenceRows,
    sources: Array.from(sourcesByUrl.entries()).map(([url, source]) => ({ url, ...source })),
    jsonLd: [],
  };
}
```

Adjust imports and evidence-bundle field names to match the actual bundle schema. Keep function names and return shape stable.

- [ ] **Step 6: Test the view model**

Create `packages/web/src/lib/dossier/__tests__/view-model.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { placeById } from "@where/data";
import { buildDossierViewModel } from "../view-model";

describe("buildDossierViewModel", () => {
  it("selects the adaptive place template for Chania", () => {
    const chania = placeById("gr-crete-chania");
    expect(chania).toBeTruthy();
    const model = buildDossierViewModel(chania!);
    expect(model.template).toBe("place");
    expect(model.placeMode).toBe("island_or_coastal");
  });

  it("contains the complete Chania evidence matrix after data handoff", () => {
    const chania = placeById("gr-crete-chania");
    expect(chania).toBeTruthy();
    const model = buildDossierViewModel(chania!);
    expect(model.evidenceRows).toHaveLength(254);
    expect(new Set(model.evidenceRows.map((row) => row.rowKey)).size).toBe(254);
  });

  it("does not expose source_search_required rows", () => {
    const chania = placeById("gr-crete-chania");
    expect(chania).toBeTruthy();
    const model = buildDossierViewModel(chania!);
    expect(model.evidenceRows.some((row) => (row.coverageStatus as string) === "source_search_required")).toBe(false);
  });

  it("does not render map pins without source metadata", () => {
    const chania = placeById("gr-crete-chania");
    expect(chania).toBeTruthy();
    const model = buildDossierViewModel(chania!);
    for (const pin of model.mapPins) {
      expect(pin.sourceUrl).toMatch(/^https:\/\//);
      expect(pin.sourceName.length).toBeGreaterThan(0);
      expect(pin.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["high", "medium", "low"]).toContain(pin.confidence);
    }
  });
});
```

- [ ] **Step 7: Run tests**

Run:

```bash
corepack pnpm --filter @where/web exec vitest run src/lib/dossier/__tests__/view-model.test.ts
corepack pnpm test
```

Expected:

- New view-model tests pass.
- Full test suite passes.

- [ ] **Step 8: Commit the view model**

Run:

```bash
git add packages/web/src/lib/dossier
git commit -m "feat(web): add dossier view model"
```

Expected:

- Commit succeeds with only the dossier library files.

## Task 6: build the reusable dossier components

**Files:**

- Create: `packages/web/src/components/dossier/DossierShell.astro`
- Create: `packages/web/src/components/dossier/DossierHero.astro`
- Create: `packages/web/src/components/dossier/DossierSignalBoard.astro`
- Create: `packages/web/src/components/dossier/EvidenceMap.astro`
- Create: `packages/web/src/components/dossier/EvidenceMapPinList.astro`
- Create: `packages/web/src/components/dossier/EvidenceExplorer.astro`
- Create: `packages/web/src/components/dossier/EvidenceRow.astro`
- Create: `packages/web/src/components/dossier/SourceGapNote.astro`
- Create: `packages/web/src/components/dossier/PlaceChildrenIndex.astro`

- [ ] **Step 1: Build `DossierShell.astro`**

Responsibilities:

- Wrap one dossier page.
- Render breadcrumb slot, hero slot, fence slot, main sections, sources, and CTA slot.
- Apply only layout. It must not calculate evidence.

Required public API:

```astro
---
interface Props {
  template: "country" | "region" | "place";
}
const { template } = Astro.props;
---
<article class={`dossier-shell dossier-shell--${template}`}>
  <slot />
</article>
```

- [ ] **Step 2: Build `DossierHero.astro`**

Responsibilities:

- Render place name, parent chain, dateline, source count, and a conservative evidence-led summary.
- Exactly one page-level `<h1>` lives here.
- No advice language.

- [ ] **Step 3: Build `DossierSignalBoard.astro`**

Responsibilities:

- Render summary signals using existing `CitedValue.astro` or the current cited figure component.
- Preserve source, date, confidence, and granularity.
- Use hairline divisions, not nested cards.

- [ ] **Step 4: Build `EvidenceMap.astro` and `EvidenceMapPinList.astro`**

Responsibilities:

- Render a static evidence map shell first.
- Render every pin in an accessible pin list.
- Include serialized pin JSON in a script tag for future MapLibre enhancement.
- Do not load MapLibre until tile provider, terms, privacy, and visual style are confirmed.

Acceptance:

- Chania can ship with the static shell plus pin list if interactive MapLibre would delay the first town page.
- The component API does not change when MapLibre is added.

- [ ] **Step 5: Build `EvidenceExplorer.astro` and `EvidenceRow.astro`**

Responsibilities:

- Render all evidence rows as HTML.
- Group by category using semantic `<details>`.
- Each row has `id="evidence-{rowKey}"`.
- Each row exposes:
  - `data-row-key`
  - `data-coverage-status`
  - `data-granularity`
  - `data-confidence`
  - `data-verified-date`
  - `data-source-name`
- Source gaps render as source gaps.
- Proxy rows render a method caveat.
- Inherited rows render inheritance labels.

- [ ] **Step 6: Build `SourceGapNote.astro`**

Responsibilities:

- Render public-safe reasons for unavailable or blocked rows.
- Never expose private working notes, raw scraper errors, or internal source-search logs.

- [ ] **Step 7: Build `PlaceChildrenIndex.astro`**

Responsibilities:

- Render child places for country or region templates.
- Link to live child routes.
- Show data-readiness labels only when they are public-safe.

- [ ] **Step 8: Verify component render output**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
```

Expected:

- Build passes.
- `verify:build` passes.
- No component creates a second `<h1>`.
- No component hides the fence or source metadata.

- [ ] **Step 9: Commit dossier components**

Run:

```bash
git add packages/web/src/components/dossier
git commit -m "feat(web): add dossier components"
```

Expected:

- Commit succeeds with only dossier component files.

## Task 7: port `places/[...path].astro` to the dossier system for Chania first

**Files:**

- Modify: `packages/web/src/pages/places/[...path].astro`
- Test: existing build and JSON-LD tests.

- [ ] **Step 1: Preserve route and JSON-LD behavior**

Before editing, run:

```bash
corepack pnpm --filter @where/web build
node - <<'NODE'
const fs = require("fs");
const html = fs.readFileSync("packages/web/dist/places/greece/crete/chania/index.html", "utf8");
console.log({
  hasPlaceJsonLd: html.includes('"@type":"Place"') || html.includes('"@type": "Place"'),
  hasDatasetJsonLd: html.includes('"@type":"Dataset"') || html.includes('"@type": "Dataset"'),
  hasFence: html.includes("Sourced screening information"),
});
NODE
```

Expected:

- Place JSON-LD is present.
- Dataset JSON-LD is present.
- Fence is present.

- [ ] **Step 2: Replace page-body construction with the dossier view model**

Route behavior:

- `getStaticPaths` continues to use live places.
- Route calls `buildDossierViewModel(place)`.
- Route chooses country, region, or place module stack based on `model.template`.
- Chania renders all adaptive-place modules.
- Other place pages may continue with the existing simple body only if the model has no complete bundle. They must not pretend to be complete dossiers.

- [ ] **Step 3: Render Chania modules**

Chania module order:

1. breadcrumb;
2. `DossierHero`;
3. `FenceBlock`;
4. answer-first summary;
5. `DossierSignalBoard`;
6. `EvidenceMap`;
7. place body sections;
8. known gaps and proxy values;
9. `EvidenceExplorer`;
10. `SourcesList`;
11. `CiteThis`;
12. related pages;
13. CTA.

- [ ] **Step 4: Ensure evidence rows remain crawlable**

Run:

```bash
corepack pnpm --filter @where/web build
node - <<'NODE'
const fs = require("fs");
const html = fs.readFileSync("packages/web/dist/places/greece/crete/chania/index.html", "utf8");
const rows = [...html.matchAll(/data-row-key="/g)].length;
const sourceSearch = html.includes("source_search_required");
console.log({ rows, sourceSearch });
if (rows !== 254) process.exit(1);
if (sourceSearch) process.exit(1);
NODE
```

Expected:

- `rows` is 254.
- `sourceSearch` is false.

- [ ] **Step 5: Run gates**

Run:

```bash
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
corepack pnpm test
corepack pnpm verify:data
```

Expected:

- Build, build gates, link gate, and tests pass.
- `verify:data` passes or fails only on a Command/Data documented publication-hold condition. If it still fails, do not deploy the Chania page as complete.

- [ ] **Step 6: Commit Chania dossier route**

Run:

```bash
git add packages/web/src/pages/places/[...path].astro
git commit -m "feat(web): render Chania as an evidence dossier"
```

Expected:

- Commit succeeds with only the route change if components and view model were already committed.

## Task 8: rendered visual QA before live

**Files:**

- Create: `docs/superpowers/plans/reports/2026-06-29-live-readiness-visual-qa.md`
- No runtime code required.

- [ ] **Step 1: Start or confirm local dev server**

Run:

```bash
corepack pnpm --filter @where/web dev -- --host 127.0.0.1
```

Expected:

- Dev server serves `http://127.0.0.1:4321/`.
- If port 4321 is occupied by the existing server, use it.

- [ ] **Step 2: Capture and review key routes**

Routes:

- `/`
- `/compare/greece-portugal-spain`
- `/screener`
- `/guides`
- `/places`
- `/places/greece/crete/chania`
- `/sources`
- `/methodology`
- `/privacy`
- `/terms`

Viewports:

- 1440 by 1000
- 768 by 1000
- 390 by 844

For each route, inspect:

- no visible overlap;
- nav fits;
- mobile menu opens and closes;
- source metadata is readable;
- fence is visible before high-liability claims;
- no generic card pile dominates an evidence page;
- no content hides behind animation;
- map pin list is accessible without JavaScript;
- no missing image or engraving.

- [ ] **Step 3: Write the visual QA report**

Create `docs/superpowers/plans/reports/2026-06-29-live-readiness-visual-qa.md`:

```markdown
# Live readiness visual QA

Date: 2026-06-29

## Routes checked

| Route | Desktop | Tablet | Mobile | Result |
|---|---|---|---|---|
| / | checked | checked | checked | pass |
| /compare/greece-portugal-spain | checked | checked | checked | pass |
| /screener | checked | checked | checked | pass |
| /guides | checked | checked | checked | pass |
| /places | checked | checked | checked | pass |
| /places/greece/crete/chania | checked | checked | checked | pass |
| /sources | checked | checked | checked | pass |
| /methodology | checked | checked | checked | pass |
| /privacy | checked | checked | checked | pass |
| /terms | checked | checked | checked | pass |

## Findings

No blocking visual defects found.

## Notes

Record any non-blocking polish items here with route, viewport, screenshot path, and owner.
```

If a route fails, replace `pass` with `blocked` and write the exact defect.

- [ ] **Step 4: Commit visual QA report**

Run:

```bash
git add docs/superpowers/plans/reports/2026-06-29-live-readiness-visual-qa.md
git commit -m "docs(qa): record live readiness visual pass"
```

Expected:

- Commit succeeds with one report file.

## Task 9: deploy eligibility decision and live push

**Files:**

- No code files unless a gate fails and a fix is needed.

- [ ] **Step 1: Run final gates from a clean staging set**

Run:

```bash
git status --short
corepack pnpm --filter @where/web build
corepack pnpm verify:build
corepack pnpm verify:links
corepack pnpm test
corepack pnpm verify:data
```

Expected:

- Status shows no unstaged changes in the files intended for live push.
- Build, `verify:build`, `verify:links`, and tests pass.
- `verify:data` passes, or Command Center explicitly signs off that the known Chania data gate blocks only the unfinished dossier and does not block a v5 plus IA live push.

- [ ] **Step 2: Decide what is allowed to go live**

Use this rule:

- If Chania dossier is not data-gate clean, do not promote it as the first completed town page.
- If v5 homepage, screener, compare, guides, sources, legal pages, and hubs are clean, they can go live if Command Center accepts the documented data gate.
- If public navigation links to Chania before Chania is page-gate clean, label it as an open file or coverage record, not a completed dossier.

- [ ] **Step 3: Push through normal Git path**

Run:

```bash
git push origin feat/v5-port
```

Expected:

- Push succeeds.
- Vercel preview deploy starts for the branch.

- [ ] **Step 4: Verify Vercel preview**

Check:

- homepage loads;
- nav links resolve;
- `/guides`, `/places`, `/privacy`, `/terms` load;
- `/sitemap.xml` includes new static routes;
- noindex pages stay noindex;
- Plausible script is present if expected.

- [ ] **Step 5: Merge or promote after founder approval**

Only after founder approval:

```bash
git switch main
git pull --ff-only
git merge --ff-only feat/v5-port
git push origin main
```

If the repo uses PRs rather than direct merge, open the PR and wait for the Vercel production path.

- [ ] **Step 6: Postdeploy checks**

Run against production:

```bash
curl -I https://mysecondcountry.com/
curl -I https://mysecondcountry.com/guides
curl -I https://mysecondcountry.com/places
curl -I https://mysecondcountry.com/privacy
curl -I https://mysecondcountry.com/terms
curl -I https://mysecondcountry.com/sitemap.xml
```

Expected:

- Each returns 200.
- `sitemap.xml` is XML.
- Canonicals use `https://mysecondcountry.com`.

## Task 10: first market artifact after live

**Files:**

- Modify only content projection docs or content packet files if Command Center owns the update.

- [ ] **Step 1: Choose the first public artifact**

Use this rule:

- If Chania is live and page-gate clean, use Chania as the first place-specific artifact.
- If Chania is still held, use the source-literacy content packet already identified in `docs/msc-room-state.json`.

- [ ] **Step 2: Check the fence**

The artifact must include:

- source name;
- verified date;
- confidence wording;
- no advice language;
- page URL or hold reason.

- [ ] **Step 3: Publish only with James approval**

No external post, outreach, index submission, affiliate application, or payment test is automatic.

## Final verification matrix

Before declaring live readiness, record:

| Gate | Command or evidence | Required result |
|---|---|---|
| Web build | `corepack pnpm --filter @where/web build` | pass |
| Build guards | `corepack pnpm verify:build` | pass |
| Link audit | `corepack pnpm verify:links` | pass |
| Tests | `corepack pnpm test` | pass |
| Data gate | `corepack pnpm verify:data` | pass or documented Command/Data signoff |
| Visual QA | `docs/superpowers/plans/reports/2026-06-29-live-readiness-visual-qa.md` | no blockers |
| Legal basics | `/privacy`, `/terms`, `/affiliate-disclosure` if needed | public-safe |
| Production routes | `curl -I` checks | 200 |
| Dossier status | Chania handoff | `data_bundle_ready` before completed-dossier claim |

## Self-review

Spec coverage:

- v5 visual doctrine is covered in Task 1, Task 2, Task 8, and Task 9.
- Evidence corridors and dossier shelf are covered in Task 1 and Task 3.
- Legal and fence requirements are covered in Task 4 and the final matrix.
- Dossier page template system is covered in Task 5, Task 6, and Task 7.
- Data Desk publication hold is covered in Task 5 and Task 9.
- Ship discipline is covered in Task 9 and Task 10.

No known gaps:

- This plan does not build broad country expansion.
- This plan does not build paid dossier UI.
- This plan does not add MapLibre until map provider and terms are settled.
- This plan does not turn old design prompts into active visual authority.
