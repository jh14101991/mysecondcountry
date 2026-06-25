import { describe, expect, it } from "vitest";
import { collectTopicsCitedValues } from "../facts.js";
import { topicById, topicBySlug, topics } from "../index.js";

describe("topics index", () => {
  it("exports at least 2 entries", () => {
    expect(topics.length).toBeGreaterThanOrEqual(2);
  });

  it("topicBySlug resolves the Portugal IFICI entry", () => {
    expect(topicBySlug("portugal-ifici-the-nhr-successor")).toBeDefined();
  });

  it("topicById resolves the Greece golden visa entry", () => {
    expect(topicById("greece-golden-visa-price-tiers")).toBeDefined();
  });

  it("every entry fact.cited is a resolved CitedValue with value and sourceUrl", () => {
    for (const topic of topics) {
      for (const fact of topic.facts) {
        expect(
          fact.cited.value,
          `${topic.id} ${fact.key}: cited.value must be present`,
        ).toBeDefined();
        expect(
          fact.cited.sourceUrl,
          `${topic.id} ${fact.key}: cited.sourceUrl must be present`,
        ).toBeDefined();
        expect(
          fact.cited.sourceUrl,
          `${topic.id} ${fact.key}: sourceUrl must start with https`,
        ).toMatch(/^https:\/\//);
      }
    }
  });

  it("every entry has >= 4 facts", () => {
    for (const topic of topics) {
      expect(
        topic.facts.length,
        `${topic.id}: need >= 4 facts, got ${topic.facts.length}`,
      ).toBeGreaterThanOrEqual(4);
    }
  });

  it("every entry has >= 4 collected cited fields", () => {
    for (const topic of topics) {
      const fields = collectTopicsCitedValues(topic);
      expect(
        fields.length,
        `${topic.id}: need >= 4 cited fields, got ${fields.length}`,
      ).toBeGreaterThanOrEqual(4);
    }
  });
});
