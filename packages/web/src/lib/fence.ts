/**
 * The liability fence text. Single source of truth. FenceBlock.astro renders these and
 * fence.test.ts guards them against drift (FENCE.md requires the primary string verbatim,
 * body-text size, above the first claim, never collapsed or footer-only).
 */

/** FENCE.md visible fence string. Rendered verbatim on every page with screening data. */
export const FENCE_PRIMARY =
  "Sourced screening information, not legal, tax, immigration, or financial advice. Verify with a licensed professional before acting.";

/**
 * Rider for pages carrying residency, visa, or tax claims. Contains the exact phrase
 * "not legal or tax advice" asserted by DEFINITION_OF_DONE.md (c).
 */
export const FENCE_TAX_RESIDENCY_RIDER =
  "This is not legal or tax advice. Verify residency, visa, and tax facts with a licensed professional and the official source before acting.";

/** Staleness banner per FENCE.md, shown immediately below the fence when data is stale. */
export function stalenessBanner(days: number): string {
  return `Some data on this page was last verified more than ${days} days ago and may be outdated. Verify with primary sources before relying on it.`;
}
