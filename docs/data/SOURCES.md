# Data source registry

Every data source backing a `CitedValue` in the dataset is registered here. The entry is the contract between the refresh pipeline and the schema: if a source is not here, it does not ship.

## How to read this file

Each entry covers: access method, exact endpoint or file URL, fields the pipeline extracts, coverage and granularity, license, refresh cadence, confidence tier, and gotchas.

Confidence tiers used throughout the codebase:
- `HIGH`: official statistical agency, automated pull, reproducible
- `MEDIUM`: secondary synthesis of primary data (PwC, OECD), or official index without absolute values
- `LOW`: asking/listing prices, crowdsourced, or a national/regional figure applied to a town

## Domain: cost and price level

### Eurostat PPP and price level indices

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset codes | `PRC_PPP_IND`, `PRC_PPP_IND_1` |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{CODE}?format=JSON&geo=EL` |
| Access | Free JSON-stat REST, no key required |
| Fields extracted | Price Level Index (EU27=100), Purchasing Power Standard conversion factor |
| Coverage | Country-level only. Greece = `EL`, one national figure. No city or region breakdown. |
| License | Eurostat reuse policy (free reuse with attribution) |
| Refresh cadence | Annual, typically published June |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | PPP is relative to EU27=100, not an absolute EUR figure. Never display as "cost of living in EUR" without conversion. `PRC_PPP_IND_1` is the newer series; check both codes exist before deprecating the old one. |

### Eurostat HICP (harmonised consumer price index)

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset codes | `prc_hicp_midx` (monthly index), `prc_hicp_manr` (annual rate of change) |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_midx?format=JSON&geo=EL&coicop=CP00` |
| Access | Free JSON-stat REST |
| Fields extracted | All-items index (2015=100), annual inflation rate |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Monthly |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | Index base year shifts periodically; always store the base year alongside the value in `CitedValue.value`. Do not blend `midx` and `manr` series in the same chart. |

### Numbeo Data API (paid fallback, city-level)

| Field | Value |
|---|---|
| Source | Numbeo |
| Endpoint | `https://www.numbeo.com/api/` (requires paid API key) |
| Access | Paid subscription; bulk HTML scraping is explicitly prohibited in ToS |
| Fields extracted | Cost of living indices, rent index, groceries index, city-level |
| Coverage | City-level (Athens, Thessaloniki present; smaller Greek towns sparse or absent) |
| License | Commercial; ToS-restricted; do not redistribute raw API response |
| Refresh cadence | Quarterly (API); underlying crowdsourced data is continuous |
| Confidence | LOW |
| Granularity in schema | `town` |
| Gotchas | Crowdsourced; sample sizes for small towns are tiny and unreliable. Always display with explicit LOW confidence badge on pages. Do NOT use for legal, financial, or tax claims. Treat as directional context only. If API key is absent at build time, omit field rather than erroring. |

---

## Domain: property and rent (Greece)

### Bank of Greece Residential Property Price Index

| Field | Value |
|---|---|
| Source | Bank of Greece |
| URL | `https://www.bankofgreece.gr/en/statistics/real-estate-market/residential-property-prices` |
| Access | CSV/Excel download from webpage; no stable REST endpoint |
| Fields extracted | Residential property price index (Greece overall, Athens, Thessaloniki, other urban, other areas) |
| Coverage | Five geographic bands: nationwide, Athens, Thessaloniki, other urban areas, other areas. Not individual towns. |
| License | Bank of Greece public statistics (attribution required) |
| Refresh cadence | Quarterly |
| Confidence | MEDIUM (index, not absolute EUR/sqm; area bands are broad) |
| Granularity in schema | `region` for Athens/Thessaloniki; `country` for the nationwide figure |
| Gotchas | Index, not EUR/sqm. You cannot say "average flat costs X EUR/sqm" from this source alone. Pair with a LOW-confidence EUR/sqm source (Spitogatos) and label both clearly. |

### data.gov.gr: apartment price index by geographical area

