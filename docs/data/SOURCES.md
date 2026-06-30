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

### European Commission Weekly Oil Bulletin

| Field | Value |
|---|---|
| Source | European Commission Weekly Oil Bulletin |
| URL | `https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en` |
| Access | Public source page and downloadable weekly bulletin files; manual extraction required when the current structured file link is not exposed to automated fetch |
| Fields extracted | National weekly petrol and diesel pump prices, with taxes, by fuel product |
| Coverage | EU country-level |
| License | European Commission reuse policy, attribution required |
| Refresh cadence | Weekly or before any transport-cost row is published |
| Confidence | HIGH when extracted from the official bulletin file |
| Granularity in schema | `country` |
| Gotchas | Weekly fuel prices are volatile national pump-price averages, not Crete, town, route, station, household budget, vehicle-running-cost, or future-price claims. Store product type, price date, tax inclusion, and currency in the excerpt. |

### Eurostat household energy prices

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset codes | `nrg_pc_204` (household electricity), `nrg_pc_202` (household gas) |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{CODE}?format=JSON&geo=EL&time={SEMESTER}&tax=I_TAX&currency=EUR` |
| Access | Free JSON-stat REST |
| Fields extracted | Household electricity and natural-gas prices by consumption band, including all taxes and levies, in EUR/kWh |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Biannual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | Consumption bands matter. Store the selected band in the excerpt, and do not render this as a local tariff, bill estimate, or guarantee that gas service is available in a specific town. |

### Eurostat statutory minimum wage

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset code | `earn_mw_cur` |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/earn_mw_cur?format=JSON&geo=EL&currency=EUR` |
| Access | Free JSON-stat REST |
| Fields extracted | Statutory monthly minimum wage in EUR |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Biannual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | This is a national labour-market floor, not a local salary estimate or cost-of-living score. It should not be used to infer household affordability for a town. |

### Eurostat annual net earnings

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset code | `earn_nt_net` |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/earn_nt_net?format=JSON&geo=EL&currency=EUR&estruct=NET&ecase={ECASE}` |
| Access | Free JSON-stat REST |
| Fields extracted | Annual net earnings in EUR by household and earnings case |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | Earnings case matters. Store the household/earnings case in the excerpt. Do not render as a town salary, household budget, job-market forecast, or affordability claim. |

### Eurostat housing costs as share of disposable income

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset code | `ilc_mded01` |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/ilc_mded01?format=JSON&geo=EL&hhcomp=TOTAL&rskpovth=TOTAL&unit=PC` |
| Access | Free JSON-stat REST |
| Fields extracted | Share of housing costs in disposable household income |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | This is a national household-income pressure indicator. It is not local rent-to-income, rent affordability, or a prediction of what a household will pay in a town. |

### Eurostat housing cost overburden

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset code | `tessi164` |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tessi164?format=JSON&geo=EL&tenure={TENURE}` |
| Access | Free JSON-stat REST |
| Fields extracted | Housing cost overburden rate by tenure |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | Tenure slices are not property prices. They can show national housing-cost pressure for renters or owners with mortgages, but cannot be rendered as a Crete rent, asking-price, or affordability claim. |

### Eurostat broadband price benchmarks

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset code | `isoc_pbo` |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/isoc_pbo?format=JSON&geo=EL&offer={OFFER}&unit=PPP_EUR` |
| Access | Free JSON-stat REST |
| Fields extracted | Least-expensive fixed and mobile broadband offer prices by offer type, in PPP EUR |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | Offer type matters. Store the fixed-speed or mobile-data/calls bundle in the excerpt. These are national least-expensive benchmark offers, not local provider tariffs, coverage checks, retail availability, roaming costs, or household bills. |

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

### ECB residential property price statistics

| Field | Value |
|---|---|
| Source | ECB Data Portal |
| Dataset code | `RESR` |
| Endpoint template | `https://data-api.ecb.europa.eu/service/data/RESR/A.GR._T.N._TR.TVAL.4D0.TB.N.IX?startPeriod={YEAR}&endPeriod={YEAR}` |
| Access | Free SDMX CSV API |
| Fields extracted | Greece house price index, total, whole territory, transaction value, all dwelling types, 2015=100 |
| Coverage | Country-level only |
| License | ECB data reuse terms and attribution requirements |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | This is an index, not EUR/sqm, rent, affordability, valuation, transaction forecast, or local market value. Preserve ECB observation status such as estimated values in the excerpt and notes. |

### ECB bank interest rates for housing loans

| Field | Value |
|---|---|
| Source | ECB Data Portal |
| Dataset code | `MIR` |
| Endpoint template | `https://data-api.ecb.europa.eu/service/data/MIR/M.GR.B.A2C.A.R.A.2250.EUR.P?startPeriod={YYYY-MM}&endPeriod={YYYY-MM}` |
| Access | Free SDMX CSV API |
| Fields extracted | Greece annualised agreed rate for loans to households for house purchase, pure new loans, total initial rate fixation, denominated in euro |
| Coverage | Country-level only |
| License | ECB data reuse terms and attribution requirements |
| Refresh cadence | Monthly |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | This is a national bank-interest-rate series, not a mortgage offer, APRC, household eligibility assessment, local lending quote, affordability measure, or financial advice. Keep APRC and annualised agreed rate series separate. |

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

### Indomio property market trends (asking prices, Greece)

| Field | Value |
|---|---|
| Source | Indomio |
| URL pattern | `https://www.indomio.gr/en/agora-akiniton/{AREA}/` |
| Access | Licensed provider feed or written reuse permission; public page reads may be used only for non-republished verification notes when terms allow |
| Fields extracted | Sale asking EUR/m2 and rent asking EUR/m2/month for region, prefecture, municipality, or neighbourhood rows |
| Coverage | Public listing-market trend pages where Indomio has enough listings to publish an area row |
| License | Indomio website terms and attribution requirements. Do not scrape, reproduce, or commercially reuse portal values without permission or a licensed feed |
| Refresh cadence | Licensed-feed refresh or explicit written-permission refresh before publication; do not automate scraping |
| Confidence | LOW |
| Granularity in schema | `region` or `town`, depending on the area row cited |
| Gotchas | Asking prices from a listing portal are not transaction prices, valuations, appraisals, affordability measures, mortgage advice, or predictions of what a household will pay. If no licensed feed or written reuse permission exists, mark the row `source_terms_block_reuse` as an accepted visible policy gap. Store the exact area, month, sale asking price, rent asking price, row name, and license or permission evidence in the excerpt only when reuse is permitted. |

### Property portal inventory snapshots

| Field | Value |
|---|---|
| Source | Indomio, Spitogatos, Idealista, or country-specific public listing portals |
| URL pattern | Exact search-result URL for the town, tenure, and filter used |
| Access | Licensed provider feed or written reuse permission. Public search pages are source-discovery leads only unless terms permit commercial reuse |
| Fields extracted | Active sale listings, active rental listings, long-let listings, furnished-rental share, pet-friendly rental proxy, seasonal count snapshots |
| Coverage | Town-level where portal coverage exists |
| License | Portal terms; do not scrape, reproduce, or commercially reuse counts when prohibited |
| Refresh cadence | Licensed-feed refresh before any town bundle is promoted to `data_bundle_ready`; monthly only for explicitly tracked flagship towns with terms-cleared access |
| Confidence | LOW |
| Granularity in schema | `town` |
| Gotchas | Inventory counts are listing-platform supply, not the whole housing market. Search filters change, duplicate listings exist, agencies repost units, and tourist-season listings can distort long-let availability. If no licensed feed or written reuse permission exists, mark the row `source_terms_block_reuse` as an accepted visible policy gap. Store query URL, filter set, count text, timestamp, and license or permission evidence only when reuse is permitted. |

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

### Open-Meteo Historical Weather API

| Field | Value |
|---|---|
| Source | Open-Meteo |
| URL | `https://open-meteo.com/en/docs/historical-weather-api` |
| Endpoint template | `https://archive-api.open-meteo.com/v1/archive?latitude={LAT}&longitude={LON}&start_date=1991-01-01&end_date=2020-12-31&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum&timezone=UTC` |
| Access | Free HTTP API, no key required for this usage |
| Fields extracted | Daily maximum temperature, daily minimum temperature, daily mean temperature, daily precipitation, and daily mean cloud cover; monthly and annual normals, mean diurnal range, monthly-mean temperature range, driest-month precipitation, hot-day counts, and cooling degree days derived from 1991-2020 daily values |
| Coverage | Global gridded archive/reanalysis; returned grid point may differ from requested coordinate |
| License | Open-Meteo terms and attribution requirements; underlying weather models and reanalysis sources require attribution review before commercial scaling |
| Refresh cadence | Refresh when a place coordinate changes; annual source-method review |
| Confidence | MEDIUM |
| Granularity in schema | `town` for point samples; `region` only for explicitly labelled priority-town proxy summaries |
| Gotchas | These values are derived climate normals from a gridded archive, not station observations, current weather, microclimates, heat-risk, medical risk, building cooling cost, or parcel-level conditions. Clear-sky days are a threshold proxy from daily mean cloud cover, not sunshine hours, UV exposure, beach weather, or a guarantee of blue-sky days. Hot-day counts and cooling degree days must declare their thresholds. Store the returned grid coordinate/elevation in the excerpt. Do not mix Open-Meteo-derived rows with WorldClim-derived rows in the same comparison without visible source labels. |

### NOAA/GML solar calculation method

| Field | Value |
|---|---|
| Source | NOAA Global Monitoring Laboratory Solar Calculator details |
| URL | `https://gml.noaa.gov/grad/solcalc/calcdetails.html` |
| Access | Public methodology page; calculations performed locally from latitude and date |
| Fields extracted | Sunrise/sunset-derived daylight duration for a declared date and coordinate |
| Coverage | Global mathematical calculation; NOAA notes theoretical sunrise/sunset accuracy within about one minute for locations between +/-72 degrees latitude, with observed values varying by atmospheric conditions |
| License | NOAA public information; preserve source attribution and method note |
| Refresh cadence | Recompute only when place coordinates or daylight definition changes |
| Confidence | HIGH for the astronomical calculation method; MEDIUM if rendered as a lived daylight-comfort proxy |
| Granularity in schema | `town`; `region` only for explicitly labelled priority-town range summaries |
| Gotchas | This is an astronomical calculation, not observed sunshine, cloud cover, UV, solar-energy yield, seasonal-affective-health guidance, or weather. Store the date used, atmospheric refraction assumption where relevant, and coordinate. NOAA/GML states the calculator is not actively maintained, so keep the method labelled and avoid presenting it as a live service. |

### NOAA OISST v2.1 monthly sea-surface-temperature climatology

| Field | Value |
|---|---|
| Source | NOAA Optimum Interpolation Sea Surface Temperature v2.1 |
| ERDDAP dataset | `https://comet.nefsc.noaa.gov/erddap/griddap/noaa_psl_55a2_880b_1f29.html` |
| Access | Public ERDDAP griddap CSV query |
| Fields extracted | Long-term monthly mean sea-surface temperature (`sst`) |
| Coverage | Global 0.25-degree sea-surface grid, 1991-2020 climatological monthly means; land cells are missing |
| License | NOAA data access and attribution requirements |
| Refresh cadence | Manual source and query check before publishing coastal climate rows |
| Confidence | HIGH for source grid values; MEDIUM when nearest non-land sea grid is applied as a town coastal proxy |
| Granularity in schema | `town` for nearest-sea-grid coastal proxies; `region` only for explicitly labelled priority-town summaries |
| Gotchas | OISST rows are sea-surface-temperature climatology proxies. They are not current water temperatures, beach-specific measurements, swim-safety advice, lifeguard coverage, bathing-water quality, jellyfish/current/wind conditions, or a personal comfort guarantee. Store the selected sea grid cell and distance from the town coordinate in the excerpt. |

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

### Open-Meteo Air Quality API

| Field | Value |
|---|---|
| Source | Open-Meteo |
| URL | `https://open-meteo.com/en/docs/air-quality-api` |
| Endpoint template | `https://air-quality-api.open-meteo.com/v1/air-quality?latitude={LAT}&longitude={LON}&start_date={YYYY}-01-01&end_date={YYYY}-12-31&hourly=pm2_5&timezone=UTC`; UV proxy uses the same endpoint with `hourly=uv_index`; pollen proxy uses the same endpoint with `hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen` |
| Access | Free HTTP API, no key required for this usage |
| Fields extracted | Hourly PM2.5 grid values, annual mean, optional high-percentile context; hourly UV-index grid values converted to monthly mean daily maximum UV index when TEMIS climatology is not yet sampled; selected CAMS pollen species grid values converted to days above a declared screening threshold plus monthly mean daily maxima |
| Coverage | Global gridded air-quality model/archive; returned grid point may differ from requested coordinate |
| License | Open-Meteo terms and attribution requirements; underlying model-source attribution needs review before commercial scaling |
| Refresh cadence | Annual, after the previous calendar year is available |
| Confidence | MEDIUM |
| Granularity in schema | `town` for point/grid samples; `region` only for explicitly labelled priority-town proxy summaries |
| Gotchas | This is a gridded proxy, not a regulatory monitoring-station observation, indoor-air measure, wildfire-smoke warning, personal exposure estimate, diagnosis, medical advice, TEMIS long-term UV climatology, current UV forecast, beach-safety claim, sunburn-risk advice, allergy-risk score, treatment guidance, medication guidance, street-level vegetation measure, or neighbourhood microclimate guarantee. Store the returned grid coordinate/elevation, hourly coverage count, year, species list, threshold, and aggregation method in the excerpt. Do not mix Open-Meteo PM2.5 rows with OpenAQ station rows, TEMIS UV rows, or direct Copernicus CAMS extracts without visible source labels. |

