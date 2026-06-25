# Regime flagship page: the first deep page after A0

**Status:** Proposal, pre-build. Builds on `docs/superpowers/specs/2026-06-24-v1-design.md` and ADR-0015. **No ADR is superseded.**
**Decision recorded (2026-06-25):** A0 (ADR-0015: three-country country data, the Greece vs Portugal vs Spain comparison, the free screener, and the launch) ships first, exactly as locked. The artifact in this spec is the **first deep content page built after A0**, not a replacement for it.
**Provenance:** distilled from the first creative-ideation pass (Edward de Bono lateral provocations) on 2026-06-25, then filtered against `FOUNDER.md`, `SHIP.md`, and the ADR log. Three of the five provocations survived the filter and compose into one artifact; two were deferred.

---

## 1. The artifact

One flagship page: the **Greece foreign-pensioner 7% flat-tax regime** page. It is a single rule, owned end to end, and it is three of the five provocations seen as one thing:

- **Provocation 5 (rule as the wedge):** the page's subject is a single regime, the narrowest high-intent decision unit, not a country or a town.
- **Provocation 1 (dealbreaker finder):** the hero is a "what would disqualify you" cited card, not a ranking.
- **Provocation 3 (machine-first corpus):** the page is emitted as a public cited dataset endpoint plus `schema.org` JSON-LD plus an `llms.txt` entry, so answer engines quote it.

Why a regime page is the sharpest first deep page: "Greece 7% pensioner flat tax requirements" is a real, high-intent, low-competition, affiliate-captured query, exactly the long-tail and AI-citation surface the strategy targets (v1 design section 10). Narrow means deep, which dodges the thin-page penalty. It is the founder's own dogfood decision. And it forces the citation-staleness machinery live on day one, which is the moat (it answers provocation 5's own failure mode).

## 2. Scope discipline (read before building)

**Nothing here precedes A0.** A0 ships first, gets in front of strangers, and senses demand. This page is the first deep page after it. The screener built in A0 stays the demand sensor and the home of the dealbreaker logic; this page reuses it, it does not fork it. If any part of this starts to pull effort back from getting A0 live, it is cut until A0 is in production.

## 3. Component breakdown

### 3.1 The regime as data (provocation 5)

**Model:** add a `regimes` content collection in `packages/data` (content-as-code, ADR-0001), one JSON object for the Greece foreign-pensioner flat-tax regime. Each factual field is a `CitedValue` (value, sourceUrl, sourceName, verifiedDate, confidence, granularity), so an uncited or undated claim cannot pass schema validation (ADR-0002). Fields: the headline rate, the regime duration, eligibility conditions (prior-non-residency rule, qualifying-country requirement, the residency-day obligation), the application window, and the known catch. The regime references its country Place by id.
**No invented numbers.** This spec names the *structure*; every value is pulled from a primary source at ingest and carries its own `verifiedDate`. Base-rate discipline (FOUNDER.md) holds: figures come from cited sources, never from this document.
**Route:** a new page route outside the `/places/...` tree (ADR-0010 is unaffected), for example `/greece/tax/foreign-pensioner-flat-tax`, rendered by an Astro page reading the collection.
**Build-time choice (flag, not a blocker):** model the regime as its own collection (recommended, cleanest) or as a structured section on the Greece country page. Pick the simpler at build; both are reversible.
**Failure mode:** the rule changes. Mitigated by 3.4 (staleness machinery live from day one).

### 3.2 The dealbreaker card (provocation 1)

**What:** the page hero is a "what would disqualify you from this regime" card, driven by the regime's own eligibility `CitedValue`s against the screener's profile presets and deal-breaker filters that already exist in ADR-0016.
**Mechanism:** for the pensioner preset, surface the binding eligibility constraints as cited, dated cards (the prior-non-residency rule, the qualifying-country requirement, the residency-day obligation), each linking to its primary source with the fence.
**Fence compliance:** this states published eligibility rules and routes to a licensed professional. It is screening, not advice, fully inside ADR-0008. It never says "you should not move here"; it says "this published rule would exclude this profile, verify with a professional."
**Why it fits:** most readers with money in motion have half-chosen; the real job is finding the disqualifier. It also inverts the value proposition away from every "rank countries" comparison site.
**Failure mode:** requires knowing the real disqualifiers (editorial judgement, not generation). Kept to the cited binding constraints only.

