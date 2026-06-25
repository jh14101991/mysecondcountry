import raw from "./greece-foreign-pensioner-flat-tax.json" with { type: "json" };
import rawLumpSum from "./greece-non-dom-lump-sum-tax.json" with { type: "json" };
import rawItaly from "./italy-pensioner-7-percent-flat-tax.json" with { type: "json" };
import rawIfici from "./portugal-ifici.json" with { type: "json" };
import { type Regime, RegimeSchema } from "./schema.js";

export const regimes: Regime[] = [
  RegimeSchema.parse(raw),
  RegimeSchema.parse(rawLumpSum),
  RegimeSchema.parse(rawIfici),
  RegimeSchema.parse(rawItaly),
];

/** Look up a Regime by its URL slug. */
export function regimeBySlug(slug: string): Regime | undefined {
  return regimes.find((r) => r.slug === slug);
}

/** Look up a Regime by its stable opaque id. */
export function regimeById(id: string): Regime | undefined {
  return regimes.find((r) => r.id === id);
}
