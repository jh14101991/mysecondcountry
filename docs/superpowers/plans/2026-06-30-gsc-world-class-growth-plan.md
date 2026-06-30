# GSC world-class growth plan

Status: reference plan, created 2026-06-30.
Owner: Analytics Desk.
Scope: My Second Country search growth, crawl health, query learning, and queue steering.
Domain: `https://mysecondcountry.com`.

This is not a process doc. It is a market-growth plan that sits under the existing analytics and shipping rules in `AGENTS.md`, `FENCE.md`, `CITATIONS.md`, and `SHIP.md`.

## Recommendation

Treat the current GSC signal as a useful early vote for the Greece tax wedge, not proof yet. The next compounding move is to make the site harder for Google to misunderstand:

1. Fix crawl-surface hygiene.
2. Make the Greece 7 percent tax page the center of a tight answer, tool, topic, and place cluster.
3. Add build gates so the sitemap never advertises dead, uncanonical, or `noindex` pages.
4. Use GSC to steer the queue only when impressions repeat or combine with clicks, source clicks, signups, intros, or content movement.
5. Keep the Chania gate intact. Search signal can reorder supporting work, but it must not turn the first complete Greek town page into a side quest.

## Execution status, 2026-06-30

This plan has moved from paper to source and production.

Implemented in source:

- `/screener` is no longer `noindex,nofollow`.
- `llms.txt` no longer places punctuation directly after My Second Country URLs.
- Regime, answer, topic, tool, and place templates now add explicit cluster links for Greece 7 percent tax, Greece residency context, Portugal IFICI, and Italy pension-tax context.
- The Greece 7 percent hub now includes a source-safe "What to verify with a tax adviser" section.
- The Portugal IFICI hub now includes a cited "NHR is closed, IFICI is narrower" section.
- A new `verify:search-surface` gate checks every sitemap route for a built HTML file, canonical URL, indexability, and a usable description, and checks `llms.txt` URLs for trailing punctuation and built targets.
- `verify:build` now includes `verify:search-surface`.

Verification passed locally and against production:

- `pnpm -s build`
- `pnpm -s verify:build`
- `pnpm -s verify:links`
- `pnpm -s verify:routes`
- `pnpm -s verify:search-surface:live`

Published-site check after implementation and production deploy:

- Live `https://mysecondcountry.com/sitemap.xml` currently lists 41 URLs.
- All 41 sitemap URLs return 200.
- All 41 sitemap URLs have matching canonicals.
- All 41 sitemap URLs are indexable.
- All 41 sitemap URLs have one H1.
- All 41 sitemap URLs have usable meta descriptions.
- `/screener` is now indexable and sitemap-listed.
- `/methodology` and `/sources` are now sitemap-listed.
- Greece non-dom, Portugal IFICI, Italy pensioner tax, and Portugal IFICI tool descriptions are no longer thin.

In progress:

- AI crawler measurement is being moved from local-only source into the production branch via Vercel Routing Middleware and Vercel Blob.
- Weekly digest output is being updated to report crawler sightings separately from GSC and human traffic.

## Current published sitemap map

Checked directly from `https://mysecondcountry.com/sitemap.xml` on 2026-06-30.

### Core routes

- `https://mysecondcountry.com/`
- `https://mysecondcountry.com/about`
- `https://mysecondcountry.com/affiliate-disclosure`
- `https://mysecondcountry.com/compare`
- `https://mysecondcountry.com/compare/greece-portugal-spain`
- `https://mysecondcountry.com/guides`
- `https://mysecondcountry.com/methodology`
- `https://mysecondcountry.com/places`
- `https://mysecondcountry.com/privacy`
- `https://mysecondcountry.com/screening-notice`
- `https://mysecondcountry.com/screener`
- `https://mysecondcountry.com/sources`
- `https://mysecondcountry.com/terms`
- `https://mysecondcountry.com/answers`
- `https://mysecondcountry.com/topics`
- `https://mysecondcountry.com/tax`
- `https://mysecondcountry.com/tools`
- `https://mysecondcountry.com/shortlists`

### Place routes

