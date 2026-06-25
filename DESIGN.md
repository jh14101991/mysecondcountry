---
name: My Second Country
description: A cited relocation record, warmed by Mediterranean light, where every figure traces to a primary source.
colors:
  paper: "oklch(0.9360 0.0149 80.7)"
  card: "oklch(0.9708 0.0086 84.6)"
  panel: "oklch(0.9180 0.0140 82)"
  ink: "oklch(0.1850 0.0064 56.0)"
  muted-foreground: "oklch(0.5051 0.0200 84.6)"
  muted-strong: "oklch(0.4432 0.0191 73.4)"
  rule: "oklch(0.1850 0.0064 56 / 0.10)"
  primary: "oklch(0.3389 0.0625 231.2)"
  primary-deep: "oklch(0.2834 0.0508 230.4)"
  on-primary: "oklch(0.9554 0.0045 214.3)"
  on-primary-soft: "oklch(0.7969 0.0212 224.4)"
  greece: "oklch(0.4846 0.1159 246.4)"
  portugal: "oklch(0.4578 0.1549 18.0)"
  spain: "oklch(0.5274 0.1165 57.5)"
  greece-on-primary: "oklch(0.7236 0.1138 244.4)"
  portugal-on-primary: "oklch(0.7491 0.1061 11.0)"
  spain-on-primary: "oklch(0.7767 0.1130 65.2)"
  conf-verified: "oklch(0.4693 0.1055 152.3)"
  conf-good: "oklch(0.4840 0.0900 95.9)"
  conf-low: "oklch(0.4432 0.0191 73.4)"
  fence-bg: "oklch(0.9391 0.0310 86.5)"
  fence-border: "oklch(0.8348 0.0557 86.1)"
  fence-ink: "oklch(0.2657 0.0241 77.5)"
typography:
  display:
    fontFamily: "Neacademia, 'EB Garamond', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  nameplate:
    fontFamily: "Neacademia, 'EB Garamond', Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
  serif-body:
    fontFamily: "Skolar, Spectral, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  serif-italic:
    fontFamily: "Skolar, Spectral, Georgia, serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    fontStyle: "italic"
    lineHeight: 1.6
  ui:
    fontFamily: "'Skolar Sans', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Skolar Sans', 'IBM Plex Sans', ui-sans-serif, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    letterSpacing: "0.15em"
  value:
    fontFamily: "'Adapter Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "clamp(1.3rem, 2.2vw, 1.9rem)"
    fontWeight: 500
    fontFeature: "tabular-nums"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
  "3xl": "56px"
components:
  nav:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    height: "52px"
  cta-link:
    textColor: "{colors.primary-deep}"
  fence:
    backgroundColor: "{colors.fence-bg}"
    textColor: "{colors.fence-ink}"
    rounded: "{rounded.md}"
    padding: "1.1rem 1.25rem"
  confidence-verified:
    textColor: "{colors.conf-verified}"
    rounded: "{rounded.sm}"
    padding: "2px 5px"
  confidence-good:
    textColor: "{colors.conf-good}"
    rounded: "{rounded.sm}"
    padding: "2px 5px"
  confidence-low:
    textColor: "{colors.conf-low}"
    rounded: "{rounded.sm}"
    padding: "2px 5px"
  leader-strip-cell:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary-soft}"
---

# Design System: My Second Country

## 1. Overview

**Creative North Star: "The Sunlit Almanac"**

My Second Country reads like a serious almanac about where to live, printed on warm paper and lit by Mediterranean sun. It is not a brochure and not a SaaS dashboard. It is a dated, sourced record: a distrustful reader should trust it on sight because every figure carries its source, its date, and an honest confidence mark. Place comes first (the photograph of Athens, Lisbon, Seville), then the cited number, then the structural calm of a deep teal-navy chrome that frames the data without competing with it.

The personality is warm, exact, and understated. Generous editorial whitespace, a serif voice for headlines and reading (a display serif for the masthead, a text serif for prose), monospaced figures that feel measured and accountable, and three per-country accents that let cost, tax, and safety read at a glance without a single "winner" being declared. Flair is earned in a few places: the three-photo masthead, a scannable teal "who leads" leader strip, and small-multiple dot scales that show trade-offs honestly. Nothing decorative survives that does not help a real relocation decision.

