# My Second Country page choreography and anti-slop spec

**Status:** Implementation spec for Design Desk and Page Factory, written 2026-06-29.
**Owner:** MSC Design Desk, with Page Factory for implementation and Data Desk for evidence gates.
**Scope:** Turn the approved v5 visual system, the navigation audit, Vercel-style design documentation, Hermes creative ideation, Ramp-style design process, Lazyweb product-screen evidence, and the dossier template work into one implementable page-system contract.
**Non-scope:** This spec does not clear the Chania dossier data gate. It does not begin the dossier template implementation. It does not supersede `AGENTS.md`, `CITATIONS.md`, `FENCE.md`, or `SHIP.md`.

## 1. Core decision

The design unit is no longer "a component."

The design unit is a page choreography:

1. The reader question.
2. The trust boundary.
3. The proof object.
4. The rhythm of evidence and relief.
5. The next action.
6. The rendered proof that the page works on desktop, tablet, mobile, no-JS, and reduced-motion conditions.

Components are extracted after the page choreography is coherent. Components cannot be used to make an unstructured page feel intentional after the fact.

This is the response to the current failure mode: strong component work can still produce a page that feels like fragments thrown onto a canvas. The cure is not more polish. The cure is route-level structure before component implementation.

The second rule is equally important: show the minimum amount of information needed for the reader to understand the point, then let them inspect more only when they choose to go deeper. The homepage should make the product clear, not prove the whole database. Product flows should make the next decision clear, not show every supporting fact at once.

## 2. Source inputs

The implementation must preserve the live repo truth and include every active design input below.

### Repo and gate inputs

- `FOUNDER.md`: James wants truth over encouragement, crafted artifacts, and shipping discipline. Do not let page-system work become private planning.
- `AGENTS.md`: My Second Country is isolated from byImprint, the brand and domain are locked, and one real Greek town page remains the bootstrap proof.
- `CITATIONS.md`: every claim that could be wrong is a `CitedValue`.
- `FENCE.md`: sourced screening information, never advice.
- `SHIP.md`: a ship means real market exposure, not more internal docs.
- `DEFINITION_OF_DONE.md`: page acceptance remains machine-verifiable plus explicit human gates.
- `docs/msc-operating-ledger.md`: the unit is an evidence bundle, not a page.
- `docs/msc-room-state.json`: Chania remains held at source-gap review and publication hold as of 2026-06-29.
- `docs/superpowers/specs/2026-06-24-v1-design.md`: dataset as product, projections as surfaces.
- `docs/superpowers/plans/2026-06-24-v1-implementation-plan.md`: Astro, cited data, screener, place pages, content, email, and revenue gates.
- `docs/superpowers/plans/2026-06-28-v5-astro-port.md`: v5 Broadsheet Ledger is the approved active visual system.
- `docs/superpowers/plans/2026-06-29-msc-live-readiness-implementation-plan.md`: current live-readiness sequence and evidence-corridor cleanup.
- `docs/superpowers/specs/2026-06-29-dossier-page-template-system.md`: Chania dossier system shape, blocked until Data Desk handoff.
- `docs/design/page-prompts/almanac-slop-kill-comprehensive.md`: anti-slop checklist, useful as pattern bans, not as the active visual style.
- `docs/design/README.md`: active design source map, v5 wins over old Almanac and refero restart notes.

### External and creative inputs

- Vercel `design.md`: use as a model for machine-readable design contracts and explicit tokens, not as a Geist style template. MSC keeps v5 Broadsheet Ledger.
- Vercel product-design guidance: design work should be taught and encoded in repeatable systems, not left as taste commentary.
- Hermes creative ideation skill: route this as **synthesizing** plus **product**. The right method is Jiro Kawakita's KJ affinity diagram because the source material is a pile of observations, not a blank idea prompt.
- Hermes anti-slop rules: reject generic average output, force specificity, state failure modes, and avoid a same-shaped list of ideas.
- Ramp product designer playbook image supplied by James: start with LLM problem framing, validate assumptions, prototype with AI tools, bring validated ideas into Figma, and iterate from user behavior.
- Lazyweb design report for the current homepage surface: use as product-screen grounding for the homepage and page-system direction. Report URL: `https://www.lazyweb.com/report/lazyweb/19f454d4-d3d0-427e-a5b4-3557610e6714/`. The captured screenshot is `.lazyweb/lazyweb-design/msc-homepage-choreography-2026-06-29/references/current-state.png`.

## 3. Current repo state to respect

