import { describe, expect, it } from "vitest";
import { ShortlistSchema } from "../schema.js";

const GOOD = {
  id: "test-shortlist",
  slug: "test-shortlist",
  title: "A valid shortlist title",
  intro:
    "This is a valid intro text that is long enough to pass the minimum character requirement of eighty characters total.",
  metaDescription:
    "A valid meta description that is between fifty and one hundred and sixty characters long enough.",
  constraint: {
    filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
    rank: { byKey: "dnv_income_floor", dir: "asc" },
  },
  relatedSlugs: [],
} as const;

describe("ShortlistSchema", () => {
  it("accepts a well-formed shortlist entry", () => {
    expect(ShortlistSchema.safeParse(GOOD).success).toBe(true);
  });

  it("accepts a shortlist with relatedSlugs", () => {
    const withRelated = { ...GOOD, relatedSlugs: ["eu-expat-tax-regimes-by-rate"] };
    expect(ShortlistSchema.safeParse(withRelated).success).toBe(true);
  });

  it("rejects a title shorter than 12 chars", () => {
    const bad = { ...GOOD, title: "Short" };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an intro shorter than 80 chars", () => {
    const bad = { ...GOOD, intro: "Too short." };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a metaDescription shorter than 50 chars", () => {
    const bad = { ...GOOD, metaDescription: "Too short." };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a metaDescription longer than 160 chars", () => {
    const bad = { ...GOOD, metaDescription: "x".repeat(161) };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an invalid filter op", () => {
    const bad = {
      ...GOOD,
      constraint: {
        filters: [{ key: "dnv_income_floor", op: "!=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
    };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an invalid rank dir", () => {
    const bad = {
      ...GOOD,
      constraint: {
        filters: [{ key: "dnv_income_floor", op: "<=", value: 3700 }],
        rank: { byKey: "dnv_income_floor", dir: "random" },
      },
    };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects more than 6 relatedSlugs", () => {
    const bad = {
      ...GOOD,
      relatedSlugs: ["a", "b", "c", "d", "e", "f", "g"],
    };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a constraint with no filters", () => {
    const bad = {
      ...GOOD,
      constraint: {
        filters: [],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
    };
    expect(ShortlistSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts a filter with an array value for op 'in'", () => {
    const withIn = {
      ...GOOD,
      constraint: {
        filters: [{ key: "koppen", op: "in", value: ["Csa", "Csb"] }],
        rank: { byKey: "dnv_income_floor", dir: "asc" },
      },
    };
    expect(ShortlistSchema.safeParse(withIn).success).toBe(true);
  });
});
