# Compare page production spec v2 (Rosetta de-slop rebuild → >95 impeccable)

Rebuild `packages/web/src/pages/compare/greece-portugal-spain.astro` (and supporting
components/layout) to match the **revised Figma Make design** (the de-slopped publication-of-record
version), then apply the production fixes that take it from ~78 to >95 on the impeccable rubric.

The design reference is the Figma comp at file key `FrdsNBLtIpn5iU8qfqdiKe` (App.tsx). This spec
captures its structure and the production deltas. The **real cited data wiring already exists** in
the current page and the `@where/data` package; reuse it, do not invent figures.

This is execution of an approved design. Do not redesign. Match the comp's structure and apply the
fixes below. Keep the build green and every guard passing.

---

## 0. Fonts (Rosetta, swap-ready, self-hosted)

Four families, written Rosetta-first with free stand-ins as fallback so it renders now and the
licensed `woff2` is a no-op swap later.

In `Base.astro`, define:
```css
--font-display: "Neacademia", "EB Garamond", Georgia, "Times New Roman", serif; /* masthead, headlines, nameplate */
--font-serif:   "Skolar", "Spectral", Georgia, serif;                            /* reading / body */
--font-ui:      "Skolar Sans", "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; /* nav, tabs, labels */
--font-mono:    "Adapter Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; /* figures */
```
Load the stand-ins via Google Fonts now (EB Garamond, Spectral, IBM Plex Sans, IBM Plex Mono) with
`<link rel="preconnect">` + `<link rel="stylesheet">` (not `@import`). Add an `@font-face` block,
commented or active, pointing at `/fonts/Neacademia-*.woff2`, `/fonts/Skolar-*.woff2`,
`/fonts/SkolarSans-*.woff2`, `/fonts/AdapterMono-*.woff2`, so dropping files into
`packages/web/public/fonts/` activates the real faces. When real woff2 are present, prefer them and
drop the Google `<link>`.

Keep the existing OKLCH token palette in `Base.astro` (it already matches the comp's hex). Do not
reintroduce pure `#fff`/`#000`. The legacy aliases stay so other pages keep working.

---

## 1. The six stages (all required)

1. **Rebuild the page** to the comp structure (sections below).
2. **Nav nameplate** (logo prominence): set the wordmark in `--font-display` (Neacademia) at
   18–20px, regular weight, color `--on-primary` at full opacity. The circle-target mark at full
   opacity, ~17–18px. This reads as a publication masthead, not a tiny label. Keep it restrained;
   no extra rule or monogram unless asked.
3. **Path to >95** (apply every item in section 3).
4. **Fonts**: section 0.
5. **Real cited data**: section 2.
6. **Verify to the number**: build, guards, axe, computed contrast, detector, preview.

---

## 2. Real data (from `@where/data`, not the comp's placeholders)

Reuse the existing page's data wiring (`placeById("gr"|"pt"|"es")` and the 6-dimension mapping).
The 6 dimensions, leaders, units, confidence, and source provenance are the same as the current
production page. Use each field's real `sourceUrl`, `sourceName`, `verifiedDate`, `confidence`.
Do NOT use the comp's invented "Household consumption, 2022", simplified PwC homepage URLs, or
HNMS/IPMA/AEMET climate URLs; use our real `CitedValue` provenance (Eurostat, PwC specific pages,
ministry visa pages, Wikipedia city climate, WHO via Wikipedia, GPI 2024 PDF). Dedupe sources by
URL, number them, and link each cell's `[n]` to `#sources`. Expect ~12 distinct sources.

The small-multiple dot positions AND the in-cell bars must both be **derived from the real values**
(min/max normalize across the three, oriented by direction), not hand-set. One normalization, used
for both, so the chart and the bar agree.

---

## 3. Path to >95 (the production fixes Make can't do)

**Accessibility (the biggest lever):**
- **Semantic comparison table.** Render the comparison as a real `<table>`: `<caption class="sr-only">`,
  a `<thead>` with `<th scope="col">` for Dimension + the three countries, and each measure as a
  `<tr>` with `<th scope="row">` for the dimension and `<td>` per country. Style it to match the
  comp's look (cell padding, hairline borders, the big mono value, leader arrow, confidence, source,
  bar). On mobile, use a responsive-table pattern: each `<tr>` becomes a stacked block with the
  country tag (GR/PT/ES) labeling each `<td>` (via a visually-hidden-aware `data-label` or an inline
  label span). Do not ship the comparison as role-less `<div>`s.
- **`<main>` landmark** wrapping the page content (between nav/header and footer). Exactly one
  `<main>`, one `<nav>` (Base), one `<footer>` (Base), one `<h1>` (masthead).
- **Real headings:** the section labels "Sources" and "What the data shows" become `<h2>`; the
  sticky "Dimension"/country header is the table `<thead>`. Visually identical, semantically real.
