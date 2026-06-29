---
version: v5
name: My Second Country
system: Broadsheet Ledger
description: Premium cited relocation intelligence with editorial type, source-visible figures, and a strict screening fence.
colors:
  paper: "#FCFCFC"
  paper-warm: "#FAF7F1"
  paper-stone: "#F2EFE8"
  paper-2: "#F7F4EE"
  surface: "#FFFFFF"
  ink: "#1A1813"
  ink-soft: "#46423A"
  stone: "#6E675C"
  hairline-soft: "#E6E3DC"
  accent: "#1D3A5F"
  accent-dark: "#13283F"
  tint-clay: "#EEF0F4"
  pop: "#BC5A36"
  pop-ink: "#9C4329"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    roles: ["wordmark", "hero", "section heading", "editorial figure title"]
    weight: 400
  ui:
    fontFamily: "Inter, system-ui, sans-serif"
    roles: ["body", "navigation", "buttons", "form labels"]
    weights: [400, 500, 700]
  mono:
    fontFamily: "JetBrains Mono, Courier New, monospace"
    roles: ["figures", "units", "dates", "source metadata", "scores"]
    feature: "tabular numbers"
radii:
  framed-surface: "4px"
  button: "999px"
  legacy-card: "8px maximum"
motion:
  distance: "24px"
  duration: "700ms"
  easing: "cubic-bezier(0.22, 1, 0.36, 1)"
  reduced_motion: "Disable reveal, image reveal, hover lift, and parallax."
registers:
  marketing: ["homepage"]
  product: ["screener", "shortlists", "tools"]
  evidence: ["places", "compare", "tax regimes", "methodology", "sources", "answers", "topics"]
machine_rules:
  no_em_dash: true
  headings: "sentence case"
  confidence: "square glyph plus word"
  first_claim: "FenceBlock before tax, visa, residency, legal, or financial claims"
  citation_contract: "Every fact that could be wrong is a CitedValue"
  recommendation_boundary: "Screening intelligence, never individualized advice"
---

# Design system: My Second Country

## 1. North star

**Creative north star: Broadsheet Ledger.**

My Second Country should feel like a premium editorial record joined to a careful public-data desk. It is not a generic SaaS page, not a travel blog, and not a relocation agency brochure. The page should look like it was assembled by people who distrust unsupported claims: a reader sees the figure, the source, the verified date, the confidence tier, and the boundary before they are asked to believe anything.

The product feeling is calm, exact, and publication-grade. Editorial type gives the work authority; hairline ledgers make it inspectable; mono figures make it auditable. Warmth comes from paper tones, Newsreader, and occasional terracotta, not from rounded-card decoration or lifestyle cheer.

## 2. What Vercel design.md means here

The useful lesson from Vercel's `design.md` is not the Geist look. It is the contract shape: design tokens, type roles, component rules, and interaction expectations written so an agent can implement consistently. My Second Country keeps its own identity and uses the same idea as a machine-readable design contract.

The frontmatter above is the source of truth for palette, typography, register split, and hard UI rules. If a future page cannot satisfy that contract, change the contract deliberately, do not improvise a one-off page style.

## 3. Color

The palette is neutral, cited, and publication-led:

- `--paper #FCFCFC`: default page surface.
- `--paper-warm #FAF7F1`: soft editorial bands and warm trust areas.
- `--paper-stone #F2EFE8`: quiet secondary bands.
- `--paper-2 #F7F4EE`: footer and secondary paper.
- `--surface #FFFFFF`: content surfaces only. Pure white is allowed here because the v5 engraving system relies on white image grounds.
- `--ink #1A1813`: headings and primary text.
- `--ink-soft #46423A`: body copy and explanatory text.
- `--stone #6E675C`: metadata, secondary labels, and provenance.
- `--hairline-soft #E6E3DC`: 1px rules, dividers, and ledger boundaries.
- `--accent #1D3A5F`: structural ink-blue for primary actions and links.
- `--accent-dark #13283F`: hover and stronger link states.
- `--tint-clay #EEF0F4`: liability and disclosure surfaces.
- `--pop #BC5A36` and `--pop-ink #9C4329`: the only warm accent, used sparingly for waypoints and key figures.

Named rules:

- **No-winner neutrality.** Do not use per-country color coding. Greece, Portugal, Spain, and future countries share the same neutral treatment.
- **Never-pure rule.** Do not use pure black. Use the v5 tokens. Pure white is reserved for `--surface` and generated engraving grounds.
- **Ten-percent pop rule.** Terracotta is an accent, not a theme. If a page starts reading orange, revise.
- **Color-plus-mark rule.** Confidence cannot be conveyed by color alone.

## 4. Typography

Three roles are locked:

- **Newsreader** for the wordmark, hero headlines, section headings, large editorial numbers, and serious page titles. Use regular weight. Size and rhythm carry emphasis.
- **Inter** for body, navigation, buttons, form controls, labels, and dense product surfaces.
- **JetBrains Mono** for every number, unit, rate, score, source date, verification date, and machine-readable cue.

Named rules:

- **Mono-figure rule.** Every figure, unit, rate, score, and date is mono with tabular numbers.
- **Light-serif display rule.** Display headings stay regular weight. Bold serif headings read like marketing and should be avoided.
- **Sentence-case rule.** Headings are sentence case. Uppercase is reserved for short labels and overlines.
- **Container-fit rule.** Text must fit on mobile and desktop without overlap or clipped labels.

