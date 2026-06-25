# Public cited data as a first-class artifact: projection spec

**Status:** Proposal, pre-build. Synthesised from two creative-ideation passes (Edward de Bono lateral provocations, then SCAMPER) run against the v1 design on 2026-06-25.
**Relationship to locked work:** This spec is additive to `docs/superpowers/specs/2026-06-24-v1-design.md` and must not contradict any accepted ADR in `docs/decisions/ADR-log.md`. Where an idea would contradict a locked ADR, it is recorded as a challenge requiring a superseding ADR, never as a committed item. This is a reference doc, not a process doc, so the four-doc cap (ADR-0012) does not apply.

---

## 1. Thesis

The dataset is already the source of truth (ADR-0001) and the pages are already built to be quoted by answer engines (v1 design 5.4). This spec takes one step further along the same line that is already locked: turn the cited dataset into a public, machine-readable, freshness-transparent artifact in its own right, so the data is citable by humans and answer engines as a unit, not only as rendered HTML. Freshness is the wedge (v1 design 1); this spec makes freshness legible to machines and visible on the page.

Everything here is engineering the founder can build with no daily manual surface, which is the only shape that survives `FOUNDER.md`.

## 2. Scope discipline (read before building)

The locked launch artifact is A0 in ADR-0015: country-level Greece, Portugal, and Spain, the three-country comparison page, the free screener, and a launch to strangers. **Nothing in this spec may delay A0.** Every keep-set item below either rides along with A0 at near-zero added cost (because the data and changelog already exist) or is an explicit fast-follow after A0 ships. If any item starts to push A0's first market contact later, it is cut until A0 is live.

## 3. Keep set (committed proposals)

These do not contradict any ADR. They extend projections the design already commits to. Each is small, automated, and reversible.

### 3.1 Public cited data endpoint

**What:** Emit the canonical dataset as a stable public JSON file per country (for example `/data/greece.json`), generated from `packages/data` at build time, alongside a `schema.org/Dataset` JSON-LD block and a machine-readable `llms.txt` entry pointing at it.
**Mechanism:** A small Astro endpoint (or static file generator) reads the same `getCollection()` path every other channel reads, serialises the `CitedValue` objects verbatim (value, sourceUrl, sourceName, verifiedDate, confidence, granularity), and writes the file. Each fact carries a stable id so it can be referenced and a copy-paste "cite this" snippet (source name, date, canonical URL) renders next to it on the page.
**Why it fits:** This is distribution as engineering: the data pulls, the founder does nothing. The citation that travels with a quoted fact is the backlink. It is the same source of truth, so it cannot drift from the pages.
**Build cost:** Low. One endpoint plus a JSON-LD component, both reading the existing collection.
**Failure mode:** Answer-engine attribution is unreliable; the mitigation is being the canonical source they ingest, not asking for credit. Stable ids add a small versioning obligation when a fact changes (handled by 3.2).

### 3.2 Public dated change feed

**What:** A public, subscribable feed (`/changes.xml` plus a JSON twin) of material cited-fact changes: what changed, old value, new value, source, date.
**Mechanism:** Derive it from the change history that already exists. `docs/content-projection.md` already stores prior values in `packages/data/changelog/[slug].json` for the newsletter `changeNote`; the same data plus git history feeds the feed. No new manual surface; it falls out of the existing refresh PR (ADR-0006).
**Why it fits:** Freshness is the moat (v1 design 1). A change feed turns a claimed property into a subscribable one, for humans and crawlers, and is the one artifact incumbents with stale undated data structurally cannot produce.
**Build cost:** Low. A generator over the existing changelog and git log.
**Failure mode:** Noisy if facts churn. Mitigation: rate-limit to material changes (a threshold on magnitude or on high-liability fields), and reuse the newsletter's existing freshness filter logic.

### 3.3 Queryable freshness signal

