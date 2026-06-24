# AGENTS.md

## Read order

Read these files before touching any code or content, in this sequence:

1. `FOUNDER.md`, founder profile, failure modes, energy constraints
2. `AGENTS.md` (this file), all rules that govern agent behavior
3. `CITATIONS.md`, citation schema, CitedValue contract, confidence levels
4. `FENCE.md`, liability fence, mandatory disclaimers, what agents may never claim
5. `SHIP.md`, definition of done, deployment gate, PR protocol
6. `docs/superpowers/specs/2026-06-24-v1-design.md`, product design decisions
7. `docs/superpowers/plans/2026-06-24-v1-implementation-plan.md`, step-by-step build plan

Read only what the task requires beyond this list. Do not explore the whole repo.

## Brand and project isolation

The brand is **My Second Country**. The canonical domain is `mysecondcountry.com`. Use that host in every canonical URL, JSON-LD `@id`, sitemap entry, and affiliate application. The name and domain are locked; do not relitigate them (see `docs/decisions/ADR-log.md` and the implementation plan).

This repo is isolated from byImprint. It does not inherit byImprint's project skills, agents, settings, or memory. It inherits only user-level generic skills and the three global rules, which is fine. Two rules follow:

- Do NOT use the `byimprint-design` skill or any byImprint design tokens, palette, or components. My Second Country has its own visual identity, built fresh.
- Build business-specific skills and workflows in this repo's own `.claude/skills/` only, and only once a task genuinely repeats. Do not pre-build a skill library; that is the over-building failure mode in `FOUNDER.md`.

## Monorepo layout

```
packages/
  data/     shared dep, Zod schemas, CitedValue types, seed JSON
  engine/   pure screening logic, unit-tested, no I/O
  web/      Astro 6 static site, deployed to Vercel
  content/  generation scripts, Remotion config, newsletter templates
scripts/    tsx refresh pipeline, run by GitHub Actions cron
docs/       specs, plans, decisions, analytics, weights, projections
```

`packages/data` is the shared dependency. Every other package imports from it. Schema changes land in `packages/data` first; downstream packages adapt second.

## Golden rule

**Ship one real Greek town page end to end before any breadth.**

One town, one complete Place object, one rendered Astro page, one deployed URL, one passing DEFINITION_OF_DONE.md checklist. Nothing else counts as progress until that page exists and passes the gate.

If you find yourself building a system, a generator, a pipeline, or a framework before that first page exists: stop. That is the build-instead-of-ship failure mode. Reread `FOUNDER.md` and return to the one-page gate.

## Process doc hard cap

Exactly four process docs exist: `AGENTS.md`, `CITATIONS.md`, `FENCE.md`, `SHIP.md`.

A new process doc may only replace one of these four. It may not be added alongside them. If a process concern is not covered, add a section to the appropriate existing file. Reference docs (specs, plans, data, decisions, analytics, weights, projections) are separate and unlimited.

## ADR rule

All architecture decisions are logged in `docs/decisions/ADR-log.md`. Any action that contradicts an accepted ADR requires a superseding ADR to be written and accepted first. Silent contradictions are not permitted. If you are unsure whether a decision is already locked, read the ADR log before proceeding.

## Citation contract

Every value that could be wrong is a `CitedValue`. Structure: `{ value, sourceUrl, sourceName, verifiedDate, confidence, granularity }`. See `CITATIONS.md` for the full schema and confidence levels. A fact without a CitedValue is a build error, not a style issue.

## Liability fence

Read `FENCE.md` before authoring any content. The short version: this product is cited screening intelligence, never advice. No individualized recommendations. Every residency, tax, and visa claim carries a visible disclaimer and routes to official sources. Violations are not style issues; they create legal exposure.

## Copy rules

- No em dashes. Use commas, periods, colons, or semicolons.
- No AI-register words: leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust.
- Sentence case for all headings.
- Conservative framing. Do not oversell. Transparent math only. Use the founder's own words when writing about the product.

## Model economy

The top model (Opus/Fable tier) steers: judgment, design, schema decisions, diff review. Cheap models (Sonnet by default, Haiku for trivial work) implement, sweep, and run tests.

Before any fan-out beyond roughly 10 agents, state the agent count and get explicit approval or scale down. One implementer plus a controller diff-read is the default review shape.

## Key reference files

- `DEFINITION_OF_DONE.md`, the gate every page must pass before it counts
- `SECRETS.md` and `.env.example`, secret handling, never commit real secrets
- `docs/data/SOURCES.md`, approved primary sources, confidence weights
- `docs/data/greece-seed.md`, the first seed dataset, Greece and its towns
- `docs/decisions/ADR-log.md`, locked architecture decisions
