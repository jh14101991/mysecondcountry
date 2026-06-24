import { describe, expect, it } from "vitest";
import { variableByKey } from "../../variables/catalog.js";
import { ProfileSchema } from "../../variables/schema.js";
import { composeProfile, LGBTQ_OVERLAY, PROFILES } from "../presets.js";

const ALL_IDS = [
  "wealthyRetiree",
  "budgetRetiree",
  "recentExiter",
  "nomadFamily",
  "noKidCouple",
  "soloNomad",
  "employedRemote",
] as const;

describe("PROFILES", () => {
  it("has exactly 7 entries covering all profile ids", () => {
    expect(PROFILES).toHaveLength(7);
    const ids = new Set(PROFILES.map((p) => p.id));
    for (const id of ALL_IDS) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("every profile parses through ProfileSchema", () => {
    for (const profile of PROFILES) {
      const result = ProfileSchema.safeParse(profile);
      expect(result.success, `${profile.id} failed schema parse`).toBe(true);
    }
  });

  it("every key in weights, surfaced, and dealBreakers exists in the catalogue", () => {
    for (const profile of PROFILES) {
      for (const key of Object.keys(profile.weights)) {
        expect(
          variableByKey(key),
          `${profile.id} weight key "${key}" not in catalogue`,
        ).toBeDefined();
      }
      for (const key of profile.surfaced) {
        expect(
          variableByKey(key),
          `${profile.id} surfaced key "${key}" not in catalogue`,
        ).toBeDefined();
      }
      for (const db of profile.dealBreakers) {
        expect(
          variableByKey(db.key),
          `${profile.id} dealBreaker key "${db.key}" not in catalogue`,
        ).toBeDefined();
      }
    }
  });
});

describe("LGBTQ_OVERLAY", () => {
  it("every key in weights and dealBreakers exists in the catalogue", () => {
    for (const key of Object.keys(LGBTQ_OVERLAY.weights)) {
      expect(
        variableByKey(key),
        `LGBTQ_OVERLAY weight key "${key}" not in catalogue`,
      ).toBeDefined();
    }
    for (const db of LGBTQ_OVERLAY.dealBreakers) {
      expect(
        variableByKey(db.key),
        `LGBTQ_OVERLAY dealBreaker key "${db.key}" not in catalogue`,
      ).toBeDefined();
    }
  });
});

describe("composeProfile", () => {
  const maybeBudget = PROFILES.find((p) => p.id === "budgetRetiree");
  if (!maybeBudget) throw new Error("budgetRetiree missing from PROFILES");
  const budgetRetiree = maybeBudget;

  it("merges budgetRetiree + LGBTQ_OVERLAY correctly", () => {
    const c = composeProfile(budgetRetiree, LGBTQ_OVERLAY);

    expect(ProfileSchema.safeParse(c).success).toBe(true);

    // Base weight kept as-is.
    expect(c.weights.cost_price_level).toBe(budgetRetiree.weights.cost_price_level);

    // Overlay added a new key (budgetRetiree has no english_proficiency weight).
    expect(c.weights.english_proficiency).toBe(LGBTQ_OVERLAY.weights.english_proficiency);

    // Overlay added to a shared key.
    const baseGpi: number = budgetRetiree.weights.gpi_score ?? 0;
    const overlayGpi: number = LGBTQ_OVERLAY.weights.gpi_score ?? 0;
    expect(c.weights.gpi_score).toBe(baseGpi + overlayGpi);

    // Deal-breakers concatenated.
    expect(c.dealBreakers).toHaveLength(
      budgetRetiree.dealBreakers.length + LGBTQ_OVERLAY.dealBreakers.length,
    );

    // Label reflects the overlay.
    expect(c.label).toBe(`${budgetRetiree.label} + LGBTQ+`);
  });

  it("does not mutate base after compose", () => {
    const originalGpiScore = budgetRetiree.weights.gpi_score;
    composeProfile(budgetRetiree, LGBTQ_OVERLAY);
    expect(budgetRetiree.weights.gpi_score).toBe(originalGpiScore);
  });

  it("with no overlay returns a deep-equal clone of base, not the same reference", () => {
    const clone = composeProfile(budgetRetiree);
    expect(clone).toEqual(budgetRetiree);
    expect(clone).not.toBe(budgetRetiree);
    expect(clone.weights).not.toBe(budgetRetiree.weights);
  });
});
