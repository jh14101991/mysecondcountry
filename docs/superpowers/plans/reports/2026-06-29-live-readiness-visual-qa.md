# My Second Country live readiness visual QA

Date: 2026-06-29

Scope: v5 public entry surfaces, evidence corridors, legal pages, and the current Chania coverage page.

Screenshot evidence is in `output/visual-qa/2026-06-29-live-readiness/`. The route metrics are saved in `output/visual-qa/2026-06-29-live-readiness/visual-qa-results.json`.

## Rendered route matrix

Checked at desktop, tablet, and mobile viewport sizes:

- `/`
- `/compare/greece-portugal-spain`
- `/screener`
- `/guides`
- `/places`
- `/places/greece/crete/chania`
- `/sources`
- `/methodology`
- `/privacy`
- `/terms`
- `/affiliate-disclosure`

Result: all 33 route and viewport combinations passed the strict rendered checks.

Checks included:

- exactly one `h1`
- canonical URL present
- no broken public internal links
- no right-edge overflow offenders
- no broken images observed in the rendered viewport
- high-liability pages carry the fence
- homepage and screener show the fence in the first viewport
- shared navigation present on public pages
- screener product header present on the screener
- mobile menu opens on `/guides` and exposes `Compare`, `Shortlists`, `Guides`, `Sources`, and `Build my shortlist`

## Fixes made during QA

- Homepage and screener now include canonical metadata, Plausible script wiring, and a visible fence before the first product claim.
- Screener mobile product chrome now uses a compact exit control, keeps the wordmark inside the viewport, and stacks the first intent choices.
- Compare mobile scenario tabs now wrap into a visible two row control instead of hiding the final option outside the phone viewport.

## Status boundaries

- Chania passed as the current coverage page, not as the finished dossier template. The dossier system remains blocked until Data Desk promotes Chania and Crete to the accepted data bundle state or Command Center gives an explicit override.
- `corepack pnpm verify:data` still fails only on `gr-crete-chania` thin uniqueness against `gr-crete`.
- Full `corepack pnpm verify:build` in this dirty checkout is blocked by an unrelated ops lane copy issue in `ops/lanes/index.html`. The public route checks and the underlying fence, heading, link, and no individualized copy checks passed for the v5 live readiness package.
