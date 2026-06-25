# ADR log

Any decision that contradicts an accepted ADR requires a NEW superseding ADR, numbered in sequence and explicitly referencing the ADR it supersedes. Silent changes to accepted decisions are not permitted. This log is append-only.

---

## ADR-0001: Content-as-code JSON dataset, no database

**Status:** Accepted
**Date:** 2026-06-24

### Context

The project is a dataset-driven programmatic SEO engine with a solo founder who has near-zero energy for infrastructure upkeep. A database adds deployment complexity, migration risk, backup overhead, and a live dependency that can silently break the build pipeline. The dataset at v1 is small enough to live in version-controlled JSON files. Human review is required before any data change reaches production.

### Decision

All Place data lives in `packages/data/` as TypeScript-imported JSON files. No database, no ORM, no migration tooling. The build reads from the filesystem. The refresh pipeline writes JSON files and opens a PR; the human merge gate is the write path to production.

### Consequences

- Dataset size is bounded by what fits comfortably in a monorepo. At country/region/town granularity for Europe, this is well within limits for years.
- Every data change is a Git commit, fully auditable and revertable.
- No live query path means no latency, no connection pool, no downtime risk.
- A database migration becomes necessary only if the dataset grows beyond practical JSON management or if real-time user-generated data is required. That triggers a superseding ADR. The founder already runs Supabase, so if the JSON dataset ever outgrows files, Supabase/Postgres is the natural managed-database option alongside or instead of SQLite/Turso.

---

## ADR-0002: Zod 4 CitedValue as the schema and citation-as-type fence

**Status:** Accepted
**Date:** 2026-06-24

### Context

Every factual claim in this project carries legal and reputational risk if it is wrong, stale, or unsourced. The liability fence requires that claims be traceable to a primary source with a verification date and a stated confidence level. Enforcing this at runtime review is unreliable. Enforcing it at the type level makes a citation structurally mandatory.

### Decision

Every factual field in a Place object is typed as `CitedValue<T>`, defined in `packages/data/src/schema.ts` using Zod 4. The shape is `{ value: T, sourceUrl: string, sourceName: string, verifiedDate: string, confidence: "high" | "medium" | "low", granularity: "country" | "region" | "town" }`. A plain scalar is a type error. The schema is the single source of truth for both validation and TypeScript inference.

### Consequences

- No claim can enter the dataset without a citation. The build fails if a field is missing required CitedValue properties.
- Confidence and granularity are machine-readable, enabling on-page disclosure and scoring adjustments in `packages/engine`.
- Schema changes require a version bump and a review of all affected JSON files.
- Authoring is more verbose than plain JSON; this is intentional friction that forces sourcing discipline.

---

## ADR-0003: Granularity enum country|region|town with on-page honesty

**Status:** Accepted
**Date:** 2026-06-24

### Context

Data quality varies by place. A national average for cost of living is a different claim than a town-specific figure. Presenting both with identical visual weight misleads the reader and exposes the project to accuracy complaints.

### Decision

The `granularity` field on every `CitedValue` uses the enum `"country" | "region" | "town"`. The web layer reads this value and renders a visible qualifier beside any claim that is not town-level (for example, "national average" or "regional estimate"). Pages never present country-level data as if it is hyper-local.

### Consequences

- Readers see exactly how specific a data point is, reducing the risk of misapplication.
- Engine scoring can discount lower-granularity claims when computing a place score (see `docs/engine-weights.md`).
- Adding a new granularity (for example, `"neighbourhood"`) requires a schema change and a superseding ADR.

---

## ADR-0004: Astro 6 on Cloudflare Workers static assets, not Cloudflare Pages

**Status:** Superseded by ADR-0013
**Date:** 2026-06-24

### Context

Cloudflare offers two deployment targets: Pages and Workers. As of 2026, Cloudflare Pages is in maintenance mode and new features are being built into Workers only. `@astrojs/cloudflare` targets Cloudflare Workers. Deploying to a maintenance-mode platform creates upgrade debt from day one.

