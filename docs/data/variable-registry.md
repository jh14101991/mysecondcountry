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
> Provenance note: assembled from a research sweep on 2026-06-24, completed by a controlled
> single-agent pass per category. All 8 categories are now COMPLETE (roughly 200 variables).
>
> Operating note: this registry names the variable universe. `docs/data/variable-matrix-contract.md`
> defines how those variables are evaluated per place, including intended granularity, observed
> granularity, coverage status, and publish thresholds.

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

## 6. Nature and outdoors  (COMPLETE)

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| pm25_annual | PM2.5 annual mean | EEA interpolated air-quality grid | ~1km | yes | high |
| pm25_monthly | PM2.5 monthly mean | Copernicus CAMS EAC4 reanalysis | grid | yes | high |
| pm25_exceedance_days | Days over WHO PM2.5 guideline | EEA Air Quality e-Reporting | station | yes | high |
| dist_coast_km | Distance to coast | Natural Earth coastline + NOAA distance grid | point | yes | high |
| elevation_m | Elevation | SRTM via OpenTopography API | 30m | yes | high |
| mountain_proximity | Distance to peak >=1500m | SRTM-derived | derived | partial | high |
| ski_piste_km | Downhill piste km nearby | OSM piste:type=downhill / OpenSkiStats | way | yes | medium |
| bathing_water_quality | Bathing-water quality rating | EEA Bathing Water Directive (DISCODATA) | site | yes | high |
| blue_flag_beaches | Blue Flag beaches nearby | JRC Blue Flags dataset | point | partial | medium |
| seismic_hazard_pga | Earthquake hazard (PGA) | ESHM20 European Seismic Hazard Model | ~10km | yes | high |
| wildfire_risk | Wildfire risk class | EFFIS Wildfire Risk (WMS) | ~1km | partial | high |
| flood_risk_100yr | River flood depth, 100-yr | JRC Global River Flood Hazard v2 | 30-75m | yes | high |
| green_space_pct | Green/vegetated land share | Copernicus CORINE Land Cover 2018 | 100m | yes | high |
| forest_cover_pct | Forest cover percent | Copernicus HRL Forest Type 2018 | 10-100m | yes | high |
| tree_canopy_pct | Tree canopy density | Copernicus HRL Tree Cover Density | 10m | yes | high |
| protected_area_overlap | Protected area nearby | EEA Natura 2000 + WDPA (Protected Planet) | polygon | yes | high |
| nat_park_dist_km | Distance to national park | WDPA (IUCN Cat II) | polygon | yes | high |
| surface_water_density | Lake/river area share | JRC Global Surface Water Explorer | 30m | yes | high |
| hiking_trail_km | Hiking trail km nearby | OSM route=hiking / Waymarked Trails | way | yes | medium |
| mtb_trail_count | Mountain-bike routes nearby | OSM route=mtb | way | yes | medium |
| climbing_sites | Rock-climbing sites nearby | OSM sport=climbing | point | yes | medium |
| surf_spots | Surf spots nearby | OSM sport=surfing | point | yes | low |
| light_pollution | Night-sky radiance | VIIRS Black Marble / NOAA DNB | 500m | yes | high |
| pollen_severity | Pollen season severity | Copernicus CAMS pollen species | ~10km | yes | high |
| scenery_tags | Coast/mountain/forest/lake/plain present | derived: Natural Earth, SRTM, CORINE, JRC GSW | derived | yes | high |
| green_urban_pct | Green urban space share | Copernicus Urban Atlas | FUA | partial | high |

### DROP
- Surf-spot quality (wave/break): only commercial/scrape sources.
- Dark-sky certified reserves as a polygon layer: DarkSky lists, no open geodataset.
- Via-ferrata / multi-pitch route density: no open licensed dataset.
- Snowpack / snow-season length at town level: ERA5-derivable but no ready product.
- Landslide / ground-instability hazard: no unified Europe-wide open dataset.
- Wild-camping legality, scenic-vs-industrial coast quality: no machine-readable source.

