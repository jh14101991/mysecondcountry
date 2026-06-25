# Regime flagship page implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first deep page after A0: the Greece foreign-pensioner 7% flat-tax regime page, a single cited rule with a "what would disqualify you" hero, a public cited dataset endpoint, and live staleness monitoring.

**Architecture:** A new `regimes` content collection in `packages/data` (sibling to Place, ADR-0017), each field a `CitedValue`. A new Astro route `[country]/tax/[slug].astro` outside the locked `/places/...` tree renders it, with a dealbreaker hero built from a pure engine function over the regime's eligibility fields. A static Astro endpoint emits `/data/regimes/<slug>.json` from the same source, with derived per-fact ids, `schema.org/Dataset` JSON-LD, an `llms.txt` entry, and a "cite this" snippet. The freshness and source guards are extended to walk the regimes collection so stale tax data fails CI.

**Tech Stack:** TypeScript strict, pnpm workspace, Zod 4, Vitest 3, Astro 6, Biome 2.

## Global Constraints

- Node >= 22, pnpm only, TypeScript strict, `moduleResolution: bundler`, relative imports end `.js`.
- Read first: `docs/superpowers/specs/2026-06-25-regime-flagship-page.md`, ADR-0017, FENCE.md, CITATIONS.md.
- Cited-only (ADR-0002): every regime field is a `CitedValue` (`value, sourceUrl (https), sourceName, verifiedDate (YYYY-MM-DD), confidence, granularity`). An uncited or undated claim fails schema validation. No invented numbers: every value is pulled from a primary source at ingest and carries its own `verifiedDate`. PwC is a MEDIUM source; an official gazette/AADE page is HIGH.
- Visa/tax/residency values are `high|medium` only (schema-enforced), never `low`. Greek tax fields carry `stalenessDays: 60` (FENCE.md jurisdiction note).
- The fence renders on the regime page (it carries tax/residency claims). The dealbreaker card states published eligibility rules and routes to a licensed professional; it never renders a per-user pass/fail verdict and never says "you should not move here" (ADR-0008, FENCE.md).
- Copy rules: no em dashes; no AI-register words (leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust); sentence case headings; conservative and sourced.
- Guards stay green and keep gating the deploy: `pnpm verify:data`, `pnpm verify:build`, `pnpm test`, `pnpm exec tsc --noEmit -p tsconfig.json`. The Vercel `buildCommand` is `pnpm --filter @where/web build && pnpm verify:build`.
- Do not relitigate locked ADRs (0001-0017); a contradicting change needs a superseding ADR first. PlaceSchema is unchanged by this plan.
- Stage explicit paths on commit, never `git add -A` (a parallel design thread writes untracked files under `packages/web/public/mockups/`).

---

### Task 1: Regime Zod schema

