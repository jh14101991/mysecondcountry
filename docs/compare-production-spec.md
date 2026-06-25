# Compare page production spec (locked design → real Astro)

Port the **locked warm-editorial design** in `packages/web/public/mockups/compare-make.html`
into the real Astro site. The mockup's **structure, CSS, and JS are the visual contract**.
This spec defines the deltas: real data, OKLCH tokens, compliance reframe, accessibility.

Target file: `packages/web/src/pages/compare/greece-portugal-spain.astro` (replace existing).
Also edit: `src/layouts/Base.astro`, `src/components/FenceBlock.astro`,
`src/components/ComparisonCell.astro`, `scripts/check-a11y.ts`.

Hard rules (non-negotiable): OKLCH colours only; never `#000`/`#fff` (tint them); no
`border-left/right > 1px` colour stripe; tabular-nums on every figure; confidence by
glyph + word (never colour alone); WCAG 2.1 AA; **no em dashes anywhere** (commas / colons /
periods); sentence case; strip AI-register words. Keep the build green.

---

## 1. Architecture: server-render everything, JS only toggles

The mockup renders metrics, radar, and sources with client JS (`innerHTML`). **That fails our
guards and AI-crawler audience** (the a11y/fence/jsonld guards parse static HTML with scripts
disabled, and AI engines read server HTML). So:

- **All content is server-rendered in Astro**: every metric row (all 6), the leader strip, the
  default radar SVG, all 3 verdict cards, the sources list. Present in the built HTML.
- **Client JS only**: toggles `active` tab state; shows/hides pre-rendered rows + verdict cards
  by scenario; animates the bars (IntersectionObserver, width 0 → score%); re-computes the radar
  polygon for the active scenario; fades in the nav country pills after the hero; column-hover
  dimming. No content creation in JS.
- Metric rows carry `data-scenarios="remote retire"` etc. so JS can filter by membership.
- Embed the radar score data as a single `<script type="application/json" id="radarData">` block
  so JS can recompute without re-deriving.

---

## 2. Tokens — replace `:root` in `Base.astro` (verbatim)

Replace the entire stale terracotta `:root` block with this. Keep the legacy aliases so
`index/screener/places` keep working with the new palette (do not restyle those pages this pass).

```css
:root {
  /* Neutrals — OKLCH, tinted, never pure black/white */
  --paper: oklch(0.9360 0.0149 80.7);            /* #EFE9DF */
  --card: oklch(0.9708 0.0086 84.6);             /* #F8F5EF */
  --panel: oklch(0.9180 0.0140 82);              /* subtle grouping surface */
  --ink: oklch(0.1850 0.0064 56.0);              /* #151210 */
  --muted-foreground: oklch(0.5051 0.0200 84.6); /* #6A6458 — AA 4.86 on paper */
  --muted-strong: oklch(0.4432 0.0191 73.4);     /* #5A5248 — prose, 7.06 on card */
  --rule: oklch(0.1850 0.0064 56 / 0.10);        /* hairline */
  --rule-soft: oklch(0.1850 0.0064 56 / 0.07);

  /* Brand teal-navy */
  --primary: oklch(0.3389 0.0625 231.2);         /* #0A3D52 */
  --primary-deep: oklch(0.2834 0.0508 230.4);    /* #072E3E — hover/active */
  --on-primary: oklch(0.9554 0.0045 214.3);      /* #EDF1F2 — near-white on teal, 10.2:1 */
  --on-primary-soft: oklch(0.7969 0.0212 224.4); /* #AFC0C7 — secondary on teal, 6.2:1 */

  /* Country accents — on light surfaces (text + fills), AA-safe */
  --gr: oklch(0.4846 0.1159 246.4);              /* #15639C — 5.3:1 on paper */
  --pt: oklch(0.4578 0.1549 18.0);               /* #9B2335 — 6.5:1 on paper */
  --es: oklch(0.5274 0.1165 57.5);               /* #9C5717 — 4.6:1 on paper (deepened amber) */
  /* Country accents — on teal (leader strip, nav pills) */
  --gr-on-primary: oklch(0.7236 0.1138 244.4);   /* #63ADE8 — 4.8:1 on teal */
  --pt-on-primary: oklch(0.7491 0.1061 11.0);    /* #E8919D — 5.0:1 on teal */
  --es-on-primary: oklch(0.7767 0.1130 65.2);    /* #E8A765 — 5.6:1 on teal */

  /* Confidence — glyph + word, never colour alone; low is neutral, not red */
  --conf-verified: oklch(0.4693 0.1055 152.3);   /* #1F6B3C */
  --conf-good: oklch(0.4840 0.0900 95.9);        /* #6E5E16 */
  --conf-low: oklch(0.4432 0.0191 73.4);         /* #5A5248 */

  /* Fence — calm sand notice */
  --fence-bg: oklch(0.9391 0.0310 86.5);         /* #F4EAD4 */
  --fence-border: oklch(0.8348 0.0557 86.1);     /* #D9C7A0 */
  --fence-ink: oklch(0.2657 0.0241 77.5);        /* #2C2418 — 12.8:1 on fence-bg */

  /* Type */
  --font-serif: "Fraunces", Georgia, "Times New Roman", serif;
  --font-sans: "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --radius: 0.5rem;
  --radius-sm: 0.25rem;
  --measure: 68ch;

  /* Legacy aliases — keep other pages working with the new palette */
  --paper-2: var(--card);
  --ink-soft: var(--muted-foreground);
  --rule-color: var(--rule);
  --terracotta: var(--primary);
  --terracotta-dark: var(--primary-deep);
  --sea: var(--primary);
  --serif: var(--font-serif);
  --sans: var(--font-sans);
}
```