| Field | Value |
|---|---|
| Source | data.gov.gr |
| Dataset | `index-of-apartment-prices-by-geographical-area` |
| API | `https://data.gov.gr/api/v1/query/mindev_reep_apartment_price_index?token=YOUR_TOKEN` |
| Access | Free token required; register at data.gov.gr. Token stored in `.env` as `DATA_GOV_GR_TOKEN`. |
| Fields extracted | Apartment price index by area (Athens, Thessaloniki, other cities, other areas) |
| Coverage | Four area bands, not individual towns |
| License | Greek Open Data License v1.0 (open reuse with attribution) |
| Refresh cadence | Quarterly |
| Confidence | MEDIUM |
| Granularity in schema | `region` |
| Gotchas | Token is per-user and rate-limited; store and reuse, do not re-register on each CI run. Same index-not-absolute limitation as Bank of Greece above. |

### Spitogatos SPI and Global Property Guide (asking prices, town-level)

| Field | Value |
|---|---|
| Source | Spitogatos, Global Property Guide |
| URLs | `https://www.spitogatos.gr/`, `https://www.globalpropertyguide.com/europe/greece` |
| Access | Web scraping or manual read; no public API |
| Fields extracted | Asking EUR/sqm by neighbourhood or town |
| Coverage | Town-level and neighbourhood-level for listed properties |
| License | ToS-restricted; scraping is likely prohibited; treat as manual-read only |
| Refresh cadence | Manually, at human merge gate; do not automate |
| Confidence | LOW |
| Granularity in schema | `town` |
| Gotchas | Asking price, not transaction price. Sparse outside major cities. Subject to listing bias. Never cite as "market value." Store `sourceUrl` as the specific search/listing URL, not the homepage. Human must re-verify at each data refresh cycle; this does NOT go through the automated cron pipeline. |

---

## Domain: climate

### Köppen-Geiger v2 (GloH2O, class raster)

| Field | Value |
|---|---|
| Source | GloH2O / Köppen-Geiger v2 |
| URL | `https://www.gloh2o.org/koppen/` |
| Data format | 1 km GeoTIFF raster, climate class integer codes |
| Access | Direct download, CC BY 4.0 |
| Fields extracted | Climate class (e.g., Csa = Mediterranean hot-summer) at a given lat/lon |
| Coverage | Global, 1 km resolution |
| License | CC BY 4.0 |
| Refresh cadence | One-time dataset (v2 baseline); re-check for v3 annually |
| Confidence | HIGH |
| Granularity in schema | `town` (point sampling at place lat/lon) |
| Gotchas | Returns a CLASS label, not temperatures or rainfall values. Use WorldClim for absolute figures. Requires a one-time geospatial build step using GIS tooling (GDAL or GeoPandas) to sample the raster at each place's lat/lon coordinates. This step runs at build time and bakes into the JSON dataset; it does NOT run on every page request. Output must be stored as a CitedValue with `sourceUrl` pointing to the GloH2O dataset landing page. |

### WorldClim v2.1 (temperature and precipitation normals)

| Field | Value |
|---|---|
| Source | WorldClim |
| URL | `https://www.worldclim.org/data/worldclim21.html` |
| Data format | 1 km GeoTIFF rasters, one per climate variable per month |
| Access | Direct download, CC BY 4.0 |
| Fields extracted | Monthly mean temperature (tmin, tmax, tavg), total precipitation, per lat/lon point |
| Coverage | Global, 1 km resolution, 1970-2000 baseline normals |
| License | CC BY 4.0 |
| Refresh cadence | One-time dataset; v2.1 is current as of 2026 |
| Confidence | HIGH |
| Granularity in schema | `town` (point sampling at place lat/lon) |
| Gotchas | 1970-2000 normals: these are climate averages, not current weather. Pages must label them as "30-year climate baseline" not "current conditions." Same geospatial build step as Köppen; run them together in one script to avoid double-loading the rasters. Resolution is 1 km but Greek mountain terrain can vary sharply at sub-1 km scale; note this caveat on mountain town profiles. |

---

## Domain: air quality

### OpenAQ v3

| Field | Value |
|---|---|
| Source | OpenAQ |
| Endpoint | `https://api.openaq.org/v3/` |
| Access | Free, requires API key. Register at `openaq.org`. Key stored as `OPENAQ_API_KEY` in `.env`. |
| Fields extracted | PM2.5, PM10, NO2, O3 latest readings and annual averages; station lat/lon |
| Coverage | Station-point coverage; not all Greek towns have a nearby station. Nearest-station logic required. |
| License | CC BY 4.0 |
| Refresh cadence | Monthly via cron pipeline (pull latest 12-month average per nearest station) |
| Confidence | HIGH |
| Granularity in schema | `town` (nearest station, with distance in km stored alongside) |
| Gotchas | Stations are sparse in rural Greece; many towns will have no station within a useful radius. Set a `MAX_STATION_DISTANCE_KM` threshold (suggest 50 km) and null the field if exceeded rather than showing a misleading city average. Store `nearestStationId` and `nearestStationDistanceKm` in the CitedValue metadata. |

