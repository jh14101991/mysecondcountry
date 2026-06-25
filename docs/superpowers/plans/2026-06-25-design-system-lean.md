# My Second Country: lean design system (Phase 0 spec)

Status: ready to execute. Author: design session 2026-06-25. Branch: `design/compare-make-production`.

## Intent

Turn the one finished page into a small, reusable system so the page generator builds every
page consistently. **Lean and refined, not exhaustive.** The site is data-driven; the moat is the
cited data, AI-search legibility, and short-form content. Design is a trust gate, not the moat:
clear the "do not look like an affiliate farm" bar with restraint, then spend the rigor on the
**cited-data and structured-data discipline**, because that is the part AI answer engines read.

Anti-slop = restraint. The smallest set of beautiful, consistent components. One confident move per
page (the masthead). Every figure cited. Nothing speculative.

## What already exists (the reference implementations)

- `packages/web/src/pages/compare/greece-portugal-spain.astro`: the **Comparison** archetype, fully
  built to the publication-of-record design, ~90/100 on the impeccable rubric. Semantic `<table>`,
  small multiples, typographic masthead + serif nameplate, real cited data, guards pass.
- `packages/web/src/pages/[country]/tax/[slug].astro`: the **Owned-rule** archetype (the Greece 7%
  regime page). Cited facts table, eligibility cards, cite-this block.
- `packages/web/src/pages/places/[...path].astro`: the **Place profile** archetype.
- `packages/web/src/layouts/Base.astro`: OKLCH tokens, the four font roles, teal nav (serif
  nameplate) + footer.
- `packages/web/src/components/`: `FenceBlock.astro` (fixed), `ComparisonCell.astro`,
  `CitedValueCell.astro`.
- Fonts: free faces (`EB Garamond` display, `Spectral` serif, `IBM Plex Sans` ui, `IBM Plex Mono`
  figures). Rosetta names (`Neacademia`/`Skolar`/`Skolar Sans`/`Adapter Mono`) stay first in the
  `--font-*` stacks as an optional future drop-in. Do **not** buy fonts.

Read these plus `DESIGN.md`, `PRODUCT.md`, `FENCE.md`, `DEFINITION_OF_DONE.md`, and
`packages/data/src/schema.ts` before starting.

## The model: 7 archetypes, 3 workhorses

| Archetype | Families | Build now? |
|---|---|---|
| Owned-rule / topic | tax & regime, residency & visa, cost & housing, practical deep, money-in-motion | yes (exists) |
| Comparison | comparisons, cost vs cost, constraint/persona | yes (exists) |
| Place profile | towns, regions, islands | yes (exists) |
| Q&A / AEO answer | literal AI-engine questions | components now, page later |
| Dealbreaker / inversion | who does NOT qualify | just-in-time |
| Tracker / freshness | what changed, deadlines, closure trackers | just-in-time |
| Tool | checklist, timeline, documents | just-in-time |

The four "uncovered" families a critic might flag (money-in-motion, cost/housing, practical,
constraint/persona) are **owned-rule or comparison with different data**, not new templates. Build
them when their first real page is needed.

## Design language (the visual brief)

- **Tokens** (already in `Base.astro`, keep): OKLCH palette, never `#000`/`#fff`. Four font roles:
  `--font-display` (masthead/headlines), `--font-serif` (reading), `--font-ui` (interface),
  `--font-mono` (every figure, tabular-nums).
- **Confidence** is always glyph + word, never colour alone. Low confidence is neutral, never red,
  and carries "Reported, not verified against a primary source."
- **Restraint**: generous whitespace, hairline rules and tonal surfaces for depth (no drop shadows),
  one masthead moment per page, accents used sparingly.
- **Hard don'ts** (enforced by guards): no emoji, no decorative dots, no radar charts, no
  gradient-overlay photo hero, no drop shadows, no em dashes (or `--`), no individualised
  recommendation language ("you should", "best for you", "we recommend"), sentence case only.

## Component core (~12, build now)

Collapse, do not add. Each is an Astro component under `src/components/`. For each: props, states,
and the machine-readable output it emits.

1. **`CitedValue`** (the atom; replaces `CitedValueCell` + a separate confidence/source/excerpt).
   Props: `cited: CitedValue`, `unit?`, `prose?`, `as?: "td" | "span"`. Renders: the value in
   `--font-mono` tabular (or prose in `--font-serif` for string claims), unit, confidence
   (glyph + word, OKLCH `--conf-*` tokens), source link (`rel="noopener nofollow"`), verified date,
   optional excerpt. **Emits** a `PropertyValue` (`name`, `value`, `unitText`, `url` = sourceUrl,
   `description` = sourceName + verifiedDate, `measurementTechnique` = confidence tier) collected by
   the page into its `Dataset.variableMeasured`. This is the single most important component: fix the
   current bug where figures render in serif, and the bug where badge colours are hardcoded hex.
2. **`FenceBlock`** (exists): the liability fence, above the first claim.
3. **`Masthead`**: `variant: "topic" | "compare" | "place" | "qa" | "tracker" | "tool"`. Props:
   `title`, `dateline` (computed "Cited [date] · N sources · screening, not advice"), `standfirst?`,
   `media?` (the duotone band slot). One `<h1>`. Display font.
