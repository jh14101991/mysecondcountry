# Variable system, slice 1 implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cited, profile-aware, filterable variable layer to the existing screener and comparison, shipping the shippable core (catalogue + profile presets + filter/score logic) using the GR/PT/ES data already in the repo, then enriching with a few high-signal auto-pull variables and the flagship cities.

**Architecture:** A variable catalogue (`VariableDef` describing each variable once) plus profile presets (weighting + deal-breakers) sit in `packages/data`. The existing `@where/engine` gains pure filter and profile-score functions. The screener island gains a profile selector and a filter panel. No data shape changes: every value stays a `CitedValue`. Read the spec `docs/superpowers/specs/2026-06-24-variable-system-design.md` and the registry `docs/data/variable-registry.md` first.

**Tech Stack:** TypeScript strict, pnpm workspace, Zod 4, Vitest 3, Astro 6, Biome 2.

## Global Constraints

- Node >= 22, pnpm only, TypeScript strict, `moduleResolution: bundler`, relative imports end `.js`.
- Cited-only: every variable maps to a real named source; a value is a `CitedValue` (ADR-0002: `value, sourceUrl, sourceName, verifiedDate, confidence "high"|"medium"|"low", granularity`).
- Visa/tax/residency values are `high|medium` only (schema-enforced) and never `low`.
- The liability fence renders on every page carrying a visa/tax/residency variable (FENCE.md). Low confidence renders its badge. Country-on-town figures render the granularity label.
- The engine never outputs a per-person verdict; output reads "matches N of M stated criteria" (FENCE.md).
- Copy rules: no em dashes; no AI-register words (leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust); sentence case headings.
- Guards stay green and keep gating the Vercel deploy: `pnpm verify:data`, `pnpm verify:build`, `pnpm test`, `pnpm exec biome check .`, root `tsc`.
- Do not relitigate locked ADRs (0001-0016); a contradicting change needs a superseding ADR first.
- Unknown is never zero: a place missing a variable is excluded from that variable's score by renormalisation, never penalised.

---

### Task 1: Variable and profile Zod schemas

**Files:**
- Create: `packages/data/src/variables/schema.ts`
- Test: `packages/data/src/variables/__tests__/schema.test.ts`

**Interfaces:**
- Produces: `VariableDefSchema`, `ProfileSchema`, and `type VariableDef`, `type Profile`, `type ProfileId`. `VariableDef = { key, label, category, unit?, kind: "intrinsic"|"relational", filterType: "toggle"|"range"|"select"|"boolean", direction: "higherBetter"|"lowerBetter"|"neutral", source: { name, url, autoPull: "yes"|"partial"|"manual" }, defaultConfidence: Confidence, profileRelevance: Partial<Record<ProfileId,"high"|"medium"|"low">> }`. `Profile = { id: ProfileId, label, weights: Record<string,number>, surfaced: string[], dealBreakers: { key, op: "<="|">="|"=="|"in", value: unknown }[] }`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { ProfileSchema, VariableDefSchema } from "../schema.js";