---

## Domain: residency, visas, and immigration

### migration.gov.gr

| Field | Value |
|---|---|
| Source | Hellenic Ministry of Migration and Asylum |
| URL | `https://migration.gov.gr/en/` |
| Access | Manual read only. No API. Primary documents are PDFs and HTML pages. |
| Fields extracted | Visa categories (Digital Nomad Visa, Golden Visa, D-visa types), income thresholds, required documents, processing times |
| Coverage | Greece only |
| License | Public government information |
| Refresh cadence | Manual, at human merge gate only. Never on automated cron. |
| Confidence | HIGH (official source) but claims go stale as legislation changes |
| Granularity in schema | `country` |
| Gotchas | No API; the site returns public HTML but content is manually maintained by the ministry and can change without notice. This source RESISTS automation by design. The human gate at PR merge is the only safe refresh path. Store the canonical primary URL and the direct PDF link as `sourceUrl`. Every residency CitedValue from this source must carry `verifiedDate` and a visible staleness warning if `verifiedDate` is more than 90 days old. LEGAL FENCE: display the standard "not legal advice; verify with a licensed immigration professional" disclaimer on every page rendering this data. UK immigration advice while unregulated is a criminal offence; if the project expands to UK visa content, route entirely to official UK government sources and do not interpret. |

---

## Domain: tax

### AADE (Greek independent authority for public revenue)

| Field | Value |
|---|---|
| Source | AADE |
| URL | `https://www.aade.gr/` |
| Access | Manual read only. AADE returns HTTP 403 to automated bots. Do not attempt programmatic scraping. The AADE incentives PDF (non-dom regime, flat-tax regime) must be downloaded manually and linked directly. |
| Fields extracted | Non-dom flat tax amount (currently EUR 100,000/year), digital nomad tax incentive terms, flat-rate pension regime |
| Coverage | Greece only |
| License | Public government information |
| Refresh cadence | Manual, at human merge gate. Annual budget cycle (October/November) is the primary risk window. |
| Confidence | MEDIUM (official source but machine-unreadable and changes with annual budget) |
| Granularity in schema | `country` |
| Gotchas | 403 to bots is deliberate. Never add AADE to the automated cron pipeline. Store the canonical PDF URL as `sourceUrl` alongside the AADE homepage. Budget changes can alter thresholds mid-year; `verifiedDate` discipline is mandatory. LEGAL FENCE: every tax CitedValue must carry the "not tax advice" disclaimer. The regime `durationYears` field in `greece-foreign-pensioner-flat-tax.json` (Article 5B, 15 tax years) is sourced to `https://www.aade.gr/sites/default/files/2025-07/Useful%20Tax%20Guide%20for%20Greeks%20abroad%20and%20Non-residents_enriched_9.7.2025.pdf`; the verbatim excerpt is pending manual human verification because AADE returns 403 to bots. |

### PwC Worldwide Tax Summaries

| Field | Value |
|---|---|
| Source | PricewaterhouseCoopers |
| URL | `https://taxsummaries.pwc.com/` |
| Access | Free web read; no API. Manual extraction per country page. |
| Fields extracted | Income tax rates (resident and non-resident), capital gains treatment, social insurance summary |
| Coverage | 150+ countries including Greece; updated annually |
| License | PwC copyright; no redistribution; cite as secondary synthesis pointing to primary AADE/official sources |
| Refresh cadence | Annual (typically January), manual at human merge gate |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | Secondary synthesis, not primary law. Always pair with a primary source citation. Do not quote PwC percentage figures as definitive; label them "as reported by PwC Worldwide Tax Summaries, [year]." |

### OECD Tax Database