**What:** Expose freshness as machine-readable data and an on-page summary: each fact already carries `verifiedDate`; add an aggregate per place and per country (for example "share of facts verified in the last 90 days") to the data endpoint and a plain on-page line.
**Mechanism:** `scripts/validate.ts` already flags stale `verifiedDate`s (v1 design 11). Compute the aggregate in the same pass and write it into the dataset endpoint and the page.
**Why it fits:** Lets answer engines and readers prefer a source that reports its own freshness honestly. It is the confidence-and-staleness honesty principle (PRODUCT.md design principle 2) made queryable.
**Build cost:** Low, mostly reusing the validator.
**Failure mode:** It commits the refresh cron to being real and honest; a slipped cron is now visible. That is the intended pressure, but it is unforgiving, so the aggregate must read from real `verifiedDate`s, never an assumed cadence.

### 3.4 Dealbreaker-first page framing

**What:** Lead each place page and the comparison page with the single cited fact most likely to disqualify a given reader profile (the residency-day requirement, the income floor on the visa, a healthcare gap), not only the ranked positives.
**Mechanism:** A projection rule in `docs/content-projection.md`: for each profile preset (ADR-0016 already defines presets and deal-breaker filters), surface the binding cited constraint as a "what would rule this out" card, dated and sourced, with the fence. This is a content-projection addition, not new data and not advice: it states a published rule and routes to a professional, fully inside ADR-0008.
**Why it fits:** Most readers with money in motion have half-chosen; the real job is finding the disqualifier (the lateral provocation that opened pass one). It also strengthens the comparison page, which is the A0 centrepiece and the AI-citation surface.
**Build cost:** Low to medium. It reuses the deal-breaker filters from ADR-0016; the new part is the page slot and the per-profile selection.
**Failure mode:** Requires knowing the real disqualifiers per profile, which is editorial judgement, not generation. Keep it to the cited binding constraint; never phrase it as "you should not move here."

### 3.5 Atomic embeddable cited card (fast-follow, lower priority)

**What:** A one-line embeddable card for a single cited fact (for example the Greece flat-tax figure), each copy carrying the source, date, fence, and a canonical link home, with an image-plus-link fallback for forums that strip iframes.
**Mechanism:** An `/embed/[factId]` route rendering one card from the same dataset, plus a Satori PNG fallback (the `roughCard.ts` renderer in content-projection already does Satori cards).
**Why it fits:** The page-is-the-channel taken atomic; a fact spreads as a unit and the citation travels with it.
**Build cost:** Medium. Lower priority than 3.1 to 3.4; explicitly a fast-follow, never part of A0.
**Failure mode:** Embed reach is hard to measure and forums often strip iframes; the PNG-plus-link fallback is the hedge.

## 4. Challenges to locked decisions (not committed)

These came out of the ideation and are worth recording, but each contradicts an accepted ADR. Per the append-only ADR rule, none can be adopted without a superseding ADR and real evidence. They are logged here so they are not lost and not silently actioned.

- **Proof-not-referral monetization** (sell the cited dossier or license the dataset instead of affiliate referrals). Contradicts ADR-0007 and ADR-0015 (affiliate-first, paid tier validated only via fake-door). Do not build. If the fake-door ever shows strong paid intent, that is the trigger to draft a superseding ADR, not before.
- **Rule-page wedge** (make the first shipped artifact a single high-intent regime page, for example the Greece pensioner flat tax, rather than the three-country comparison). Contradicts ADR-0015's locked A0. This is the one strategic question worth a human call; see section 7.
- **Source-disagreement surfacing** (lead with cases where two primary sources conflict, both dated). Does not contradict an ADR but is editorial-heavy and does not scale automatically. Hold as a manual, low-volume editorial treatment for the comparison page only, not a system.

## 5. Pre-registered falsifiable test

- **Eliminate the designed page.** The honest test of the answer-engine-first thesis: would the dataset endpoint, `llms.txt`, and structured feeds earn AI citations with only the thinnest HTML, no visual design? Recorded as a falsifiable hypothesis, not a plan. It conflicts with the WCAG 2.1 AA and page-quality commitments (ADR-0011, PRODUCT.md), so it is never the live site. If A0's AI-crawler logs (v1 design analytics) show citations are driven by the structured data and not the page, that is evidence to weight design effort accordingly. Until then, the crafted page stays.

