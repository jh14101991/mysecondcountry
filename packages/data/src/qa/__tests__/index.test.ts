import { describe, expect, it } from "vitest";
import { collectQaCitedValues } from "../facts.js";
import { qa, qaById, qaBySlug } from "../index.js";

describe("qa index", () => {
  it("exports at least 3 entries", () => {
    expect(qa.length).toBeGreaterThanOrEqual(3);
  });

  it("qaBySlug resolves the Spain golden visa entry", () => {
    expect(qaBySlug("can-i-still-get-a-spanish-golden-visa")).toBeDefined();
  });

  it("qaById resolves the Greece pension entry", () => {
    expect(qaById("does-greece-tax-foreign-pensions-at-7-percent")).toBeDefined();
  });

  it("every entry answerFact is a resolved CitedValue with high|medium confidence and tax/visa/residency category", () => {
    const allowed = ["high", "medium"] as const;
    const categories = ["tax", "visa", "residency"] as const;
    for (const entry of qa) {
      expect(allowed, `${entry.id}: answerFact.confidence must be high|medium`).toContain(
        entry.answerFact.confidence,
      );
      expect(categories, `${entry.id}: answerFact.category must be tax/visa/residency`).toContain(
        entry.answerFact.category,
      );
      expect(entry.answerFact.value, `${entry.id}: answerFact.value must be present`).toBeDefined();
      expect(
        entry.answerFact.sourceUrl,
        `${entry.id}: answerFact.sourceUrl must be present`,
      ).toBeDefined();
    }
  });

  it("every supportingFact has an authored label and a resolved CitedValue", () => {
    for (const entry of qa) {
      for (const fact of entry.supportingFacts) {
        expect(fact.label, `${entry.id}: supportingFact.label must be present`).toBeTruthy();
        expect(
          fact.cited.value,
          `${entry.id}: supportingFact.cited.value must be present`,
        ).toBeDefined();
        expect(
          fact.cited.sourceUrl,
          `${entry.id}: supportingFact.cited.sourceUrl must be present`,
        ).toBeDefined();
      }
    }
  });

  it("every entry has >= 4 collected cited fields", () => {
    for (const entry of qa) {
      const fields = collectQaCitedValues(entry);
      expect(
        fields.length,
        `${entry.id}: need >= 4 cited fields, got ${fields.length}`,
      ).toBeGreaterThanOrEqual(4);
    }
  });
});