### Fonts — add to `Base.astro` `<head>` (before the title is fine)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Figtree:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" />
```

### Base body/headings

- `body { font-family: var(--font-sans); background: var(--paper); color: var(--ink); }`
- `h1,h2,h3 { font-family: var(--font-serif); font-weight: 300; }` (Fraunces light is the look).
- Add a global `--font-mono` use helper is not needed; the page styles handle mono.

### Nav + footer restyle (Base.astro) → teal

- **Nav**: sticky top, `background: var(--primary)`, `border-bottom: 1px solid oklch(1 0 0 / 0.06)`.
  Left: wordmark = the circle-target SVG icon (from the mockup, `stroke="var(--on-primary)"`) +
  "My Second Country" in `--on-primary`, 14px 600. Right: nav-links (Compare, Screener) in
  `--on-primary-soft`, hover `--on-primary`. Add a **named slot** `<slot name="nav-extra" />`
  between wordmark and nav-links for page-specific items (compare fills it with country pills).
- **Footer**: `background: var(--primary)`; text `--on-primary-soft`; keep the existing honest copy
  ("run by relocators sharing sourced data, not advisers ..."). Use `--on-primary-soft`, not pure
  white. Fineprint in a slightly dimmer `--on-primary-soft`.
- Add `fullBleed?: boolean` prop. When true, `<main>` drops its `max-width`/padding
  (`main.bleed { max-width: none; margin: 0; padding: 0; }`) so the compare hero spans full width.

---

## 3. Real data mapping (the 6 dimensions)

Source the figures from `@where/data` (`placeById("gr"|"pt"|"es")`). Each dimension reads a real
`CitedValue`; the displayed figure, its source link, verified date, and confidence all come from
that object. **The mockup's placeholder figures are discarded.** Build this `METRICS` array in the
Astro frontmatter (TypeScript). `display` is the figure shown big; `score` is computed (section 4).

| # | Dimension (sentence case) | Field | GR | PT | ES | Dir | Leader | Conf |
|---|---|---|---|---|---|---|---|---|
| 1 | Cost of living | `costOfLiving.priceLevelIndexEU27` | 87.4 | 86.6 | 91.6 | min | **Portugal** | high |
| 2 | Best regime tax rate | `tax.specialRegime` (rate surfaced) | 7% | 20% | 24% | min | **Greece** | medium |
| 3 | Remote-work visa income | `residency.digitalNomadVisa` | €3,500 | €3,680 | €2,763 | min | **Spain** | medium |
| 4 | Sunshine | `climate.averageAnnualSunHours` | 2,773 | 2,875 | 2,744 | max | **Portugal** | low |
| 5 | Physicians per 1,000 | `healthcare.physiciansPer1000` | 6.37 | 5.77 | 4.48 | max | **Greece** | medium |
| 6 | Safety (Global Peace Index) | `safety.peaceIndexScore` | 1.793 | 1.372 | 1.597 | min | **Portugal** | medium |

Leaders are computed from the real values (do not hardcode), but the table above is the expected
result; if your computed leader differs, the computation is wrong.

**Per-dimension display + copy** (sentence case, no em dashes):

1. **Cost of living** — value = index number (`87.4`), unit `EU27=100`.
   description: "Eurostat price level index for actual consumption. 100 is the EU average; lower is cheaper."
   subtext per country: GR "Whole-country index" / PT "Whole-country index" / ES "Whole-country index".
   leaderNote: "Portugal has the lowest price level of the three." scenarios: `remote retire`.

2. **Best regime tax rate** — value = the special-regime headline rate (`7%` / `20%` / `24%`), unit `flat`.
   This rate is the headline figure of the cited special-regime `CitedValue` (whose `value` is the
   full prose). Surface the rate as the figure; cite the regime object.
   description: "Headline rate of the best published expat regime. These are different regimes with different eligibility."
   subtext: GR "Foreign-pension regime, article 5B" / PT "IFICI, the NHR successor" / ES "Beckham regime, first six years".
   leaderNote: "Greece has the lowest headline regime rate." scenarios: `taxes retire`.

3. **Remote-work visa income** — value = monthly income floor (`€3,500`), unit `/mo min`.
   description: "Minimum net monthly income for the digital-nomad / telework residence visa. Lower is more accessible."
   subtext: GR "Net income floor, law 5038/2023" / PT "Four times the minimum wage (D8)" / ES "200% of the minimum wage (telework visa)".
   leaderNote: "Spain has the lowest income floor of the three." scenarios: `remote taxes`.

4. **Sunshine** — value = annual hours (`2,773`), unit `hrs/yr`.
   description: "Mean annual sunshine hours at the capital. A single-source city figure, not a national average."
   subtext: GR "Athens (Elliniko)" / PT "Lisbon" / ES "Madrid".
   leaderNote: "Lisbon records the most sunshine hours of the three capitals." scenarios: `remote retire`.

5. **Physicians per 1,000** — value = number (`6.37`), unit `per 1,000`.
   description: "Licensed medical doctors per 1,000 people (WHO 2021). Counts licensed, not only practising, doctors."
   subtext: GR "WHO 2021" / PT "WHO 2021" / ES "WHO 2021".
   leaderNote: "Greece has the most doctors per person of the three." scenarios: `retire`.

6. **Safety (Global Peace Index)** — value = GPI score (`1.793`), unit `GPI`.
   description: "Global Peace Index 2024 score. Lower is more peaceful."
   subtext: GR "Rank 40 of 163" / PT "Rank 7 of 163" / ES "Rank 23 of 163".
   leaderNote: "Portugal is the most peaceful of the three (rank 7)." scenarios: `remote retire`.

**Confidence mapping** (our `confidence` → badge): `high` → glyph `✓` word "Verified";
`medium` → glyph `~` word "Good"; `low` → glyph `○` word "Limited". For **low**, the cell must
also carry the FENCE.md qualifier text near the figure: "Reported, not verified against a primary
source." (Sunshine is the only low-confidence dimension.)

**Sources list**: derive from the real `CitedValue`s actually used. Dedupe by `sourceUrl`, number
them 1..N in first-appearance order, and each cell's `[n]` ref points to its source's number. Each
source row shows `sourceName` (link to `sourceUrl`, `target=_blank rel="noopener nofollow"`) and the
`verifiedDate` (e.g. "verified 2026-06-24"). Expect ~7 distinct sources (Eurostat is shared across
the three cost cells; GPI shared across the three safety cells; the three PwC tax pages are
distinct; the three visa sources are distinct; climate shares Wikipedia city pages; WHO/Wikipedia
shared for physicians).

---

## 4. Radar normalisation (computed, disclosed)

Six axes in dimension order: Cost, Tax, Visa, Sunshine, Doctors, Safety. Normalise each axis across
the three countries so higher always means better:

```
t = (v - min) / (max - min)            // 0..1 across the three
if direction is "min" (cost, tax, visa, safety): t = 1 - t
score = Math.round(40 + 60 * t)        // worst → 40, best → 100, readable
```

Compute in frontmatter; embed as JSON for the JS re-draw. Radar note copy (no em dashes):
"Scores are relative among these three countries, where the best of the three scores 100. They are
a reading aid, not a cited figure. Every underlying number is sourced in the rows below."

---

## 5. Compliance reframe (required — do not skip)

The mockup's verdict/leader language violates FENCE.md / DEFINITION_OF_DONE. Keep the **visuals**,
neutralise the **copy**.

- **Fence above the fold**: render `<FenceBlock hasLegalClaims={true} />` immediately under the
  intro subhead, **above the tabs and the first data claim**. This puts `FENCE_PRIMARY` verbatim
  and the tax/residency rider ("not legal or tax advice") high on the page. Do not rely on a footer
  notice. (The fence guard scans the built HTML for these strings.)
- **Verdict cards**: keep the colour bar + badge + prose. Replace "🇬🇷 Greece recommended" badge text
  with a neutral marker: glyph + "What the data shows". Rewrite each verdict to factual
  "what leads on what", no recommendation, no "wins", no flag-as-winner:
  - taxes: "Among the three special regimes, Greece has the lowest headline rate at 7% flat on
    foreign-source pension income (article 5B), against Portugal's 20% (IFICI) and Spain's 24%
    (Beckham). They are different regimes with different eligibility. Confirm yours with a licensed
    tax adviser."
  - remote: "Spain has the lowest digital-nomad visa income floor at €2,763 a month, with Greece at
    €3,500 and Portugal at €3,680. By the Eurostat price level index, Portugal is the cheapest of
    the three."
  - retire: "Portugal is the most peaceful of the three (Global Peace Index rank 7) and the cheapest
    by price level. Greece has the most doctors per person and the lowest special tax rate. Spain
    sits between the two on most measures."
  - "All metrics" tab shows **no** verdict card (matches the mockup).
- **Leader markers stay, neutral**: per-row "X leads" dot + note, and the leader strip, are factual
  ("Portugal has the lowest price level"), never "best for you" / "you should" / "we recommend".
- **Hero taglines → place-led, no claims** (the mockup's "Lowest cost", "Best climate" are now
  factually wrong against our data, so drop superlatives): Greece "Athens on the Aegean";
  Portugal "Lisbon on the Atlantic"; Spain "Seville in the south". Country name stays in Fraunces
  italic. Keep the per-country gradient overlay and top-bar accent.
- **Disclaimer block**: remove the 2px `border-left` stripe. Render the closing note as plain muted
  prose (no side stripe, no full card needed) or a full 1px-bordered note. The legal fence already
  lives above the fold, so this is a short methodology line, e.g. "Every figure links to its source
  and shows the date we last verified it. Tax, visa, and residency rules change often; verify with a
  licensed professional and the official source before acting."
- **Intro copy** (no em dashes): eyebrow "Cited comparison · 2026 · primary sources"; h1 "Greece
  *vs* Portugal *vs* Spain" (vs in Fraunces italic); subhead "Six measures: cost, tax, a remote-work
  visa, sunshine, doctors per person, and safety. Every figure is sourced, dated, and confidence
  rated. We do not pick a winner for you."
- **Tabs**: All metrics / Lower my taxes / Work remotely / Retire abroad (unchanged labels).

### Em-dash sweep
The mockup uses em dashes throughout ("Six decisions — cost", "Beckham Law — first 6 years",
"Greece leads —", source "— 2024", "€500–600"). **None may survive.** Replace with commas / colons /
periods. Also remove en dashes in ranges (write "to"). Verify zero `—`, `–`, and `--` in the page,
Base, FenceBlock, ComparisonCell output.

---

## 6. Components

### FenceBlock.astro (fix the banned border)
Rewrite the `<style>`: remove `border-left-width: 4px`. Use a full 1px border in `--fence-border`,
`background: var(--fence-bg)`, text `color: var(--fence-ink)`. Stale text stays bold in `--fence-ink`
(not red). Keep the `.fence` class name (analytics + guards depend on it) and the `role="note"`
structure. Body 1rem, line-height 1.55, `--radius`.

### ComparisonCell.astro (repurpose to the new country cell)
Render a `<div class="country-cell" data-country={country}>` (not a `<td>`). Props:
`cited: CitedValue`, `displayValue: string`, `unit?: string`, `subtext: string`,
`country: "gr"|"pt"|"es"`, `isLeader: boolean`, `score: number`, `sourceRef: number`.
Markup top→bottom: mobile flag label (country accent); `.value-row` = `.value-num` (mono,
`color: var(--<country>)`, tabular-nums) + `.value-unit` + leader arrow SVG (only if `isLeader`);
`.cell-subtext`; `.cell-badges` = confidence badge (glyph + word, bordered, transparent bg) +
source ref `[n]` linking to `#sources`; `.bar-wrap > .bar-fill` (`data-score`, country colour,
`opacity: isLeader ? 1 : 0.42`). Low-confidence cells append the "Reported, not verified ..."
qualifier line. Colours via the country tokens, never inline hex.

