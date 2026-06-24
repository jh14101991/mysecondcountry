---
name: My Second Country
description: A cited relocation intelligence engine, designed as a credible primary source.
colors:
  paper: "oklch(0.985 0.004 130)"
  paper-2: "oklch(0.966 0.006 130)"
  ink: "oklch(0.23 0.010 250)"
  ink-soft: "oklch(0.45 0.012 250)"
  rule: "oklch(0.88 0.006 250)"
  brand: "oklch(0.43 0.090 160)"
  brand-deep: "oklch(0.37 0.085 160)"
  brand-soft: "oklch(0.95 0.030 160)"
  conf-verified-fg: "oklch(0.40 0.050 210)"
  conf-verified-bg: "oklch(0.94 0.012 210)"
  conf-good-fg: "oklch(0.45 0.080 75)"
  conf-good-bg: "oklch(0.94 0.035 75)"
  conf-low-fg: "oklch(0.45 0.020 250)"
  conf-low-bg: "oklch(0.93 0.005 250)"
  fence-bg: "oklch(0.965 0.018 80)"
  fence-border: "oklch(0.84 0.035 80)"
typography:
  display:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.08em"
  value:
    fontFamily: "Spline Sans Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "1.375rem"
    fontWeight: 500
    fontFeature: "tabular-nums"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
  "3xl": "48px"
  "4xl": "64px"
components:
  cta-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  cta-primary-hover:
    backgroundColor: "{colors.brand-deep}"
    textColor: "{colors.paper}"
  leader-tag:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-deep}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  confidence-verified:
    backgroundColor: "{colors.conf-verified-bg}"
    textColor: "{colors.conf-verified-fg}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: My Second Country

## 1. Overview

**Creative North Star: "The Credible Record"**

My Second Country is not a brochure and not a SaaS dashboard. It is a record: a clean, exact, primary-source document about where to live, built so a distrustful reader trusts it on sight. The system reads like a serious data publication that happens to be beautiful, not a startup that happens to show data. Every visible choice serves one job: make the cited figure, its date, and its confidence the most credible thing on the page.

The personality is quiet and confident. Generous whitespace, a strong typographic spine, monospaced figures that feel measured and accountable, and a single committed green that gives the brand a point of view without ever shouting. Flair is allowed, but only as a few deliberate moments: a confident hero, a scannable "who leads" band, and a slim comparison bar that lets the data read at a glance. Nothing decorative survives that does not help the reader weigh a real decision.

This system explicitly rejects the look of the sites it competes with: noisy, undated, affiliate-farm comparison pages (NomadList and expat-blog affiliate farms); authority or expertise cosplay (credential badges, official-sounding seals); slimy selling, false urgency, and hype. It also rejects the generic "tasteful AI data site" reflex: timid accents, flat hierarchy, evenly-distributed gray, and a centered table with no point of view.

**Key Characteristics:**
- Primary-source credibility before personality. The citation is the product.
- One committed green identity on a cool, near-neutral paper.
- Schibsted Grotesk for voice, Spline Sans Mono for every figure.
- Flat by default; depth from hairlines and tinted surfaces, not shadows.
- A few earned moments, never decoration for its own sake.

## 2. Colors

A cool, near-neutral paper carrying one committed green, with three calm confidence tints that never rely on color alone.

### Primary
- **Record Green** (oklch(0.43 0.090 160)): the single committed signature. Links, the leader comparison-bar fill, the hero accent (the word "vs"), section markers, focus rings, the primary call to action. Used with confidence across the surface, not as a timid sub-10% accent. Its darker partner **Record Green Deep** (oklch(0.37 0.085 160)) is for hover and active.
- **Green Wash** (oklch(0.95 0.030 160)): the soft tint behind the "who leads" band and the highlighted leader cell. Quiet, never a fill that competes with the data.

### Neutral
- **Paper** (oklch(0.985 0.004 130)): the page. A cool off-white, never cream, never pure white.
- **Panel** (oklch(0.966 0.006 130)): bands, the footer, subtle grouping surfaces.
- **Ink** (oklch(0.23 0.010 250)): body text and headings. Near-black, faintly cool, never pure black.
- **Ink Soft** (oklch(0.45 0.012 250)): secondary text, labels, metadata, dimension sublabels.
- **Rule** (oklch(0.88 0.006 250)): hairlines, table rules, borders. 1px only.

