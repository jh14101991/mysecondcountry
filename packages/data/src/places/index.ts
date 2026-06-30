import { type Place, PlaceSchema } from "../schema.js";
import cyRaw from "./cy.json" with { type: "json" };
import esRaw from "./es.json" with { type: "json" };
import grRaw from "./gr.json" with { type: "json" };
import creteRaw from "./gr-crete.json" with { type: "json" };
import chaniaRaw from "./gr-crete-chania.json" with { type: "json" };
import itRaw from "./it.json" with { type: "json" };
import mtRaw from "./mt.json" with { type: "json" };
import ptRaw from "./pt.json" with { type: "json" };

// Explicit list, no dynamic imports: build-time safe (ADR-0001, plan Phase A). Each
// place is parsed at load, so a malformed or uncited JSON file throws immediately rather
// than shipping a bad claim. The refresh pipeline writes these JSON files; a human merges.
// Country anchors first, then regional parents, then the deeper town pages.
const RAW: unknown[] = [grRaw, ptRaw, esRaw, itRaw, cyRaw, mtRaw, creteRaw, chaniaRaw];

export const places: Place[] = RAW.map((raw) => PlaceSchema.parse(raw));
