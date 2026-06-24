# Definition of done

This file states the v1 acceptance criteria. Every item below maps to an automated CI check, a deployment gate, or a logged human gate. "Done" is machine-verifiable unless explicitly marked `[human gate]`.

---

## Checklist

### (a) Greece cluster is live and schema-valid

- [ ] `packages/data/src/places/greece.ts` exports a country-level Place object for Greece.
- [ ] At least 7 region-level Place objects cover: Attica, Crete, Peloponnese, Central Macedonia, Ionian Islands, South Aegean, Thessaly.
- [ ] At least 5 town-level Place objects cover an agreed first set (Athens, Thessaloniki, Heraklion, Nafplio, Corfu Town).
- [ ] Every Place object passes `z.parse(PlaceSchema)` with zero Zod 4 errors (CI: `pnpm vitest run packages/data`).
- [ ] Each Place object carries at minimum: `slug`, `name`, `granularity`, `country`, `costOfLiving`, `climate.averageAnnualSunHours`, `residency` (if applicable), and at least 3 populated `CitedValue` fields.
- [ ] `pnpm build` in `packages/web` exits 0 and the Greece country page, all 7 region pages, and all 5 town pages are present in the static output (assert via `find dist -name "*.html" | grep -E "greece|attica|crete|athens"` count >= 13).

### (b) Every visa/tax/residency CitedValue is fresh and fully cited

- [ ] Every `CitedValue` on a field typed `ResidencyValue | TaxValue | VisaValue` has a non-empty `sourceUrl`, `sourceName`, `verifiedDate`, and `confidence` of `"high" | "medium"` (not `"low"` or omitted).
- [ ] No `verifiedDate` is more than 90 days before the build date (CI: `scripts/check-freshness.ts` runs in the validate job; build fails if any stale value is found).
- [ ] `sourceUrl` is a reachable HTTPS URL (CI: `scripts/check-sources.ts` performs HEAD requests with a 10-second timeout; soft-fail on 429, hard-fail on 404 or no TLS).

### (c) Visible fence renders on every relevant page

- [ ] The FENCE component (see `FENCE.md`) renders on 100% of Astro pages that include a `residency`, `tax`, or `visa` section.
- [ ] CI snapshot test: `pnpm vitest run packages/web --reporter=verbose` asserts that the rendered HTML of every such page contains the string `not legal or tax advice` (case-insensitive) at least once.
- [ ] No page in `dist/` that contains the word "residency", "visa", or "tax" lacks the fence string (CI: `scripts/assert-fence.ts` scans the built HTML).

### (d) JSON-LD validates on a sample

- [ ] Every Place page emits a `Place` JSON-LD block and, where FAQs are present, a `FAQPage` JSON-LD block, both inlined in `<head>`.
- [ ] `scripts/validate-jsonld.ts` runs in CI, parses the JSON-LD from a representative sample (Greece country page plus 2 region pages plus 2 town pages), and asserts no schema.org property is missing or malformed.
- [ ] `[human gate]` At least one page URL has been manually submitted to Google Rich Results Test and returned "valid" before the go-live PR is merged.

### (e) Discoverability files are served

- [ ] `sitemap.xml` is present at the root of the static output and contains at least one URL per live Place page.
- [ ] `robots.txt` allows `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`, and `Google-Extended` by name (CI: `scripts/assert-robots.ts` checks for each User-agent directive).
- [ ] `llms.txt` is served at `/llms.txt` and contains a plain-text summary of the site's purpose, data coverage, and a pointer to the raw data package.
- [ ] CI: `find dist -name sitemap.xml | wc -l` = 1; `find dist -name robots.txt | wc -l` = 1; `find dist -name llms.txt | wc -l` = 1.

### (f) Uniqueness gate: no thin pages

- [ ] Every programmatic page (region, town) carries at least 4 unique `CitedValue` fields that differ from the parent country page (i.e., they are not simply inherited without their own source).
- [ ] CI: `scripts/assert-uniqueness.ts` iterates all Place objects below country granularity and fails the build if fewer than 4 CitedValue fields have a `sourceUrl` distinct from the parent's corresponding field.
- [ ] No two Place pages share identical body copy blocks of more than 120 consecutive characters (CI: `scripts/assert-no-copy-duplication.ts`).

### (g) Stripe fake-door records intent without charging

