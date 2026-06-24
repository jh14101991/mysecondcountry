# v1 implementation plan

> Master build doc for the execution session. Follow phases in order. Do not skip bootstrap steps. Reference sibling docs for detail; this file gives the sequence and the concrete gates.

---

## 1. Bootstrap order (week 1, sequential commits)

Each step must pass CI before the next begins. No parallel work until step (f).

### (a) Repo scaffold

1. Create the repo. Enable GitHub push protection and secret scanning immediately, before any other commit.
2. Add `.gitignore`, `.env.example` (see `SECRETS.md` for the canonical variable list), and a `SECRETS.md` stub.
3. Create `pnpm-workspace.yaml` declaring `packages/*`.
4. Add `package.json` at root with `engines: { node: ">=22" }` and `pnpm` as the only package manager.
5. Add a shared `tsconfig.base.json` at root: `strict: true`, `moduleResolution: "bundler"`, `target: "ES2022"`.
6. Add `biome.json` at root: Biome 2, lint + format, import sorting on. Wire `biome check --write` as a pre-commit hook via `simple-git-hooks` + `lint-staged`.
7. Add `vitest.workspace.ts` at root pointing at `packages/*/vitest.config.ts`.
8. Create this repo's OWN `.claude/` operating layer, isolated from byImprint: a project `.claude/settings.json` and an empty `.claude/skills/` directory. This repo does NOT inherit byImprint's project skills (they are scoped to that repo); it inherits only user-level generic skills and the three global rules, which is fine. One hard exclusion: do NOT use the `byimprint-design` skill or any byImprint design tokens; My Second Country has its own identity, built fresh. Add business-specific skills and workflows here only, and only once a task genuinely repeats (for example a data-refresh workflow, a place-research skill, a source-verify skill). Do not pre-build a skill library; that is the over-building failure mode in `FOUNDER.md`.
9. Verify: `pnpm install && pnpm biome check && pnpm test` all pass on an empty workspace.

Gate: green CI, no secrets in history, push protection active.

### (b) `packages/data`: Zod schema + Greece fixture

1. Scaffold `packages/data/package.json` (`name: "@where/data"`, `exports: { ".": "./src/index.ts" }`).
2. Install `zod@4` as a dependency.
3. Author the canonical schemas in `packages/data/src/schema.ts`:
   - `CitedValue<T>`: `{ value: T, sourceUrl: string, sourceName: string, verifiedDate: string (ISO 8601 date), confidence: "high" | "medium" | "low", granularity: "country" | "region" | "town" }`.
   - `Place`: structured object with `id` (stable opaque slug), `slug` (URL-mutable, must redirect on change), `type: "country" | "region" | "town"`, `parentId`, and CitedValue fields for every data claim (cost, climate, residency, tax, affiliate links). See `docs/superpowers/specs/2026-06-24-v1-design.md` for the full field list.
4. Add `packages/data/src/fixtures/crete-chania.ts`: a hand-authored `Place` for Chania, Crete, with real cited values (at least: monthly cost of living, average January + July high temperature, digital nomad visa reference, income tax rate stub). Every field populated. Source URLs must resolve. `verifiedDate` set to the authoring date.
5. Write `packages/data/src/__tests__/schema.test.ts`: parse the Chania fixture through the Zod schema, assert no errors, assert every `CitedValue` has all required fields.
6. Export everything from `packages/data/src/index.ts`.

Gate: `pnpm test --filter @where/data` passes. Fixture validates with zero Zod errors.

### (c) `packages/engine`: screening + scoring

1. Scaffold `packages/engine/package.json` (`name: "@where/engine"`, depends on `@where/data`).
2. Author `packages/engine/src/screen.ts`: pure function `screenPlace(place: Place, criteria: ScreeningCriteria): ScreeningResult`. No I/O, no side effects. `ScreeningCriteria` covers budget ceiling, climate floor (min/max monthly temps), visa eligibility flag, tax regime preference. `ScreeningResult` carries a weighted score, a per-dimension breakdown, and a `fenceWarnings` array for any field where `confidence` is `"low"` or `verifiedDate` is older than 90 days.
3. Author `packages/engine/src/weights.ts`: default weights object. Weights are separately documented in `docs/engine-weights.md`; keep the code reference, not the rationale.
4. Write property tests in `packages/engine/src/__tests__/screen.test.ts`:
   - Chania fixture scores within expected range under default weights.
   - Any place with a missing `sourceUrl` on a visa/tax field causes a `fenceWarning`.
   - Score is deterministic (same input, same output).
