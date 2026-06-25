import { describe, expect, it } from "vitest";
import { collectRegimeCitedValues, regimeFactId } from "../facts.js";
import { regimeById } from "../index.js";

describe("collectRegimeCitedValues", () => {
  const regime = regimeById("greece-foreign-pensioner-flat-tax");
  if (!regime) throw new Error("Greece regime missing from index");

  it("returns a CitedValue entry for headlineRate", () => {
    const facts = collectRegimeCitedValues(regime);
    const entry = facts.find((f) => f.path === "headlineRate");
    expect(entry).toBeDefined();
    expect(entry?.cited).toMatchObject({
      value: expect.anything(),
      sourceUrl: expect.any(String),
      verifiedDate: expect.any(String),
    });
  });

  it("returns a CitedValue entry for durationYears", () => {
    const facts = collectRegimeCitedValues(regime);
    const entry = facts.find((f) => f.path === "durationYears");
    expect(entry).toBeDefined();
    expect(entry?.cited).toMatchObject({
      value: expect.anything(),
      sourceUrl: expect.any(String),
      verifiedDate: expect.any(String),
    });
  });

  it("returns a CitedValue entry for eligibility.priorNonResidency", () => {
    const facts = collectRegimeCitedValues(regime);
    const entry = facts.find((f) => f.path === "eligibility.priorNonResidency");
    expect(entry).toBeDefined();
    expect(entry?.cited).toMatchObject({
      value: expect.anything(),
      sourceUrl: expect.any(String),
      verifiedDate: expect.any(String),
    });
  });

  it("returns a CitedValue entry for eligibility.knownCatch", () => {
    const facts = collectRegimeCitedValues(regime);
    const entry = facts.find((f) => f.path === "eligibility.knownCatch");
    expect(entry).toBeDefined();
    expect(entry?.cited).toMatchObject({
      value: expect.anything(),
      sourceUrl: expect.any(String),
      verifiedDate: expect.any(String),
    });
  });
});

describe("regimeFactId", () => {
  it("formats as regimeId#path", () => {
    expect(regimeFactId("greece-foreign-pensioner-flat-tax", "headlineRate")).toBe(
      "greece-foreign-pensioner-flat-tax#headlineRate",
    );
  });
});
