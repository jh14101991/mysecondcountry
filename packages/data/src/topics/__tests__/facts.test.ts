import { describe, expect, it } from "vitest";
import { ageInDays, isStale } from "../../schema.js";
import { collectTopicsCitedValues } from "../facts.js";
import { topics } from "../index.js";

describe("topics facts (freshness back-date proof)", () => {
  it("collectTopicsCitedValues returns all fact entries", () => {
    const topic = topics[0];
    if (!topic) throw new Error("no topics entries");
    const fields = collectTopicsCitedValues(topic);
    expect(fields.length).toBeGreaterThanOrEqual(4);
    expect(fields[0]?.path).toBe("facts.0");
  });

  it("isStale returns true for a back-dated topic fact (proving freshness covers topics)", () => {
    const topic = topics[0];
    if (!topic) throw new Error("no topics entries");
    const fields = collectTopicsCitedValues(topic);
    const first = fields[0];
    if (!first) throw new Error("no fields on topic entry");

    // Build a copy that is 400 days old; limit is 90 for tax/visa/residency.
    const backDated = {
      ...first.cited,
      verifiedDate: new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10),
    };
    expect(ageInDays(backDated.verifiedDate)).toBeGreaterThan(90);
    expect(isStale(backDated)).toBe(true);
  });
});