5. Export `screenPlace`, `ScreeningCriteria`, `ScreeningResult` from `packages/engine/src/index.ts`.

Gate: `pnpm test --filter @where/engine` passes. Pure, no external calls.

### (d) `packages/web`: one Astro page with JSON-LD and the fence

1. Scaffold `packages/web` as an Astro 6 project. Adapter: `@astrojs/vercel`. Output: `"static"`. No SSR yet.
2. Install `@where/data` and `@where/engine` as workspace dependencies.
3. Author `packages/web/src/pages/places/[slug].astro`:
   - At build time, generate one static route from the Chania fixture.
   - Render: place name, all CitedValues as structured table rows with source name, source URL, verified date, and confidence badge.
   - Render the legal fence as a visually distinct, always-visible component (`FenceBlock.astro`). The fence text is authoritative; see `FENCE.md`.
   - Inject `<script type="application/ld+json">` with `Place` schema.org markup and a `DataCatalog` reference.
   - No client JavaScript on this page except the Astro island placeholder (empty, renders nothing yet).
4. Author `packages/web/src/components/FenceBlock.astro`: renders the standardized liability fence. This component must appear on every page that references a visa, tax, or residency CitedValue. See `FENCE.md` for the required text.
5. Author `packages/web/src/components/CitedValueCell.astro`: renders one `CitedValue` as `<td>` with source link, date, and confidence icon. Confidence `"low"` renders a visible caution indicator.
6. Write a Vitest snapshot test (`packages/web/src/__tests__/fence.test.ts`) that renders `FenceBlock` to string and asserts the required FENCE.md phrases are present.

Gate: `pnpm build --filter @where/web` succeeds. The fence snapshot test passes. No broken links in the rendered HTML.

### (e) Deploy the single page to Vercel prod

1. Connect the repo to Vercel via Vercel's native Git integration (no deploy GitHub Action and no wrangler config needed). Vercel auto-deploys on every push to `main`. Vercel Pro (~$20/mo) is required for commercial use. See `SHIP.md` for the deployment runbook.
2. Set runtime env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PLAUSIBLE_API_KEY, etc.) in the Vercel project settings dashboard, not in GitHub Actions. See `SECRETS.md` for the full variable list.
3. The serverless functions (email capture, Stripe session, Stripe webhook) become Vercel Functions under the Astro project automatically via the `@astrojs/vercel` adapter.
4. Verify the live URL serves the Chania page with correct `Content-Type: text/html`, JSON-LD present, fence visible.
5. Verify `https://<domain>/robots.txt` and `https://<domain>/sitemap.xml` both return 200 (stubs are fine at this stage). Cloudflare Workers remains the documented fallback if bandwidth costs ever justify it; switching is a one-adapter-line change.

Gate: Chania page live in prod. Fence visible. JSON-LD validates in Google's Rich Results Test.

### (f) Data clients and the refresh pipeline

Only start after (e) is complete and the live gate passes.

1. Add `packages/data/src/clients/eurostat.ts`: typed fetch wrapper for the Eurostat REST API. Returns raw JSON; no transformation here.
2. Add `packages/data/src/clients/worldbank.ts`: typed fetch wrapper for the World Bank Indicators API.
3. Add `packages/data/src/clients/numbeo.ts`: scrape/API client for cost-of-living data. Note affiliate disclosure requirements in `CITATIONS.md`.
4. Each client: pure function, returns typed raw response, throws on non-200, logs source URL + response date for the citation chain.
5. Add `scripts/refresh-place.ts` (run via `tsx`): given a place ID, calls relevant clients, merges new values, sets `verifiedDate` to today, writes updated JSON to `packages/data/src/places/<id>.json`.
6. Add `.github/workflows/refresh.yml`: weekly cron (`0 6 * * 1`), runs `refresh-place.ts` for all Greece places, then opens a PR using `gh pr create`. No auto-merge. Human reviews and merges. See `SHIP.md` for the PR template.
7. Add a CI check in `refresh.yml`: fail if any `visa` or `tax` CitedValue in the dataset has `verifiedDate` older than 90 days AND `confidence` is not `"low"`. This forces either a refresh or an explicit confidence downgrade.

