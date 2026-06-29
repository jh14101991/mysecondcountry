# My Second Country operating ledger

Status: reference source of truth, not a process document. This file does not add a fifth
process doc under ADR-0012. Repo rules remain in `AGENTS.md`, `CITATIONS.md`, `FENCE.md`,
and `SHIP.md`.

Purpose: coordinate My Second Country as a rolling production business. The system exists to
turn the canonical relocation variable matrix into cited data, publishable dossiers, content
assets, refresh obligations, audience learning, and revenue tests.

## The operating thesis

My Second Country is not a blog and not a freeform city-guide project. It is a cited
relocation intelligence desk.

The dataset is the product. Pages, comparison tools, social posts, newsletters, videos,
source cards, JSON endpoints, and professional hand-offs are projections of that dataset.
Every projection must preserve the citation fence, the source date, the confidence level, and
the correct granularity of the claim.

The machine should keep moving without a daily manual habit from the founder. It should not
publish without gates. The goal is continuous throughput plus visible restraint:

- process place and corridor candidates every day;
- publish only when an evidence bundle clears the depth gate;
- turn each published bundle into content and refresh obligations;
- let search, AI crawler, source-click, signup, and revenue signals reorder the queue.

## Non-negotiable rules

1. MSC publishes dossiers from the canonical variable matrix, not freeform research.
2. A page is allowed to use national data when the variable is national by nature.
3. A page is not allowed to present national data as local data.
4. Missing data is a first-class state, not a hidden weakness.
5. Unknown is never scored as zero. The engine excludes unknowns from scoring and renormalises.
6. No tax, visa, residency, legal, or financial claim ships without a CitedValue and the fence.
7. High-liability claims stay high or medium confidence only, never low.
8. The daily target is candidate processing. The publish target is gated by evidence quality.
9. Design approval is separate from data approval. A beautiful page with weak data does not ship.
10. A week with no market artifact is a debt week. A market artifact can be a page, content
    packet, stale-answer correction, newsletter, or live revenue test.

## Source-of-truth map

| Need | Source |
|---|---|
| Agent rules and read order | `AGENTS.md` |
| Citation schema and source discipline | `CITATIONS.md` |
| Liability fence and barred wording | `FENCE.md` |
| Ship discipline and weekly market floor | `SHIP.md` |
| Business operating ledger | `docs/msc-operating-ledger.md` |
| Canonical variable universe | `docs/data/variable-registry.md` |
| Matrix coverage and granularity contract | `docs/data/variable-matrix-contract.md` |
| Place production queue | `docs/data/place-production-queue.json` |
| Corridor production queue | `docs/data/corridor-production-queue.json` |
| Page families and template map | `docs/page-templates.md` |
| Design/data prop contract | `docs/template-field-contract.md` |
| Content and public presence | `docs/content-projection.md` |
| Revenue sizing note | `docs/revenue-model.md` |
| Analytics taxonomy | `docs/analytics.md` |
| Shared room state and handoffs | `docs/msc-room-state.json` |

## Room integration and drift control

The rooms do not stay aligned by reading each other's private thread history. They stay aligned
through shared files.

`docs/msc-room-state.json` is the shared operating board. Every MSC room reads it after the
repo startup docs and before choosing work. Each room updates only its own room status,
handoffs it owns, and narrow queue or content fields that belong to its lane.

Authoritative order:

1. `AGENTS.md`, `CITATIONS.md`, `FENCE.md`, and `SHIP.md` win for process, citations, fence,
   and ship rules.
2. Queue files win for candidate status.
3. `docs/content-projection.md` wins for the posting schedule.
4. `docs/msc-operating-ledger.md` wins for the operating model.
5. `docs/msc-room-state.json` reflects current room state, handoffs, blockers, and next actions.

The handoff rule is simple: a room can send work by adding or updating a handoff, but the
receiving room must mark it `accepted`, `blocked`, or `superseded`. Command Center resolves
conflicts during the weekly command packet.

The posting schedule stays inside `docs/content-projection.md`. Rooms may reference the live
posting board there, but they should not create a second calendar.

