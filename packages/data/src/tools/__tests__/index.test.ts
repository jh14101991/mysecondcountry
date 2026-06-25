import { describe, expect, it } from "vitest";
import { collectToolCitedValues } from "../facts.js";
import { toolById, toolBySlug, tools } from "../index.js";

describe("tools index", () => {
  it("exports at least 2 entries", () => {
    expect(tools.length).toBeGreaterThanOrEqual(2);
  });

  it("toolBySlug resolves the Greece checklist", () => {
    expect(toolBySlug("greece-7-percent-pension-tax-checklist")).toBeDefined();
  });

  it("toolById resolves the Portugal checklist", () => {
    expect(toolById("portugal-ifici-eligibility-checklist")).toBeDefined();
  });

  it("all tools are checklists (no calculator entries authored)", () => {
    for (const tool of tools) {
      expect(tool.toolType, `${tool.id}: should be checklist`).toBe("checklist");
    }
  });

  it("every step requirement is a resolved CitedValue (has value, sourceUrl, verifiedDate)", () => {
    for (const tool of tools) {
      for (const step of tool.steps) {
        if (step.requirement) {
          expect(
            step.requirement.value,
            `${tool.id} step ${step.order}: value must be present`,
          ).toBeDefined();
          expect(
            step.requirement.sourceUrl,
            `${tool.id} step ${step.order}: sourceUrl must be present`,
          ).toBeDefined();
          expect(
            step.requirement.verifiedDate,
            `${tool.id} step ${step.order}: verifiedDate must be present`,
          ).toBeDefined();
        }
      }
    }
  });

  it("every tool has >= 4 cited requirements", () => {
    for (const tool of tools) {
      const citedFields = collectToolCitedValues(tool);
      expect(
        citedFields.length,
        `${tool.id}: need >= 4 cited requirements, got ${citedFields.length}`,
      ).toBeGreaterThanOrEqual(4);
    }
  });

  it("related slugs resolve bidirectionally", () => {
    const slugSet = new Set(tools.map((t) => t.slug));
    for (const tool of tools) {
      for (const relSlug of tool.relatedSlugs) {
        expect(
          slugSet.has(relSlug),
          `${tool.id}: relatedSlug "${relSlug}" not found in tools`,
        ).toBe(true);
      }
    }
  });
});