---

## Domain: bathing water

### EEA bathing-water quality map service

| Field | Value |
|---|---|
| Source | European Environment Agency |
| URL | `https://water.discomap.eea.europa.eu/arcgis/rest/services/BathingWater/BathingWater_Dyna_WM_2025/MapServer/14` |
| Access | ArcGIS REST query endpoint, no key required |
| Fields extracted | Bathing-water site name, coordinates, national profile URL, annual quality class |
| Coverage | EU and reporting-country bathing-water monitoring sites |
| License | EEA reuse with attribution; site coordinates and data supplied by member-state authorities |
| Refresh cadence | Annual bathing season update; refresh before any coastal town page goes public |
| Confidence | HIGH for listed monitored sites and EEA quality class; MEDIUM when aggregated into radius-based town proxies |
| Granularity in schema | `town` for radius joins around a sourced town point; `region` only after a region polygon join |
| Gotchas | A radius count is not a municipal beach inventory. It only says how many monitored EEA bathing-water sites fall within the chosen radius and how those sites were classified for the season. Do not infer unmonitored beach quality. |

---

## Domain: tourism pressure and seasonality

### Eurostat tourism accommodation statistics

| Field | Value |
|---|---|
| Source | Eurostat tourism database |
| URL | `https://ec.europa.eu/eurostat/web/tourism/database` |
| Dataset codes | `tour_cap_nuts2` (bed places), `tour_occ_nin2m` (monthly and annual nights spent from 2020 onwards), `demo_r_pjangrp3` (regional population denominator) |
| Access | Free JSON-stat REST and downloadable tables |
| Fields extracted | Bed places, establishments, arrivals, nights spent, monthly seasonality where tables are available, and regional population denominator for per-resident tourism-pressure ratios |
| Coverage | Country, NUTS regional, and selected local/city coverage depending on table |
| License | Eurostat reuse policy |
| Refresh cadence | Annual for capacity; monthly or annual for occupancy depending on table |
| Confidence | HIGH when a published Eurostat table covers the geography; MEDIUM when NUTS values are displayed on a town page |
| Granularity in schema | `country`, `region`, or `town` only when the source table supports that level |
| Gotchas | NUTS regional tourism pressure is not a town-specific visitor load. Always label the observed geography. Do not convert regional nights into town visitor counts unless the denominator and allocation method are cited as derived facts. When using per-resident ratios, store the tourism table, denominator table, year, NUTS code, numerator, denominator, and formula in the excerpt. |

### Eurostat short-stay accommodation through booking platforms

| Field | Value |
|---|---|
| Source | Eurostat collaborative-economy short-stay accommodation statistics |
| URL | `https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Short-stay_accommodation_offered_via_online_collaborative_economy_platforms` |
| Dataset code | `tour_ce_oaw` |
| Access | Free Eurostat tables and downloads |
| Fields extracted | Guest nights, stays, and seasonal patterns from major online platforms where published |
| Coverage | Country, NUTS 2, and NUTS 3 in published tables, not arbitrary towns |
| License | Eurostat reuse policy; underlying platform data is aggregated by Eurostat |
| Refresh cadence | Annual or quarterly depending on release |
| Confidence | MEDIUM |
| Granularity in schema | `region` unless an official city/local table is present |
| Gotchas | This is platform accommodation activity, not a full Airbnb inventory and not total tourism. It can support short-stay pressure context, but it cannot prove exact neighbourhood rental displacement. |

### ELSTAT and national tourism authority accommodation tables

| Field | Value |
|---|---|
| Source | ELSTAT or equivalent national statistical authority |
| URL | `https://www.statistics.gr/en/home/` |
| Access | Public statistical tables, manual download or scripted file pull where stable |
| Fields extracted | Accommodation establishments, bed places, arrivals, nights spent, regional unit or municipality rows where published |
| Coverage | Greece national, regional, regional-unit, and sometimes municipality-level depending on table |
| License | National statistical authority reuse terms |
| Refresh cadence | Annual |
| Confidence | HIGH for official published rows; MEDIUM when manually transformed |
| Granularity in schema | `country`, `region`, or `town` when the published geography supports it |
| Gotchas | Use the official row label and geography exactly. Do not map regional-unit values onto a town without an inherited-regional label. |

### Port authority and cruise passenger statistics

| Field | Value |
|---|---|
| Source | Hellenic Ports Association (ELIME), port authority, municipality, or national port statistics body |
| URL | `https://elime.gr/wp-content/uploads/2025/03/%CE%A4%CE%95%CE%9B%CE%99%CE%9A%CE%91-%CE%A3%CE%A4%CE%9F%CE%99%CE%A7%CE%95%CE%99%CE%91-%CE%91%CE%A6%CE%99%CE%9E%CE%95%CE%A9%CE%9D-%CE%9A%CE%A1%CE%9F%CE%A5%CE%91%CE%96%CE%99%CE%95%CE%A1%CE%91%CE%A3-2024-2023_%CE%9F%CE%A1%CE%98%CE%97-%CE%95%CE%A0%CE%91%CE%9D%CE%91%CE%9B%CE%97%CE%A8%CE%97.pdf` |
| Access | Public PDF; manual or scripted PDF-table read |
| Fields extracted | `cruise_passenger_pressure`: cruise calls and cruise passenger arrivals for Heraklion, Chania (Souda), Rethymno, and Agios Nikolaos, plus priority-port Crete summary |
| Coverage | Port-level rows; Crete parent is a declared priority-port total, not all tourism |
| License | Public authority terms |
| Refresh cadence | Annual before publication |
| Confidence | MEDIUM |
| Granularity in schema | `town` only when the port is the town port; otherwise `region` or `port` context |
| Gotchas | Cruise passengers are visits, not unique individuals, residents, overnight tourists, ferry passengers, or a full tourism-pressure measure. Chania's row is labelled Chania (Souda). A regional Crete row may sum the declared priority ports only when that scope is stated. Pair with accommodation nights when available. |

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

### European Commission EU Immigration Portal

| Field | Value |
|---|---|
| Source | European Commission, EU Immigration Portal |
| URL | `https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal_en` |
| Access | Public HTML country-route pages, manual or HTML read |
| Fields extracted | Greece long-term residence years, family-reunification conditions, EU Blue Card salary-threshold formula, route validity where stated |
| Coverage | EU country-route pages |
| License | European Commission reuse policy |
| Refresh cadence | Manual before any residency or visa row is rendered publicly; 90-day staleness for visa/residency claims |
| Confidence | HIGH for official EU portal route summaries; MEDIUM where national implementation details require a ministry cross-check |
| Granularity in schema | `country` |
| Gotchas | These are country-route summaries, not individualized eligibility checks, application instructions, legal opinions, processing guarantees, or immigration advice. Store the exact country-route page and route name in the source URL and source name. If the portal gives a formula instead of a euro amount, store the formula and do not invent a numeric threshold. |

### Hellenic Government Gazette and Migration Code PDFs

| Field | Value |
|---|---|
| Source | Hellenic Government Gazette, Ministry of Migration and Asylum law PDFs |
| URL | Exact FEK PDF or ministry-hosted Migration Code PDF |
| Access | Public PDF, manual extraction required |
| Fields extracted | Residence-permit route existence, sufficient-resources wording, startup-investment residence-permit thresholds, route type labels |
| Coverage | Greece national law |
| License | Public legal information |
| Refresh cadence | Manual before publication and whenever migration-law amendments are announced |
| Confidence | HIGH for direct legal text, MEDIUM when the row interprets absence of a fixed amount in the checked text |
| Granularity in schema | `country` |
| Gotchas | Legal text is not application advice. Do not turn a law excerpt into eligibility guidance, processing expectations, consular instructions, or a recommendation. If an amount is not stated in the exact legal source, store that as a bounded screening fact or a completed source gap, never as a guessed floor. |

### Decentralized Administration of Crete residence-permit offices

| Field | Value |
|---|---|
| Source | Decentralized Administration of Crete, Directorate of Aliens and Migration |
| URL | `https://www.apdkritis.gov.gr/el/%CE%91%CE%BB%CE%BB%CE%BF%CE%B4%CE%B1%CF%80%CE%BF%CE%B9-%CE%BA%CE%B1%CE%B9-%CE%BC%CE%B5%CF%84%CE%B1%CE%BD%CE%B1%CF%83%CF%84%CE%B5%CF%85%CF%83%CE%B7` |
| Access | Public HTML page with office names, addresses, and mapped coordinates |
| Fields extracted | Crete residence-permit office names, addresses, official mapped coordinates, and OSRM route proxies for `residence_permit_office_distance` |
| Coverage | Crete, Greece |
| License | Public government information |
| Refresh cadence | Manual before publication and whenever local office pages change |
| Confidence | MEDIUM for route proxy rows because the office evidence is official, while route time is OSRM over the OpenStreetMap road graph |
| Granularity in schema | `town` for town route proxies; `region` only for priority-town route summaries |
| Gotchas | Office-address evidence and route time are not an official service-area assignment, appointment availability, opening-hours, processing-time, eligibility, visa or residence-route qualification, application outcome, language-access, legal advice, immigration advice, or administrative advice claim. Store the official office page in the row excerpt and OSRM request URL as `sourceUrl` for route rows. |

### Hellenic Cadastre Crete office addresses

| Field | Value |
|---|---|
| Source | Hellenic Cadastre office-address pages and PDFs |
| URL | `https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1446`, `https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1656`, `https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1679`, and `https://cdn.ktimatologio.hast.gr/leitoyrgoynta_kg_ota_2024_03_29_2535eb836b.pdf` |
| Access | Public HTML pages and PDF; manual or scripted read |
| Fields extracted | Hellenic Cadastre Crete office or branch address evidence and OSRM route proxies for `land_registry_office_distance` |
| Coverage | Crete, Greece priority towns: Chania, Heraklion, Rethymno, and Agios Nikolaos |
| License | Public government information |
| Refresh cadence | Manual before publication and whenever Hellenic Cadastre office pages change |
| Confidence | MEDIUM for route proxy rows because the office evidence is official, while geocoding may be street-level and route time is OSRM over the OpenStreetMap road graph |
| Granularity in schema | `town` for town route proxies; `region` only for priority-town route summaries |
| Gotchas | Office-address evidence and route time are not an official jurisdiction assignment, service-area assignment, appointment availability, opening-hours, processing-time, title, ownership, property-rights, legal-status, land-registration outcome, property advice, legal advice, or administrative advice claim. Store the official Cadastre source and the geocoding limitation in the row excerpt. |

### European Commission Schengen visa fee notice

| Field | Value |
|---|---|
| Source | European Commission Migration and Home Affairs |
| URL | `https://home-affairs.ec.europa.eu/news/schengen-visa-fee-increased-11-june-2024-2024-06-13_en` |
| Access | Public HTML news notice |
| Fields extracted | Adult and child short-stay Schengen visa fee after the 11 June 2024 increase |
| Coverage | Schengen short-stay visa fee schedule; inherited to Schengen member-country rows |
| License | European Commission reuse policy |
| Refresh cadence | Manual before publication and whenever the Visa Code fee review cycle changes |
| Confidence | HIGH |
| Granularity in schema | `country` when attached to a Schengen member-country row |
| Gotchas | The adult fee is not the whole fee schedule. Child fees, facilitation-agreement fees, waivers, and special categories differ. This row is a fee fact only, not visa eligibility, appointment availability, admissibility, processing-time, or immigration advice. |

### Hellenic National Registry of Administrative Public Services

| Field | Value |
|---|---|
| Source | Hellenic Republic National Registry of Administrative Public Services, Mitos |
| URL | `https://en.mitos.gov.gr/` |
| Access | Public HTML service-procedure pages; `gov.gr` may bot-block direct fetches, so use the Mitos procedure page when it is the official public-service registry mirror |
| Fields extracted | Naturalisation exam procedure, naturalisation residence-duration cases, application prerequisites, fees, digital provision point, loss of Greek citizenship due to acquisition of foreign citizenship, and linked legislation |
| Coverage | Greece administrative procedures |
| License | Site page states Creative Commons BY-SA 4.0 on procedure pages; preserve attribution and link to the exact page |
| Refresh cadence | Manual before any citizenship or naturalisation row is rendered publicly; 90-day staleness for high-liability citizenship/residency-adjacent rows |
| Confidence | HIGH for the published administrative-procedure fact; MEDIUM when a yes/no screening row is inferred from an official loss or renunciation procedure rather than stated directly |
| Granularity in schema | `country` |
| Gotchas | A procedure page confirms that a public procedure exists and what the service page says. It is not proof that a reader qualifies for citizenship, will pass an exam, meets residence conditions, can retain citizenship, will lose citizenship, or should apply. Use `source_bot_blocked_manual_needed` if `gov.gr` is the only available page and Mitos does not expose the same procedure. |

### Henley Passport Index

| Field | Value |
|---|---|
| Source | Henley Passport Index |
| URL | `https://www.henleyglobal.com/passport-index/ranking`; API endpoint observed at `https://api.henleypassportindex.com/api/v3/countries` |
| Access | Public ranking page with JSON API used by the page |
| Fields extracted | Passport rank and visa-free destination count by issuing country and year |
| Coverage | Country passport-level |
| License | Henley terms; cite summary values only, do not redistribute full API payloads or visa lists |
| Refresh cadence | Manual before passport-strength rows are published; quarterly check if displayed publicly |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | Passport strength is not a visa decision, border-entry entitlement, right-to-work claim, or travel advice. Use the current year from the API and store the year in the excerpt. |

