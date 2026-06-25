import { places } from "./places/index.js";
import type { FactRef } from "./refs.js";
import { isFactRef } from "./refs.js";
import { collectRegimeCitedValues } from "./regimes/facts.js";
import { regimes } from "./regimes/index.js";
import { type CitedValue, collectCitedValues } from "./schema.js";

/** Resolve a FactRef to the exact CitedValue it points at. Throws if it does not resolve. */
export function resolveFactRef(ref: FactRef): CitedValue {
  const colonIdx = ref.ref.indexOf(":");
  const hashIdx = ref.ref.indexOf("#");
  const kind = ref.ref.slice(0, colonIdx);
  const id = ref.ref.slice(colonIdx + 1, hashIdx);
  const path = ref.ref.slice(hashIdx + 1);
  if (kind === "regime") {
    const regime = regimes.find((r) => r.id === id);
    if (!regime) throw new Error(`fact ref ${ref.ref}: no regime "${id}"`);
    const hit = collectRegimeCitedValues(regime).find((f) => f.path === path);
    if (!hit) throw new Error(`fact ref ${ref.ref}: no cited path "${path}" on regime "${id}"`);
    return hit.cited;
  }
  if (kind === "place") {
    const place = places.find((p) => p.id === id);
    if (!place) throw new Error(`fact ref ${ref.ref}: no place "${id}"`);
    const hit = collectCitedValues(place).find((f) => f.path === path);
    if (!hit) throw new Error(`fact ref ${ref.ref}: no cited path "${path}" on place "${id}"`);
    return hit.cited;
  }
  throw new Error(`fact ref ${ref.ref}: unknown kind "${kind}"`);
}

/** An authoring fact field is a CitedValue or a FactRef; resolve it to a plain CitedValue. */
export function resolveCitedOrRef(v: CitedValue | FactRef): CitedValue {
  return isFactRef(v) ? resolveFactRef(v) : v;
}