- `https://mysecondcountry.com/places/greece`
- `https://mysecondcountry.com/places/portugal`
- `https://mysecondcountry.com/places/spain`
- `https://mysecondcountry.com/places/italy`
- `https://mysecondcountry.com/places/cyprus`
- `https://mysecondcountry.com/places/malta`
- `https://mysecondcountry.com/places/greece/crete`
- `https://mysecondcountry.com/places/greece/crete/chania`

### Regime routes

- `https://mysecondcountry.com/greece/tax/foreign-pensioner-flat-tax`
- `https://mysecondcountry.com/greece/tax/non-dom-lump-sum-tax`
- `https://mysecondcountry.com/portugal/tax/ifici`
- `https://mysecondcountry.com/italy/tax/pensioner-7-percent-flat-tax`

### Answer routes

- `https://mysecondcountry.com/answers/can-i-still-get-a-spanish-golden-visa`
- `https://mysecondcountry.com/answers/does-greece-tax-foreign-pensions-at-7-percent`
- `https://mysecondcountry.com/answers/is-portugals-nhr-tax-regime-still-available`
- `https://mysecondcountry.com/answers/who-does-not-qualify-for-greece-7-percent-pensioner-tax`
- `https://mysecondcountry.com/answers/what-happens-when-greece-7-percent-pensioner-tax-expires`

### Topic routes

- `https://mysecondcountry.com/topics/portugal-ifici-the-nhr-successor`
- `https://mysecondcountry.com/topics/greece-golden-visa-price-tiers`

### Shortlist routes

- `https://mysecondcountry.com/shortlists/eu-residency-under-3700-a-month`
- `https://mysecondcountry.com/shortlists/eu-expat-tax-regimes-by-rate`

### Tool routes

- `https://mysecondcountry.com/tools/greece-7-percent-pension-tax-checklist`
- `https://mysecondcountry.com/tools/portugal-ifici-eligibility-checklist`

## Current signal

Search Console is showing early attention, concentrated around tax:

- 72 total impressions in the 7-day GSC view shown on 2026-06-30.
- 0 clicks.
- Average position around 9.4 for the property view.
- `/greece/tax/foreign-pensioner-flat-tax` is the main visible page, with 58 impressions.
- Other visible page rows include `/greece/tax/non-dom-lump-sum-tax`, `/topics/greece-golden-visa-price-tiers`, homepage, `/screener`, `/tools`, one Spanish golden visa answer, and the Greece Portugal Spain comparison.
- Visible countries: Netherlands, Germany, United States, Canada, and Austria.
- Page-filtered query view for `/greece/tax/foreign-pensioner-flat-tax` shows `7% tax greece retirees` with 2 impressions and position 73.

Interpretation:

- The page-level average position is likely driven by hidden or anonymized low-volume queries, not only the one visible query.
- The tax wedge is promising because impressions are concentrated on a high-intent, high-liability topic where dated sourcing matters.
- The signal is still too small for title rewrites based on one query. It is enough to justify cluster depth and crawl hygiene.

## Live crawl snapshot

Snapshot source: live crawl of `https://mysecondcountry.com/sitemap.xml` on 2026-06-30 after the redeploy.

Summary:

- Sitemap URL count: 41.
- Sitemap HTML URLs returning 200: 41.
- Sitemap HTML URLs with matching canonical: 41.
- Sitemap HTML URLs indexable: 41.
- Sitemap HTML URLs with one H1: 41.
- Sitemap HTML URLs with meta descriptions at or above 50 characters: 41.
- Support surfaces returning 200: `/robots.txt`, `/llms.txt`, `/sitemap.xml`.
- Public JSON data routes exist for regimes, Q&A, topics, shortlists, and tools.

Live issues:

- No current sitemap indexability, canonical, H1, or description defects found in the live crawl.
- The remaining work is growth work, measurement hardening, and manual GSC inspection, not basic crawl repair.

## Objectives

Primary objective:

Make My Second Country the most crawlable, cited, and structurally clear source for high-intent relocation tax, residency, and place-screening questions.

Secondary objectives:

- Move from isolated pages to topic clusters.
- Increase eligible impressions on high-intent pages.
- Improve click-through once impression volume is large enough to read.
- Increase source-link clicks as a trust-depth signal.
- Increase screener use and newsletter signups once human analytics is available.
- Help AI retrieval systems read the source graph, without pretending crawler hits are AI citations.

Non-goals:

- Do not chase head terms.
- Do not mass-publish thin country or town pages.
- Do not optimize for one visible low-volume query.
- Do not make advisory tax, visa, or immigration claims.
- Do not request indexing for every page after every deploy.

## Search architecture

The site should be organized as a set of evidence clusters, not a flat list of pages.

### Cluster 1: Greece 7 percent pensioner tax

Role: current organic wedge.

Hub:

- `/greece/tax/foreign-pensioner-flat-tax`

Spokes:

- `/answers/does-greece-tax-foreign-pensions-at-7-percent`
- `/answers/who-does-not-qualify-for-greece-7-percent-pensioner-tax`
- `/answers/what-happens-when-greece-7-percent-pensioner-tax-expires`
- `/tools/greece-7-percent-pension-tax-checklist`
- `/places/greece`
- `/places/greece/crete/chania`
- future `/places/greece/crete`

Needed work:

- Add a related-questions block to the hub.
- Add a checklist CTA from the hub to the tool.
- Add reciprocal links from each Q&A page and the checklist back to the hub.
- Add "national rule, local decision" links from Greece place pages and the Chania page where context is relevant.
- Keep all copy framed as sourced screening information, not tax advice.

### Cluster 2: Greece non-dom and golden visa

Role: adjacent high-value Greece intent.

Hub pages:

- `/greece/tax/non-dom-lump-sum-tax`
- `/topics/greece-golden-visa-price-tiers`

Spokes to add or strengthen:

- Answer: who is Greece non-dom for?
- Answer: what disqualifies Greece non-dom?
- Answer: does the Greece golden visa still have a 250,000 euro route?
- Tool: Greece golden visa tier checker.
- Compare: Greece 5A vs Greece 5B.

Needed work:

- Fix weak live descriptions.
- Add internal links between 5A, 5B, golden visa, Greece country, and Chania.
- Use direct, source-led headings that match the reader's uncertainty.

### Cluster 3: Portugal IFICI

Role: first revenue corridor and stale-answer correction wedge.

Hub:

- `/portugal/tax/ifici`

Existing related pages:

- `/topics/portugal-ifici-the-nhr-successor`
- `/tools/portugal-ifici-eligibility-checklist`
- `/answers/is-portugals-nhr-tax-regime-still-available`
- `/places/portugal`

Needed work:

- Fix weak live descriptions.
- Add reciprocal links between IFICI hub, NHR answer, topic page, and checklist.
- Add a clear "NHR is closed, IFICI is narrower" source-led section.
- Keep adviser intro blocks off until vetted.

### Cluster 4: place decision pages

Role: the durable long-term asset.

Current live place pages:

- `/places/greece`
- `/places/portugal`
- `/places/spain`
- `/places/italy`
- `/places/cyprus`
- `/places/malta`
- `/places/greece/crete/chania`

Needed work:

- Ship `/places/greece/crete` when the region parent is ready.
- Keep the full Chania gate intact.
- Add place-to-regime links where the national rule affects the local decision.
- Avoid thin "best places" pages until each child has real data depth.

### Cluster 5: trust and methodology

Role: help Google, AI retrieval, and serious readers understand why the site is reliable.

Current live pages:

- `/methodology`
- `/sources`

Needed work:

- Add both pages to the sitemap.
- Link them consistently from footer, `llms.txt`, and cited pages.
- Keep them visible as trust pages, not hidden machinery.

## Technical SEO requirements

Every indexable HTML page should have:

- HTTP 200.
- Canonical URL matching the final HTTPS URL.
- One H1.
- Meta description.
- No `noindex` unless intentionally excluded from the sitemap.
- JSON-LD where the page has a clear schema type.
- Internal links to parent, siblings, and high-intent child pages.
- Visible fence text before tax, visa, residency, or financial claims.
- Cited facts with source name, source URL, verified date, confidence, and granularity.

