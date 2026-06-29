# Route brief: legal, about, and screening notice

Date: 2026-06-29
Owner: MSC Design Desk and Command Center
Route: `/privacy`, `/terms`, `/affiliate-disclosure`, planned `/about`, planned `/screening-notice`
Status: legal pages live, about and screening notice planned
Primary reader: person checking boundaries, privacy, disclosure, or who is behind MSC
Reader moment: they need plain trust infrastructure
Main question: what does MSC claim, collect, disclose, and refuse to do?
Product job: make boundaries legible
Business job: protect trust and launch readiness
Data state: policy and product-positioning content
Fence state: explicit
Primary next action: sources or methodology
Secondary next action: screener

## Route alignment

- `/privacy`: live policy route, first action `/terms`.
- `/terms`: live policy route, first action `/privacy`.
- `/affiliate-disclosure`: live disclosure route, first action `/sources`.
- Planned `/about`: trust route, first action `/methodology`.
- Planned `/screening-notice`: legal boundary route, first action `/sources`.

## Page spine

1. Plain title.
2. Short summary.
3. Policy or role sections.
4. Related legal and source links.

## Rendered proof required

- Desktop viewport: title, summary, and first policy section are visible.
- Tablet viewport: policy sections and related links stay readable.
- Mobile viewport: trust boundary, disclosure, or policy summary appears before long text.
- Scroll-state proof: related legal and source links appear near the end.
- Reduced-motion proof: all policy content is visible without animation.
- No-JS or JS-failure proof: policy text and links remain static content.
- Accessibility check: landmarks, h1, section headings, focus states, and readable contrast.
- Link check: privacy, terms, affiliate disclosure, sources, methodology, and planned-route placeholders resolve only when live.

## Risks

- Data risk: factual claims about processors or policies get stale.
- Fence risk: about page implies adviser role.
- UX risk: legal links only in footer.
- Launch risk: affiliate or email capture without policy completeness.
