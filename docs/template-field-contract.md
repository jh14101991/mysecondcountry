# Template field contract (the API between the design lane and the data lane)

Reference doc, not a process doc. Extends `docs/page-templates.md`. Locked 2026-06-25.

## Why this exists

The design lane (Figma to the component kit) and the data lane (cited facts plus page
wiring) run in parallel and must not block each other. They touch in exactly one place: the
**field shape and the component prop interface** of each template. This document is that shape.
Define it once, freeze it, and both lanes can build for weeks without colliding.

**Frozen surface.** Neither lane changes a field name, a prop name, or a route below without
the other lane agreeing. A change here is a small joint edit, never a silent unilateral one.
If a lane discovers the contract is wrong mid-build, stop and amend this file first.

## The shared vocabulary (both lanes already speak this)

Every factual field is a `CitedValue` (`packages/data/src/schema.ts`), with the six locked
core fields: `value, sourceUrl, sourceName, verifiedDate, confidence, granularity`, plus
optional `category, archiveUrl, excerpt, stalenessDays`.

- Visa, tax, and residency facts are **high or medium confidence only** (never low); their
  `category` is fixed so the staleness guard can find them. Use the `highLiabilityValue`
  factories (`TaxValueSchema`, `VisaValueSchema`, `ResidencyValueSchema`, and the string
  variants) for these.
- Staleness windows are per category (`DEFAULT_STALENESS_DAYS`): visa/tax/residency = 90 days,
  cost = 180, climate/healthcare/safety/identity = 365. A per-field `stalenessDays` overrides.
- Confidence renders as glyph plus word, never colour alone (`CONFIDENCE_DISPLAY` in
  `packages/web/src/lib/cited.ts`).
- A new **collection** is a Zod schema + facts + index + tests under
  `packages/data/src/<name>/`, modelled on `places/` and `regimes/`.

### Who owns what (the lane boundary)

- **Design lane** owns `packages/web/src/components/**`, `DESIGN.md`, and the `/styleguide`
  stories. It builds each component against **fixture** cited data and never opens
  `packages/data`. It delivers a component that matches the prop interface below.
- **Data lane** owns `packages/data/**`, `packages/engine/**`, and the page files in
  `packages/web/src/pages/**` (the wiring). It builds the schema, the cited facts, and the
  page that feeds real data into the components, coding against the prop interface below
  before the component is even finished (program to the interface).
- **The reconvergence point** is a green `pnpm --filter @where/web build`. That is the only
  moment the two lanes' work meets.

### Render shape vs source shape

The prop interfaces below are the **resolved render shape** the component receives. How the
data lane sources a `CitedValue` (an inline fact, or a reference to an existing regime/place
fact resolved at build time for a single source of truth) is a data-lane concern the design
lane never sees. Prefer referencing an existing fact over duplicating it, so a figure cannot
drift between two pages; both options resolve to the same `CitedValue` prop.

---

## Template 4: Question (AEO) page

Route (locked): `/answers/[slug]`. Build order: priority 2 (with Topic).

The flagship answer-engine surface: a literal high-intent question, answered in the first
sentence with a dated cited fact, built to be quoted by Perplexity and AI Overviews.

### Data (new collection `qa`, `packages/data/src/qa/`)

| Field | Type | Notes |
|---|---|---|
| `id`, `slug` | url-safe string | unique across qa |
| `question` | string (min 12) | the literal query; becomes the single `<h1>` |
| `polarity` | enum `yes` \| `no` \| `qualified` \| `n-a` | the machine-extractable verdict |
| `answer` | string (min 12, max ~200) | the direct answer sentence; leads with the conclusion, no preamble |
| `answerFact` | `CitedValue` | the dated fact backing the answer (tax/visa/residency: high\|medium) |
| `supportingFacts` | `CitedValue[]` (0 to 3) | additional cited detail |
| `rule` | string (min 80) | the general rule, the "the rule" box prose |
| `category` | `CitedCategory` | drives the page-level staleness signal |
| `relatedSlugs` | string[] (max 6) | internal links |

### Prop interface (design lane)

Reuses the existing kit; **no new component expected**, two small extensions:
- `Masthead` gains the `qa` variant already declared in DESIGN.md (question as `<h1>`,
  dateline, no media band).
- `DirectAnswer` props: `{ polarity, answer: string, answerCited: CitedValue }`. Verify the
  live component already takes a cited answer; extend it to render the polarity chip if not.
- Reuse `FaqItem[]` for `supportingFacts`, `ClaimCard` (or a plain rule box) for `rule`,
  `FenceBlock`, `SourcesList`, `CiteThis`, `RelatedLinks`.

### JSON-LD (data lane, at build time)

`[Article, BreadcrumbList, QAPage(Question + acceptedAnswer), FAQPage(from supportingFacts)]`
as a top-level array (not `@graph`). `dateModified` = newest `verifiedDate` on the page.

---

## Template 5: Topic / fact page

Route (locked): `/topics/[slug]`. Build order: priority 2.

A single cited topic that is not a full regime or visa: property transfer tax, annual property
tax, healthcare access, social security, treaty mechanics. Lighter than the Rule page (no
dealbreaker hero).

### Data (new collection `topics`, `packages/data/src/topics/`)

