# Kickoff: data lane (the data-build thread)

Paste this into a fresh, clean session. It is self-contained.

---

You are the **data lane** for My Second Country, a cited relocation-intelligence site. Your job
is the cited facts and the page wiring. Another lane (the design lane) produces the component
kit. The two lanes are designed not to touch.

## Your mission

Build the cited data and render it through the already-designed templates. Concretely: stand up
the new data collections (`qa`, `topics`, `shortlists`, `tools`) per the frozen contract, grow
the existing Place and Regime data toward the build-now tranche, extend the CI guards to cover
the new collections, and wire the pages that feed real data into the components.

## Read first (canonical, in order)

- `docs/template-field-contract.md` — the frozen API. Build each collection to the **data**
  sections, and wire each page to pass props matching the **prop interface** sections. Do not
  rename fields or props.
- `packages/data/src/schema.ts` and `packages/data/src/regimes/schema.ts` — the proven cited
  shape. The `citedValue<T>()` factory and the `highLiabilityValue` factories are the source of
  truth; model new collections on `places/` and `regimes/`.
- `docs/page-roadmap.md` — the 135-page backlog. The 15 build-now pages are the target;
  prioritise the ones citeable today from existing gr/pt/es data.
- `CITATIONS.md`, `FENCE.md`, `docs/data/SOURCES.md` — the citation and staleness discipline.

## Hard scope boundary (this is what keeps the lanes apart)

- Touch **only** `packages/data/**`, `packages/engine/**`, and the real page files in
  `packages/web/src/pages/**` (the wiring).
- Do **not** open `packages/web/src/components/**` or `DESIGN.md` (those belong to the design
  lane). Consume each component as a black box via its prop interface in the contract. If a
  component you need is not built yet, wire the page against its documented prop interface and
  it will light up when the design lane lands it.

## Your build queue

1. **Priority 2, citeable today:** the `qa` and `topics` collections, seeded from facts that
   already exist in the live Greece 7% regime and the gr/pt/es Place data (golden-visa
   questions, the NHR/IFICI topic, the UK-Portugal treaty topic). Single source of truth:
   prefer **referencing** an existing regime/place fact over duplicating it, so a figure cannot
   drift between two pages.
2. **The Rule-page build-now tranche:** most of the 15 build-now pages are Rule-page instances
   that reuse the live regime machinery (more regimes, more countries).
3. **`shortlists` + engine:** the constraint spec collection, plus the screener evaluation that
   emits, per matching place/regime, the `CitedValue`s satisfying each filter. This is the most
   engine-coupled template.
4. **`tools`:** the checklist/calculator collection (HowTo JSON-LD).

## Non-negotiable data rules (enforced by CI, not review alone)

- Every fact is a real `CitedValue` with `sourceUrl`, `sourceName`, `verifiedDate`,
  `confidence`, `granularity`. **Never fabricate a figure to fill a layout.**
- Visa, tax, and residency facts are **high or medium confidence only**; their `category` is
  fixed. Use the high-liability factories.
- Each page emits, computed at build time, a top-level JSON-LD **array** (not `@graph`):
  `Article` (whose `dateModified` is the newest `verifiedDate` on the page), `BreadcrumbList`,
  and the template's primary type (see the contract: QAPage, Dataset, ItemList, HowTo).
- A page needs at least four distinct cited fields or it does not publish (anti-thin).
- Extend the freshness, sources, uniqueness, and JSON-LD guards to walk the new collections,
  exactly as was done for `regimes` (`pnpm verify:build`, `pnpm verify:data`). Back-date a fact
  in a test to prove the freshness guard fires on each new collection.

## Process

Test-driven (red, green, refactor) via subagent-driven-development. Each collection is a Zod
schema + facts + index + tests under `packages/data/src/<name>/`, then the public dataset
endpoint, the `llms.txt` entry, and the page wiring. Write the schema test and a freshness
back-date test before the data.

## Definition of done

- `pnpm test` green.
- `pnpm verify:data` exits 0.
- `pnpm verify:build` exits 0, with the guards now covering the new collections.
- `pnpm --filter @where/web build` exits 0; each new page renders real cited data through the
  designed components.

## Git hygiene (the working tree is shared with other threads)

- Branch off the consolidated `main` (the controller will have merged the design system and the
  contract first). Suggested branch: `data/expand-collections`.
- **Never `git add -A`.** Run `git restore --staged .` then stage explicit paths under
  `packages/data`, `packages/engine`, and `packages/web/src/pages` only.

## Known TODO (not blocking)

The Greece regime `durationYears` (15) is sourced to the AADE PDF at medium confidence with the
verbatim excerpt deferred (AADE 403s bots, PwC omits it). A human read can later add the
excerpt and lift confidence. Do not fabricate the excerpt.

## Model economy

You (top model) steer: the schema design, the source-quality judgment, the diff review.
Dispatch a `sonnet` implementer per collection from a precise spec, then controller diff-review.
Citation judgment (is this a primary source, is this date real) stays with the top model.

## First action

Read the contract and `schema.ts`, then start the `qa` collection: write the schema and a
freshness back-date test (red), implement the schema (green), then author two or three
golden-visa question entries that reference facts already cited in the live regime and Place
data. Wire `/answers/[slug]` against the `DirectAnswer` / `FaqItem` prop interfaces.
