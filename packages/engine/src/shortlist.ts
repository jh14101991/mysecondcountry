import { type CitedValue, type Place, placeVariables, variableByKey } from "@where/data";

export interface ShortlistFilter {
  key: string;
  op: "<=" | ">=" | "==" | "in";
  value: number | string | boolean | string[];
}
export interface ShortlistSpec {
  filters: ShortlistFilter[];
  rank: { byKey: string; dir: "asc" | "desc" };
}
export interface ShortlistField {
  key: string;
  label: string;
  cited: CitedValue;
}
export interface ShortlistItem {
  placeId: string;
  name: string;
  rank: number;
  /** Cited value for the rank key plus every filter key, deduped, stable order. Every figure sourced. */
  citedFields: ShortlistField[];
}

function passes(cited: CitedValue | undefined, f: ShortlistFilter): boolean {
  if (cited === undefined || cited.value === undefined) return false;
  const v = cited.value;
  switch (f.op) {
    case "<=":
      return typeof v === "number" && typeof f.value === "number" && v <= f.value;
    case ">=":
      return typeof v === "number" && typeof f.value === "number" && v >= f.value;
    case "==":
      return v === f.value;
    case "in":
      return Array.isArray(f.value) && f.value.includes(v as string);
  }
}

export function evaluateShortlist(spec: ShortlistSpec, places: Place[]): ShortlistItem[] {
  const keys = [spec.rank.byKey, ...spec.filters.map((f) => f.key)].filter(
    (k, i, a) => a.indexOf(k) === i,
  );
  const matched = places.filter((p) => {
    const vars = placeVariables(p);
    return spec.filters.every((f) => passes(vars[f.key], f));
  });
  const sorted = [...matched].sort((a, b) => {
    const av = placeVariables(a)[spec.rank.byKey]?.value;
    const bv = placeVariables(b)[spec.rank.byKey]?.value;
    const an = typeof av === "number" ? av : 0;
    const bn = typeof bv === "number" ? bv : 0;
    return spec.rank.dir === "asc" ? an - bn : bn - an;
  });
  return sorted.map((p, i) => {
    const vars = placeVariables(p);
    const citedFields: ShortlistField[] = [];
    for (const key of keys) {
      const cited = vars[key];
      if (cited) citedFields.push({ key, label: variableByKey(key)?.label ?? key, cited });
    }
    return { placeId: p.id, name: p.name, rank: i + 1, citedFields };
  });
}