---

## Domain: tax

### AADE (Greek independent authority for public revenue)

| Field | Value |
|---|---|
| Source | AADE |
| URL | `https://www.aade.gr/` |
| Access | Manual read only. AADE returns HTTP 403 to automated bots. Do not attempt programmatic scraping. The AADE incentives PDF (non-dom regime, flat-tax regime) must be downloaded manually and linked directly. |
| Fields extracted | Non-dom flat tax amount (currently EUR 100,000/year), digital nomad tax incentive terms, flat-rate pension regime, tax-residence-transfer procedure status, income-category and capital-gains category screening status, and published DOU office pages/addresses for `tax_office_distance` route proxies |
| Coverage | Greece only |
| License | Public government information |
| Refresh cadence | Manual, at human merge gate. Annual budget cycle (October/November) is the primary risk window. |
| Confidence | MEDIUM (official source but machine-unreadable and changes with annual budget) |
| Granularity in schema | `country` for national tax-rule rows; `town` for exact DOU office-address route proxies; `region` only for priority-town route summaries |
| Gotchas | 403 to bots is deliberate. Never add AADE to the automated cron pipeline. Store the canonical PDF URL or exact page URL as `sourceUrl` alongside the AADE homepage. Budget changes can alter thresholds mid-year; `verifiedDate` discipline is mandatory. LEGAL FENCE: every tax CitedValue must carry the "not tax advice" disclaimer. When AADE pages are used for `exit_tax` or `crypto_tax`, the row may report only the checked official screening status, for example that a transfer-tax-residence procedure exists or that an income-categories page does not publish crypto-specific treatment. Do not turn that into a claim that all exit-tax exposure is impossible, that crypto gains are tax-free, or that a reader's transaction has a particular tax result. When AADE DOU pages are used for `tax_office_distance`, they provide the office and address only; the route value comes from OSRM over the OpenStreetMap road graph. Do not present it as an official jurisdiction assignment, appointment, opening-hours, processing-time, eligibility, tax-residency determination, tax obligation, or advice claim. The regime `durationYears` field in `greece-foreign-pensioner-flat-tax.json` (Article 5B, 15 tax years) is sourced to `https://www.aade.gr/sites/default/files/2025-07/Useful%20Tax%20Guide%20for%20Greeks%20abroad%20and%20Non-residents_enriched_9.7.2025.pdf`; the verbatim excerpt is pending manual human verification because AADE returns 403 to bots. |

### PwC Worldwide Tax Summaries

| Field | Value |
|---|---|
| Source | PricewaterhouseCoopers |
| URL | `https://taxsummaries.pwc.com/` |
| Access | Free web read; no API. Manual extraction per country page. |
| Fields extracted | Income tax rates (resident and non-resident), capital gains treatment, social insurance summary, investment-income withholding rates, rental-income bands, foreign-tax relief method, pensioner regime summary, inheritance/gift tax bands, property-transfer tax, recurrent property-tax context, and filing mechanics |
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

### OECD Taxing Wages

| Field | Value |
|---|---|
| Source | OECD |
| URL | `https://www.oecd.org/en/publications/2026/04/taxing-wages-2026_d1f39986/full-report/overview_d93131c3.html` |
| Access | Public OECD report tables; Data Explorer API may be bot-blocked and should be treated as manual unless a stable endpoint is confirmed |
| Fields extracted | Average tax wedge for a single worker at average wage, no child, by country and year; state/local income-tax presence or absence where the country chapter explicitly states it |
| Coverage | OECD country-level |
| License | OECD terms, attribution required |
| Refresh cadence | Annual, manual extraction before public display |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | Tax wedge is a labour-cost average, not a household tax bill, not a salary-netting calculator, and not a local tax measure. State/local income-tax text is only a national tax-context row; it is not evidence for municipal property duties, local service fees, tax residence, withholding, business taxes, or individual tax calculations. Store worker case and year, or the state/local income-tax statement, in the excerpt. |

---

## Domain: healthcare

### Eurostat health statistics

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset codes | `hlth_rs_bds1` (hospital beds by function and care type), `hlth_rs_bdltc` (long-term-care facility beds), `hlth_rs_physcat` (physicians by category), `hlth_rs_physd` (practising physicians), `hlth_co_disch2` (hospital discharges), `hlth_rs_prs2` (health personnel by speciality and workforce status) |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{CODE}?format=JSON&geo=EL` |
| Access | Free JSON-stat REST |
| Fields extracted | Hospital beds per 100,000 population, long-term-care beds per 100,000, physicians by category per 100,000, practising physicians per 100,000, life expectancy, dentists and pharmacists per 100,000 where the workforce-status slice is populated |
| Coverage | Country-level and NUTS-2 regional where available |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` or `region` (NUTS-2) |
| Gotchas | NUTS-2 coverage for Greece is partial; many indicators are country-level only. Health-personnel workforce status and physician speciality definitions differ by profession and country. Store the exact dataset, unit, workforce-status or speciality slice, and conversion when a row is displayed in a different unit. Do not infer town-level access from national averages. |

### WHO and OECD joint health statistics

| Field | Value |
|---|---|
| Source | WHO/OECD Health at a Glance |
| URL | `https://www.oecd.org/en/publications/health-at-a-glance-2025_15a55280-en/greece_8b1399f8-en.html`; long-term-care quality StatLink `https://stat.link/caw4ir` |
| Access | OECD.Stat API where reachable, StatLink workbook downloads, or manual read of the published OECD country profile when the API is bot-blocked |
| Fields extracted | Healthcare coverage, healthcare expenditure as % of GDP, EHIC/private insurance context, long-term-care healthcare-associated infections per 100 residents |
| Coverage | OECD members |
| License | OECD Terms |
| Refresh cadence | Annual |
| Confidence | HIGH for direct country-profile coverage wording, MEDIUM for StatLink quality indicators compiled from ECDC/OECD secondary tables |
| Granularity in schema | `country` |
| Gotchas | OECD country coverage rows are national health-system context. Long-term-care quality StatLinks are indicator rows, not a full elder-care quality score. They are not local eligibility decisions, EHIC guidance, provider-access guarantees, waiting-time measures, insurance advice, facility ratings, care-access guidance, or personal medical advice. Store the country profile year, figure number, source table, and exact coverage wording or table value. |

### World Bank WDI health indicators

| Field | Value |
|---|---|
| Source | World Bank Open Data |
| Indicator codes | `SP.DYN.LE00.IN` (life expectancy at birth), `SP.DYN.IMRT.IN` (infant mortality), `SH.XPD.OOPC.CH.ZS` (out-of-pocket expenditure share), `SH.IMM.IDPT` (DPT immunization coverage) |
| Endpoint template | `https://api.worldbank.org/v2/country/GR/indicator/{INDICATOR}?format=json&per_page=100` |
| Access | Free JSON API, no key required |
| Fields extracted | Latest non-null country value and observation year for national health context rows |
| Coverage | Country-level only |
| License | World Bank Open Data Terms of Use, attribution required |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | These are national Greece context rows. They must not be rendered as Crete, town, hospital-quality, maternity-care, insurance-eligibility, vaccine-availability, or personal health predictions. World Bank measles immunization is not the same as MMR coverage; do not use it for `vaccination_mmr` unless the variable contract changes. |

### WHO/UNICEF immunization coverage export

| Field | Value |
|---|---|
| Source | WHO Immunization Data portal, WHO/UNICEF Estimates of National Immunization Coverage |
| File URL | `https://srhdpeuwpubsa-geecgzbpd5h0fueu.z01.azurefd.net/whdh/WIISE/export/coverage-data.xlsx` |
| Access | Public XLSX export from the WHO Immunization Data portal |
| Fields extracted | Latest non-null WUENIC country row for `MCV2`, measles-containing vaccine second dose |
| Coverage | Country-level immunization coverage estimates |
| License | WHO data reuse terms, attribution required |
| Refresh cadence | Annual, after WUENIC update |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | `MCV2` is measles-containing second-dose coverage. It is acceptable for the `vaccination_mmr` context row only when labelled as measles-containing coverage and not as local MMR availability, paediatric access, individual vaccine access, or personal medical advice. |

### Fertility Europe treatment-policy atlas

| Field | Value |
|---|---|
| Source | Fertility Europe, European Atlas of Fertility Treatment Policies |
| Page URL | `https://fertilityeurope.eu/atlas/` |
| PDF URL | `https://fertilityeurope.eu/wp-content/uploads/2025/06/FERTIL-Atlas_EN-2021-v10.pdf` |
| Access | Public PDF, manual or PDF-text read |
| Fields extracted | Country IVF/ART treatment-policy score for `ivf_access` |
| Coverage | Country-level Europe policy comparison |
| License | Fertility Europe publication terms, attribution required |
| Refresh cadence | Manual check before publication because the available PDF may lag the current policy environment |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | This is treatment-policy context, not a clinic inventory, eligibility decision, treatment availability, cost quote, success-rate measure, waiting-time claim, medical advice, or personal suitability screen. The currently sourced PDF is the 2021 atlas; do not label it as 2024 unless a newer official edition is verified. |

### Hospital registry and emergency-care point sources

| Field | Value |
|---|---|
| Source | National health ministry registry, regional health authority, hospital website, or OSM emergency-care tags |
| URL | Country-specific official registry URL plus the specific hospital page when used |
| Access | Manual read for official registries; OSM/Overpass for proxy rows |
| Fields extracted | Hospital name, emergency department signal, public/private operator, clinic type, ambulance station point where available |
| Coverage | Facility point-level where a registry or mapped object exists |
| License | Official public information or OSM ODbL |
| Refresh cadence | Before any town bundle is promoted to `data_bundle_ready`; annual for flagship towns |
| Confidence | HIGH when an official registry confirms the facility and service; MEDIUM for OSM hospital/clinic proxies; LOW for emergency tags without manual confirmation |
| Granularity in schema | `town` for facility-to-place distance rows; `region` when the facility serves a wider catchment |
| Gotchas | A mapped hospital point is not proof of emergency coverage, appointment availability, language access, insurance eligibility, clinical quality, waiting times, or personal medical suitability. Render as access geography, not healthcare advice. |

### Crete duty-pharmacy rota pages

| Field | Value |
|---|---|
| Source | Federation of Pharmacists' Associations of Crete plus local duty-pharmacy rota pages |
| URLs | `https://fskriti.gr/%CE%B5%CF%86%CE%B7%CE%BC%CE%B5%CF%81%CE%AF%CE%B5%CF%82/`, `https://chania.efhmeries.gr/`, `https://herakleion.efhmeries.gr/`, `https://rethymno.efhmeries.gr/`, `https://lasithi.efhmeries.gr/` |
| Access | Public web pages; manual or controlled official crawl read. Do not scrape live rota contents as service availability. |
| Fields extracted | Existence of a public duty-pharmacy rota page for the local area, date-selector signal, sector-selector signal where present, local rota API link signal |
| Coverage | Chania, Heraklion, Rethymno named local rota pages; Lasithi regional rota page used as Agios Nikolaos regional context; Crete parent row summarizes priority-town source coverage |
| License | Public website attribution; ingest facts, not page expression or full schedules |
| Refresh cadence | Before any town bundle is promoted to `data_bundle_ready`, and close to publication because duty rosters change daily |
| Confidence | MEDIUM for rota-page availability; not a claim about current opening status |
| Granularity in schema | `town` for named local pages, `region` for Lasithi and the Crete parent summary |
| Gotchas | This is a public rota-page availability signal for `after_hours_pharmacy_proxy`, not proof that a specific pharmacy is open, not a 24/7 pharmacy-density measure, emergency-care guarantee, stock or prescription availability, language-access claim, insurance claim, ambulance claim, clinical-access claim, or medical advice. Dynamic duty schedules must be refreshed close to publication. |

---

## Domain: family and schooling

### Eurostat formal childcare participation

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset code | `ilc_caindformal` |
| Endpoint template | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/ilc_caindformal?format=JSON&geo=EL&age=Y_LT3&unit=PC` |
| Access | Free JSON-stat REST |
| Fields extracted | Percentage of children under 3 in formal childcare by weekly duration band |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | The `ecec_enrolment_under3` row is derived as non-zero formal childcare participation: `H1-29` plus `H_GE30`. It is not a childcare-price, place-count, waitlist, nursery-quality, or town-availability measure. |

### OECD Family Database childcare support

| Field | Value |
|---|---|
| Source | OECD Family Database |
| Report URL | `https://webfs.oecd.org/els-com/Family_Database/PF3-4-Childcare-support.pdf` |
| Access | Public OECD PDF, manual or PDF-text read. OECD SDMX/Data Explorer endpoints may return bot-protection 403 and should not be treated as source rot when the public PDF is available. |
| Fields extracted | Net childcare-cost context for `childcare_cost` and `childcare_net_cost`, using the model household stated by the OECD table or chart. |
| Coverage | Country-level family-policy context |
| License | OECD terms and attribution requirements |
| Refresh cadence | Annual manual check before publication, and whenever OECD updates PF3.4 or its net childcare-cost indicator. |
| Confidence | MEDIUM when the source gives a bounded country statement rather than a precise extracted table cell |
| Granularity in schema | `country` |
| Gotchas | This is model-household childcare-cost context, not a local nursery price, place count, waitlist, subsidy eligibility decision, household budget, childcare availability, or family-specific affordability advice. Store the household assumptions, year, and bound or value in the excerpt. |

### OECD PISA 2022

