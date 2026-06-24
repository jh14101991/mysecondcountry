import type { CitedValue } from "@where/data";
import { type Place, placeVariables } from "@where/data";

export interface ActiveFilter {
  key: string;
  min?: number;
  max?: number;
  equals?: string | boolean;
  requireData?: boolean;
}

/**
 * Narrow places by cited-variable filters. A place passes the set only if it passes every
 * filter. Unknown handling (ADR-0016): a place with no value for a filter's key passes that
 * filter, unless the filter sets requireData, in which case the unknown place is excluded.
 * Unknown is never treated as a failing value.
 */
export function applyFilters(places: Place[], filters: ActiveFilter[]): Place[] {
  return places.filter((place) => {
    const vars = placeVariables(place);
    return filters.every((f) => passes(vars[f.key], f));
  });
}

function passes(cited: CitedValue | undefined, f: ActiveFilter): boolean {
  if (cited === undefined || cited.value === undefined) {
    return f.requireData !== true;
  }

  const v = cited.value;

  if (f.equals !== undefined && v !== f.equals) {
    return false;
  }

  if (f.min !== undefined && (typeof v !== "number" || v < f.min)) {
    return false;
  }

  if (f.max !== undefined && (typeof v !== "number" || v > f.max)) {
    return false;
  }

  return true;
}
