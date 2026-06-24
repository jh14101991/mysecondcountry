# Engine scoring model

## Purpose

This document defines how Places are scored and ranked. It is the authoritative reference for the weights system, confidence handling, and explainability contract. The implementation reads from `packages/data/weights.json`; this doc defines the schema, the defaults, and the reasoning rules.

---

## Architecture decision: config-driven, not code-driven

Weights live in `packages/data/weights.json`, versioned alongside the dataset. Changing a weight is a data PR, not a code change. The engine code (`packages/engine/src/score.ts`) reads the weights at build time and at runtime in the Astro island.

This separation means:

- a non-engineer can audit or propose a weight change without touching TypeScript;
- the static build always reflects the weights in the committed file at build time;
- the Astro island loads the same `weights.json` at runtime and recomputes when the user moves a slider;
- the displayed ranking always cites which version of the weights file produced it.

The weights file is the single source of truth. There is no fallback weight logic in the engine code; if a domain is missing from the weights file, the engine throws at build time.

---

## Zod schema for weights.json

```ts
// packages/engine/src/schemas/weights.ts
import { z } from "zod";

const DomainWeightSchema = z.object({
  weight: z.number().min(0).max(1), minConfidenceToInclude: z.number().min(0).max(1).default(0.4), penaltyBelowConfidence: z.number().min(0).max(1).default(0.6), penaltyMultiplier: z.number().min(0).max(1).default(0.7), description: z.string(),
});

export const WeightsFileSchema = z.object({
  version: z.string().regex(/^\d{4}-\d{2}-\d{2}-v\d+$/), label: z.string(), domains: z.object({
    tax: DomainWeightSchema, climate: DomainWeightSchema, cost: DomainWeightSchema, connectivity: DomainWeightSchema, healthcare: DomainWeightSchema, safety: DomainWeightSchema, }), notes: z.string().optional(),
});

export type WeightsFile = z.infer<typeof WeightsFileSchema>;
```

At build time the engine validates the file against this schema and throws on failure. The sum of `weight` values across all six domains must equal 1.0 (±0.001 tolerance, checked in a separate assertion).

---

## Default weights

Domain | Default weight | Rationale
---|---|---
`cost` | 0.25 | Broad financial feasibility; data quality is generally good at country/region level
`tax` | 0.20 | High decision weight for financially independent founders; often well-sourced
`climate` | 0.20 | Quality of life driver with good public data (NOAA, Copernicus)
`healthcare` | 0.15 | Risk-weighted; hard to recover from a bad outcome
`safety` | 0.10 | Baseline threshold more than a differentiator within EU scope
`connectivity` | 0.10 | Founders need it; broadly acceptable across EU; less differentiating in v1 scope

Sum: 1.00.

These defaults are baked into the static build and shown on every ranking page. The user can override all six in the screening island; the island stores overrides in `localStorage` and recomputes without a network call.

---

## Confidence awareness

Every scored value comes from a `CitedValue` which carries a `confidence` field (0.0 to 1.0, defined in `packages/data/src/schemas/cited-value.ts`). The engine applies two confidence rules before scoring.

### Rule 1: exclusion floor

If a `CitedValue.confidence` is below `minConfidenceToInclude` for its domain (default 0.4), that domain score is excluded from the Place's total and the missing weight is redistributed proportionally across the remaining domains. The ranking card shows "tax score not available: source confidence too low" for that Place.

This prevents a scraped, unverifiable figure from silently distorting the rank. Exclusion is always surfaced visually.

### Rule 2: confidence penalty

If a `CitedValue.confidence` is at or above `minConfidenceToInclude` but below `penaltyBelowConfidence` (default 0.6), the raw domain score is multiplied by `penaltyMultiplier` (default 0.7). The ranking card shows a warning icon and "low-confidence input, score discounted" next to the domain.

The penalty and multiplier are per-domain in `weights.json`, so high-stakes domains (tax, healthcare) can be configured more conservatively than lower-stakes ones.

### Confidence band labels

These are display-only labels derived from the `confidence` field. They are not used in scoring logic.

Confidence range | Label | Badge color
---|---|---
0.85 to 1.0 | Verified | Green
0.65 to 0.84 | Good | Blue
0.40 to 0.64 | Low, discounted | Amber
Below 0.40 | Excluded | Red/strikethrough

---

## Scoring formula

For a Place `p` and a domain `d`:

```
rawScore(p, d) = normalize(p.data[d])          // 0.0-1.0 within the ranked cohort
effectiveScore(p, d) = rawScore(p, d) * confidenceFactor(p, d)

confidenceFactor(p, d):
  if confidence < minConfidenceToInclude → 0 (excluded; weight redistributed)
  if confidence < penaltyBelowConfidence → penaltyMultiplier
  else → 1.0

totalScore(p) = Σ( effectiveScore(p, d) * effectiveWeight(d) )
  where effectiveWeight redistributes excluded domains proportionally
```

