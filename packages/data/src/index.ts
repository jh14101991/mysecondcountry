import { places } from "./places/index.js";
import type { Place } from "./schema.js";

export * from "./profiles/presets.js";
export * from "./schema.js";
export * from "./variables/catalog.js";
export * from "./variables/from-place.js";
export * from "./variables/schema.js";
export { places };

/** Look up a Place by its stable opaque id. */
export function placeById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}

const chaniaPlace = placeById("gr-crete-chania");
if (!chaniaPlace) throw new Error("Chania place missing from the places index");

/** The first published place, kept as a named export for tests and the engine. */
export const chania: Place = chaniaPlace;
