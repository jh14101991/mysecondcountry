import { regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { regimeEligibilityCards } from "../index.js";

const GREECE_ID = "greece-foreign-pensioner-flat-tax";
const EXPECTED_PATHS = [
  "eligibility.priorNonResidency",
  "eligibility.qualifyingCountry",
  "eligibility.residencyObligation",
  "eligibility.applicationWindow",
  "eligibility.knownCatch",
];

describe("regimeEligibilityCards", () => {
  const regime = regimeById(GREECE_ID);
  if (!regime) throw new Error(`Regime not found: ${GREECE_ID}`);

  it("returns exactly 5 cards", () => {
    const cards = regimeEligibilityCards(regime);
    expect(cards).toHaveLength(5);
  });

  it("returns cards in fixed order matching the expected factPath sequence", () => {
    const cards = regimeEligibilityCards(regime);
    expect(cards.map((c) => c.factPath)).toEqual(EXPECTED_PATHS);
  });

  it("each factPath starts with 'eligibility.'", () => {
    const cards = regimeEligibilityCards(regime);
    for (const card of cards) {
      expect(card.factPath).toMatch(/^eligibility\./);
    }
  });

  it("each cited is a valid CitedValue with value, sourceUrl, and verifiedDate", () => {
    const cards = regimeEligibilityCards(regime);
    for (const card of cards) {
      expect(card.cited).toHaveProperty("value");
      expect(card.cited).toHaveProperty("sourceUrl");
      expect(card.cited).toHaveProperty("verifiedDate");
      expect(typeof card.cited.sourceUrl).toBe("string");
      expect(card.cited.sourceUrl.length).toBeGreaterThan(0);
      expect(typeof card.cited.verifiedDate).toBe("string");
      expect(card.cited.verifiedDate.length).toBeGreaterThan(0);
    }
  });

  it("each framing contains 'Verify with a licensed professional'", () => {
    const cards = regimeEligibilityCards(regime);
    for (const card of cards) {
      expect(card.framing).toContain("Verify with a licensed professional");
    }
  });

  it("each framing does NOT contain 'you should'", () => {
    const cards = regimeEligibilityCards(regime);
    for (const card of cards) {
      expect(card.framing).not.toContain("you should");
    }
  });

  it("is deterministic: calling twice returns deep-equal results", () => {
    const a = regimeEligibilityCards(regime);
    const b = regimeEligibilityCards(regime);
    expect(a).toEqual(b);
  });
});