- **Visible focus** on every interactive element: tabs, nav links, the "show all" button, source
  links. Use a clear `:focus-visible` outline (2px `--primary`, offset 2px). Never `outline: none`
  without a replacement.
- **Tabs**: server-render all rows; client JS toggles row/verdict visibility by `data-scenarios`
  and sets `aria-selected` + roving focus. If using a tablist, connect it to the table via
  `aria-controls`, or use a plain button group with `aria-pressed`. Keyboard operable, visible focus.
- **Confidence detail keyboard-reachable:** the glyph+word (✓ verified / ~ good / ○ limited) is the
  primary signal (not color-only, good). The tooltip detail must be reachable: make the trigger a
  `<button type="button">` or `<abbr title>` (focusable), or render the explanation as visible/`sr-only`
  text. Not a hover-only non-focusable `<span>`.
- Nav `Compare`/`Screener` links point to real routes (`/compare/greece-portugal-spain`, `/screener`),
  not `href="#"`.

**Performance:**
- Self-host fonts (section 0); drop the render-blocking `@import`.
- Add `@media (prefers-reduced-motion: reduce)` killing the fade/row-in animations.
- Photo `<img>`: `width`/`height` attributes, `loading="lazy"` (they sit below the masthead text),
  `decoding="async"`. Keep the warm duotone CSS filter. Keep the licensed-image TODO.

**Theming:**
- All colors/fonts via the OKLCH tokens / the four font vars. No hardcoded hex in the page where a
  token exists. No pure white/black anywhere (including the footer).

**Responsive:**
- Leader band: collapse to 3-across on mobile (`repeat(3,1fr)` under `sm`), 6-across on `sm+`.
- Touch targets >= 44px for tabs, nav links, source refs, the reset button (pad the hit area even if
  the visible text is small).
- Type in `rem` (not fixed px) so it scales with user settings; keep the clamp display sizes.

**Anti-patterns / copy:**
- **No em dashes.** The comp's sources use "— verified 24 Jun 2026"; render it without the dash
  ("verified 24 Jun 2026" or "Verified 24 Jun 2026" on its own line). Sweep the whole page for
  `—`, `–`, `--` in copy; zero allowed.
- Drop the tooltip drop shadow (flat-record rule); use a 1px border + tinted surface if needed.
- Confidence low stays neutral (not red). Leader named in text + arrow (not color-only).

---

## 4. Page structure (match the comp)

In order, inside `<main>`:
1. **Masthead `<header>`**: mono dateline ("Cited June 2026 · 12 primary sources · screening, not
   advice"); `<h1>` in `--font-display` clamp(2.5rem, 5.5vw, 4.6rem), the two "vs" in italic;
   italic standfirst in `--font-serif` ("Six measures, every figure sourced, dated, and confidence
   rated. We do not pick a winner for you."); the **duotone photo band** (3 photos, warm sepia
   filter, country name in `--font-display` in the country accent + place note). One h1 only.
2. **Fence**: `<FenceBlock hasLegalClaims={true} />` (existing component, already fixed), above the
   tabs and first claim.
3. **Tabs**: All metrics / Lower my taxes / Work remotely / Retire abroad. Filter rows, small
   multiples, and the "what the data shows" note. Visible focus.
4. **"What the data shows"** (`<h2>` + factual italic note) when a scenario tab is active.
5. **Small multiples**: the six dot-scales (1/2/3 col responsive), data-derived positions, leader by
   filled dot + full name, others outline dot + tag, "lower/higher is better" caption, and the
   relative-scores note.
6. **Leader band** (teal): six cells, mono leader value in the lifted on-teal accent, label + name +
   tag in `--on-primary-soft`. Mobile 3-across.
7. **Comparison `<table>`** (section 3): sticky `<thead>`, six measure rows, the cell content as in
   the comp (mono value in accent, unit, leader arrow, italic subtext, confidence + source, derived
   bar). Column-hover dim is fine (decorative). "Show all measures" reset when filtered.
8. **Methodology** line (italic muted, no stripe).
9. **Sources** (`<h2>`, card bg): numbered list, real provenance, "verified 24 Jun 2026" (no dash).
10. Base provides the teal **footer**: fix the © line contrast (use full-opacity `--on-primary-soft`,
    not 0.65).

---

## 5. Verify (report output, do not claim without it)
From `packages/web`: `npm run build` (exit 0), `npm run test` (fence + all). From root:
`npm run verify:build` (assert-fence, validate-jsonld, assert-robots, check-a11y all pass), and
`npx biome check <changed files>` (0 errors). Then the controller (me) runs axe + computed contrast
+ the impeccable detector + a live preview and scores against the rubric. Target: technical 19–20/20,
heuristics 37+/40, composite >95.