### Decision

The `packages/web` Astro 6 site deploys to Cloudflare Workers static assets via `@astrojs/cloudflare`. The `wrangler.toml` and CI deploy step target Workers. Cloudflare Pages is not used.

### Consequences

- The project is on the supported deployment path with access to current and future Cloudflare primitives.
- `wrangler` is the deployment CLI; the team must be comfortable with Workers configuration.
- Server-side AI-crawler logging (see `docs/analytics.md`) is possible via Workers middleware without a separate service.
- Any future switch back to Pages requires a superseding ADR and a migration plan.

---

## ADR-0005: Claude API for all content generation

**Status:** Accepted
**Date:** 2026-06-24

### Context

The project generates programmatic content at scale: place descriptions, screening summaries, newsletter copy, and social post drafts. The founder builds with Anthropic tooling and has existing API access. Mixing providers adds credential management overhead and inconsistent output contracts.

### Decision

All LLM content generation calls go through the Anthropic Claude API. Prompts and response parsing live in `packages/engine/src/content-gen/`. No other LLM provider is wired. Model selection follows the economy rule in `AGENTS.md`: Opus-tier for judgment and synthesis, Sonnet for implementation-scale generation.

### Consequences

- Single provider to monitor for pricing, rate limits, and model deprecations.
- Content generation cost is visible in one billing dashboard.
- Switching providers requires a superseding ADR and a rewrite of the content-gen module.
- All generated content is subject to the cited-not-advice fence in ADR-0008 before it reaches the dataset.

---

## ADR-0006: Refresh pipeline via tsx scripts and one GitHub Actions cron, human merge gate

**Status:** Accepted
**Date:** 2026-06-24

### Context

Data freshness matters for credibility. The founder has near-zero energy for manual upkeep. But automatic writes to production without review create the risk of silently publishing stale, incorrect, or hallucinated data. The refresh system must run itself and still require a human decision before anything ships.

### Decision

Data refresh runs as `tsx` scripts in `scripts/`. A single GitHub Actions cron triggers the pipeline on a schedule. The pipeline fetches sources, runs the update logic, writes updated JSON files, and opens a pull request. A human merges the PR to deploy. No automated push to main or production deploy without a merge.

### Consequences

- The founder can ignore the system entirely between cron runs. Review happens at PR time, not in a live dashboard.
- The PR diff is the audit trail for every data change.
- Latency between source change and published update is bounded by cron frequency plus merge time. For a screening intelligence product, this is acceptable.
- If unattended PRs accumulate, the project visibly falls behind. That is a deliberate signal to the founder to either merge or adjust the cron frequency.

---

## ADR-0007: Affiliate-first monetization with a Stripe fake-door

**Status:** Accepted
**Date:** 2026-06-24

### Context

The project is solo-built and pre-revenue. The fastest path to monetization is affiliate links embedded in primary-source citations (relocation services, bank accounts, SIM cards, insurance). A paid product tier is plausible but unvalidated. Building the full paid product before validating demand is a classic founder failure mode.

### Decision

v1 monetization is affiliate links only. A Stripe Checkout fake-door (a button that goes to a real Checkout session but surfaces a "join the waitlist" confirmation rather than fulfilling a product) is added to measure willingness to pay before any paid product is built. Affiliate link placement and fake-door conversion are tracked in `docs/analytics.md`.

### Consequences

- Revenue can start from the first published place page with no product build.
- The fake-door validates demand before the founder spends time on a paid feature.
- If the fake-door converts above a threshold defined in `SHIP.md`, a paid product ADR follows.
- Affiliate links must be disclosed per FTC and UK ASA rules; disclosure copy lives in `FENCE.md`.

---

## ADR-0008: Cited-not-advice liability fence

**Status:** Accepted
**Date:** 2026-06-24

### Context

Residency, tax, and immigration claims are legally sensitive. In the UK, providing immigration advice without regulation is a criminal offence under the Immigration and Asylum Act 1999. Tax and legal advice without appropriate licensing creates civil liability. The on-camera founders presenting this content could be personally exposed if framing drifts into advice.

