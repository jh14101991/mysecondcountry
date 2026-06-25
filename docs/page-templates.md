# Page templates (the family pages)

Every page in `docs/page-roadmap.md` is an instance of one of the templates below. The design
thread should design each template once; the 135 backlog pages are instances that drop into the
right one. Reference doc, not a process doc.

Three templates already exist and are live, so match their design language rather than reinventing
them. Four are new and need design.

## Family to template map

| Generation family | Template | Live? |
|---|---|---|
| tax-regime | 1. Rule page | live |
| residency-visa | 1. Rule page (visa-as-rule) | live |
| dealbreaker | 1. Rule page (dealbreaker-led mode) | live |
| freshness | 1. Rule page (change-log mode) | live |
| money-arbitrage | 1. Rule page (treaty mode) or 5. Topic page | live / new |
| comparison | 2. Comparison page | live |
| place-depth | 3. Place page | live |
| aeo-qa | 4. Question (AEO) page | new |
| cost-housing | 5. Topic / fact page | new |
| practical | 5. Topic / fact page | new |
| constraint-persona | 6. Constraint / shortlist page | new |
| decision-tools | 7. Decision tool / checklist page | new |

## The templates

### 1. Rule page  [LIVE: `/[country]/tax/[slug]`]  PRIORITY 1
One owned, cited rule: a tax regime, a visa, or a special status. This is the proven flagship and
roughly half the backlog plus 11 of the 15 build-now pages live here.
- Sections: fence above the fold; the dealbreaker hero ("what would disqualify you", cited
  eligibility cards); headline facts table (rate, duration, thresholds via CitedValueCell);
  eligibility detail; a cite-this line per fact; Dataset JSON-LD.
- The template must support three modes:
  - **Dealbreaker-led**: a standalone "what disqualifies you from X" leads with the hero (the
    dealbreaker family).
  - **Change-log**: a "what changed, old value to new value, effective date, law number" module at
    the top, with a prominent verified date and staleness banner (the freshness family, the
    highest-AEO use). This needs a clear dated old/new diff.
  - **Treaty / mechanism**: a "how X is taxed" structure for treaty pages, heavier fence.
- Affiliate: immigration lawyer, cross-border tax adviser, golden-visa firm.

### 2. Comparison page  [LIVE: `/compare/greece-portugal-spain`]
N entities side by side across cited dimensions.
- Sections: fence; the comparison grid (cited cells, confidence badges, leader flips); per-dimension
  notes; cite-this; JSON-LD.
- Add a **regime by regime** variant (7% vs IFICI vs Beckham), not only country by country.

### 3. Place page  [LIVE: `/places/[...path]`]
A country, region, or town profile.
- Sections: fence; cited cost, climate, residency, tax, healthcare, and safety tables; the
  granularity-honesty label ("national figure shown for [town]").

### 4. Question (AEO) page  [NEW]  PRIORITY 2
A page shaped as a literal high-intent question, built to be quoted by AI answer engines.
- Sections: the question as the H1; the **direct cited answer in the first sentence** (a yes or no
  plus the dated fact and source); the supporting cited detail; a "the rule" box; fence;
  FAQPage or QAPage JSON-LD.
- Design constraint: the answer is the first thing on the page and must be machine-extractable.
  Lead with the conclusion, the date, and the source.

### 5. Topic / fact page  [NEW]  PRIORITY 2
A single cited topic that is not a full regime or visa: property transfer tax, annual property tax,
healthcare access, social security, treaty mechanics.
- Sections: the topic H1; the cited fact or facts in a compact table; short context; fence;
  affiliate; related pages.
- Lighter than the Rule page (no dealbreaker hero).

### 6. Constraint / shortlist page  [NEW]
A static rendering of a screener constraint into a cited ranked shortlist ("EU residency on EUR 2k
a month", persona income-floor pages).
- Sections: the constraint stated; a ranked cited list of matching places or regimes (reuse the
  screener result components); fence; a "run the screener yourself" call to action.

### 7. Decision tool / checklist page  [NEW]
A cited checklist, set of steps, or light calculator: move-to-X checklist, documents for a visa,
the residency-day test, a citizenship clock.
- Sections: the checklist or steps anchored to cited official requirements; an optional light
  client-side calculator (no data stored, reads the static dataset); fence.

## Build order for the design thread
1. **Rule page** (extend the live one; add the dealbreaker-led, change-log, and treaty modes).
   Covers the bulk and most of the build-now tranche.
2. **Question (AEO) page** and **Topic / fact page**. New, and both are needed for the build-now
   tranche (the NHR and golden-visa questions, the UK-Portugal treaty page).
3. **Comparison page** (live; add the regime-by-regime variant).
4. **Constraint / shortlist**, **Decision tool**, and **Place page** (Place is already live).

## Shared kit (design once, reuse on every template)
These live components carry the cited-data look and must be reused so all seven templates feel like
one site:
- the fence block (`FenceBlock.astro`) on every page that carries a claim,
- the cited value cell (`CitedValueCell.astro`): value, confidence badge, source link, verified
  date, excerpt,
- the dealbreaker eligibility card (from the live regime page),
- the cite-this snippet block,
- confidence badges, the granularity-honesty label, the self-activating staleness banner,
- the per-template JSON-LD (Dataset for rules, FAQPage or QAPage for questions, Place for places).

Anything new the four new templates introduce should be added to this kit, not invented per page.
