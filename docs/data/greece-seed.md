# Greece seed facts

> SEED FILE, do not publish without verification. Every fact below is flagged SEED. The refresh pipeline and human merge gate MUST re-verify each entry against its primary source before any page presents it as current. The 90-day staleness rule from CITATIONS.md applies to all entries here. Confidence and verifiedDate are set by the founder dogfooding; treat them as provisional until the first pipeline run confirms them.

---

## How to read this file

Each fact maps directly to a `CitedValue` in the Zod schema:

```ts
{
  value: ..., sourceUrl: string, sourceName: string, verifiedDate: "SEED-UNVERIFIED", // pipeline replaces this on first run
  confidence: "seed", // pipeline promotes to low/medium/high after re-verify
  granularity: "country" | "region" | "town", seedFlag: true                      // strip this field before publishing any page
}
```

No page may render a `seedFlag: true` value. The pipeline script `scripts/verify-seed.ts` must flip each entry to `seedFlag: false` after fetching the sourceUrl, parsing the claim, and logging a diff. The human merge gate on the PR is the final check before any page goes live.

---

## Fact 1: 7% flat tax for foreign pensioners (Article 5B, Law 4172/2013)

**Claim:** Greece taxes qualifying foreign pensioners at a flat 7% on all foreign-source income (pensions, dividends, capital gains, rental income sourced abroad) for up to 15 consecutive tax years. The regime does not cap the income amount.

**Eligibility conditions (all must be met):**

1. Not a Greek tax resident in at least 5 of the 6 tax years immediately preceding the year of application.
2. Income qualifies as a pension from a foreign source (employment or other foreign-source income may qualify under sub-provisions; verify current AADE guidance).
3. Greece has a tax-cooperation or tax-information-exchange agreement with the applicant's prior country of tax residence.
4. The applicant physically resides in Greece for at least 183 days in the tax year (establishing Greek tax residency is required to claim the regime).
5. Application submitted to the competent AADE tax office by 31 March of the tax year for which the regime is first claimed.

**Duration:** Up to 15 years from the first year of application. No renewal required year-to-year, but continued eligibility must be maintained.

**What is NOT covered:** Greek-source income is taxed at standard Greek progressive rates alongside the flat 7% on foreign income.

**Source:**

```json
{
  "sourceUrl": "https://www.aade.gr/menoy/forologikes-ypokhreoseis/forologikes-kinhtres-gia-tin-proselkysh-forologoymenon/forologikes-katoikoi-eksoterikoy-arthro-5v", "sourceName": "AADE (Independent Authority for Public Revenue), Article 5B tax incentives page", "verifiedDate": "SEED-UNVERIFIED", "confidence": "seed", "granularity": "country", "seedFlag": true
}
```

**Pipeline re-verify instruction:** Fetch the AADE Article 5B page. Confirm the flat rate is still 7%, the 15-year cap, the 5-of-6-years residency bar, and the 31 March deadline. Check whether the 2024 or 2025 budget laws (Greece has amended the incentive package multiple times) changed any condition. If AADE has moved the page, search aade.gr for "5Β" or "φορολογικοί κάτοικοι εξωτερικού".

---

## Fact 2: Non-dom EUR 100,000 flat tax (Article 5A, Law 4172/2013)

**Claim:** High-net-worth individuals who transfer their tax residence to Greece may pay a flat EUR 100,000 per year on all foreign-source income, regardless of amount. Each additional family member covered under the same application pays EUR 20,000 per year. Duration is up to 15 years.

**Eligibility conditions (all must be met):**

1. Not a Greek tax resident in at least 7 of the 8 tax years immediately preceding the year of application.
2. Invest at least EUR 500,000 in Greek real estate, businesses, or securities within 3 years of the application. The investment condition is waived for Golden Visa permit holders (the Golden Visa itself evidences a qualifying investment).
3. Application submitted to AADE by 31 March of the relevant tax year.

**What is NOT covered:** Greek-source income taxed at standard rates; the flat payment is purely for foreign-source income.

**Source:**

```json
{
  "sourceUrl": "https://www.aade.gr/menoy/forologikes-ypokhreoseis/forologikes-kinhtres-gia-tin-proselkysh-forologoymenon/forologikes-katoikoi-eksoterikoy-arthro-5a", "sourceName": "AADE, Article 5A non-dom flat tax page", "verifiedDate": "SEED-UNVERIFIED", "confidence": "seed", "granularity": "country", "seedFlag": true
}
```

