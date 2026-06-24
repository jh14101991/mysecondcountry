# Variable system design (the clickable-variable engine)

**Status:** Design, approved in brainstorming 2026-06-24. Pre-build. Visual layer deferred to
the brand thread.
**Companion:** `docs/data/variable-registry.md` is the source-of-truth list of ~200 cited
variables and the datasets behind them. This spec defines the model, interaction, profiles, and
build sequence on top of it.

---

## 1. Purpose

Turn the product from a handful of fixed dimensions into a deep, clickable, filterable surface of
relocation variables (the Hotelist-for-relocation idea), without breaking the citation fence.
Every variable stays a cited, dated fact. A reader filters and ranks places by what matters to
their own situation; the engine returns a cited, ranked shortlist with the fence and confidence
visible.

## 2. Decisions locked (do not relitigate)

1. **Cited-only (no exceptions).** A variable exists only if it maps to a real, named, publicly
   reachable source. Soft concepts become objective proxies ("coffee culture" = cafes per 10k
   from OpenStreetMap) or they are dropped. The drop list lives in the registry.
2. **Hybrid coverage (C).** A country-level layer rolled wide across Europe for the institutional
   data, plus a town-level lifestyle layer (OpenStreetMap, climate and nature point-samples) on a
   few flagship cities first: Athens, Lisbon, Valencia, Chania. Usage drives which cities and
   variables deepen next (demand-led, ADR-0015).
3. **Interaction: filter narrows, score ranks.** Tickable tags and range sliders narrow the
   candidate set; the existing `@where/engine` scores and ranks the survivors with confidence
   weighting; every result stays fully cited with the fence.
4. **Profiles are weighting presets plus deal-breakers**, built on the config-driven weights of
   ADR-0009. Combinable, with a custom backstop.
5. **Visual design deferred** to the brand thread; this spec is the substance.

## 3. Data model

### 3.1 Variable catalog

A new catalog describes each variable once, independent of any place. Generated from and
validated against `docs/data/variable-registry.md`.

```ts
interface VariableDef {
  key: string;              // stable id, e.g. "cafe_density"
  label: string;            // human label
  category: VariableCategory; // cost | tax | visa | climate | nature | travel | health | safety | community ...
  unit?: string;            // "EUR/month", "C", "per 10k", "%", "index"
  kind: "intrinsic" | "relational"; // intrinsic = fact about a place; relational = computed vs user input
  filterType: "toggle" | "range" | "select" | "boolean";
  direction: "higherBetter" | "lowerBetter" | "neutral"; // for scoring + leader tags
  source: { name: string; url: string; autoPull: "yes" | "partial" | "manual" };
  defaultConfidence: Confidence; // typical tier; the actual value carries its own
  profileRelevance: Partial<Record<ProfileId, "high" | "medium" | "low">>;
}
```

The catalog is data-versioned in `packages/data` (one JSON, or generated from the registry by a
script). A CI check asserts the catalog and the registry agree (no orphan variables either way).

### 3.2 Values stay CitedValues

Per-place values do not change shape: each is still a `CitedValue` (ADR-0002), keyed by variable
`key`, written at ingest time. A `Place` gains an open `variables: Record<string, CitedValue>`
map alongside the existing typed fields (which remain for the launch pages). Missing key = unknown
(see 5).

Relational variables (kind: "relational") are NOT stored per place. They are computed at query
time from the user's inputs against a cited base fact: direct flights to *your* hubs (cited base:
the route dataset), tax treaty with *your* country (cited base: the treaty list), timezone overlap
with *your* clients (cited base: the tz database), citizenship by descent for *your* ancestry,
pet-import rules from *your* country.

### 3.3 Profiles

```ts
interface Profile {
  id: ProfileId;            // wealthyRetiree | budgetRetiree | recentExiter | nomadFamily |
                            // noKidCouple | soloNomad | employedRemote
  label: string;
  weights: Record<string, number>;     // variable key -> weight (config-driven, ADR-0009)
  surfaced: string[];                  // which variables show by default for this profile
  dealBreakers: { key: string; op: "<=" | ">=" | "==" | "in"; value: unknown }[];
}
```

Profiles are named presets over the catalog. They are **combinable** (stack two presets), an
**LGBTQ+ overlay** adds acceptance/legal deal-breakers to any base profile, and **custom** is the
backstop. v1 set: seven base presets (wealthy retiree, budget retiree, recent-exiter/FIRE,
digital-nomad family, no-kid couple, solo nomad, employed remote professional) plus the LGBTQ+
overlay. They span the axes that change weighting: life-stage, wealth level, employment structure,
and values.

## 4. Coverage and the profile lens

The registry is the universe; profiles select and weight a slice. The catalog's `profileRelevance`
records, per variable, which profiles weight it. This is also the coverage audit: a profile is
well-served when its high-relevance variables all resolve to a source. Known coverage hole: the
retiree-shaped healthcare specifics (English-speaking doctors, elder-care quality, private-
insurance cost) are unsourced and currently dropped; see open items.

## 5. Unknown handling (non-negotiable)