**Files:**
- Create: `packages/data/src/regimes/schema.ts`
- Test: `packages/data/src/regimes/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: `citedValue`, `highLiabilityValue` are NOT exported from `packages/data/src/schema.ts` today (`citedValue` IS exported; `highLiabilityValue` is module-private). Use the exported `TaxValueSchema`, `ResidencyValueSchema`, `TaxRegimeValueSchema` factories where they fit, and the exported `citedValue` factory plus a local high-liability wrapper for the rest. Confirm exports by reading `packages/data/src/schema.ts` first.
- Produces: `RegimeSchema`, `type Regime`, `RegimeIdSchema`, `type RegimeId`. Shape:
  `Regime = { id, slug, name, countryId, regimeType: "tax", headlineRate: TaxValue, durationYears: TaxValue, eligibility: { priorNonResidency: ResidencyValue(string), qualifyingCountry: ResidencyValue(string), residencyObligation: ResidencyValue(string), applicationWindow: TaxValue(string), knownCatch: TaxValue(string) }, summary }`. `id` and `slug` are url-safe lowercase; `countryId` is a Place id string; `summary` is human-authored prose >= 80 chars (anti-thin-content).

- [ ] **Step 1: Read the existing schema** so the wrapper matches. Run: `sed -n '1,95p' packages/data/src/schema.ts`. Note `citedValue<T>(value)`, `TaxValueSchema` (number, category "tax", high|medium), `ResidencyValueSchema` (number, "residency", high|medium), `TaxRegimeValueSchema` (string, "tax"), `GoldenVisaValueSchema` (string, "residency"). The eligibility rules are string-valued high-liability claims, so a string high-liability wrapper is needed.

- [ ] **Step 2: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { RegimeSchema } from "../schema.js";

const cv = (value: string | number, category: "tax" | "residency") => ({
  value, sourceUrl: "https://taxsummaries.pwc.com/greece/individual/other-tax-credits-and-incentives",
  sourceName: "PwC Worldwide Tax Summaries, Greece", verifiedDate: "2026-06-25",
  confidence: "medium" as const, granularity: "country" as const, category, stalenessDays: 60,
});
const valid = {
  id: "greece-foreign-pensioner-flat-tax", slug: "foreign-pensioner-flat-tax",
  name: "Greece foreign-pensioner 7% flat tax", countryId: "gr", regimeType: "tax",
  headlineRate: cv(7, "tax"), durationYears: cv(15, "tax"),
  eligibility: {
    priorNonResidency: cv("Not a Greek tax resident for 5 of the prior 6 years.", "residency"),
    qualifyingCountry: cv("Transfer from a country with an administrative-cooperation agreement with Greece.", "residency"),
    residencyObligation: cv("Becomes a Greek tax resident for the regime years.", "residency"),
    applicationWindow: cv("Apply by 31 March of the tax year of transfer.", "tax"),
    knownCatch: cv("The 7 percent covers all foreign-source income; losing a condition ends the regime.", "tax"),
  },
  summary: "Greece taxes a qualifying foreign pensioner's worldwide foreign-source income at a flat 7 percent for up to 15 years. The figures below are screened, sourced, and dated. They are not advice.",
};

describe("RegimeSchema", () => {
  it("accepts a fully cited regime", () => {
    expect(RegimeSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a tax field with confidence low", () => {
    const bad = structuredClone(valid);
    (bad.headlineRate as { confidence: string }).confidence = "low";
    expect(RegimeSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a missing sourceUrl on an eligibility field", () => {
    const bad = structuredClone(valid);
    delete (bad.eligibility.priorNonResidency as { sourceUrl?: string }).sourceUrl;
    expect(RegimeSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a short summary (anti-thin-content)", () => {
    expect(RegimeSchema.safeParse({ ...valid, summary: "too short" }).success).toBe(false);
  });
});
```

- [ ] **Step 3: Run, verify fail.** `pnpm --filter @where/data exec vitest run src/regimes` (module missing).

- [ ] **Step 4: Implement `schema.ts`.** Import `z` and the needed factories from `../schema.js`. Define a string high-liability wrapper mirroring the existing private one (`citedValue(z.string().min(1)).extend({ confidence: z.enum(["high","medium"]), category: z.literal(...) })`). Build `RegimeSchema` with the fields above (`id`/`slug` regex `/^[a-z0-9-]+$/`, `countryId` min 1, `regimeType: z.literal("tax")`, `summary` `.min(80)`). Export `RegimeSchema`, `type Regime`, `RegimeIdSchema` (a `z.string().regex`), `type RegimeId`.

- [ ] **Step 5: Run, verify pass.** Then `pnpm --filter @where/data exec tsc --noEmit` and `pnpm exec biome check packages/data/src/regimes`.

- [ ] **Step 6: Commit.** `git add packages/data/src/regimes/schema.ts packages/data/src/regimes/__tests__/schema.test.ts && git commit -m "feat(data): regime zod schema"`

---

### Task 2: The Greece pensioner regime data + index

**Files:**
- Create: `packages/data/src/regimes/greece-foreign-pensioner-flat-tax.json`
- Create: `packages/data/src/regimes/index.ts`
- Modify: `packages/data/src/index.ts` (re-export the regimes index)
- Test: `packages/data/src/regimes/__tests__/index.test.ts`

**Interfaces:**
- Consumes: `RegimeSchema`, `type Regime` (Task 1).
- Produces: `export const regimes: Regime[]`, `export function regimeBySlug(slug: string): Regime | undefined`, `export function regimeById(id: string): Regime | undefined`. Re-exported from `@where/data`.

