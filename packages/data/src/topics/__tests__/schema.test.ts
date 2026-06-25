import { describe, expect, it } from "vitest";
import type { TopicInput } from "../schema.js";
import { TopicInputSchema } from "../schema.js";

const GOOD: TopicInput = {
  id: "portugal-ifici-the-nhr-successor",
  slug: "portugal-ifici-the-nhr-successor",
  title: "Portugal IFICI: the NHR successor regime",
  countryId: "pt",
  facts: [
    {
      key: "special-regime",
      label: "Special income tax regime",
      cited: { ref: "place:pt#tax.specialRegime" },
    },
    {
      key: "headline-rate",
      label: "Top personal income tax rate",
      cited: { ref: "place:pt#tax.headlinePersonalIncomeTaxRate" },
    },
    {
      key: "digital-nomad-visa",
      label: "Digital nomad visa income floor",
      cited: { ref: "place:pt#residency.digitalNomadVisa" },
    },
    {
      key: "golden-visa",
      label: "Investor residency",
      cited: { ref: "place:pt#residency.goldenVisa" },
    },
  ],
  context:
    "Portugal closed its Non-Habitual Resident (NHR) regime to new applicants at the end of 2023 and replaced it with IFICI, which applies a 20 percent flat rate on eligible Portuguese-sourced income.",
  relatedSlugs: [],
};

describe("TopicInputSchema", () => {
  it("accepts a well-formed input with refs", () => {
    expect(TopicInputSchema.safeParse(GOOD).success).toBe(true);
  });

  it("accepts a topic with a definedTerm", () => {
    const withTerm = {
      ...GOOD,
      definedTerm: {
        name: "IFICI",
        description: "Portugal's special income tax regime for qualifying new residents.",
      },
    };
    expect(TopicInputSchema.safeParse(withTerm).success).toBe(true);
  });

  it("rejects a fact entry missing cited", () => {
    const bad = {
      ...GOOD,
      facts: [{ key: "special-regime", label: "Some label" }],
    };
    expect(TopicInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects context shorter than 80 chars", () => {
    const bad = { ...GOOD, context: "Too short." };
    expect(TopicInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a title shorter than 12 chars", () => {
    const bad = { ...GOOD, title: "Short" };
    expect(TopicInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects more than 6 relatedSlugs", () => {
    const bad = {
      ...GOOD,
      relatedSlugs: ["a", "b", "c", "d", "e", "f", "g"],
    };
    expect(TopicInputSchema.safeParse(bad).success).toBe(false);
  });
});
