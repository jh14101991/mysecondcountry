# Route brief: guides and answer corridors

Date: 2026-06-29
Owner: MSC Design Desk and Page Factory
Route: `/guides`, `/answers/*`, `/topics/*`, `/tools/*`, `/tax`
Status: live, cleanup required
Primary reader: person looking for an explanation or a tool
Reader moment: they need a source-backed answer without learning the whole site
Main question: where is the relevant explanation?
Product job: group routes by reader task
Business job: reduce dead ends and route high-intent readers deeper
Data state: varies by route family
Fence state: visible for cost, tax, residency, visa, financial, and legal implications
Primary next action: reader selects a relevant guide or tool; route-contract first action is `/sources`
Secondary next action: sources

## Route alignment

- `/guides` is the route-contract entry for this brief.
- `/answers/*`, `/topics/*`, `/tools/*`, and `/tax` are owned corridors under this brief.
- Those corridors are not separate route-contract entries until `docs/design/routes.json` adds them.

## Page spine

1. Hub promise.
2. Grouped entries by task.
3. Short provenance cue for high-liability topics.
4. Links to methodology and sources.

## Rendered proof required

- Desktop viewport: hub groups and at least one high-liability provenance cue are visible.
- Tablet viewport: grouped links keep distinct priority and do not collapse into equal weight.
- Mobile viewport: task groups, cue text, and primary links remain scannable.
- Scroll-state proof: lower route families and source links appear after scrolling.
- Reduced-motion proof: route cards and corridors are visible without reveal effects.
- No-JS or JS-failure proof: all hub links remain plain links.
- Accessibility check: one h1, grouped list semantics, descriptive link text, focus states.
- Link check: guide, answer, topic, tool, tax, sources, and methodology links resolve.

## Risks

- Data risk: guide cards imply full coverage where data is partial.
- Fence risk: answer pages sound advisory.
- UX risk: all entries same weight.
- Launch risk: route families scattered across hubs.
