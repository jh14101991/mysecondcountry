import { type Place, PlaceSchema } from "../schema.js";
import chaniaRaw from "./gr-crete-chania.json" with { type: "json" };

// Explicit list, no dynamic imports: build-time safe (ADR-0001, plan Phase A). Each
// place is parsed at load, so a malformed or uncited JSON file throws immediately rather
// than shipping a bad claim. The refresh pipeline writes these JSON files; a human merges.
const RAW: unknown[] = [chaniaRaw];

export const places: Place[] = RAW.map((raw) => PlaceSchema.parse(raw));
