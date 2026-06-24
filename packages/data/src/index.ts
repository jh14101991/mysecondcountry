import { chania } from "./fixtures/crete-chania.js";
import type { Place } from "./schema.js";

export * from "./schema.js";
export { chania };

/** All published Places. v1 bootstrap: just Chania. Phase A loads the Greece set. */
export const places: Place[] = [chania];

/** Look up a Place by its stable opaque id. */
export function placeById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}
