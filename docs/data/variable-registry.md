# Relocation variable registry (working)

> The cited-only variable catalogue. Decision (founders, 2026-06-24): every variable must
> map to a real, named, publicly reachable source, or it is dropped. This file maps each
> candidate variable to the dataset behind it, its granularity, whether it auto-pulls, and a
> confidence tier. It extends `docs/data/SOURCES.md` and feeds the variables design spec.
>
> Status legend per category: COMPLETE (synthesised), PARTIAL (sources verified, needs a
> controlled re-run to finish). Auto-pull: yes = API/open dataset on a cron; partial = real
> source, needs scripted/geospatial work; manual = a human reads an official page and dates it.
>
> Provenance note: this registry was assembled from a parallel research sweep on 2026-06-24.
> The sweep over-fanned (themed agents spawned sub-agents and several rate-limited), so the
> categories below marked PARTIAL still need a tidy single-agent pass.

## Headline finding

Cited-only is viable and rich for relocation. Almost every variable a mover weighs has a
real, named, often-automatable European source (Eurostat, OpenStreetMap, Ookla, OurAirports,
WorldClim, Copernicus/ERA5, NOAA, PwC, OECD, the institutional indices). The drop list is
small and specific: live direct-flight schedules (paid), absolute consumer prices Eurostat
stopped publishing after 2015 (flat white, cinema, car), individual health-insurance premiums,
English-speaking-doctor availability, and a handful of paid/relational passport lookups.

---

## 1. Money and cost of living  (COMPLETE)

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| price_level_index | Price level index (AIC, EU27=100) | Eurostat tec00120 | country | yes | high |
| electricity_price_hh | Household electricity price | Eurostat nrg_pc_204 | country | yes | high |
| gas_price_hh | Household gas price | Eurostat nrg_pc_202 | country | yes | high |
| fuel_price | Pump price petrol/diesel | EC Weekly Oil Bulletin | country | yes | high |
| inflation_hicp | Annual HICP inflation | Eurostat prc_hicp_aind | country | yes | high |
| food_price_trend | Food price sub-index | Eurostat prc_hicp_minr CP01 | country | yes | high |
| min_wage | Statutory monthly minimum wage | Eurostat earn_mw_cur | country | yes | high |
| net_salary_avg | Average annual net earnings | Eurostat earn_nt_net | country | yes | high |
| hpi | House price index (2015=100) | Eurostat prc_hpi_a | country | yes | high |
| property_sqm_city | Asking price per sqm, cities | Global Property Guide | city | manual | medium |
| mortgage_rate | New mortgage interest rate | ECB MIR statistics | country | yes | high |
| rent_to_income | Housing cost share of income | Eurostat ilc_mded01 | country | yes | high |
| housing_overburden | Housing cost overburden rate | Eurostat tessi164 | country | yes | high |
| broadband_price | Fixed broadband monthly price | Eurostat isoc_pbo | country | yes | high |
| mobile_price | Mobile plan monthly price | Eurostat isoc_pbo | country | yes | high |
| transit_pass | Monthly transit ticket | Eurostat Urban Audit urb_ctran | city | partial | medium |
| childcare_net_cost | Net childcare cost (% of wage) | OECD Family DB (NCC) | country | yes | medium |
| rent_1bed_city | Rent, 1-bed city centre | Numbeo | city | partial | low |
| grocery_basket | Single grocery basket | Numbeo | city | partial | low |
| restaurant_meal | Mid-range meal for two | Numbeo | city | partial | low |
| beer_price | Domestic draught beer 0.5L | Numbeo | city | partial | low |

### DROP
- Flat white / coffee absolute price: Eurostat DAP discontinued after 2015; only Numbeo.
- Private health insurance individual premium: no open pan-European dataset (EIOPA aggregate only).
- Gym membership price: no official dataset; only Numbeo (already low).
- Cinema/leisure ticket absolute price: Eurostat DAP discontinued 2015.
- New car purchase price / running cost: no open per-country average transaction price.

---