---

## 7. a11y guard — replace `PAIRS` in `scripts/check-a11y.ts`

The old pairs reference removed terracotta hex. Replace with the new palette's actually-used pairs
(all verified ≥ 4.5:1):

```ts
const PAIRS: [string, string, string][] = [
  ["body ink / paper", "#151210", "#EFE9DF"],
  ["body ink / card", "#151210", "#F8F5EF"],
  ["muted / paper", "#6A6458", "#EFE9DF"],
  ["muted / card", "#6A6458", "#F8F5EF"],
  ["muted-strong / card", "#5A5248", "#F8F5EF"],
  ["primary link / paper", "#0A3D52", "#EFE9DF"],
  ["greece ink / paper", "#15639C", "#EFE9DF"],
  ["portugal ink / paper", "#9B2335", "#EFE9DF"],
  ["spain ink / paper", "#9C5717", "#EFE9DF"],
  ["greece ink / card", "#15639C", "#F8F5EF"],
  ["spain ink / card", "#9C5717", "#F8F5EF"],
  ["on-primary / teal", "#EDF1F2", "#0A3D52"],
  ["on-primary-soft / teal", "#AFC0C7", "#0A3D52"],
  ["greece on teal", "#63ADE8", "#0A3D52"],
  ["portugal on teal", "#E8919D", "#0A3D52"],
  ["spain on teal", "#E8A765", "#0A3D52"],
  ["fence ink / fence bg", "#2C2418", "#F4EAD4"],
  ["conf verified / card", "#1F6B3C", "#F8F5EF"],
  ["conf good / card", "#6E5E16", "#F8F5EF"],
  ["conf low / card", "#5A5248", "#F8F5EF"],
];
```

---

## 8. Imagery (flag, do not ship silently)

The hero photos are hotlinked Unsplash placeholders. Keep them as a **stopgap** but:
- Add real descriptive `alt` (e.g. "Acropolis above Athens at golden hour"), `loading="lazy"`,
  `decoding="async"`, and explicit `width`/`height` to avoid layout shift.
- Add a build-visible `TODO` comment above the hero: production needs licensed, optimised, locally
  hosted images (responsive `srcset`, modern format). Note this in the final report to the user.

---

## 9. Verify (the implementer runs these and reports output)

From `packages/web`: `npm run build` (Astro static, must exit 0) and `npm run test` (Vitest,
`fence.test.ts` must pass). From repo root, the guards run via the build scripts. Report any
failure verbatim; do not claim success without the command output.