Gate: `pnpm test --filter @where/data` still passes with the new clients. Refresh script runs locally and produces a valid diff. CI check passes on the current fixture.

---

## 2. Phased build after bootstrap

### Phase A: Greece deep cluster + data layer (weeks 2 to 4)

1. Author Place objects for the full Greece seed set. See `docs/data/greece-seed.md` for the target place list and the minimum required CitedValues per place type.
2. Wire the refresh pipeline to cover all Greece places.
3. Add `packages/data/src/places/index.ts`: exports all places as a typed array. Build-time safe, no dynamic imports.
4. Extend `[slug].astro` to generate all place routes from the index.
5. Add `sitemap.xml` generation via `@astrojs/sitemap`.
6. Add a per-page uniqueness check: each town page must have at least three CitedValues that differ from the parent region page. Enforced as a build-time assertion in the Astro config. This is the programmatic-SEO uniqueness gate (see section 6).
7. Add `hreflang` and `<link rel="canonical">` to every page. URL structure: `/<locale>/places/<slug>`. Reserve `/en/`, `/el/` from day one even if only `/en/` is populated.
8. Update `docs/data/SOURCES.md` with every data source added.

Gate: all Greece places render, build passes, sitemap complete, uniqueness check passes for every town page.

### Phase B: content engine + Remotion + newsletter (weeks 5 to 8)

1. Add `packages/content/package.json` (`name: "@where/content"`, depends on `@where/data`, `@where/engine`).
2. Add `packages/content/src/generate.ts`: Claude API client that takes a `Place` and a content type (`"social-caption" | "newsletter-section" | "video-script"`) and returns a draft string. All generated content is saved as a CitedValue-annotated draft in `packages/content/src/drafts/<place-id>/<type>.md`. Human review gate before publish. See `AGENTS.md` for the agent delegation rules.
3. Remotion: install locally, not as a cloud dependency. Add `packages/content/src/video/` with a composition that takes a `Place` + a script draft and renders a short-form vertical video. Render is triggered manually by a `tsx scripts/render-video.ts <place-id>` command. Output goes to `packages/content/output/video/`. See `docs/content-projection.md` for the channel target specs.
4. Newsletter: add `packages/content/src/newsletter.ts` using Resend. Template takes a weekly digest of updated places. Resend DKIM/DMARC must be verified before the first send (see parallel track below).
5. Add `scripts/draft-content.ts`: for a given place ID and content type, calls `generate.ts`, saves draft, prints path. Human reviews draft before committing.

Gate: one Chania social caption draft generated and reviewed. One newsletter test send to `james@mysecondcountry.com`. Remotion renders one test video locally without error.

### Phase C: monetization (weeks 9 to 12)

1. Add `packages/web/src/components/AffiliateLink.astro`: wraps any outbound affiliate link, enforces `rel="sponsored noopener"`, renders a visible disclosure label, and fires a Plausible custom event on click. This component is the ONLY permitted way to render affiliate links. See `CITATIONS.md` for disclosure requirements.
2. Add affiliate CitedValue fields to Place schema: `affiliateLinks: AffiliateLink[]` where each entry carries `program`, `url` (already rel=sponsored via the component), `disclosureText`, `approvedDate`. An affiliate link without `approvedDate` must not render.
3. Stripe fake-door: add `packages/web/src/pages/pre-order.astro`. POST to `/api/checkout` which calls Stripe Checkout in test mode. The page is clearly labeled "pre-order, not yet live" in the UI. No real charges until James manually flips to live mode. See `SHIP.md` for the Stripe live-mode checklist.
4. Apply for affiliate programs immediately after name/domain/privacy-policy land (see parallel track); many programs require a live, policy-complete site.