A place with no value for a variable is **unknown**, never zero. Rules:
- Unknown renders as "no data", visually distinct, never as a bad score.
- A hard filter excludes an unknown place only if the user opts in ("require data for this filter").
- Scoring ignores unknown variables for that place and renormalises across the variables it does
  have, so a place is never penalised for data we simply have not gathered yet.

## 6. Ingestion and the data pipeline

Extends the existing pattern (ADR-0006: tsx clients, one cron, human merge gate).

- **Auto-pull sources** (most of the registry): Eurostat, OpenStreetMap/Overpass, Ookla Open Data,
  OpenAQ, OurAirports, WHO GHO, OECD, and the institutional indices (CPI, GPI, RSF, EF EPI,
  Equaldex, parkrun). Each gets a typed client under `packages/data/src/clients/`, returns raw
  typed data, throws on non-200, logs source URL + date, writes a `CitedValue` at import time.
- **Geospatial build** (`scripts/geo-build.ts`): the heaviest new dependency. Point-samples and
  buffers the raster/vector sources (WorldClim, Copernicus CORINE/ERA5, NOAA OISST, SRTM, VIIRS,
  Natura 2000/WDPA, OSM Overpass amenity counts) at each place's coordinates, bakes results into
  the dataset. Runs at data-build time, not per request. Requires Python/GDAL or DuckDB-spatial;
  documented in `packages/data/README.md`.
- **Manual-but-cited sources**: tax (PwC/official), visa/residency (national ministries), school
  directories. Human reads, dates, archives; refresh on the human merge gate. These never go on
  the automated cron (SOURCES.md rule).
- Cadence per source (Eurostat annual, Ookla quarterly, OSM rolling, indices annual). Visa/tax keep
  the 60-90 day staleness gate.

## 7. Interaction (logic; visual deferred)

1. The reader picks a profile preset ("start as a...") or custom, and supplies relational inputs
   (home country, home hubs, client timezone) as needed.
2. A filter panel of tags (toggle/boolean/select) and sliders (range) narrows the candidate places.
3. The engine scores the survivors with the profile weights and confidence weighting, applies
   deal-breakers as hard filters, and returns a cited, ranked shortlist with per-dimension reasons,
   the fence, and confidence badges.
4. "No data" is shown distinctly; nothing is a per-person verdict (FENCE.md).

The screener island (already shipped for GR/PT/ES) is the home for this. The comparison page gains
the same filters as a static, shareable view.

## 8. Build sequence (anti-over-building, demand-led)

Do NOT ingest 200 variables across 100 towns up front. Slices, each shipped to strangers:

- **Slice 1:** the catalog + `profileRelevance`, the profile presets config, and ~10 to 15
  high-signal auto-pull filters (cost, tax rate, DNV floor, climate, air quality, internet,
  safety, English, café/gym density) wired onto the existing comparison and screener for GR/PT/ES
  plus the four flagship cities. Watch which filters and profiles get used (analytics already wired).
- **Slice 2:** widen the country layer across the EU for the country-level variables; deepen the
  cities the launch data says people want.
- **Slice 3+:** the long tail of variables and cities, demand-led.

The geospatial build lands in slice 1 only for the handful of raster variables it needs, then grows.

## 9. Testing

- Catalog-vs-registry agreement (CI): no orphan variables either direction.
- Every per-place value parses as a `CitedValue`; the existing citation and freshness checks extend
  to the `variables` map.
- Profile presets: weights are sane (non-negative, surfaced keys exist in the catalog), deal-breaker
  keys exist, the LGBTQ+ overlay composes.
- Filter logic unit-tested: a toggle/range narrows correctly; "require data" toggles unknown handling.
- Relational calc deterministic (same inputs, same output), pure.
- Unknown never scores as 0; renormalisation tested.
- Fence assertions unchanged: every page with a visa/tax/residency variable carries the fence; low
  confidence renders its badge; granularity honesty holds.

## 10. Open items and risks

- **Retiree healthcare gaps**: mostly closed by a follow-up hunt. Elder-care quality now has a
  source (OECD Health at a Glance, Safe long-term care). English-speaking-doctor availability uses
  the EF English Proficiency Index as a labelled population proxy. Private-insurance cost stays out
  for now (no age-accurate per-country table) and becomes a computed field only with a live quote
  API, which doubles as an affiliate surface, so it is deferred to monetization.
- **Live direct flights** are paid data; v1 uses the stale OpenFlights skeleton with a staleness
  note, or treats it relationally with a caveat.
- **Geospatial build** is the main new engineering dependency and the main schedule risk; keep it
  to the few raster variables a slice needs.
- **Visual design** of the filter surface is pending the brand thread; this spec is logic only.
- **Scope**: this is large. The first implementation plan covers slice 1 only; later slices get
  their own plans.

## 11. What does not change

The fence, the cited-not-advice rule, the four-process-doc cap, content-as-code JSON, the host, and
the engine's "matches N of M, never a verdict" framing all stand. This is an expansion of the data
surface and the screener, not a new product.