| Field | Value |
|---|---|
| Source | OECD |
| URL | `https://www.oecd.org/tax/tax-policy/tax-database/` |
| API | OECD.Stat API: `https://stats.oecd.org/SDMX-JSON/data/TABLE_I7/` (statutory CIT and PIT rates) |
| Access | Free, no key required |
| Fields extracted | Top statutory personal income tax rate, social security contribution rates |
| Coverage | OECD members including Greece |
| License | OECD Terms (free reuse for non-commercial, attribution required) |
| Refresh cadence | Annual, automated cron pull acceptable |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | Statutory top rate only; does not reflect thresholds, bands, or special regimes. Use as a cross-check against PwC, not as primary evidence for any specific tax obligation claim. |

---

## Domain: healthcare

### Eurostat health statistics

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset codes | `hlth_rs_beds` (hospital beds), `hlth_rs_physd` (practising physicians), `hlth_co_disch2` (hospital discharges) |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{CODE}?format=JSON&geo=EL` |
| Access | Free JSON-stat REST |
| Fields extracted | Hospital beds per 100,000 population, physicians per 100,000, life expectancy |
| Coverage | Country-level and NUTS-2 regional where available |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` or `region` (NUTS-2) |
| Gotchas | NUTS-2 coverage for Greece is partial; many indicators are country-level only. Do not infer town-level quality from national averages. |

### WHO and OECD joint health statistics

| Field | Value |
|---|---|
| Source | WHO/OECD Health at a Glance |
| URL | `https://stats.oecd.org/Index.aspx?DataSetCode=HEALTH_STAT` |
| Access | OECD.Stat API or manual download |
| Fields extracted | Healthcare expenditure as % of GDP, EHIC/private insurance context |
| Coverage | OECD members |
| License | OECD Terms |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | Use as context framing for pages, not as individualised healthcare cost claims. |

---

## Domain: safety and crime

### Eurostat crime statistics

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset codes | `crim_off_cat` (offences by category), `crim_gen_reg` (general crime, NUTS regional) |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/crim_off_cat?format=JSON&geo=EL` |
| Access | Free JSON-stat REST |
| Fields extracted | Recorded offences per 100,000 population, by crime category |
| Coverage | Country-level via `crim_off_cat`; NUTS regional via `crim_gen_reg` where populated |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH (recorded crime, not perception) |
| Granularity in schema | `country` or `region` (NUTS) |
| Gotchas | Recorded crime is not the same as actual crime or personal safety perception. Reporting rates vary by country and crime type. Never headline a country as "safe" or "dangerous" from recorded-crime figures alone; present as a comparative index with the above caveat. |

---

## Domain: internet connectivity

### Ookla Speedtest Open Data

| Field | Value |
|---|---|
| Source | Ookla |
| URL | `https://github.com/teamookla/ookla-open-data` |
| Data format | Parquet tiles, approximately 610 m hexagonal resolution (H3 or similar), quarterly releases |
| Access | Open download from GitHub or AWS S3; attribution required |
| Fields extracted | Median fixed download speed (Mbps), median mobile download speed (Mbps), test count per tile |
| Coverage | Global; Greek coverage is good for urban areas, sparse for remote islands and mountain villages |
| License | Ookla Open Data License (open with attribution, non-commercial restriction: check current license before any commercial use) |
| Refresh cadence | Quarterly, automated cron download |
| Confidence | HIGH |
| Granularity in schema | `town` (spatial join from tile to place lat/lon) |
| Gotchas | Requires a geospatial join at build time using DuckDB-spatial or GeoPandas to match each place's lat/lon to the containing tile. This is a one-time build dependency (like Köppen/WorldClim); run all three geospatial operations together in a single script `scripts/geo-build.ts`. Tile coverage varies by quarter; store the quarter label in `verifiedDate`. Low test counts (below ~10 per tile) should drop confidence to LOW. |

---

## Domain: airports and connectivity

### OurAirports

