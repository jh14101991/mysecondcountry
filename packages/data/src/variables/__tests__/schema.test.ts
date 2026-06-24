import { describe, expect, it } from "vitest";
import { ProfileSchema, VariableDefSchema } from "../schema.js";

describe("variable + profile schemas", () => {
  it("accepts a valid variable def", () => {
    const v = {
      key: "cost_price_level",
      label: "Cost of living",
      category: "cost",
      unit: "EU27=100",
      kind: "intrinsic",
      filterType: "range",
      direction: "lowerBetter",
      source: { name: "Eurostat tec00120", url: "https://ec.europa.eu/eurostat", autoPull: "yes" },
      defaultConfidence: "high",
      profileRelevance: { budgetRetiree: "high", soloNomad: "medium" },
    };
    expect(VariableDefSchema.safeParse(v).success).toBe(true);
  });
  it("rejects an http (non-https) source url", () => {
    const v = {
      key: "x",
      label: "X",
      category: "cost",
      kind: "intrinsic",
      filterType: "range",
      direction: "neutral",
      source: { name: "n", url: "http://x", autoPull: "yes" },
      defaultConfidence: "low",
      profileRelevance: {},
    };
    expect(VariableDefSchema.safeParse(v).success).toBe(false);
  });
  it("accepts a valid profile and rejects a negative weight", () => {
    const p = {
      id: "budgetRetiree",
      label: "Budget retiree",
      weights: { cost_price_level: 0.4 },
      surfaced: ["cost_price_level"],
      dealBreakers: [],
    };
    expect(ProfileSchema.safeParse(p).success).toBe(true);
    expect(ProfileSchema.safeParse({ ...p, weights: { cost_price_level: -1 } }).success).toBe(
      false,
    );
  });
});