4. **`SectionHeading`** (`<h2>`/`<h3>`, ui font, small uppercase label or serif depending on slot).
5. **`Breadcrumb`**: real `<a>` links (not spans) + emits `BreadcrumbList` JSON-LD.
6. **`SourcesList`**: numbered, deduped sources with `#sources-{n}` anchors.
7. **`RelatedLinks`**: a flat `<ul>` of up to 6 internal links.
8. **`CiteThis`**: the mono cite-this block, one line per cited fact with source + date + fragment URL.
9. **`FactsTable`**: a semantic `<table>` (caption, `<th scope>`) of `CitedValue` rows. Used for the
   owned-rule facts and the comparison grid.
10. **`ClaimCard`**: one card for an eligibility condition OR a dealbreaker (`variant: "eligibility"
    | "dealbreaker"`). Framing prose + one `CitedValue` + confidence + source.
11. **`DirectAnswer`** + **`FaqItem`**: the AEO surface. `DirectAnswer` is the answer-first box
    (question as heading, cited answer in the first sentence). `FaqItem` is a Q&A pair; ≥2 of them on
    a page emit `FAQPage` JSON-LD whose `Question.name` must match the visible `<h3>`.
12. **`AtAGlance`**: the small-multiples dot scales + the teal leader strip (extract from the compare
    page).

**Just-in-time** (build with the first page that needs them, not now): `ChangeLog` (tracker),
`StepList`/`ToolStep` (tool), `DeadlineTable` + `Event` JSON-LD (tracker).

## The cited-data + structured-data discipline (the moat, non-negotiable)

- Every `CitedValue` is human render + machine `PropertyValue` in one place. No deferred-footnote-only
  attribution.
- **Every page emits**, computed at build time: `Article` with `dateModified` = the newest
  `verifiedDate` on the page (the freshness signal), `BreadcrumbList`, and its primary type:

  | Archetype | Primary JSON-LD (+ Article + BreadcrumbList on all) |
  |---|---|
  | owned-rule | `Dataset` + `DefinedTerm` (named instruments) + `FAQPage` if ≥2 FaqItems |
  | comparison | `Dataset` + `FAQPage` (from the scenario summaries) |
  | place | `Place` + `Dataset` + `FAQPage` |
  | Q&A | `QAPage` (+ `FAQPage`) |
  | dealbreaker | `Dataset` + `DefinedTerm` |
  | tracker | `Dataset` + `Event` (per deadline) |
  | tool | `HowTo` |

- **AEO rules** (per page): H1 is the exact query a user would type (question mark on Q&A pages); the
  first sentence under each heading is the cited answer (country, number, unit, source, date, no
  preamble); the fence sits before the first claim and above the fold at 375px; **≥4 unique cited
  fields (distinct sourceUrls) or the page does not publish** (anti-thin).

## Fixes the audit found (do these during extraction)

These already-shipped gaps undercut the moat; fix as part of Phase 1:
- Regime, compare, and place pages emit a bare `Dataset` only. Add `Article` + `dateModified` and
  `BreadcrumbList` to each; enrich `PropertyValue` nodes with value/unit/source/url/date/confidence.
- `CitedValueCell` renders the value in `--font-serif`; it must be `--font-mono` (the Mono-Figure
  rule). Fold into `CitedValue`.
- Badge colours are hardcoded hex (`#1f5132` etc.); use the OKLCH `--conf-*` tokens.
- Breadcrumbs use `<span>` for every crumb; non-current crumbs must be `<a href>`.

## Guards to add (lean, high-value; all are cheap grep/parse over built HTML)

Add under `scripts/`, wire into `verify:build`:
- `assert-h1-count` (exactly one `<h1>`), `assert-no-em-dashes` (no `—`/`–`/`--` outside `<code>`),
  `assert-fence-before-claim` (fence DOM-precedes the first table/CitedValue on tax/visa/residency
  pages), `assert-confidence-marks` (every badge has glyph AND word), `assert-table-semantics`
  (caption + `th scope`, no `<div>` children), `assert-no-individualised-copy` (banned phrases),
  `assert-date-modified` (Article/Dataset `dateModified` == max verifiedDate),
  `assert-faq-jsonld` (FAQPage questions match visible `<h3>`s).
- Extend existing: `check-freshness` to honour per-field `stalenessDays`; `assert-uniqueness` to
  cover topic and Q&A pages, not only places.

## Styleguide

One `/styleguide` page (noindex, dev reference), built from the component library so it cannot drift:
render the token swatches and every component in every state (each confidence tier, leader/non-leader,
long text, empty). This is the visual reference and a screenshot regression target.

## Build sequence

1. **Extract** the compare + regime pages into the `~12` component core; refactor both pages to use
   them; apply the audit fixes (JSON-LD completeness, mono figures, token badges, link breadcrumbs).
2. **Guards**: add the 8 + extend 2.
3. **Styleguide**: the `/styleguide` page.
4. **`DESIGN.md`**: regenerate lean and current (this design language + the component vocabulary +
   the do's/don'ts), so the generator reads one accurate spec.
5. **Later, just-in-time**: one reference page per remaining archetype (Q&A, dealbreaker, tracker,
   tool) when its first real page is needed.

## Verify (before claiming any phase done)

`npm run build` (exit 0), `npm run test`, `npm run verify:build` (all guards), `npx biome check`
(0 errors). The compare and regime pages must keep their scores; the impeccable detector stays at
its 2 non-defects; axe + computed contrast clean; `/styleguide` renders. Show a screenshot.

## Constraints (carry forward)

OKLCH only, never `#000`/`#fff`. No em dashes anywhere. Sentence case. Confidence glyph + word.
WCAG 2.1 AA. Every figure is a real `CitedValue` with source + date + confidence. Top model steers
and reviews; delegate mechanical implementation to a cheaper model, then controller-review. Free
fonts; do not buy. Keep the build green and all guards passing at every step.
