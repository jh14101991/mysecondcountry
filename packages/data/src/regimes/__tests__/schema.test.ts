import { describe, expect, it } from "vitest";
import { RegimeSchema } from "../schema.js";

const cv = (value: string | number, category: "tax" | "residency") => ({
  value,
  sourceUrl: "https://taxsummaries.pwc.com/greece/individual/other-tax-credits-and-incentives",
  sourceName: "PwC Worldwide Tax Summaries, Greece",
  verifiedDate: "2026-06-25",
  confidence: "medium" as const,
  granularity: "country" as const,
  category,
  stalenessDays: 60,
});
const valid = {
  id: "greece-foreign-pensioner-flat-tax",
  slug: "foreign-pensioner-flat-tax",
  name: "Greece foreign-pensioner 7% flat tax",
  countryId: "gr",
  regimeType: "tax",
  headlineRate: cv(7, "tax"),
  durationYears: cv(15, "tax"),
  eligibility: {
    priorNonResidency: cv("Not a Greek tax resident for 5 of the prior 6 years.", "residency"),
    qualifyingCountry: cv(
      "Transfer from a country with an administrative-cooperation agreement with Greece.",
      "residency",
    ),
    residencyObligation: cv("Becomes a Greek tax resident for the regime years.", "residency"),
    applicationWindow: cv("Apply by 31 March of the tax year of transfer.", "tax"),
    knownCatch: cv(
      "The 7 percent covers all foreign-source income; losing a condition ends the regime.",
      "tax",
    ),
  },
  summary:
    "Greece taxes a qualifying foreign pensioner's worldwide foreign-source income at a flat 7 percent for up to 15 years. The figures below are screened, sourced, and dated. They are not advice.",
};

const lumpSumValid = {
  id: "greece-non-dom-lump-sum-tax",
  slug: "non-dom-lump-sum-tax",
  name: "Greece non-dom 100,000 euro lump-sum tax (Article 5A)",
  countryId: "gr",
  regimeType: "tax",
  rateType: "lumpSum",
  incomeBasis: "foreign-source income",
  headlineRate: cv(100000, "tax"),
  durationYears: cv(15, "tax"),
  eligibility: {
    priorNonResidency: cv("Not a Greek tax resident for 7 of the prior 8 years.", "residency"),
    knownCatch: cv("Non-payment of the lump sum ends the regime.", "tax"),
    investmentRequirement: cv("Must invest at least EUR 500,000 in Greece.", "tax"),
  },
  summary:
    "Greece's Article 5A non-dom regime lets a qualifying individual pay a flat lump sum of 100,000 euros per year on all foreign-source income, regardless of amount, for up to 15 years. The figures below are screened, sourced, and dated. They are not advice.",
};

describe("RegimeSchema", () => {
  it("accepts a fully cited regime", () => {
    expect(RegimeSchema.safeParse(valid).success).toBe(true);
  });

  it("existing percent regime resolves rateType to 'percent' and incomeBasis to 'foreign-source income' by default", () => {
    const result = RegimeSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.rateType).toBe("percent");
    expect(result.data.incomeBasis).toBe("foreign-source income");
  });

  it("accepts a lump-sum regime with investmentRequirement and no qualifyingCountry/residencyObligation", () => {
    const result = RegimeSchema.safeParse(lumpSumValid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.rateType).toBe("lumpSum");
    expect(result.data.incomeBasis).toBe("foreign-source income");
    expect(result.data.eligibility.investmentRequirement).toBeDefined();
    expect(result.data.eligibility.qualifyingCountry).toBeUndefined();
    expect(result.data.eligibility.residencyObligation).toBeUndefined();
  });
  it("rejects a tax field with confidence low", () => {
    const bad = structuredClone(valid);
    (bad.headlineRate as { confidence: string }).confidence = "low";
    expect(RegimeSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a missing sourceUrl on an eligibility field", () => {
    const bad = structuredClone(valid);
    delete (bad.eligibility.priorNonResidency as { sourceUrl?: string }).sourceUrl;
    expect(RegimeSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a short summary (anti-thin-content)", () => {
    expect(RegimeSchema.safeParse({ ...valid, summary: "too short" }).success).toBe(false);
  });
  it("rejects confidence low on a residency string eligibility field", () => {
    const bad = structuredClone(valid);
    (bad.eligibility.priorNonResidency as { confidence: string }).confidence = "low";
    expect(RegimeSchema.safeParse(bad).success).toBe(false);
  });
});