### 3.3 Machine-first emission (provocation 3)

**What:** emit the regime as a public cited dataset artifact from the same source of truth: a stable `/data/regimes/greece-foreign-pensioner-flat-tax.json`, a `schema.org/Dataset` (or more specific) JSON-LD block on the page, an `llms.txt` entry pointing at it, stable per-fact ids, and a copy-paste "cite this" snippet (source name, date, canonical URL) next to each fact.
**Mechanism:** an Astro endpoint reading the same `getCollection()` path the page reads, serialising the `CitedValue`s verbatim. AEO and schema were already intended (v1 design 5.4, analytics); this commits the concrete endpoint and ids.
**Why it fits:** distribution as engineering, the founder's strongest lane. The data pulls; no outreach. The citation that travels with a quoted fact is the backlink.
**Failure mode:** AI attribution is unreliable. Mitigation: be the canonical source they ingest, and measure via the AI-crawler logs already planned in `docs/analytics.md`, not by asking for credit. Keep the emission thin so it stays a layer, not a project.

### 3.4 Staleness machinery live (the moat)

`scripts/validate.ts` already flags stale `verifiedDate`s (v1 design section 11). This page is the first to depend on it in production: every regime `CitedValue` is monitored, and a stale high-liability field is a visible signal to refresh. This is the freshness wedge made real on a page where freshness genuinely matters (tax rules change yearly). It is the reason a regime page is a good forcing function, not a risk.

## 4. Deferred (not in this artifact)

- **Provocation 2, source disagreement.** Held. At three-country, country-level depth there are too few detectable contradictions to surface, and it is human-spotted editorial work that risks rotting (FOUNDER.md). Revisit once a dataset is deep enough to contain real contradictions.
- **Provocation 4, sell the proof.** Deferred as a product: it contradicts ADR-0007 and ADR-0015 (affiliate-first, paid validated only via a fake-door) and is the wrong priority pre-traffic with infinite runway. Salvage with no new build: point the already-planned Stripe fake-door (ADR-0007, content-projection week 4) at a "cited relocation snapshot dossier" framing instead of a generic "full report," and let it test willingness-to-pay for free.

## 5. Sequencing

1. Ship A0 exactly as locked in ADR-0015. Nothing here precedes it.
2. Build the regime collection and page (3.1), with the dealbreaker hero reusing the ADR-0016 presets (3.2).
3. Emit the machine-first artifact alongside it (3.3); near-zero added cost off the same source of truth.
4. The staleness monitor (3.4) is on from the page's first deploy.
5. Read the result against the AI-crawler logs and page traffic before choosing the next regime.

## 6. Open questions for build time

- Regime modelled as its own collection or as a section on the country Place (3.1 recommends the collection).
- The exact route string under `/greece/tax/...`.
- Which profile presets get a dealbreaker card on day one (pensioner is the obvious first; others demand-led).

## 7. Idea ledger (first-pass five, final disposition)

| # | Provocation | Disposition | Reason |
|---|---|---|---|
| 1 | Dealbreaker finder | In the artifact, 3.2 | Reuses ADR-0016 filters; inverts the value prop; inside the fence |
| 2 | Source disagreement | Deferred | Too few contradictions at v1 depth; editorial rot risk |
| 3 | Machine-first corpus | In the artifact, 3.3 | Distribution as engineering; near-zero cost off the dataset |
| 4 | Sell the proof | Deferred / folded | Contradicts ADR-0007 and ADR-0015; fold concept into the planned fake-door |
| 5 | Rule as the wedge | The artifact's subject, 3.1 | Sharpest high-intent unit; forces the freshness moat live; built after A0, no ADR superseded |

---

*Method note: ideas came from the creative-ideation skill (lateral provocations), then were selected with a premortem-and-inversion pass and filtered against the founder profile, the ship discipline, and the locked ADRs. The filter, not the generation, is what makes this a spec.*