## 2. Tax and residency  (COMPLETE)

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| top_pit_rate | Top personal income tax rate | PwC Worldwide Tax Summaries | country | manual | high |
| tax_wedge_avg | Tax wedge on average salary | OECD Taxing Wages (data API) | country | yes | high |
| ee_social_security | Employee social security rate | OECD Taxing Wages | country | partial | high |
| er_social_security | Employer social security rate | OECD Taxing Wages | country | partial | high |
| dividend_tax | Dividend tax rate | PwC WTS | country | manual | high |
| interest_tax | Interest tax rate | PwC WTS | country | manual | high |
| cgt_rate | Capital gains tax rate | PwC WTS | country | manual | high |
| rental_income_tax | Rental income tax | PwC WTS | country | manual | high |
| foreign_income_basis | Worldwide vs territorial | PwC WTS | country | manual | high |
| dtr_method | Double-tax relief method | PwC WTS / OECD treaties | country | manual | high |
| special_inbound_regime | Inbound/new-resident regime | PwC WTS + national authority | country | manual | high |
| pension_income_regime | Special pension tax regime | PwC WTS + national authority | country | manual | high |
| remittance_basis | Remittance basis availability | PwC WTS; UK gov.uk FIG | country | manual | high |
| wealth_tax | Net wealth tax | PwC WTS; Tax Foundation; EC wealth study 2026 | country | manual | high |
| inheritance_gift_tax | Inheritance/gift tax | PwC WTS; EC TEDB | country | manual | high |
| property_transfer_tax | Transfer tax on purchase | PwC WTS; Property Tax Lab | country | manual | high |
| annual_property_tax | Recurrent property tax | PwC WTS; Tax Foundation real property | country | manual | high |
| vat_standard | Standard VAT rate | EC VAT rates DB / TEDB | country | yes | high |
| tax_treaty | Treaty with home country | OECD treaty DB / IBFD | pair | manual | high |
| totalization_agreement | Social security agreement | SSA (US) / HMRC NI38 (UK) / EC 883/2004 | pair | manual | high |
| church_solidarity | Church tax / solidarity surcharge | PwC WTS; DE BZSt/BMF; AT kirchenbeitrag | country | manual | high |
| municipal_income_tax | Local/municipal income tax | PwC WTS; OECD fiscal decentralisation | country | manual | medium |
| cfc_rules | CFC rules scope | PwC WTS; Tax Foundation (2021) | country | manual | high |
| exit_tax | Individual exit tax | PwC WTS; EP Research brief 2025 | country | manual | high |
| crypto_tax | Crypto tax treatment | PwC WTS; national guidance | country | manual | medium |
| filing_complexity | Filing complexity/deadlines | PwC WTS; national authority | country | manual | medium |

### DROP
- Blended effective investment-income rate: no harmonised pan-EU source (needs modelling).
- Pillar Two per-country status: advisory trackers only (PwC/Deloitte), not stable cited fields.
- Gift-tax annual exclusion amounts: inconsistent granularity across countries.
- Inheritance-tax residency trigger (domicile/residence/situs): too legal/jurisdictional.

---

## 3. Visas, immigration and citizenship  (COMPLETE)

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| dnv_income_floor | Digital nomad visa income floor | National ministry pages | country | manual | medium |
| golden_visa_status | Golden visa thresholds/status | National ministry / official press | country | manual | medium |
| retiree_visa_floor | Passive-income/retiree visa floor | National ministry | country | manual | medium |
| pr_years | Years of residence to PR | National law / EU portal | country | manual | high |
| citizenship_years | Years to naturalisation | GLOBALCIT CITLAW (ANAT06a) | country | partial | high |
| dual_citizenship | Dual citizenship allowed | GLOBALCIT (A06b / L01) | country | partial | high |
| citizenship_by_descent | Descent (ius sanguinis) eligibility | GLOBALCIT (A01 series) | country | partial | high |
| citizenship_language | Language requirement | GLOBALCIT (A06c) | country | partial | high |
| citizenship_civic_test | Civic knowledge test | GLOBALCIT (A06d) | country | partial | high |
| passport_strength | Visa-free destinations of passport | Henley Passport Index | country | manual | medium |
| family_reunification | Family reunification rules | EU Directive 2003/86/EC (EUR-Lex) | country | manual | high |
| blue_card_threshold | EU Blue Card salary threshold | EU Directive 2021/1883; EC Home Affairs | country | manual | high |
| schengen_visa_fee | Schengen visa fee | EC (Visa Code 810/2009) | country | manual | high |
| startup_visa | Startup/entrepreneur visa | National schemes (FR, EE, PT, DE, NL) | country | manual | medium |

### DROP
- Visa-on-arrival for your passport (relational live): Timatic/Henley/Arton are paid/restricted.
- Military service obligation: not a coded field in GLOBALCIT.

---

## 4. Climate, light and weather  (COMPLETE)

Lived-experience framing held: no single "annual sunshine hours" proxy; use clear-sky days,
real daylight, and swimming-season length.

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| koppen_class | Koppen-Geiger class | GloH2O Koppen-Geiger | town | partial | high |
| temp_monthly_high | Monthly avg max temp | WorldClim 2.1 (tmax) | town | partial | high |
| temp_monthly_low | Monthly avg min temp | WorldClim 2.1 (tmin) | town | partial | high |
| diurnal_range | Mean diurnal range | WorldClim BIO2 | town | partial | high |
| temp_seasonality | Temperature seasonality | WorldClim BIO4 | town | partial | high |
| warmest_month_high | Max temp warmest month | WorldClim BIO5 | town | partial | high |
| coldest_month_low | Min temp coldest month | WorldClim BIO6 | town | partial | high |
| precip_annual | Annual precipitation | WorldClim BIO12 | town | partial | high |
| precip_driest_month | Precip driest month | WorldClim BIO14 | town | partial | high |
| sea_temp_monthly | Sea temperature by month | NOAA OISST v2.1 (sst.mon.mean) / Copernicus Marine MED+ATL | town(coast) | partial | high |
| swimming_season | Months with sea temp >20C | derived from NOAA OISST / Copernicus | town(coast) | partial | high |
| clear_sky_days | Clear-sky days per year | Copernicus ERA5 (total_cloud_cover) | town | partial | medium |
| winter_daylight | December daylight hours | Astronomical calc (Forsythe 1995 / Spencer) | town | yes | high |
| uv_index_monthly | Monthly UV index | TEMIS UV climatology (Europe grid, NetCDF) | town | partial | high |
| snowfall_days | Snowfall days per year | Copernicus ERA5 (snowfall) | town | partial | medium |