## 5. Layout and surfaces

The system is flat and evidence-led.

- Use full-width bands for major sections.
- Use constrained inner `.shell` content for reading width.
- Use hairline ledgers, tables, rows, and framed records for data.
- Use cards only for repeated items, forms, modals, and genuinely framed tools.
- Do not put cards inside cards.
- Do not use decorative gradient blobs, orbs, bokeh, glass, or generic icon grids.
- Do not make evidence pages image-led. Imagery belongs to marketing, CTA, footer, or carefully controlled place atmosphere.

Named rules:

- **Flat-record rule.** Separate information with hairlines and tonal shifts, not shadows.
- **De-carded ledger rule.** If a surface is evidence, prefer rows and ledgers over rounded cards.
- **Imageless CTA rule.** The shared CTA band is type-led and warm, with no decorative image.
- **Engravings-only rule.** If an aspirational visual is needed, use the approved ink-blue engraving language.

## 6. Register split

The site has three registers:

- **Marketing register.** Homepage only. It may use stronger editorial sequence, richer section rhythm, and a live product artifact. It still must show the fence before first tax, visa, residency, legal, or financial claim.
- **Product register.** Screener, shortlists, and tools. It should feel like an instrument: labelled controls, stable dimensions, no choreography that makes inputs hard to use.
- **Evidence register.** Dossiers, comparison pages, regime pages, methodology, sources, answers, and topics. It is type-and-evidence-led. The source record is the hero.

## 7. Components

Use existing components before creating new ones:

- `Base`: global shell, metadata, nav, footer, scripts, and noindex support.
- `FenceBlock`: mandatory liability fence. It must appear before first high-liability body claim.
- `ConfidenceMark`: square mark plus lowercase tier word: high, medium, low.
- `CitedValue`: one human-rendered cited fact and its provenance.
- `FactsTable`: semantic tables only. Captions and scoped headers are mandatory.
- `ComparisonCell`: country comparison figure, still inside semantic table markup.
- `SourcesList`: source list for dossier and comparison pages.
- `Masthead`, `Breadcrumb`, `SectionHeading`, `RelatedLinks`: page framing and navigation.
- `DirectAnswer` and `FaqItem`: answer-engine surfaces. FAQ JSON-LD must match visible questions.
- `ClaimCard`, `AtAGlance`, `CiteThis`: regime and dossier support components.
- `EmailCapture` and `IntroRequest`: revenue surfaces. Preserve form actions, field names, and required disclosure copy.

When a page needs custom markup, it still inherits the same grammar: mono figures, confidence mark, source, verified date, hairline boundaries, body-size fence, and no hidden claims.

## 8. Cited-data discipline

The design system exists to make citation visible. It is enforced by CI, not taste.

- Every factual value is a `CitedValue`.
- A bare scalar fact is a build error.
- Every `CitedValue` has `value`, `sourceUrl`, `sourceName`, `verifiedDate`, `confidence`, and `granularity`.
- Values that carry tax, visa, residency, legal, or financial exposure must show the fence first.
- Low confidence values are shown, labelled, and qualified. They are not hidden.
- No-data is separate from a low score.
- Date freshness is visible through `dateModified`, source dates, and stale warnings.
- Machine-readable JSON-LD must be generated from the same data as the visible page.

Required structured data:

| Surface | Required primary type |
| --- | --- |
| Place dossier | `Place` and `Dataset` |
| Comparison | `Dataset`, `ItemList`, and relevant `FAQPage` |
| Regime page | `Article`, `Dataset`, `DefinedTerm`, and relevant `FAQPage` |
| Methodology | `Article` and `DefinedTermSet` |
| Sources | `DataCatalog` |
| Q&A | `FAQPage` |
| Tool | `HowTo` |
| Shortlist | `ItemList` |

## 9. Copy rules

- No em dashes.
- No AI-register words: leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust.
- No individualized recommendation copy: no "you should", "best for you", "in your case", or "we recommend".
- Use conservative framing: "screens", "compares", "shows", "records", "routes to sources".
- Never claim to provide legal, tax, financial, immigration, or relocation advice.
- Use source names and verified dates in visible copy when a claim depends on them.

## 10. Motion

Motion is quiet and functional:

- Scroll reveal uses one distance, one duration, one easing.
- Hover lift is allowed only on clear action surfaces, and must be subtle.
- Product controls must not move enough to affect usability.
- Reduced motion disables reveal, image reveal, hover lift, and parallax.

## 11. Do and do not

Do:

- Do make the source record visually important.
- Do use mono for every figure and date.
- Do place the fence before high-liability claims.
- Do use hairlines, tables, and rows for evidence.
- Do make controls stable, labelled, and keyboard usable.
- Do run `corepack pnpm verify:build` before claiming a page is done.

Do not:

- Do not import another brand's visual style.
- Do not reintroduce per-country colors.
- Do not make rounded card grids the dominant page language.
- Do not use lifestyle imagery as proof.
- Do not hide uncertainty in footnotes.
- Do not make the homepage only about Greece, Portugal, and Spain. They are the first proof set, not the whole business.
