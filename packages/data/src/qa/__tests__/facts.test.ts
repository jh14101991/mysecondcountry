import { describe, expect, it } from "vitest";
import { ageInDays, isStale } from "../../schema.js";
import { collectQaCitedValues } from "../facts.js";
import { qa } from "../index.js";

describe("qa facts (freshness back-date proof)", () => {
  it("collectQaCitedValues returns answerFact and supporting facts", () => {
    const entry = qa[0];
    if (!entry) throw new Error("no qa entries");
    const fields = collectQaCitedValues(entry);
    expect(fields.some((f) => f.path === "answerFact")).toBe(true);
    expect(fields.some((f) => f.path.startsWith("supportingFacts."))).toBe(true);
  });

  it("isStale returns true for a back-dated qa fact (proving freshness covers qa)", () => {
    const entry = qa[0];
    if (!entry) throw new Error("no qa entries");
    const fields = collectQaCitedValues(entry);
    const first = fields[0];
    if (!first) throw new Error("no fields on qa entry");

    // Build a copy that is 400 days old; limit is 90 for tax/visa/residency.
    const backDated = {
      ...first.cited,
      verifiedDate: new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10),
    };
    expect(ageInDays(backDated.verifiedDate)).toBeGreaterThan(90);
    expect(isStale(backDated)).toBe(true);
  });
});
