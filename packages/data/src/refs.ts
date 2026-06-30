import { z } from "zod";

/** A reference to an existing cited fact: "regime:<id>#<dotted.path>" or "place:<id>#<path>". */
export const FactRefSchema = z.object({
  ref: z
    .string()
    .regex(
      /^(regime|place):[a-z0-9-]+#[a-zA-Z0-9_.]+$/,
      "ref must be '<regime|place>:<id>#<dotted.path>'",
    ),
});
export type FactRef = z.infer<typeof FactRefSchema>;

/** True for a FactRef, false for an inline CitedValue (which carries `value`, not `ref`). */
export function isFactRef(v: unknown): v is FactRef {
  return typeof v === "object" && v !== null && "ref" in v && !("value" in v);
}