describe("variable + profile schemas", () => {
  it("accepts a valid variable def", () => {
    const v = {
      key: "cost_price_level", label: "Cost of living", category: "cost",
      unit: "EU27=100", kind: "intrinsic", filterType: "range", direction: "lowerBetter",
      source: { name: "Eurostat tec00120", url: "https://ec.europa.eu/eurostat", autoPull: "yes" },
      defaultConfidence: "high", profileRelevance: { budgetRetiree: "high", soloNomad: "medium" },
    };
    expect(VariableDefSchema.safeParse(v).success).toBe(true);
  });
  it("rejects an http (non-https) source url", () => {
    const v = { key: "x", label: "X", category: "cost", kind: "intrinsic", filterType: "range",
      direction: "neutral", source: { name: "n", url: "http://x", autoPull: "yes" },
      defaultConfidence: "low", profileRelevance: {} };
    expect(VariableDefSchema.safeParse(v).success).toBe(false);
  });
  it("accepts a valid profile and rejects a negative weight", () => {
    const p = { id: "budgetRetiree", label: "Budget retiree", weights: { cost_price_level: 0.4 },
      surfaced: ["cost_price_level"], dealBreakers: [] };
    expect(ProfileSchema.safeParse(p).success).toBe(true);
    expect(ProfileSchema.safeParse({ ...p, weights: { cost_price_level: -1 } }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify it fails** — `pnpm --filter @where/data exec vitest run src/variables` → FAIL (module missing).

- [ ] **Step 3: Implement `schema.ts`**

```ts
import { z } from "zod";
import { ConfidenceSchema } from "../schema.js";

const HTTPS = z.string().url().refine((u) => u.startsWith("https://"), "must be https");

export const ProfileIdSchema = z.enum([
  "wealthyRetiree", "budgetRetiree", "recentExiter", "nomadFamily",
  "noKidCouple", "soloNomad", "employedRemote",
]);
export type ProfileId = z.infer<typeof ProfileIdSchema>;

export const VariableCategorySchema = z.enum([
  "cost", "tax", "visa", "climate", "nature", "travel", "health", "safety", "community",
]);

export const VariableDefSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9_]+$/),
  label: z.string().min(1),
  category: VariableCategorySchema,
  unit: z.string().optional(),
  kind: z.enum(["intrinsic", "relational"]),
  filterType: z.enum(["toggle", "range", "select", "boolean"]),
  direction: z.enum(["higherBetter", "lowerBetter", "neutral"]),
  source: z.object({ name: z.string().min(1), url: HTTPS, autoPull: z.enum(["yes", "partial", "manual"]) }),
  defaultConfidence: ConfidenceSchema,
  profileRelevance: z.record(ProfileIdSchema, z.enum(["high", "medium", "low"])),
});
export type VariableDef = z.infer<typeof VariableDefSchema>;

export const ProfileSchema = z.object({
  id: ProfileIdSchema,
  label: z.string().min(1),
  weights: z.record(z.string(), z.number().nonnegative()),
  surfaced: z.array(z.string()),
  dealBreakers: z.array(z.object({
    key: z.string(), op: z.enum(["<=", ">=", "==", "in"]), value: z.unknown(),
  })),
});
export type Profile = z.infer<typeof ProfileSchema>;
```

- [ ] **Step 4: Run test, verify pass.** `pnpm --filter @where/data exec vitest run src/variables`
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat(data): variable + profile zod schemas"`

---

### Task 2: Slice-1 catalogue

**Files:**
- Create: `packages/data/src/variables/catalog.ts`
- Test: `packages/data/src/variables/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: `VariableDef` (Task 1).
- Produces: `export const CATALOG: VariableDef[]` and `export function variableByKey(key: string): VariableDef | undefined`. Slice-1 keys: `cost_price_level`, `top_income_tax_rate`, `special_tax_regime`, `dnv_income_floor`, `golden_visa`, `winter_high`, `summer_high`, `annual_sunshine`, `koppen`, `physicians_per_1k`, `gpi_score`, `english_proficiency`, `air_quality_pm25`, `cafe_density`, `gym_density`.

Author each from the registry (`docs/data/variable-registry.md`): copy the source name and a real URL, set `kind` (all intrinsic except none in slice 1), `filterType` (range for numbers, boolean for koppen-style, select where appropriate), `direction`, and `profileRelevance` from the profile lens in the spec.

- [ ] **Step 1: Failing test** asserts: every `key` unique and matches `/^[a-z0-9_]+$/`; every entry parses through `VariableDefSchema`; `CATALOG.length >= 15`; visa/tax entries have `defaultConfidence` in `["high","medium"]`; `variableByKey("cafe_density")` is defined.
- [ ] **Step 2: Run, verify fail.**
- [ ] **Step 3: Implement `catalog.ts`** with the 15 `VariableDef` objects (real source URLs from the registry; e.g. `air_quality_pm25` source `{ name: "OpenAQ", url: "https://openaq.org", autoPull: "yes" }`; `cafe_density` `{ name: "OpenStreetMap", url: "https://www.openstreetmap.org", autoPull: "partial" }`).
- [ ] **Step 4: Run, verify pass.**
- [ ] **Step 5: Commit.** `feat(data): slice-1 variable catalogue`

---

### Task 3: Profile presets

**Files:**
- Create: `packages/data/src/profiles/presets.ts`
- Test: `packages/data/src/profiles/__tests__/presets.test.ts`

**Interfaces:**
- Consumes: `Profile` (Task 1), `CATALOG`/`variableByKey` (Task 2).
- Produces: `export const PROFILES: Profile[]` (the 7 base presets) and `export const LGBTQ_OVERLAY: { dealBreakers: Profile["dealBreakers"]; weights: Record<string,number> }`, plus `export function composeProfile(base: Profile, overlay?): Profile`.

- [ ] **Step 1: Failing test:** every `Profile` parses; every key in `weights`, `surfaced`, and `dealBreakers` exists in the catalogue (`variableByKey` truthy); `PROFILES` has all 7 ids; `composeProfile(budgetRetiree, LGBTQ_OVERLAY)` adds the overlay deal-breakers and keeps base weights.
- [ ] **Step 2: Run, verify fail.**
- [ ] **Step 3: Implement** the 7 presets (weights from the profile lens: budget retiree weights `cost_price_level`, `physicians_per_1k`, `gpi_score`, climate high; nomad family weights `dnv_income_floor`, climate, `air_quality_pm25`, `english_proficiency`; etc.), the overlay (deal-breaker on an `lgbt_*` key plus a weight; note `lgbt_*` is not a slice-1 catalogue variable yet, so for slice 1 the overlay weights `english_proficiency` and `gpi_score` and carries a placeholder note that the `lgbt_social` deal-breaker activates when that variable lands in slice 2), and `composeProfile`.
- [ ] **Step 4: Run, verify pass.**
- [ ] **Step 5: Commit.** `feat(data): profile presets + lgbtq overlay`

---

### Task 4: Place variables map + adapter from existing fields

**Files:**
- Modify: `packages/data/src/schema.ts` (add optional `variables` to `PlaceSchema`)
- Create: `packages/data/src/variables/from-place.ts`
- Test: `packages/data/src/variables/__tests__/from-place.test.ts`

**Interfaces:**
- Produces: `PlaceSchema` gains `variables: z.record(z.string(), <citedValue>).optional()`. `export function placeVariables(place: Place): Record<string, CitedValue>` returns a flat map keyed by catalogue key, derived from the existing typed fields (`costOfLiving.priceLevelIndexEU27` -> `cost_price_level`, `tax.headlinePersonalIncomeTaxRate` -> `top_income_tax_rate`, `residency.digitalNomadVisa` -> `dnv_income_floor`, `climate.*`, `healthcare.physiciansPer1000` -> `physicians_per_1k`, `safety.peaceIndexScore` -> `gpi_score`) merged over `place.variables` if present.

- [ ] **Step 1: Failing test:** `placeVariables(greece)` has `cost_price_level`, `top_income_tax_rate`, `dnv_income_floor`, `gpi_score`, each a valid `CitedValue`; a key with no data is simply absent (unknown), not null.
- [ ] **Step 2: Run, verify fail.**
- [ ] **Step 3: Implement** the optional `variables` field and `placeVariables` adapter. Keep the existing typed fields (the launch pages still use them).
- [ ] **Step 4: Run, verify pass; also `pnpm --filter @where/data test` (existing fixtures still parse).**
- [ ] **Step 5: Commit.** `feat(data): place variables map + adapter`

---

### Task 5: Engine filter function

**Files:**
- Create: `packages/engine/src/filter.ts`
- Test: `packages/engine/src/__tests__/filter.test.ts`

**Interfaces:**
- Consumes: `placeVariables` (Task 4), `CATALOG`/`variableByKey` (Task 2), `Place` (data).
- Produces: `type ActiveFilter = { key: string; min?: number; max?: number; equals?: string | boolean; requireData?: boolean }`. `export function applyFilters(places: Place[], filters: ActiveFilter[]): Place[]`. A place passes a filter if its value satisfies min/max/equals; if the value is unknown it passes UNLESS `requireData` is true.

- [ ] **Step 1: Failing test:** three places with `cost_price_level` 80/90/100 and `applyFilters(..., [{ key:"cost_price_level", max: 92 }])` returns the 80 and 90 places; a place missing the key passes; with `requireData:true` the missing place is excluded.
- [ ] **Step 2-4:** implement and verify (pure function, no I/O).
- [ ] **Step 5: Commit.** `feat(engine): cited-variable filter with unknown handling`

---

### Task 6: Engine profile score

**Files:**
- Create: `packages/engine/src/profile-score.ts`
- Test: `packages/engine/src/__tests__/profile-score.test.ts`

**Interfaces:**
- Consumes: `placeVariables`, `variableByKey`, `Profile`, `CONFIDENCE_FACTOR` (existing `packages/engine/src/weights.ts`).
- Produces: `type ProfileScore = { placeId: string; score: number; usedKeys: string[]; missingKeys: string[]; dealBreakerFailed: boolean }`. `export function scoreByProfile(place: Place, profile: Profile, criteria?: Record<string, { min?: number; max?: number }>): ProfileScore`. Score = 100 * sum over known surfaced keys of (weight * confidenceFactor * normalisedGoodness) / sum(weight * confidenceFactor over known), so unknown keys are renormalised out, never scored 0. `normalisedGoodness` is 1 if the value satisfies the user's criterion (or no criterion), else 0, oriented by `direction`. Deal-breakers set `dealBreakerFailed` true.

- [ ] **Step 1: Failing test:** a place missing half a profile's keys is scored only on the keys it has (renormalised), never penalised to 0; a deal-breaker breach sets the flag; same input twice is deep-equal (deterministic, pass a fixed value set).
- [ ] **Step 2-4:** implement and verify (pure).
- [ ] **Step 5: Commit.** `feat(engine): profile-weighted score with renormalised unknowns`

---

### Task 7: Screener gains profile selector + filter panel (SHIPPABLE MILESTONE)

**Files:**
- Modify: `packages/web/src/pages/screener.astro`
- Test: browser check via the preview tool (`.claude/launch.json` "web") plus existing `pnpm verify:build`.

**Interfaces:** Consumes `PROFILES`, `composeProfile`, `applyFilters`, `scoreByProfile`, `CATALOG`, `placeVariables`, `places` (all from `@where/data` / `@where/engine`).

- [ ] **Step 1:** add a "Start as" `<select>` of the 7 profiles plus an LGBTQ+ checkbox overlay, and render the profile's `surfaced` variables as filter controls (range slider for range, checkbox for boolean) generated from the catalogue.
- [ ] **Step 2:** in the island `<script>`, on change: `applyFilters(places, activeFilters)` then `scoreByProfile` per survivor, sort desc, render the existing rank-card markup (reuse the `:global` styled cards). Keep the fence and confidence visible. Keep relational inputs (income) feeding the DNV check.
- [ ] **Step 3:** `pnpm --filter @where/web build` then preview and confirm in a browser that picking "budget retiree" vs "nomad family" reorders the three countries and the surfaced filters change. Confirm "no data" shows distinctly, not as a low score.
- [ ] **Step 4:** `pnpm verify:build` passes (fence, JSON-LD, a11y, robots).
- [ ] **Step 5: Commit.** `feat(web): profile-aware filtering on the screener`

---

### Task 8: Analytics for the demand sensor

**Files:** Modify: `packages/web/src/pages/screener.astro` (island script).

- [ ] **Step 1:** fire `Profile Selected` (props: profile id) and `Filter Used` (props: variable key) Plausible events, plus keep `Screener Run`.
- [ ] **Step 2:** build, preview, confirm events fire in the browser console (Plausible queue) on interaction.
- [ ] **Step 3: Commit.** `feat(web): profile + filter analytics events`

---

### Task 9 (enrichment): flagship cities + first new auto-pull variables

> Optional within slice 1; do after the milestone ships. Keep it small.

**Files:** Create `packages/data/src/places/{gr-attica-athens,pt-lisbon,es-valencia}.json` (Chania already exists); a `scripts/ingest-osm-amenities.ts` for `cafe_density` and `gym_density` via Overpass for the four flagship cities; register in `packages/data/src/places/index.ts`.

- [ ] **Step 1:** author the three city Place JSONs (country-level data inherited via ancestry note + their own cited town values where available), each passing `PlaceSchema.parse`.
- [ ] **Step 2:** write `scripts/ingest-osm-amenities.ts` (Overpass `amenity=cafe` and `leisure=fitness_centre` counts within a radius of each city centroid, divided by population, written as `CitedValue`s into the place `variables` map; sourceUrl the OSM/Overpass URL, confidence low, granularity town).
- [ ] **Step 3:** run it locally, confirm valid `CitedValue`s and `check-sources` passes; `pnpm verify:data` and `pnpm test` green.
- [ ] **Step 4: Commit.** `feat(data): flagship cities + first OSM amenity variables`

---

## Self-review notes

- Spec coverage: catalogue (T2), profiles + overlay (T3), values-stay-CitedValues + relational note (T4), filter-narrow (T5), score-rank with unknown-never-zero (T6), interaction + profile onboarding (T7), demand-sensor analytics (T8), flagship cities + auto-pull enrichment (T9). Geospatial build is represented minimally by T9's Overpass ingest; the full `scripts/geo-build.ts` raster pipeline is slice 2.
- The shippable milestone is Task 7: profile-aware filtering on the existing GR/PT/ES data, which reaches strangers without the heavy ingest.
- Deferred to slice 2 (own plan): the `lgbt_social` and other registry variables, the raster geospatial build, country-layer widening across the EU, the comparison page filters, and the visual design once the brand lands.
