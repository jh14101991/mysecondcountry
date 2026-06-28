# Variable matrix contract

Status: reference source of truth for place and corridor coverage. This file complements
`docs/data/variable-registry.md`, which names the full variable universe and source classes.

Purpose: make every place dossier comparable, deep, and honest. The matrix ensures Chania,
Heraklion, Valencia, Lisbon, and future places are evaluated against the same row set, while
preserving the correct granularity of each variable.

## Core rule

Every place is evaluated against the same canonical relocation variable matrix. A page may have
different coverage depth, but it must not have a different hidden standard.

National variables are correct when the rule is national. Local variables are required when the
reader's lived reality differs locally. Missing values must be explicit.

## Vocabulary

| Term | Meaning |
|---|---|
| Variable | A stable fact type, such as `top_pit_rate`, `dnv_income_floor`, `airport_type`, or `cafe_density` |
| Intended granularity | The granularity the variable naturally belongs to |
| Observed granularity | The granularity of the source actually used |
| Coverage status | Whether the value is available, inherited, proxy, unavailable, or blocked |
| Evidence bundle | The resolved matrix values and source gaps for one candidate |
| Dossier | A public page or internal page draft produced from an evidence bundle |

## Granularity classes

### National by nature

These values should normally be shared by all places in the same country:

- tax rates and special tax regimes;
- visa and residency routes;
- Schengen membership;
- citizenship timelines;
- national healthcare eligibility;
- national education indicators;
- national safety and rights indices;
- national English-proficiency or social-trust indices;
- national price-level and inflation metrics.

For example, Chania and Heraklion share Greece's national tax rules. This is correct and should
be shown as country-level data.

### Regional by nature

These values often sit above a town but below a country:

- hospital catchment and regional health capacity where sourced;
- region-level property indices;
- regional airports and transport catchment;
- NUTS regional economic or demographic data;
- regional climate or hazard bands where the source is regional;
- school district or municipality-level services when the city boundary is not the right unit.

### Local by nature

These values should differ between places when sources allow:

- airport drive time and airport type;
- ferry and rail access;
- local rental and asking-price proxies;
- hospital, pharmacy, dentist, gym, cafe, school, childcare, and service density;
- walkability and amenity density;
- beaches, bathing-water sites, hiking access, green space, tree cover, wildfire/flood risk;
- broadband or mobile speed where tile data exists;
- tourism pressure and seasonality proxies;
- local climate normals and sea-temperature access where point-sampled.

### Relational by nature

These values depend on the reader's input:

- treaty with the reader's home country;
- totalization agreement with the reader's home country;
- flight time to the reader's home hub;
- timezone overlap with the reader's clients;
- citizenship by descent for the reader's ancestry;
- pet-import route from the reader's origin country.

Relational values are not stored as fixed place facts. They are computed from cited base facts
and rendered with the same fence.

## Coverage status enum

Every evaluated matrix row should resolve to one status.

| Status | Meaning | Render behavior |
|---|---|---|
| `local` | Source is place-level or point-sampled to the place | Render as local |
| `regional` | Source covers region or catchment | Render with regional label |
| `national` | Source covers country and variable is national by nature | Render as national |
| `inherited_national` | Source covers country but variable is displayed on a lower-place page | Render "national figure shown for this place" |
| `inherited_regional` | Source covers region but displayed on town page | Render "regional figure shown" |
| `proxy` | Source is an explicit proxy, such as OSM amenity density | Render proxy label |
| `relational` | Computed from reader input and cited base facts | Render with input context |
| `unavailable` | No reliable public source found | Render "no reliable source found yet" |
| `blocked` | Source exists but cannot be used legally or technically | Render source-gap note internally, do not publish as fact |
| `deferred` | Useful but out of current slice | Internal queue only |

## Matrix categories

These categories are the operating layer over the registry's detailed variables.

### Identity and geography

Minimum fields:

- stable id;
- slug;
- country;
- parent region;
- coordinates;
- population where sourced;
- administrative unit;
- coastline, island, mountain, or inland tags where sourced.

### Money and cost

Minimum fields:

- price level index;
- inflation;
- electricity or utility price where available;
- rent or asking-price proxy;
- housing burden or property index;
- grocery and restaurant proxies when official data is unavailable;
- mortgage or transfer-cost fields for ownership corridors.

### Tax and residency

Minimum fields:

- headline personal income tax rate;
- special inbound or pension regime;
- wealth, inheritance, property, dividend, and capital-gains variables when relevant;
- DNV, passive-income, investor, or startup route variables where available;
- PR and citizenship timelines;
- Schengen membership;
- treaty and totalization hooks for relational tools.

### Climate and seasonality

Minimum fields:

- Koppen class;
- monthly high and low temperatures;
- warmest-month high;
- coldest-month low;
- precipitation;
- winter daylight;
- clear-sky proxy;
- sea temperature and swimming season for coastal places;
- wildfire, flood, seismic, and heat-risk variables where sourced.

### Travel, connectivity and work

Minimum fields:

- nearest airport;
- airport distance or drive time;
- airport type;
- ferry, rail, or major road access where relevant;
- broadband and mobile speed;
- timezone;
- transit, walkability, and EV/bike-share proxies where relevant;
- company-formation or business friction at country level.

### Health, family and schooling

Minimum fields:

- physicians per 1,000;
- hospital beds;
- hospital and pharmacy local density;
- paediatric or elder-care source where available;
- vaccination and healthcare coverage country values;
- childcare cost and enrolment;
- international school, Montessori, Waldorf, or bilingual-provision signals where sourced;
- family-leave and education indicators.

### Safety, rights and governance

Minimum fields:

- GPI or safety index;
- homicide or recorded crime where sourced;
- corruption, rule of law, government effectiveness;
- women safety and LGBTQ+ rights/acceptance variables;
- press freedom;
- political stability;
- local crime only if a reliable local source exists.

### Nature and environment

Minimum fields:

- PM2.5 or air-quality proxy;
- distance to coast;
- elevation;
- bathing-water quality for coastal places;
- green space, forest cover, tree canopy;
- protected areas and national-park access;
- hiking, climbing, surf, or outdoor proxies where sourced;
- light pollution and noise where sourced.

### Culture, community and services

Minimum fields:

- English proficiency;
- foreign-born share;
- cafe, restaurant, gym, library, museum, theatre, pool, and service-density proxies;
- builders, plumbers, electricians, vets where OSM coverage is strong enough;
- parkrun or club proxies where sourced;
- smoking, alcohol, social trust, religiosity, and cannabis status at country level where relevant.

## Coverage tiers

| Tier | Use | Minimum coverage |
|---|---|---|
| `pilot` | Early proof page, explicitly labelled in queue | 40 variables evaluated, 20 populated, 6 local/regional |
| `standard` | Normal publishable dossier | 80 variables evaluated, 35 populated, 12 local/regional |
| `flagship` | Major SEO/AEO place page | 120 variables evaluated, 55 populated, 20 local/regional |
| `comparison_ready` | Suitable for cross-place comparison | Same variable keys populated or explicitly missing across all compared places |

The `standard` tier is the default for new place pages.

## Variable row shape

Queue and bundle files should use this shape when a value is evaluated.

```json
{
  "key": "airport_drive_minutes",
  "label": "Drive time to nearest commercial airport",
  "intendedGranularity": "town",
  "observedGranularity": "town",
  "coverageStatus": "local",
  "sourceClass": "manual",
  "value": {
    "value": 22,
    "sourceName": "Manual route check",
    "sourceUrl": "https://example.com",
    "verifiedDate": "2026-06-28",
    "confidence": "low",
    "granularity": "town",
    "category": "connectivity"
  },
  "unit": "minutes",
  "sourceGapReason": null,
  "notes": "Manual route checks should be refreshed before publication."
}
```

The example source URL is illustrative only. Do not commit example values into production data.

## Publish calculation

A place dossier passes the matrix gate when:

1. Every category has at least one evaluated row.
2. Tax, visa, and residency rows are fully cited and fresh.
3. Local-by-nature rows are not silently replaced with national values.
4. National-by-nature rows are not penalised for being national.
5. Important missing rows are visible in the source-gap list.
6. Comparison pages use the same keys across every compared place, or mark missing keys.

## Source-gap reasons

Use consistent reasons so automation can aggregate them:

- `no_public_source_found`
- `source_exists_but_paywalled`
- `source_terms_block_reuse`
- `source_bot_blocked_manual_needed`
- `local_source_too_sparse`
- `official_source_only_national`
- `requires_geospatial_build`
- `requires_manual_maps_check`
- `out_of_slice`

## How this connects to the code

Current code already supports:

- `Place.variables` as a map of CitedValues;
- profile presets;
- slice-1 variable catalogue;
- cited value collection and freshness checks.

The next implementation step is not to rewrite this contract into code all at once. The next step
is to expand `packages/data/src/variables/catalog.ts` from the slice-1 catalogue toward this
contract in batches, with tests that assert every queue bundle uses known variable keys.

## Quality bar

A strong dossier can say:

- "This tax value is national because Greece has national tax law."
- "This hospital value is regional because the source is regional."
- "This cafe-density value is local and sourced from OpenStreetMap."
- "This school value is unavailable because no reliable public source was found."

That honesty is the product. It is what lets many pages share one matrix without becoming thin.
