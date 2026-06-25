import { describe, expect, it } from "vitest";
import { placeById } from "../../index.js";
import { regimeById, regimeBySlug, regimes } from "../index.js";
import { RegimeSchema } from "../schema.js";

describe("regimes index", () => {
  it("exports at least one regime", () => {
    expect(regimes.length).toBeGreaterThanOrEqual(1);
  });

  it("regimeBySlug resolves the Greece foreign-pensioner regime", () => {
    expect(regimeBySlug("foreign-pensioner-flat-tax")).toBeDefined();
  });

  it("regimeById resolves the Greece foreign-pensioner regime", () => {
    expect(regimeById("greece-foreign-pensioner-flat-tax")).toBeDefined();
  });

  it("the regime parses through RegimeSchema", () => {
    const regime = regimeBySlug("foreign-pensioner-flat-tax");
    expect(regime).toBeDefined();
    if (!regime) return;
    expect(RegimeSchema.safeParse(regime).success).toBe(true);
  });

  it("countryId is 'gr' and placeById('gr') resolves", () => {
    const regime = regimeBySlug("foreign-pensioner-flat-tax");
    expect(regime?.countryId).toBe("gr");
    expect(placeById("gr")).toBeDefined();
  });

  it("every eligibility field has confidence high or medium", () => {
    const regime = regimeBySlug("foreign-pensioner-flat-tax");
    expect(regime).toBeDefined();
    if (!regime) return;
    const allowedConfidence = ["high", "medium"];
    for (const [key, field] of Object.entries(regime.eligibility)) {
      expect(allowedConfidence, `eligibility.${key}.confidence must be high|medium`).toContain(
        (field as { confidence: string }).confidence,
      );
    }
  });

  it("regimes.length is at least 3", () => {
    expect(regimes.length).toBeGreaterThanOrEqual(3);
  });

  it("regimeBySlug resolves non-dom-lump-sum-tax and its countryId resolves via placeById", () => {
    const regime = regimeBySlug("non-dom-lump-sum-tax");
    expect(regime).toBeDefined();
    if (!regime) return;
    expect(placeById(regime.countryId)).toBeDefined();
  });

  it("regimeBySlug resolves ifici and its countryId resolves via placeById", () => {
    const regime = regimeBySlug("ifici");
    expect(regime).toBeDefined();
    if (!regime) return;
    expect(placeById(regime.countryId)).toBeDefined();
  });
});