The repo is dirty from overlapping workstreams. This spec is allowed as a reference document. Execution must use tight pathspecs and must not stage data, ops, package, workflow, mockup, or room-state files unless the implementation task explicitly requires them.

Current live implementation surfaces include:

- `packages/web/src/layouts/Base.astro`: active nav, footer, scripts, metadata, Plausible wiring.
- `packages/web/src/styles/system.css`: v5 tokens, type roles, nav/footer CSS, corridor hubs, CTA band, and compatibility aliases.
- `packages/web/src/pages/index.astro`: homepage and evidence shelf.
- `packages/web/src/pages/screener.astro`: product screener.
- `packages/web/src/pages/compare/greece-portugal-spain.astro`: current flagship comparison.
- `packages/web/src/pages/sources.astro`: source index.
- `packages/web/src/pages/methodology.astro`: citation and method page.
- `packages/web/src/pages/guides.astro`, `answers`, `topics`, `tools`, `tax`: guide corridors.
- `packages/web/src/pages/shortlists`: shortlist hub and pages.
- `packages/web/src/pages/places`: places hub and current place route.
- `packages/web/src/pages/privacy.astro`, `terms.astro`, `affiliate-disclosure.astro`: legal surfaces.
- Shared components: `CitedValue`, `ConfidenceMark`, `FactsTable`, `SourcesList`, `FenceBlock`, `Breadcrumb`, `Masthead`, `DirectAnswer`, `CiteThis`, `AtAGlance`, `ClaimCard`, `RelatedLinks`, `EmailCapture`, `IntroRequest`, and supporting components.

Known status:

- v5 route visual QA report exists at `docs/superpowers/plans/reports/2026-06-29-live-readiness-visual-qa.md`.
- That QA reports 33 route and viewport checks passing.
- The same QA states Chania is only a current coverage page, not the finished dossier template.
- `verify:data` remains a data/source gate, not a design regression.
- The latest full-page screenshot capture showed blank lower sections because scroll-reveal content below the fold did not materialize in that capture path. This is a QA design smell and must become an explicit rendered-proof requirement.

## 4. The six-stage MSC design process

The Ramp image has five levels. MSC adds a sixth production gate because this product has source, fence, and deployment obligations that ordinary design playbooks do not carry.

### Stage 1: Start with an LLM, but only to frame the page problem

Deliverable: a route brief.

The LLM work answers:

- What is this route for?
- Who is arriving?
- What anxiety or job brought them here?
- What should they know in the first viewport?
- What proof must appear before they are asked to act?
- What claim would create liability if written carelessly?
- What route should they take next?

The output is not a component list. It is a one-page route brief using the template in section 11.

### Stage 2: Validate assumptions before designing the surface

Deliverable: an assumption ledger attached to the route brief.

Every page assumption is marked as one of:

- `data_verified`: supported by current cited data.
- `data_blocked`: needed, but held by Data Desk.
- `product_assumption`: useful design or reader assumption, not a sourced fact.
- `legal_assumption`: must be checked against `FENCE.md`, `CITATIONS.md`, and launch policy.
- `navigation_assumption`: must be proven by link and hub discovery.
- `visual_assumption`: must be proven by rendered screenshots.

No public route may turn a `data_blocked` item into local certainty.

### Stage 3: Prototype as a working experience

Deliverable: a rendered prototype or local route with screenshots.

The prototype may be HTML, Astro, or a design-tool prototype, but it must show the experience as a user moves through it. Static component boards are insufficient.

Minimum proof:

- desktop, tablet, and mobile viewport screenshots;
- one scroll-state sequence for long pages;
- reduced-motion proof;
- no-JS or JS-failure proof for content-bearing pages;
- visible fence where required;
- visible source, verified date, confidence, and granularity near claims.

### Stage 4: Bring validated ideas into Figma or the design board

Deliverable: a composition frame, not a new invention phase.

Figma is used to refine hierarchy, spacing, visual rhythm, and cross-page coherence. It is not where the product thesis is invented. If Figma changes a page's reader job, evidence contract, or gate status, the route brief must change first.

### Stage 5: Port to Astro and data contracts

Deliverable: production files plus tests.

Implementation follows the live architecture:

- visual system in `packages/web/src/styles/system.css`;
- route shell and metadata in `packages/web/src/layouts/Base.astro`;
- page bodies under `packages/web/src/pages/**`;
- reusable evidence and citation components under `packages/web/src/components/**`;
- source truth from `packages/data`;
- route and public-link guards under `scripts/**` and test files.