**Pipeline re-verify instruction:** Confirm the EUR 100,000 and EUR 20,000 per-member amounts are unchanged, the 7-of-8-years bar, the EUR 500,000 investment floor and the Golden Visa waiver, and the 15-year cap. Cross-check the AADE page with the official Greek Government Gazette (FEK) text of Law 4172/2013 as amended. Note that Articles 5A/5B/5C have been amended by several successive finance laws; always cite the current consolidated text.

---

## Fact 3: 50% income-tax exemption for relocating professionals (Article 5C, Law 4172/2013)

**Claim:** Employees and self-employed individuals who transfer their tax residence to Greece and take up employment or professional activity in Greece receive a 50% exemption on Greek-source employment and business income for up to 7 years.

**Eligibility conditions (all must be met):**

1. Not a Greek tax resident in at least 5 of the 6 tax years immediately preceding the year of application.
2. The applicant moves from an EU/EEA member state or from a country with which Greece has a tax-cooperation agreement.
3. Must commit to remain a Greek tax resident for at least 2 years.
4. Application submitted to AADE by 31 March of the first year of the claim.

**Duration:** Up to 7 consecutive tax years.

**Note:** This regime applies to Greek-source income only (employment, freelance, business). It is structurally different from Articles 5A and 5B, which cover foreign-source income.

**Source:**

```json
{
  "sourceUrl": "https://www.aade.gr/menoy/forologikes-ypokhreoseis/forologikes-kinhtres-gia-tin-proselkysh-forologoymenon/forologikes-katoikoi-eksoterikoy-arthro-5g", "sourceName": "AADE, Article 5C (5Γ) relocation exemption page", "verifiedDate": "SEED-UNVERIFIED", "confidence": "seed", "granularity": "country", "seedFlag": true
}
```

**Pipeline re-verify instruction:** AADE uses the Greek letter Γ (Gamma) for Article 5C in its URL path (5g in ASCII romanisation). Confirm the 50% rate, the 7-year cap, the EU/EEA-or-treaty-country condition, the 2-year commitment, and the 31 March deadline. Verify whether a 2024 amendment extended the regime or changed the eligible applicant categories.

---

## Fact 4: Golden Visa real-estate thresholds (2026, tiered)

**Claim:** Greece's Golden Visa (Investor Residency Permit) grants a 5-year renewable residence permit, including family members, with no minimum-stay requirement. As of 2026 the real-estate investment thresholds are tiered:

| Threshold | Applicable areas / conditions |
|---|---|
| EUR 800,000 | High-demand areas: the Regional Unit of Attica (including greater Athens and the Athens Riviera), the Regional Unit of Thessaloniki, the municipalities of Mykonos and Santorini, and islands with a registered population above 3,100. Single property; minimum 120 sqm floor area. |
| EUR 400,000 | All other areas of Greece not listed above. Single property; minimum 120 sqm floor area. |
| EUR 250,000 | Exclusively for: (a) commercial-to-residential conversion of an existing building (full conversion required before permit issue), or (b) restoration or reconstruction of a listed/heritage building. No minimum sqm applies to this tier. |

**Family coverage:** Spouse or civil partner, minor children, adult children under 21 (in full-time education), and dependent parents of both spouses are included on the same permit.

**Key change to note for content:** The old flat EUR 250,000 threshold that applied universally was abolished in stages in 2024 and 2025. Content that cites EUR 250,000 as the general floor is outdated. The pipeline must flag any cached content containing "250,000" in a Golden Visa context for human review.

**Source:**

```json
{
  "sourceUrl": "https://migration.gov.gr/ep-ependytes/", "sourceName": "Greek Ministry of Migration and Asylum, Investor Residency Permit page", "verifiedDate": "SEED-UNVERIFIED", "confidence": "seed", "granularity": "country", "seedFlag": true
}
```

**Pipeline re-verify instruction:** Fetch the migration.gov.gr investor page. Confirm all three tiers and their applicable zones. Cross-reference the official FEK text (Law 4251/2014 as amended by Law 5007/2022, Law 5055/2023, and any 2025 amendment). The island population threshold of 3,100 has been contested in press; verify it is still the operative figure. Check whether the 120 sqm minimum applies to the EUR 400,000 tier as well as EUR 800,000 (seed assumption: yes, both). Also confirm the 5-year renewal cadence and whether any minimum-stay obligation has been introduced since 2025.

