import { describe, expect, it } from "vitest";
import { INTRO_CORRIDOR, INTRO_LIVE, isInIntroCorridor, showIntro } from "../lib/monetisation.ts";

describe("intro corridor gating (first revenue slice)", () => {
  it("contains exactly the three Portugal IFICI page ids", () => {
    expect(isInIntroCorridor("portugal-ifici")).toBe(true); // regime id
    expect(isInIntroCorridor("is-portugals-nhr-tax-regime-still-available")).toBe(true); // qa id
    expect(isInIntroCorridor("portugal-ifici-the-nhr-successor")).toBe(true); // topic id
    expect(INTRO_CORRIDOR.size).toBe(3);
  });

  it("keys on the entry id, not the url slug (the regime slug 'ifici' is not a key)", () => {
    expect(isInIntroCorridor("ifici")).toBe(false);
  });

  it("excludes unrelated pages", () => {
    expect(isInIntroCorridor("greece-non-dom-lump-sum-tax")).toBe(false);
  });

  it("showIntro is corridor membership gated by the live flag", () => {
    expect(showIntro("portugal-ifici")).toBe(INTRO_LIVE && isInIntroCorridor("portugal-ifici"));
    expect(showIntro("ifici")).toBe(false); // not in corridor, never shows
  });
});