| Field | Value |
|---|---|
| Source | OurAirports |
| URL | `https://ourairports.com/data/` (nightly CSV export) |
| Files | `airports.csv` (IATA/ICAO codes, lat/lon, type, name), `runways.csv`, `frequencies.csv` |
| Access | Direct CSV download, public domain |
| Fields extracted | Airport name, IATA code, lat/lon, airport type (large/medium/small/heliport/seaplane) |
| Coverage | Global, comprehensive |
| License | Public domain |
| Refresh cadence | Nightly automated pull in cron pipeline |
| Confidence | HIGH |
| Granularity in schema | Point (lat/lon); joined to place by nearest-airport distance calculation |
| Gotchas | v1 ships nearest-airport distance and size class only. Route richness (which airlines serve the airport, how many weekly flights to which hubs) is NOT in OurAirports. OpenFlights routes data is free but stale (last updated 2019); treat as illustrative only. A paid flights API (e.g., Cirium, FlightAware) is the path to accurate route richness; flag as a v2 upgrade in `docs/decisions/ADR-log.md`. Do not display OpenFlights route counts as current. |

---

## Domain: macro baseline (non-EU Europe)

### World Bank Open Data API v2

| Field | Value |
|---|---|
| Source | World Bank |
| Endpoint template | `https://api.worldbank.org/v2/country/{ISO2}/indicator/{INDICATOR}?format=JSON` |
| Key indicators | `NY.GDP.PCAP.CD` (GDP per capita USD), `FP.CPI.TOTL.ZG` (CPI inflation), `SP.POP.TOTL` (population) |
| Access | Free, no key required |
| Coverage | Global; used for non-EU Europe: UK (`GB`), Balkans, Switzerland (`CH`), Turkey (`TR`) |
| License | CC BY 4.0 |
| Refresh cadence | Annual (most indicators lag 1 to 2 years), automated cron pull |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | Data typically lags 18 to 24 months; check `mrv=1` (most recent value) in query params and store the actual year in `verifiedDate`, not the current year. For EU countries (including Greece), Eurostat is preferred over World Bank; use World Bank only where Eurostat has no coverage. |

---

## Shared infrastructure notes

### Eurostat REST client (packages/data)

Build one reusable client in `packages/data/src/eurostat.ts`. It must:
- accept a dataset code and a filter params object
- return typed JSON-stat, parsed into a flat array of `{geo, time, value}` records
- handle the `PRC_PPP_IND` vs `PRC_PPP_IND_1` code ambiguity by trying both codes and falling back gracefully
- expose a `fetchWithCache` wrapper that writes raw responses to `packages/data/cache/eurostat/` (gitignored) to avoid redundant API calls in local development
- throw a typed error if the response is non-200 so the cron pipeline can fail fast and the PR is never opened on bad data

### Sources that resist automation

Two sources intentionally resist automated pull and must stay on the human merge gate:

1. `aade.gr`: returns HTTP 403 to bots. Store the canonical URL and PDF link in `packages/data/src/seeds/greece/tax.ts` as a hardcoded CitedValue. The cron pipeline skips this source. A human re-reads it before each quarterly data PR and updates `verifiedDate`.
2. `migration.gov.gr`: no API, PDF-primary, changes with ministerial discretion. Same treatment as AADE above.

For both sources, `verifiedDate` older than 90 days must trigger a visible staleness banner on rendered pages (logic in the Astro layout, not the data layer).

### Geospatial build step

Köppen-Geiger, WorldClim, and Ookla Speedtest all require raster-to-point or tile-to-point spatial operations. These run once at dataset build time in `scripts/geo-build.ts` and bake results into the JSON dataset. They do NOT run on every Astro build. The script requires Python (GeoPandas) or DuckDB-spatial; document the exact dependency in `packages/data/README.md`. The geospatial build output is committed to `packages/data/src/seeds/` as part of the human-reviewed data PR.

### Granularity tension summary

Most free sources are country-level (Eurostat PPP, AADE tax, World Bank) or NUTS-region-level (Eurostat health, crime). Only Köppen-Geiger, WorldClim, Ookla, OurAirports, and OpenAQ are point-level. Property town-level data exists only via LOW-confidence asking-price sources.

The schema carries `granularity: 'country' | 'region' | 'town'` per `CitedValue`. Pages must display the granularity honestly: "national figure shown for [Town Name]" when a country-level stat is applied to a town page. Do not present a national PPP index as if it describes conditions in a specific village. This is both a data-integrity rule and a liability fence requirement; see FENCE.md.

### Confidence surface rule

Every page rendering a CitedValue with confidence `LOW` must display a visible badge or footnote. The rendering component is the single enforcement point; it must not be possible to render a LOW-confidence value without the badge. Implement this as a prop check in the Astro component, not a documentation convention.