### Decision

Every page and piece of content is framed as cited screening intelligence pointing to primary sources, not advice. The visible fence text "This is not legal, tax, or immigration advice. Verify all information with a licensed professional and the relevant official source before making any decision" appears on every residency, tax, and visa claim. The on-camera couple are "relocators sharing sourced data", not advisors. UK immigration facts are reported from official government sources only; no interpretation or routing. The fence template lives in `FENCE.md` and is referenced by all content-gen prompts.

### Consequences

- Every content-gen prompt must include the fence instruction. Prompts that omit it fail review.
- The fence reduces conversion pressure but protects the founders from legal exposure.
- Any content that drifts into advice framing (interpretation, recommendation, routing to a professional) is a content defect, not a feature.
- This decision cannot be superseded without legal review.

---

## ADR-0009: Scoring is config-driven, confidence-aware, and disclosed on-page

**Status:** Accepted
**Date:** 2026-06-24

### Context

The screening engine assigns scores to places to help users filter. Opaque scores without disclosed methodology are misleading and invite distrust. Scores that treat low-confidence data identically to high-confidence data produce false precision. Hardcoded weights are invisible to the founder and require a code change to tune.

### Decision

Scoring weights live in `docs/engine-weights.md` and are imported by `packages/engine/src/scoring/`. Every place score page discloses the methodology and the confidence distribution of the underlying data. A claim with `confidence: "low"` is weighted less than `confidence: "high"` per the formula in `docs/engine-weights.md`. The scoring function is pure and unit-tested in Vitest 3.

### Consequences

- The founder can tune weights by editing `docs/engine-weights.md` without touching engine code.
- On-page disclosure satisfies the spirit of the cited-not-advice fence for quantitative claims.
- Users who distrust the weights can follow every citation to the primary source.
- Scoring methodology changes require an update to `docs/engine-weights.md` and a note in the ADR log, but do not require a superseding ADR unless the fundamental approach changes.

---

## ADR-0010: English-first with hreflang/locale URL structure reserved for i18n

**Status:** Accepted
**Date:** 2026-06-24

### Context

The target audience at v1 is English-speaking relocators. Building i18n infrastructure before there is a non-English audience wastes build time and adds routing complexity. However, adding i18n later to a URL structure designed without it is painful.

### Decision

All v1 content is English. URLs are structured as `/places/[country]/[region]/[town]` without a locale prefix. When i18n is added, it will use the `hreflang` standard with locale-prefixed URLs (for example, `/de/places/...`). The current URL structure is designed to accommodate this by being purely path-based, with no locale baked in at root. The Astro i18n routing config is not enabled in v1 but is documented in `docs/superpowers/specs/2026-06-24-v1-design.md` as the intended future shape.

### Consequences

- Zero i18n build cost at v1.
- A future i18n addition will require a URL migration with redirects. The PR for that migration must reference this ADR and its superseder.
- Content-gen prompts are English-only; adding a locale parameter to prompts is the extension point.

---

## ADR-0011: Target WCAG 2.1 AA, do not rely on the EAA microenterprise exemption

**Status:** Accepted
**Date:** 2026-06-24

### Context

The European Accessibility Act (EAA) came into force in June 2025 and applies to digital products serving EU users. Microenterprises (fewer than 10 employees, under EUR 2m turnover) may qualify for an exemption. However, relying on the exemption means the product will fail to serve users with disabilities, creates risk if the business grows past the threshold, and signals poor craft.

### Decision

The project targets WCAG 2.1 AA compliance from the start. Accessibility is treated as a build requirement, not a retrofit. The EAA microenterprise exemption is explicitly not relied upon. Automated accessibility checks run in CI. See `DEFINITION_OF_DONE.md` for the per-page AA checklist.

### Consequences

- Component development takes slightly longer upfront but avoids expensive remediation later.
- The project is defensible if the microenterprise threshold is ever exceeded or the exemption is narrowed.
- WCAG 2.1 AA is the floor; AAA criteria are not required but are welcomed where they cost nothing.