| Field | Value |
|---|---|
| Source | OECD Programme for International Student Assessment |
| Report URL | `https://www.oecd.org/content/dam/oecd/en/publications/reports/2023/12/pisa-2022-results-volume-i_76772a36/53f23881-en.pdf` |
| Access | Public OECD PDF report and PISA database tables |
| Fields extracted | Country mean performance in mathematics, reading, and science |
| Coverage | Country-level education assessment results for 15-year-old students |
| License | OECD terms and attribution requirements |
| Refresh cadence | Each PISA cycle, with manual source check before publication |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | PISA country mean scores are national education-system indicators. They are not Crete, town, individual school, classroom, language-provision, international-school, or child-specific education-quality measures. |

### QS World University Rankings

| Field | Value |
|---|---|
| Source | QS Top Universities |
| URL | `https://www.topuniversities.com/world-university-rankings` |
| Access | Public website, but bot protection may require manual browser verification |
| Fields extracted | Highest-ranked country university and rank for `top_university_qs` |
| Coverage | Country-level higher-education context when filtered or manually read by country |
| License | QS website terms, attribution required |
| Refresh cadence | Annual ranking release, manual check before publication |
| Confidence | HIGH when manually read from the official ranking page; BLOCKED when the official site is bot-blocked |
| Granularity in schema | `country` |
| Gotchas | This is national higher-education visibility, not a Crete university-access, school-quality, child-outcome, admissions, tuition, language-provision, or local education-services measure. If the official QS page returns bot protection, use `source_bot_blocked_manual_needed`; do not substitute unauthorised mirrors. |

### World Bank / UNESCO pupil-teacher ratios

| Field | Value |
|---|---|
| Source | World Bank Open Data, UNESCO Institute for Statistics series |
| Indicator codes | `SE.PRM.ENRL.TC.ZS` (primary), `SE.SEC.ENRL.TC.ZS` (secondary) |
| Endpoint template | `https://api.worldbank.org/v2/country/GR/indicator/{INDICATOR}?format=json&per_page=100` |
| Access | Free JSON API, no key required |
| Fields extracted | Latest non-null national pupil-teacher ratio by school level |
| Coverage | Country-level only |
| License | World Bank Open Data Terms of Use, attribution required |
| Refresh cadence | Annual check, with source-year stored because some countries lag by many years |
| Confidence | HIGH for the published national value, MEDIUM for current-year interpretation when the latest source year is old |
| Granularity in schema | `country` |
| Gotchas | Pupil-teacher ratios are national education-system context, not local class size, admissions probability, school quality, teacher availability, or child-specific education advice. Store the source year in the excerpt and do not imply current classroom conditions when the latest value is old. |

### Greece inclusive education and private international school profile

| Field | Value |
|---|---|
| Source | European Agency for Special Needs and Inclusive Education |
| URL | `https://www.european-agency.org/country-information/greece/overview-inclusive-education-system` |
| Access | Public HTML country profile, manual or HTML read |
| Fields extracted | Special-needs inclusion policy context, home-education health exception, and private international school count |
| Coverage | Greece country-level education-system profile |
| License | European Agency website terms and attribution requirements |
| Refresh cadence | Annual manual check before publication, and before any family or schooling row is promoted to page copy |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | These are national education-system context rows. They are not Crete, town, individual-school, admission, tuition, placement, child-support, home-schooling eligibility, disability-accommodation, or legal advice. Route readers to official Greek education authorities or schools for individual decisions. |

### European Schools accredited locations and Heraklion school site

| Field | Value |
|---|---|
| Source | European Schools and School of European Education Heraklion |
| URL | `https://www.eursc.eu/en/accredited-european-schools/locations/heraklion/`, `https://seeh.eu/en/` |
| Access | Public HTML pages |
| Fields extracted | Accredited European School identity, address, education-level scope, and OSRM route proxies for `international_school_distance` |
| Coverage | Crete, Greece, for the identified accredited European School in Heraklion |
| License | European Schools and school website terms, attribution required |
| Refresh cadence | Annual manual check before publication, and before any town family-schooling section promotes the row from source evidence to page copy |
| Confidence | MEDIUM |
| Granularity in schema | `town` for town route proxies; `region` only for priority-town route summaries |
| Gotchas | This is an access proxy to the identified European Schools-accredited school in Crete, not a complete international-school inventory, admission availability, tuition, curriculum fit, grade placement, special-education provision, school-bus service, commute guarantee, childcare availability, or education advice. Private bilingual, language, tutoring, nursery, or non-accredited schools are not included unless separately sourced. |

### Selected European Schools-accredited public-school tuition

| Field | Value |
|---|---|
| Source | School of European Education Heraklion enrolment page |
| URL | `https://seeh.eu/en/the-school/activities?catid=9&id=162%3Asec-enrol&view=article` |
| Access | Public HTML page, manual or HTML read |
| Fields extracted | Selected-school tuition proxy for `intl_school_tuition`, using the statement that no fees apply because the school is a Greek public school |
| Coverage | Crete, Greece, for the identified European Schools-accredited public school in Heraklion |
| License | School website terms and attribution requirements |
| Refresh cadence | Annual manual check before publication, and before any town family-schooling section promotes the row from source evidence to page copy |
| Confidence | MEDIUM |
| Granularity in schema | `region` proxy reused for priority Crete towns |
| Gotchas | This is a selected-school tuition proxy, not a median of all private international-school tuition in the town, admission availability, grade-placement certainty, school-bus, meals, uniform, trips, exam-fee, support-service cost, or education advice. Private bilingual, language, tutoring, nursery, or non-accredited schools are not priced unless separately sourced and terms-cleared. |

### Eurydice language-teaching policy reports

| Field | Value |
|---|---|
| Source | European Commission / EACEA / Eurydice |
| URL | `https://eurydice.eacea.ec.europa.eu/publications/key-data-teaching-languages-school-europe-2023-edition` |
| Access | Public report page, official EU Publications Office PDF where reachable, and public annex workbook |
| Fields extracted | Country-level CLIL provision and language-teaching policy context |
| Coverage | European education systems at country or education-system level |
| License | European Commission reuse terms, attribution required |
| Refresh cadence | On each Eurydice language-report release, or before publishing a schooling-language claim |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | CLIL rows are top-level steering-document context, not international-school programmes, bilingual nursery availability, individual school language offer, immersion quality, admissions, or child-specific education advice. Store report edition, reference school year, and ISCED scope in the excerpt. |

### Montessori and Waldorf country-presence directories

| Field | Value |
|---|---|
| Source | Association Montessori Internationale, Friends of Waldorf Education, and SteinerWaldorf.World |
| URL | `https://montessori-ami.org/countries/greece`, `https://montessori-ami.org/training-programmes/centres/montessori-institute-greece`, `https://www.freunde-waldorf.de/en/waldorf-worldwide/organisations-worldwide/europe/greece/`, `https://www.steinerwaldorf.world/poi/trianemi-kindergarden-and-primary-school` |
| Access | Public HTML directory pages, manual read |
| Fields extracted | Country-level presence of AMI Montessori training organisation and Waldorf/Steiner education institutions |
| Coverage | Country-level presence, with individual Athens institution points where listed |
| License | Directory website terms and attribution requirements |
| Refresh cadence | Annual manual check before publication, and before any local family-schooling section uses the row |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | Presence rows are not Crete, town, local school availability, admissions, curriculum-quality, accreditation, age-range, tuition, waitlist, or child-specific suitability claims. Do not count a training centre as a local school place. |

### OECD Family Database parental leave systems

| Field | Value |
|---|---|
| Source | OECD Family Database |
| Report URL | `https://webfs.oecd.org/els-com/Family_Database/PF2_1_Parental_leave_systems.pdf` |
| Access | Public OECD PDF, manual or PDF-text read |
| Fields extracted | Paid maternity leave duration and paid parental/home-care leave duration available to mothers |
| Coverage | Country-level family-policy entitlements |
| License | OECD terms and attribution requirements |
| Refresh cadence | Annual manual check before publication |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | These are national policy-entitlement rows. They are not employer-specific leave availability, individual eligibility confirmation, household-income advice, childcare availability, or local family-service measures. Keep duration, average payment rate, and full-rate equivalent separate; do not substitute total paid leave for maternity or parental leave. |

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

### World Bank WDI homicide indicator

| Field | Value |
|---|---|
| Source | World Bank Open Data |
| Indicator code | `VC.IHR.PSRC.P5` |
| Endpoint template | `https://api.worldbank.org/v2/country/GR/indicator/VC.IHR.PSRC.P5?format=json&per_page=100` |
| Access | Free JSON API, no key required |
| Fields extracted | Latest non-null intentional homicides per 100,000 people |
| Coverage | Country-level only |
| License | World Bank Open Data Terms of Use, attribution required |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | This is a national recorded homicide rate, not a town, neighbourhood, or personal safety prediction. It must not be used alone to claim a place is safe or unsafe. |

### Transparency International Corruption Perceptions Index

| Field | Value |
|---|---|
| Source | Transparency International |
| URL | `https://www.transparency.org/en/countries/greece` |
| Access | Public country profile page, manual or HTML read |
| Fields extracted | Country CPI score and rank |
| Coverage | Country-level only |
| License | Transparency International website terms and attribution requirements |
| Refresh cadence | Annual CPI release, manual check before publication |
| Confidence | HIGH for the published country score; MEDIUM for interpretation |
| Granularity in schema | `country` |
| Gotchas | CPI is a perception index for public-sector corruption. It is not a local corruption measure, legal-risk assessment, public-service outcome, or personal safety claim. |

### World Bank Worldwide Governance Indicators

| Field | Value |
|---|---|
| Source | World Bank Worldwide Governance Indicators |
| URL | `https://www.worldbank.org/en/publication/worldwide-governance-indicators` |
| Dataset file | `https://www.worldbank.org/content/dam/sites/govindicators/doc/wgidataset.xlsx` |
| Access | Public XLSX workbook from the World Bank WGI publication page |
| Fields extracted | Country percentile ranks for Political Stability and Absence of Violence/Terrorism, Government Effectiveness, and Rule of Law |
| Coverage | Country-level only |
| License | World Bank data terms and attribution requirements |
| Refresh cadence | Annual source check when the WGI workbook updates |
| Confidence | HIGH for the published percentile rank; MEDIUM for interpretation |
| Granularity in schema | `country` |
| Gotchas | WGI values are perception-based governance indicators with uncertainty intervals. They must not be rendered as Crete, town, neighbourhood, public-service-outcome, police-response, court-outcome, protest-risk, terrorism-risk, or personal safety predictions. Store the observation year, percentile rank, estimate, source count, and confidence interval in the excerpt. |

### ILGA-Europe Rainbow Map

| Field | Value |
|---|---|
| Source | ILGA-Europe Rainbow Map |
| URL | `https://www.ilga-europe.org/report/rainbow-map-2026/` |
| Access | Public country ranking and report page, manual or HTML read |
| Fields extracted | Country legal and policy score and rank |
| Coverage | Country-level legal and policy index |
| License | ILGA-Europe website terms and attribution requirements |
| Refresh cadence | Annual Rainbow Map release, manual check before publication |
| Confidence | HIGH for the published country score; MEDIUM for interpretation |
| Granularity in schema | `country` |
| Gotchas | This is a national legal and policy score. It is not a Crete, town, neighbourhood, social-acceptance, discrimination-risk, community-presence, or personal safety measure. Do not use it for `lgbt_social` or `lgbt_combined`. |

### Equaldex Equality Index

| Field | Value |
|---|---|
| Source | Equaldex Equality Index |
| URL | `https://www.equaldex.com/equality-index` |
| API URL | `https://www.equaldex.com/api/equality-index?format=json` |
| Access | Public JSON API, manual pull |
| Fields extracted | Country Equality Index score, Public Opinion Index score, legal index score, and rank |
| Coverage | Country-level index only |
| License | Equaldex website and API terms and attribution requirements |
| Refresh cadence | Manual check before publication and whenever Equaldex refreshes country scores |
| Confidence | HIGH for the published index values; MEDIUM for interpretation |
| Granularity in schema | `country` |
| Gotchas | Equaldex rows are national index context. They are not Crete, town, neighbourhood, community-presence, discrimination-risk, service-access, or personal safety measures. Do not use `ei_legal` to overwrite the separate ILGA-Europe legal-rights row. |

### Georgetown Women, Peace and Security Index

| Field | Value |
|---|---|
| Source | Georgetown Institute for Women, Peace and Security |
| Report URL | `https://giwps.georgetown.edu/wp-content/uploads/2025/10/WPS-Index-2025-Report.pdf` |
| Access | Public PDF report, manual or PDF-text read |
| Fields extracted | Country WPS index score and rank |
| Coverage | Country-level composite index across inclusion, justice, and security |
| License | Georgetown GIWPS report terms and attribution requirements |
| Refresh cadence | Biennial WPS Index release; manual check before publication |
| Confidence | HIGH for the published country score; MEDIUM for interpretation |
| Granularity in schema | `country` |
| Gotchas | This is a national composite index. It must not be rendered as Crete, town, neighbourhood, gender-based-violence, discrimination-risk, service-access, or personal safety evidence. Store the index year, country rank, score, and score range in the excerpt. |

### Reporters Without Borders World Press Freedom Index

| Field | Value |
|---|---|
| Source | Reporters Without Borders |
| URL | `https://rsf.org/en/country/greece` |
| Access | Public country profile page, manual or HTML read |
| Fields extracted | Country score and rank in the World Press Freedom Index |
| Coverage | Country-level only |
| License | Reporters Without Borders website terms and attribution requirements |
| Refresh cadence | Annual index release, manual check before publication |
| Confidence | HIGH for the published country score; MEDIUM for interpretation |
| Granularity in schema | `country` |
| Gotchas | This is a national press-freedom index. It is not a town-level media environment, personal safety, legal-risk, or local governance measure. |

