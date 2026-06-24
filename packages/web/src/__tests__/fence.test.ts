import { describe, expect, it } from "vitest";
import { FENCE_PRIMARY, FENCE_TAX_RESIDENCY_RIDER, stalenessBanner } from "../lib/fence.ts";

describe("liability fence text (guards against drift, FENCE.md)", () => {
  it("renders the FENCE.md visible fence string verbatim", () => {
    expect(FENCE_PRIMARY).toBe(
      "Sourced screening information, not legal, tax, immigration, or financial advice. Verify with a licensed professional before acting.",
    );
  });

  it("contains the required FENCE.md phrases", () => {
    expect(FENCE_PRIMARY).toContain("not legal, tax, immigration, or financial advice");
    expect(FENCE_PRIMARY).toContain("Verify with a licensed professional before acting");
  });

  it("residency/tax rider contains the DEFINITION_OF_DONE (c) phrase", () => {
    expect(FENCE_TAX_RESIDENCY_RIDER.toLowerCase()).toContain("not legal or tax advice");
  });

  it("staleness banner names the window and routes to primary sources", () => {
    const banner = stalenessBanner(90);
    expect(banner).toContain("90 days");
    expect(banner.toLowerCase()).toContain("verify with primary sources");
  });
});