The code implementation must preserve the page choreography. If the route cannot keep its intended rhythm with real data, the route brief is revised. The design is not allowed to hide the mismatch.

### Stage 6: Iterate from rendered proof and market behavior

Deliverable: QA report, analytics event check, and a market artifact where gates permit.

The page counts only when it survives:

- automated build and data gates;
- rendered design QA;
- link and discoverability QA;
- source/fence QA;
- accessibility QA;
- human review for any route that changes public promise;
- market exposure when `SHIP.md` says the surface is a ship candidate.

## 5. Page experience principles

### 5.0 Minimum sufficient information

Every page and flow must start from the smallest set of information that makes the reader's current decision clear.

For the homepage, this means:

- one clear promise in the first viewport;
- one proof object, not a full evidence dump;
- one next action;
- short source and fence cues where needed;
- deeper proof moved to compare, sources, methodology, and dossier routes.

For product and evidence flows, this means:

- answer first;
- show only the facts needed to interpret that answer;
- keep source, verified date, confidence, and granularity adjacent to each shown fact;
- move the full register into an expandable or deeper evidence surface;
- reveal extra rows, caveats, and source detail only when they change the reader's decision.

If a section cannot be explained in one sentence, one proof object, and one next action, it is not ready to design. Reduce the point before adding layout.

### 5.1 The reader must understand the page before the system explains itself

Every route opens with orientation, not mechanics. A reader should understand in seconds:

- what this page is;
- what it is not;
- what data level it covers;
- where confidence is strong, weak, or blocked;
- what to do next.

### 5.2 Every route has a proof rhythm

The rhythm is:

1. Promise or answer.
2. Fence or boundary where needed.
3. First proof object.
4. Human-readable interpretation.
5. Source trail.
6. Gap or caveat.
7. Next action.

If a page repeats promise, proof, caveat, and CTA without changing the level of evidence, it becomes sludge. If it never gives relief from tables, it becomes a data warehouse.

### 5.3 Marketing surfaces show proof glimpses, not the whole archive

Homepage and top-level hubs should feel visual and editorial. They use proof glimpses, file shelves, and source-literate language. They should not carry the full burden of compare tables, matrix rows, or dossier detail.

The homepage is especially strict: it should make the product legible and desirable, then route to the right proof surface. It should not try to answer every relocation question, display every citation pattern, or summarize every route family. If the homepage feels like a compressed sitemap or a compressed dossier, it has failed.

### 5.4 Product surfaces are task instruments

The screener, shortlist, filters, and comparison controls must be stable, direct, and predictable. They should not inherit marketing choreography that delays input or moves layout.

### 5.5 Evidence surfaces are serious public records

Sources, methodology, comparison pages, regime pages, and dossiers must feel like a calm research desk:

- no decorative data;
- no bare figures;
- no source hidden behind hover only;
- no confident local language for national or proxy values;
- missing data shown as a state, not treated as an embarrassment.

### 5.6 Legal and trust pages should be plain, discoverable, and quiet

Legal pages are not brand theater. They should be easy to find, easy to scan, and linked from the places where risk appears.

## 6. What premium editorial relocation intelligence should feel like

It should feel like:

- a field file that a careful person would keep open while comparing places;
- a publication of record, not a travel magazine;
- a research desk with named sources, dates, confidence, and gaps;
- a calm analyst's brief, not a consultant's pitch;
- visual enough to be memorable, but restrained enough that the data remains inspectable;
- useful to a human reader and quotable by an AI crawler;
- honest about the difference between country, region, town, proxy, unavailable, and blocked data.

It must not feel like:

- a generic SaaS landing page with a relocation noun swapped in;
- an affiliate travel listicle;
- a dashboard pretending to be editorial;
- a card grid that gives every idea the same weight;
- a dossier where the first useful fact is below a stack of decorative sections;
- a source register that reads like a footnote dump;
- a clever interface that hides the fence.

## 7. Visual system rules

The active visual system is v5 Broadsheet Ledger.

Preserve:

- `Newsreader` for display, headings, and wordmark roles.
- `Inter` for UI and body.
- `JetBrains Mono` for figures, dates, citation IDs, source metadata, and machine-like labels.
- Near-white paper, warm off-white bands, ink, ink-blue structural accents, and terracotta as a small warm pop.
- Hairline rules, ledger rows, source chips, confidence marks, and dated evidence.
- Engravings on aspirational, place, and CTA surfaces where they orient the reader.
- Type-and-evidence-led layouts for trust, methodology, compare, sources, regime, and dossier pages.

Avoid:

- old Almanac palette or font decisions overriding v5;
- decorative stock imagery;
- nested cards;
- page sections styled as floating cards;
- repeating equal card grids as the default IA;
- icon tiles for every concept;
- hover-only citations;
- motion that hides content or makes research feel playful;
- page-load choreography on product task surfaces.

Cards are allowed for repeated items, such as file links, hub entries, related links, and legal page indexes. Cards are not allowed as the default page-section architecture.

## 8. Navigation and discoverability contract

### 8.1 Primary nav

The recommended primary nav is:

- `Compare`
- `Shortlists`
- `Guides`
- `Sources`
- `Build my shortlist`

This is stronger than `How it works`, `Compare`, `Methodology`, `About`, `Build my shortlist` because it maps to product jobs instead of internal explanation.

Route placement:

- `How it works` belongs on the homepage and methodology, not top nav.
- `Methodology` belongs under `Sources` and `Guides`, not top nav.
- `About` belongs in the footer and may be linked from trust sections, not top nav.
- `Build my shortlist` stays the primary action.

### 8.2 Missing or weak routes

Before broader launch, add or resolve these routes:

- `/compare`: a comparison hub. Current nav links directly to `/compare/greece-portugal-spain`. That is acceptable only while there is one comparison. The hub becomes required when a second comparison exists.
- `/about`: a plain couple and brand framing page. It should state that James and Amanda are relocators sharing sourced data, not advisers. It should not become founder mythology.
- `/screening-notice` or `/legal/screening-notice`: a public explanation of the fence string. This can be linked from pages that carry residency, visa, tax, cost, or financial implications.
- `/places/greece/crete/chania`: keep as coverage or draft until Data Desk clears the gate. Do not present it as a finished town dossier while publication hold remains.
- `/dossiers` or `/dossier`: do not add as a public sales surface until the first source-backed dossier unit is real and the paid-dossier fence is settled.
- `/pricing`: do not add until a revenue test is explicitly cleared.

### 8.3 Discoverability rule

Every public route must be reachable from at least one of:

- primary nav;
- footer;
- homepage `Open files`;
- a route hub;
- an in-page related link from a semantically close page.

Sitemap-only discoverability is not enough for a human product surface.

### 8.4 Hub responsibilities

`/guides` owns:

- answers;
- topics;
- tools;
- tax and regime explainers;
- methodology link if it is educational.

`/sources` owns:

- source list;
- methodology;
- confidence tiers;
- freshness rules;
- screening notice;
- affiliate disclosure;
- raw or machine-readable data pointers when safe.

`/places` owns:

- countries;
- regions;
- towns;
- readiness states;
- what is published, what is held, and why.

`/shortlists` owns:

- ranked scenarios;
- visible filters;
- rank keys;
- saved or shareable shortlist futures.

`/compare` owns:

- flagship country comparisons;
- corridor comparisons;
- the standard for neutral, no-winner comparison.

## 9. Route-level choreography

### 9.1 Homepage

Reader job: understand that MSC is a serious relocation screening product and choose a first path.

Spine:

1. Visual first viewport with brand promise and live product artifact.
2. One problem beat about stale, uncited relocation numbers.
3. One explanation beat showing how the engine turns sources into a shortlist.
4. One trust beat explaining confidence, freshness, and the no-advice boundary.
5. Open files shelf with only live public artifacts.
6. Coverage and who it is for, kept brief.
7. A short final trust close.
8. Primary CTA to screener.

Weak spots to guard:

- too much data and sourcing in the marketing surface;
- every section trying to prove the whole product;
- source detail appearing where a source cue would be enough;
- blank bands caused by scroll reveal in capture or no-JS states;
- generic card rows;
- proof shelf linking to draft or blocked surfaces;
- hero artifact changing size across interactions.

Homepage information budget:

- one primary idea per section;
- no section should need more than one prominent proof object;
- no full comparison table on the homepage;
- no full methodology explanation on the homepage;
- no more than three `Open files` unless a fourth is live, important, and clearly different;
- source metadata appears as compact proof cues, with the full source trail deeper.

Implementation targets:

- `packages/web/src/pages/index.astro`;
- shared nav/footer in `Base.astro`;
- homepage-specific styles stay local unless two more routes need the same pattern.

### 9.2 Screener

Reader job: enter a situation and see a cited shortlist, without receiving advice.

Spine:

1. Product header with clear exit.
2. Fence above or beside the first claim.
3. Situation input grouped into stable sections.
4. Source-read strip that names what the engine reads.
5. Results area with score, reasons, sources, confidence, and missing data states.
6. Next steps to compare, save, or inspect sources.