Notes: WorldClim/ERA5/NOAA/Copernicus all need a one-time geospatial point-sample build
(`scripts/geo-build.ts`); they bake into the dataset, not per request. Daylight is pure math,
no dataset. TEMIS Europe UV files are ~130-190 MB NetCDF, free, no login.

### DROP
- None essential. Growing-season length and heatwave frequency are ERA5-derivable later.

---

## 5. Travel, connectivity and work  (COMPLETE)

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| nearest_airport | Nearest airport + distance | OurAirports | town | yes | high |
| airport_type | Airport size class | OurAirports | town | yes | high |
| direct_destinations | Direct destinations (skeleton) | OpenFlights routes (stale 2014) | town | yes | medium |
| flight_time_home | Flight time to home (computed) | Great-circle calc | pair | yes | medium |
| rail_station | Intercity rail station present | OSM railway=station | town | yes | high |
| high_speed_rail | High-speed rail within 50km | OSM (highspeed) | town | yes | medium |
| transit_lines | Public transit route count | OSM route relations | city | yes | medium |
| bike_share | Bike-share present | OSM bicycle_rental | city | yes | high |
| ev_charging | EV charging density | OSM charging_station | city | yes | high |
| walkability_proxy | Walkability proxy | OSM intersection+amenity density | city | yes | medium |
| broadband_speed | Fixed broadband median Mbps | Ookla Open Data | tile | yes | high |
| mobile_speed | Mobile median Mbps | Ookla Open Data | tile | yes | high |
| timezone_offset | UTC offset / client overlap | IANA tz database | country | yes | high |
| schengen_member | Schengen membership | EC official list | country | manual | high |
| company_formation | Company formation ease | World Bank B-READY 2025 | country | partial | medium |

### DROP
- Live direct flights to your hubs: only stale OpenFlights free; current schedules are paid (OAG/Cirium).
- Flight price index: scraping prohibited (Kayak/Skyscanner); no open benchmark.
- Airport lounge count, co-living spaces, airline-alliance coverage: no open structured source.

---

## 6. Nature and outdoors  (PARTIAL, re-run pending)

Founder priority (hiking, scenery, the nature you like). Sources verified so far: OpenStreetMap
(hiking trails highway=path, ski piste, climbing, water bodies), Copernicus CORINE Land Cover
(scenery types: coast/mountain/forest/lake/plains), WDPA/Protected Planet and Natura 2000
(protected areas), Natural Earth coastline (coast distance), SRTM/OpenTopography (elevation),
EFFIS (wildfire), EEA bathing-water quality, OpenAQ (PM2.5), VIIRS (light pollution/dark sky).
Pollen via Copernicus CAMS is at risk. Needs a clean single-agent pass to finalise the table and
the auto-pull notes.

## 7. Health, family and schooling  (PARTIAL, re-run pending)

Verified anchors: WHO Global Health Observatory (physicians, life expectancy), OECD Health and
Family databases (beds, out-of-pocket spend, childcare), OECD PISA (school outcomes), OSM
(pharmacies, hospitals, dentists). International-school directories (Council of International
Schools / ISC Research) and Montessori/Waldorf association directories were being verified when
the sweep rate-limited. Likely DROP: English-speaking-doctor availability, international-school
tuition (no open dataset). Needs a clean pass.

## 8. Safety, rights, culture, community and services  (PARTIAL, re-run pending)

Founder priorities (LGBT acceptance, running clubs, trades). Intended anchors, mostly known-good:
IEP Global Peace Index, UNODC homicide, Transparency International CPI, World Bank WGI, ILGA-Europe
Rainbow Map (legal) and Equaldex acceptance index (social acceptance), Georgetown WPS (women's
safety), RSF press freedom, EF EPI (English), parkrun open data (running events), OSM
(cafes/coffee, restaurants, nightlife, gyms/fitness_centre, sauna, climbing, swimming pools,
museums, libraries, craft= tradespeople density), Eurostat foreign-born share (expat proxy), WHO
(smoking/alcohol). Likely DROP: Internations/Meetup group counts (no open source). The
synthesising agents rested before producing the final table; needs a clean pass.