## 6. Rejected for v1 (with reason)

- **Reverse / pull sourcing** (users and professionals submit contested facts, the brand adjudicates publicly). Genuinely interesting, but moderation is a daily manual surface, which `FOUNDER.md` says will rot in this founder's hands. Rejected for v1. Only reconsider if it can be fully batched and gated, never live and open.

## 7. Open decision for the founder

One item needs a human call rather than my default: **the wedge.** ADR-0015 locks A0 as the three-country comparison plus screener. The rule-page idea (section 4) argues the sharper decision unit is a single regime, which is narrower than a country and closer to what people actually search. My recommendation is to keep A0 as locked and treat a flagship rule page (the Greece flat-tax regime) as the first deep page built on top of A0, so it tests the rule-wedge without reopening a locked decision or delaying the launch. If you want the rule page to be the launch artifact instead, that needs a superseding ADR to ADR-0015.

## 8. Sequencing

1. Ship A0 exactly as locked in ADR-0015. No item here precedes it.
2. Alongside or immediately after A0, ship 3.1 (data endpoint), 3.2 (change feed), and 3.3 (freshness signal). These three are near-zero added cost because the dataset and changelog already exist, and together they are the "freshness made machine-legible" capability.
3. Fold 3.4 (dealbreaker-first framing) into the comparison page and the place-page projection, reusing the ADR-0016 presets.
4. 3.5 (embeddable card) is a later fast-follow once there is traffic to spread.
5. Revisit section 4 challenges only against real launch evidence.

## 9. Idea ledger (every idea from both passes, with disposition)

So that "take all of those" is honoured literally: each idea from the two ideation passes is mapped to a disposition and a reason. Nothing is dropped silently.

| # | Idea (source pass) | Disposition | Reason |
|---|---|---|---|
| 1 | Dataset is canonical, page renders from it (SCAMPER Substitute / Provocation 3) | Already locked | ADR-0001, v1 design section 5 |
| 2 | schema.org + llms.txt + AEO emission (Provocation 3) | Already locked, extended by 3.1 | v1 design 5.4, content-projection positioning |
| 3 | Public cited data endpoint + stable fact ids + cite-this (SCAMPER Adapt) | Keep set 3.1 | New, low cost, distribution as engineering |
| 4 | Dated public change feed (SCAMPER Combine) | Keep set 3.2 | New, derived from existing changelog, freshness moat |
| 5 | Queryable freshness aggregate (SCAMPER Modify) | Keep set 3.3 | New, reuses validate.ts |
| 6 | Dealbreaker-first page framing (Provocation 1) | Keep set 3.4 | New, reuses ADR-0016 presets, inside the fence |
| 7 | Atomic embeddable cited card (SCAMPER Put-to-use) | Keep set 3.5, lower priority | New, but measurement-weak; fast-follow only |
| 8 | Proof-not-referral monetization (Provocation 4) | Challenge, not committed | Contradicts ADR-0007 and ADR-0015 |
| 9 | Rule-page wedge (Provocation 5) | Open decision, section 7 | Contradicts ADR-0015; needs founder call |
| 10 | Source-disagreement surfacing (Provocation 2) | Held as manual editorial only | Does not scale automatically |
| 11 | Eliminate the designed page (SCAMPER Eliminate) | Pre-registered test, section 5 | Conflicts with ADR-0011; a hypothesis, not a plan |
| 12 | Reverse / pull sourcing (SCAMPER Reverse) | Rejected for v1 | Daily manual surface, will rot per FOUNDER.md |

---

*Method note: ideas were generated by the creative-ideation skill (lateral provocations, then SCAMPER), then filtered against `FOUNDER.md`, `SHIP.md`, the v1 design, and the ADR log. The filter, not the generation, is what makes this a spec rather than a list.*