**No invented numbers.** Each value is verified at ingest from a primary source and carries its own `verifiedDate` and `confidence`. Starting sources (verify each, archive a snapshot, copy the excerpt verbatim per CITATIONS.md): PwC Greece "other tax credits and incentives" and "residence" pages (`https://taxsummaries.pwc.com/greece/individual/...`, MEDIUM); the Greek Income Tax Code Article 5B and AADE guidance for the eligibility specifics (HIGH where a gazette/AADE permalink resolves). The 7 percent rate and 15-year duration are already cited in `packages/data/src/places/gr.json` (`tax.specialRegime`, PwC); reuse that primary source and re-verify the date.

- [ ] **Step 1: Failing test** (`index.test.ts`): `regimes.length >= 1`; `regimeBySlug("foreign-pensioner-flat-tax")` is defined and `regimeById("greece-foreign-pensioner-flat-tax")` is defined; the regime parses through `RegimeSchema`; `countryId === "gr"` and `placeById("gr")` (from `../index.js`) is defined (the country reference resolves); every collected eligibility field has `confidence` in `["high","medium"]`. Assert structure, not specific values.

- [ ] **Step 2: Run, verify fail.**

- [ ] **Step 3: Author the JSON** with verified, cited values for every field in the Task 1 shape, each carrying `sourceUrl` (https permalink), `sourceName`, `verifiedDate`, `confidence`, `granularity: "country"`, `category` ("tax" or "residency"), `stalenessDays: 60`, and an `excerpt`. Write `index.ts` loading the JSON with `import raw from "./greece-foreign-pensioner-flat-tax.json" with { type: "json" }` and `RegimeSchema.parse(raw)` (mirror `places/index.ts`). Add `export * from "./regimes/index.js"` to `packages/data/src/index.ts`.

- [ ] **Step 4: Run, verify pass; also `pnpm --filter @where/data test`** (all existing fixtures still parse).

- [ ] **Step 5: Commit.** `feat(data): greece foreign-pensioner regime data + index`

---

### Task 3: collectRegimeCitedValues + derived fact ids

**Files:**
- Create: `packages/data/src/regimes/facts.ts`
- Modify: `packages/data/src/index.ts` (re-export)
- Test: `packages/data/src/regimes/__tests__/facts.test.ts`