## The canonical unit

A unit is not a page. A unit is a complete evidence bundle.

An evidence bundle can project into:

- one public page;
- one machine-readable JSON endpoint;
- one source register;
- one comparison row or tool result;
- one source card;
- one social thread;
- one newsletter block;
- one short-video script;
- one stale-answer correction;
- one refresh obligation.

The bundle can represent a place, a regime, a question, a comparison, a checklist, or a
source-change alert. The matrix decides what is known, at what granularity, and with what
confidence.

## The place dossier model

Every place candidate moves through the same lifecycle.

| Status | Meaning | Next action |
|---|---|---|
| `candidate` | In queue, not researched | Data desk starts matrix pass |
| `researching` | Sources being gathered | Fill coverage sheet and source notes |
| `source_gap` | Evidence below publish threshold | Log missing variables and continue queue |
| `data_bundle_ready` | Matrix coverage passes data gate | Page factory scaffolds dossier |
| `dossier_draft` | Draft page exists locally | Run build, source, fence, and copy guards |
| `review_needed` | Needs human source/design review | Founder or lead agent reviews |
| `published` | Live or ready to merge | Content desk projects assets |
| `content_projected` | Content packet generated | Distribution desk uses it |
| `refresh_due` | Existing page has stale or weak data | Data desk refreshes |
| `retired` | No longer a useful target | Keep redirect or archive note |

Processing can happen daily. Publishing happens only when the gate is met.

## Matrix coverage principle

Each place is measured against the same variable matrix. The dossier may have a mix of national,
regional, local, proxy, and unavailable values, but the row set is consistent across places.

The correct question is not "How many facts did we find?" It is:

1. Which canonical variables were evaluated?
2. Which were available at their intended granularity?
3. Which are national by nature and correctly shared across places?
4. Which local variables are missing and why?
5. Is the evidence deep enough to publish a useful dossier?

The full contract lives in `docs/data/variable-matrix-contract.md`.

## Publish gates

### Place dossier gate

A place page should not publish until it has:

- at least 80 matrix variables evaluated;
- at least 35 populated CitedValues across the matrix;
- at least 12 local or regional values;
- at least 6 local daily-life values from travel, health, family, community, services, nature,
  cost, or housing;
- no high-liability value that is uncited, stale, low confidence, or ambiguous;
- a source-gap list for important missing values;
- one clear "what is national here" explanation;
- one clear "what is local here" explanation;
- Place JSON-LD and the data endpoint if the route supports it;
- a content packet assignment.

The first production slices may use a lower threshold only if explicitly marked `pilot` in the
queue. The page itself must still say what is national, regional, local, proxy, and unavailable.

### Regime or corridor gate

A regime, visa, tax, residency, or money-in-motion page should not publish until it has:

- the governing law, official source, or named institutional source;
- effective date or verified date;
- rate, threshold, duration, eligibility, deadline, and disqualifier fields where applicable;
- staleness interval set for high-liability fields;
- no personal recommendation or pass/fail verdict;
- a clear professional-verification CTA if monetized;
- revenue posture checked against `FENCE.md`.

### Content packet gate

A content packet should not schedule until it has:

- one source-backed claim;
- source name and verified date;
- confidence wording;
- fence string where the topic touches tax, visa, residency, cost, or financial implications;
- page URL or planned page URL;
- no advice phrasing;
- no unsourced field note presented as a fact.

## Standing threads

These are the recommended Codex rooms for MSC. They can be created as persistent threads in the
Codex app. Each room should keep its own working notes, but this ledger remains the shared map.

### 1. MSC command center

Owns: weekly focus, queue routing, branch readiness, run coordination.

Reads:

- this ledger;
- `docs/msc-room-state.json`;
- `docs/data/place-production-queue.json`;
- `docs/data/corridor-production-queue.json`;
- `docs/analytics.md`;
- Git status and CI state.

Writes:

- weekly operating brief;
- queue status updates;
- narrow changes to this ledger when the operating model changes.

