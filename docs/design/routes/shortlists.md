# Route brief: shortlists

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/shortlists`
Status: live, cleanup required
Primary reader: person comparing ranked example scenarios
Reader moment: they want to understand why a place is near the top
Main question: what does this ranking mean, and what evidence drives it?
Product job: show ranked examples without individualized advice
Business job: bridge homepage and screener
Data state: current scored places and scenario examples
Fence state: visible near score interpretation
Primary next action: `/screener`
Secondary next action: `/sources`

## Page spine

1. Scenario label and criteria.
2. Ranking key and fence.
3. First result with only the decisive reasons visible.
4. Expandable evidence for deeper inspection.
5. Source trail and gaps.
6. Next action to run the screener.

## Evidence contract

- Values shown: decisive reasons first.
- Source display: attached to each reason.
- Verified date display: attached to each reason.
- Confidence display: word and mark.
- Granularity display: visible for inherited data.
- Gap display: unknown excluded from score.
- Machine-readable output: ItemList where available.

## Rendered proof required

- Desktop viewport: scenario label, first ranked item, and decisive reasons are visible.
- Tablet viewport: ranking key and evidence controls do not crowd result rows.
- Mobile viewport: rank, reason, source, and CTA remain readable in one-column flow.
- Scroll-state proof: expanded evidence and source trail render below the first items.
- Reduced-motion proof: ranking and expanded evidence do not depend on animation.
- No-JS or JS-failure proof: example rankings and source cues remain visible.
- Accessibility check: ordered structure, expandable state labels, focus order.
- Link check: screener, sources, and any result links resolve.

## Risks

- Data risk: rank can imply precision.
- Fence risk: best-for-you language is banned.
- UX risk: every ranked item showing all evidence upfront.
- Launch risk: saved-shortlist promise outruns implementation.