**Interfaces:**
- Consumes: `type Regime` (Task 1), `type CitedValue` (from `../schema.js`).
- Produces: `export function collectRegimeCitedValues(regime: Regime): { path: string; cited: CitedValue }[]` (walks the regime's CitedValue-shaped fields with a dotted path, reusing the same detection as `collectCitedValues`: a node is a CitedValue when it has `value`, `sourceUrl`, and `verifiedDate`). `export function regimeFactId(regimeId: string, path: string): string` returning `` `${regimeId}#${path}` ``.

- [ ] **Step 1: Failing test:** `collectRegimeCitedValues(regime)` includes paths `headlineRate`, `durationYears`, `eligibility.priorNonResidency`, `eligibility.knownCatch`, each a valid CitedValue; `regimeFactId("greece-foreign-pensioner-flat-tax", "headlineRate") === "greece-foreign-pensioner-flat-tax#headlineRate"`.

- [ ] **Step 2-4:** implement (copy the recursive `visit` shape from `collectCitedValues` in `schema.ts`, walking `regime.headlineRate`, `regime.durationYears`, and `regime.eligibility`), re-export from the package index, verify.

- [ ] **Step 5: Commit.** `feat(data): regime cited-value walker + derived fact ids`

---

### Task 4: Engine dealbreaker cards

**Files:**
- Create: `packages/engine/src/regime-eligibility.ts`
- Modify: `packages/engine/src/index.ts` (re-export)
- Test: `packages/engine/src/__tests__/regime-eligibility.test.ts`

**Interfaces:**
- Consumes: `type Regime`, `collectRegimeCitedValues` (from `@where/data`).
- Produces: `type EligibilityCard = { factPath: string; cited: CitedValue; framing: string }`. `export function regimeEligibilityCards(regime: Regime): EligibilityCard[]`. Pure, deterministic. Returns one card per `eligibility.*` field (NOT the headline rate or duration), in a stable order, each with a neutral fence-safe `framing` string of the form `"Published rule: <value>. This would exclude an applicant for whom it does not hold. Verify with a licensed professional."` Never a per-user verdict.

- [ ] **Step 1: Failing test:** `regimeEligibilityCards(regime)` returns exactly the eligibility fields (length 5), in a fixed order, each `factPath` starting `"eligibility."`, each `cited` a valid CitedValue, each `framing` containing "Verify with a licensed professional" and NOT containing "you should"; calling twice is deep-equal (deterministic).

- [ ] **Step 2-4:** implement and verify (pure; iterate `collectRegimeCitedValues(regime)` filtered to paths starting `"eligibility."`, build the framing). Re-export `regimeEligibilityCards` and `type EligibilityCard` from the engine index.

- [ ] **Step 5: Commit.** `feat(engine): regime eligibility dealbreaker cards`

---

### Task 5: Regime page route + Dataset JSON-LD + cite-this

**Files:**
- Create: `packages/web/src/pages/[country]/tax/[slug].astro`
- Modify: `packages/web/src/lib/jsonld.ts` (add `regimeDatasetJsonLd`)
- Test: browser check via the preview tool plus `pnpm --filter @where/web build`.

**Interfaces:** Consumes `regimes`, `regimeById`, `collectRegimeCitedValues`, `regimeFactId`, `isStale`, `ageInDays`, `DEFAULT_STALENESS_DAYS` (`@where/data`), `regimeEligibilityCards` (`@where/engine`), `FenceBlock`, `CitedValueCell`, `Base`. Produces the page at `/greece/tax/foreign-pensioner-flat-tax`.

- [ ] **Step 1:** add `regimeDatasetJsonLd(regime, site)` to `lib/jsonld.ts` returning a `schema.org` object `{ "@context", "@type": "Dataset", name, description: regime.summary, url, isAccessibleForFree: true, creator, license, distribution: [{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: \`${site}/data/regimes/${regime.slug}.json\` }], variableMeasured: <one entry per collected fact with name=path and a derived @id of regimeFactId> }`. Model the structure on the existing `placeJsonLd`.

- [ ] **Step 2:** create the page. `getStaticPaths()` maps `regimes` to `{ params: { country: <country slug from regimeById(regime.countryId)>, slug: regime.slug }, props: { regime } }` (resolve the country slug from the referenced Place; for "gr" it is "greece"). Render, in order: `<FenceBlock hasLegalClaims={true} staleDays={...} />` using the same self-activating staleness computation as `places/[...path].astro` but over `collectRegimeCitedValues(regime)`; the dealbreaker hero as a list of `regimeEligibilityCards(regime)` (each card shows the framing, the cited value, a confidence badge, and the source link + verified date); the headline facts (rate, duration) via `CitedValueCell`; a "cite this" line per fact (`<sourceName>, verified <verifiedDate>, <canonical URL>#<factPath>`); the Dataset JSON-LD in the head via the `Base` `jsonLd` prop. Canonical: `${SITE}/${country}/tax/${slug}`.

- [ ] **Step 3:** `pnpm --filter @where/web build`, then preview and confirm in a browser: the page renders at `/greece/tax/foreign-pensioner-flat-tax`, the fence is above the fold, the five dealbreaker cards each carry a source link and verified date, no card phrases a per-user verdict, and the head contains a `Dataset` JSON-LD block.

- [ ] **Step 4:** `pnpm verify:build` still passes (assert-fence sees the fence on the new tax page).

- [ ] **Step 5: Commit.** `feat(web): regime flagship page with dealbreaker hero`

---

### Task 6: Public dataset endpoint

**Files:**
- Create: `packages/web/src/pages/data/regimes/[slug].json.ts`
- Test: `pnpm --filter @where/web build` then assert the emitted file.

**Interfaces:** Consumes `regimes`, `collectRegimeCitedValues`, `regimeFactId` (`@where/data`).

- [ ] **Step 1:** write the Astro endpoint: `export function getStaticPaths()` mapping `regimes` to `{ params: { slug: regime.slug }, props: { regime } }`; `export const GET: APIRoute = ({ props }) => new Response(JSON.stringify(buildDataset(props.regime), null, 2), { headers: { "content-type": "application/json" } })`. `buildDataset(regime)` returns `{ id, slug, name, countryId, regimeType, facts: collectRegimeCitedValues(regime).map(({ path, cited }) => ({ id: regimeFactId(regime.id, path), path, ...cited })) }`, serialising the CitedValues verbatim.

- [ ] **Step 2:** `pnpm --filter @where/web build`, then confirm `packages/web/dist/data/regimes/foreign-pensioner-flat-tax.json` exists, is valid JSON, and every `facts[].id` matches `<regime-id>#<path>` and carries `sourceUrl` + `verifiedDate`. (Use `node -e` to parse and assert.)

- [ ] **Step 3: Commit.** `feat(web): public cited regime dataset endpoint`

---

### Task 7: llms.txt entry

**Files:**
- Modify: `packages/web/public/llms.txt`
- Test: `pnpm --filter @where/web build` then grep the built `llms.txt`.

- [ ] **Step 1:** read the current `packages/web/public/llms.txt` and add, in its existing style, an entry pointing at the regime page and its dataset: the canonical page URL `https://mysecondcountry.com/greece/tax/foreign-pensioner-flat-tax` and the dataset URL `https://mysecondcountry.com/data/regimes/foreign-pensioner-flat-tax.json`, with a one-line description (no em dashes, sentence case).

- [ ] **Step 2:** `pnpm --filter @where/web build` and confirm `packages/web/dist/llms.txt` contains both URLs.

- [ ] **Step 3: Commit.** `docs(web): list the regime page and dataset in llms.txt`

---

### Task 8: Extend the guards to the regimes collection

**Files:**
- Modify: `scripts/check-freshness.ts`
- Modify: `scripts/check-sources.ts`
- Modify: `scripts/validate-jsonld.ts`
- Test: `pnpm verify:data`, `pnpm verify:sources`, `pnpm verify:build`.

**Interfaces:** Consumes `regimes`, `collectRegimeCitedValues` (`@where/data`).

- [ ] **Step 1:** `check-freshness.ts`: after the `places` loop, add a `regimes` loop using `collectRegimeCitedValues(regime)` with the same high-liability (`visa|tax|residency`) staleness hard-fail and per-field `stalenessDays` override. A stale regime tax field must `process.exit(1)`.

- [ ] **Step 2:** `check-sources.ts`: add each regime's `collectRegimeCitedValues(...).cited.sourceUrl` to the `urls` set so the link-rot check covers regime sources.

- [ ] **Step 3:** `validate-jsonld.ts`: it filters to `/places/` today. Add a second check that the regime page (`htmlFiles().filter((f) => f.includes("/tax/"))`) carries a well-formed JSON-LD block whose `@type` is `Dataset`. Keep the Place check unchanged.

- [ ] **Step 4:** run `pnpm verify:data`, `pnpm verify:sources`, `pnpm --filter @where/web build && pnpm verify:build`. All green. Confirm the freshness guard actually covers the regime by temporarily back-dating one regime field locally and seeing it fail, then reverting.

- [ ] **Step 5: Commit.** `feat(guards): freshness, sources, and JSON-LD guards cover the regimes collection`

---

## Self-review notes

- Spec coverage: regime as data (T1, T2), the rule as the subject and route family (T2, T5), the dealbreaker card (T4, T5), machine-first emission (T5 JSON-LD + cite-this, T6 endpoint, T7 llms.txt), staleness machinery live (T8 + the T5 self-activating banner). The deferred provocations (source disagreement, sell-the-proof) are out of scope per the spec.
- ADR-0017 records the five architecture decisions; PlaceSchema is unchanged; no ADR is superseded.
- The dealbreaker card presents cited published rules framed against the foreign-pensioner profile and never a per-user verdict (FENCE.md, ADR-0008). assert-fence covers the new tax page automatically.
- Engine reuse is a thin pure function over the regime's own eligibility fields; the relocation-catalogue deal-breaker variables (slice 2 of the variable system) are a separate, later coordination point, not duplicated here.
- The freshness moat fires only because T8 extends `check-freshness` and `check-sources` to the regimes collection. `check-freshness` runs in CI (`verify:data`), not the Vercel `buildCommand`; blocking the deploy on stale tax is a separate decision left to the founder (noted in ADR-0017).
