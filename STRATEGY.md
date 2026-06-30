# Strategy snapshot

A one-page map of My Second Country. This is a reference snapshot, not a process doc: it does
not count against the four-doc cap (ADR-0012), and it defers to the canonical sources below. If
this file and a canonical source ever disagree, the canonical source wins.

Canonical sources: `PRODUCT.md`, `FOUNDER.md`, `SHIP.md`, `DEFINITION_OF_DONE.md`,
`docs/superpowers/specs/2026-06-24-v1-design.md`, `docs/decisions/ADR-log.md`.

## The thesis
One question: where should I live, given my situation? Constraints in, a ranked, source-cited
shortlist of countries, regions, and towns out.

## The wedge
Freshness and citation discipline. Residency and tax rules change yearly; a cron-refreshed engine
that sources and dates every claim is the most current and auditable answer, which is what
Google's quality floor and AI answer engines reward. The cited dataset is the asset; the website
is its most credible projection.

## Two audiences
People with money in motion (remote earners, recent exiters, retirees comparing tax regimes,
relocating couples), and AI answer engines (Perplexity, ChatGPT, AI Overviews) treated as a
primary acquisition channel.

## The design rule (load-bearing)
Cited screening intelligence pointing to primary sources, never advice. The fence stays above the
fold. The faces are relocators sharing sourced data, never advisors. If it cannot be expressed as
cited data with a verify-with-a-pro fence, it does not ship. (FENCE.md, ADR-0008.)

## Architecture: one dataset, many projections
A canonical `Place` and `Regime` dataset in `packages/data` (content-as-code, Zod-validated, every
fact a CitedValue). `packages/engine` scores and filters. `packages/web` renders. Every page, and
later every clip, post, and newsletter, is a projection of the same source. (ADR-0001, 0002, 0017.)

## Route families (the scaffolding)
- Live: `/` · `/places/[...path]` (country, region, town) · `/compare/...` ·
  `/[country]/tax/[slug]` (regime pages) · `/screener` (a fixed-example shortlist funnel, not yet
  scoring user input; see below) · `/answers/[slug]` (static cited Q&A) · the trust pages
  (`methodology`, `sources`, `privacy`, `affiliate-disclosure`) · email capture (live but gated
  closed via `EMAIL_FORM_ACTION`) · `/data/regimes/[slug].json` · `sitemap.xml` · `robots.txt` ·
  `llms.txt` · JSON-LD on every page.
- Designed, not built: the screener does not yet read or score user input (`scoreByProfile`,
  `applyFilters`, `screenPlace` exist in `packages/engine`, fully tested, but are not imported by
  any web page) · the content engine (video, social, newsletter) · affiliate links (component
  exists, not turned on) · the Stripe fake-door · the paid cited dossier (ADR-0018).

## Geography
Global brand, Europe-first depth, demand-led waves. Greece is the dogfood proof. Depth ranks and
gets cited; thin breadth gets penalized. (ADR-0015.)

## Distribution (is engineering)
Roughly 55% data and engine, 45% distribution machinery (programmatic pages, schema, the content
engine, the auto-newsletter, all code), 10% light manual seeding. Short-form video ignites fast
and senses demand; programmatic SEO and AEO compound; the newsletter is the owned loop; forums and
a one-time launch seed backlinks. The page is the channel.

## Monetization
Recurring revenue off the freshness moat is the primary line: a consumer change-monitoring subscription ("alert me when the rule that affects my move changes") and B2B licensing of the cited, dated, staleness-monitored dataset. The validated entry product is a one-time cited dossier, a dated relocation snapshot the reader hands to their own accountant or lawyer, proven with a fake-door before any build and designed as the front door to the subscription. Affiliate is demoted to a disclosed floor on commodity adjacencies only (currency transfer, insurance, SIM, moving), barred from every cited tax, visa, or residency claim. Nothing monetizes before there is traffic. (ADR-0018.)

## The founder shape (why it is built this way)
Infinite runway: revenue is chosen proof, not survival, so optimize a durable 2 to 3 year
compounding asset, judged on trend. Guard the dominant failure mode, building instead of shipping.
Everything recurring runs on cron and gates; human touch is batched (one video session, one weekly
merge), never a daily ritual. (FOUNDER.md, SHIP.md.)

## The ship floor
At least three real market exposures per week once v1 is live: a published page, a posted clip, a
sent newsletter issue, or a live fake-door. A week with more process docs than market touches is a
debt week, and the next block goes to shipping. (SHIP.md.)

## Kill / continue gate (month 9 to 12)
Continue if two or more are moving: organic and AI-citation traffic compounding; one short-form
hook breaking past the founder's own audience; the fake-door showing paid intent (clicks, even
with zero completions). Judge only after a fair window: about 20 published pages, 30 posted clips,
and 4 newsletter issues. A flat result reworks the wedge, not the build. (SHIP.md.)

## Status (2026-06-30)
- A0 live: three countries (Greece, Portugal, Spain), the comparison page, the screener (as a
  fixed-example shortlist funnel), launched on `mysecondcountry.com`.
- Engine catalogue: 15 wired screening variables (profile presets, dealbreaker filters,
  confidence-aware scoring) implemented and unit-tested in `packages/engine`, not yet imported by
  any web page. The aspirational ~200-variable catalogue is unbuilt and deferred; do not read
  either as "variable system live" on the shipped site.
- First deep page live: the Greece foreign-pensioner 7% flat-tax regime, plus its public cited
  dataset, schema.org Dataset JSON-LD, an `llms.txt` entry, and freshness, sources, and JSON-LD
  guards that walk the regimes collection.

## Sequenced next builds
1. The minimal content and newsletter engine, the only thing that makes the ship floor and the
   clip and issue counts in the kill gate reachable. Start with the cheap outputs (rough cards,
   social posts, the auto-newsletter) and a first batch recording; defer the heavy video pipeline.
2. Turn affiliate links on (trust pages are already live; affiliate is the remaining gate before
   the disclosed commodity floor in ADR-0018 can go live).
3. The second regime page, demand-led: chosen from the search and AI-crawler logs of the first one.
