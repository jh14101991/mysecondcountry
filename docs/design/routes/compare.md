# Route brief: compare

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/compare/greece-portugal-spain`, future `/compare`
Status: live flagship, hub planned
Primary reader: person comparing a small set of countries or regimes
Reader moment: they need differences, not a winner
Main question: what changes between these places under the same evidence standard?
Product job: show a neutral comparison with sources, confidence, and scenario filters
Business job: make the flagship artifact shareable and quotable
Data state: current country-level and corridor-level cited values
Fence state: visible before tax, residency, cost, or financial claims
Primary next action: `/screener`
Secondary next action: `/sources`

## Route alignment

- `/compare/greece-portugal-spain` is the live flagship comparison route.
- `/compare` is planned as the hub route and must not be treated as live until the contract changes.
- Keep primary nav on the live flagship until `/compare` exists.

## Page spine

1. Neutral thesis with no winner.
2. Fence and freshness cue.
3. Scenario choice before dense dimensions.
4. Comparison table with source-adjacent values.
5. Interpretation bands for differences that matter.
6. Sources and methodology.
7. Next action to screener.

## Evidence contract

- Values shown: scenario-relevant first, full dimensions lower.
- Source display: in table cells or immediate row detail.
- Verified date display: near each value.
- Confidence display: word and mark.
- Granularity display: country, region, or town as applicable.
- Gap display: visible if a dimension is unavailable or proxy.
- Machine-readable output: ItemList and Dataset where available.

## Visual register

- Surface type: evidence.
- Primary hierarchy move: table with clear reading order.
- Allowed image or engraving use: none in the core comparison.
- Components allowed: comparison table, scenario tabs, source list.
- Components banned: per-country color winners, decorative rankings.
- Motion allowed: tab/filter state only.

## Discoverability

- Primary nav: direct flagship until `/compare` hub exists.
- Footer: yes after hub exists.
- Hub: `/compare` planned.
- Related routes: screener, sources, methodology.
- Sitemap: yes.

## Rendered proof required

- Desktop viewport: scenario controls, table header, and first evidence rows are visible.
- Tablet viewport: table reading order stays clear without clipped values.
- Mobile viewport: comparison rows remain readable and source detail is reachable.
- Scroll-state proof: interpretation bands and source section appear after the table.
- Reduced-motion proof: tabs or filters do not hide core comparison content.
- No-JS or JS-failure proof: default comparison content and next actions remain visible.
- Accessibility check: table semantics, headings, focus order, and confidence labels.
- Link check: sources, methodology, screener, and canonical comparison links resolve.

## Risks

- Data risk: hardcoded display values drift from data.
- Fence risk: scenario copy implies a recommendation.
- UX risk: too many dimensions visible before the reader chooses a concern.
- Launch risk: mobile table overflow.