### European Environment Agency environmental noise

| Field | Value |
|---|---|
| Source | European Environment Agency Environmental Noise Directive reporting |
| URL | `https://www.eea.europa.eu/en/datahub/datahubitem-view/16ff7600-4cd4-4b27-a971-1b0a8c0f55b1` |
| Access | Public EEA data download and map services |
| Fields extracted | Population exposed to road, rail, aircraft, and industry noise above reporting thresholds |
| Coverage | Agglomerations and reporting areas, not arbitrary towns |
| License | EEA reuse with attribution |
| Refresh cadence | Reporting-cycle refresh; check before publication for any city where noise is a page claim |
| Confidence | HIGH for the reported area and threshold; MEDIUM when inherited to a nearby town |
| Granularity in schema | `region`, `city`, or `country` depending on published reporting area |
| Gotchas | EEA noise data is exposure by reporting area and threshold. It is not street-by-street quietness, apartment noise, nightlife noise, airport annoyance, or a personal nuisance prediction. Do not use it for towns outside a reporting area without an inherited/regional label. If the official country download omits Greece, close the row as `no_public_source_found`; do not infer a zero value. |

### EF English Proficiency Index

| Field | Value |
|---|---|
| Source | EF Education First |
| URL | `https://www.ef.com/wwen/epi/regions/europe/greece/` |
| Methodology URL | `https://www.ef.com/wwen/epi/about-epi/` |
| Access | Public country profile page and methodology page, manual or HTML read |
| Fields extracted | Country EF EPI score, country rank, and proficiency band |
| Coverage | Country-level only |
| License | EF website terms and attribution requirements |
| Refresh cadence | Annual index release, manual check before publication |
| Confidence | MEDIUM because the published score is clear but the sample is self-selected |
| Granularity in schema | `country` |
| Gotchas | This is a national test-taker index, not a Crete English-service availability measure, expat-community proxy, school-language provision score, or guarantee of English access in public services. EF says the test-taking population is self-selected and not guaranteed to represent the country or region as a whole. |

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

## Domain: geocoding and local amenities

### Open-Meteo Elevation API

| Field | Value |
|---|---|
| Source | Open-Meteo |
| URL | `https://open-meteo.com/en/docs/elevation-api` |
| Endpoint template | `https://api.open-meteo.com/v1/elevation?latitude={LAT}&longitude={LON}` |
| Access | Free HTTP API, no key required |
| Fields extracted | Terrain elevation in metres at supplied WGS84 point coordinates |
| Coverage | Global point sampling, backed by Copernicus DEM GLO-90 according to Open-Meteo documentation |
| License | Open-Meteo terms and underlying Copernicus DEM attribution requirements |
| Refresh cadence | Refresh when a place coordinate changes, and recheck source documentation annually |
| Confidence | MEDIUM |
| Granularity in schema | `town` for point samples; `region` only for explicitly labelled summaries of sampled points |
| Gotchas | A point sample is not a municipal elevation range, flood-risk metric, or parcel-level survey. Coastal points can return slightly negative values because of DEM resolution and shoreline pixels. Regional rows must not use one interior coordinate as "Crete elevation"; use a labelled proxy summary or keep the row source-gapped. |

### OpenStreetMap and Nominatim

| Field | Value |
|---|---|
| Source | OpenStreetMap contributors |
| URL | `https://www.openstreetmap.org/` |
| Access | Nominatim for small-volume geocoding checks; Overpass or planet extracts for amenity counts, ferry-terminal features, coastline geometry, protected-area proximity proxies, mapped green-polygon area proxies, mapped inland-water polygon proxies, and selected `opening_hours` seasonality tags |
| Fields extracted | Place point coordinates, administrative relation identifiers, amenity and service POI counts, mapped railway-station counts, `amenity=ferry_terminal` feature counts, nearest `natural=coastline` geometry distance, mapped `boundary=protected_area` / `leisure=nature_reserve` / `protect_class` feature counts, mapped green-polygon area from selected `leisure`, `landuse`, and `natural` tags, mapped inland-water polygons from selected `natural`, `water`, `waterway`, and `landuse` tags with sea, salt-water, fountain, and pool exclusions, hospitals, clinics, ambulance stations, pharmacies, playgrounds, kindergartens, schools, public toilets, coworking spaces, language schools, veterinary services, emergency-tagged veterinary services, dog parks, hotels, wheelchair tags, sidewalk tags, footway tags, and selected service/shop/tourism features with `opening_hours` month/date ranges or `seasonal` tags |
| Coverage | Global, strongest in mapped urban areas |
| License | Open Database License (ODbL); attribution required |
| Refresh cadence | Quarterly for town bundles; before publication for any town newly promoted from source gap |
| Confidence | MEDIUM for geocoded place points, amenity-density proxies, railway-station counts, ferry-terminal feature counts, protected-area proximity proxies, mapped green-polygon area proxies, mapped inland-water polygon proxies, coastline-distance geometry, and mapped city-service proxies; HIGH only for clearly tagged physical features after manual spot-check |
| Granularity in schema | `town`, `region`, or point, depending on the OSM object and spatial join |
| Gotchas | Nominatim search can return false positives for repeated place names. Store the OSM object URL and display name in the excerpt. Do not treat POI density as exhaustive service coverage; render it as an OSM proxy and keep low-count/sparse areas source-gapped. A zero-count query means Overpass returned no mapped features in the radius or region, not a proof the service does not exist. Railway and bus features are not timetable guarantees. Ferry-terminal features are not route, frequency, car-ferry, ticketing, or seasonal-operation evidence; some may be tourist-boat or boarding-point features rather than intercity ferry services. Healthcare, childcare, school, accessibility, coworking, pet, and public-toilet counts are mapped-feature proxies, not quality, opening-hours, appointment, language, eligibility, or legal-access claims. Emergency veterinary rows are sparse-tag proxies only: explicit `emergency`, emergency-service, 24/7 opening-hours, or emergency-speciality tags can reveal mapped emergency signals, but they do not prove an after-hours rota, current emergency availability, phone triage, clinical quality, price, insurance acceptance, or that untagged veterinary services lack emergency provision. Seasonal opening-hours rows are sparse-tag proxies only: month/date-range or `seasonal` tags can reveal visible seasonality, but they do not prove actual winter-vs-summer service drop-off, current opening hours, resident-service availability, tourism pressure, or that untagged services are year-round. Protected-area proximity is a mapped-feature proxy, not an official Natura 2000, WDPA, or legal protected-area inventory; feature centers can understate or overstate polygon-edge distances. Coastline distance is a straight-line distance from the representative place coordinate to OSM `natural=coastline` geometry; it is not walking distance, beach access, bathing-water quality, municipal coastline length, or coastal-housing availability. Mapped green-polygon share is not Copernicus land cover, tree canopy, public-park access, ecological quality, legal open-space inventory, or a guarantee of usable green space. Mapped inland-water polygon share is not JRC Global Surface Water, not a municipal water-area value, and not household service, water quality, drought, flood risk, beach access, parcel suitability, utility, legal, or health evidence; zero means no sampled point intersected retained mapped inland-water polygons. |

### DEM slope and street-network accessibility proxies

| Field | Value |
|---|---|
| Source | SRTM, Copernicus DEM, Open-Meteo elevation API, and OpenStreetMap road/footway graph |
| URL | `https://api.open-meteo.com/v1/elevation`, `https://dataspace.copernicus.eu/`, `https://www.openstreetmap.org/` |
| Access | Public APIs or downloads, then local geospatial processing |
| Fields extracted | Elevation samples, street-network slope proxy, hilliness proxy, sidewalk coverage proxy, wheelchair-tag coverage |
| Coverage | Global where DEM and OSM coverage exist |
| License | Underlying DEM and OSM licenses; attribution required |
| Refresh cadence | Refresh when place coordinate or OSM extract changes |
| Confidence | MEDIUM for slope/hilliness; LOW for sidewalk and wheelchair-tag completeness |
| Granularity in schema | `town` |
| Gotchas | Accessibility proxies are not formal accessibility audits. OSM wheelchair and sidewalk tags are incomplete in many places. Use these rows to flag likely friction, not to claim a route, venue, beach, station, or neighbourhood is accessible. |

### Raster and spatial extraction targets for environmental rows

| Field | Value |
|---|---|
| Source | TEMIS UV climatology, Copernicus CDS/ERA5, Copernicus CAMS, Copernicus HRL, Copernicus Urban Atlas, JRC Global Surface Water, WDPA, VIIRS Black Marble or NOAA DNB, Blue Flag data, EFFIS/GWIS, SRTM/Copernicus DEM, and OpenStreetMap |
| URL | `https://www.temis.nl/uvradiation/`, `https://cds.climate.copernicus.eu/`, `https://atmosphere.copernicus.eu/`, `https://land.copernicus.eu/`, `https://global-surface-water.appspot.com/`, `https://www.protectedplanet.net/`, `https://www.earthdata.nasa.gov/`, `https://www.blueflag.global/`, `https://effis.jrc.ec.europa.eu/`, `https://www.openstreetmap.org/` |
| Access | Public downloads or map services, then local GIS, raster, route, or POI extraction |
| Fields extracted | UV monthly normals, snowfall days, PM2.5 monthly and exceedance proxies, forest and tree cover, urban green share, surface-water density, protected-area distance, peak distance, trail and outdoor-feature counts, light-pollution radiance, pollen severity, scenery tags, Blue Flag beach counts, drought and water-stress context, wildfire egress proxy, slope, hilliness, sidewalk coverage, wheelchair-tag coverage, step-free station proxy, and selected office or school drive-time distances |
| Coverage | Grid, raster, point, polygon, route, town, region, or country depending on the source and join |
| License | Source-specific terms. Preserve attribution for Copernicus, JRC, OSM, NASA/NOAA, WDPA, and Blue Flag where used |
| Refresh cadence | Build once for source-gap closure, then refresh annually or when a place coordinate, boundary, source version, or OSM extract changes |
| Confidence | MEDIUM for gridded, raster, route, and mapped-feature proxies after extraction; LOW where sparse OSM tags are the only available signal; HIGH only when an official source directly publishes the same value at the same geography |
| Granularity in schema | `town` for point, radius, route, or boundary joins; `region` for island-wide or priority-town summary rows; `country` only when explicitly inherited |
| Gotchas | These rows are source-discovery complete only when the source stack is identified. They still cannot ship as values until the extraction records the source version, coordinate or boundary, threshold, radius, route engine where relevant, and aggregation method. Do not treat a missing mapped feature as absence unless the extraction quality gate allows that interpretation. Do not turn environmental, accessibility, hospital, school, ferry, water, or wildfire proxies into health advice, safety advice, legal access claims, route guarantees, school-placement claims, or property-risk advice. |

### Zenodo/OpenGeoHub VIIRS nighttime lights COG

| Field | Value |
|---|---|
| Source | Hengl, T., "Annual time series of global VIIRS nighttime lights for 2000-2024 at 500-m spatial resolution extrapolated using logistic regression" |
| Record URL | `https://zenodo.org/records/17294744` |
| API URL | `https://zenodo.org/api/records/17294744` |
| DOI | `10.5281/zenodo.17294744` |
| Publication date | 2025-10-08 |
| 2024 COG file | `nightlights.average_viirs.v21_m_500m_s_20240101_20241231_go_epsg4326_v20250904.tif` |
| File URL | `https://zenodo.org/api/records/17294744/files/nightlights.average_viirs.v21_m_500m_s_20240101_20241231_go_epsg4326_v20250904.tif/content` |
| File integrity | Size `63713625` bytes; MD5 `0b976892d40c2d0d99177c727289eaf2` |
| Upstream context | NOAA VIIRS Nighttime Day/Night Annual Band Composites V2.2 are annual 2012-2024 average DNB radiance products, units nanoWatts/sr/cm^2, at 463.83 m scale. See `https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_ANNUAL_V22`. |
| Access | Public Zenodo record and file download |
| Fields extracted | `light_pollution` from the 2024 COG. Source page says original Annual VNL V2 values are converted from the 0-200 scale to the 0-2000 scale and available as COGs; the MSC adapter reports sampled raw values divided by 10 as a NOAA-like radiance proxy. |
| Coverage | Global raster. MSC city-matrix adapter samples representative 2 km town circles and uses priority-town samples for regional summaries |
| License | CC BY 4.0 |
| Refresh cadence | Annual or when the Zenodo record publishes a newer year or corrected file |
| Confidence | MEDIUM, because the source is published and file-level provenance is available, but MSC reports a coverage proxy from representative town-circle samples rather than an official town or region statistic |
| Granularity in schema | `town` for representative 2 km town-circle samples; `region` only for explicitly labelled priority-town summaries |
| Gotchas | This is a nighttime-light radiance proxy. It is not a Bortle class, stargazing guarantee, streetlight inventory, safety advice, health advice, property advice, parcel measure, or neighborhood measure. |

### Copernicus/EEA High Resolution Layers: Forest Type and Tree Cover Density

