/**
 * Shared rendering vocabulary for CitedValue. One source of truth so every component
 * (CitedValue, ComparisonCell, ClaimCard, FactsTable) and the JSON-LD layer agree on
 * how a confidence tier reads. Confidence is glyph + word, never colour alone (DESIGN.md
 * "Colour-Plus-Mark Rule", FENCE.md, DOD j).
 */
import type { CitedValue, Confidence, Granularity } from "@where/data";

/** Confidence display: glyph + word. Canonical vocabulary (DESIGN.md section 5, Chips). */
export const CONFIDENCE_DISPLAY: Record<Confidence, { glyph: string; word: string }> = {
  high: { glyph: "✓", word: "Verified" },
  medium: { glyph: "~", word: "Good" },
  low: { glyph: "○", word: "Limited" },
};

/** Printed beneath every low-confidence figure (FENCE.md, DESIGN.md). Never hidden. */
export const LOW_CONFIDENCE_NOTE = "Reported, not verified against a primary source.";

/**
 * Granularity honesty (ADR-0003): a figure broader than the place it attaches to is
 * labelled as such. The web layer enforces the label; we never pass a country average
 * off as a local one.
 */
export function granularityNote(
  granularity: Granularity,
  placeGranularity: Granularity,
  placeName: string,
): string | null {
  if (granularity === placeGranularity) return null;
  if (granularity === "country") return `National figure shown for ${placeName}`;
  if (granularity === "region") return `Regional figure shown for ${placeName}`;
  return null;
}

/** Format a cited value with its unit for display. Strings render whole; numbers join the unit. */
export function citedDisplay(cited: Pick<CitedValue, "value">, unit?: string): string {
  return unit ? `${cited.value} ${unit}` : `${cited.value}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Month-and-year label from an ISO date, e.g. "2026-06-24" -> "June 2026". */
export function monthYearLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-");
  return `${MONTHS[Number(month) - 1] ?? ""} ${year}`.trim();
}

/** The masthead dateline: "Cited [month year] · N primary sources · screening, not advice". */
export function buildDateline(opts: { citedLabel: string; sourceCount: number }): string {
  const noun = opts.sourceCount === 1 ? "primary source" : "primary sources";
  return `Cited ${opts.citedLabel} · ${opts.sourceCount} ${noun} · screening, not advice`;
}