This system explicitly rejects the look of the sites it competes with: noisy, undated, affiliate-farm comparison pages (NomadList and expat-blog affiliate farms); authority or expertise cosplay (credential badges, official-sounding seals); slimy selling, false urgency, and hype. It also rejects the earlier green "credible record" direction (retired) and the generic tasteful-AI-data-site reflex of timid accents, flat gray, and a centered table with no point of view.

**Key Characteristics:**
- Place-led credibility: a photograph and a sourced figure, never a sales pitch.
- One warm paper, one structural teal-navy, three calm per-country accents.
- Four font roles: a display serif for the masthead, a text serif for reading, a quiet sans for interface, a mono for every figure.
- Flat by default; depth from hairlines and tinted surfaces, never drop shadows.
- The fence, the date, and the confidence mark are first-class, never fine print.

## 2. Colors

A warm cream paper carrying a single deep teal-navy for structure, three per-country accents tuned to stay legible on both paper and teal, and a calm confidence vocabulary that never relies on colour alone.

### Primary
- **Deep Teal-Navy** (`oklch(0.3389 0.0625 231.2)`, #0A3D52): the structural signature. Sticky nav, the "who leads" leader strip, the footer, links (via its darker partner), source numbers, focus rings. It frames the record; it is never a decorative fill on paper. Its darker partner **Teal-Navy Deep** (`oklch(0.2834 0.0508 230.4)`, #072E3E) carries links and hover/active.

### Secondary (per-country accents)
Each country has two tuned variants so colour never costs contrast. The **on-light** variant is for text and fills on paper or card; the **on-teal** variant is a lifted tint used only on the teal leader strip and nav pills.
- **Greece Blue** (on-light `oklch(0.4846 0.1159 246.4)` #15639C; on-teal `oklch(0.7236 0.1138 244.4)` #63ADE8).
- **Portugal Crimson** (on-light `oklch(0.4578 0.1549 18.0)` #9B2335; on-teal `oklch(0.7491 0.1061 11.0)` #E8919D).
- **Spain Amber** (on-light `oklch(0.5274 0.1165 57.5)` #9C5717; on-teal `oklch(0.7767 0.1130 65.2)` #E8A765). Deepened from a brighter amber so it clears 4.5:1 on warm paper.

### Tertiary (confidence and notice)
A functional vocabulary, never used decoratively.
- **Verified Green** (`oklch(0.4693 0.1055 152.3)`, #1F6B3C): the high-confidence badge, paired with a check glyph and the word "Verified".
- **Good Olive** (`oklch(0.4840 0.0900 95.9)`, #6E5E16): the medium-confidence badge, with a tilde and the word "Good".
- **Limited Neutral** (`oklch(0.4432 0.0191 73.4)`, #5A5248): the low-confidence badge, with a ring glyph and the word "Limited". Calm and neutral, never red. Low means uncertain, not bad.
- **Notice Sand** (bg `oklch(0.9391 0.0310 86.5)` #F4EAD4, border `oklch(0.8348 0.0557 86.1)` #D9C7A0, ink `oklch(0.2657 0.0241 77.5)` #2C2418): the liability fence. A calm, fully-bordered notice, present and honest, never alarmed and never red.

### Neutral
- **Warm Paper** (`oklch(0.9360 0.0149 80.7)`, #EFE9DF): the page. A warm cream, never pure white.
- **Card** (`oklch(0.9708 0.0086 84.6)`, #F8F5EF): the small-multiples and sources surfaces, eligibility and claim cards.
- **Ink** (`oklch(0.1850 0.0064 56.0)`, #151210): body and headings. Near-black, warm, never pure black.
- **Muted Foreground** (`oklch(0.5051 0.0200 84.6)`, #6A6458): labels, metadata, descriptions. Deepened from the reference #7A7062 to clear 4.5:1 on paper.
- **Muted Strong** (`oklch(0.4432 0.0191 73.4)`, #5A5248): reading prose (ledes, notes) that needs more presence.
- **On-Primary** (`oklch(0.9554 0.0045 214.3)`, #EDF1F2) and **On-Primary Soft** (`oklch(0.7969 0.0212 224.4)`, #AFC0C7): the only "white" allowed on teal, both tinted off pure white.
- **Rule** (`oklch(0.1850 0.0064 56 / 0.10)`): hairlines and dividers, 1px only.

### Named Rules
**The Two-Variant Rule.** Every per-country accent ships as an on-light and an on-teal variant. On paper or card use on-light; on the teal strip or nav use on-teal. Never put an on-light accent on teal, or vice versa: the contrast collapses.

**The Never-Pure Rule.** No `#000` and no `#fff`. Every neutral is tinted, including the near-whites on teal. Pure black and pure white do not exist in this system.

**The Colour-Plus-Mark Rule.** Confidence and leadership are never conveyed by colour alone. The confidence badge always carries a glyph and a word; the leader is always named in text, never only tinted or arrowed.

## 3. Typography

Four font roles, set as CSS variables so the faces can be swapped without touching components. Each stack lists the licensed Rosetta target first and a free, self-hostable stand-in second; we ship the free faces now and the Rosetta names are an optional drop-in.

- **`--font-display`** (masthead, headlines): `Neacademia`, fallback `EB Garamond`, then Georgia. A high-contrast serif at regular weight, often italic for the "vs" in a comparison title. Editorial, almost printed, never antique.
- **`--font-serif`** (reading): `Skolar`, fallback `Spectral`. Body prose, standfirsts, ledes, dimension notes, the reflective editorial voice.
- **`--font-ui`** (interface): `Skolar Sans`, fallback `IBM Plex Sans`. Labels, eyebrows, descriptions, navigation. Quiet and plain.
- **`--font-mono`** (figures): `Adapter Mono`, fallback `IBM Plex Mono`. Every figure, unit, rate, date, and the masthead dateline, with tabular figures so columns align.

**Do not buy fonts.** The free stand-ins are the shipping faces; the Rosetta names stay first in the stacks only as a future licensed drop-in.

### Hierarchy
- **Masthead** (`--font-display`, `clamp(2.5rem, 5.5vw, 4.6rem)`, the word "vs" set italic): the one `<h1>` per page. Topic and place mastheads step down to `clamp(2.1rem, 5vw, 3.2rem)`.
- **Headline** (`--font-display`, ~1.5rem for `<h2>`, ~1.2rem for `<h3>`): section headings.
- **Standfirst** (`--font-serif` italic, ~1rem): the masthead subtitle and ledes. The reflective editorial voice.
- **Body** (`--font-serif`, 1.0625rem, line-height ~1.6): reading prose, FAQ answers, capped near 68ch (`--measure`).
- **Note / description** (`--font-serif` italic, ~0.8 to 0.9rem): dimension descriptions and small-multiple notes.
- **Label** (`--font-ui` 600, ~0.625rem, letter-spacing 0.15em, uppercase): eyebrows, dimension names, leader-strip labels. Reserved for short labels, never long passages.
- **Value** (`--font-mono` 500 to 600, tabular-nums): every figure, coloured by country in the comparison grid. The masthead dateline is mono at 0.75rem (a first-class trust signal, not fine print).

### Named Rules
**The Mono-Figure Rule.** Every number, unit, rate, score, and date is set in `--font-mono` with tabular figures. A figure in a serif or sans face is a bug.

**The Light-Serif Rule.** The display serif is used at regular weight, never bold. Emphasis comes from italic and size, not weight. Headlines that turn bold read as marketing, not as a record.

**The Sentence-Case Rule.** Forward-facing copy is sentence case. Uppercase is reserved for short `--font-ui` labels (eyebrows, dimension names); a long passage in uppercase (a breadcrumb's current page, a paragraph) is a bug.

## 4. Elevation

The system is flat. There are no drop shadows on content. Depth is built from three moves only: warm 1px hairlines (`rule`), tonal surface shifts (paper to card to the teal strip), and a single sticky, blurred translucent column-header band. The only blur in the system is the `backdrop-filter: blur(8px)` on the sticky comparison header so figures stay legible as rows scroll under it. No card lifts, no glow, no glassmorphism.

### Named Rules
**The Flat-Record Rule.** Surfaces are flat at rest and flat on hover. A printed almanac does not cast shadows. If an element needs separation, use a hairline or a tonal surface, never a shadow.

## 5. Components

### Buttons and links
- **Shape:** links are inline, underlined on the source list; the primary affordance is the teal nav and text links, not pill buttons.
- **Links:** Teal-Navy Deep (`primary-deep`, #072E3E) on paper, hover to ink. Source links sit on card and hover to teal.
- **Tabs (scenario filter):** uppercase `--font-ui` 600 labels, 0.11em tracking, a 2px bottom border that goes teal on the active tab; `focus-visible` shows a 2px teal outline. Tabs filter the metric rows and the small multiples; they never reload.

### Chips
- **Confidence badge:** a bordered chip with a transparent background, a glyph plus a word ("✓ Verified", "~ Good", "○ Limited"), in the matching confidence colour. Border is the same colour at 0.38 alpha. Low-confidence figures additionally print "Reported, not verified against a primary source." beneath the value.
- **Nav country pills:** flag plus country name in the on-teal accent, hidden on small screens and faded in once the hero scrolls past.

### Cards / Containers
- **Corner style:** 8px (`rounded.md`) on the fence, claim cards, and the direct-answer box; 4px (`rounded.sm`) on badges and the wordmark icon.
- **Background:** card (#F8F5EF) for the small-multiples and sources sections and for eligibility/claim cards; warm paper for the page.
- **Border:** a single hairline (`rule`); the dealbreaker claim card adds a 2px top accent in `--conf-low`.
- **Shadow strategy:** none (see Elevation).

### Navigation
- Sticky, full-bleed, deep teal-navy, 52px tall. Left: a circle-target wordmark icon (1px on-primary stroke) plus "My Second Country" in on-primary. Right: text links (Compare, Screener) in on-primary-soft, hover to on-primary. Center slot holds page-specific country pills.

### The Comparison Cell (signature)
The repeating unit of the record. Top to bottom: a big `--font-mono` value in the country's on-light accent (tabular-nums), its unit, a leader arrow when that country leads the row; a short subtext; a confidence badge (glyph plus word, carrying `data-confidence`) plus a bracketed source reference `[n]` that deep-links to `#sources-{n}`; and a 2px progress bar tinted to the country (full opacity for the leader, 0.42 otherwise) that animates from zero on scroll. Hovering one country's column dims the other two to 0.28 so a single country reads cleanly.

### The Leader Strip (signature)
A six-cell band on deep teal-navy summarising who leads each measure. Each cell: an uppercase on-primary-soft label, a `--font-mono` figure in the leading country's on-teal accent, and the country named in on-primary-soft. Factual, never a recommendation. Lives in `AtAGlance` with the small multiples.

## 6. Component vocabulary

The page generator builds every page from a small, fixed set of components under
`packages/web/src/components/`. Collapse onto these; do not add a new component without a real
page that needs it. The styleguide at `/styleguide` (noindex) renders every one in every state.

- **`CitedValue`** (the atom). One cited fact: the figure in `--font-mono` (or a prose claim in
  `--font-serif` when `prose`), the confidence mark (glyph + word, `--conf-*` tokens), the source
  link, the verified date, an optional granularity note and excerpt. Its machine twin is a
  `PropertyValue` (`citedPropertyValue` in `lib/jsonld.ts`); the page collects those into its
  `Dataset.variableMeasured`. Every confidence badge carries `data-confidence`.
- **`FenceBlock`**. The liability fence and tax/residency rider, above the first claim. Self-shows
  a staleness banner when a figure ages past its window.
- **`Masthead`** (`variant`: topic | compare | place | qa | tracker | tool). The dateline (mono,
  "Cited [month year] · N primary sources · screening, not advice"), the single `<h1>`, an optional
  standfirst, and an optional media band (the duotone photo strip on the compare variant).
- **`SectionHeading`** (`<h2>`/`<h3>`): a display heading or a small uppercase `--font-ui` eyebrow.
- **`Breadcrumb`**: real `<a>` links (sentence case, plain spans where no page exists yet); emits
  `BreadcrumbList`.
- **`SourcesList`**: numbered, deduplicated sources with `#sources-{n}` anchors for `[n]` deep links.
- **`RelatedLinks`**: a flat list of up to six internal links. Navigation, not cited data.
- **`CiteThis`**: the mono cite-this block, one line per fact (source, verified date, fragment URL).
- **`FactsTable`**: a semantic `<table>` (caption + `<th scope>`) of `CitedValue` rows. The owned-rule
  and place facts.
- **`ClaimCard`** (`variant`: eligibility | dealbreaker): framing prose plus one cited fact.
- **`DirectAnswer`** + **`FaqItem`**: the answer-engine surface. `DirectAnswer` is the answer-first
  box; `FaqItem` is a Q&A pair whose visible `<h3>` must match its `FAQPage` `Question.name`.
- **`AtAGlance`**: the small-multiple dot scales plus the teal leader strip.
- **`ComparisonCell`**: the signature comparison-grid cell (a per-country figure, leader arrow,
  confidence badge, `[n]` source ref, and an animated progress bar). Distinct from `FactsTable`.

**Just-in-time** (build with the first page that needs them, not before): `ChangeLog` (tracker),
`StepList`/`ToolStep` (tool), `DeadlineTable` + `Event` JSON-LD (tracker).

## 7. The cited-data and structured-data discipline

This is the moat: the part answer engines read. It is enforced by CI guards (`pnpm verify:build`,
`pnpm verify:data`), not by review alone.

- Every `CitedValue` is one human render and one machine `PropertyValue` in the same place. No
  deferred, footnote-only attribution.
- **Every page emits, computed at build time:** an `Article` whose `dateModified` is the newest
  `verifiedDate` on the page (the freshness signal), a `BreadcrumbList`, and its primary type:

  | Archetype | Primary JSON-LD (plus Article + BreadcrumbList on all) |
  |---|---|
  | owned-rule / topic | `Dataset` + `DefinedTerm` (named instruments) + `FAQPage` if two or more FaqItems |
  | comparison | `Dataset` + `FAQPage` (from the scenario summaries) |
  | place | `Place` + `Dataset` + `FAQPage` |
  | Q&A | `QAPage` (+ `FAQPage`) |
  | dealbreaker | `Dataset` + `DefinedTerm` |
  | tracker | `Dataset` + `Event` per deadline |
  | tool | `HowTo` |

- **Answer-engine rules.** The `<h1>` is the query a reader would type. The first sentence under each
  heading is the cited answer (country, number, unit, source, date, no preamble). The fence sits above
  the first claim and above the fold at 375px. A page needs at least four distinct cited fields or it
  does not publish (anti-thin).
- Every figure is a real `CitedValue` with source, date, and confidence. Never fabricate a figure to
  fill a layout.

## 8. Do's and Don'ts

### Do:
- **Do** carry every cost, tax, visa, climate, healthcare, and safety figure in a `CitedValue` and render its source, verified date, and confidence mark. The citation is the product.
- **Do** show uncertainty honestly: render low-confidence figures with the "○ Limited" badge and the "Reported, not verified against a primary source." qualifier, never hidden.
- **Do** use the on-light accent on paper or card and the on-teal accent on the teal strip or nav. Both clear 4.5:1.
- **Do** set every figure, unit, rate, and date in `--font-mono` with tabular figures.
- **Do** keep the build green: `pnpm verify:build` and `pnpm verify:data` enforce one h1, the fence before the first claim, glyph-plus-word confidence, semantic tables, no em dashes, no individualised copy, an honest `dateModified`, and FAQ questions that match a visible `<h3>`.
- **Do** keep the liability fence above the first claim, at body-text size, with the verbatim FENCE_PRIMARY string and the tax/residency rider.
- **Do** name the leader of a row in plain text ("Portugal has the lowest price level of the three").

### Don't:
- **Don't** use individualised recommendation language: no "you should", "best for you", "in your case", "we recommend", or "your best option". State the general rule, cite the source, route to a licensed professional. We do not pick a winner.
- **Don't** use a `border-left` or `border-right` greater than 1px as a colored stripe (the old fence used a 4px stripe; it is forbidden). Use a full 1px border or a tinted surface.
- **Don't** use `#000` or `#fff`, including white text on the teal strip. Tint to on-primary / on-primary-soft.
- **Don't** convey confidence or leadership by colour alone. Always pair colour with a glyph and a word.
- **Don't** use em dashes or `--` in any copy. Use commas, colons, periods, or parentheses. Use sentence case; strip AI-register words (leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust).
- **Don't** add drop shadows, glassmorphism, hero-metric gradient templates, or identical icon-card grids. This is a flat record, not a SaaS landing page.
- **Don't** reintroduce credential badges, official-sounding seals, false urgency, or undated affiliate-farm styling. The whole system is the visible opposite of those.