| Field | Value |
|---|---|
| Source | European Environment Agency ImageServer: Copernicus High Resolution Layer Forest Type 2018 and Tree Cover Density 2018 |
| URLs | `https://image.discomap.eea.europa.eu/arcgis/rest/services/GioLandPublic/HRL_ForestType_2018/ImageServer`, `https://image.discomap.eea.europa.eu/arcgis/rest/services/GioLandPublic/HRL_TreeCoverDensity_2018/ImageServer` |
| Access | Public ArcGIS ImageServer `getSamples` POST requests, no key required at verification time |
| Fields extracted | `forest_cover_pct` from Forest Type classes 1 and 2 divided by valid classes 0, 1, and 2; `tree_canopy_pct` from the mean Tree Cover Density 0-100 values |
| Coverage | Europe raster service; MSC Crete pass samples 2 km representative-town circles for Chania, Heraklion, Rethymno, and Agios Nikolaos, then creates a priority-town regional summary for Crete |
| License | EEA/Copernicus attribution requirements |
| Refresh cadence | Refresh when a place coordinate changes, when the HRL source year changes, or before promoting a source-gap bundle to `data_bundle_ready` |
| Confidence | MEDIUM for MSC town-radius samples because the source is official but the reported value is a representative-circle proxy, not a municipal or island-wide boundary statistic |
| Granularity in schema | `town` for town-radius samples; `region` only for explicitly labelled priority-town summaries |
| Gotchas | Exclude `255` no-data samples from denominators; do not treat sea or no-data pixels as zero forest or zero canopy. These rows are not municipal forest inventories, legal forest classifications, parcel-level land-cover values, street-shade measures, public-access claims, biodiversity assessments, wildfire-risk scores, insurance measures, safety advice, or property advice. |

### Blue Flag Greece annual awards list

| Field | Value |
|---|---|
| Source | Blue Flag Greece |
| URL | `https://www.blueflag.gr/el/awards/2026` |
| Access | Public HTML list. Default CLI fetch may return access denied; adapter uses browser-compatible request headers and must run as a low-frequency official-source read, not a crawler loop |
| Fields extracted | Annual awarded-beach counts by regional unit and municipality |
| Coverage | Greece regional-unit and municipality sections where the award list publishes them |
| License | Blue Flag/FEE and national operator attribution requirements |
| Refresh cadence | Annual after the new bathing-season awards list is published |
| Confidence | MEDIUM |
| Granularity in schema | `region` for regional-unit or Crete summaries; `town` only when the municipality section matches the town candidate |
| Gotchas | Blue Flag is an annual award list, not a town-radius beach inventory, bathing-water quality classification for every beach, beach-accessibility claim, safety claim, lifeguard guarantee, or current operating-status claim. Heraklion currently uses regional-unit context because the 2026 official list has no Heraklion Municipality beach section. |

### ThinkHazard hazard screening profiles

| Field | Value |
|---|---|
| Source | ThinkHazard, Global Facility for Disaster Reduction and Recovery |
| Greece overview | `https://thinkhazard.org/en/report/97-greece` |
| JSON endpoint | `https://thinkhazard.org/en/report/97-greece.json` |
| Hazard pages | `https://thinkhazard.org/en/report/97-greece/EQ`, `https://thinkhazard.org/en/report/97-greece/WF`, `https://thinkhazard.org/en/report/97-greece/FL` |
| Access | Public HTML and JSON report |
| Fields extracted | Country-level earthquake, wildfire, and river-flood hazard screening classes |
| Coverage | Country-level Greece screening profile |
| License | ThinkHazard/GFDRR terms and attribution requirements |
| Refresh cadence | Manual check before publishing or when replacing with gridded ESHM20, EFFIS, or JRC source rows |
| Confidence | MEDIUM for country screening classes; HIGH is reserved for gridded source products once sampled directly |
| Granularity in schema | `country` |
| Gotchas | ThinkHazard values are broad hazard screening classes, not ESHM20 PGA, EFFIS wildfire grid class, JRC flood-depth values, parcel exposure, local drainage analysis, building-safety assessment, evacuation advice, insurance advice, or personal safety predictions. Do not render them as town-level hazard measurements. |

---

## Domain: population and community

### Eurostat foreign-born population share

| Field | Value |
|---|---|
| Source | Eurostat |
| Dataset codes | `tps00178` (foreign-born population count), `tps00001` (population on 1 January) |
| Endpoint templates | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tps00178?format=JSON&geo=EL`, `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tps00001?format=JSON&geo=EL` |
| Access | Free JSON-stat REST |
| Fields extracted | Foreign-born resident count, total resident population, derived foreign-born share |
| Coverage | Country-level only |
| License | Eurostat reuse policy |
| Refresh cadence | Annual |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | This is a derived national share. It is not a Crete migrant-community measure, expat-density estimate, English-access score, or integration-quality claim. Store the numerator and denominator years in the excerpt and keep the denominator endpoint visible in notes until the schema supports multi-source derived values. |

### European Social Survey

| Field | Value |
|---|---|
| Source | European Social Survey |
| Data portal | `https://ess.sikt.no/en/datafile/` |
| API URL | `https://api.nsd.no/graphql` |
| Access | Public ESS data portal and GraphQL API |
| Fields extracted | Country-subset mean for `ppltrst` (`social_trust`) and valid-response share for `rlgblg` (`religiosity`) |
| Coverage | Country-level survey microdata, depending on ESS round participation |
| License | ESS data terms and attribution required |
| Refresh cadence | Each new ESS round; manual source check before publication |
| Confidence | HIGH for published ESS tabulations and API summaries; MEDIUM for interpretation |
| Granularity in schema | `country` |
| Gotchas | ESS rows are national survey context. They are not Crete or town-level friendliness, integration, religious-practice, service-access, social acceptance, crime, or personal-safety measures. Store the ESS round, datafile edition, variable name, country filter, count, missing count, and exact statistic in the excerpt. |

### Historical Index of Ethnic Fractionalization

| Field | Value |
|---|---|
| Source | Harvard Dataverse: Historical Index of Ethnic Fractionalization Dataset (HIEF) |
| DOI | `https://doi.org/10.7910/DVN/4JQRCL` |
| API | `https://dataverse.harvard.edu/api/access/datafile/3476857` |
| Access | Public Dataverse API, no key required |
| Fields extracted | Latest available country-year `EFindex` from `HIEF_data.tab` |
| Coverage | Country-year panel for 1945-2013 where HIEF publishes a country observation |
| License | CC0 1.0 |
| Refresh cadence | Annual source check; dataset latest version is historical and may not change often |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | HIEF is a national historical fractionalization index. It is not a Crete, town, neighbourhood, language-community, migrant-network, discrimination, social-cohesion, or personal-safety measure. Store the country, year, index name, and value in the excerpt. |

---

## Domain: lifestyle and public-health context

### World Bank WDI tobacco and alcohol indicators

| Field | Value |
|---|---|
| Source | World Bank Open Data |
| Indicator codes | `SH.PRV.SMOK` (prevalence of current tobacco use), `SH.ALC.PCAP.LI` (total alcohol consumption per capita) |
| Endpoint template | `https://api.worldbank.org/v2/country/GR/indicator/{INDICATOR}?format=json&per_page=100` |
| Access | Free JSON API, no key required |
| Fields extracted | Latest non-null national adult tobacco-use prevalence and alcohol litres per capita |
| Coverage | Country-level only |
| License | World Bank Open Data Terms of Use, attribution required |
| Refresh cadence | Annual check, though these indicators lag more than fast economic series |
| Confidence | HIGH |
| Granularity in schema | `country` |
| Gotchas | These rows are national lifestyle and public-health context. They must not be rendered as Crete, town, venue, nightlife, air-quality, public-health-service, or personal-risk measures. |

### parkrun official countries page

| Field | Value |
|---|---|
| Source | parkrun |
| URL | `https://www.parkrun.com/countries/` |
| Access | Public country page, manual read when bot protection blocks automated fetch |
| Fields extracted | Active country pages used as a national parkrun-presence signal |
| Coverage | Country-level parkrun presence only |
| License | parkrun website terms |
| Refresh cadence | Before publication for any parkrun row; annual thereafter |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | A country-page presence signal is not a full running-club inventory, race calendar, informal group count, local fitness-culture measure, or proof that no independent group runs locally. If a country is absent, store that as a dated manual check of the official country list. |

### EU Drugs Agency cannabis law and policy pages

| Field | Value |
|---|---|
| Source | European Union Drugs Agency |
| URL | `https://www.euda.europa.eu/` |
| Access | Public country and topic pages; manual read required when Cloudflare blocks automated fetch |
| Fields extracted | Country-level cannabis legal-status context, penalties, and policy notes where published |
| Coverage | EU country-level |
| License | EUDA website terms and EU reuse rules |
| Refresh cadence | Manual check before publication and whenever legal-status rows are refreshed |
| Confidence | HIGH when read from a current EUDA country page; MEDIUM for older topic summaries |
| Granularity in schema | `country` |
| Gotchas | Cannabis legal-status rows are screening context, not legal advice, police-risk advice, medical-use advice, import advice, or town-level culture. Store the exact country page, year, and wording checked. |

---

## Domain: local bureaucracy and public offices

### Official public office locators and municipal service pages

| Field | Value |
|---|---|
| Source | National tax authority, migration authority, citizen-service centre registry, land registry or cadastre, municipality website, and national e-government portal |
| URL | Country-specific official office locator or service page. Current Crete municipal-service batch: `https://politis.crete.gov.gr/index.php?cat=online`, `https://eservices.chania.gr/`, `https://eservices.heraklion.gr/`, `https://www.rethymno.gr/e-services`, `https://www.agiosnikolaos.gr/e-services/` |
| Access | Manual read or small scripted public-page extraction where terms allow |
| Fields extracted | Office name, office type, address or coordinate, service area, digital-service availability, appointment or online-service signal where published |
| Coverage | Country-specific; office-level or municipality-level |
| License | Public authority reuse terms |
| Refresh cadence | Before publication for any bureaucracy-friction claim; annual for office-distance rows |
| Confidence | HIGH for official office existence and location; MEDIUM for service availability; LOW for appointment availability unless directly published |
| Granularity in schema | `town`, `municipality`, or `country` depending on source |
| Gotchas | Distance to an office is not advice about eligibility, appointment availability, processing speed, service quality, or likely outcome. Municipal digital-service presence is only a public service-surface signal, not a service-completeness audit, processing-time claim, language-access guarantee, accessibility audit, or administrative advice. Do not interpret immigration, tax, property, or municipal rules against a reader's circumstances. |

---

## Domain: infrastructure resilience

### European Drought Observatory and water-stress sources

| Field | Value |
|---|---|
| Source | Copernicus Emergency Management Service European Drought Observatory CDI v4.1, WRI Aqueduct 4.0, national water authority, municipality or water utility |
| URL | EDO CDI v4.1 dataset page `https://data.jrc.ec.europa.eu/dataset/afa8a5ee-5473-439a-b062-ffdaedc38b2d`, EDO CDI v4.1 data directory `https://drought.emergency.copernicus.eu/data/Drought_Observatories_datasets/EDO_Combined_Drought_Indicator/ver4-1-0/`, EDO CDI factsheet `https://drought.emergency.copernicus.eu/data/factsheets/factsheet_combinedDroughtIndicator_v4.pdf`, EDO WMS capabilities `https://drought.emergency.copernicus.eu/api/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities`, EDO WCS `https://drought.emergency.copernicus.eu/api/wcs`, `https://edo.jrc.ec.europa.eu/`, `https://www.wri.org/aqueduct`, WRI Aqueduct 4.0 data zip `https://files.wri.org/aqueduct/aqueduct-4-0-water-risk-data.zip`. Current Crete town notice-history batch: `https://www.chania.gr/enimerosi/nea/arxeia-dt/archeio-dt-2026/diakopi-nerou-ydrefsis-se-perioches-tis-d-e-keramion/`, `https://www.heraklion.gr/municipality/municipality-press-releases/synexizontai-oi-ergasies-syndesis-neou-diktyoy-DEYAH-11-03-2026.html`, `https://deyar.eu/%CE%B1%CE%BD%CE%B1%CE%BA%CE%BF%CE%AF%CE%BD%CF%89%CF%83%CE%B7-%CE%B4%CE%B5%CF%85%CE%B1%CF%81-%CE%B3%CE%B9%CE%B1-%CE%B4%CE%B9%CE%B1%CE%BA%CE%BF%CF%80%CE%AE-%CE%BD%CE%B5%CF%81%CE%BF%CF%8D-%CF%83%CF%84/`, `https://www.agiosnikolaos.gr/2026/01/13/anakoinosi-gia-diakopi-ydrodotisis-stis-perioches-kritsas-mardatiou-kai-rousas-limnis/` |
| Access | Public maps/downloads, WMS/WCS extraction, and manual authority notices. Current adapter: `pnpm data:city-adapters --only drought-frequency --write`. Some local utility domains bot-block automated fetches; use only accessible official pages or mark `source_bot_blocked_manual_needed`. |
| Fields extracted | `drought_frequency_proxy` from latest EDO CDI v4.1 `cdiad` ten-day WMS time extent, 36 WCS GeoTIFF observations, nearest valid grid-cell sample for each representative town coordinate, count of class values `1`, `2`, and `3` as Watch, Warning, or Alert over valid CDI classes `0` through `6`, class breakdown in excerpts, and Crete parent priority-town summary. WRI Aqueduct `bws_raw`, `bws_score`, `bws_cat`, and `bws_label` from `Aqueduct40_baseline_annual_y2023m07d05.csv`, recent water-restriction notices, basin or regional stress context. |
| Coverage | Grid, basin, region, municipality, or country depending on source |
| License | Source-specific reuse terms |
| Refresh cadence | Annual for baseline; before publication when a page discusses water restrictions |
| Confidence | MEDIUM for EDO CDI nearest-grid-cell drought-frequency proxy and basin/grid indicators; LOW for manual local restriction history even when official and recent, because a dated notice is only a partial history signal |
| Granularity in schema | `region`, `grid`, `municipality`, or `country` |
| Gotchas | EDO CDI rows are agricultural drought-screening proxies, not true island-wide or municipal boundary averages, municipal drought declarations, household water-service evidence, water-quality claims, current restrictions, outage status, utility-capacity assessments, property or safety evidence, legal advice, utility advice, health advice, or personal advice. Exclude no-data cells, record sampled grid cell, date range, requested observation count, valid observation count, class counts, WCS source, and WMS layer time extent in the excerpt. WRI Aqueduct is a basin or administrative-region screening indicator. For Crete, use the `GRC.4_1` rows and record the row ids, area handling, score, category, and label. Water stress is not a household service guarantee, water-bill prediction, property suitability assessment, agricultural water-rights claim, current outage status, water-quality claim, utility-capacity assessment, future restriction prediction, legal or utility advice, health advice, or climate-risk advice. A dated municipality or utility interruption notice is not a continuous water-stress baseline, current outage status, water-quality claim, utility-capacity assessment, future restriction prediction, legal or utility advice, or health advice. Label basin, regional, municipal, and notice-history values clearly. Do not promote a regional parent row from isolated town notices unless the row explicitly says it is an accepted aggregate proxy. |