---

## ADR-0012: Four-process-doc cap

**Status:** Accepted
**Date:** 2026-06-24

### Context

The founder's documented failure mode is building systems and over-documenting instead of shipping. Process documentation proliferates when each new concern gets its own file. A cap forces consolidation and prevents the process layer from becoming its own project.

### Decision

Exactly four process documents exist at any time: `AGENTS.md`, `CITATIONS.md`, `FENCE.md`, and `SHIP.md`. A new process concern must be absorbed into one of these four files or, if truly incompatible, must replace one of them via an explicit swap decision noted in this log. Reference documents (specs, plans, data files, decisions, analytics, weights, projections) are separate and unlimited. This ADR log entry itself is the governing rule.

### Consequences

- Any contributor who creates a fifth process file is in violation of this ADR. The PR reviewer must reject it.
- The cap applies only to process docs (how we work, how we build, how we deploy, how we cite). It does not apply to reference docs.
- If the four files become too long, they should be tightened, not split.

---

## ADR-0013: Host on Vercel (supersedes ADR-0004)

**Status:** Accepted
**Date:** 2026-06-24

### Context

The founder already has an active Vercel account. Vercel provides the best Astro developer experience, native serverless functions without a separate Workers configuration, and a Git-native deploy model (push to `main`, Vercel auto-deploys; no wrangler config, no deploy GitHub Action). The Astro adapter model makes the host portable: switching to a different host later is a one-line change in `astro.config.ts`.

### Decision

Vercel is the host for v1. The `packages/web` Astro 6 project uses `@astrojs/vercel`. Deploy is triggered by Vercel's native Git integration on push to `main`. No `wrangler.toml`, no `wrangler deploy` step, and no `CLOUDFLARE_API_TOKEN` secret in GitHub Actions. Runtime env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PLAUSIBLE_API_KEY, etc.) are set in the Vercel project settings dashboard. Cloudflare Workers is the documented fallback if bandwidth costs ever justify a host change; that switch requires only swapping the adapter.

### Consequences

- Vercel Pro (~$20/mo) is required for commercial use; cost is a non-issue until high scale.
- The serverless functions (email capture, Stripe session, Stripe webhook) become Vercel Functions automatically via the adapter; no separate Workers bindings.
- AI-crawler detection uses Vercel Edge Middleware rather than a Workers scheduled handler; hits are recorded to Vercel Blob or a Vercel Log Drain (Pro).
- Migrating to Cloudflare Workers later is a one-adapter-line change and does not require a superseding ADR unless the project commits to Workers-specific primitives (KV, D1, R2).

---

## ADR-0014: Reference docs reconciled to the locked ADRs

**Status:** Accepted
**Date:** 2026-06-24

### Context

During the bootstrap, three reference docs had drifted from the locked ADRs. The implementation followed the ADRs (they win by the ADR rule), but the reference docs still described the old shapes, which would mislead future contributors. The three drifts: CITATIONS.md showed an eight-field, uppercase-confidence `CitedValue`; the implementation plan and llms.txt section described locale-prefixed `/en/places/...` URLs; engine-weights.md treated `confidence` as a 0.0 to 1.0 float.

### Decision

The reference docs are reconciled to the ADRs, not the other way round:

- CITATIONS.md now defines the six-field, lowercase `CitedValue` of ADR-0002, with `archiveUrl`, `excerpt`, `category`, and `stalenessDays` as optional provenance fields.
- The plan's URL structure is `/places/[country]/[region]/[town]` with no locale prefix, per ADR-0010; the `/en/` and `/el/` references and the locale redirect rule are removed.
- engine-weights.md documents the `confidence` enum and the `CONFIDENCE_FACTOR` map (high 1.0, medium 0.6, low 0.4) the engine actually uses.

No locked decision changed. This ADR only records that the prose caught up to the locked decisions.

### Consequences