Every sitemap URL should have:

- HTTP 200.
- No `noindex`.
- Canonical URL.
- No redirect chain beyond the canonical HTTPS target.

Every live support surface should be internally consistent:

- `robots.txt` points to the current sitemap.
- `llms.txt` lists only live, canonical URLs.
- Sitemap lists the indexable HTML surface, plus no `noindex` pages.
- Data JSON routes linked from `llms.txt` return 200 and represent the same cited facts as the HTML pages.

## Build gates to add

Add a single live-surface gate that can run against local build output and, optionally, production:

Checks:

- Sitemap URL returns 200.
- Sitemap URL does not contain `noindex`.
- Sitemap URL has canonical.
- Canonical matches the page URL.
- Page has a meta description unless it is a deliberate non-indexed utility page.
- Sitemap does not include pages with `robots: noindex`.
- `llms.txt` does not advertise 404 or punctuation-corrupted URLs.
- Important public pages are either in sitemap or explicitly excluded.

Suggested command:

```bash
pnpm verify:search-surface
```

CI rule:

- Run the gate on every PR that changes `packages/web/src/pages`, `packages/web/src/layouts`, `packages/data`, `robots.txt`, `llms.txt`, or sitemap code.
- Fail hard for sitemap 404, missing canonical, `noindex` in sitemap, or canonical mismatch.
- Warn for weak descriptions until the first cleanup pass is complete, then fail.

## Page-level workplan

### P0: crawl hygiene

Goal: remove sources of crawl confusion.

Tasks:

1. Add canonical and meta description to the live homepage, or confirm the source fix has deployed.
2. Decide `/screener` indexability. Recommendation: make it indexable because it is a top-of-funnel product surface.
3. If `/screener` remains `noindex`, remove it from sitemap and do not count GSC impressions there as a page-growth signal.
4. Add `/methodology` and `/sources` to sitemap.
5. Fix descriptions on Portugal IFICI, Greece non-dom, Italy pensioner tax, and Portugal IFICI tool.
6. Add `verify:search-surface`.

Acceptance:

- Live sitemap has no indexability contradictions.
- Homepage has canonical and description.
- `/screener` is either indexable with canonical and description, or absent from sitemap.
- `/methodology` and `/sources` are in sitemap if they remain indexable.

### P1: Greece 7 percent cluster

Goal: turn the current GSC signal into a clear topical cluster.

Tasks:

1. Add related Q&A links to `/greece/tax/foreign-pensioner-flat-tax`.
2. Add checklist link to the hub.
3. Add hub links from Q&A and checklist pages.
4. Add a compact "what to verify with a tax adviser" section that points to sources without advising the reader.
5. Add `dateModified` if not already present on all cluster pages.

Acceptance:

- Hub has at least five relevant internal links.
- Every spoke links back to the hub.
- GSC URL inspection live test passes for hub, checklist, and one Q&A.
- No copy violates `FENCE.md`.

### P2: Portugal IFICI cluster

Goal: make the first revenue corridor structurally ready before traffic arrives.

Tasks:

1. Fix hub and tool descriptions.
2. Link IFICI hub, NHR answer, IFICI topic page, Portugal place page, and IFICI checklist.
3. Add a source-led "NHR closed, IFICI replaced part of the tax story" section.
4. Keep adviser-intro CTA disabled until vetted.

Acceptance:

- Cluster can be crawled from any page in the cluster within two clicks.
- No stale-answer language.
- GSC can inspect hub and one child page cleanly.

### P3: Chania and Crete place cluster

Goal: connect the town data asset to search demand without skipping the gate.

Tasks:

1. Publish `/places/greece/crete` only when the region page has enough source-backed data to count.
2. Preserve Chania as the first complete town gate.
3. Link Greece country, Crete region, Chania town, and Greece tax pages where context is useful.
4. Add place-specific source-depth cues, such as "national figure shown for Chania" where needed.

Acceptance:

- Crete and Chania both pass the page gate.
- Sitemap includes the region and town pages.
- GSC inspect only the Crete parent and Chania child after live test passes.