### Electricity reliability statistics

| Field | Value |
|---|---|
| Source | CEER benchmarking reports, World Bank WDI or Enterprise Surveys, Doing Business archive, national energy regulator, distribution network operator |
| URL | `https://www.ceer.eu/`, `https://api.worldbank.org/v2/country/GR/indicator/IC.ELC.OUTG.ZS?format=json&per_page=100`, national regulator or distribution operator reliability page |
| Access | Public reports, manual or spreadsheet download |
| Fields extracted | SAIDI, SAIFI, outage minutes, interruption frequency, firm outage exposure, national or regional reliability context where available |
| Coverage | Country or distribution-region level |
| License | Source-specific reuse terms |
| Refresh cadence | Annual |
| Confidence | MEDIUM |
| Granularity in schema | `country` or `region` |
| Gotchas | Reliability statistics are not a guarantee for a specific address, building, rural road, storm event, summer peak condition, household outage exposure, or power-quality outcome. Firm-survey rows must be labelled as firm-survey context, not residential reliability. |

### Open-Meteo and ERA5 heat-stress derived rows

| Field | Value |
|---|---|
| Source | Open-Meteo Historical Weather API, Copernicus ERA5, or national meteorological service |
| URL | `https://open-meteo.com/en/docs/historical-weather-api`, `https://cds.climate.copernicus.eu/` |
| Access | Public API or climate-data download |
| Fields extracted | Hot days, heatwave days by declared threshold, cooling degree days, warm-night counts where calculated |
| Coverage | Gridded point sample or station where available |
| License | Open-Meteo and Copernicus attribution requirements |
| Refresh cadence | Annual after prior-year archive is available, or refresh when a place coordinate changes |
| Confidence | MEDIUM for gridded point samples; HIGH only for official station normals where comparable |
| Granularity in schema | `town` for point samples |
| Gotchas | Heat rows are climate-screening indicators, not medical risk, building cooling cost, indoor comfort, or personal safety advice. Store thresholds and date range in the excerpt. |

---

## Domain: pets and accessibility

### EU and national pet movement rules

| Field | Value |
|---|---|
| Source | EU Your Europe, European Commission animal movement pages, national agriculture or customs authority |
| URL | `https://europa.eu/youreurope/citizens/travel/carry/animal-plant/index_en.htm` |
| Access | Manual official-source read |
| Fields extracted | Pet passport, microchip, rabies vaccination, waiting-period, and country-entry rules |
| Coverage | Country and origin-destination context |
| License | EU and national public information reuse terms |
| Refresh cadence | Manual before publication, then at least annually |
| Confidence | HIGH for official rules, but high-liability enough to keep source fresh |
| Granularity in schema | `country` or `pair` |
| Gotchas | Pet movement rules are screening information, not veterinary, customs, airline, or border advice. Route readers to official sources and licensed professionals where needed. |

### Accessible beach and public accessibility sources

| Field | Value |
|---|---|
| Source | Blue Flag, municipality beach-accessibility pages, national tourism accessibility portals, SEATRAC where deployed |
| URL | Exact accessible-beach, Blue Flag, municipality page, or SEATRAC directory filter such as `https://seatrac.gr/en/beach-directory/?region=Chania` |
| Access | Manual read unless a public dataset exists; SEATRAC directory counts use the public beach-directory search endpoint behind the public filtered page |
| Fields extracted | Accessible beach presence, ramp/chair/SEATRAC signal, accessible toilets or parking where published, SEATRAC Online versus Uninstalled directory status |
| Coverage | Beach or municipality-level |
| License | Source-specific reuse terms |
| Refresh cadence | Annual before bathing-season publication |
| Confidence | MEDIUM |
| Granularity in schema | `town` for beach radius joins or municipality rows |
| Gotchas | Accessible-beach data is a facilities signal, not a guarantee that a beach, route, toilet, parking area, sea state, or assistance service is usable for a specific person on a specific day. SEATRAC counts are directory entries marked Online at verification time, not a full accessible-beach inventory or proof that unmatched beaches are inaccessible. |

---

## Domain: airports and connectivity

### World Bank B-READY business entry indicators

| Field | Value |
|---|---|
| Source | World Bank Open Data, Business Ready (B-READY) |
| Indicator code | `IC.BRE.BE.OS` |
| Endpoint template | `https://api.worldbank.org/v2/country/GR/indicator/IC.BRE.BE.OS?format=json&per_page=100` |
| Access | Free World Bank JSON API, no key required |
| Fields extracted | Business Entry overall score for the latest non-null country observation |
| Coverage | Country-level where B-READY publishes a country score |
| License | World Bank Open Data Terms of Use, attribution required |
| Refresh cadence | Annual B-READY update |
| Confidence | MEDIUM |
| Granularity in schema | `country` |
| Gotchas | B-READY is a country-level business-regulation index, not a company-formation service, incorporation cost, processing-time guarantee, legal eligibility decision, tax setup claim, or local business support measure. Do not render it as advice on whether or how a reader should incorporate. |

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

### OpenFlights route database snapshot

| Field | Value |
|---|---|
| Source | OpenFlights |
| URL | `https://openflights.org/data.php`; snapshot files at `https://github.com/jpatokal/openflights/tree/master/data` |
| Files | `routes.dat`, joined to `airports.dat` by airport ID and IATA code |
| Access | Public data snapshot; no key required |
| Fields extracted | Unique destination-airport count by source airport, airline count where needed for audit only |
| Coverage | Airports present in the OpenFlights snapshot. For Crete, route rows are present for CHQ, HER, and JSH. |
| License | Open Database License for the airport and route databases, attribution required |
| Refresh cadence | Manual source-search refresh only. Treat as stale route-skeleton evidence, not current service. |
| Confidence | LOW |
| Granularity in schema | `town` when inherited from a town's selected airport; `region` only when summarising the selected-airport counts for a declared town set |
| Gotchas | The route database is stale and does not prove current direct flights, winter service, summer service, frequency, seats, fares, or year-round availability. Use only for the `direct_destinations` skeleton row, never for seasonal airport rows or publication claims about current service. |

### OSRM public routing service

| Field | Value |
|---|---|
| Source | OSRM public demo server over OpenStreetMap-derived routing graph |
| URL | `https://router.project-osrm.org/` |
| Access | Free HTTP API, public demo service |
| Fields extracted | Route-duration and route-distance proxies between sourced place points and sourced airport points |
| Coverage | Global where the OSRM demo graph has routable OpenStreetMap road coverage |
| License | OSRM is open source; underlying road data is OpenStreetMap ODbL. Attribute OpenStreetMap contributors. |
| Refresh cadence | Quarterly for source-gap bundles; refresh before any town bundle is promoted to `data_bundle_ready` |
| Confidence | MEDIUM |
| Granularity in schema | `town` for point-to-point route proxies; `region` only when summarising a documented town-to-airport matrix |
| Gotchas | This is a routing proxy, not an official drive time. It does not include live traffic, seasonal road disruption, parking, airport terminal approach time, ferry effects, or timetable availability. The public demo service has no SLA; if it is unavailable, keep route rows source-gapped rather than inventing values. Do not use route duration as evidence of current flight routes or route richness. |

### Greece KEP citizen-service office addresses plus OSRM routing

| Field | Value |
|---|---|
| Source | GSIS myKEPlive KEP municipality contact list, municipality KEP notices, Nominatim, and OSRM |
| URLs | `https://www.gsis.gr/sites/default/files/myKEPlive/Kep-Dhmoi-StoixeiaEpikoinwnias.pdf`, municipality notice URLs where the GSIS list is incomplete, `https://nominatim.openstreetmap.org/`, `https://router.project-osrm.org/` |
| Access | Public PDF or public municipality page for the selected KEP address, small-volume Nominatim geocoding check, then OSRM public routing table |
| Fields extracted | Selected KEP office/address evidence, geocoded address or mapped KEP point, OSRM route-duration and distance proxy from the representative town coordinate |
| Coverage | Town-level for the selected KEP or citizen-service office address. The 2026-06-29 Crete pass covers Chania, Heraklion, Rethymno, and Agios Nikolaos. |
| License | Official-source attribution plus OpenStreetMap ODbL attribution through Nominatim and OSRM routing data |
| Refresh cadence | Refresh before any town bundle is promoted to `data_bundle_ready`, and whenever a municipality announces an office move |
| Confidence | MEDIUM |
| Granularity in schema | `town`; regional rows may summarize only the named priority-town set |
| Gotchas | This is a route proxy to a selected official KEP address or mapped KEP point. It is not an official service-area assignment, appointment availability, opening-hours, processing-time, eligibility, language-access, accessibility audit, or legal or administrative advice claim. The Rethymno and Agios Nikolaos rows use address or street-level geocoding, so they must remain proxy rows until manually audited against an entrance-level official map or registry. |

### Mobility Database and GTFS schedule feeds

| Field | Value |
|---|---|
| Source | MobilityData Mobility Database and official operator GTFS feeds |
| URL | `https://database.mobilitydata.org/`, `https://gtfs.org/schedule/` |
| Access | Public feed catalogue where listed; operator feed terms vary |
| Fields extracted | Routes, stops, trips, calendars, headways, service days, seasonal service differences |
| Coverage | Feed-dependent. Many European local and intercity operators have no public GTFS feed. |
| License | Feed-specific license; check before reuse |
| Refresh cadence | Quarterly for supported towns; before publication for any transport-frequency claim |
| Confidence | MEDIUM when feed is current and official; LOW when feed age or coverage is uncertain |
| Granularity in schema | `town`, route, or stop catchment |
| Gotchas | GTFS describes scheduled service, not real-time reliability, cancellations, strikes, crowding, ticket availability, accessibility, or whether a route is convenient for a household. Store feed publisher, feed version/date, route IDs, and service calendar in the excerpt. |

### Official KTEL intercity bus timetable pages

| Field | Value |
|---|---|
| Source | KTEL Chania-Rethymno and KTEL Heraklion-Lasithi official timetable pages, PDFs, and FAQ pages |
| URLs | `https://www.e-ktel.com/en/services/dromologia`, `https://www.e-ktel.com/images/pdfs/2026/JUN_2026/CHANIA_FROM_27-06-2026.pdf`, `https://www.e-ktel.com/images/pdfs/2026/JUN_2026/RETHYMNO_FROM_23-06-2026.pdf`, `https://www.ktelherlas.gr/en/slug/frequent-asked-questions` |
| Access | Public HTML or PDF manual extraction unless the operator publishes an official GTFS feed |
| Fields extracted | Selected intercity spine-corridor departure counts, direction, service-day basis, route/corridor label, validity date where the source states one |
| Coverage | Town or route-level for selected KTEL corridors; regional rows may summarize the priority-town set only |
| License | Operator website terms. Use exact attribution and store the official page or PDF URL. |
| Refresh cadence | Before publication and at every seasonal timetable change |
| Confidence | MEDIUM for official operator timetable pages or PDFs when the validity date and counted corridor are stored |
| Granularity in schema | `town`, route, or `region` only for a priority-town summary |
| Gotchas | This is a selected timetable-frequency proxy, not a full public-transport network score, local bus coverage audit, headway guarantee, real-time reliability measure, accessibility claim, ticket availability claim, strike or cancellation warning, door-to-door commute estimate, or transport advice. Store the route, direction, service-day basis, and date checked. |

### Derived car-dependency screening proxy

| Field | Value |
|---|---|
| Source | Derived formula over already cited component rows: walkability proxy, selected KTEL bus-frequency proxy, airport-drive route proxy, ferry-terminal-drive route proxy, family-amenity density, and KEP/citizen-service route proxy |
| URL | Component source URLs are stored on the component rows |
| Access | Derived inside the city-matrix adapter after all component rows are cited |
| Fields extracted | `car_dependency_proxy`, 0-100 score where higher means more car-dependent |
| Coverage | Town-level when all six component rows exist; regional rows summarize only the declared priority-town set |
| License | Component source licenses apply; do not compute if any component row is uncited or source-gapped |
| Refresh cadence | Recompute whenever any component row refreshes, and before publication for any transport-access claim |
| Confidence | MEDIUM when all components are cited with medium or better confidence; LOW if any future component is low-confidence |
| Granularity in schema | `town`; `region` only for a priority-town summary |
| Formula | `100 * (0.35 * clamp((30 - walkability) / 30, 0, 1) + 0.25 * clamp((20 - selected bus departures) / 20, 0, 1) + 0.15 * clamp(airport minutes / 90, 0, 1) + 0.10 * clamp(ferry minutes / 30, 0, 1) + 0.15 * mean(clamp((4 - family amenities/km2) / 4, 0, 1), clamp(KEP minutes / 10, 0, 1)))` |
| Gotchas | This is a screening proxy, not a car-ownership rate, commute advice, full local bus coverage audit, traffic or parking measure, accessibility guarantee, school-run suitability claim, night/weekend service measure, route guarantee, or transport advice. Keep the formula and component values in the excerpt. |

