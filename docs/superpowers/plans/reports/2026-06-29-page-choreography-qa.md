# MSC page choreography QA

Date: 2026-06-29

## Scope

- Route contract
- Route briefs
- Missing trust routes
- Homepage minimum-sufficient-information pass
- Screener and shortlist progressive disclosure
- Compare and evidence hubs
- Legal route alignment

## Verification

- `corepack pnpm --filter @where/web build`: pass
- `corepack pnpm verify:build`: pass
- `corepack pnpm verify:links`: pass
- `corepack pnpm verify:routes`: pass, 41 contract routes checked against the built sitemap
- `corepack pnpm test`: fail in dirty City Matrix work outside the page choreography commit set. Latest failing assertion is `scripts/__tests__/run-city-matrix-adapters.test.ts`, where `wildfire_egress_proxy` is expected in the adapter output registry but is not registered.
- `corepack pnpm verify:data`: fail on known Chania uniqueness gate. `gr-crete-chania` has 0 cited fields that differ from `gr-crete`, and needs 4.
- `corepack pnpm qa:visual`: pass, 115 rendered checks across the expanded page-choreography route set

## Rendered evidence

Screenshots are in `output/visual-qa/2026-06-29-page-choreography/`.

## Dossier gate

Chania dossier implementation remains blocked until Data Desk clears the parent region and town bundle handoff or Command Center records an explicit override.

The page choreography pass did not implement the Chania dossier template. The route contract marks Chania as held coverage, and the built-route guard blocks held place routes from rendering fact tables, source tables, dataset JSON-LD, measured variables, the screening island, or the normal place CTA.

## Residual risks

- `verify:data` continues to block Chania publication on the known Chania-vs-Crete uniqueness gate.
- Root test verification is not clean in this dirty worktree because uncommitted City Matrix adapter work is being discovered by the workspace test runner.
- The repo still contains unrelated dirty Data Desk, City Matrix, mockup, and operations files outside the page choreography commit set.
- Do not start the dossier page template system until Data Desk or Command Center clears the Chania gate.