### P4: title and description testing

Goal: improve click-through only when there is enough data to read.

Rules:

- Do not change titles based on fewer than 100 impressions on a page.
- At 100 to 500 page impressions, log hypotheses.
- At 500+ impressions and average position under 15 with zero clicks, test title and description.
- Hold each test for at least 14 days unless a page has a live technical defect.

Candidate title for the current hub:

`Greece 7 percent pensioner tax: rules, deadline, disqualifiers`

Candidate description for the current hub:

`Sourced screen of Greece's foreign-pensioner flat-tax regime: rate, duration, deadline, disqualifiers, source dates, and professional-verification notes.`

## Measurement model

### GSC measures

Track weekly:

- impressions by page family;
- impressions by URL;
- visible queries;
- clicks;
- average position;
- country rows;
- search appearance rows;
- new pages indexed;
- pages with GSC enhancement issues.

Page families:

- home and product pages;
- place pages;
- regime pages;
- answer pages;
- topic pages;
- tool pages;
- shortlist pages;
- trust pages.

Confidence rules:

- Under 100 impressions: directional only.
- 100 to 500 impressions: valid hypothesis, not proof.
- 500+ impressions: enough to test snippets and internal links.
- Clicks plus source clicks or signups: queue evidence.
- Repeated impressions on the same query class across weeks: production evidence.

### Human behavior measures

When human analytics is live, track:

- source-link clicks;
- screener starts;
- screener completions;
- newsletter signups;
- affiliate outbound clicks;
- dossier fake-door clicks;
- scroll depth or section views only if implemented without daily manual review.

### AI retrieval measures

Track separately:

- AI crawler hits by bot and path.
- AI crawler recency.
- Data JSON route hits.

Do not report crawler hits as:

- AI-search impressions;
- citations;
- human traffic;
- revenue signal.

## Queue rules

Promote a page or cluster when:

- a high-intent GSC query appears repeatedly;
- a page gets impressions and weak current coverage;
- source clicks cluster around one data type;
- a signup, fake-door click, or intro request comes from the page family;
- a fresh rule change creates stale SERP answers;
- short-form content gets saves, replies, or shares outside the founder audience.

Do not promote when:

- the only evidence is one low-volume query;
- the page has a known technical defect;
- the proposed page would be thin;
- the work would delay the first complete Greek town page without making that page stronger.

Current queue recommendation:

1. Crawl hygiene.
2. Greece 7 percent cluster.
3. Portugal IFICI cluster.
4. Greece non-dom and golden visa adjacency.
5. Crete and Chania publication gate.
6. Italy pensioner 7 percent only after Greece and Portugal clusters are clean, unless GSC starts showing Italy demand.

## GSC inspection playbook

Default:

- Let sitemap discovery do the routine work.

Use URL Inspection when:

- a new cluster ships;
- a page has impressions but a live issue;
- a page is the top-of-funnel parent for a new cluster;
- one to three high-intent child pages matter for the cluster.

For each inspected URL:

1. Run Test live URL.
2. If live test passes and the page is not indexed, request indexing.
3. Do not request indexing again for the same unchanged URL.
4. Log the result in the GSC performance log only when it changes the read.

Current priority inspection list after P0 and P1:

- `/greece/tax/foreign-pensioner-flat-tax`
- `/tools/greece-7-percent-pension-tax-checklist`
- `/answers/who-does-not-qualify-for-greece-7-percent-pensioner-tax`
- `/screener`, only if made indexable
- `/places/greece/crete`, only once live and sitemap-listed

## Pressure test

Method: premortem and inversion, using the creative ideation skill requested for this audit.

Failure mode: we chase one visible query.

Counter: visible query rows are low-volume and often incomplete. Optimize the cluster, not the phrase.

Failure mode: we publish breadth before depth.

Counter: keep the Chania gate and require unique cited value depth before each place page counts.

Failure mode: sitemap advertises pages Google should not index.

Counter: add `verify:search-surface` and fail on sitemap plus `noindex`, missing canonical, or 404.

