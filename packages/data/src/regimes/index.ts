import raw from "./greece-foreign-pensioner-flat-tax.json" with { type: "json" };
import { type Regime, RegimeSchema } from "./schema.js";

export const regimes: Regime[] = [RegimeSchema.parse(raw)];

/** Look up a Regime by its URL slug. */
export function regimeBySlug(slug: string): Regime | undefined {
  return regimes.find((r) => r.slug === slug);
}

/** Look up a Regime by its stable opaque id. */
export function regimeById(id: string): Regime | undefined {
  return regimes.find((r) => r.id === id);
}