Weak spots to guard:

- mismatch between mockup fields and engine inputs;
- marketing animation slowing the task;
- asking for more inputs than the first useful shortlist requires;
- showing more result explanation than the reader needs before they choose a place to inspect;
- result cards that imply recommendation;
- inaccessible controls or small hit targets;
- missing source or confidence states in results.

Implementation targets:

- `packages/web/src/pages/screener.astro`;
- `packages/engine` for screening logic;
- tests for no individualized wording and fence visibility.

### 9.3 Compare pages

Reader job: compare a small set of places or regimes on the same evidence standard.

Spine:

1. Neutral comparison thesis with no winner.
2. Fence and freshness state where needed.
3. Scenario tabs or filters.
4. A structured comparison table with source and confidence visible.
5. Interpretation bands for meaningful differences.
6. Sources and methodology link.
7. CTA to screener or deeper files.

Weak spots to guard:

- table overload with no reading order;
- too many dimensions visible before the reader chooses a scenario or concern;
- per-country color bias implying winner or brand identity;
- mobile overflow;
- old hardcoded figures drifting from data;
- source links split too far from values.

Implementation targets:

- `packages/web/src/pages/compare/greece-portugal-spain.astro`;
- future `packages/web/src/pages/compare/index.astro`;
- `ComparisonCell.astro`, `FactsTable.astro`, `SourcesList.astro`.

### 9.4 Shortlists

Reader job: see ranked scenarios and understand what the ranking means.

Spine:

1. Scenario label and criteria.
2. Ranking key and fence.
3. Shortlist rows with score, source-backed reasons, confidence, and gaps.
4. Filters with stable controls.
5. Save or inspect route.

Weak spots to guard:

- "best for you" language;
- rank without reason;
- unknown data scored as zero;
- every ranked item showing all evidence before the reader expands it;
- equal card stacks that hide the top signal;
- no way to inspect the source trail.

Implementation targets:

- `packages/web/src/pages/shortlists/index.astro`;
- `packages/web/src/pages/shortlists/[slug].astro`;
- scoring tests in `packages/engine`.

### 9.5 Guides, answers, topics, tools, and tax hubs

Reader job: find a source-backed explanation or tool without needing to understand the whole product map.

Spine:

1. Hub promise.
2. Grouped entries by reader task, not internal content type.
3. Short provenance cue for high-liability topics.
4. Links to methodology and sources where the topic needs trust.

Weak spots to guard:

- all entries same weight;
- corridor cards that feel like filler;
- route types scattered across multiple hubs;
- weak relationship between guides and source pages.

Implementation targets:

- `packages/web/src/pages/guides.astro`;
- `packages/web/src/pages/answers/**`;
- `packages/web/src/pages/topics/**`;
- `packages/web/src/pages/tools/**`;
- `packages/web/src/pages/tax/**`.

### 9.6 Sources and methodology

Reader job: verify where the product gets its facts and understand how confidence works.

Spine:

1. Source passport summary: what the product knows, trusts, refreshes, and still lacks.
2. Searchable source register.
3. Confidence tiers.
4. Freshness rules.
5. How a figure is built.
6. Screening notice and no-advice boundary.
7. Machine-readable pointers where safe.

Weak spots to guard:

- source list as a dumping ground;
- methodology hidden from sources;
- confidence explained as decoration rather than a claim contract;
- no visible gap state.

Implementation targets:

- `packages/web/src/pages/sources.astro`;
- `packages/web/src/pages/methodology.astro`;
- `SourcesList.astro`;
- `CiteThis.astro`;
- `ConfidenceMark.astro`.

### 9.7 Places hub

Reader job: understand coverage and readiness, not browse fake breadth.

Spine:

1. Coverage promise.
2. Published, held, and upcoming states.
3. Country and region index.
4. Explanation of why a held page is held when useful.
5. Link to sources and methodology.

Weak spots to guard:

- pretending Chania is finished before the gate clears;
- hiding source gaps;
- showing empty breadth as product progress;
- route labels that do not distinguish country, region, town, and coverage.

Implementation targets:

- `packages/web/src/pages/places/index.astro`;
- `packages/web/src/pages/places/[...path].astro`;
- `docs/msc-room-state.json` and queue files for readiness states.

### 9.8 Dossier pages

Reader job: evaluate a specific place as a source-backed relocation candidate.

Spine:

Use `docs/superpowers/specs/2026-06-29-dossier-page-template-system.md`.

Additional choreography rule:

The public page should not start as a full 254-row table. It starts with an answer-first summary and a local signal board, then makes the full matrix inspectable and crawlable.

The answer-first summary must also respect the minimum sufficient information rule. It should show the few facts that change interpretation of the place, then route the reader to the full evidence explorer for the rest.

Blocked condition:

Do not implement the Chania dossier page template until Data Desk marks both `gr-crete-region` and `gr-crete-chania` as `data_bundle_ready` with a publish recommendation, or Command Center gives an explicit override with risk recorded.

### 9.9 About page

Reader job: understand who is behind the product and what role they do not play.

Spine:

1. My Second Country as the brand.
2. James and Amanda as relocators sharing sourced data.
3. The data desk model.
4. The no-advice boundary.
5. Link to methodology, sources, privacy, and screener.

Weak spots to guard:

- implying professional expertise;
- making the brand dependent on personality;
- burying the couple framing only in footer text.

Implementation target:

- new `packages/web/src/pages/about.astro`.

### 9.10 Legal pages

Reader job: inspect boundaries and policies quickly.

Spine:

1. Plain page title.
2. Short summary.
3. Policy sections.
4. Links to related legal and source pages.

Weak spots to guard:

- legal links only in footer;
- affiliate disclosure appearing only after a monetized link;
- no screening-notice explainer for the fence.

Implementation targets:

- `packages/web/src/pages/privacy.astro`;
- `packages/web/src/pages/terms.astro`;
- `packages/web/src/pages/affiliate-disclosure.astro`;
- new `packages/web/src/pages/screening-notice.astro` or `packages/web/src/pages/legal/screening-notice.astro`.

## 10. Dossier gate boundary

The dossier gate is not clear.

Design Desk may do:

- route briefs;
- component inventory;
- evidence map requirements;
- rendered QA rubric;
- static, clearly labeled internal mockups;
- Figma composition frames;
- source gap visualization patterns.

Design Desk and Page Factory may not do:

- publish a finished Chania dossier;
- hide publication hold behind prettier copy;
- turn source-gap rows into local claims;
- implement breadth pages while Chania remains held;
- build paid dossier surfaces as if the source-backed unit exists.

The first town page counts only when it passes the data gate, fence gate, source gate, rendered design gate, accessibility gate, and `DEFINITION_OF_DONE.md`.

## 11. Route brief template

Create one route brief before any substantial route work.

```markdown
# Route brief: [route]

Date:
Owner:
Route:
Status:
Primary reader:
Reader moment:
Main question:
Product job:
Business job:
Data state:
Fence state:
Primary next action:
Secondary next action:

## Page spine

1. [First viewport]
2. [Fence or boundary]
3. [First proof object]
4. [Interpretation]
5. [Source trail]
6. [Gap or caveat]
7. [Next action]

## Evidence contract

- Values shown:
- Source display:
- Verified date display:
- Confidence display:
- Granularity display:
- Gap display:
- Machine-readable output:

## Visual register

- Surface type:
- Primary hierarchy move:
- Allowed image or engraving use:
- Components allowed:
- Components banned:
- Motion allowed:

## Discoverability

- Primary nav:
- Footer:
- Hub:
- Related routes:
- Sitemap:

## Rendered proof required

- Desktop viewport:
- Tablet viewport:
- Mobile viewport:
- Scroll-state proof:
- Reduced-motion proof:
- No-JS or JS-failure proof:
- Accessibility check:
- Link check:

## Risks

- Data risk:
- Fence risk:
- UX risk:
- Launch risk:
```

## 12. Implementation sequence

### Phase 0: Lock this spec and source map

Files:

- Create: `docs/superpowers/specs/2026-06-29-msc-page-choreography-and-anti-slop.md`.
- Keep: `docs/design/README.md` as the active design source map.

Acceptance:

- The spec is a reference document, not a process doc.
- It records dossier gate boundaries.
- It names v5 as active.
- It includes the six-stage design process.
- It includes route-level requirements.

### Phase 1: Add the route and discoverability contract

Files likely touched:

- Create: `docs/design/routes.json` or `docs/design/routes.md`.
- Create: `scripts/assert-public-links.ts` if not already present.
- Modify: `package.json` to expose the link assertion if needed.
- Modify: `packages/web/src/pages/sitemap.xml.ts`.
- Modify: `packages/web/src/layouts/Base.astro`.

Implementation:

- Inventory every public route.
- Mark each route as `primary_nav`, `footer`, `hub`, `related`, `sitemap_only`, or `internal`.
- Fail CI if a public route is only discoverable through the sitemap unless it is deliberately marked internal or noindex.
- Add active nav or page context where missing.