- [ ] The Stripe product is created in test mode with `payment_behavior: "default_incomplete"` or modeled as a pre-order waitlist (no card charge until manual activation).
- [ ] Clicking "Join waitlist" on the pricing page calls `POST /api/waitlist` which writes the email + timestamp to a local JSON log file (committed to repo as `data/waitlist.json`, gitignored in production, synced via a cron-triggered PR, never a live database).
- [ ] `[human gate]` A test Stripe Checkout session with a test card completes without a real charge; the test mode receipt shows $0.00 or a clear "not charged" status.
- [ ] CI: `pnpm vitest run packages/web --testNamePattern=waitlist` asserts the API route returns `{ ok: true }` and appends to the log without throwing.

### (h) Analytics are firing

- [ ] Plausible snippet is present in the Astro `<head>` layout with the correct domain (CI: `scripts/assert-analytics.ts` checks the built HTML for the Plausible script tag).
- [ ] The AI-crawler middleware (`packages/engine/src/crawler-log-parser.ts`) is wired as a Vercel Edge Middleware and emits a structured JSON log line for each request whose `User-Agent` matches a named AI crawler (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended).
- [ ] The following named events are defined in code and fire on the correct user actions: `page_view` (automatic via Plausible), `place_compared`, `waitlist_joined`, `fence_seen`.
- [ ] CI: `pnpm vitest run packages/engine --testNamePattern=crawler-log` asserts that a fixture request with `User-Agent: GPTBot/1.0` produces a log line with `{ crawler: "GPTBot", path: "/greece" }`.

### (i) Legal and trust infrastructure is live

- [ ] Domain and brand name are locked (registered, not parked). `[human gate]`
- [ ] Resend domain auth is complete: SPF record present, DKIM record present, DMARC record present at `p=quarantine` minimum. Verified in the Resend dashboard. `[human gate]`
- [ ] A transactional welcome email sends successfully to the founder's own address from the verified domain before any subscriber outreach. `[human gate]`
- [ ] `/privacy` page is live in the static output and references data collection, Plausible, Stripe, and Resend.
- [ ] `/affiliate-disclosure` page is live and names all affiliate programs active at launch.
- [ ] CI: `find dist -name privacy -o -name affiliate-disclosure | wc -l` >= 2.

### (j) Accessibility: WCAG 2.1 AA on static content

- [ ] Every page has a `<main>`, `<nav>`, and `<footer>` landmark.
- [ ] Every `<img>`, map tile, and chart has a non-empty `alt` attribute.
- [ ] Axe-core runs in CI via `@axe-core/cli` against the built static output (`pnpm axe dist/greece/index.html --exit`); zero critical or serious violations.
- [ ] Color contrast on the primary typeface against its background meets 4.5:1 minimum (assert via axe-core in the same CI step).

---

## Automation summary

Every item above that is not marked `[human gate]` must have a corresponding entry in `.github/workflows/ci.yml`. The validate job runs: Zod schema checks, freshness check, source reachability, fence assertion, JSON-LD parse, robots/sitemap/llms.txt presence, uniqueness gate, copy-duplication check, analytics tag check, crawler-log unit test, privacy/disclosure presence, and axe-core. The build job is blocked by the validate job. Deployment to Vercel is blocked by the build job.

Human gates (d, g-partial, i) are documented as required PR review checklist items in `SHIP.md`.

---

## Kill/continue gate: month 9 to 12

At the end of month 9 (or any time the trend is readable before that), evaluate the following signals as a block:

- Organic search impressions on Greece Place pages growing month-over-month.
- At least one AI-overview or AI-sourced citation referencing a page on the site (visible in crawler logs or Perplexity source attribution).
- Waitlist size above 100 with at least 10 replies or replies to the newsletter indicating genuine relocation intent.
- At least one affiliate click-through converted to a trackable partner action.

If two or more of those four signals are present and directional by month 9, continue to v2 (Spain or Portugal cluster, video production investment, Stripe paid tier activation). If fewer than two signals are present, kill the project cleanly: archive the repo, export the dataset under a permissive license, and write a post-mortem. The founder's time is finite; a flat-signal project after 9 months is not a patience problem, it is a signal problem.

The gate is a judgment call made by the founder after reading `docs/analytics.md`. It is not automated. It is documented here so the decision criteria are written before the pressure to continue is felt.
