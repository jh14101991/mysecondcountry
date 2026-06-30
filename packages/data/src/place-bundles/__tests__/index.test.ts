import { describe, expect, it } from "vitest";
import { collectPlaceBundleCitedValues } from "../facts.js";
import { placeEvidenceBundleById, placeEvidenceBundles } from "../index.js";

const CRETE_IDS = [
  "gr-crete-region",
  "gr-crete-chania",
  "gr-crete-heraklion",
  "gr-crete-rethymno",
  "gr-crete-agios-nikolaos",
];

const CRETE_TOWN_IDS = [
  "gr-crete-chania",
  "gr-crete-heraklion",
  "gr-crete-rethymno",
  "gr-crete-agios-nikolaos",
];

const CANONICAL_ROW_COUNT = 254;

describe("Crete place evidence bundles", () => {
  it("represents every priority Crete candidate", () => {
    expect(placeEvidenceBundles.map((bundle) => bundle.id).sort()).toEqual([...CRETE_IDS].sort());
  });

  it("keeps the canonical 254-row matrix row set consistent across the Crete cluster", () => {
    const canonicalKeys = placeEvidenceBundleById("gr-crete-region")?.rows.map((row) => row.key);
    expect(canonicalKeys).toBeDefined();
    expect(canonicalKeys).toHaveLength(CANONICAL_ROW_COUNT);
    expect(new Set(canonicalKeys).size).toBe(CANONICAL_ROW_COUNT);
    for (const id of CRETE_IDS) {
      const bundle = placeEvidenceBundleById(id);
      expect(bundle, id).toBeDefined();
      if (!bundle) continue;
      expect(bundle.rows.map((row) => row.key)).toEqual(canonicalKeys);
    }
  });

  it("marks Crete evidence bundles ready while keeping completed source gaps visible", () => {
    for (const bundle of placeEvidenceBundles) {
      expect(bundle.status, bundle.id).toBe("data_bundle_ready");
      expect(bundle.publicationRecommendation, bundle.id).toBe("publish");
      expect(bundle.rows.filter((row) => row.sourceGapReason).length, bundle.id).toBeGreaterThan(0);
      expect(
        bundle.rows.some((row) => row.sourceGapReason === "source_search_required"),
        bundle.id,
      ).toBe(false);
    }
  });

  it("attempts the full 254-row template without pretending gaps are facts", () => {
    for (const bundle of placeEvidenceBundles) {
      expect(bundle.rows.length, bundle.id).toBe(CANONICAL_ROW_COUNT);
      expect(bundle.rows.filter((row) => row.sourceGapReason).length, bundle.id).toBeGreaterThan(0);
    }
  });

  it("resolves source-search rows while keeping completed gaps visible", () => {
    for (const bundle of placeEvidenceBundles) {
      expect(
        bundle.rows.some((row) => row.sourceGapReason === "source_search_required"),
        bundle.id,
      ).toBe(false);
      expect(bundle.rows.filter((row) => row.sourceGapReason).length, bundle.id).toBeGreaterThan(0);
    }
  });

  it("keeps transport rows as completed source gaps rather than invented service data", () => {
    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      expect(bundle?.rows.filter((row) => row.cited).length, id).toBeGreaterThanOrEqual(35);
      expect(bundle?.status, id).toBe("data_bundle_ready");
      expect(bundle?.publicationRecommendation, id).toBe("publish");
      expect(
        bundle?.rows.some((row) => row.sourceGapReason === "source_bot_blocked_manual_needed"),
        id,
      ).toBe(true);
    }
  });

  it("resolves inherited national CitedValues and preserves high-liability confidence", () => {
    for (const bundle of placeEvidenceBundles) {
      const facts = collectPlaceBundleCitedValues(bundle);
      expect(facts.length, bundle.id).toBeGreaterThanOrEqual(3);
      for (const { path, cited } of facts) {
        if (
          cited.category === "tax" ||
          cited.category === "visa" ||
          cited.category === "residency"
        ) {
          expect(["high", "medium"], `${bundle.id}:${path}`).toContain(cited.confidence);
        }
      }
    }
  });

  it("populates comparable inherited national context rows across the Crete cluster", () => {
    const inheritedNationalRows = [
      ["inflation_hicp", "money", "cost"],
      ["min_wage", "money", "cost"],
      ["net_salary_avg", "money", "cost"],
      ["hpi", "money", "cost"],
      ["mortgage_rate", "money", "cost"],
      ["broadband_price", "money", "connectivity"],
      ["mobile_price", "money", "connectivity"],
      ["special_inbound_regime", "tax_residency", "tax"],
      ["golden_visa_status", "tax_residency", "residency"],
      ["physicians_per_1k", "health_family_schooling", "healthcare"],
      ["life_expectancy", "health_family_schooling", "healthcare"],
      ["infant_mortality", "health_family_schooling", "healthcare"],
      ["oop_spending_share", "health_family_schooling", "healthcare"],
      ["vaccination_dtp3", "health_family_schooling", "healthcare"],
      ["gpi_score", "safety_rights", "safety"],
      ["homicide_rate", "safety_rights", "safety"],
    ];
    for (const bundle of placeEvidenceBundles) {
      for (const [key, category, citedCategory] of inheritedNationalRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("inherited_national");
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.matrixCategory, `${bundle.id}:${key}`).toBe(category);
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.category, `${bundle.id}:${key}`).toBe(citedCategory);
      }
    }
  });

  it("populates medium-confidence PwC tax context without turning it into advice", () => {
    const pwcTaxRows = [
      "church_solidarity",
      "cfc_rules",
      "ee_social_security",
      "er_social_security",
      "dividend_tax",
      "interest_tax",
      "cgt_rate",
      "rental_income_tax",
      "foreign_income_basis",
      "dtr_method",
      "pension_income_regime",
      "remittance_basis",
      "wealth_tax",
      "inheritance_gift_tax",
      "property_transfer_tax",
      "annual_property_tax",
      "filing_complexity",
    ];

    for (const bundle of placeEvidenceBundles) {
      const expectedStatus = bundle.id === "gr-crete-region" ? "national" : "inherited_national";
      for (const key of pwcTaxRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe(expectedStatus);
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBeUndefined();
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain(
          "PwC Worldwide Tax Summaries",
        );
        expect(row?.cited?.confidence, `${bundle.id}:${key}`).toBe("medium");
        expect(row?.cited?.category, `${bundle.id}:${key}`).toBe("tax");
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.stalenessDays, `${bundle.id}:${key}`).toBe(90);
        expect(row?.notes, `${bundle.id}:${key}`).toContain("secondary synthesis");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not tax advice");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not an individual tax calculation");
      }
    }
  });

  it("populates the latest high-liability national tax, visa, and citizenship batch", () => {
    for (const bundle of placeEvidenceBundles) {
      const expectedStatus = bundle.id === "gr-crete-region" ? "national" : "inherited_national";

      const taxWedge = bundle.rows.find((item) => item.key === "tax_wedge_avg");
      expect(taxWedge?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(taxWedge?.observedGranularity, bundle.id).toBe("country");
      expect(taxWedge?.cited?.value, bundle.id).toBe(39.3);
      expect(taxWedge?.cited?.sourceName, bundle.id).toContain("OECD Taxing Wages 2026");
      expect(taxWedge?.cited?.category, bundle.id).toBe("tax");
      expect(taxWedge?.notes, bundle.id).toContain("not tax advice");

      const municipalIncomeTax = bundle.rows.find((item) => item.key === "municipal_income_tax");
      expect(municipalIncomeTax?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(municipalIncomeTax?.observedGranularity, bundle.id).toBe("country");
      expect(String(municipalIncomeTax?.cited?.value), bundle.id).toContain(
        "No local income taxes",
      );
      expect(municipalIncomeTax?.cited?.sourceName, bundle.id).toContain("OECD Taxing Wages 2026");
      expect(municipalIncomeTax?.cited?.category, bundle.id).toBe("tax");
      expect(municipalIncomeTax?.cited?.confidence, bundle.id).toBe("medium");
      expect(municipalIncomeTax?.cited?.stalenessDays, bundle.id).toBe(90);
      expect(municipalIncomeTax?.notes, bundle.id).toContain("not tax advice");

      const retiree = bundle.rows.find((item) => item.key === "retiree_visa_floor");
      expect(retiree?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(retiree?.observedGranularity, bundle.id).toBe("country");
      expect(retiree?.cited?.value, bundle.id).toContain("sufficient stable annual income");
      expect(retiree?.cited?.sourceName, bundle.id).toContain("Law 5038/2023");
      expect(retiree?.cited?.category, bundle.id).toBe("visa");
      expect(retiree?.notes, bundle.id).toContain("not an eligibility decision");

      const descent = bundle.rows.find((item) => item.key === "citizenship_by_descent");
      expect(descent?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(descent?.observedGranularity, bundle.id).toBe("country");
      expect(descent?.cited?.sourceName, bundle.id).toContain("Mitos");
      expect(descent?.cited?.confidence, bundle.id).toBe("high");
      expect(descent?.notes, bundle.id).toContain("not proof of citizenship eligibility");

      const language = bundle.rows.find((item) => item.key === "citizenship_language");
      expect(language?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(language?.observedGranularity, bundle.id).toBe("country");
      expect(language?.cited?.value, bundle.id).toContain(
        "Certificate of Knowledge Adequacy for Naturalisation",
      );
      expect(language?.cited?.sourceName, bundle.id).toContain("Mitos");
      expect(language?.notes, bundle.id).toContain("not proof of citizenship eligibility");

      const citizenshipYears = bundle.rows.find((item) => item.key === "citizenship_years");
      expect(citizenshipYears?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(citizenshipYears?.observedGranularity, bundle.id).toBe("country");
      expect(citizenshipYears?.cited?.value, bundle.id).toContain("3, 7, and 12");
      expect(citizenshipYears?.cited?.sourceName, bundle.id).toContain("Mitos");
      expect(citizenshipYears?.cited?.confidence, bundle.id).toBe("high");
      expect(citizenshipYears?.cited?.category, bundle.id).toBe("residency");
      expect(citizenshipYears?.notes, bundle.id).toContain("not proof of citizenship eligibility");

      const dualCitizenship = bundle.rows.find((item) => item.key === "dual_citizenship");
      expect(dualCitizenship?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(dualCitizenship?.observedGranularity, bundle.id).toBe("country");
      expect(dualCitizenship?.cited?.value, bundle.id).toContain("not shown as automatic loss");
      expect(dualCitizenship?.cited?.sourceName, bundle.id).toContain("Mitos");
      expect(dualCitizenship?.cited?.confidence, bundle.id).toBe("medium");
      expect(dualCitizenship?.cited?.category, bundle.id).toBe("residency");
      expect(dualCitizenship?.notes, bundle.id).toContain("not legal advice");

      const passport = bundle.rows.find((item) => item.key === "passport_strength");
      expect(passport?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(passport?.observedGranularity, bundle.id).toBe("country");
      expect(passport?.cited?.value, bundle.id).toBe(185);
      expect(passport?.cited?.sourceName, bundle.id).toContain("Henley Passport Index API");
      expect(passport?.notes, bundle.id).toContain("not visa eligibility advice");

      const startup = bundle.rows.find((item) => item.key === "startup_visa");
      expect(startup?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(startup?.observedGranularity, bundle.id).toBe("country");
      expect(startup?.cited?.value, bundle.id).toContain("EUR 250,000");
      expect(startup?.cited?.sourceName, bundle.id).toContain("Law 5162/2024");
      expect(startup?.cited?.category, bundle.id).toBe("visa");
      expect(startup?.notes, bundle.id).toContain("not an eligibility decision");
    }
  });

  it("closes searched high-liability tax rows with conservative official-source screening values", () => {
    for (const bundle of placeEvidenceBundles) {
      const expectedStatus = bundle.granularity === "region" ? "national" : "inherited_national";

      const exitTax = bundle.rows.find((item) => item.key === "exit_tax");
      expect(exitTax?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(exitTax?.observedGranularity, bundle.id).toBe("country");
      expect(exitTax?.sourceGapReason, bundle.id).toBeUndefined();
      expect(exitTax?.cited?.sourceName, bundle.id).toContain("AADE");
      expect(exitTax?.cited?.confidence, bundle.id).toBe("medium");
      expect(exitTax?.cited?.category, bundle.id).toBe("tax");
      expect(exitTax?.cited?.value, bundle.id).toContain("does not publish");
      expect(exitTax?.notes, bundle.id).toContain(
        "not a claim that all exit-tax exposure is impossible",
      );
      expect(exitTax?.notes, bundle.id).toContain("not tax advice");

      const cryptoTax = bundle.rows.find((item) => item.key === "crypto_tax");
      expect(cryptoTax?.coverageStatus, bundle.id).toBe(expectedStatus);
      expect(cryptoTax?.observedGranularity, bundle.id).toBe("country");
      expect(cryptoTax?.sourceGapReason, bundle.id).toBeUndefined();
      expect(cryptoTax?.cited?.sourceName, bundle.id).toContain("AADE");
      expect(cryptoTax?.cited?.confidence, bundle.id).toBe("medium");
      expect(cryptoTax?.cited?.category, bundle.id).toBe("tax");
      expect(cryptoTax?.cited?.value, bundle.id).toContain(
        "does not publish crypto-specific treatment",
      );
      expect(cryptoTax?.notes, bundle.id).toContain("not a claim that crypto gains are tax-free");
      expect(cryptoTax?.notes, bundle.id).toContain("not tax advice");
    }
  });

  it("populates land-registry office distance as a Hellenic Cadastre address plus OSRM route proxy", () => {
    const expected = {
      "gr-crete-region": {
        coverageStatus: "proxy",
        observedGranularity: "region",
        value: "1.3-6.8 minutes",
      },
      "gr-crete-chania": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "1.4 minutes, 0.9 km",
      },
      "gr-crete-heraklion": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "4.3 minutes, 2.9 km",
      },
      "gr-crete-rethymno": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "6.8 minutes, 3.7 km",
      },
      "gr-crete-agios-nikolaos": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "1.3 minutes, 0.3 km",
      },
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "land_registry_office_distance");
      const expectedRow = expected[bundle.id as keyof typeof expected];
      expect(row?.coverageStatus, bundle.id).toBe(expectedRow.coverageStatus);
      expect(row?.observedGranularity, bundle.id).toBe(expectedRow.observedGranularity);
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.category, bundle.id).toBeUndefined();
      expect(row?.cited?.granularity, bundle.id).toBe(expectedRow.observedGranularity);
      expect(String(row?.cited?.value), bundle.id).toContain(expectedRow.value);
      expect(row?.cited?.sourceName, bundle.id).toContain("Hellenic Cadastre");
      expect(row?.unit, bundle.id).toBe(
        "OSRM driving route proxy to Hellenic Cadastre office address",
      );
      expect(row?.notes, bundle.id).toContain("not an official jurisdiction assignment");
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("property advice");
    }
  });

  it("populates light pollution as a VIIRS nighttime-radiance proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "light_pollution");
      const expectedGranularity = bundle.granularity === "region" ? "region" : "town";

      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.observedGranularity, bundle.id).toBe(expectedGranularity);
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.granularity, bundle.id).toBe(expectedGranularity);
      expect(row?.cited?.sourceName, bundle.id).toContain("OpenGeoHub Zenodo annual VIIRS");
      expect(row?.unit, bundle.id).toContain("VIIRS annual average DNB radiance");
      expect(row?.notes, bundle.id).toContain("not Bortle class");
      expect(row?.notes, bundle.id).toContain("not a stargazing guarantee");
      expect(row?.notes, bundle.id).toContain("not street-light coverage");
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("advice");
    }
  });

  it("populates wildfire egress as a low-confidence OSM road-dependence proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "wildfire_egress_proxy");
      const expectedGranularity = bundle.granularity === "region" ? "region" : "town";

      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.observedGranularity, bundle.id).toBe(expectedGranularity);
      expect(row?.cited?.confidence, bundle.id).toBe("low");
      expect(row?.cited?.granularity, bundle.id).toBe(expectedGranularity);
      expect(row?.cited?.category, bundle.id).toBe("safety");
      expect(row?.cited?.sourceName, bundle.id).toContain("OpenStreetMap");
      expect(String(row?.cited?.value), bundle.id).toContain("/100");
      expect(row?.unit, bundle.id).toContain("0-100");
      expect(row?.notes, bundle.id).toContain("evacuation route");
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("safety");
    }
  });

  it("populates drought frequency as an EDO CDI sampled proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "drought_frequency_proxy");
      const expectedGranularity = bundle.granularity === "region" ? "region" : "town";

      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.observedGranularity, bundle.id).toBe(expectedGranularity);
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.granularity, bundle.id).toBe(expectedGranularity);
      expect(row?.cited?.sourceName, bundle.id).toContain("European Drought Observatory");
      expect(row?.unit, bundle.id).toContain("EDO CDI ten-day observations");
      expect(row?.notes, bundle.id).toContain("not household water-service evidence");
      expect(row?.notes, bundle.id).toContain("not a current restriction or outage status");
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("advice");
    }
  });

  it("populates forest and tree canopy as Copernicus HRL sampled proxies", () => {
    for (const bundle of placeEvidenceBundles) {
      for (const key of ["forest_cover_pct", "tree_canopy_pct"] as const) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("proxy");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBeUndefined();
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe(
          bundle.granularity === "region" ? "region" : "town",
        );
        expect(row?.cited?.confidence, `${bundle.id}:${key}`).toBe("medium");
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe(
          bundle.granularity === "region" ? "region" : "town",
        );
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain("Copernicus/EEA");
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain("2018");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("property advice");
      }
    }
  });

  it("populates surface-water density as an OSM mapped inland-water proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "surface_water_density");
      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.observedGranularity, bundle.id).toBe(
        bundle.granularity === "region" ? "region" : "town",
      );
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.granularity, bundle.id).toBe(
        bundle.granularity === "region" ? "region" : "town",
      );
      expect(row?.cited?.sourceName, bundle.id).toContain("OpenStreetMap");
      expect(row?.unit, bundle.id).toContain("OSM mapped inland-water polygon proxy");
      expect(row?.notes, bundle.id).toContain("not JRC Global Surface Water");
      expect(row?.notes, bundle.id).toContain("not household water-service evidence");
      expect(row?.notes, bundle.id).toContain("not flood risk");
      expect(row?.notes, bundle.id).toContain("not legal");
    }
  });

  it("populates water-stress baseline as WRI Aqueduct regional context", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "water_stress_baseline");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.coverageStatus, bundle.id).toBe(
        bundle.granularity === "region" ? "regional" : "inherited_regional",
      );
      expect(row?.observedGranularity, bundle.id).toBe("region");
      expect(row?.cited?.granularity, bundle.id).toBe("region");
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.sourceName, bundle.id).toContain("WRI Aqueduct 4.0");
      expect(row?.cited?.value, bundle.id).toContain("Extremely High (>80%)");
      expect(row?.notes, bundle.id).toContain("regional water-stress screening context");
      expect(row?.notes, bundle.id).toContain("not a household service guarantee");
      expect(row?.notes, bundle.id).toContain("not a water-quality claim");
      expect(row?.notes, bundle.id).toContain("not a future restriction prediction");
    }
  });

  it("populates pollen severity as a cited Open-Meteo CAMS grid proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "pollen_severity");
      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.sourceName, bundle.id).toContain("Open-Meteo");
      expect(row?.cited?.sourceName, bundle.id).toContain("CAMS pollen");
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("allergy-risk");
      expect(row?.notes, bundle.id).toContain("current");
    }
  });

  it("populates citizen-service centre distance as an official-address plus OSRM route proxy", () => {
    const expected = {
      "gr-crete-chania": "0.8 minutes, 0.2 km",
      "gr-crete-heraklion": "0.1 minutes, 0 km",
      "gr-crete-rethymno": "1.8 minutes, 0.9 km",
      "gr-crete-agios-nikolaos": "0.9 minutes, 0.4 km",
    };
    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "citizen_service_centre_distance",
    );

    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.sourceGapReason).toBeUndefined();
    expect(region?.cited?.value).toContain("Priority-town range for Crete");
    expect(region?.notes).toContain("not an island-wide official KEP registry");

    for (const [id, expectedValue] of Object.entries(expected)) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "citizen_service_centre_distance",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.value, id).toContain(expectedValue);
      expect(row?.cited?.sourceName, id).toContain("OSRM public routing table");
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.notes, id).toContain("not an official service-area assignment");
    }
  });

  it("populates tax-office distance as an AADE-address plus OSRM route proxy", () => {
    const expected = {
      "gr-crete-chania": "1.3 minutes, 0.7 km",
      "gr-crete-heraklion": "5 minutes, 4.3 km",
      "gr-crete-rethymno": "1.2 minutes, 0.6 km",
      "gr-crete-agios-nikolaos": "0.9 minutes, 0.5 km",
    };
    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "tax_office_distance",
    );

    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.sourceGapReason).toBeUndefined();
    expect(region?.cited?.sourceName).toContain("AADE tax-office pages");
    expect(region?.cited?.category).toBe("tax");
    expect(region?.cited?.value).toContain("Priority-town range for Crete");
    expect(region?.notes).toContain("not an island-wide official tax-office assignment");

    for (const [id, expectedValue] of Object.entries(expected)) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "tax_office_distance",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.value, id).toContain(expectedValue);
      expect(row?.cited?.sourceName, id).toContain("OSRM public routing table");
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.cited?.category, id).toBe("tax");
      expect(row?.notes, id).toContain("This is not tax advice");
    }
  });

  it("populates residence-permit office distance as an official-address plus OSRM route proxy", () => {
    const expected = {
      "gr-crete-chania": "6.8 minutes, 4 km",
      "gr-crete-heraklion": "2.5 minutes, 1.7 km",
      "gr-crete-rethymno": "3.1 minutes, 1.3 km",
      "gr-crete-agios-nikolaos": "0.9 minutes, 0.4 km",
    };
    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "residence_permit_office_distance",
    );

    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.sourceGapReason).toBeUndefined();
    expect(region?.cited?.sourceName).toContain(
      "Decentralized Administration of Crete residence-permit office page",
    );
    expect(region?.cited?.category).toBe("residency");
    expect(region?.cited?.value).toContain("Priority-town range for Crete");
    expect(region?.notes).toContain("not an island-wide official residence-office assignment");

    for (const [id, expectedValue] of Object.entries(expected)) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "residence_permit_office_distance",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.value, id).toContain(expectedValue);
      expect(row?.cited?.sourceName, id).toContain("OSRM public routing table");
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.cited?.category, id).toBe("residency");
      expect(row?.notes, id).toContain("not an official service-area assignment");
      expect(row?.notes, id).toContain("not");
      expect(row?.notes, id).toContain("immigration advice");
    }
  });

  it("populates international-school distance as an accredited European School access proxy", () => {
    const expected = {
      "gr-crete-chania": "150.5 minutes, 147.2 km",
      "gr-crete-heraklion": "1.9 minutes, 0.9 km",
      "gr-crete-rethymno": "80 minutes, 78.3 km",
      "gr-crete-agios-nikolaos": "63.2 minutes, 66.4 km",
    };
    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "international_school_distance",
    );

    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.sourceGapReason).toBeUndefined();
    expect(region?.cited?.sourceName).toContain("European Schools Heraklion");
    expect(region?.cited?.value).toContain("Priority-town range for Crete");
    expect(region?.notes).toContain("not an island-wide international-school inventory");

    for (const [id, expectedValue] of Object.entries(expected)) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "international_school_distance",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.value, id).toContain(expectedValue);
      expect(row?.cited?.sourceName, id).toContain("OSRM public routing table");
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.notes, id).toContain("not a complete international-school inventory");
      expect(row?.notes, id).toContain("tuition");
      expect(row?.notes, id).toContain("education advice");
    }
  });

  it("populates international-school tuition as a selected public-school proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "intl_school_tuition");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.observedGranularity, bundle.id).toBe("region");
      expect(row?.coverageStatus, bundle.id).toBe(
        bundle.id === "gr-crete-region" ? "regional" : "proxy",
      );
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.granularity, bundle.id).toBe("region");
      expect(row?.cited?.sourceName, bundle.id).toBe(
        "School of European Education Heraklion enrolment page",
      );
      expect(row?.cited?.sourceUrl, bundle.id).toBe(
        "https://seeh.eu/en/the-school/activities?catid=9&id=162%3Asec-enrol&view=article",
      );
      expect(String(row?.cited?.value), bundle.id).toContain("0 EUR annual tuition");
      expect(String(row?.cited?.value), bundle.id).toContain("Greek public school");
      expect(row?.unit, bundle.id).toBe(
        "EUR annual tuition for selected European Schools-accredited public school",
      );
      expect(row?.notes, bundle.id).toContain(
        "not a median of all private international-school tuition",
      );
      expect(row?.notes, bundle.id).toContain("not admissions availability");
      expect(row?.notes, bundle.id).toContain("not education advice");
    }
  });

  it("populates monthly UV-index proxies from Open-Meteo grid samples", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "uv_index_monthly");
      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.sourceName, bundle.id).toContain("Open-Meteo");
      expect(row?.cited?.sourceName, bundle.id).toContain("UV-index");
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.category, bundle.id).toBe("climate");
      expect(row?.cited?.value, bundle.id).toContain("Jul");
      expect(`${row?.cited?.value ?? ""} ${row?.cited?.excerpt ?? ""}`, bundle.id).toMatch(
        /UV[- ]index/i,
      );
      expect(row?.notes, bundle.id).toContain("TEMIS");
      expect(row?.notes, bundle.id).toContain("UV climatology");
      expect(row?.notes, bundle.id).toContain("not");
    }
  });

  it("populates official Blue Flag award counts with honest place granularity", () => {
    const expected = {
      "gr-crete-region": ["regional", "region", 154, "Crete regional units"],
      "gr-crete-chania": ["local", "town", 15, "Chania Municipality"],
      "gr-crete-heraklion": ["inherited_regional", "region", 37, "Heraklion Regional Unit"],
      "gr-crete-rethymno": ["local", "town", 14, "Rethymno Municipality"],
      "gr-crete-agios-nikolaos": ["local", "town", 27, "Agios Nikolaos Municipality"],
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const [coverageStatus, observedGranularity, value, label] =
        expected[bundle.id as keyof typeof expected];
      const row = bundle.rows.find((item) => item.key === "blue_flag_beaches");
      expect(row?.coverageStatus, bundle.id).toBe(coverageStatus);
      expect(row?.observedGranularity, bundle.id).toBe(observedGranularity);
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.value, bundle.id).toBe(value);
      expect(row?.cited?.sourceName, bundle.id).toContain("Blue Flag Greece");
      expect(row?.cited?.sourceUrl, bundle.id).toBe("https://www.blueflag.gr/el/awards/2026");
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.granularity, bundle.id).toBe(observedGranularity);
      expect(row?.unit, bundle.id).toContain(label);
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("accessibility");
      expect(row?.notes, bundle.id).toContain("bathing-water");
    }
  });

  it("populates derived scenery tags from cited component rows", () => {
    const expectedTownTags = [
      "coastal",
      "mountain-proximate",
      "mapped green-space present",
      "protected-area-proximate",
      "monitored bathing-water nearby",
    ];

    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "scenery_tags",
    );
    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.sourceGapReason).toBeUndefined();
    expect(region?.cited?.value).toContain("Priority-town scenery tags for Crete");
    expect(region?.notes).toContain("not an island-wide forest-cover value");

    for (const id of CRETE_TOWN_IDS) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "scenery_tags");
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      for (const tag of expectedTownTags) {
        expect(row?.cited?.value, `${id}:${tag}`).toContain(tag);
      }
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.cited?.sourceName, id).toContain("Derived from cited OSM, EEA, and Open-Meteo");
      expect(row?.cited?.excerpt, id).toContain("Component source URLs");
      expect(row?.notes, id).toContain("not a subjective beauty score");
      expect(row?.notes, id).toContain("forest-cover value");
    }
  });

  it("populates DEM and OSM terrain proxy rows for slope and stroller hilliness", () => {
    const proxyRows = ["slope_proxy", "stroller_hilliness_proxy"] as const;
    const region = placeEvidenceBundleById("gr-crete-region");

    for (const key of proxyRows) {
      const row = region?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, `region:${key}`).toBe("proxy");
      expect(row?.observedGranularity, `region:${key}`).toBe("region");
      expect(row?.sourceGapReason, `region:${key}`).toBeUndefined();
      expect(row?.cited?.confidence, `region:${key}`).toBe("medium");
      expect(row?.cited?.granularity, `region:${key}`).toBe("region");
      expect(row?.cited?.sourceName, `region:${key}`).toContain(
        "OpenStreetMap street graph and Open-Meteo elevation terrain proxies",
      );
      expect(row?.notes, `region:${key}`).toContain("not an island-wide");
    }

    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      for (const key of proxyRows) {
        const row = bundle?.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.observedGranularity, `${id}:${key}`).toBe("town");
        expect(row?.sourceGapReason, `${id}:${key}`).toBeUndefined();
        expect(row?.cited?.confidence, `${id}:${key}`).toBe("medium");
        expect(row?.cited?.granularity, `${id}:${key}`).toBe("town");
        expect(row?.cited?.sourceUrl, `${id}:${key}`).toContain("overpass");
        expect(row?.cited?.sourceName, `${id}:${key}`).toContain(
          "OpenStreetMap contributors via Overpass API and Open-Meteo Elevation API",
        );
        expect(row?.cited?.excerpt, `${id}:${key}`).toContain("sampled street/footway segments");
      }
      expect(
        bundle?.rows.find((item) => item.key === "slope_proxy")?.notes,
        `${id}:slope_proxy`,
      ).toContain("not a parcel, flood, mobility, or accessibility assessment");
      expect(
        bundle?.rows.find((item) => item.key === "stroller_hilliness_proxy")?.notes,
        `${id}:stroller_hilliness_proxy`,
      ).toContain("not accessibility advice for a specific route");
    }
  });

  it("populates OSM mapped peak proximity proxy rows", () => {
    const region = placeEvidenceBundleById("gr-crete-region");
    const regionRow = region?.rows.find((item) => item.key === "mountain_proximity");
    expect(regionRow?.coverageStatus, "region:mountain_proximity").toBe("proxy");
    expect(regionRow?.observedGranularity, "region:mountain_proximity").toBe("region");
    expect(regionRow?.sourceGapReason, "region:mountain_proximity").toBeUndefined();
    expect(regionRow?.cited?.confidence, "region:mountain_proximity").toBe("medium");
    expect(regionRow?.cited?.granularity, "region:mountain_proximity").toBe("region");
    expect(regionRow?.cited?.sourceName, "region:mountain_proximity").toContain(
      "OpenStreetMap mapped peak proximity proxies",
    );
    expect(regionRow?.notes, "region:mountain_proximity").toContain(
      "not an island-wide DEM peak inventory",
    );

    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      const row = bundle?.rows.find((item) => item.key === "mountain_proximity");
      expect(row?.coverageStatus, `${id}:mountain_proximity`).toBe("proxy");
      expect(row?.observedGranularity, `${id}:mountain_proximity`).toBe("town");
      expect(row?.sourceGapReason, `${id}:mountain_proximity`).toBeUndefined();
      expect(row?.cited?.confidence, `${id}:mountain_proximity`).toBe("medium");
      expect(row?.cited?.granularity, `${id}:mountain_proximity`).toBe("town");
      expect(row?.cited?.sourceUrl, `${id}:mountain_proximity`).toContain("overpass");
      expect(row?.cited?.sourceName, `${id}:mountain_proximity`).toContain(
        "OpenStreetMap contributors via Overpass API",
      );
      expect(row?.cited?.excerpt, `${id}:mountain_proximity`).toContain(
        "mapped OSM natural=peak nodes",
      );
      expect(row?.notes, `${id}:mountain_proximity`).toContain(
        "not an official DEM peak inventory",
      );
    }
  });

  it("populates OSM and OSRM route-feature proxy rows for Crete towns", () => {
    const proxyRows = [
      ["nearest_emergency_hospital", "low", "Overpass API"],
      ["emergency_hospital_drive_minutes", "low", "OSRM public routing table"],
      ["ferry_terminal_drive_minutes", "medium", "OSRM public routing table"],
    ] as const;
    const rejectedTerminalNames = /Worldchampion|semi submarine|Spinalonga Tickets/i;

    const region = placeEvidenceBundleById("gr-crete-region");
    for (const [key, confidence] of proxyRows) {
      const row = region?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, `region:${key}`).toBe("proxy");
      expect(row?.observedGranularity, `region:${key}`).toBe("region");
      expect(row?.sourceGapReason, `region:${key}`).toBeUndefined();
      expect(row?.cited?.confidence, `region:${key}`).toBe(confidence);
      expect(row?.cited?.granularity, `region:${key}`).toBe("region");
      expect(row?.cited?.sourceName, `region:${key}`).toContain(
        "OpenStreetMap contributors and OSRM route proxies",
      );
      expect(`${row?.cited?.value} ${row?.cited?.excerpt}`, `region:${key}`).not.toMatch(
        rejectedTerminalNames,
      );
      expect(row?.notes, `region:${key}`).toContain(
        "not an island-wide official service inventory",
      );
    }

    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      for (const [key, confidence, sourceName] of proxyRows) {
        const row = bundle?.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.observedGranularity, `${id}:${key}`).toBe("town");
        expect(row?.sourceGapReason, `${id}:${key}`).toBeUndefined();
        expect(row?.cited?.confidence, `${id}:${key}`).toBe(confidence);
        expect(row?.cited?.granularity, `${id}:${key}`).toBe("town");
        expect(row?.cited?.sourceName, `${id}:${key}`).toContain(sourceName);
        expect(`${row?.cited?.value} ${row?.cited?.excerpt}`, `${id}:${key}`).not.toMatch(
          rejectedTerminalNames,
        );
        expect(row?.notes, `${id}:${key}`).not.toContain("source_search_required");
      }

      const hospital = bundle?.rows.find((item) => item.key === "nearest_emergency_hospital");
      expect(hospital?.notes, id).toContain("not an official hospital registry confirmation");

      const ferry = bundle?.rows.find((item) => item.key === "ferry_terminal_drive_minutes");
      expect(ferry?.notes, id).toContain("not ferry-route, timetable");
    }
  });

  it("populates OSM walkability and accessibility proxy rows for Crete towns", () => {
    const proxyRows = [
      ["walkability_proxy", "medium"],
      ["sidewalk_coverage_proxy", "low"],
      ["wheelchair_tagged_amenities_share", "low"],
      ["step_free_station_proxy", "low"],
    ];

    const region = placeEvidenceBundleById("gr-crete-region");
    for (const [key, confidence] of proxyRows) {
      const row = region?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, `region:${key}`).toBe("proxy");
      expect(row?.observedGranularity, `region:${key}`).toBe("region");
      expect(row?.sourceGapReason, `region:${key}`).toBeUndefined();
      expect(row?.cited?.confidence, `region:${key}`).toBe(confidence);
      expect(row?.cited?.granularity, `region:${key}`).toBe("region");
      expect(row?.cited?.sourceName, `region:${key}`).toContain("per-town Overpass API");
      expect(row?.notes, `region:${key}`).toContain("not an island-wide measurement");
    }

    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      for (const [key, confidence] of proxyRows) {
        const row = bundle?.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.observedGranularity, `${id}:${key}`).toBe("town");
        expect(row?.sourceGapReason, `${id}:${key}`).toBeUndefined();
        expect(row?.cited?.confidence, `${id}:${key}`).toBe(confidence);
        expect(row?.cited?.granularity, `${id}:${key}`).toBe("town");
        expect(row?.cited?.sourceName, `${id}:${key}`).toContain("Overpass API");
        expect(row?.cited?.sourceUrl, `${id}:${key}`).toContain("interpreter?data=");
        expect(row?.notes, `${id}:${key}`).not.toContain("source_search_required");
      }
    }
  });

  it("populates OSM outdoor mapped-feature proxy rows for Crete towns", () => {
    const outdoorRows = [
      ["hiking_trail_km", "medium", "selected OSM path/track ways", "not a hiking safety"],
      ["mtb_trail_count", "medium", "OSM route=mtb relations", "mountain-bike route proxy"],
      ["climbing_sites", "medium", "OSM sport=climbing features", "climbing-feature proxy"],
      ["surf_spots", "low", "OSM sport=surfing features", "surf-feature proxy"],
      [
        "ski_piste_km",
        "medium",
        "OSM piste:type=downhill ways",
        "not a guarantee of operating ski service",
      ],
    ] as const;

    const region = placeEvidenceBundleById("gr-crete-region");
    for (const [key, confidence] of outdoorRows) {
      const row = region?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, `region:${key}`).toBe("proxy");
      expect(row?.observedGranularity, `region:${key}`).toBe("region");
      expect(row?.sourceGapReason, `region:${key}`).toBeUndefined();
      expect(row?.cited?.confidence, `region:${key}`).toBe(confidence);
      expect(row?.cited?.granularity, `region:${key}`).toBe("region");
      expect(row?.cited?.sourceName, `region:${key}`).toContain("OpenStreetMap contributors");
      expect(row?.cited?.value, `region:${key}`).toContain("Priority-town range");
      expect(row?.notes, `region:${key}`).toContain("mapped-feature proxy");
      expect(row?.notes, `region:${key}`).toContain("not an island-wide outdoor inventory");
    }

    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      for (const [key, confidence, unitText, noteText] of outdoorRows) {
        const row = bundle?.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.observedGranularity, `${id}:${key}`).toBe("town");
        expect(row?.sourceGapReason, `${id}:${key}`).toBeUndefined();
        expect(row?.cited?.confidence, `${id}:${key}`).toBe(confidence);
        expect(row?.cited?.granularity, `${id}:${key}`).toBe("town");
        expect(row?.cited?.sourceName, `${id}:${key}`).toContain("OpenStreetMap contributors");
        expect(row?.unit, `${id}:${key}`).toContain(unitText);
        expect(row?.notes, `${id}:${key}`).toContain(noteText);
        expect(row?.notes, `${id}:${key}`).not.toContain("source_search_required");

        expect(typeof row?.cited?.value, `${id}:${key}`).toBe("number");
        expect(row?.cited?.value as number, `${id}:${key}`).toBeGreaterThanOrEqual(0);

        if (key !== "hiking_trail_km") {
          expect(row?.notes, `${id}:${key}`).toContain(
            "zero means no matching mapped OSM features",
          );
        }
      }
    }
  });

  it("keeps canonical housing rows separate from low-confidence asking-price proxies", () => {
    const expectedProperty = {
      "gr-crete-region": "sale 2,108-3,120 EUR/m2",
      "gr-crete-chania": "sale 3,676 EUR/m2",
      "gr-crete-heraklion": "sale 2,296 EUR/m2",
      "gr-crete-rethymno": "sale 2,968 EUR/m2",
      "gr-crete-agios-nikolaos": "sale 4,089 EUR/m2",
    };
    for (const id of CRETE_IDS) {
      const bundle = placeEvidenceBundleById(id);
      const rentToIncome = bundle?.rows.find((row) => row.key === "rent_to_income");
      const housingOverburden = bundle?.rows.find((row) => row.key === "housing_overburden");
      const property = bundle?.rows.find((row) => row.key === "property_sqm_city");
      expect(rentToIncome?.coverageStatus, id).toBe("inherited_national");
      expect(rentToIncome?.observedGranularity, id).toBe("country");
      expect(rentToIncome?.cited?.sourceName, id).toContain("Eurostat");
      expect(rentToIncome?.notes, id).toContain("not local rent-to-income");
      expect(housingOverburden?.coverageStatus, id).toBe("inherited_national");
      expect(housingOverburden?.observedGranularity, id).toBe("country");
      expect(housingOverburden?.cited?.sourceName, id).toContain("Eurostat");
      expect(housingOverburden?.notes, id).toContain("not a local affordability claim");
      expect(property?.coverageStatus, id).toBe("proxy");
      expect(property?.cited?.confidence, id).toBe("low");
      expect(property?.cited?.sourceName, id).toContain("Indomio property prices");
      expect(property?.cited?.value, id).toContain(
        expectedProperty[id as keyof typeof expectedProperty],
      );
      expect(property?.notes, id).toContain("not a transaction price");
      expect(property?.notes, id).toContain("not a valuation");
      expect(property?.notes, id).toContain("not a prediction");
    }
  });

  it("keeps noncanonical metadata rows out of the 254-row evidence bundle", () => {
    const retiredBundleRows = [
      "regional_population",
      "place_coordinate",
      "regional_health_capacity",
      "regional_airport_inventory",
    ];
    for (const bundle of placeEvidenceBundles) {
      for (const key of retiredBundleRows) {
        expect(
          bundle.rows.some((row) => row.key === key),
          `${bundle.id}:${key}`,
        ).toBe(false);
      }
    }
  });

  it("uses inherited regional climate context for candidate towns without local raster samples", () => {
    for (const id of ["gr-crete-heraklion", "gr-crete-rethymno", "gr-crete-agios-nikolaos"]) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "koppen_class");
      expect(row?.coverageStatus, id).toBe("inherited_regional");
      expect(row?.observedGranularity, id).toBe("region");
      expect(row?.cited?.granularity, id).toBe("region");
      expect(row?.notes, id).toContain("still needs town-level raster sampling");
    }
  });

  it("populates ThinkHazard national hazard screening without making town-level risk claims", () => {
    const hazardRows = ["seismic_hazard_pga", "wildfire_risk", "flood_risk_100yr"];
    for (const bundle of placeEvidenceBundles) {
      for (const key of hazardRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("inherited_national");
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe("High");
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain("ThinkHazard Greece");
        expect(row?.cited?.confidence, `${bundle.id}:${key}`).toBe("medium");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("town-level");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("personal safety prediction");
      }
    }
  });

  it("populates mapped green-space percentage as an OSM polygon proxy", () => {
    const expected = {
      "gr-crete-chania": 8,
      "gr-crete-heraklion": 5.8,
      "gr-crete-rethymno": 13.9,
      "gr-crete-agios-nikolaos": 12.9,
    };
    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "green_space_pct",
    );
    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.cited?.value).toBe(10.2);
    expect(region?.cited?.sourceName).toContain("OpenStreetMap contributors");
    expect(region?.notes).toContain("not Copernicus land cover");
    expect(region?.notes).toContain("not a guarantee of usable green space");

    for (const [id, value] of Object.entries(expected)) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "green_space_pct");
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.cited?.value, id).toBe(value);
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.unit, id).toContain("2 km circle");
      expect(row?.cited?.excerpt, id).toContain("clipped OSM ways");
      expect(row?.notes, id).toContain("not Copernicus land cover");
      expect(row?.notes, id).toContain("not a guarantee of usable green space");
    }
  });

  it("populates green urban percentage as a derived OSM mapped green-polygon proxy", () => {
    const expected = {
      "gr-crete-chania": 8,
      "gr-crete-heraklion": 5.8,
      "gr-crete-rethymno": 13.9,
      "gr-crete-agios-nikolaos": 12.9,
    };
    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "green_urban_pct",
    );
    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.sourceGapReason).toBeUndefined();
    expect(region?.cited?.value).toContain("Priority-town range for Crete: 5.8-13.9%");
    expect(region?.cited?.sourceName).toContain("Derived from cited OpenStreetMap");
    expect(region?.notes).toContain("not Copernicus Urban Atlas");
    expect(region?.notes).toContain("not an island-wide urban-green inventory");

    for (const [id, value] of Object.entries(expected)) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "green_urban_pct");
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.value, id).toBe(value);
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.unit, id).toContain("2 km circle");
      expect(row?.cited?.sourceName, id).toContain("Derived from cited OpenStreetMap");
      expect(row?.notes, id).toContain("not Copernicus Urban Atlas");
      expect(row?.notes, id).toContain("not functional urban area");
    }
  });

  it("populates NOAA OISST sea-temperature coastal proxies and swimming season", () => {
    const expected = {
      "gr-crete-chania": { jan: "Jan 16.1C", aug: "Aug 25.7C", grid: "35.625, 24.125" },
      "gr-crete-heraklion": { jan: "Jan 16.1C", aug: "Aug 25.4C", grid: "35.375, 25.125" },
      "gr-crete-rethymno": { jan: "Jan 16.3C", aug: "Aug 25.6C", grid: "35.375, 24.375" },
      "gr-crete-agios-nikolaos": { jan: "Jan 16.1C", aug: "Aug 25.2C", grid: "35.375, 25.625" },
    };

    const regionSea = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "sea_temp_monthly",
    );
    const regionSeason = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "swimming_season",
    );
    expect(regionSea?.coverageStatus).toBe("proxy");
    expect(regionSea?.observedGranularity).toBe("region");
    expect(regionSea?.cited?.confidence).toBe("medium");
    expect(String(regionSea?.cited?.value)).toContain("Jan 16.2C");
    expect(String(regionSea?.cited?.value)).toContain("Aug 25.5C");
    expect(regionSea?.notes).toContain("not a full coastline raster");
    expect(regionSeason?.cited?.value).toBe("6 months (Jun-Jul-Aug-Sep-Oct-Nov)");

    for (const [id, values] of Object.entries(expected)) {
      const sea = placeEvidenceBundleById(id)?.rows.find((row) => row.key === "sea_temp_monthly");
      const season = placeEvidenceBundleById(id)?.rows.find((row) => row.key === "swimming_season");
      expect(sea?.coverageStatus, id).toBe("proxy");
      expect(sea?.observedGranularity, id).toBe("town");
      expect(sea?.cited?.sourceName, id).toContain("NOAA OISST");
      expect(sea?.cited?.confidence, id).toBe("medium");
      expect(String(sea?.cited?.value), id).toContain(values.jan);
      expect(String(sea?.cited?.value), id).toContain(values.aug);
      expect(sea?.cited?.excerpt, id).toContain(values.grid);
      expect(sea?.notes, id).toContain("Nearest non-land NOAA OISST sea grid cell");
      expect(sea?.notes, id).toContain("not a beach-specific condition");
      expect(season?.coverageStatus, id).toBe("proxy");
      expect(season?.cited?.value, id).toBe("6 months (Jun-Jul-Aug-Sep-Oct-Nov)");
      expect(season?.notes, id).toContain("not a beach-safety");
      expect(season?.unit, id).toContain("months above 20C");
    }
  });

  it("populates Ookla connectivity tile proxies without making availability claims", () => {
    const expected = {
      "gr-crete-chania": { fixed: 178.7, mobile: 263.5 },
      "gr-crete-heraklion": { fixed: 97, mobile: 266.1 },
      "gr-crete-rethymno": { fixed: 51.7, mobile: 205.4 },
      "gr-crete-agios-nikolaos": { fixed: 211.9, mobile: 143.3 },
    };

    const regionFixed = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "broadband_speed",
    );
    const regionMobile = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "mobile_speed",
    );
    expect(regionFixed?.coverageStatus).toBe("proxy");
    expect(regionFixed?.observedGranularity).toBe("region");
    expect(regionFixed?.cited?.confidence).toBe("medium");
    expect(String(regionFixed?.cited?.value)).toContain("Priority-town unweighted mean 134.8");
    expect(String(regionMobile?.cited?.value)).toContain("Priority-town unweighted mean 219.6");
    expect(regionFixed?.notes).toContain("not a full Crete network-coverage map");

    for (const [id, values] of Object.entries(expected)) {
      const fixed = placeEvidenceBundleById(id)?.rows.find((row) => row.key === "broadband_speed");
      const mobile = placeEvidenceBundleById(id)?.rows.find((row) => row.key === "mobile_speed");
      expect(fixed?.coverageStatus, id).toBe("proxy");
      expect(mobile?.coverageStatus, id).toBe("proxy");
      expect(fixed?.observedGranularity, id).toBe("town");
      expect(mobile?.observedGranularity, id).toBe("town");
      expect(fixed?.cited?.value, id).toBe(values.fixed);
      expect(mobile?.cited?.value, id).toBe(values.mobile);
      expect(fixed?.cited?.sourceName, id).toContain("Ookla Open Data");
      expect(mobile?.cited?.sourceName, id).toContain("Ookla Open Data");
      expect(fixed?.cited?.excerpt, id).toContain("avg_d_kbps");
      expect(mobile?.cited?.excerpt, id).toContain("devices");
      expect(fixed?.notes, id).toContain("not a municipal average");
      expect(mobile?.notes, id).toContain("service guarantee");
    }
  });

  it("populates local climate normals from point-sampled daily archive data", () => {
    const expectedClimate = {
      "gr-crete-chania": { warmest: 28, coldest: 9.6, precipitation: 792 },
      "gr-crete-heraklion": { warmest: 31.2, coldest: 8.3, precipitation: 447 },
      "gr-crete-rethymno": { warmest: 31.2, coldest: 8.9, precipitation: 601 },
      "gr-crete-agios-nikolaos": { warmest: 32, coldest: 10, precipitation: 296 },
    };

    for (const [id, expected] of Object.entries(expectedClimate)) {
      const bundle = placeEvidenceBundleById(id);
      const monthlyHigh = bundle?.rows.find((item) => item.key === "temp_monthly_high");
      const monthlyLow = bundle?.rows.find((item) => item.key === "temp_monthly_low");
      const warmest = bundle?.rows.find((item) => item.key === "warmest_month_high");
      const coldest = bundle?.rows.find((item) => item.key === "coldest_month_low");
      const precipitation = bundle?.rows.find((item) => item.key === "precip_annual");

      expect(monthlyHigh?.coverageStatus, id).toBe("local");
      expect(monthlyHigh?.observedGranularity, id).toBe("town");
      expect(monthlyHigh?.cited?.sourceName, id).toContain("Open-Meteo Historical Weather API");
      expect(monthlyHigh?.cited?.value, id).toContain("Jan");
      expect(monthlyLow?.cited?.value, id).toContain("Dec");
      expect(warmest?.cited?.value, id).toBe(expected.warmest);
      expect(coldest?.cited?.value, id).toBe(expected.coldest);
      expect(precipitation?.cited?.value, id).toBe(expected.precipitation);
      expect(precipitation?.notes, id).toContain("climate normal");
      expect(precipitation?.notes, id).toContain("not current weather");
      expect(precipitation?.notes, id).toContain("microclimate");
    }

    const regionPrecip = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "precip_annual",
    );
    expect(regionPrecip?.coverageStatus).toBe("proxy");
    expect(regionPrecip?.observedGranularity).toBe("region");
    expect(regionPrecip?.cited?.value).toContain("296-792 mm/year");
    expect(regionPrecip?.notes).toContain("not an island-wide raster average");
  });

  it("populates derived climate and daylight metrics from Open-Meteo and NOAA methods", () => {
    const expectedDerivedClimate = {
      "gr-crete-chania": {
        diurnal: 4.3,
        seasonality: "14.2C",
        driest: "Jul 3.4 mm",
        daylight: 9.76,
        hotDays: 0.3,
        cdd: 951,
      },
      "gr-crete-heraklion": {
        diurnal: 7.9,
        seasonality: "15.4C",
        driest: "Jul 2.6 mm",
        daylight: 9.77,
        hotDays: 10.5,
        cdd: 1116,
      },
      "gr-crete-rethymno": {
        diurnal: 7.2,
        seasonality: "15.4C",
        driest: "Jul 4.6 mm",
        daylight: 9.77,
        hotDays: 7.7,
        cdd: 1172,
      },
      "gr-crete-agios-nikolaos": {
        diurnal: 7,
        seasonality: "15.1C",
        driest: "Aug 1.5 mm",
        daylight: 9.78,
        hotDays: 8.4,
        cdd: 1313,
      },
    };

    for (const [id, expected] of Object.entries(expectedDerivedClimate)) {
      const bundle = placeEvidenceBundleById(id);
      const diurnal = bundle?.rows.find((item) => item.key === "diurnal_range");
      const seasonality = bundle?.rows.find((item) => item.key === "temp_seasonality");
      const driest = bundle?.rows.find((item) => item.key === "precip_driest_month");
      const daylight = bundle?.rows.find((item) => item.key === "winter_daylight");
      const hotDays = bundle?.rows.find((item) => item.key === "heatwave_days");
      const cdd = bundle?.rows.find((item) => item.key === "cooling_degree_days");

      expect(diurnal?.coverageStatus, id).toBe("local");
      expect(diurnal?.observedGranularity, id).toBe("town");
      expect(diurnal?.cited?.value, id).toBe(expected.diurnal);
      expect(diurnal?.sourceGapReason, id).toBeUndefined();
      expect(diurnal?.cited?.sourceName, id).toContain("Open-Meteo Historical Weather API");
      expect(diurnal?.notes, id).toContain("not a station observation");

      expect(seasonality?.coverageStatus, id).toBe("proxy");
      expect(seasonality?.observedGranularity, id).toBe("town");
      expect(String(seasonality?.cited?.value), id).toContain(expected.seasonality);
      expect(seasonality?.sourceGapReason, id).toBeUndefined();
      expect(seasonality?.notes, id).toContain("not WorldClim BIO4");

      expect(driest?.coverageStatus, id).toBe("local");
      expect(driest?.observedGranularity, id).toBe("town");
      expect(driest?.cited?.value, id).toBe(expected.driest);
      expect(driest?.sourceGapReason, id).toBeUndefined();
      expect(driest?.cited?.sourceName, id).toContain("Open-Meteo Historical Weather API");

      expect(daylight?.coverageStatus, id).toBe("local");
      expect(daylight?.observedGranularity, id).toBe("town");
      expect(daylight?.cited?.value, id).toBe(expected.daylight);
      expect(daylight?.sourceGapReason, id).toBeUndefined();
      expect(daylight?.cited?.sourceName, id).toContain("NOAA Global Monitoring Laboratory");
      expect(daylight?.notes, id).toContain("not observed sunshine");

      expect(hotDays?.coverageStatus, id).toBe("proxy");
      expect(hotDays?.observedGranularity, id).toBe("town");
      expect(hotDays?.cited?.value, id).toBe(expected.hotDays);
      expect(hotDays?.sourceGapReason, id).toBeUndefined();
      expect(hotDays?.notes, id).toContain("not an official heatwave-warning");

      expect(cdd?.coverageStatus, id).toBe("proxy");
      expect(cdd?.observedGranularity, id).toBe("town");
      expect(cdd?.cited?.value, id).toBe(expected.cdd);
      expect(cdd?.sourceGapReason, id).toBeUndefined();
      expect(cdd?.notes, id).toContain("not a household electricity bill");
    }
  });

  it("keeps derived Crete climate rows as priority-town regional summaries", () => {
    const expectedRegionalDerivedRows = {
      diurnal_range: "4.3-7.9C",
      temp_seasonality: "14.2-15.4C",
      precip_driest_month: "1.5-4.6 mm",
      winter_daylight: "9.76-9.78 hours",
      heatwave_days: "0.3-10.5 days/year",
      cooling_degree_days: "951-1313 CDD18/year",
    };
    const bundle = placeEvidenceBundleById("gr-crete-region");

    for (const [key, value] of Object.entries(expectedRegionalDerivedRows)) {
      const row = bundle?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, key).toBe("proxy");
      expect(row?.observedGranularity, key).toBe("region");
      expect(row?.sourceGapReason, key).toBeUndefined();
      expect(String(row?.cited?.value), key).toContain(value);
      expect(row?.notes, key).toContain("not an island-wide raster average");
    }
  });

  it("populates clear-sky days as a cloud-cover threshold proxy", () => {
    const expectedClearSkyDays = {
      "gr-crete-chania": 163,
      "gr-crete-heraklion": 146,
      "gr-crete-rethymno": 153,
      "gr-crete-agios-nikolaos": 172,
    };

    for (const [id, days] of Object.entries(expectedClearSkyDays)) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "clear_sky_days");
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.cited?.value, id).toBe(days);
      expect(row?.unit, id).toContain("cloud cover <=20%");
      expect(row?.cited?.sourceName, id).toContain("Open-Meteo Historical Weather API");
      expect(row?.notes, id).toContain("not sunshine hours");
      expect(row?.notes, id).toContain("guarantee of blue-sky days");
    }

    const regionRow = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "clear_sky_days",
    );
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("146-172 days/year");
    expect(regionRow?.notes).toContain("not an island-wide sky-cover raster");
  });

  it("populates annual PM2.5 as a gridded air-quality proxy without health advice", () => {
    const expectedPm25 = {
      "gr-crete-chania": 7.1,
      "gr-crete-heraklion": 7.9,
      "gr-crete-rethymno": 7.3,
      "gr-crete-agios-nikolaos": 6.7,
    };

    for (const [id, value] of Object.entries(expectedPm25)) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "pm25_annual");
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.cited?.value, id).toBe(value);
      expect(row?.cited?.sourceName, id).toContain("Open-Meteo Air Quality API");
      expect(row?.cited?.excerpt, id).toContain("8,760 hourly");
      expect(row?.notes, id).toContain("not a local monitoring-station observation");
      expect(row?.notes, id).toContain("medical advice");
    }

    const regionRow = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "pm25_annual",
    );
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("6.7-7.9 micrograms");
    expect(regionRow?.notes).toContain("not an island-wide air-quality raster average");
  });

  it("populates Open-Meteo PM2.5 monthly, exceedance, and snowfall proxies", () => {
    const expectedRows = {
      "gr-crete-chania": {
        monthlyPrefix: "Jan 6.2; Feb 5.3; Mar 9.1",
        exceedanceDays: 8,
        snowfallDays: 3,
      },
      "gr-crete-heraklion": {
        monthlyPrefix: "Jan 7.7; Feb 5.9; Mar 9.9",
        exceedanceDays: 12,
        snowfallDays: 2.6,
      },
      "gr-crete-rethymno": {
        monthlyPrefix: "Jan 6.7; Feb 5.5; Mar 9.6",
        exceedanceDays: 8,
        snowfallDays: 3,
      },
      "gr-crete-agios-nikolaos": {
        monthlyPrefix: "Jan 5.6; Feb 4.9; Mar 8.8",
        exceedanceDays: 10,
        snowfallDays: 0.8,
      },
    };

    for (const [id, expected] of Object.entries(expectedRows)) {
      const bundle = placeEvidenceBundleById(id);
      const monthly = bundle?.rows.find((item) => item.key === "pm25_monthly");
      const exceedance = bundle?.rows.find((item) => item.key === "pm25_exceedance_days");
      const snowfall = bundle?.rows.find((item) => item.key === "snowfall_days");

      expect(monthly?.coverageStatus, id).toBe("proxy");
      expect(monthly?.observedGranularity, id).toBe("town");
      expect(monthly?.sourceGapReason, id).toBeUndefined();
      expect(monthly?.cited?.confidence, id).toBe("medium");
      expect(monthly?.cited?.sourceName, id).toContain("Open-Meteo Air Quality API");
      expect(monthly?.cited?.value, id).toContain(expected.monthlyPrefix);
      expect(monthly?.notes, id).toContain("not a regulatory monitoring-station observation");
      expect(monthly?.notes, id).toContain("medical advice");

      expect(exceedance?.coverageStatus, id).toBe("proxy");
      expect(exceedance?.sourceGapReason, id).toBeUndefined();
      expect(exceedance?.cited?.value, id).toBe(expected.exceedanceDays);
      expect(exceedance?.unit, id).toContain("daily mean PM2.5 >15");
      expect(exceedance?.notes, id).toContain("not a regulatory monitoring-station observation");

      expect(snowfall?.coverageStatus, id).toBe("proxy");
      expect(snowfall?.sourceGapReason, id).toBeUndefined();
      expect(snowfall?.cited?.value, id).toBe(expected.snowfallDays);
      expect(snowfall?.cited?.sourceName, id).toContain("Open-Meteo Historical Weather API");
      expect(snowfall?.notes, id).toContain("not a current-weather or road-safety claim");
    }

    const region = placeEvidenceBundleById("gr-crete-region");
    expect(region?.rows.find((item) => item.key === "pm25_monthly")?.cited?.value).toContain(
      "4.7-9.9 micrograms",
    );
    expect(
      region?.rows.find((item) => item.key === "pm25_exceedance_days")?.cited?.value,
    ).toContain("8-12 days/year");
    expect(region?.rows.find((item) => item.key === "snowfall_days")?.cited?.value).toContain(
      "0.8-3 days/year",
    );
  });

  it("populates protected-area overlap as an OSM mapped-feature proximity proxy", () => {
    const expectedProtectedAreaAccess = {
      "gr-crete-chania":
        "2 mapped protected-area or nature-reserve features within 25 km; nearest 10.3 km",
      "gr-crete-heraklion":
        "9 mapped protected-area or nature-reserve features within 25 km; nearest 10.2 km",
      "gr-crete-rethymno":
        "5 mapped protected-area or nature-reserve features within 25 km; nearest 6.5 km",
      "gr-crete-agios-nikolaos":
        "14 mapped protected-area or nature-reserve features within 25 km; nearest 1.9 km",
    };

    for (const [id, value] of Object.entries(expectedProtectedAreaAccess)) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "protected_area_overlap",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.cited?.value, id).toBe(value);
      expect(row?.cited?.sourceName, id).toContain("protected-area and nature-reserve");
      expect(row?.notes, id).toContain("not an official Natura 2000");
      expect(row?.notes, id).toContain("Feature centers");
    }

    const regionRow = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "protected_area_overlap",
    );
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("2-14 mapped protected-area");
    expect(regionRow?.notes).toContain("not an island-wide Natura 2000");
  });

  it("populates national-park distance as a protected-area proxy row", () => {
    const expectedProtectedAreaDistances = {
      "gr-crete-chania": "10.3 km straight-line",
      "gr-crete-heraklion": "10.2 km straight-line",
      "gr-crete-rethymno": "6.5 km straight-line",
      "gr-crete-agios-nikolaos": "1.9 km straight-line",
    };

    for (const [id, value] of Object.entries(expectedProtectedAreaDistances)) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "nat_park_dist_km");
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.cited?.granularity, id).toBe("town");
      expect(row?.cited?.value, id).toContain(value);
      expect(row?.cited?.sourceName, id).toContain("protected-area distance proxy");
      expect(row?.cited?.excerpt, id).toContain("protected_area_overlap");
      expect(row?.notes, id).toContain("not the official WDPA");
    }

    const regionRow = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "nat_park_dist_km",
    );
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.sourceGapReason).toBeUndefined();
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete: 1.9-10.3 km");
    expect(regionRow?.notes).toContain("not an island-wide WDPA");
  });

  it("populates distance to coast from OSM coastline geometry without treating it as access", () => {
    const expectedDistances = {
      "gr-crete-chania": 0.53,
      "gr-crete-heraklion": 0.41,
      "gr-crete-rethymno": 0.38,
      "gr-crete-agios-nikolaos": 0.13,
    };

    for (const [id, distance] of Object.entries(expectedDistances)) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "dist_coast_km");
      expect(row?.coverageStatus, id).toBe("local");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.cited?.value, id).toBe(distance);
      expect(row?.cited?.sourceName, id).toContain("OpenStreetMap contributors");
      expect(row?.notes, id).toContain("not walking distance");
      expect(row?.notes, id).toContain("bathing-water quality");
    }

    const regionRow = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "dist_coast_km",
    );
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("0.13-0.53 km");
    expect(regionRow?.notes).toContain("not a distance from the Crete region centroid");
  });

  it("keeps ferry distance and timetable rows in their correct blocker lanes", () => {
    const ferryTimetableRows = ["ferry_routes_winter", "ferry_routes_summer"];
    for (const bundle of placeEvidenceBundles) {
      for (const key of ferryTimetableRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("blocked");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBe(
          "source_bot_blocked_manual_needed",
        );
        expect(row?.notes, `${bundle.id}:${key}`).toContain("manual reading");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("timetable");
        expect(row?.notes, `${bundle.id}:${key}`).not.toContain("source_search_required");
      }
    }
  });

  it("classifies transit-pass and seasonal transport rows without inventing service data", () => {
    const stillBlockedTransportRows = [
      "airport_winter_direct_destinations",
      "airport_winter_route_ratio",
      "ferry_routes_winter",
      "ferry_routes_summer",
    ];

    for (const bundle of placeEvidenceBundles) {
      const transitPass = bundle.rows.find((item) => item.key === "transit_pass");
      expect(transitPass?.coverageStatus, bundle.id).toBe("unavailable");
      expect(transitPass?.sourceGapReason, bundle.id).toBe("no_public_source_found");
      expect(transitPass?.notes, bundle.id).toContain("Eurostat Urban Audit");
      expect(transitPass?.notes, bundle.id).toContain("TT1080V");
      expect(transitPass?.notes, bundle.id).toContain("No comparable public town-level");
      expect(transitPass?.notes, bundle.id).not.toContain("source_search_required");

      for (const key of stillBlockedTransportRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("blocked");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBe(
          "source_bot_blocked_manual_needed",
        );
        expect(row?.notes, `${bundle.id}:${key}`).toContain("manual");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("dated");
        expect(row?.notes, `${bundle.id}:${key}`).not.toContain("source_search_required");
      }

      const summerAirport = bundle.rows.find(
        (item) => item.key === "airport_summer_direct_destinations",
      );
      if (bundle.id === "gr-crete-chania" || bundle.id === "gr-crete-rethymno") {
        expect(summerAirport?.coverageStatus, bundle.id).toBe("proxy");
        expect(summerAirport?.observedGranularity, bundle.id).toBe("region");
        expect(summerAirport?.sourceGapReason, bundle.id).toBeUndefined();
        expect(summerAirport?.cited?.value, bundle.id).toBe(115);
        expect(summerAirport?.cited?.sourceName, bundle.id).toContain("Chania Airport");
        expect(summerAirport?.cited?.confidence, bundle.id).toBe("medium");
        expect(summerAirport?.cited?.category, bundle.id).toBe("connectivity");
        expect(summerAirport?.unit, bundle.id).toMatch(/24 October 2026|2026-10-24/);
        expect(summerAirport?.notes, bundle.id).toContain("not flight frequency");
        expect(summerAirport?.notes, bundle.id).toContain("not a service guarantee");
        if (bundle.id === "gr-crete-rethymno") {
          expect(summerAirport?.notes, bundle.id).toContain("nearest_airport");
          expect(summerAirport?.notes, bundle.id).toContain("Do not inherit this row");
        }
      } else {
        expect(summerAirport?.coverageStatus, `${bundle.id}:airport_summer`).toBe("blocked");
        expect(summerAirport?.sourceGapReason, `${bundle.id}:airport_summer`).toBe(
          "source_bot_blocked_manual_needed",
        );
        expect(summerAirport?.notes, `${bundle.id}:airport_summer`).toContain("manual");
        expect(summerAirport?.notes, `${bundle.id}:airport_summer`).toContain("dated");
      }
    }
  });

  it("populates selected KTEL spine-frequency proxies without claiming full transit coverage", () => {
    const expected = {
      "gr-crete-region": {
        coverageStatus: "regional",
        observedGranularity: "region",
        sourceName:
          "Official KTEL Chania-Rethymno and KTEL Heraklion-Lasithi timetable proxies for priority Crete towns",
        value: "6-37 selected departures",
      },
      "gr-crete-chania": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        sourceName: "KTEL Chania-Rethymno Chania departures PDF valid from 27 June 2026",
        value: "22 daily outbound spine departures",
      },
      "gr-crete-heraklion": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        sourceName: "KTEL Heraklion-Lasithi timetable FAQ",
        value: "12 weekday outbound spine departures",
      },
      "gr-crete-rethymno": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        sourceName: "KTEL Chania-Rethymno Rethymno departures PDF valid from 23 June 2026",
        value: "37 daily outbound spine departures",
      },
      "gr-crete-agios-nikolaos": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        sourceName: "KTEL Heraklion-Lasithi timetable FAQ",
        value: "6 weekday outbound spine departures",
      },
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "bus_frequency_proxy");
      const expectedRow = expected[bundle.id as keyof typeof expected];
      expect(row?.coverageStatus, bundle.id).toBe(expectedRow.coverageStatus);
      expect(row?.observedGranularity, bundle.id).toBe(expectedRow.observedGranularity);
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.category, bundle.id).toBe("connectivity");
      expect(row?.cited?.granularity, bundle.id).toBe(expectedRow.observedGranularity);
      expect(row?.cited?.sourceName, bundle.id).toBe(expectedRow.sourceName);
      expect(String(row?.cited?.value), bundle.id).toContain(expectedRow.value);
      expect(row?.unit, bundle.id).toBe("selected official KTEL timetable departures");
      expect(row?.notes, bundle.id).toContain("not a full public-transport network score");
      expect(row?.notes, bundle.id).toContain("not a local bus coverage audit");
      expect(row?.notes, bundle.id).toContain("Refresh before publication");
    }
  });

  it("populates derived car-dependency proxies from cited component rows", () => {
    const expected = {
      "gr-crete-region": {
        coverageStatus: "regional",
        observedGranularity: "region",
        value: "9-54/100",
      },
      "gr-crete-chania": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "Chania: 9/100",
      },
      "gr-crete-heraklion": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "Heraklion: 13/100",
      },
      "gr-crete-rethymno": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "Rethymno: 28/100",
      },
      "gr-crete-agios-nikolaos": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "Agios Nikolaos: 54/100",
      },
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "car_dependency_proxy");
      const expectedRow = expected[bundle.id as keyof typeof expected];
      expect(row?.coverageStatus, bundle.id).toBe(expectedRow.coverageStatus);
      expect(row?.observedGranularity, bundle.id).toBe(expectedRow.observedGranularity);
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.category, bundle.id).toBe("connectivity");
      expect(row?.cited?.granularity, bundle.id).toBe(expectedRow.observedGranularity);
      expect(String(row?.cited?.value), bundle.id).toContain(expectedRow.value);
      expect(row?.unit, bundle.id).toBe(
        "0-100 derived car-dependency proxy, higher means more car-dependent",
      );
      expect(row?.notes, bundle.id).toContain("not a car-ownership rate");
      expect(row?.notes, bundle.id).toContain("not a full local bus coverage audit");
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("transport advice");
    }
  });

  it("populates direct-destination skeletons only as stale OpenFlights proxies", () => {
    const expectedTownCounts = {
      "gr-crete-chania": 37,
      "gr-crete-heraklion": 59,
      "gr-crete-rethymno": 37,
      "gr-crete-agios-nikolaos": 4,
    };

    const regionRow = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "direct_destinations",
    );
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.sourceGapReason).toBeUndefined();
    expect(regionRow?.cited?.sourceName).toContain("OpenFlights");
    expect(regionRow?.cited?.confidence).toBe("low");
    expect(regionRow?.notes).toContain("not current direct-flight");

    for (const [id, expectedCount] of Object.entries(expectedTownCounts)) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "direct_destinations",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.value, id).toBe(expectedCount);
      expect(row?.cited?.sourceName, id).toContain("OpenFlights");
      expect(row?.cited?.confidence, id).toBe("low");
      expect(row?.notes, id).toContain("Stale OpenFlights route-skeleton count only");
      expect(row?.notes, id).toContain("not current direct-flight");
    }
  });

  it("populates terrain elevation as point samples without treating it as hazard evidence", () => {
    const expectedTownElevations = {
      "gr-crete-chania": 15,
      "gr-crete-heraklion": 29,
      "gr-crete-rethymno": 8,
      "gr-crete-agios-nikolaos": -2,
    };

    for (const [id, elevation] of Object.entries(expectedTownElevations)) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "elevation_m");
      expect(row?.coverageStatus, id).toBe("local");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.cited?.value, id).toBe(elevation);
      expect(row?.cited?.sourceName, id).toContain("Open-Meteo Elevation API");
      expect(row?.notes, id).toContain("not a municipal elevation range");
      expect(row?.notes, id).toContain("flood-risk");
    }

    const regional = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "elevation_m",
    );
    expect(regional?.coverageStatus).toBe("proxy");
    expect(regional?.observedGranularity).toBe("region");
    expect(String(regional?.cited?.value)).toContain("Priority-town point elevations");
    expect(regional?.notes).toContain("not a Crete-wide elevation range");
  });

  it("populates railway-station access as an OSM proxy without treating zero as unknown", () => {
    for (const id of CRETE_IDS) {
      const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === "rail_station");
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.cited?.value, id).toBe(0);
      expect(row?.cited?.category, id).toBe("connectivity");
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.notes, id).toContain("not a legal or timetable guarantee");
    }
  });

  it("populates national WDI health context without making local health claims", () => {
    for (const bundle of placeEvidenceBundles) {
      const lifeExpectancy = bundle.rows.find((item) => item.key === "life_expectancy");
      const infantMortality = bundle.rows.find((item) => item.key === "infant_mortality");
      const oopSpending = bundle.rows.find((item) => item.key === "oop_spending_share");
      const dtp3 = bundle.rows.find((item) => item.key === "vaccination_dtp3");
      expect(lifeExpectancy?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(lifeExpectancy?.observedGranularity, bundle.id).toBe("country");
      expect(lifeExpectancy?.cited?.value, bundle.id).toBe(81.84);
      expect(lifeExpectancy?.notes, bundle.id).toContain("not a Crete");
      expect(infantMortality?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(infantMortality?.observedGranularity, bundle.id).toBe("country");
      expect(infantMortality?.cited?.value, bundle.id).toBe(3.2);
      expect(infantMortality?.notes, bundle.id).toContain("not a local");
      expect(oopSpending?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(oopSpending?.observedGranularity, bundle.id).toBe("country");
      expect(oopSpending?.cited?.value, bundle.id).toBe(34.3);
      expect(oopSpending?.notes, bundle.id).toContain("not a local insurance eligibility");
      expect(dtp3?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(dtp3?.observedGranularity, bundle.id).toBe("country");
      expect(dtp3?.cited?.value, bundle.id).toBe(95);
      expect(dtp3?.notes, bundle.id).toContain("not a local paediatric access measure");
    }
  });

  it("populates WHO WUENIC MCV2 coverage without making local vaccine claims", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "vaccination_mmr");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(71);
      expect(row?.cited?.sourceName, bundle.id).toContain("WHO/UNICEF");
      expect(row?.cited?.excerpt, bundle.id).toContain("MCV2");
      expect(row?.notes, bundle.id).toContain("measles-containing second-dose");
      expect(row?.notes, bundle.id).toContain("not a Crete or town vaccine-availability");
    }
  });

  it("populates national homicide context without making local safety claims", () => {
    for (const bundle of placeEvidenceBundles) {
      const homicide = bundle.rows.find((item) => item.key === "homicide_rate");
      expect(homicide?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(homicide?.observedGranularity, bundle.id).toBe("country");
      expect(homicide?.cited?.value, bundle.id).toBe(0.84);
      expect(homicide?.cited?.category, bundle.id).toBe("safety");
      expect(homicide?.notes, bundle.id).toContain("not a local crime rate");
    }
  });

  it("populates foreign-born share as a derived national context row", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "foreign_born_share");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(11.0);
      expect(row?.cited?.sourceName, bundle.id).toContain("TPS00178");
      expect(row?.cited?.excerpt, bundle.id).toContain("derived share");
      expect(row?.notes, bundle.id).toContain("not a Crete migrant-community measure");
      expect(row?.notes, bundle.id).toContain("Denominator endpoint");
    }
  });

  it("populates under-3 formal childcare participation as national context", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "ecec_enrolment_under3");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(23.7);
      expect(row?.cited?.sourceName, bundle.id).toContain("ILC_CAINDFORMAL");
      expect(row?.cited?.excerpt, bundle.id).toContain("9.5 percent");
      expect(row?.cited?.excerpt, bundle.id).toContain("14.2 percent");
      expect(row?.notes, bundle.id).toContain("not a Crete childcare-place count");
    }
  });

  it("populates PISA national education context without making local school claims", () => {
    const expected = {
      pisa_maths: 430,
      pisa_reading: 438,
      pisa_science: 441,
    };
    for (const bundle of placeEvidenceBundles) {
      for (const [key, value] of Object.entries(expected)) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("inherited_national");
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain("OECD PISA 2022");
        expect(row?.cited?.excerpt, `${bundle.id}:${key}`).toContain("page 420");
        expect(row?.unit, `${bundle.id}:${key}`).toContain("PISA score points");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not a Crete");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("school");
      }
    }
  });

  it("populates OECD national paid-leave context without making local eligibility claims", () => {
    const expected = {
      maternity_leave_weeks: 56,
      parental_leave_weeks: 8.7,
    };
    for (const bundle of placeEvidenceBundles) {
      for (const [key, value] of Object.entries(expected)) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("inherited_national");
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain(
          "OECD Family Database PF2.1",
        );
        expect(row?.unit, `${bundle.id}:${key}`).toBe("weeks");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("National Greece");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not employer-specific");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("local family-service");
      }
    }
  });

  it("populates national lifestyle context without making local exposure claims", () => {
    for (const bundle of placeEvidenceBundles) {
      const smoking = bundle.rows.find((item) => item.key === "smoking_prevalence");
      const alcohol = bundle.rows.find((item) => item.key === "alcohol_consumption");
      expect(smoking?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(smoking?.observedGranularity, bundle.id).toBe("country");
      expect(smoking?.cited?.value, bundle.id).toBe(32.8);
      expect(smoking?.notes, bundle.id).toContain("not a Crete");
      expect(smoking?.notes, bundle.id).toContain("personal exposure");
      expect(alcohol?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(alcohol?.observedGranularity, bundle.id).toBe("country");
      expect(alcohol?.cited?.value, bundle.id).toBe(5.81);
      expect(alcohol?.notes, bundle.id).toContain("not a local drinking-culture");
    }
  });

  it("populates CPI as national perception-index context", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "corruption_cpi");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(50);
      expect(row?.cited?.sourceName, bundle.id).toContain("Transparency International");
      expect(row?.cited?.category, bundle.id).toBe("safety");
      expect(row?.notes, bundle.id).toContain("not a town-level corruption measure");
    }
  });

  it("populates WGI governance percentiles without making local safety claims", () => {
    const expected = {
      pol_stability: 49.1,
      govt_effectiveness: 66.5,
      rule_of_law: 59.9,
    };
    for (const bundle of placeEvidenceBundles) {
      for (const [key, value] of Object.entries(expected)) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("inherited_national");
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain(
          "Worldwide Governance Indicators",
        );
        expect(row?.cited?.excerpt, `${bundle.id}:${key}`).toContain("WGI 2022 Greece");
        expect(row?.unit, `${bundle.id}:${key}`).toContain("percentile rank");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("perception-based");
        expect(row?.notes, `${bundle.id}:${key}`).toMatch(/not a (Crete|town-level|town)/);
      }
    }
  });

  it("populates ILGA legal-policy context without making local social-acceptance claims", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "lgbt_legal");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(68);
      expect(row?.cited?.sourceName, bundle.id).toContain("ILGA-Europe Rainbow Map 2026");
      expect(row?.unit, bundle.id).toContain("percent score");
      expect(row?.notes, bundle.id).toContain("legal and policy score");
      expect(row?.notes, bundle.id).toContain("not a Crete");
      expect(row?.notes, bundle.id).toContain("social-acceptance");
    }
  });

  it("populates Equaldex equality context without making local acceptance claims", () => {
    const expected = {
      lgbt_social: 40,
      lgbt_combined: 66,
    };
    for (const bundle of placeEvidenceBundles) {
      for (const [key, value] of Object.entries(expected)) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("inherited_national");
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain("Equaldex");
        expect(row?.unit, `${bundle.id}:${key}`).toContain("0 to 100");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not a Crete");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("personal safety measure");
      }
    }
  });

  it("populates WPS women-safety context without making local personal-safety claims", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "womens_safety");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(0.752);
      expect(row?.cited?.sourceName, bundle.id).toContain("Women, Peace and Security Index");
      expect(row?.cited?.excerpt, bundle.id).toContain("rank 60");
      expect(row?.unit, bundle.id).toContain("0 to 1");
      expect(row?.notes, bundle.id).toContain("composite country index");
      expect(row?.notes, bundle.id).toContain("not a Crete");
      expect(row?.notes, bundle.id).toContain("personal safety prediction");
    }
  });

  it("populates press freedom as national index context", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "press_freedom");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(55.05);
      expect(row?.cited?.sourceName, bundle.id).toContain("Reporters Without Borders");
      expect(row?.cited?.category, bundle.id).toBe("safety");
      expect(row?.notes, bundle.id).toContain("not a town-level media environment");
    }
  });

  it("populates English proficiency as national test-taker index context", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "english_proficiency");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toContain("592");
      expect(row?.cited?.sourceName, bundle.id).toContain("EF English Proficiency Index");
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.notes, bundle.id).toContain("not a Crete English-service availability");
      expect(row?.notes, bundle.id).toContain("self-selected");
    }
  });

  it("keeps vegan-friendly rows blocked by source terms instead of directory scraping", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "vegan_friendly");
      expect(row?.coverageStatus, bundle.id).toBe("blocked");
      expect(row?.sourceGapReason, bundle.id).toBe("source_terms_block_reuse");
      expect(row?.notes, bundle.id).toContain("Accepted publication policy gap");
      expect(row?.notes, bundle.id).toContain("HappyCow");
      expect(row?.notes, bundle.id).toContain("terms review");
      expect(row?.notes, bundle.id).toContain("terms-cleared");
      expect(row?.notes, bundle.id).toContain("do not scrape");
      expect(row?.notes, bundle.id).not.toContain("source_search_required");
    }
  });

  it("keeps Numbeo city-price rows as accepted publication gaps without scraping substitutes", () => {
    const numbeoPriceRows = ["rent_1bed_city", "grocery_basket", "restaurant_meal", "beer_price"];

    for (const bundle of placeEvidenceBundles) {
      for (const key of numbeoPriceRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("blocked");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBe("source_exists_but_paywalled");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("Accepted publication policy gap");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("paid Numbeo city_prices API");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("visible source gap");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("do not substitute scraped HTML");
        expect(row?.notes, `${bundle.id}:${key}`).not.toContain("source_search_required");
      }
    }
  });

  it("populates HIEF ethnic fractionalization as inherited national context only", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "ethnic_fractionalization");
      expect(row?.coverageStatus, bundle.id).toBe("inherited_national");
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.value, bundle.id).toBe(0.167);
      expect(row?.cited?.sourceName, bundle.id).toContain("Historical Index");
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.granularity, bundle.id).toBe("country");
      expect(row?.notes, bundle.id).toContain("National Greece HIEF");
      expect(row?.notes, bundle.id).toContain("not a Crete");
      expect(row?.notes, bundle.id).toContain("personal-safety measure");
    }
  });

  it("keeps property portal rows as accepted terms-limited gaps unless licensed", () => {
    const propertyPortalRows = [
      "sale_inventory_count",
      "rent_inventory_count",
      "long_let_inventory_count",
      "furnished_rental_share",
      "asking_rent_sqm",
      "rental_supply_seasonality",
      "pet_friendly_rental_proxy",
    ];

    for (const bundle of placeEvidenceBundles) {
      for (const key of propertyPortalRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe("blocked");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBe("source_terms_block_reuse");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("Accepted publication policy gap");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("property-portal data exists");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("terms prohibit commercial reuse");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("licensed provider feed");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("do not scrape");
        expect(row?.notes, `${bundle.id}:${key}`).not.toContain("source_search_required");
      }
    }
  });

  it("populates seasonal service drop-off as a cited OSM tag proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "seasonal_service_dropoff_proxy");
      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.sourceName, bundle.id).toContain("OpenStreetMap");
      expect(row?.cited?.confidence, bundle.id).toBe("low");
      expect(row?.notes, bundle.id).toContain("winter-vs-summer");
      expect(row?.notes, bundle.id).toContain("not advice");
    }
  });

  it("populates emergency-vet as a cited OSM emergency-tag proxy", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "emergency_vet_proxy");
      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.sourceName, bundle.id).toContain("OpenStreetMap");
      expect(row?.cited?.confidence, bundle.id).toBe("low");
      expect(row?.notes, bundle.id).toContain("not a complete veterinary directory");
      expect(row?.notes, bundle.id).toContain(
        "proof that untagged veterinary services do not offer emergency care",
      );
      expect(row?.notes, bundle.id).toContain("animal-health advice");
    }
  });

  it("populates cruise passenger pressure from ELIME 2024 port rows", () => {
    const expected = {
      "gr-crete-region": {
        coverageStatus: "regional",
        observedGranularity: "region",
        value: "473 cruise calls and 845,163 cruise passenger arrivals",
      },
      "gr-crete-chania": {
        coverageStatus: "proxy",
        observedGranularity: "town",
        value: "131 cruise calls and 279,754 cruise passenger arrivals",
      },
      "gr-crete-heraklion": {
        coverageStatus: "local",
        observedGranularity: "town",
        value: "266 cruise calls and 518,575 cruise passenger arrivals",
      },
      "gr-crete-rethymno": {
        coverageStatus: "local",
        observedGranularity: "town",
        value: "36 cruise calls and 1,788 cruise passenger arrivals",
      },
      "gr-crete-agios-nikolaos": {
        coverageStatus: "local",
        observedGranularity: "town",
        value: "40 cruise calls and 45,046 cruise passenger arrivals",
      },
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "cruise_passenger_pressure");
      const expectedRow = expected[bundle.id as keyof typeof expected];
      expect(row?.coverageStatus, bundle.id).toBe(expectedRow.coverageStatus);
      expect(row?.observedGranularity, bundle.id).toBe(expectedRow.observedGranularity);
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.sourceName, bundle.id).toContain("ELIME");
      expect(String(row?.cited?.value), bundle.id).toContain(expectedRow.value);
      expect(row?.unit, bundle.id).toBe("annual cruise calls and passenger arrivals");
      expect(row?.notes, bundle.id).toContain("not unique");
      expect(row?.notes, bundle.id).toContain("ferry passengers");
    }
  });

  it("populates water-restriction history for Crete priority towns from official dated notices", () => {
    const expectedSourceNames = {
      "gr-crete-chania": "Municipality of Chania and DEYAX water-supply interruption notice",
      "gr-crete-heraklion": "Municipality of Heraklion and DEYAH water-network works notice",
      "gr-crete-rethymno": "DEYA Rethymno water interruption notice",
      "gr-crete-agios-nikolaos":
        "Municipality of Agios Nikolaos and DEYAAN water-supply interruption notice",
    } as const;
    const regionRow = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "water_restriction_history",
    );

    expect(regionRow?.sourceGapReason).toBeUndefined();
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.sourceName).toContain("Official municipal and DEYA");
    expect(regionRow?.cited?.confidence).toBe("low");
    expect(regionRow?.cited?.value).toContain(
      "Priority-town recent official water-supply interruption notice history",
    );
    expect(regionRow?.unit).toBe(
      "priority-town official municipal or water-utility notice-history aggregate",
    );
    expect(regionRow?.notes).toContain("Accepted priority-town aggregate");
    expect(regionRow?.notes).toContain("not a true island-wide regional restriction history");

    for (const bundle of placeEvidenceBundles.filter((item) => item.id !== "gr-crete-region")) {
      const row = bundle.rows.find((item) => item.key === "water_restriction_history");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.coverageStatus, bundle.id).toBe("local");
      expect(row?.observedGranularity, bundle.id).toBe("town");
      expect(row?.cited?.sourceName, bundle.id).toBe(
        expectedSourceNames[bundle.id as keyof typeof expectedSourceNames],
      );
      expect(row?.cited?.confidence, bundle.id).toBe("low");
      expect(row?.cited?.value, bundle.id).toContain(
        "Recent official water-supply interruption notice",
      );
      expect(row?.unit, bundle.id).toBe(
        "official municipal or water-utility notice-history signal",
      );
      expect(row?.notes, bundle.id).toContain("low-confidence recent-notice history signal");
      expect(row?.notes, bundle.id).toContain("not a continuous water-stress baseline");
      expect(row?.notes, bundle.id).toContain("not a current outage status");
      expect(row?.notes, bundle.id).toContain("not a household supply guarantee");
      expect(row?.notes, bundle.id).toContain("health advice");
    }
  });

  it("populates after-hours pharmacy rota page availability from public duty-rota sources", () => {
    const expectedSourceNames = {
      "gr-crete-region":
        "Federation of Pharmacists' Associations of Crete duty-pharmacy link page and local rota pages",
      "gr-crete-chania": "Chania duty-pharmacy rota page",
      "gr-crete-heraklion": "Heraklion duty-pharmacy rota page",
      "gr-crete-rethymno": "Rethymno duty-pharmacy rota page",
      "gr-crete-agios-nikolaos": "Lasithi duty-pharmacy rota page",
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "after_hours_pharmacy_proxy");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.coverageStatus, bundle.id).toBe("proxy");
      expect(row?.observedGranularity, bundle.id).toBe(
        bundle.id === "gr-crete-agios-nikolaos" || bundle.id === "gr-crete-region"
          ? "region"
          : "town",
      );
      expect(row?.cited?.sourceName, bundle.id).toBe(
        expectedSourceNames[bundle.id as keyof typeof expectedSourceNames],
      );
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.cited?.category, bundle.id).toBe("healthcare");
      expect(row?.unit, bundle.id).toBe("public duty-pharmacy rota pages verified at source");
      expect(row?.notes, bundle.id).toContain("24/7 pharmacy-density measure");
      expect(row?.notes, bundle.id).toContain("medical advice");
      expect(row?.notes, bundle.id).toContain("refreshed close to publication");
    }
  });

  it("populates municipal digital-service availability from official public-service pages", () => {
    const expectedSourceNames = {
      "gr-crete-region": "Region of Crete citizen guide online requests page",
      "gr-crete-chania": "Municipality of Chania electronic requests portal",
      "gr-crete-heraklion": "Municipality of Heraklion electronic services portal",
      "gr-crete-rethymno": "Municipality of Rethymno e-services page",
      "gr-crete-agios-nikolaos": "Municipality of Agios Nikolaos e-services page",
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "municipal_digital_services");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.coverageStatus, bundle.id).toBe(
        bundle.id === "gr-crete-region" ? "regional" : "local",
      );
      expect(row?.observedGranularity, bundle.id).toBe(
        bundle.id === "gr-crete-region" ? "region" : "town",
      );
      expect(row?.cited?.sourceName, bundle.id).toBe(
        expectedSourceNames[bundle.id as keyof typeof expectedSourceNames],
      );
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.unit, bundle.id).toBe("official public digital-service pages verified at source");
      expect(row?.notes, bundle.id).toContain("service-completeness audit");
      expect(row?.notes, bundle.id).toContain("processing-time claim");
      expect(row?.notes, bundle.id).toContain("administrative advice");
    }
  });

  it("populates accessible beach count from the SEATRAC public directory", () => {
    const expectedValues = {
      "gr-crete-region": 9,
      "gr-crete-chania": 5,
      "gr-crete-heraklion": 3,
      "gr-crete-rethymno": 1,
      "gr-crete-agios-nikolaos": 0,
    } as const;

    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "accessible_beach_count");
      expect(row?.sourceGapReason, bundle.id).toBeUndefined();
      expect(row?.cited?.sourceName, bundle.id).toBe("SEATRAC beach directory");
      expect(row?.cited?.value, bundle.id).toBe(
        expectedValues[bundle.id as keyof typeof expectedValues],
      );
      expect(row?.unit, bundle.id).toBe(
        "online SEATRAC beach-directory entries at verification time",
      );
      expect(row?.notes, bundle.id).toContain("not a full accessible-beach inventory");
      expect(row?.notes, bundle.id).toContain("not a formal accessibility audit");
      expect(row?.cited?.excerpt, bundle.id).toContain("Online SEATRAC");
    }
  });

  it("populates national education and alternative-schooling context rows after source discovery", () => {
    const expectedRows = [
      ["intl_schools_count", 32, "European Agency"],
      ["homeschool_legal", "serious short-term or chronic health problems", "European Agency"],
      ["clil_bilingual", "No CLIL programmes reported for Greece", "Eurydice"],
      ["special_needs", "Law 4485/2017", "European Agency"],
      ["montessori_presence", "The Montessori Institute, Greece", "Montessori"],
      ["waldorf_presence", "three Waldorf kindergartens", "Waldorf"],
    ] as const;

    for (const bundle of placeEvidenceBundles) {
      const expectedCoverage = bundle.granularity === "region" ? "national" : "inherited_national";
      for (const [key, value, source] of expectedRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe(expectedCoverage);
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBeUndefined();
        expect(String(row?.cited?.value), `${bundle.id}:${key}`).toContain(String(value));
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain(source);
        expect(row?.cited?.confidence, `${bundle.id}:${key}`).toBe("medium");
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not");
      }

      const ltcQuality = bundle.rows.find((item) => item.key === "ltc_quality");
      expect(ltcQuality?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(ltcQuality?.observedGranularity, bundle.id).toBe("country");
      expect(ltcQuality?.sourceGapReason, bundle.id).toBeUndefined();
      expect(ltcQuality?.cited?.value, bundle.id).toBe(3.3);
      expect(ltcQuality?.cited?.sourceName, bundle.id).toContain("OECD Health at a Glance 2025");
      expect(ltcQuality?.cited?.confidence, bundle.id).toBe("medium");
      expect(ltcQuality?.cited?.granularity, bundle.id).toBe("country");
      expect(ltcQuality?.notes, bundle.id).toContain("not a full elder-care quality score");
      expect(ltcQuality?.notes, bundle.id).not.toContain("source_search_required");
    }
  });

  it("populates national IVF, social trust, and religiosity rows after source discovery", () => {
    for (const bundle of placeEvidenceBundles) {
      const expectedCoverage = bundle.granularity === "region" ? "national" : "inherited_national";

      const ivf = bundle.rows.find((item) => item.key === "ivf_access");
      expect(ivf?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(ivf?.observedGranularity, bundle.id).toBe("country");
      expect(ivf?.cited?.value, bundle.id).toBe(73);
      expect(ivf?.cited?.sourceName, bundle.id).toContain("Fertility Europe");
      expect(ivf?.cited?.confidence, bundle.id).toBe("medium");
      expect(ivf?.notes, bundle.id).toContain("not Crete clinic access");

      const trust = bundle.rows.find((item) => item.key === "social_trust");
      expect(trust?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(trust?.observedGranularity, bundle.id).toBe("country");
      expect(trust?.cited?.value, bundle.id).toBe(4.42);
      expect(trust?.cited?.sourceName, bundle.id).toContain("European Social Survey");
      expect(trust?.cited?.confidence, bundle.id).toBe("high");
      expect(trust?.notes, bundle.id).toContain("not a Crete or town-level trust");

      const religiosity = bundle.rows.find((item) => item.key === "religiosity");
      expect(religiosity?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(religiosity?.observedGranularity, bundle.id).toBe("country");
      expect(religiosity?.cited?.value, bundle.id).toBe(8.55);
      expect(religiosity?.cited?.sourceName, bundle.id).toContain("European Social Survey");
      expect(religiosity?.cited?.confidence, bundle.id).toBe("high");
      expect(religiosity?.notes, bundle.id).toContain("not a Crete or town-level measure");
    }
  });

  it("populates QS higher-education context and keeps the noise source gap", () => {
    for (const bundle of placeEvidenceBundles) {
      const expectedCoverage = bundle.granularity === "region" ? "national" : "inherited_national";

      const noise = bundle.rows.find((item) => item.key === "noise_pollution");
      expect(noise?.coverageStatus, bundle.id).toBe("unavailable");
      expect(noise?.sourceGapReason, bundle.id).toBe("no_public_source_found");
      expect(noise?.notes, bundle.id).toContain("EEA");
      expect(noise?.notes, bundle.id).toContain("no Greece row");

      const qs = bundle.rows.find((item) => item.key === "top_university_qs");
      expect(qs?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(qs?.observedGranularity, bundle.id).toBe("country");
      expect(qs?.sourceGapReason, bundle.id).toBeUndefined();
      expect(String(qs?.cited?.value), bundle.id).toContain(
        "National Technical University of Athens",
      );
      expect(String(qs?.cited?.value), bundle.id).toContain("rank #378");
      expect(qs?.cited?.sourceName, bundle.id).toContain("QS World University Rankings 2027");
      expect(qs?.cited?.confidence, bundle.id).toBe("high");
      expect(qs?.cited?.granularity, bundle.id).toBe("country");
      expect(qs?.notes, bundle.id).toContain("not a Crete university-access");
    }
  });

  it("populates national visa, residence, and citizenship-screening rows from official sources", () => {
    for (const bundle of placeEvidenceBundles) {
      const expectedCoverage = bundle.granularity === "region" ? "national" : "inherited_national";

      const pr = bundle.rows.find((item) => item.key === "pr_years");
      expect(pr?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(pr?.observedGranularity, bundle.id).toBe("country");
      expect(pr?.cited?.value, bundle.id).toBe(5);
      expect(pr?.cited?.sourceName, bundle.id).toContain("EU Immigration Portal");
      expect(pr?.cited?.category, bundle.id).toBe("residency");
      expect(pr?.cited?.confidence, bundle.id).toBe("high");
      expect(pr?.notes, bundle.id).toContain("not an eligibility decision");

      const family = bundle.rows.find((item) => item.key === "family_reunification");
      expect(family?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(family?.observedGranularity, bundle.id).toBe("country");
      expect(family?.cited?.value, bundle.id).toContain("2 years");
      expect(family?.cited?.sourceName, bundle.id).toContain("EU Immigration Portal");
      expect(family?.cited?.category, bundle.id).toBe("residency");
      expect(family?.notes, bundle.id).toContain("not an eligibility decision");

      const blueCard = bundle.rows.find((item) => item.key === "blue_card_threshold");
      expect(blueCard?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(blueCard?.observedGranularity, bundle.id).toBe("country");
      expect(blueCard?.cited?.value, bundle.id).toContain("1.5x");
      expect(blueCard?.cited?.sourceName, bundle.id).toContain("Highly-qualified worker");
      expect(blueCard?.cited?.category, bundle.id).toBe("visa");
      expect(blueCard?.notes, bundle.id).toContain("not a euro threshold");

      const schengen = bundle.rows.find((item) => item.key === "schengen_visa_fee");
      expect(schengen?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(schengen?.observedGranularity, bundle.id).toBe("country");
      expect(schengen?.cited?.value, bundle.id).toBe(90);
      expect(schengen?.cited?.sourceName, bundle.id).toContain("Schengen Visa Fee");
      expect(schengen?.cited?.category, bundle.id).toBe("visa");
      expect(schengen?.notes, bundle.id).toContain("not visa eligibility advice");

      const civic = bundle.rows.find((item) => item.key === "citizenship_civic_test");
      expect(civic?.coverageStatus, bundle.id).toBe(expectedCoverage);
      expect(civic?.observedGranularity, bundle.id).toBe("country");
      expect(civic?.cited?.value, bundle.id).toContain("Certificate of Knowledge");
      expect(civic?.cited?.sourceName, bundle.id).toContain("National Registry");
      expect(civic?.cited?.category, bundle.id).toBe("residency");
      expect(civic?.notes, bundle.id).toContain("not proof of citizenship eligibility");
    }
  });

  it("populates national health-system rows with cited country values", () => {
    const expectedRows = [
      ["hospital_beds_per_1k", 4.24, "Eurostat"],
      ["public_health_coverage", 100, "OECD Health at a Glance 2025"],
      ["psychiatrists_per_100k", 26.02, "Eurostat"],
      ["paediatricians_per_10k", 4.42, "Eurostat"],
      ["ltc_beds_per_100k", 19.94, "Eurostat"],
    ] as const;
    for (const bundle of placeEvidenceBundles) {
      for (const [key, value, source] of expectedRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe(
          bundle.granularity === "region" ? "national" : "inherited_national",
        );
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain(source);
        expect(row?.cited?.confidence, `${bundle.id}:${key}`).toBe("high");
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not");
      }
    }
  });

  it("populates company formation as national B-READY context", () => {
    for (const bundle of placeEvidenceBundles) {
      const row = bundle.rows.find((item) => item.key === "company_formation");
      expect(row?.coverageStatus, bundle.id).toBe(
        bundle.granularity === "region" ? "national" : "inherited_national",
      );
      expect(row?.observedGranularity, bundle.id).toBe("country");
      expect(row?.cited?.value, bundle.id).toBe(96.58);
      expect(row?.cited?.sourceName, bundle.id).toContain("World Bank Open Data");
      expect(row?.cited?.confidence, bundle.id).toBe("medium");
      expect(row?.notes, bundle.id).toContain("not");
      expect(row?.notes, bundle.id).toContain("company");
    }
  });

  it("populates childcare-cost context and keeps recorded-crime as a real source gap", () => {
    for (const bundle of placeEvidenceBundles) {
      const expectedCoverage = bundle.granularity === "region" ? "national" : "inherited_national";

      for (const key of ["childcare_net_cost", "childcare_cost"]) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe(expectedCoverage);
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBeUndefined();
        expect(String(row?.cited?.value), `${bundle.id}:${key}`).toContain("Below 10%");
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain("OECD Family Database");
        expect(row?.cited?.confidence, `${bundle.id}:${key}`).toBe("medium");
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not a local nursery price");
      }
      const crimeRow = bundle.rows.find((item) => item.key === "recorded_crime");
      expect(crimeRow?.coverageStatus, bundle.id).toBe("unavailable");
      expect(crimeRow?.sourceGapReason, bundle.id).toBe("no_public_source_found");
      expect(crimeRow?.notes, bundle.id).toContain("not a total all-offences rate");
    }
  });

  it("populates national education, language, outage, parkrun, and pet context rows", () => {
    const expectedRows = [
      ["english_for_health", "EF EPI score 592, rank 20, high proficiency", "EF English"],
      ["pupil_teacher_ratio", 9.38, "World Bank Open Data"],
      ["power_outage_reliability", 21.26, "World Bank Open Data"],
      ["parkrun_events", 0, "parkrun official countries page"],
    ] as const;
    for (const bundle of placeEvidenceBundles) {
      for (const [key, value, source] of expectedRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe(
          bundle.granularity === "region" ? "national" : "inherited_national",
        );
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain(source);
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe("country");
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not");
      }
      const petRow = bundle.rows.find((item) => item.key === "pet_import_rules");
      expect(petRow?.coverageStatus, bundle.id).toBe(
        bundle.granularity === "region" ? "national" : "inherited_national",
      );
      expect(petRow?.observedGranularity, bundle.id).toBe("country");
      expect(petRow?.cited?.sourceName, bundle.id).toContain("Your Europe");
      expect(petRow?.cited?.value, bundle.id).toContain("Origin-dependent EU rules");
      expect(petRow?.notes, bundle.id).toContain("not veterinary");
    }
  });

  it("populates national fuel and cannabis legal-context rows", () => {
    for (const bundle of placeEvidenceBundles) {
      const fuelRow = bundle.rows.find((item) => item.key === "fuel_price");
      expect(fuelRow?.coverageStatus, bundle.id).toBe(
        bundle.granularity === "region" ? "national" : "inherited_national",
      );
      expect(fuelRow?.observedGranularity, bundle.id).toBe("country");
      expect(fuelRow?.sourceGapReason, bundle.id).toBeUndefined();
      expect(fuelRow?.cited?.value, bundle.id).toContain("EUR 1.932/litre");
      expect(fuelRow?.cited?.value, bundle.id).toContain("EUR 1.641/litre");
      expect(fuelRow?.cited?.sourceName, bundle.id).toContain(
        "European Commission Weekly Oil Bulletin",
      );
      expect(fuelRow?.cited?.confidence, bundle.id).toBe("high");
      expect(fuelRow?.cited?.granularity, bundle.id).toBe("country");
      expect(fuelRow?.notes, bundle.id).toContain("not");

      const cannabisRow = bundle.rows.find((item) => item.key === "cannabis_status");
      expect(cannabisRow?.coverageStatus, bundle.id).toBe(
        bundle.granularity === "region" ? "national" : "inherited_national",
      );
      expect(cannabisRow?.observedGranularity, bundle.id).toBe("country");
      expect(cannabisRow?.sourceGapReason, bundle.id).toBeUndefined();
      expect(cannabisRow?.cited?.value, bundle.id).toContain("prohibited");
      expect(cannabisRow?.cited?.sourceName, bundle.id).toContain("European Union Drugs Agency");
      expect(cannabisRow?.cited?.confidence, bundle.id).toBe("medium");
      expect(cannabisRow?.cited?.granularity, bundle.id).toBe("country");
      expect(cannabisRow?.notes, bundle.id).toContain("not legal advice");
    }
  });

  it("populates nearest-airport records and keeps distance as a proxy", () => {
    expect(
      placeEvidenceBundleById("gr-crete-chania")?.rows.find((row) => row.key === "nearest_airport")
        ?.cited?.value,
    ).toContain("CHQ");
    expect(
      placeEvidenceBundleById("gr-crete-heraklion")?.rows.find(
        (row) => row.key === "nearest_airport",
      )?.cited?.value,
    ).toContain("HER");
    expect(
      placeEvidenceBundleById("gr-crete-rethymno")?.rows.find(
        (row) => row.key === "nearest_airport",
      )?.cited?.value,
    ).toContain("CHQ");
    expect(
      placeEvidenceBundleById("gr-crete-agios-nikolaos")?.rows.find(
        (row) => row.key === "nearest_airport",
      )?.cited?.value,
    ).toContain("JSH");
    const regionalAirport = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (row) => row.key === "nearest_airport",
    );
    expect(regionalAirport?.coverageStatus).toBe("proxy");
    expect(regionalAirport?.observedGranularity).toBe("region");
    expect(regionalAirport?.sourceGapReason).toBeUndefined();
    expect(regionalAirport?.cited?.sourceName).toContain("OurAirports");
    expect(regionalAirport?.cited?.value).toContain("Chania -> CHQ/LGSA");
    expect(regionalAirport?.cited?.value).toContain("Agios Nikolaos -> JSH/LGST");
    expect(regionalAirport?.notes).toContain("not a full Crete airport-access model");
    for (const id of CRETE_TOWN_IDS) {
      const distanceRow = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "nearest_airport_distance_km",
      );
      expect(distanceRow, id).toBeUndefined();
    }
  });

  it("populates airport drive time as an OSRM route proxy for every town", () => {
    for (const id of CRETE_TOWN_IDS) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "airport_drive_minutes",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.unit, id).toBe("OSRM driving route proxy");
      expect(row?.cited?.category, id).toBe("connectivity");
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.notes, id).toMatch(/traffic|guaranteed|Fastest OSRM/);
    }
    expect(
      String(
        placeEvidenceBundleById("gr-crete-rethymno")?.rows.find(
          (item) => item.key === "airport_drive_minutes",
        )?.cited?.value,
      ),
    ).toContain("HER/LGIR");
    expect(
      String(
        placeEvidenceBundleById("gr-crete-agios-nikolaos")?.rows.find(
          (item) => item.key === "airport_drive_minutes",
        )?.cited?.value,
      ),
    ).toContain("HER/LGIR");
  });

  it("populates Crete airport drive time as a regional proxy summary", () => {
    const row = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "airport_drive_minutes",
    );
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.unit).toBe("OSRM driving route proxy");
    expect(row?.cited?.category).toBe("connectivity");
    expect(String(row?.cited?.value)).toContain("Heraklion 7.9 minutes");
    expect(String(row?.cited?.value)).toContain("Rethymno 84.8 minutes");
  });

  it("populates comparable OSM daily-life proxy rows for every town", () => {
    const dailyLifeRows = [
      "cafe_density",
      "restaurant_density",
      "pharmacy_density",
      "gym_density",
      "library_density",
      "museum_gallery",
      "theatre_cinema",
    ];
    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      expect(bundle, id).toBeDefined();
      if (!bundle) continue;
      for (const key of dailyLifeRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.unit, `${id}:${key}`).toBe("OSM features within 2 km");
        expect(row?.cited?.confidence, `${id}:${key}`).toBe("medium");
      }
    }
  });

  it("populates comparable OSM family-service proxy rows for every town", () => {
    const familyRows = [
      "primary_school_density",
      "nursery_density",
      "swimming_pool",
      "playground_density",
    ];
    for (const id of CRETE_TOWN_IDS) {
      for (const key of familyRows) {
        const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.unit, `${id}:${key}`).toBe("OSM features within 2 km");
        if (key !== "swimming_pool") {
          expect(row?.matrixCategory, `${id}:${key}`).toBe("health_family_schooling");
        }
        expect(row?.cited?.confidence, `${id}:${key}`).toBe("medium");
      }
    }
  });

  it("populates derived family amenity density from cited OSM component rows", () => {
    const expectedValues = {
      "gr-crete-chania": "2.4 OSM family-service features/km2; mapped green-space share 8%.",
      "gr-crete-heraklion": "5.8 OSM family-service features/km2; mapped green-space share 5.8%.",
      "gr-crete-rethymno": "2.1 OSM family-service features/km2; mapped green-space share 13.9%.",
      "gr-crete-agios-nikolaos":
        "2.5 OSM family-service features/km2; mapped green-space share 12.9%.",
    };

    const region = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "family_amenity_density",
    );
    expect(region?.coverageStatus).toBe("proxy");
    expect(region?.observedGranularity).toBe("region");
    expect(region?.sourceGapReason).toBeUndefined();
    expect(region?.cited?.value).toContain("Priority-town range for Crete: 2.1-5.8");
    expect(region?.cited?.value).toContain("green-space share 5.8-13.9%");
    expect(region?.notes).toContain("not an island-wide family-service inventory");
    expect(region?.notes).toContain("not");
    expect(region?.notes).toContain("family suitability advice");

    for (const [id, value] of Object.entries(expectedValues)) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "family_amenity_density",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.observedGranularity, id).toBe("town");
      expect(row?.sourceGapReason, id).toBeUndefined();
      expect(row?.cited?.value, id).toBe(value);
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(row?.cited?.sourceName, id).toContain("Derived from cited OpenStreetMap proxy rows");
      expect(row?.cited?.excerpt, id).toContain("selected family-service features within 2 km");
      expect(row?.unit, id).toContain("family-service features per km2");
      expect(row?.notes, id).toContain("not childcare availability");
      expect(row?.notes, id).toContain("not family suitability advice");
    }
  });

  it("keeps Crete service-count rows as priority-town regional summaries", () => {
    const serviceRows = [
      "cafe_density",
      "primary_school_density",
      "nursery_density",
      "library_density",
      "museum_gallery",
      "theatre_cinema",
      "gym_density",
      "restaurant_density",
      "swimming_pool",
      "playground_density",
    ];
    const bundle = placeEvidenceBundleById("gr-crete-region");
    for (const key of serviceRows) {
      const row = bundle?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, key).toBe("proxy");
      expect(row?.observedGranularity, key).toBe("region");
      expect(row?.unit, key).toBe("OSM features within 2 km of each priority town point");
      expect(row?.notes, key).toContain("not a full Crete inventory");
    }
  });

  it("populates expanded OSM local-service proxy rows for every priority town", () => {
    const expectedCounts: Record<string, Record<string, number>> = {
      "gr-crete-chania": {
        ambulance_station_count: 0,
        bike_share: 4,
        coworking_space_count: 0,
        dog_park_count: 0,
        ev_charging: 13,
        family_doctor_clinic_proxy: 2,
        hotel_density_osm: 139,
        intercity_bus_terminal_presence: 1,
        nightlife_density: 39,
        public_toilet_density: 9,
        transit_lines: 49,
        urgent_care_clinic_count: 1,
      },
      "gr-crete-heraklion": {
        ambulance_station_count: 1,
        bike_share: 2,
        coworking_space_count: 1,
        dog_park_count: 0,
        ev_charging: 21,
        family_doctor_clinic_proxy: 7,
        hotel_density_osm: 49,
        intercity_bus_terminal_presence: 5,
        nightlife_density: 19,
        public_toilet_density: 9,
        transit_lines: 67,
        urgent_care_clinic_count: 2,
      },
      "gr-crete-rethymno": {
        ambulance_station_count: 0,
        bike_share: 5,
        coworking_space_count: 0,
        dog_park_count: 1,
        ev_charging: 9,
        family_doctor_clinic_proxy: 6,
        hotel_density_osm: 70,
        intercity_bus_terminal_presence: 1,
        nightlife_density: 33,
        public_toilet_density: 6,
        transit_lines: 27,
        urgent_care_clinic_count: 2,
      },
      "gr-crete-agios-nikolaos": {
        ambulance_station_count: 0,
        bike_share: 2,
        coworking_space_count: 0,
        dog_park_count: 0,
        ev_charging: 6,
        family_doctor_clinic_proxy: 5,
        hotel_density_osm: 47,
        intercity_bus_terminal_presence: 2,
        nightlife_density: 19,
        public_toilet_density: 7,
        transit_lines: 10,
        urgent_care_clinic_count: 0,
      },
    };

    const alwaysZeroRows = [
      "craft_plumber",
      "craft_electrician",
      "craft_carpenter",
      "craft_builder",
      "sauna_density",
      "climbing_gym",
      "high_speed_rail",
      "private_hospital_presence",
    ];

    for (const id of CRETE_TOWN_IDS) {
      const bundle = placeEvidenceBundleById(id);
      expect(bundle, id).toBeDefined();
      if (!bundle) continue;

      for (const [key, value] of Object.entries(expectedCounts[id] ?? {})) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.observedGranularity, `${id}:${key}`).toBe("town");
        expect(row?.sourceGapReason, `${id}:${key}`).toBeUndefined();
        expect(row?.cited?.value, `${id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${id}:${key}`).toContain(
          "OpenStreetMap contributors via Overpass API",
        );
        expect(row?.notes, `${id}:${key}`).toContain("not");
      }

      for (const key of alwaysZeroRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.cited?.value, `${id}:${key}`).toBe(0);
        expect(row?.notes, `${id}:${key}`).toContain("zero count means no mapped");
      }
    }
  });

  it("keeps expanded Crete OSM service rows as four-town regional summaries", () => {
    const regionalRows = [
      "bike_share",
      "coworking_space_count",
      "ev_charging",
      "family_doctor_clinic_proxy",
      "hotel_density_osm",
      "intercity_bus_terminal_presence",
      "nightlife_density",
      "public_toilet_density",
      "transit_lines",
      "urgent_care_clinic_count",
    ];
    const bundle = placeEvidenceBundleById("gr-crete-region");
    for (const key of regionalRows) {
      const row = bundle?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, key).toBe("proxy");
      expect(row?.observedGranularity, key).toBe("region");
      expect(row?.sourceGapReason, key).toBeUndefined();
      expect(String(row?.cited?.value), key).toContain("Priority-town OSM");
      expect(String(row?.cited?.value), key).toContain("Chania");
      expect(String(row?.cited?.value), key).toContain("Agios Nikolaos");
      expect(row?.notes, key).toContain("not a full Crete inventory");
    }
  });

  it("populates bathing-water quality as a radius proxy for every town", () => {
    for (const id of CRETE_TOWN_IDS) {
      const row = placeEvidenceBundleById(id)?.rows.find(
        (item) => item.key === "bathing_water_quality",
      );
      expect(row?.coverageStatus, id).toBe("proxy");
      expect(row?.unit, id).toBe("EEA monitored sites within 10 km");
      expect(row?.cited?.confidence, id).toBe("medium");
      expect(String(row?.cited?.value), id).toContain("Excellent");
    }
  });

  it("populates Crete bathing-water quality as a regional polygon aggregation", () => {
    const row = placeEvidenceBundleById("gr-crete-region")?.rows.find(
      (item) => item.key === "bathing_water_quality",
    );
    expect(row?.coverageStatus).toBe("regional");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.unit).toBe("EEA monitored sites inside OSM region polygon");
    expect(row?.cited?.confidence).toBe("medium");
    expect(String(row?.cited?.value)).toContain("177 EEA monitored bathing-water sites");
    expect(String(row?.cited?.value)).toContain("175 Excellent");
  });

  it("populates Eurostat regional tourism-pressure rows without localising them to towns", () => {
    const expectedRows = [
      ["short_term_rental_density", 12.11, "platform guest nights per resident", "tour_ce_oaw"],
      ["short_term_guest_nights", 7523067, "guest nights", "tour_ce_oaw"],
      ["hotel_bed_places", 243933, "bed places", "tour_cap_nuts2"],
      ["tourist_beds_per_resident", 0.393, "bed places per resident", "tour_cap_nuts2"],
      [
        "overnights_per_resident",
        55.58,
        "tourist-accommodation nights per resident",
        "tour_occ_nin2m",
      ],
      ["peak_to_low_tourism_ratio", 81.6, "peak-month / low-month nights ratio", "tour_occ_nin2m"],
    ] as const;

    for (const bundle of placeEvidenceBundles) {
      const expectedCoverage = bundle.granularity === "region" ? "regional" : "inherited_regional";
      for (const [key, value, unit, sourceCode] of expectedRows) {
        const row = bundle.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${bundle.id}:${key}`).toBe(expectedCoverage);
        expect(row?.observedGranularity, `${bundle.id}:${key}`).toBe("region");
        expect(row?.sourceGapReason, `${bundle.id}:${key}`).toBeUndefined();
        expect(row?.cited?.value, `${bundle.id}:${key}`).toBe(value);
        expect(row?.cited?.sourceName, `${bundle.id}:${key}`).toContain(sourceCode);
        expect(row?.cited?.granularity, `${bundle.id}:${key}`).toBe("region");
        expect(row?.unit, `${bundle.id}:${key}`).toBe(unit);
        expect(row?.notes, `${bundle.id}:${key}`).toContain("not");
      }
    }
  });

  it("populates comparable OSM health-access proxy rows for every town", () => {
    const healthRows = [
      ["pharmacy_density", "OSM features within 2 km"],
      ["hospital_density", "OSM features within 5 km"],
      ["dentist_density", "OSM features within 2 km"],
    ];
    for (const id of CRETE_TOWN_IDS) {
      for (const [key, unit] of healthRows) {
        const row = placeEvidenceBundleById(id)?.rows.find((item) => item.key === key);
        expect(row?.coverageStatus, `${id}:${key}`).toBe("proxy");
        expect(row?.unit, `${id}:${key}`).toBe(unit);
        expect(row?.cited?.category, `${id}:${key}`).toBe("healthcare");
        expect(row?.cited?.confidence, `${id}:${key}`).toBe("medium");
      }
    }

    const region = placeEvidenceBundleById("gr-crete-region");
    for (const [key, unit] of healthRows) {
      const row = region?.rows.find((item) => item.key === key);
      expect(row?.coverageStatus, `region:${key}`).toBe("proxy");
      expect(row?.observedGranularity, `region:${key}`).toBe("region");
      expect(row?.sourceGapReason, `region:${key}`).toBeUndefined();
      expect(row?.unit, `region:${key}`).toBe(`${unit} of each priority town point`);
      expect(row?.cited?.category, `region:${key}`).toBe("healthcare");
      expect(row?.cited?.confidence, `region:${key}`).toBe("medium");
      expect(String(row?.cited?.value), `region:${key}`).toContain("Priority-town OSM");
      expect(row?.notes, `region:${key}`).toContain("not a full Crete inventory");
    }
  });
});