Acceptance:

- No public route is orphaned.
- `/styleguide` is noindex or treated as internal.
- Footer includes legal, sources, methodology, and about or planned about.
- Primary nav stays compact.

### Phase 2: Create route briefs for all current public surfaces

Files likely touched:

- Create: `docs/design/routes/home.md`.
- Create: `docs/design/routes/screener.md`.
- Create: `docs/design/routes/compare-greece-portugal-spain.md`.
- Create: `docs/design/routes/sources.md`.
- Create: `docs/design/routes/methodology.md`.
- Create: `docs/design/routes/guides.md`.
- Create: `docs/design/routes/places.md`.
- Create: `docs/design/routes/shortlists.md`.
- Create: `docs/design/routes/legal.md`.

Implementation:

- Use the template in section 11.
- Mark Chania route as held or coverage-only until Data Desk clears the gate.
- Mark paid dossier route work as blocked.

Acceptance:

- Every major route has a reader job and page spine.
- Every high-liability route has a fence state.
- Every route names rendered proof required before implementation.

### Phase 3: Add rendered design QA for page choreography

Files likely touched:

- Create or extend: `scripts/visual-qa-live-readiness.ts`.
- Create or extend: `scripts/assert-public-links.ts`.
- Create or extend: `docs/superpowers/plans/reports/*` visual QA report.
- Use output path: `output/visual-qa/<date>-page-choreography/`.

Implementation:

- Capture viewport screenshots for desktop, tablet, and mobile.
- Capture scroll-state screenshots for long pages.
- Test reduced-motion mode.
- Test no-JS or JS-failure mode for content-bearing pages.
- Detect large blank bands in rendered screenshots where possible.
- Confirm sticky nav and mobile menu function.
- Confirm no right-edge overflow.
- Confirm images and engravings are visible, not broken.

Acceptance:

- QA does not rely only on full-page screenshots.
- Content-bearing sections are not hidden forever if IntersectionObserver fails.
- Every route has current screenshot evidence before founder visual review.

### Phase 4: Retrofit current pages to choreography

Files likely touched:

- `packages/web/src/pages/index.astro`.
- `packages/web/src/pages/screener.astro`.
- `packages/web/src/pages/compare/greece-portugal-spain.astro`.
- `packages/web/src/pages/guides.astro`.
- `packages/web/src/pages/sources.astro`.
- `packages/web/src/pages/methodology.astro`.
- `packages/web/src/pages/places/index.astro`.
- `packages/web/src/pages/shortlists/index.astro`.
- `packages/web/src/pages/privacy.astro`.
- `packages/web/src/pages/terms.astro`.
- `packages/web/src/pages/affiliate-disclosure.astro`.
- `packages/web/src/styles/system.css`.

Implementation:

- Do not start with component restyle.
- Read the route brief first.
- Change section order, proof rhythm, and link structure before polishing.
- Remove equal-card filler where the route needs editorial hierarchy.
- Keep existing shared components when they satisfy the evidence contract.
- Extract shared components only when two or more routes need the same behavior.

Acceptance:

- Each route's first viewport matches its reader job.
- Sources and confidence stay visible near claims.
- Legal and citation gates remain green.
- No page introduces advice language.
- No page hides source gaps.

### Phase 5: Add missing required routes

Files likely touched:

- Create: `packages/web/src/pages/about.astro`.
- Create: `packages/web/src/pages/compare/index.astro`.
- Create: `packages/web/src/pages/screening-notice.astro` or `packages/web/src/pages/legal/screening-notice.astro`.
- Modify: `packages/web/src/pages/guides.astro`.
- Modify: `packages/web/src/pages/sources.astro`.
- Modify: `packages/web/src/layouts/Base.astro`.
- Modify: `packages/web/src/pages/sitemap.xml.ts`.

Implementation:

- Add `/about` before broader launch.
- Add `/compare` when more than one comparison exists or before the current nav becomes confusing.
- Add a screening notice route if the fence links need a plain public explainer.
- Keep these pages quiet, cited where factual, and free of hype.

Acceptance:

- About page carries couple framing without adviser claims.
- Compare hub gives a path to the current flagship comparison.
- Screening notice repeats the fence meaning without expanding into legal advice.
- All new routes are in sitemap and discoverable.

### Phase 6: Dossier implementation, only after data gate clearance

Files likely touched after clearance:

- `packages/web/src/pages/places/[...path].astro`.
- New dossier components listed in `docs/superpowers/specs/2026-06-29-dossier-page-template-system.md`.
- `packages/data/src/place-bundles/**`.
- source and readiness scripts as needed.

Implementation:

- Wait for Data Desk handoff.
- Build one Chania route, not breadth.
- Use the adaptive place dossier template.
- Preserve the full matrix as inspectable HTML and machine-readable data.
- Keep gaps visible.

Acceptance:

- `verify:data` passes or has an explicit Command/Data override.
- `corepack pnpm --filter @where/web build` passes.
- `corepack pnpm verify:build` passes.
- relevant tests pass.
- rendered desktop, tablet, mobile, reduced-motion, no-JS proof exists.
- founder review signs off the rendered page.

## 13. Component extraction rules

Extract or add a component only when:

- two or more routes need the same evidence behavior;
- a shared citation or fence rule would otherwise drift;
- repeated UI needs accessibility consistency;
- the component has a clear prop contract.

Do not extract:

- one-off homepage editorial moments;
- page-level rhythm;
- route-specific proof ordering;
- visual experiments that are still being judged.

Allowed near-term component additions after route briefs:

- `EvidenceStatusPill`, if used by places and sources.
- `RouteFileCard`, if homepage and hubs share the file shelf pattern.
- `ScreeningNoticeLink`, if fence-bearing pages all link to the same explainer.
- Dossier components from the dossier spec, only after gate clearance.

## 14. Motion and reveal rule

Motion must clarify state.

Allowed:

- nav state;
- citation reveal;
- source filter updates;
- screener selection changes;
- shortlist reorder when ranking changes;
- subtle brand page entrance if content remains accessible.

Banned:

- scroll reveal that can permanently hide content;
- decorative drift;
- bounce or playful motion on research pages;
- page-load choreography on the screener;
- animation that changes layout dimensions unexpectedly.

Rendered proof must include:

- default motion;
- `prefers-reduced-motion`;
- long-page screenshot after scroll;
- JS disabled or script failure where the page must still communicate.

## 15. QA gate before a town page counts

A town page counts only after this pass:

1. Data Desk marks the town and parent region `data_bundle_ready` with publish recommendation, or Command Center records an explicit override.
2. Every public claim uses a `CitedValue`.
3. Granularity is visible: local, regional, national, proxy, unavailable, or blocked.
4. Fence renders above the first high-liability or financial/cost claim.
5. The page has an answer-first summary, signal board, evidence map or pin list, source gap section, full evidence explorer, sources, and related routes.
6. The first screen and first summary show only the facts needed to understand the place's main screening posture.
7. The page works without JavaScript for core reading.
8. Desktop, tablet, mobile, reduced-motion, and no-JS proof exist.
9. No content overlaps, overflows, or disappears in screenshots.
10. The mobile menu exposes the same core product paths.
11. JSON-LD and raw evidence data are present where required.
12. Links and sitemap are current.
13. Human design review confirms the page feels like a premium source-backed dossier, not a travel article or admin table.

## 16. Open implementation risks

### 16.1 v5 compatibility aliases

`packages/web/src/styles/system.css` still contains compatibility aliases. They are acceptable during migration, but future work should remove aliases only after route and component use is checked.

### 16.2 Card language and route hubs

Some corridor hub patterns still use card naming and repeated item cards. Repeated item cards are allowed, but a page must not become a same-weight card wall.

### 16.3 Reveal-driven blank bands

The current full-page screenshot path exposed blank lower bands. Future QA must distinguish between screenshot artifact and real user failure, then remove any content-hidden-by-default pattern that fails no-JS or reduced-motion proof.

### 16.4 Dossier pressure

The dossier template system is tempting because the page shape is clear. It remains blocked until data handoff clears. Do route briefs and QA rubrics now, not public implementation.

### 16.5 Navigation growth

The current compact nav is right. It will become wrong if more comparisons, dossiers, or revenue surfaces are added without hubs. Add hubs before adding more top-nav items.

## 17. Definition of complete for this spec

This spec is complete when it is used to produce:

- a route discoverability contract;
- route briefs for the current public surfaces;
- rendered QA proof that includes scroll, reduced motion, and no-JS states;
- a cleanup pass on homepage, screener, compare, sources, methodology, guides, places, shortlists, and legal pages;
- missing route decisions for `/about`, `/compare`, and screening notice;
- a gate-respecting dossier implementation only after Data Desk clears Chania.

The success measure is not that pages look polished. The success measure is that a reader can feel the structure of the decision, inspect the proof, see the boundary, and choose the next route without trusting a vibe.