## 7. Health, family and schooling  (COMPLETE)

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| physicians_per_1k | Physicians per 1,000 | Eurostat hlth_rs_prsns / WHO-EURO / OECD | country | yes | high |
| hospital_beds_per_1k | Hospital beds per 1,000 | WHO GHO / Eurostat hlth_rs_bdsns | country | yes | high |
| life_expectancy | Life expectancy at birth | Eurostat / OECD | country | yes | high |
| infant_mortality | Infant mortality rate | OECD / Eurostat | country | yes | high |
| public_health_coverage | Public health coverage share | OECD Health at a Glance | country | partial | high |
| oop_spending_share | Out-of-pocket health spend share | Eurostat / OECD SHA | country | yes | high |
| dentists_per_100k | Dentists per 100k | Eurostat hlth_rs_prs2 | country | yes | high |
| pharmacists_per_100k | Pharmacists per 100k | Eurostat hlth_rs_prs2 | country | yes | high |
| psychiatrists_per_100k | Psychiatrists per 100k | WHO-EURO HFA-DB | country | partial | medium |
| paediatricians_per_10k | Paediatricians per 10k | WHO-EURO HFA-DB | country | partial | medium |
| vaccination_dtp3 | DTP3 immunisation coverage | WHO Immunization Data (WUENIC) | country | yes | high |
| vaccination_mmr | MMR immunisation coverage | WHO Immunization Data | country | yes | high |
| ivf_access | IVF/ART access score | Fertility Europe Atlas 2024 | country | manual | medium |
| ltc_beds_per_100k | Long-term care beds per 100k | Eurostat hlth_rs_bdltc | country | yes | high |
| ltc_quality | Elder-care quality (infections, pressure ulcers, benzodiazepines) | OECD Health at a Glance, Safe long-term care | country | manual | medium |
| english_for_health | English usable for healthcare (population proxy) | EF English Proficiency Index | country | partial | medium |
| intl_schools_count | International schools count | ISC Research / CIS directory | country | partial | medium |
| intl_school_tuition | Median intl-school tuition | International Schools Database | city | manual | medium |
| montessori_presence | Montessori presence | AMI country directory | country | manual | medium |
| waldorf_presence | Waldorf-Steiner presence | ECSWE member list | country | manual | medium |
| homeschool_legal | Home-education legal status | National legislation / HSLDA survey | country | manual | medium |
| childcare_cost | Net childcare cost (% wage) | OECD Family DB | country | yes | high |
| ecec_enrolment_under3 | Childcare enrolment under 3 | Eurostat ilc_caindformal | country | yes | high |
| pisa_reading | PISA reading score | OECD PISA 2022 | country | yes | high |
| pisa_maths | PISA maths score | OECD PISA 2022 | country | yes | high |
| pisa_science | PISA science score | OECD PISA 2022 | country | yes | high |
| pupil_teacher_ratio | Pupil-teacher ratio | OECD Education at a Glance | country | yes | high |
| clil_bilingual | Bilingual (CLIL) provision | Eurydice Key Data on Languages | country | manual | medium |
| special_needs | SEN inclusion policy | European Agency / Eurydice | country | manual | medium |
| maternity_leave_weeks | Paid maternity leave (weeks) | OECD Family DB PF2.1 | country | yes | high |
| parental_leave_weeks | Total paid parental leave | OECD Family DB PF2.1 | country | yes | high |
| top_university_qs | Top QS university + rank | QS World University Rankings | country | manual | high |
| pharmacy_density | Pharmacy density | OSM amenity=pharmacy | town | yes | medium |
| hospital_density | Hospital count | OSM amenity=hospital | town | yes | medium |
| dentist_density | Dentist density | OSM amenity=dentist | town | yes | medium |

### DROP
- English-speaking-doctor availability as a distinct figure: no per-country dataset (IAMAT is a city directory). Use the English-proficiency proxy above, labelled as population-level.
- Health-system rank: WHO abandoned the ranking after 2000; no current comparable list.
- Mental-health (psychiatric) bed density: WHO-EURO series too gappy for auto-pull.
- Private/expat health-insurance cost for older movers: no age-accurate per-country table (the Pacific Prime report benchmarks age ~36). Becomes a computed field only with a live quote API, which is also an affiliate surface; defer to monetization.
- Bilingual-school city count, SEN numeric score, pan-EU dental price series: no source.

## 8. Safety, rights, culture, community and services  (COMPLETE)

### KEEP

