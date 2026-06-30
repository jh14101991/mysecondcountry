# Route brief: sources and methodology

Date: 2026-06-29
Owner: MSC Design Desk and Source QA Desk
Route: `/sources`, `/methodology`
Status: live, cleanup required
Primary reader: skeptical reader or AI crawler checking provenance
Reader moment: they need to verify the product's evidence discipline
Main question: where did this claim come from, and how current is it?
Product job: make sources, confidence, freshness, and fence inspectable
Business job: turn trust into a product asset
Data state: current source register and methodology copy
Fence state: visible when explaining high-liability topics
Primary next action: inspect a source; route-contract first action is `/methodology` for `/sources` and `/sources` for `/methodology`
Secondary next action: build shortlist or compare

## Page spine

1. Source passport summary.
2. Searchable source register.
3. Confidence tiers.
4. Freshness rules.
5. How a figure is built.
6. Screening notice.
7. Machine-readable pointers where safe.

## Rendered proof required

- Desktop viewport: source passport, search or register entry, and confidence tiers are visible.
- Tablet viewport: register rows and tier explanations stay readable.
- Mobile viewport: source names, dates, confidence, and links do not overflow.
- Scroll-state proof: freshness rules, figure-building notes, and screening notice render lower down.
- Reduced-motion proof: register and tier content is visible without animation.
- No-JS or JS-failure proof: source register remains readable, search can degrade to static list.
- Accessibility check: table or list semantics, h1, labels, focus states, and contrast.
- Link check: source URLs, methodology cross-links, shortlist, and compare links resolve.

## Risks

- Data risk: source register becomes a dump.
- Fence risk: methodology implies certification or advice.
- UX risk: confidence appears decorative.
- Launch risk: source gaps hidden.