Failure mode: search copy becomes tax advice.

Counter: all tax, visa, residency, and financial pages keep the fence above the first claim and route readers to sources or licensed professionals.

Failure mode: AI crawler logs are over-read.

Counter: report crawler hits as ingestion only, separate from human analytics and GSC.

Failure mode: daily GSC checking becomes a manual ritual.

Counter: batch snapshots weekly, except after a cluster ship or a known GSC issue.

## Full live HTML page map

Snapshot date: 2026-06-30.
Source: live crawl of `https://mysecondcountry.com/sitemap.xml`.

All rows below returned 200, had a matching canonical, were indexable, had one H1, and had a usable meta description at crawl time.

### Home and product pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/` | WebSite | Brand and product entry | Keep broad, link into strongest clusters |
| `/screener` | none | Top-of-funnel product surface | Watch GSC impressions and screener-start analytics |
| `/about` | none | Trust and positioning | Keep conservative, source-led |
| `/compare` | none | Compare index | Add cluster links as country coverage grows |
| `/guides` | ItemList | Guide index | Keep as structured hub, avoid thin guide sprawl |

### Trust and methodology pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/methodology` | Article, BreadcrumbList, DefinedTerm, DefinedTermSet | Method and confidence explainer | Link from high-liability clusters |
| `/sources` | Article, BreadcrumbList, DataCatalog | Source register and citation trust | Keep current with source registry |
| `/screening-notice` | none | Liability boundary | Keep visible from product flows |
| `/affiliate-disclosure` | none | Commercial boundary | Keep before revenue tests |
| `/privacy` | none | Legal page | Keep |
| `/terms` | none | Legal page | Keep |

### Index pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/answers` | ItemList | Answer index | Keep and deepen based on query repeats |
| `/topics` | ItemList | Topic index | Keep source-led, not blog-style |
| `/tax` | ItemList | Tax regime index | Make Greece and Portugal clusters obvious |
| `/tools` | ItemList | Tool index | Link tools back to their regime hubs |
| `/shortlists` | ItemList | Shortlist index | Keep mechanically derived and cited |
| `/places` | ItemList | Place index | Keep breadth visible, but ship depth selectively |

### Compare pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/compare/greece-portugal-spain` | Article, BreadcrumbList, Dataset, FAQPage, ItemList | Corridor comparison | Link from Greece, Portugal, and Spain pages |

### Place pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/places/greece` | Place, Dataset, Article, BreadcrumbList | Country parent for current tax wedge | Connect to 7 percent and non-dom clusters |
| `/places/portugal` | Place, Dataset, Article, BreadcrumbList | Country parent for IFICI corridor | Connect to IFICI hub and checklist |
| `/places/spain` | Place, Dataset, Article, BreadcrumbList | Country page and Spanish golden visa context | Keep, expand only with demand |
| `/places/italy` | Place, Dataset, Article, BreadcrumbList | Country page and Italy pension-tax context | Keep, expand after Greece and Portugal unless demand appears |
| `/places/cyprus` | Place, Dataset, Article, BreadcrumbList | Country page | Keep, do not overbuild before demand |
| `/places/malta` | Place, Dataset, Article, BreadcrumbList | Country page | Keep, do not overbuild before demand |
| `/places/greece/crete` | Place, Dataset, Article, BreadcrumbList | Region parent | Use as bridge from Greece country to Chania |
| `/places/greece/crete/chania` | Place, Dataset, Article, BreadcrumbList | First complete town page | Preserve gate discipline and source depth |

### Regime pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/greece/tax/foreign-pensioner-flat-tax` | Article, BreadcrumbList, Dataset, DefinedTerm, FAQPage | Main organic wedge | Keep as Greece 7 percent cluster hub |
| `/greece/tax/non-dom-lump-sum-tax` | Article, BreadcrumbList, Dataset, DefinedTerm, FAQPage | Adjacent Greece tax regime | Watch for query repeats, add targeted answers |
| `/portugal/tax/ifici` | Article, BreadcrumbList, Dataset, DefinedTerm, FAQPage | Portugal tax corridor hub | Keep linked to NHR answer, topic, and tool |
| `/italy/tax/pensioner-7-percent-flat-tax` | Article, BreadcrumbList, Dataset, DefinedTerm, FAQPage | Italy tax corridor seed | Hold larger build until signal or data readiness |