| key | label | source | gran | auto | conf |
|---|---|---|---|---|---|
| gpi_score | Global Peace Index | IEP Global Peace Index | country | yes | high |
| homicide_rate | Homicide per 100k | UNODC / Eurostat crim_off_cat | country | yes | high |
| recorded_crime | Recorded offences per 100k | Eurostat crim_off_cat | country | yes | high |
| corruption_cpi | Corruption Perceptions Index | Transparency International CPI | country | yes | high |
| pol_stability | Political stability percentile | World Bank WGI | country | yes | high |
| govt_effectiveness | Government effectiveness | World Bank WGI | country | yes | high |
| rule_of_law | Rule of law percentile | World Bank WGI | country | yes | high |
| lgbt_legal | LGBTI legal rights score | ILGA-Europe Rainbow Map | country | yes | high |
| lgbt_social | LGBT social acceptance | Equaldex acceptance index | country | partial | high |
| lgbt_combined | LGBT combined equality | Equaldex Equality Index | country | yes | high |
| womens_safety | Women Peace & Security score | Georgetown WPS Index | country | yes | high |
| press_freedom | Press freedom score | Reporters Without Borders | country | yes | high |
| english_proficiency | English proficiency | EF EPI | country | partial | high |
| parkrun_events | Active parkrun events | parkrun.com/countries | country | yes | high |
| craft_plumber | Plumbers per 100k | OSM craft=plumber | town | partial | medium |
| craft_electrician | Electricians per 100k | OSM craft=electrician | town | partial | medium |
| craft_carpenter | Carpenters per 100k | OSM craft=carpenter | town | partial | medium |
| craft_builder | Builders per 100k | OSM craft=builder | town | partial | low |
| gym_density | Gyms per 100k (lifting via sport=weightlifting) | OSM leisure=fitness_centre | town | partial | medium |
| sauna_density | Saunas per 100k | OSM leisure=sauna | town | partial | medium |
| climbing_gym | Indoor climbing gyms | OSM sport=climbing + sports_centre | town | partial | medium |
| swimming_pool | Public pools per 100k | OSM leisure=swimming_pool | town | partial | medium |
| cafe_density | Cafe density (coffee culture) | OSM amenity=cafe | town | partial | medium |
| restaurant_density | Restaurant density | OSM amenity=restaurant | town | partial | medium |
| nightlife_density | Bars/clubs per 100k | OSM amenity=bar/nightclub | town | partial | medium |
| museum_gallery | Museums/galleries per 100k | OSM tourism=museum/gallery | town | partial | medium |
| library_density | Libraries per 100k | OSM amenity=library | town | partial | medium |
| theatre_cinema | Theatres/cinemas per 100k | OSM amenity=theatre/cinema | town | partial | medium |
| dog_park / vet | Dog parks + vets (dog-friendliness) | OSM leisure=dog_park, amenity=veterinary | town | partial | medium |
| foreign_born_share | Foreign-born population share | Eurostat tps00178 | country | yes | high |
| religiosity | Non-religious share / attendance | Pew / European Social Survey | country | partial | medium |
| vegan_friendly | Vegan-friendly ranking | HappyCow Top Cities | city | manual | medium |
| smoking_prevalence | Adult smoking prevalence | WHO / Eurostat | country | yes | high |
| alcohol_consumption | Alcohol litres per capita | WHO / OECD | country | yes | high |
| cannabis_status | Cannabis legal status | EU Drugs Agency (EUDA) | country | manual | high |
| noise_pollution | Population over road-noise threshold | EEA Environmental Noise | country | yes | high |
| social_trust | Interpersonal trust (0-10) | European Social Survey (ppltrst) | country | yes | high |
| ethnic_fractionalization | Ethnic fractionalization index | HIEF (Harvard Dataverse) | country | yes | medium |
| running_hiking_clubs | Sport/outdoor club count | OSM club=sport | town | partial | low |

### DROP
- Internations/Meetup group counts: no open API/dataset.
- Running and hiking club density beyond OSM: federations publish no city-level open data.
- Gym "serious-lifting" quality tier: OSM cannot distinguish beyond sport=weightlifting.
- Dog-friendliness composite, cafe-culture composite: only the component proxies exist, no index.
- Noise by arbitrary city: EEA reports by agglomeration only, not arbitrary towns.
- Social attitudes to smoking: only prevalence exists, not cultural acceptance.

---

## Status and the build implication

All 8 categories complete: roughly 200 cited variables, the large majority auto-pullable on a
cron. This registry is now the build plan for the data pipeline (it names every source to wire),
and it confirms the cited-only + exhaustive vision is buildable. Granularity splits cleanly:
country-level institutional data (tax, visa, safety, health, English, indices) pulls fastest and
wide; the town-level lifestyle layer (OSM amenities, climate/nature point-samples) is what makes
the filter surface feel like Hotelist and is concentrated on the flagship cities first (hybrid C).
The honest drop list across all categories stays short and specific, mostly paid flight schedules,
abandoned official rankings, and "composite vibe" scores that have only component proxies.
