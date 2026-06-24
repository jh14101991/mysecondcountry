import { describe, expect, it } from "vitest";
import { CATALOG, variableByKey } from "../catalog.js";
import { VariableDefSchema } from "../schema.js";

describe("slice-1 variable catalogue", () => {
  it("has at least 15 entries", () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(15);
  });

  it("every key is unique and matches /^[a-z0-9_]+$/", () => {
    const keys = CATALOG.map((v) => v.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
    for (const key of keys) {
      expect(key).toMatch(/^[a-z0-9_]+$/);
    }
  });

  it("every entry parses through VariableDefSchema", () => {
    for (const entry of CATALOG) {
      const result = VariableDefSchema.safeParse(entry);
      expect(result.success, `entry "${entry.key}" failed schema parse`).toBe(true);
    }
  });

  it("visa and tax entries have defaultConfidence in [high, medium]", () => {
    const restricted = CATALOG.filter((v) => v.category === "visa" || v.category === "tax");
    for (const entry of restricted) {
      expect(
        ["high", "medium"] as string[],
        `entry "${entry.key}" has unexpected confidence "${entry.defaultConfidence}"`,
      ).toContain(entry.defaultConfidence);
    }
  });

  it("variableByKey finds cafe_density and returns undefined for missing key", () => {
    expect(variableByKey("cafe_density")).toBeDefined();
    expect(variableByKey("does_not_exist")).toBeUndefined();
  });
});