Long-running goal:

Keep MSC shipping market artifacts every week without letting the system drift into private
planning.

Human gate:

Founder confirms weekly focus changes when they materially affect strategy, monetization, or
public posture.

### 2. MSC data desk

Owns: CitedValues, source research, variable coverage, source gaps, freshness.

Reads:

- `docs/msc-room-state.json`;
- `docs/data/variable-registry.md`;
- `docs/data/variable-matrix-contract.md`;
- `docs/data/SOURCES.md`;
- `packages/data/src/**`;
- source URLs.

Writes:

- `packages/data/src/**`;
- source-gap notes in queues;
- refresh PRs.

Long-running goal:

Advance candidates through the matrix while preserving source integrity and granularity honesty.

Human gate:

Manual-only sources, tax and visa source judgment, and any source with legal exposure.

### 3. MSC page factory

Owns: public pages and data endpoints from approved bundles.

Reads:

- `docs/msc-room-state.json`;
- `docs/page-templates.md`;
- `docs/template-field-contract.md`;
- approved data bundles;
- page queue.

Writes:

- `packages/web/src/pages/**`;
- page-specific tests if needed;
- JSON endpoints where the template requires them.

Long-running goal:

Turn `data_bundle_ready` items into build-green pages without inventing data or styling per page.

Human gate:

Any new template, homepage change, major design change, or page that changes the public promise.

### 4. MSC region desk

Owns: weekly geographic depth, place ordering, local source discovery.

Reads:

- `docs/msc-room-state.json`;
- place queue;
- maps and official local sources;
- `docs/data/variable-registry.md`;
- existing place data.

Writes:

- candidate ordering;
- source-gap reasons;
- local evidence packets.

Long-running goal:

Build coherent regional clusters instead of random isolated pages.

Human gate:

Selection of a new weekly geography if it displaces the revenue corridor.

### 5. MSC content desk

Owns: source cards, social threads, short posts, newsletter blocks, short-video scripts.

Reads:

- `docs/msc-room-state.json`;
- `docs/content-projection.md`;
- published or ready-to-publish bundles;
- source register.

Writes:

- content packet drafts;
- scheduled-content handoff;
- output files when the content package exists.

Long-running goal:

Every shipped evidence bundle becomes a public presence packet without daily invention.

Human gate:

Final public posting, on-camera scripts, paid or affiliate disclosures.

### 6. MSC distribution desk

Owns: stale-answer corrections, journalist fact hooks, forum/search hit lists, launch copy.

Reads:

- `docs/msc-room-state.json`;
- new and changed facts;
- GSC queries;
- current SERP/forum threads;
- content packet drafts.

Writes:

- correction drafts;
- journalist hook pages or draft snippets;
- distribution results back to analytics notes.

Long-running goal:

Move MSC from private corpus to real reader contact every week.

Human gate:

Posting into external communities, journalist outreach, any identity-sensitive account action.

### 7. MSC revenue desk

Owns: email capture, adviser sourcing, intro block readiness, fake-door tests, monitoring
subscription signals.

Reads:

- `docs/msc-room-state.json`;
- `docs/revenue-model.md`;
- `docs/data/corridor-production-queue.json`;
- `FENCE.md`;
- traffic and signup signals.

Writes:

- provider endpoint setup tasks;
- adviser candidate notes;
- revenue corridor status;
- code only for small gated revenue surfaces.

Long-running goal:

Turn high-intent corridors into money signals without corrupting the citation moat.

Human gate:

Adviser approval, intro block going live, any paid relationship, any real charge.

### 8. MSC analytics desk

Owns: GSC, Plausible, AI crawler logs, source clicks, signup rates, queue reprioritization.

Reads:

- `docs/msc-room-state.json`;
- `docs/analytics.md`;
- weekly digest issues;
- Plausible exports;
- GSC exports;
- AI crawler logs once wired.

Writes:

- weekly signal read;
- queue priority changes with evidence;
- metric gaps.

Long-running goal:

Keep the production queue demand-led rather than preference-led.

