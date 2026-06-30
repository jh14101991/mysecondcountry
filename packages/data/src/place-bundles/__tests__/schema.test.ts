import { describe, expect, it } from "vitest";
import { MatrixRowInputSchema } from "../schema.js";

describe("MatrixRowInputSchema", () => {
  it("requires source gaps on unavailable rows", () => {
    const result = MatrixRowInputSchema.safeParse({
      key: "airport_catchment",
      label: "Regional airport catchment",
      matrixCategory: "travel_connectivity",
      intendedGranularity: "town",
      coverageStatus: "unavailable",
    });

    expect(result.success).toBe(false);
  });

  it("requires cited facts on populated coverage rows", () => {
    const result = MatrixRowInputSchema.safeParse({
      key: "price_level_index",
      label: "Price level index",
      matrixCategory: "money",
      intendedGranularity: "country",
      observedGranularity: "country",
      coverageStatus: "inherited_national",
    });

    expect(result.success).toBe(false);
  });
});
