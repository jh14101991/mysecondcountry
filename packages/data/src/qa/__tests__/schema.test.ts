import { describe, expect, it } from "vitest";
import type { QaInput } from "../schema.js";
import { QaInputSchema } from "../schema.js";

const GOOD: QaInput = {
  id: "can-i-still-get-a-spanish-golden-visa",
  slug: "can-i-still-get-a-spanish-golden-visa",
  question: "Can you still get a Spanish golden visa?",
  polarity: "no",
  answer:
    "No. Spain abolished its golden visa on 3 April 2025 under Organic Law 1/2025, ending residence permits tied to real estate investment over 500,000 euros.",
  answerFact: { ref: "place:es#residency.goldenVisa" },
  supportingFacts: [
    { ref: "place:es#residency.digitalNomadVisa" },
    { ref: "place:es#tax.specialRegime" },
    { ref: "place:es#tax.headlinePersonalIncomeTaxRate" },
  ],
  rule: "Spain ended its investor residence permit (golden visa) on 3 April 2025; people relocating now use ordinary routes such as the telework (digital nomad) visa or a non-lucrative visa, with their own income and tax rules.",
  category: "residency",
  relatedSlugs: ["is-portugals-nhr-tax-regime-still-available"],
};

describe("QaInputSchema", () => {
  it("accepts a well-formed input with refs", () => {
    expect(QaInputSchema.safeParse(GOOD).success).toBe(true);
  });

  it("rejects an inline answerFact with low confidence", () => {
    const bad = {
      ...GOOD,
      answerFact: {
        value: 47,
        sourceUrl: "https://example.com",
        sourceName: "Example",
        verifiedDate: "2026-01-01",
        confidence: "low",
        granularity: "country",
        category: "tax",
      },
    };
    expect(QaInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an inline answerFact with category cost", () => {
    const bad = {
      ...GOOD,
      answerFact: {
        value: "some cost",
        sourceUrl: "https://example.com",
        sourceName: "Example",
        verifiedDate: "2026-01-01",
        confidence: "medium",
        granularity: "country",
        category: "cost",
      },
    };
    expect(QaInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an answer over 240 chars", () => {
    const longAnswer = "A".repeat(241);
    expect(QaInputSchema.safeParse({ ...GOOD, answer: longAnswer }).success).toBe(false);
  });

  it("rejects supportingFacts with length 4", () => {
    const bad = {
      ...GOOD,
      supportingFacts: [
        { ref: "place:es#residency.digitalNomadVisa" },
        { ref: "place:es#tax.specialRegime" },
        { ref: "place:es#tax.headlinePersonalIncomeTaxRate" },
        { ref: "place:pt#tax.specialRegime" },
      ],
    };
    expect(QaInputSchema.safeParse(bad).success).toBe(false);
  });
});