### Tertiary (confidence and notice tints)
- **Verified Slate** (fg oklch(0.40 0.050 210) on bg oklch(0.94 0.012 210)): the high-confidence badge. Deliberately slate-blue so it never reads as the brand green leader color.
- **Good Amber** (fg oklch(0.45 0.080 75) on bg oklch(0.94 0.035 75)): the medium-confidence badge.
- **Low Neutral** (fg oklch(0.45 0.020 250) on bg oklch(0.93 0.005 250)): the low-confidence badge. Calm and neutral, never red. Low confidence means uncertain, not bad.
- **Notice Sand** (bg oklch(0.965 0.018 80), border oklch(0.84 0.035 80)): the liability fence. A calm full-bordered notice, present and honest, never alarmed and never red.

### Named Rules
**The One Green Rule.** There is exactly one identity color, Record Green. Do not introduce a second brand hue. Confidence tints (slate, amber, neutral) are a separate, functional vocabulary and are never used decoratively.

**The Never-Pure Rule.** No `#000` and no `#fff`. Every neutral is tinted. Pure black and pure white do not exist in this system.

**The Color-Plus-Mark Rule.** Confidence and leadership are never conveyed by color alone. The confidence badge always carries a glyph and a word; the leader is always named in text, not just tinted.

## 3. Typography

**Display Font:** Schibsted Grotesk (with ui-sans-serif, system-ui, -apple-system, sans-serif)
**Body Font:** Schibsted Grotesk (same family; hierarchy comes from weight and scale)
**Figure/Mono Font:** Spline Sans Mono (with ui-monospace, SFMono-Regular, Menlo, monospace)

**Character:** Schibsted Grotesk is a contemporary grotesque with quiet character: professional and serious, with just enough personality to avoid the system-font default. Spline Sans Mono carries every number, unit, and date so the data reads as measured and accountable. The pairing says "serious record," not "startup."

### Hierarchy
- **Display** (800, clamp(2.75rem, 6vw, 4rem), 1.05, -0.02em): the page hero only. One per page.
- **Headline** (700, clamp(1.5rem, 3vw, 2rem), 1.15): section headings (the screener invitation, Sources).
- **Title** (600, 1.25rem, 1.25): sub-section and band labels.
- **Body** (400, 1rem, 1.6): prose, the lede, how-to-read, register entries. Cap measure at 65 to 72ch.
- **Label** (600, 0.8rem, 0.08em tracking, uppercase): short labels only (breadcrumb, column heads, band labels, confidence words). Never a run longer than a few words.
- **Value** (Spline Sans Mono, 500, ~1.375rem, tabular-nums): every numeric figure and unit.
- **Meta** (Spline Sans Mono, ~0.8125rem): verified dates and record metadata.

### Named Rules
**The Mono-Figure Rule.** Every number the reader might compare, every figure, unit, and date, is set in Spline Sans Mono with `font-variant-numeric: tabular-nums`. Prose is never mono; figures are never proportional.

**The Short-Caps Rule.** Uppercase with tracking is reserved for short labels (a few words). Never set a sentence or a paragraph in all caps.

## 4. Elevation

Flat by default. Depth comes from tinted surfaces (Paper, Panel, Green Wash) and 1px hairline rules, not from shadows. This keeps the page reading like a printed record rather than a stack of floating cards. A single, very soft shadow is permitted only as a state response: the sticky header may gain a faint shadow once the page is scrolled, to separate it from content. No ambient drop shadows on cards, panels, or the table.

### Named Rules
**The Flat Record Rule.** Surfaces are flat at rest. The only shadow in the system is a faint scroll-state shadow under the sticky header. If a surface needs separation, use a hairline rule or a tint, not a shadow.

**The No-Side-Stripe Rule.** Never use a `border-left` or `border-right` thicker than 1px as a colored accent on a card, callout, alert, or the fence. The v1 fence broke this; the production fence uses a full 1px border plus a calm tint. This is a hard prohibition, not a preference.

## 5. Components

