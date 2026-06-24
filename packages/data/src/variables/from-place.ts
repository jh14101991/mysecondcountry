import type { CitedValue, Place } from "../schema.js";

/**
 * Derives a flat catalogue-keyed map of CitedValues from a Place's typed fields,
 * merged over any explicit place.variables entries. Typed fields take precedence.
 * Keys are omitted (not null) when their source field is absent.
 */
export function placeVariables(place: Place): Record<string, CitedValue> {
  const derived: Record<string, CitedValue> = {};

  derived.cost_price_level = place.costOfLiving.priceLevelIndexEU27 as CitedValue;

  if (place.tax?.headlinePersonalIncomeTaxRate) {
    derived.top_income_tax_rate = place.tax.headlinePersonalIncomeTaxRate as CitedValue;
  }
  if (place.tax?.specialRegime) {
    const r = place.tax.specialRegime;
    derived.special_tax_regime = {
      ...r,
      value: true,
      excerpt: r.excerpt ?? String(r.value),
    } as CitedValue;
  }
  if (place.residency?.digitalNomadVisa) {
    derived.dnv_income_floor = place.residency.digitalNomadVisa as CitedValue;
  }
  if (place.residency?.goldenVisa) {
    const g = place.residency.goldenVisa;
    derived.golden_visa = {
      ...g,
      value: true,
      excerpt: g.excerpt ?? String(g.value),
    } as CitedValue;
  }

  derived.winter_high = place.climate.averageJanuaryHighC as CitedValue;
  derived.summer_high = place.climate.averageJulyHighC as CitedValue;
  derived.annual_sunshine = place.climate.averageAnnualSunHours as CitedValue;
  derived.koppen = place.climate.koppenClass as CitedValue;

  if (place.healthcare?.physiciansPer1000) {
    derived.physicians_per_1k = place.healthcare.physiciansPer1000 as CitedValue;
  }
  if (place.safety?.peaceIndexScore) {
    derived.gpi_score = place.safety.peaceIndexScore as CitedValue;
  }

  return { ...(place.variables ?? {}), ...derived };
}