| Field | Type | Notes |
|---|---|---|
| `id`, `slug` | url-safe string | unique across topics |
| `title` | string (min 12) | the topic as a fact-seeking phrase; the `<h1>` |
| `countryId` | string \| null | a topic may be country-scoped or general |
| `facts` | `{ key: string; label: string; cited: CitedValue }[]` (1 to N) | the compact facts table; min 4 cited fields across the page (anti-thin) |
| `context` | string (min 80) | short authored context prose |
| `definedTerm` | `{ name, description }` optional | when it names an instrument (drives DefinedTerm) |
| `faqs` | `FaqItem[]` optional | adds FAQPage when length >= 2 |
| `relatedSlugs` | string[] (max 6) | internal links |

### Prop interface (design lane)

**No new component.** Reuse `Masthead` (`topic` variant), `FactsTable` (rows of `CitedValue`),
`SectionHeading` + serif body for `context`, `FenceBlock`, `SourcesList`, `CiteThis`,
`RelatedLinks`, optional `FaqItem[]`. This is the lightest template; design effort is layout,
not new parts.

### JSON-LD

`[Article, BreadcrumbList, Dataset(variableMeasured from facts), DefinedTerm?, FAQPage?]`.

---

## Template 6: Constraint / shortlist page

Route (locked): `/shortlists/[slug]`. Build order: priority 4.

A static rendering of a screener constraint into a cited ranked shortlist ("EU residency on
EUR 2,000 a month", persona income-floor pages). **This is a projection over existing Place
and Regime data, not a new fact collection.** The ranked result is computed by the engine at
build time; no shortlist figures are authored or stored.

### Data (thin new collection `shortlists`, `packages/data/src/shortlists/` + engine)

The collection stores only the **constraint spec**; the engine produces the cited result.

| Field | Type | Notes |
|---|---|---|
| `id`, `slug` | url-safe string | unique |
| `title` | string (min 12) | the constraint stated as a phrase; the `<h1>` |
| `intro` | string (min 80) | states the constraint in prose |
| `constraint` | `{ filters: Filter[]; rank: { byKey: string; dir: "asc" \| "desc" } }` | references the ADR-0016 variable catalogue keys |
| `relatedSlugs` | string[] (max 6) | internal links |

`Filter` = `{ key: string; op: "<=" \| ">=" \| "==" \| "in"; value: number \| string \| string[] }`,
where `key` is a Place/Regime variable-catalogue key. The data lane must ensure the engine's
screener can evaluate this spec and emit, per matching place/regime, the `CitedValue`s that
satisfy each filter (so every figure on the page is sourced).

### Prop interface (design lane)

**One new component: `RankedShortlist`.**
`{ items: { rank: number; name: string; href: string; citedFields: { label: string; cited: CitedValue }[] }[] }`.
Reuse any existing `/screener` result cell where it fits. Also a "run the screener yourself"
CTA linking `/screener`, plus `FenceBlock`, `SourcesList` (deduped from all items' facts),
`CiteThis`.

### JSON-LD

`[Article, BreadcrumbList, Dataset, ItemList(position + url + name per ranked item)]`.

---

## Template 7: Decision tool / checklist page

Route (locked): `/tools/[slug]`. Build order: priority 4.

A cited checklist, set of steps, or light calculator: move-to-X checklist, documents for a
visa, the residency-day test, a citizenship clock. Each step is anchored to a cited official
requirement where one exists.

### Data (new collection `tools`, `packages/data/src/tools/`)

| Field | Type | Notes |
|---|---|---|
| `id`, `slug` | url-safe string | unique across tools |
| `title` | string (min 12) | the `<h1>` ("Move to Greece checklist") |
| `toolType` | enum `checklist` \| `calculator` | |
| `intro` | string (min 80) | short authored framing |
| `steps` | `Step[]` (1 to N) | ordered |
| `calculator` | `CalculatorConfig` optional | only when `toolType === "calculator"` |
| `relatedSlugs` | string[] (max 6) | internal links |

`Step` = `{ order: number; title: string; detail: string; requirement?: CitedValue; officialSourceUrl?: string }`.
Visa/residency requirements are high|medium confidence (inherited). `CalculatorConfig` =
`{ inputs: { id, label, type }[]; reads: string; formulaId: string }`. The calculator is
client-side, reads the static cited dataset, and **stores nothing**.

### Prop interface (design lane)

**New components: `StepList` + `ToolStep`** (the just-in-time pair named in DESIGN.md), and an
optional **`Calculator`** widget when `toolType === "calculator"`.
`StepList` props: `{ steps: { title: string; detail: string; requirement?: CitedValue }[] }`.
Reuse `Masthead` (`tool` variant), `FenceBlock`, `SourcesList`, `CiteThis`.

### JSON-LD

`[Article, BreadcrumbList, HowTo(step = HowToStep)]`. Add `FAQPage` only if the tool carries
FaqItems.

---

## Summary: the design lane's new-component queue

The whole point: this list is short and bounded.

| Template | New components | Reused |
|---|---|---|
| 4 Question (AEO) | none (extend `DirectAnswer`; `Masthead` qa variant) | DirectAnswer, FaqItem, ClaimCard, Fence, Sources, CiteThis, Related |
| 5 Topic / fact | none (`Masthead` topic variant) | FactsTable, SectionHeading, Fence, Sources, CiteThis, Related, FaqItem |
| 6 Constraint / shortlist | `RankedShortlist` | screener result cell, Fence, Sources, CiteThis |
| 7 Decision tool | `StepList`, `ToolStep`, optional `Calculator` | Masthead tool variant, Fence, Sources, CiteThis |

Four genuinely new components, two Masthead variants, one component extension. Everything else
is reuse of the live kit. Anything new a template needs is added to the kit at
`packages/web/src/components/`, never invented per page (DESIGN.md section 6).
