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