---

## Fact 5: Digital Nomad Visa income floor (2026)

**Claim:** Greece's Digital Nomad Visa (officially "Residence Permit for Remote Work") requires a minimum net monthly income of EUR 3,500 from a non-Greek employer or clients. The income floor increases by 20% for a accompanying spouse or civil partner (approximately EUR 4,200 combined), and by 15% per dependent child.

The visa is issued initially for 12 months and is convertible to a 2-year renewable permit.

**Additional requirements:** Private health insurance covering Greece, a clean criminal record, and confirmed accommodation in Greece (lease or ownership evidence).

**Critical 2026 change (Law 5275/2026, in force 5 February 2026):** In-country applications for the Digital Nomad Visa are abolished. All applications must now be submitted at a Greek consulate or embassy in the applicant's country of residence before entering Greece. This reverses the previous flexibility that allowed applicants already in Greece to apply locally.

**Source:**

```json
{
  "sourceUrl": "https://migration.gov.gr/digital-nomads/", "sourceName": "Greek Ministry of Migration and Asylum, Digital Nomad Visa page", "verifiedDate": "SEED-UNVERIFIED", "confidence": "seed", "granularity": "country", "seedFlag": true
}
```

**Pipeline re-verify instruction:** Fetch the migration.gov.gr digital-nomads page. Confirm EUR 3,500 floor, the +20% and +15% uplifts, the 12-month to 2-year conversion path, and the in-country application abolition effective 5 February 2026. Verify that Law 5275/2026 is the correct citation. Check whether any further amendment has been passed since February 2026. This fact has a high staleness risk because Greek immigration rules have changed repeatedly; set the staleness interval to 60 days (overriding the default 90-day rule) in the CitedValue metadata.

---

## Fact 6: Dominant climate classification

**Claim:** Most coastal and southern areas of Greece are classified Köppen-Geiger Csa (hot-summer Mediterranean), characterised by hot dry summers, mild wet winters, and year-round sunshine on the Aegean coast. Inland, northern, and higher-elevation areas shift to Cfa (humid subtropical), Csb (warm-summer Mediterranean), or Dsb (warm-summer humid continental) depending on altitude and latitude.

**Resolution and method:** Climate classification should be sampled per town using the 1 km resolution Köppen-Geiger v2 GeoTIFF raster available from gloh2o.org. For each Place object with a lat/lon, the pipeline reads the pixel value at the town centroid and maps the integer code to the Köppen class string.

**Source:**

```json
{
  "sourceUrl": "https://www.gloh2o.org/koppen/", "sourceName": "gloh2o.org, Köppen-Geiger 1 km climate classification raster (Beck et al. 2023)", "verifiedDate": "SEED-UNVERIFIED", "confidence": "seed", "granularity": "town", "seedFlag": true
}
```

**Pipeline re-verify instruction:** Download the current GeoTIFF from gloh2o.org/koppen and record the dataset version and publication date. For each Greek town in the seed dataset, sample the raster at the town centroid lat/lon. Store the resulting Köppen code (e.g. "Csa") as the `climateClass` field and the raster version as `climateRasterVersion`. Do not hardcode class strings: always derive them from the raster at build time so they update when a newer version of the dataset is released.

---

## End-of-file verification instruction

These are SEED values. The founder dogfooded them for schema-proof purposes only.

Before any page presents a value from this file as current:

1. The `scripts/verify-seed.ts` pipeline script must fetch each `sourceUrl`, extract the relevant claim, compare it to the stored value, and log a structured diff.
2. Any changed value must be flagged in the PR body for human review. The pipeline opens the PR; the human merge is the gate.
3. On successful verification, the script sets `verifiedDate` to the ISO date of the fetch, promotes `confidence` from `"seed"` to `"medium"` or `"high"` based on the match quality, and removes `seedFlag`.
4. The Digital Nomad Visa entry (Fact 5) uses a 60-day staleness interval, not the default 90-day rule, due to documented history of rapid rule changes.
5. The Golden Visa entry (Fact 4) must trigger an additional content-scan step: any cached page or social post containing "250,000" in a Golden Visa context must be flagged for manual review before the next publish.
6. The FENCE.md liability disclaimer must appear on every page that renders any of these facts. Tax and residency claims additionally require the "not legal or tax advice" rider and a link to the relevant primary source.