### OSM wildfire-context road-dependence proxy

| Field | Value |
|---|---|
| Source | OpenStreetMap contributors via Overpass API, existing `car_dependency_proxy`, and ThinkHazard national wildfire context |
| URL | `https://www.openstreetmap.org/`, Overpass query URL stored on each town row, ThinkHazard source URL stored on `wildfire_risk` |
| Access | Public Overpass query with project contact user agent |
| Fields extracted | Mapped motor-road geometry within 10 km of representative town coordinates, selected connected component touching the 1 km town core, distinct 45-degree outbound bearing sectors reaching beyond 7.5 km, selected-component dead-end node share, existing car-dependency score |
| Coverage | Town-level proxy for priority towns; regional rows summarize only the priority-town set |
| License | Open Database License for OSM-derived data; component source licenses apply |
| Refresh cadence | Quarterly, after major OSM import/schema changes, and before publication for any wildfire-context row |
| Confidence | LOW |
| Granularity in schema | `town`; `region` only for a priority-town summary |
| Formula | `round(100 * (0.55 * clamp((3 - exitBearingCount) / 3, 0, 1) + 0.30 * clamp(deadEndShare / 0.35, 0, 1) + 0.15 * carDependencyScore / 100))` |
| Gotchas | This is a road-dependence proxy in a cited national wildfire context. It is not an EFFIS or GWIS fire-behaviour grid, evacuation route, emergency plan, road-capacity model, live traffic or closure source, response-time evidence, insurance claim, parcel or property risk score, safety advice, legal advice, health advice, or personal advice. OSM geometry can omit, duplicate, or misclassify roads, and bearing-sector counts can overstate or understate practical road redundancy. |

### Official airport route and timetable pages

| Field | Value |
|---|---|
| Source | Airport official destination pages, airport seasonal timetable PDFs, or licensed schedule data |
| URL | Exact airport route or timetable page. Current Crete town-only close: Chania Airport / Fraport Greece destinations page, `https://www.chq-airport.gr/en/flights--more/flights--destinations/destinations/destinations/dest_id-448/nd_id-448`, cross-checked against the HSCA seasonal calendar PDF, `https://hsca.gr/hsca-files/calendar-coordination-activities-March2026.pdf` |
| Crete official near-miss sources checked | 2026-06-30 source pass: CHQ/Fraport destination endpoints remain countable only for the loaded NS26 period ending `24/10/2026`, one day before HSCA NW26/27 starts on `25-Oct-26`. The official CHQ destination backend had 0 ranges after that cutoff in the Data Desk check. HSCA airport-level and coordination pages confirm CHQ/LGSA and HER/LGIR context but do not publish destination counts: `https://hsca.gr/airport-levels/`, `https://hsca.gr/airports/`, `https://hsca.gr/coordination-parameters/`, `https://hsca.gr/hsca-files/W26PARAMETERS.pdf`, `https://hsca.gr/hsca-files/HSCA_Estimates_for_S26_en.pdf`, `https://hsca.gr/hsca-files/timetables_s26.pdf`, and `https://hsca.gr/hsca-files/PSO_routes_en.pdf`. HASP/AIS AIP PDFs for `LGSA` and `LGIR` confirm aerodrome context but not commercial destination lists: `https://aisgr.hasp.gov.gr/aipgr_incl_amdt_0126_wef_22jan2026/cd/ais/eaip/pdf/AD%202/AD2-LGSA/LG_AD_2_LGSA_en.pdf` and `https://aisgr.hasp.gov.gr/aipgr_incl_amdt_0126_wef_22jan2026/cd/ais/eaip/pdf/AD%202/AD2-LGIR/LG_AD_2_LGIR_en.pdf`. Heraklion official/airport-branded destination surfaces checked on 2026-06-30 did not expose a reusable seasonal destination set: `http://www.ypa.gr/en/our-airports/kratikos-aerolimenas-hrakleioy-n-kazantzakhs` returned access denied from automation, `https://www.heraklion-airport.gr/` returned under maintenance, and `https://www.heraklion-airport.gr/plirofories-ptiseon-proorismoi/` returned 404. Fraport winter incentive terms define incentive context but not route counts: `https://www.fraport-greece.com/content/dam/fraport-company-greece/documents/en/our-expertise/commercial-incentives/Terms_Conditions_of_Winter_incentive_2025_and_2026_FGA.pdf/_jcr_content/renditions/original.media_file.download_attachment.file/Terms_Conditions_of_Winter_incentive_2025_and_2026_FGA.pdf`. |
| Access | Manual read unless a licensed schedules feed is available. The Chania/Fraport public endpoint can be counted for the loaded season, but the current public period ends on 24 October 2026 and does not expose NW26/27 winter counts. |
| Intake | `pnpm data:city-adapters --only transport-schedule-manual --manual-schedule-file docs/data/manual/transport-schedule-manual.json --write` for dated official exports or licensed schedule-feed rows |
| Fields extracted | Direct destinations, airline/route presence, winter and summer service counts. For Chania S26, Data Desk counted unique listed destination airports with outbound `ArrivalStatus=D` timetable rows from the official `/en/destinations` endpoint; 116 airports were listed and 115 had outbound rows, with IST excluded because it returned no outbound rows. |
| Coverage | Airport-level only, inherited or proxied to a town through the declared selected airport |
| License | Airport website terms or licensed schedule provider terms |
| Refresh cadence | Before publication and at each seasonal schedule change |
| Confidence | MEDIUM for official airport-published routes; HIGH only for licensed current schedule data; LOW for stale free route datasets |
| Granularity in schema | `region` or `town` proxy depending on how the selected airport is attached to the place. The source itself is airport-level. |
| Gotchas | A destination list is not a guarantee of daily service, seats, price, airline coverage, live operation, year-round operation, booking availability, travel suitability, or current availability. HSCA calendars define IATA season windows but do not publish destination counts. HCAA airport identity pages, HSCA airport-level or estimate pages, operating-hours PDFs, winter incentive documents, and rolling live boards are not seasonal route-count sources. Do not use OpenFlights as current route evidence. Always store the airport, season, endpoint or timetable URL, route-set definition, excluded rows, and date checked. Do not hand-enter `airport_winter_route_ratio`; derive it only after winter and summer component counts are cited for the same selected-airport basis. |

### Official ferry and port timetable pages

| Field | Value |
|---|---|
| Source | Port authority, ferry operator, or national ferry timetable publication |
| URL | Exact route, timetable, or seasonal schedule page. Crete source-family candidates include Chania Port Fund Souda context (`https://www.ltnx.gr/index.php?Itemid=71&id=52&lang=en&option=com_content&view=article`), ANEK Chania (`https://www.anek.gr/en-gb/destinations/chania`), Heraklion Port Authority ferry-company context (`https://www.portheraklion.gr/index.php/en/ferries/ferry-companies`), ANEK Heraklion (`https://www.anek.gr/en-gb/destinations/heraklion`), Minoan Piraeus-Heraklion (`https://www.minoan.gr/en/ferry-routes/piraeus-heraklion`), Rethymno Municipal Port Fund (`https://rethymnoport.gr/`), Port of Rethymno (`https://rethymnoport.gr/ta-limania-mas/limani-rethymnou`), Municipal Port Fund of Agios Nikolaos (`https://ltlassithi.gr/en/`), Agios Nikolaos port page (`https://ltlassithi.gr/en/saint-nicholas/`), and national ferry publications when available. |
| Crete official near-miss sources checked | 2026-06-30 source pass: Ministry/HCG regular-routing declaration pages and PDFs are promising official inputs but are not direct winter/summer route-count CitedValues without reconciliation. Checked sources include `https://www.ynanp.gr/el/anakoinwseis/anakoinwsh-pinaka-dhlwsewn-taktikhs-dromologhshs-aktoploikwn-ploiwn-gia-th-dromologiakh-periodo-2026-2027anarthsh-pinaka-dhlwsewn-taktikhs-dromologhshs-aktoploikwn-ploiwn-gia-th-dromologiakh-periodo-2026-2027/`, `https://www.ynanp.gr/media/documents/2026/02/10/%CE%A0%CE%99%CE%9D%CE%91%CE%9A%CE%91%CE%A3_%CE%94%CE%97%CE%9B%CE%A9%CE%A3%CE%95%CE%A9%CE%9D_%CE%A4%CE%91%CE%9A%CE%A4%CE%99%CE%9A%CE%97%CE%A3_%CE%94%CE%A1%CE%9F%CE%9C%CE%9F%CE%9B%CE%9F%CE%93%CE%97%CE%A3%CE%97%CE%A3_01-11-2026_%CE%95%CE%A9%CE%A3_31-10-2027.pdf`, `https://www.hcg.gr/el/anakoinwseis/pinakas-dhlwsewn-taktikhs-dromologhshs-aktoploikwn-ploiwn-gia-th-dromologiakh-periodo-2025-2026/`, `https://www.hcg.gr/documents/10965/diloseisDrom2025-2026.pdf`, `https://www.hcg.gr/documents/11061/TropPinDilTaktDromol2025-2026.pdf`, `https://www.hcg.gr/el/anakoinwseis/pinakas-dhlwsewn-taktikhs-dromologhshs-aktoploikwn-ploiwn-gia-th-dromologiakh-periodo-2026-2027/`, `https://www.hcg.gr/documents/13275/PinDilTaktDro011126-311027.pdf`, `https://www.hcg.gr/documents/13854/9%CE%94%CE%A1%CE%994653%CE%A0%CE%A9-3%CE%A9%CE%98.pdf`, and `https://www.hcg.gr/documents/13923/hmeriDiatSAS05-2026.pdf`. The 2025-2026 base declaration PDF is official but scanned/image-table enough that it is not reliable for automated route counting; extractable modification PDFs are partial, future declarations cover 2026-11-01 to 2027-10-31 without winter/summer splitting, and Sitia-linked public-service PDFs are requirement evidence, not complete commercial service evidence. |
| Access | Manual read unless a licensed timetable feed exists. Operator destination pages may confirm route existence, but seasonal route counts require a dated timetable, booking export, port publication, or licensed feed. |
| Intake | `pnpm data:city-adapters --only transport-schedule-manual --manual-schedule-file docs/data/manual/transport-schedule-manual.json --write` for dated official exports or licensed schedule-feed rows |
| Fields extracted | Winter route count, summer route count, frequency, car-ferry availability where stated, port connection set |
| Coverage | Port and route-level only |
| License | Operator or authority website terms |
| Refresh cadence | Before publication and at each seasonal schedule change |
| Confidence | MEDIUM |
| Granularity in schema | `port`, inherited to town when town-port relationship is cited |
| Gotchas | Ferry schedules change with weather, strikes, season, vessel maintenance, and operator decisions. A timetable is not a service guarantee. Static marketing route lists and booking widgets are not enough for winter or summer route counts unless the dated route set is extractable and archived. Ministry/HCG declaration PDFs list declared vessel routes and amendments across broad routing periods; they require a manual reconciliation rule for unique passenger route pairs by selected port and season before they can become CitedValues. Hellenic Coast Guard Maritime Single Window arrivals/departures (`https://mnsw.hcg.gr/nmsw/arrivals-departures/`) can support observed port-call sanity checks, but it is not a published route schedule. GTP, Ferryhopper, Direct Ferries, FerryGateway-style feeds, or other aggregators may be useful only with license or terms clearance and should otherwise remain reference-only. Do not substitute OSM ferry-terminal proximity, cruise passenger statistics, or airport/road-access proxies. Store the route, operator, season, and date checked. Do not record `0` for a port from absence alone unless the source is proven exhaustive for the selected route class and period. |

### Ookla Open Data Speedtest Performance Tiles

| Field | Value |
|---|---|
| Source | Ookla Open Data |
| Fixed URL | `https://ookla-open-data.s3.amazonaws.com/shapefiles/performance/type=fixed/year=2026/quarter=1/2026-01-01_performance_fixed_tiles.zip` |
| Mobile URL | `https://ookla-open-data.s3.amazonaws.com/shapefiles/performance/type=mobile/year=2026/quarter=1/2026-01-01_performance_mobile_tiles.zip` |
| Access | Public quarterly shapefile archives |
| Fields extracted | Tile `quadkey`, average download speed (`avg_d_kbps`), average upload speed (`avg_u_kbps`), average latency (`avg_lat_ms`), test count, and device count |
| Coverage | Global Speedtest-user tile observations, joined to a sourced place coordinate by containing tile |
| License | Ookla Open Data attribution and usage terms |
| Refresh cadence | Quarterly, with a manual license and field-schema check before publication |
| Confidence | HIGH for published tile values; MEDIUM for regional summaries derived from multiple town tiles |
| Granularity in schema | `town` for containing-tile joins; `region` only for explicitly labelled priority-town summaries |
| Gotchas | Ookla Open Data fields are average tile observations from Speedtest users, not medians, municipal averages, coverage maps, provider tariffs, household availability checks, or service guarantees. Always store test and device counts in the excerpt, and label regional rows as summaries rather than island-wide measurements. |

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
