# Route brief: places and Chania gate

Date: 2026-06-29
Owner: MSC Design Desk, Data Desk, and Page Factory
Route: `/places`, `/places/greece/crete/chania`
Status: places live, Chania held
Primary reader: person checking coverage and place readiness
Reader moment: they want to know what is real, held, or coming
Main question: which places have evidence, and which are not ready yet?
Product job: show coverage without fake breadth
Business job: protect the first town page gate
Data state: Chania source-gap review and publication hold
Fence state: visible on place pages with cost, tax, residency, or financial claims
Primary next action: sources or compare
Secondary next action: screener

## Route alignment

- `/places` is live. Its route-contract first action is `/places/greece/crete/chania`, but that target is a Chania coverage file only.
- `/places/greece/crete/chania` is held and coverage-only, with first action `/sources`.
- The route must not present Chania as a finished dossier.
- Do not implement or present the Chania dossier until Data Desk clears both gr-crete-region and gr-crete-chania as data_bundle_ready with publish recommendation, or Command Center records an explicit override.

## Page spine

1. Coverage promise.
2. Published, held, and upcoming states.
3. Country and region index.
4. Explanation of why held means held.
5. Link to sources and methodology.

## Rendered proof required

- Desktop viewport: coverage states and Chania held cue are visible.
- Tablet viewport: country, region, and held-state lists remain distinct.
- Mobile viewport: published, held, and upcoming states are readable without cramped labels.
- Scroll-state proof: source and methodology links appear after the coverage index.
- Reduced-motion proof: coverage states are visible without reveal effects.
- No-JS or JS-failure proof: coverage index and held cue remain plain content.
- Accessibility check: list semantics, h1, state labels, focus states, and alt text where used.
- Link check: Chania coverage file, sources, methodology, compare, and screener links resolve.

## Risks

- Data risk: Chania presented as finished.
- Fence risk: place copy drifts into recommendation.
- UX risk: empty breadth presented as progress.
- Launch risk: dossier pressure before data gate.
