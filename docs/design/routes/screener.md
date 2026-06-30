# Route brief: screener

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/screener`
Status: live, cleanup required
Primary reader: person ready to enter constraints
Reader moment: they want a shortlist without receiving advice
Main question: what places match the criteria I chose, based on published facts?
Product job: capture minimum useful inputs and show source-backed results
Business job: create the first product habit and evidence of demand
Data state: uses current country and corridor data, not Chania dossier data
Fence state: visible before result interpretation
Primary next action: inspect a result or compare
Secondary next action: sources

## Page spine

1. First viewport: product header, compact promise, first required inputs.
2. Fence or boundary: screening-not-advice cue beside the task.
3. First proof object: source-read strip naming what the engine reads.
4. Interpretation: results with score, reasons, confidence, and gaps.
5. Source trail: source links attached to shown reasons.
6. Gap or caveat: unknown data excluded from scoring, not scored as zero.
7. Next action: compare or inspect sources.

## Evidence contract

- Values shown: only values needed for visible reasons.
- Source display: attached to each reason.
- Verified date display: attached to each reason.
- Confidence display: word and mark.
- Granularity display: shown when result inherits national or regional data.
- Gap display: visible in result explanation.
- Machine-readable output: not required for user-state results.

## Visual register

- Surface type: product instrument.
- Primary hierarchy move: stable sections and predictable controls.
- Allowed image or engraving use: none in the task body.
- Components allowed: field groups, chips, result rows, source chips.
- Components banned: marketing hero choreography, equal decorative cards.
- Motion allowed: selection state and result update only.

## Discoverability

- Primary nav: `Build my shortlist`.
- Footer: yes.
- Hub: homepage and shortlists.
- Related routes: compare, sources, methodology.
- Sitemap: yes or noindex decision must be explicit.

## Rendered proof required

- Desktop viewport: input and result area.
- Tablet viewport: field groups do not crowd.
- Mobile viewport: touch targets at least 44 px.
- Scroll-state proof: result explanation visible after interaction.
- Reduced-motion proof: no task content depends on animation.
- No-JS or JS-failure proof: page explains if interactive scoring is unavailable.
- Accessibility check: labels, fieldsets, errors, focus state.
- Link check: all source and next-action links resolve.

## Risks

- Data risk: result reasons may imply more precision than data supports.
- Fence risk: score language can become individualized advice.
- UX risk: asking for more inputs than the first useful shortlist needs.
- Launch risk: analytics events missing or noisy.
