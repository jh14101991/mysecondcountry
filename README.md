# My Second Country

Brand: My Second Country. Canonical domain: `mysecondcountry.com`.

A global, cited, continuously-refreshed "where should I live" intelligence engine (residency, tax, cost, climate), built as a dataset-driven, multi-channel visibility engine. One canonical cited dataset projects into programmatic pages, short-form video, social posts, and a newsletter. v1 is Europe, Greece-first, dogfooded by the founder. Faceless-leaning, product-led. Monetization is recurring revenue off the freshness moat first (a change-monitoring subscription, B2B dataset licensing), with a one-time paid cited dossier as the validated entry product; affiliate is a disclosed floor on commodity adjacencies only, never on cited tax, visa, or residency claims (ADR-0018).

This is a clean-sheet repo. It shares no code, data, or branding with any prior project. Keep it that way.

## Start here (read in this order)

1. `FOUNDER.md` , who this is built for, what to lean on, what to guard against.
2. `AGENTS.md` , the rules that govern every agent in this repo.
3. `CITATIONS.md` , the citation contract (every fact is a sourced, dated `CitedValue`).
4. `FENCE.md` , the liability fence (cited screening intelligence, never advice).
5. `SHIP.md` , the shipping discipline (ship one real page before any breadth).
6. `docs/superpowers/specs/2026-06-24-v1-design.md` , the full design.
7. `docs/superpowers/plans/2026-06-24-v1-implementation-plan.md` , the step-by-step build.

## The one rule that matters most

Ship one real Greek town page end to end, live in production, passing `DEFINITION_OF_DONE.md`, before building any system, generator, or breadth. Everything else is downstream of that page.

## Reference docs

- `DEFINITION_OF_DONE.md` , the machine-checkable v1 gate.
- `SECRETS.md` + `.env.example` , secret handling.
- `docs/runbook.md` , deploy, the weekly crons, IndexNow, and access recovery.
- `docs/data/SOURCES.md` , the data source registry (endpoints, licenses, gotchas).
- `docs/data/greece-seed.md` , the cited Greece seed facts.
- `docs/decisions/ADR-log.md` , locked architecture decisions.
- `docs/analytics.md` , events and KPIs.
- `docs/engine-weights.md` , the scoring model.
- `docs/content-projection.md` , how one dataset becomes every channel, plus the seed calendar.