Normalization is cohort-relative: the engine ranks all Places in the current filter set (e.g. "EU, country level") and min-max normalizes each domain across that set. This means scores are not absolute; they are relative to the cohort shown on the page. The ranking card says "scored within this cohort" to make that explicit.

---

## Static pages vs the screening island

Static pages use the committed `weights.json` defaults. The weights version string is embedded in the rendered HTML and shown in the ranking UI ("Ranked using weights v2026-06-24-v1").

The screening island (`packages/web/src/components/ScreeningEngine.astro`, logic in `packages/engine`) loads `weights.json` via a Vite static import, exposes one slider per domain, and recomputes `totalScore` and ranking order in the browser without a network call. The island does not modify the static page; it renders a separate interactive ranking panel.

When a user adjusts sliders the displayed label changes to "Custom weights (not saved)" and the "why this rank" panel updates inline.

---

## Example weights.json

```json
{
  "version": "2026-06-24-v1", "label": "Default: financially independent founder, EU scope", "domains": {
    "tax": {
      "weight": 0.20, "minConfidenceToInclude": 0.45, "penaltyBelowConfidence": 0.65, "penaltyMultiplier": 0.65, "description": "Personal income tax rate, capital gains treatment, non-dom regimes"
    }, "climate": {
      "weight": 0.20, "minConfidenceToInclude": 0.40, "penaltyBelowConfidence": 0.60, "penaltyMultiplier": 0.75, "description": "Annual sunshine hours, summer heat index, winter lows, air quality index"
    }, "cost": {
      "weight": 0.25, "minConfidenceToInclude": 0.40, "penaltyBelowConfidence": 0.60, "penaltyMultiplier": 0.70, "description": "Rent (2-bed), groceries index, utilities, eating out"
    }, "connectivity": {
      "weight": 0.10, "minConfidenceToInclude": 0.40, "penaltyBelowConfidence": 0.60, "penaltyMultiplier": 0.80, "description": "Median fixed broadband speed, mobile 4G/5G coverage"
    }, "healthcare": {
      "weight": 0.15, "minConfidenceToInclude": 0.45, "penaltyBelowConfidence": 0.65, "penaltyMultiplier": 0.60, "description": "EHIC/reciprocal access, private insurance cost, hospital quality index"
    }, "safety": {
      "weight": 0.10, "minConfidenceToInclude": 0.40, "penaltyBelowConfidence": 0.60, "penaltyMultiplier": 0.75, "description": "Numbeo safety index, Economist EIU crime score"
    }
  }, "notes": "v1 scope is EU countries. Town-level cost data carries lower confidence; expect amber badges on town-granularity cost scores."
}
```

---

## Example "why this rank" explanation

This is the text the engine generates per Place per ranking. It is rendered in the UI inside a collapsible "Why this rank" panel. The engine produces it as a structured object; the UI renders it.

```
Greece ranked #2 of 18 EU countries (weights v2026-06-24-v1)

Domain          Raw    Confidence   Factor   Weighted
cost            0.81   0.82 (good)  1.00     0.203
tax             0.74   0.90 (verif) 1.00     0.148
climate         0.95   0.88 (verif) 1.00     0.190
connectivity    0.62   0.72 (good)  1.00     0.062
healthcare      0.58   0.48 (low)   0.60     0.052
safety          0.71   0.77 (good)  1.00     0.071

Total score: 0.726

Notes:
- Healthcare score discounted (confidence 0.48 < threshold 0.65, multiplier 0.60).
  Source: WHO Global Health Observatory, verifiedDate 2025-03-01.
  Verify current status at: https://www.who.int/data/gho
- Cost score derived from Numbeo Greece country aggregate, verifiedDate 2026-04-15.
  Town-level Thessaloniki rent is scraped (confidence 0.44); town page shows amber badge.
- Tax score based on Greek non-dom regime flat-tax law (Law 4172/2013 as amended 2020).
  Source: KPMG Greece Individual Tax Guide 2025.
  Not tax advice. Verify with a licensed Greek tax professional.
```

The engine produces this as a `RankExplanation` object; the content projection layer (`docs/content-projection.md`) can render it into video scripts and newsletter text as well as HTML.

---

## Versioning and change process

1. Create a new version string: `YYYY-MM-DD-vN` where N increments within a day.
2. Open a data PR with the modified `weights.json`.
3. The PR description must state: which weights changed, why, and whether any existing rankings change by more than 0.05 in total score for any top-10 Place.
4. On merge the static build rebuilds all ranking pages with the new weights embedded.
5. The old version string is preserved in the `ADR-log.md` entry for the change.

Do not change weights without a data PR. Do not change weights in the engine code.

---

## What the engine does NOT do

- It does not produce a recommendation. It produces a ranked list with scores and citations. The fence language in `FENCE.md` applies to every ranking surface.
- It does not infer missing data. If a `CitedValue` is absent, the domain is excluded per Rule 1.
- It does not blend granularities silently. A country-level cost score and a town-level cost score are not averaged; the engine uses the most specific available granularity and records it in the explanation.
- It does not update weights automatically. All weight changes are human-gated via PR merge.