Gate: `AffiliateLink` renders `rel="sponsored"` in every test case. Stripe fake-door completes a test checkout without error. At least one affiliate program approved.

### Phase D: measurement + month 9 to 12 gate (months 3 to 9)

1. Add Plausible script to `packages/web/src/layouts/Base.astro`. Track: pageview, affiliate link click (custom event), pre-order click, newsletter signup.
2. Add AI-crawler detection: a Vercel Edge Middleware (`packages/web/src/middleware.ts`) that runs on every request, detects known AI-crawler user-agents (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended), records the hit to Vercel Blob (or a Vercel Log Drain on Pro), and a standalone `tsx` script at `scripts/parse-ai-crawlers.ts` that reads those records on the cron schedule and writes a weekly summary to `docs/analytics.md`. See `docs/analytics.md` for the target metrics.
3. Add a `<meta name="robots">` override for any page whose most recent CitedValue is older than 90 days with confidence not downgraded: set `noindex` until refreshed.
4. Month 9 to 12 gate: defined in `DEFINITION_OF_DONE.md`. Do not invest in Phase D expansion (new countries, video production, newsletter paid tier) until that gate passes.

---

## 3. Parallel tracks: start early, not at the end

These must not be deferred to "after the build is done." They are load-bearing dependencies.

### Name and domain: RESOLVED (locked 2026-06-24, not a gate)

- Brand: My Second Country. Canonical domain: `mysecondcountry.com` (exact-match `.com`, validation-stage cost ~$11/yr). This decision is made; do not relitigate it during the build.
- First task of execution: register `mysecondcountry.com` at a registrar (Namecheap or any preferred registrar), and defensively register `secondcountry.io` and `secondcountry.co` (about $60 total) so the namespace is protected.
- Point the domain at Vercel by adding the custom domain in Vercel project settings; Vercel provides the required DNS records (A/CNAME).
- Use `mysecondcountry.com` as the canonical host in every JSON-LD `@id`, sitemap entry, hreflang tag, and affiliate application from the first page commit.
- Upgrade path (NOT a v1 task): the exact-match `secondcountry.com` is a ~$4,900 aftermarket premium. Buy it only if the idea proves out (after the month 9 to 12 gate). Until then `mysecondcountry.com` is canonical.

### Brand accounts and handles (register early, under the brand email)

