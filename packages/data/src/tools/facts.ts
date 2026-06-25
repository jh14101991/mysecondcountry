import type { CitedValue } from "../schema.js";
import type { Tool } from "./schema.js";

/** Walk every resolved CitedValue requirement on a tool, with a dotted path. */
export function collectToolCitedValues(tool: Tool): { path: string; cited: CitedValue }[] {
  const out: { path: string; cited: CitedValue }[] = [];
  for (let i = 0; i < tool.steps.length; i++) {
    const step = tool.steps[i];
    if (step?.requirement) {
      out.push({ path: `steps.${i}.requirement`, cited: step.requirement });
    }
  }
  return out;
}

/** Stable fact id from a tool id and a dotted path. */
export function toolFactId(toolId: string, path: string): string {
  return `${toolId}#${path}`;
}
