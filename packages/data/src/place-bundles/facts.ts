import type { CitedValue } from "../schema.js";
import type { PlaceEvidenceBundle } from "./schema.js";

/** Walk resolved CitedValues on a place evidence bundle, with stable row paths. */
export function collectPlaceBundleCitedValues(
  bundle: PlaceEvidenceBundle,
): { path: string; cited: CitedValue }[] {
  return bundle.rows.flatMap((row) =>
    row.cited ? [{ path: `rows.${row.key}`, cited: row.cited }] : [],
  );
}