Human gate:

Major strategy pivots, kill/rework calls, paid-spend decisions.

### 9. MSC design desk

Owns: v5 system port, templates, homepage, screenshot review.

Reads:

- `docs/msc-room-state.json`;
- design handoff docs;
- `docs/template-field-contract.md`;
- local mockups;
- live Astro pages.

Writes:

- `packages/web/src/components/**`;
- styleguide;
- approved design system docs after port.

Long-running goal:

Move the approved Broadsheet Ledger system from mockups into production without touching data
truth.

Human gate:

Visual lock, homepage approval, new template approval.

## Automation roster

These are the active room wakeups. They should read `docs/msc-room-state.json` before choosing
work and update their room status or handoffs when the run changes current state.

| Automation | Cadence | Target thread | Main output | Human gate |
|---|---|---|---|---|
| Weekly command packet | Monday morning | MSC command center | weekly focus, room handoffs, gate status | focus changes |
| Data matrix pull | Monday to Thursday morning | MSC data desk | next cited variable or source-gap movement | source acceptance |
| Page factory pass | Monday to Thursday late morning | MSC page factory | one page-unit check or scoped page advance | page publish |
| Region focus planner | Monday early afternoon | MSC region desk | region batch shape and local-source priorities | focus changes |
| Content packet builder | Tuesday and Thursday afternoon | MSC content desk | content packet and posting-board updates | public posting |
| Revenue lane review | Wednesday morning | MSC revenue desk | next low-risk commercial test | adviser, affiliate, charge |
| Distribution sweep | Wednesday and Friday afternoon | MSC distribution desk | channel plan from finished or draft packets | external posting |
| Design gate review | Thursday afternoon | MSC design desk | rendered product and page readiness checks | visual lock |
| Analytics signal review | Friday late morning | MSC analytics desk | measurement gaps and queue implications | strategy changes |
| Monthly matrix gap audit | First Monday morning | MSC source QA desk | citation, freshness, fence, and matrix drift audit | source strategy |

## Weekly rhythm

Monday:

- command center chooses active geography and corridor;
- analytics desk reports signals;
- data desk reviews freshness;
- page factory finishes carryover pages.

Tuesday:

- data desk processes two candidates;
- distribution desk drafts stale-answer corrections;
- revenue desk advances adviser sourcing.

Wednesday:

- page factory scaffolds approved bundles;
- content desk builds the weekly framework and content packet.

Thursday:

- data desk processes two more candidates;
- distribution desk updates hit list;
- design desk or page factory handles review fixes.

Friday:

- analytics desk reads signals;
- command center updates queue priorities;
- revenue desk reports corridor status;
- content desk prepares next weekly packet.

No required Sunday work. Monthly recording and scheduling is a separate batch day.

## Region and corridor focus

Each week has:

- one active geography for place-depth work;
- one active money corridor for rule/regime/revenue work;
- one active content framework derived from either the geography or corridor.

Example:

| Week | Geography | Corridor | Framework |
|---|---|---|---|
| 1 | Crete | Portugal IFICI | NHR is gone, what changed |
| 2 | Attica | Greece golden visa | The old 250k floor problem |
| 3 | Peloponnese | Greece 7 percent pensioner regime | The 31 March trap |
| 4 | Valencia and Alicante | Spain golden visa abolition | What ended and what remains |

The geography and corridor do not have to be the same. The place desk can build Crete while the
revenue desk works Portugal IFICI.

## Queue rules

1. The queue may contain hundreds or thousands of candidates.
2. The daily automation processes the next candidates, it does not promise to publish them.
3. A source gap is useful output.
4. Candidates with strong analytics signals can jump order.
5. A candidate that fails twice due to missing sources moves to `source_gap` until a new source is
   found.
6. Queue edits should preserve the history fields.

## Data package shape for a place candidate

Every candidate research bundle should have:

- candidate id and slug;
- place hierarchy;
- population and coordinates, if sourced;
- intended matrix category coverage;
- observed values with `coverageStatus`;
- national-by-nature values inherited from country;
- regional values inherited from region;
- local values gathered for the place;
- proxy values with plain proxy labels;
- unavailable values with source-gap reason;
- source register;
- publication recommendation: publish, hold, or skip.

## Revenue corridor shape

Every revenue corridor should have:

- corridor id;
- reader fear;
- target query cluster;
- money moment;
- source-backed page family;
- professional type needed;
- adviser candidates;
- intro block status;
- email capture status;
- disclosure requirements;
- pricing hypothesis;
- first signal threshold;
- kill condition.

Portugal IFICI is the first corridor because the stale-answer problem is live, the reader fear is
clear, and advisers exist. The intro block must stay off until a vetted adviser agrees.

## Content projection

Each published or ready-to-publish bundle should produce:

- source card;
- X or Threads thread;
- LinkedIn post;
- short-post variants;
- newsletter field note;
- short-video script;
- one stale-answer correction angle;
- one internal audience-learning note.

The content desk should not write from vibes. It pulls the CitedValues, source dates, and
confidence labels from the bundle.

## Analytics loop

The analytics desk should reorder the queue using:

- GSC impressions and queries;
- page clicks;
- source-link clicks;
- newsletter signups;
- AI crawler hits;
- external referrals;
- intro requests;
- content saves, replies, and click-throughs.

Signal hierarchy:

1. A high-intent query with impressions and weak current page coverage.
2. A source-click cluster showing readers are verifying a data type.
3. A signup or intro request from a corridor page.
4. A fresh rule change with stale SERP answers.
5. A content hook that moves outside founder audience.

## Initial long-running goals

### Goal 1: Complete the matrix-backed Greece place cluster

Definition:

- Greece country page;
- Crete region page;
- Chania, Heraklion, Rethymno, Athens, Thessaloniki, Nafplio, Corfu Town;
- each through the matrix gate or explicitly source-gapped;
- content packets for each published dossier.

### Goal 2: Activate Portugal IFICI as the first revenue corridor

Definition:

- IFICI/NHR page cluster live;
- email capture endpoint real;
- intro block built and gated;
- one vetted adviser agrees;
- first qualified intro request captured or the corridor fails its first signal test.

### Goal 3: Turn v5 design into the production site

Definition:

- homepage ported from mockup to Astro;
- v5 components replace or wrap current live kit;
- no data truth moved into mockups;
- CI green;
- screenshot review passed.

### Goal 4: Build the content manufacturing loop

Definition:

- weekly content packet automation active;
- monthly batch packet active;
- one month of scheduled drafts generated from shipped bundles;
- no daily manual content requirement.

### Goal 5: Make analytics drive the queue

Definition:

- weekly digest includes GSC, Plausible, source clicks, AI crawler log status, and queue changes;
- at least one queue priority change per week cites a signal or says no signal.

## First 30 days

Week 1:

- commit this ledger, matrix contract, and starter queues;
- fix CI/Biome scope or cleanup;
- add Crete parent or mark Chania as pilot only;
- replace placeholder email and intro endpoints if provider choices are ready;
- keep intro live flag false.

Week 2:

- process Crete matrix candidates;
- publish or hold Chania, Heraklion, and Crete region based on the gate;
- create first Portugal IFICI stale-answer correction packet;
- begin adviser sourcing.

Week 3:

- port v5 homepage to Astro or explicitly split design desk into its own branch;
- ship the first content packet from a published or ready bundle;
- update queues from analytics and source gaps.

Week 4:

- review whether daily candidate processing is producing publishable bundles or source gaps;
- tune thresholds;
- decide the next geography and next corridor from evidence, not taste.

## What not to build yet

- A database for user data.
- A full adviser marketplace.
- A live paid dossier generator before fake-door or email demand.
- A 1000-page autopublisher.
- A social scheduler that posts without human approval.
- A content generator that invents facts.
- A new process doc.

## Maintenance rule

This ledger can grow, but it should not become a diary. Put daily outputs in queue files,
issues, PRs, or thread notes. Update this file only when the operating model changes.