Lock the namespace before anyone else does. Register every account under `james@mysecondcountry.com` (the brand-domain email, not a personal gmail), so the accounts stay on the brand domain. Use `@mysecondcountry` everywhere (it fits X's 15-character limit exactly). If any platform shows it taken at signup, use the single fallback `mysecondcountryhq` and apply that same fallback on every platform for consistency.

- [x] Domain `mysecondcountry.com` registered (via Vercel)
- [x] `james@mysecondcountry.com` brand email (set up). Register every social and infra account with it.
- [x] YouTube `@mysecondcountry`
- [ ] TikTok `@mysecondcountry`
- [ ] Instagram `@mysecondcountry`
- [ ] X / Twitter `@mysecondcountry`
- [ ] LinkedIn company page `linkedin.com/company/mysecondcountry`
- [ ] Facebook page `@mysecondcountry` (needed for Meta ads and Reels cross-post)
- [ ] Threads `@mysecondcountry`
- [ ] Pinterest `@mysecondcountry`
- [ ] Reddit `u/mysecondcountry` (defensive registration only; do value-first forum participation through a genuine-relocator personal account, not the brand account, or it gets downvoted in r/expats)

Availability at check time (2026-06-24): YouTube and LinkedIn confirmed free (YouTube now registered). All other platforms showed zero footprint anywhere, but login walls blocked a hard confirm, so verify each at signup.

### Resend DKIM/DMARC warmup (before Phase B)

- Resend requires DNS propagation and a warmup period. Start immediately after domain lock.
- Add SPF, DKIM, and DMARC records via the domain registrar's DNS panel (or wherever DNS is hosted).
- Send a test email from Resend to `james@mysecondcountry.com` within 24 hours of DNS setup to confirm deliverability.
- Do not send newsletter until DMARC policy is `p=quarantine` or stricter.

### Affiliate program applications (after privacy policy, before Phase C)

- Most programs (Wise, Revolut, booking platforms, VPN providers) require a live site with a privacy policy and a disclosure policy.
- Apply immediately after the site goes live with the privacy policy page.
- Track application status in `packages/data/src/affiliates/status.md` (not in code; human-maintained).
- Do not render affiliate CitedValues on live pages until `approvedDate` is set.

### Privacy policy + DPAs

- A privacy policy page is required for affiliate approvals, GDPR compliance (EU visitors), and Stripe Checkout.
- Ship `packages/web/src/pages/privacy.astro` before the first affiliate application.
- Add a Vercel data processing agreement (DPA) immediately; Plausible is cookieless but still a processor.
- If the newsletter captures email addresses, add a `newsletter-subscribers` data register entry to the privacy policy.

### Pre-launch legal review (a launch gate, NOT a build gate)

- A lawyer reviews `FENCE.md`, the privacy policy, the affiliate disclosure, and clears the "My Second Country" trademark before anything goes public or any real charge is taken.
- This gates launch and paid spend, not the build. Build the engine, the Greece data, the pages, and deploy to a real URL freely before it; just do not promote, take real payment, or run ads until the review is done.
- Registering the cheap domain and shipping cited pages commits nothing legally. The review is about going to market, not about writing code, so it never blocks the cold start.

### Accessibility (WCAG 2.1 AA)

- Accessibility is not a phase; it is a build constraint from commit one.
- Add `axe-core` as a dev dependency and run `axe` in CI against every page in the Astro build output.
- `FenceBlock` must meet color contrast AA. `CitedValueCell` confidence badges must not rely on color alone (use icons + text).
- `AffiliateLink` disclosure label must be readable by screen readers (not hidden via CSS).

### hreflang and locale URL structure

- Reserve `/en/places/<slug>` and `/el/places/<slug>` from the first commit, even if `/el/` is empty.
- Add `<link rel="alternate" hreflang="en" href="...">` and `<link rel="alternate" hreflang="x-default" href="...">` to every page.
- Add a redirect rule in `vercel.json` (or in the Astro middleware): `/places/<slug>` redirects to `/en/places/<slug>` (301, permanent).
- The Place `id` is locale-independent; the `slug` may be translated per locale.

---

## 4. Testing strategy

### Golden fixture test

`packages/data/src/__tests__/schema.test.ts` parses the Chania fixture on every commit. If the schema changes in a breaking way, this test fails first. This is the canary; fix the fixture before fixing the schema.

### CitedValue property test

`packages/data/src/__tests__/citations.test.ts`: for every `CitedValue` in every exported Place, assert:
- `sourceUrl` is a non-empty string starting with `https://`.
- `verifiedDate` matches `YYYY-MM-DD` and is not in the future.
- `confidence` is one of the three permitted values.
- `sourceName` is non-empty.

This test runs in CI on every push. It catches hand-authored data errors before they reach prod.

### Stale visa/tax CI check

`.github/workflows/ci.yml` includes a step that runs `tsx scripts/check-staleness.ts`. This script reads all Place files, finds any `CitedValue` in the `visa`, `tax`, or `residency` fields where `verifiedDate` is older than 90 days, and exits non-zero unless `confidence` is explicitly `"low"`. A `"low"` confidence value passes the check but renders a visible caution indicator on the page.

### Fence snapshot test

`packages/web/src/__tests__/fence.test.ts`: renders `FenceBlock.astro` to a string and asserts that the phrases required by `FENCE.md` are present verbatim. This prevents accidental fence text drift during refactors.

### Programmatic-SEO uniqueness check

`packages/web/src/__tests__/uniqueness.test.ts`: for every generated town page, assert that at least three CitedValues differ in `.value` from the parent region page. Run at build time and in CI. A town page that fails this check does not build.

### Scheduled link-rot checker

`.github/workflows/linkrot.yml`: monthly cron. Runs `tsx scripts/check-links.ts`, which reads all `sourceUrl` fields from all Place files, fires a HEAD request to each, and opens a GitHub issue listing any 404s or 5xxs. Does not block CI; opens an issue for human triage.

### Place ID stability test

`packages/data/src/__tests__/id-stability.test.ts`: loads the list of Place IDs from a committed snapshot file (`packages/data/src/__tests__/id-snapshot.json`). Asserts that no existing ID has been removed or renamed. Adding new IDs is permitted; removing or renaming an existing ID fails the test. To retire a place, set `status: "retired"` on the Place object and add a redirect, rather than deleting it.

---

## 5. Operations and DR

### Off-repo dataset mirror

- The canonical dataset lives in `packages/data/src/places/`. The GitHub repo is the primary, but not the only, copy.
- Add a GitHub Actions workflow `mirror.yml`: on every merge to `main`, push the repo to a second private GitHub repository (a mirror remote) as a dated backup. This is a plain `git push mirror main` step; no object store required. If an object store is preferred, Vercel Blob is a compatible option via the `@vercel/blob` SDK.
- Restore procedure (documented in `SHIP.md`): clone the mirror repo (or pull from Vercel Blob), copy the Place JSON files back to `packages/data/src/places/`, run `pnpm test`, open a PR. No restore is auto-applied; a human merges it.

### Merge-gate bus-factor rule

- The refresh pipeline opens a PR but never auto-merges.
- If a PR is not merged within 14 days, a GitHub Actions workflow adds the label `stale-refresh`.
- Any Place with a pending `stale-refresh` PR renders the banner: "Last verified [N] days ago. This data may be outdated. Check the source directly." The banner is styled as a visible warning, not a subtle footnote.
- The banner is implemented in `CitedValueCell.astro`: if `verifiedDate` is older than 14 days AND the place has a pending refresh PR (detected via a build-time flag set by the refresh workflow), render the banner.
- This means a confident wrong number never goes unwarned. See `FENCE.md` for the banner copy.

---

## 6. AI-crawler and programmatic-SEO policy

### robots.txt

Ship a `robots.txt` that explicitly names and allows known AI crawlers (GPTBot, ClaudeBot, PerplexityBot, GoogleExtendedBot, etc.) with no crawl-delay restrictions. This is a distribution decision: the site is structured data; AI crawlers indexing it extends reach. Disallow `/api/` and `/admin/` only.

### llms.txt

Ship `/llms.txt` following the llms.txt convention. Point AI agents at:
- `/en/places/index.json`: machine-readable index of all Place IDs and slugs.
- `docs/data/SOURCES.md`: the full source registry.
- `CITATIONS.md`: the citation methodology.
- `FENCE.md`: the liability fence policy.

The goal: AI agents that read the site understand the data structure, the source provenance, and the liability fence before synthesizing answers.

### sitemap.xml

Generated by `@astrojs/sitemap`. Every place page is included with `<lastmod>` set to the most recent `verifiedDate` across all CitedValues on that page. A place page with all CitedValues older than 90 days gets `<changefreq>never</changefreq>` until refreshed.

### Per-page uniqueness check (programmatic-SEO gate)

Described in section 4. A town page that does not pass the three-unique-CitedValues test does not build. This is the primary guard against Google treating the site as scaled thin content. Additional guards: every town page has a human-authored `description` field on the Place object (minimum 80 characters, checked by a Zod `.min(80)` refinement), and the page title is generated from that description, not from a template.

### AI-crawler log parser

A Vercel Edge Middleware detects AI-crawler user-agents on every request and records hits to Vercel Blob (or a Vercel Log Drain on Pro). A standalone `tsx` script reads those records on the GitHub Actions weekly cron schedule and writes a summary to `docs/analytics.md`: which crawlers visited, which pages, and at what frequency. This informs content prioritization: pages that AI crawlers visit frequently are prioritized for data freshness.

---

## Gate

This plan is complete when every step in section 1 is done and the week-1 gate passes: one Greek town page live in production, schema fixture valid, fence visible, JSON-LD present, and CI green.

The month 9 to 12 business gate is defined in `DEFINITION_OF_DONE.md`. Do not expand beyond Europe or beyond the founding channel set until that gate passes.