### Navigation
- Sticky top bar on Paper with a 1px Rule bottom border. Wordmark "My Second Country" in Schibsted Grotesk 700, Ink. Links in Ink Soft, hover to Record Green. A faint scroll-state shadow is allowed once scrolled.

### Breadcrumb
- Replaces any tracked-caps eyebrow above the hero. Small Schibsted Grotesk, Ink Soft, e.g. "Compare / Greece, Portugal, Spain", with the leading segment a link in Record Green. Never a pill chip.

### Cited value cell (signature component)
- The core unit of the product. Contains, in order: the value in Spline Sans Mono with a small Record-Green superscript citation marker linking to the Sources register; an optional neutral leader tag; a confidence badge (glyph plus word); the inline source name as a one-click outbound link (Record Green, `rel="noopener nofollow"`, new tab); the "Verified YYYY-MM-DD" date in mono Ink Soft. Prose cells (special regime, golden visa, climate class) replace the big figure with a short Schibsted Grotesk sentence and keep the citation and confidence.
- **Comparison bar:** numeric cells carry a slim (3px) rounded hairline track below the value. The fill marks the value's position on that row's min-to-max scale. The leader's fill is Record Green; the others are Ink Soft at reduced opacity. The bar is `aria-hidden`; the value, leader tag, and confidence carry meaning for assistive tech.

### Confidence badge
- Pill (rounded pill), small Short-Caps label with a leading glyph: filled circle for Verified (Slate), half circle for Good (Amber), open circle for Low (Neutral). Always glyph plus word.

### Leader tag
- Small Short-Caps tag, Green Wash background, Record Green Deep text, rounded-sm. A neutral factual marker only (lowest, warmest, sunniest, safest, most). Never "best", never a recommendation.

### Liability fence
- Full 1px Notice border on a calm Notice Sand tint, rounded-sm, Ink text at body size. Always above the first claim, never collapsed, never footnote-sized, never a side stripe. Two paragraphs: primary plus the tax/residency rider, both verbatim and guarded by tests.

### "Who leads" band
- A Green Wash band below the hero with a Short-Caps title and inline label/country pairs, the country in Record Green. A designed at-a-glance moment that stays neutral; the "we do not pick a winner" line in the how-to-read text keeps it honest.

### Sources register
- A numbered list (plain integers) at the foot. Each entry: the full source name as an outbound link, the verified date, and the exact excerpt the figures support. Numbers are references, not section markers. This is the citation apparatus made visible.

### Primary call to action (screener)
- Record Green background, Paper text, rounded-md, calm padding. Hover to Record Green Deep. One per page, never loud, never urgent.

### Buttons / focus
- Focus-visible: a 2px Record Green ring, offset from the element, on every interactive control. Never `outline: none` without a replacement.

## 6. Do's and Don'ts

### Do:
- **Do** make the citation, its date, and its confidence the most credible thing on the page. The citation is the product.
- **Do** use OKLCH for every color, and tint every neutral. No `#000`, no `#fff`.
- **Do** set every figure, unit, and date in Spline Sans Mono with `tabular-nums`.
- **Do** convey confidence and leadership with a glyph and a word, never color alone (WCAG 2.1 AA is the floor, verified by axe-core in CI).
- **Do** keep the fence above the first claim, at body size, full-bordered, calm.
- **Do** commit to Record Green. One identity color, used with confidence.
- **Do** allow a few earned moments (hero, who-leads band, comparison bar) and keep everything else quiet.

### Don't:
- **Don't** use a `border-left` or `border-right` greater than 1px as a colored stripe on the fence, cards, or callouts. Full borders or tints only.
- **Don't** use gradient text, decorative glassmorphism, nested cards, or the big-number hero-metric template.
- **Don't** use em dashes. Use commas, colons, semicolons, periods.
- **Don't** look like NomadList or an expat-blog affiliate farm: no noisy, undated, uncited comparison styling.
- **Don't** imply advice or authority: no credential badges, official-sounding seals, or "best for you" / "we recommend" language. Leader tags stay neutral.
- **Don't** oversell or use AI-register marketing words (leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust).
- **Don't** ship the generic "tasteful AI data site": timid accent, flat hierarchy, evenly-distributed gray, a centered table with no point of view.
- **Don't** convey meaning with color alone, and never use red for low confidence.