- A contributor reading CITATIONS.md, the plan, or engine-weights.md now sees the same shapes the code enforces.
- If any of these shapes genuinely needs to change in future, it requires a superseding ADR first, not a quiet edit.

---

## ADR-0015: Launch artifact before full Greece breadth

**Status:** Accepted
**Date:** 2026-06-24
**Amends:** the phasing in `docs/superpowers/plans/2026-06-24-v1-implementation-plan.md` (Phase A)

### Context

A competitive read of Pieter Levels / NomadList against the founder profile in FOUNDER.md surfaced the project's biggest current risk: building more pages with zero market contact, which is the documented "building instead of shipping" failure mode. The original Phase A grinds the full Greece cluster (country plus seven regions plus five towns) before anything reaches a stranger. Levels' lesson is the opposite: get a genuinely useful, shareable artifact in front of an audience-less cold start fast, read the demand, then add depth where the audience voted.

### Decision

The golden rule is extended: a real artifact in front of strangers comes before more breadth. A new Phase A0 precedes the full Greece breadth:

1. Country-level cited data for Greece, Portugal, and Spain across the screener dimensions (cost, tax by buyer type, residency and visa, climate, healthcare, safety), every value a `CitedValue` with the fence on every page.
2. A deeply-cited "Greece vs Portugal vs Spain" comparison page across roughly ten sourced dimensions: the shareable centrepiece.
3. The free "where should I live" screener as the Astro island over `@where/engine`: constraints in, cited ranked shortlist out, fence and confidence visible.
4. A launch: Show HN plus value-first posts for r/IWantOut, r/expats, r/digitalnomad, and Greece/Portugal expat groups (copy and assets prepared here; posting is the founder's browser task). The screener and comparison fire analytics events so the launch yields a real demand signal.

All of A0 is free; there is no audience to monetize into yet. The full Greece breadth (the original Phase A) resumes as Phase A1, informed by what the launch showed people clicked and searched.

### Consequences

- The first real market contact happens weeks earlier, before sinking time into breadth that may target the wrong places.
- The comparison page and screener are the AI-citation surface (what Perplexity and AI Overviews quote), which is the wedge; they are built to be the cited source.
- Phase A1 (Greece regions and towns) is demand-led, not speculative.
- Monetization stays out of A0 deliberately. Affiliate referrals to licensed professionals (immigration lawyers, cross-border tax advisors, golden-visa firms, international health insurers) are the base case, added once there is traffic; see `docs/content-projection.md`.

---

## ADR-0016: Cited variable catalogue with profile presets

**Status:** Accepted
**Date:** 2026-06-24
**Spec:** `docs/superpowers/specs/2026-06-24-variable-system-design.md`. Registry: `docs/data/variable-registry.md`.

### Context

The product needs a deep, clickable, filterable surface of relocation variables (the Hotelist-for-relocation idea) without breaking the citation fence, and it must serve very different reader profiles (retirees, nomad families, no-kid couples, exiters) who weight the same variables oppositely. A research sweep produced roughly 200 candidate variables, almost all with a real, named, mostly auto-pullable European source.

### Decision

1. Variables are cited-only: a variable exists only if it maps to a real, named, publicly reachable source. Soft concepts become objective proxies or are dropped. The drop list is recorded.
2. A variable catalogue describes each variable once (key, category, unit, intrinsic vs relational, filter type, direction, source, default confidence, profile relevance). Per-place values stay `CitedValue` objects (ADR-0002), written at ingest, keyed by variable. Relational variables are computed at query time from user inputs against a cited base fact.
3. Coverage is hybrid: a country-level layer wide across Europe, plus a town-level lifestyle layer on flagship cities first, deepened by demand (ADR-0015).
4. Interaction is filter-to-narrow then score-to-rank on the existing engine. Unknown is never zero: it renders as "no data" and is excluded from scoring by renormalisation, never penalised.
5. Profiles are config-driven weighting presets plus deal-breaker filters (built on ADR-0009), combinable, with a custom backstop. v1 has seven base presets plus an LGBTQ+ overlay.

### Consequences

- The screener and comparison gain a large filterable, cited surface; the fence, the cited-not-advice rule, and the content-as-code JSON model are unchanged.
- The main new engineering dependency is a geospatial build step (`scripts/geo-build.ts`) that point-samples raster/vector sources at place coordinates; kept to the variables each slice needs.
- The build is sliced and demand-led, never 200 variables across 100 towns up front. Each slice ships to strangers and the first implementation plan covers slice 1 only.
- A known coverage gap (retiree-specific healthcare: English-speaking doctors, elder-care quality, private-insurance cost) has no open source yet; either a further hunt finds one or the profile is honest about it.

---

## ADR-0017: Regime as a sibling cited collection, dataset endpoint, live staleness

**Status:** Accepted
**Date:** 2026-06-25
**Builds on:** ADR-0001, ADR-0002, ADR-0008, ADR-0010, ADR-0016. Supersedes nothing.
**Spec:** `docs/superpowers/specs/2026-06-25-regime-flagship-page.md`. Plan: `docs/superpowers/plans/2026-06-25-regime-flagship-page.md`.

### Context

A0 (ADR-0015) is live. The first deep page after A0 is the Greece foreign-pensioner 7% flat-tax regime page: a single high-intent tax rule owned end to end, with a cited "what would disqualify you" hero and a machine-readable cited dataset. It needs five architecture decisions resolved without contradicting any locked ADR.

### Decision

1. **Data model: own collection, not a Place section.** A new `regimes` content collection in `packages/data` with its own `RegimeSchema` (ADR-0001 content-as-code, ADR-0002 CitedValue). A regime references its country Place by id; `PlaceSchema` is unchanged. `collectCitedValues` gains a regime sibling so the citation, freshness, and source guards cover regime fields.
2. **Route family: a new dynamic route outside `/places/...`** (ADR-0010 unaffected): `packages/web/src/pages/[country]/tax/[slug].astro` via `getStaticPaths` over the collection. Regimes carry the same stable-`id` / mutable-`slug` split a Place has.
3. **Dataset endpoint: a static Astro endpoint** (`src/pages/data/regimes/[slug].json.ts`) emitting `/data/regimes/<slug>.json` from the same `getCollection` source as the page, plus `schema.org/Dataset` JSON-LD on the page, an `llms.txt` entry, and a "cite this" snippet per fact. Per-fact ids are **derived** (`<regime-id>#<field-path>`), not stored on the CitedValue, so the ADR-0002 shape stays locked; field names become a stable contract.
4. **Engine reuse: a thin adapter, not a drop-in.** The dealbreaker card reuses the ADR-0016 deal-breaker shape and the retiree-shaped presets, but the regime's eligibility fields are not slice-1 relocation-catalogue variables, so they are modelled as the regime's own cited eligibility constraints. The card presents the binding constraints as cited, dated rules framed against the foreign-pensioner profile; it never renders a per-user pass/fail verdict (ADR-0008, FENCE.md).
5. **Staleness wired to the collection.** `check-freshness.ts` (the script the spec calls `validate.ts`) hard-fails CI on stale visa/tax/residency, but today only over `places`; it is extended to walk the regimes collection, and the regime page renders the self-activating staleness banner. Greek tax fields carry `stalenessDays: 60` (FENCE.md jurisdiction note).

### Consequences

- A new entity type and route family, fully additive: no `PlaceSchema` change, no superseded ADR.
- The slice-1 engine (deal-breaker filters, presets, the `placeVariables` adapter pattern) is the foundation the dealbreaker card reuses; regime eligibility variables overlap with variable-system slice 2 and must be coordinated, not duplicated.
- `validate-jsonld` checks Place JSON-LD only today and is extended to validate the regime Dataset block.
- The freshness moat fires only once `check-freshness` and `check-sources` walk the regimes collection; until then it is decorative. `check-freshness` runs in `verify:data` (CI), not in the Vercel `buildCommand`, so blocking the deploy on stale tax is a separate, optional wiring decision left to the founder.
