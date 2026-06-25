import { describe, expect, it } from "vitest";
import { FactRefSchema, isFactRef, resolveCitedOrRef, resolveFactRef } from "../index.js";

describe("fact references", () => {
  it("accepts a well-formed ref and rejects a malformed one", () => {
    expect(FactRefSchema.safeParse({ ref: "place:es#residency.goldenVisa" }).success).toBe(true);
    expect(FactRefSchema.safeParse({ ref: "es residency" }).success).toBe(false);
  });
  it("isFactRef distinguishes a ref from an inline CitedValue", () => {
    expect(isFactRef({ ref: "place:es#residency.goldenVisa" })).toBe(true);
    expect(
      isFactRef({
        value: 7,
        sourceUrl: "https://x",
        sourceName: "n",
        verifiedDate: "2026-01-01",
        confidence: "medium",
        granularity: "country",
      }),
    ).toBe(false);
  });
  it("resolves a place ref to the exact cited value", () => {
    const cited = resolveFactRef({ ref: "place:es#residency.goldenVisa" });
    expect(cited.category).toBe("residency");
    expect(cited.confidence).toBe("high");
    expect(String(cited.value)).toContain("3 April 2025");
  });
  it("resolves a regime ref to the exact cited value", () => {
    const cited = resolveFactRef({ ref: "regime:greece-foreign-pensioner-flat-tax#headlineRate" });
    expect(cited.value).toBe(7);
    expect(cited.category).toBe("tax");
  });
  it("passes an inline CitedValue through unchanged", () => {
    const inline = {
      value: 1,
      sourceUrl: "https://x.example",
      sourceName: "n",
      verifiedDate: "2026-01-01",
      confidence: "medium",
      granularity: "country",
    } as const;
    expect(resolveCitedOrRef(inline)).toBe(inline);
  });
  it("throws on an unknown id or path", () => {
    expect(() => resolveFactRef({ ref: "place:zz#tax.headlinePersonalIncomeTaxRate" })).toThrow();
    expect(() =>
      resolveFactRef({ ref: "regime:greece-foreign-pensioner-flat-tax#nope" }),
    ).toThrow();
  });
});
