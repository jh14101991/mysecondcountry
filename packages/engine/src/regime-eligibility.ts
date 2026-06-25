import type { CitedValue, Regime } from "@where/data";
import { collectRegimeCitedValues } from "@where/data";

export type EligibilityCard = {
  factPath: string;
  cited: CitedValue;
  framing: string;
};

/**
 * Returns one card per eligibility field on a regime, in field declaration order.
 * Each card carries the published rule and routes the reader to a licensed professional.
 * This is a pure, deterministic function with no side effects.
 *
 * FENCE (ADR-0008): framing is generic and never issues a per-user verdict.
 */
export function regimeEligibilityCards(regime: Regime): EligibilityCard[] {
  // Card order follows the regime JSON's eligibility field declaration order (via collectRegimeCitedValues's walk); the test pins this contract.
  return collectRegimeCitedValues(regime)
    .filter(({ path }) => path.startsWith("eligibility."))
    .map(({ path, cited }) => {
      const rule = String(cited.value).replace(/\.\s*$/, "");
      const framing = `Published rule: ${rule}. This would exclude an applicant for whom it does not hold. Verify with a licensed professional.`;
      return { factPath: path, cited, framing };
    });
}
