import { describe, expect, it } from "vitest";
import type { ToolInput } from "../schema.js";
import { ToolInputSchema } from "../schema.js";

const GOOD_STEP = {
  order: 1,
  title: "Check residency",
  detail: "Confirm you were not a resident for the prior five years.",
  requirement: { ref: "regime:greece-foreign-pensioner-flat-tax#eligibility.priorNonResidency" },
};

const GOOD: ToolInput = {
  id: "test-checklist",
  slug: "test-checklist",
  title: "A test checklist tool",
  toolType: "checklist",
  intro:
    "This is a test intro that meets the 80-character minimum and covers the topic in general terms.",
  steps: [
    GOOD_STEP,
    {
      order: 2,
      title: "Check timing",
      detail: "Apply before the stated deadline in the tax year.",
    },
    { order: 3, title: "Check source", detail: "Verify the qualifying country requirement." },
    {
      order: 4,
      title: "Check rate",
      detail: "Confirm the headline rate applies to all foreign income.",
    },
  ],
  relatedSlugs: [],
};

describe("ToolInputSchema", () => {
  it("accepts a well-formed checklist input with refs", () => {
    expect(ToolInputSchema.safeParse(GOOD).success).toBe(true);
  });

  it("accepts a calculator toolType", () => {
    const calc = { ...GOOD, toolType: "calculator" };
    expect(ToolInputSchema.safeParse(calc).success).toBe(true);
  });

  it("rejects an unknown toolType", () => {
    const bad = { ...GOOD, toolType: "wizard" };
    expect(ToolInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a step missing detail", () => {
    const bad = {
      ...GOOD,
      steps: [{ order: 1, title: "Title only" }],
    };
    expect(ToolInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a step with detail under 10 chars", () => {
    const bad = {
      ...GOOD,
      steps: [{ order: 1, title: "Title", detail: "Short" }],
    };
    expect(ToolInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a title under 12 chars", () => {
    expect(ToolInputSchema.safeParse({ ...GOOD, title: "Short" }).success).toBe(false);
  });

  it("rejects an intro under 80 chars", () => {
    expect(ToolInputSchema.safeParse({ ...GOOD, intro: "Too short" }).success).toBe(false);
  });

  it("rejects a non-url-safe slug", () => {
    expect(ToolInputSchema.safeParse({ ...GOOD, slug: "Has Spaces" }).success).toBe(false);
  });

  it("rejects more than 6 related slugs", () => {
    const bad = {
      ...GOOD,
      relatedSlugs: ["a", "b", "c", "d", "e", "f", "g"],
    };
    expect(ToolInputSchema.safeParse(bad).success).toBe(false);
  });
});