### Answer pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/answers/can-i-still-get-a-spanish-golden-visa` | Article, BreadcrumbList, FAQPage | Spanish golden visa stale-answer correction | Keep current |
| `/answers/does-greece-tax-foreign-pensions-at-7-percent` | Article, BreadcrumbList, FAQPage | Greece 7 percent answer spoke | Keep linked to hub |
| `/answers/is-portugals-nhr-tax-regime-still-available` | Article, BreadcrumbList, FAQPage | Portugal NHR stale-answer correction | Keep linked to IFICI hub |
| `/answers/who-does-not-qualify-for-greece-7-percent-pensioner-tax` | Article, BreadcrumbList, FAQPage | Greece disqualifier answer spoke | Inspect after hub if needed |
| `/answers/what-happens-when-greece-7-percent-pensioner-tax-expires` | Article, BreadcrumbList, FAQPage | Greece expiry answer spoke | Inspect only if impressions repeat |

### Topic pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/topics/greece-golden-visa-price-tiers` | Article, BreadcrumbList, Dataset, DefinedTerm | Greece golden visa explainer | Connect to Greece place and future tier tool |
| `/topics/portugal-ifici-the-nhr-successor` | Article, BreadcrumbList, Dataset, DefinedTerm | IFICI topic spoke | Keep linked to IFICI hub and NHR answer |

### Shortlist pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/shortlists/eu-residency-under-3700-a-month` | Article, BreadcrumbList, ItemList | Residency affordability shortlist | Keep as cited comparison surface |
| `/shortlists/eu-expat-tax-regimes-by-rate` | Article, BreadcrumbList, ItemList | Tax regime shortlist | Link to Greece, Portugal, and Italy regimes |

### Tool pages

| URL | Schema | Role | Next action |
| --- | --- | --- | --- |
| `/tools/greece-7-percent-pension-tax-checklist` | Article, BreadcrumbList, HowTo | Greece checklist spoke | Watch intent, link back to hub |
| `/tools/portugal-ifici-eligibility-checklist` | Article, BreadcrumbList, HowTo | Portugal checklist spoke | Watch intent, link back to IFICI hub |

## Public support surfaces

These are live, but are not counted as HTML pages:

| URL | Read | Action |
| --- | --- | --- |
| `/sitemap.xml` | 200, 41 URLs | keep in sync with published indexable HTML routes |
| `/robots.txt` | 200, allows named AI crawlers, disallows `/api/` and `/admin/` | keep |
| `/llms.txt` | 200, strong machine-readable site summary | keep current with live route map |
| `/data/regimes/<slug>.json` | 200 for live regime slugs checked | keep |
| `/data/qa/<slug>.json` | 200 for live Q&A slugs checked | keep |
| `/data/topics/<slug>.json` | 200 for live topic slugs checked | keep |
| `/data/shortlists/<slug>.json` | 200 for live shortlist slugs checked | keep |
| `/data/tools/<slug>.json` | 200 for live tool slugs checked | keep |

## References

- Google Search Central, SEO starter guide: `https://developers.google.com/search/docs/fundamentals/seo-starter-guide`
- Google Search Central, creating helpful, reliable, people-first content: `https://developers.google.com/search/docs/fundamentals/creating-helpful-content`
- Google Search Central, make your links crawlable: `https://developers.google.com/search/docs/crawling-indexing/links-crawlable`
- Google Search Central, title links: `https://developers.google.com/search/docs/appearance/title-link`
- Google Search Central, snippets: `https://developers.google.com/search/docs/appearance/snippet`
- Google Search Console help, Performance report: `https://support.google.com/webmasters/answer/7576553`
- Google Search Central blog, performance data deep dive: `https://developers.google.com/search/blog/2022/10/performance-data-deep-dive`
- Creative ideation skill used for the pressure test: `https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/creative/creative-ideation/SKILL.md`
