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
- `corepack pnpm verify:routes`: pass
- `corepack pnpm test`: fail, blocked by dirty Data Desk/City Matrix state outside this page choreography commit set. Current failing assertion is `packages/data/src/place-bundles/__tests__/index.test.ts`, `gr-crete-region:surface_water_density` expected `coverageStatus` `blocked` but found `proxy`.
- `corepack pnpm verify:data`: fail on known Chania uniqueness gate. `gr-crete-chania` has 0 cited fields that differ from `gr-crete`, and needs 4.
- `corepack pnpm qa:visual`: fail only on held Chania route. `/places/greece/crete/chania` has one reveal element hidden at desktop, tablet, and mobile, plus tablet horizontal overflow.

## Rendered evidence

Screenshots are in `output/visual-qa/2026-06-29-page-choreography/`.

## Dossier gate

Chania dossier implementation remains blocked until Data Desk clears the parent region and town bundle handoff or Command Center records an explicit override.

The page choreography pass did not implement the Chania dossier template. The public places hub marks Chania as held coverage, not a finished dossier.

## Residual risks

- Root test verification is not clean in this dirty worktree because uncommitted Data Desk/City Matrix work is being discovered by the workspace test runner.
- The held Chania route still renders enough page structure to fail visual QA. This should be resolved by Data Desk/Page Factory when the held coverage route or dossier gate is addressed.
- `verify:data` continues to block publication on the known Chania-vs-Crete uniqueness gate.
