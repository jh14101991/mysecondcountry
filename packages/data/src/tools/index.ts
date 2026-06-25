import { resolveCitedOrRef } from "../resolve.js";
import greeceChecklistRaw from "./greece-7-percent-pension-tax-checklist.json" with {
  type: "json",
};
import portugalChecklistRaw from "./portugal-ifici-eligibility-checklist.json" with {
  type: "json",
};
import { type ResolvedStep, type Tool, ToolInputSchema } from "./schema.js";

const RAW: unknown[] = [greeceChecklistRaw, portugalChecklistRaw];

function resolveTool(raw: unknown): Tool {
  const input = ToolInputSchema.parse(raw);
  const steps: ResolvedStep[] = input.steps.map((step) => ({
    order: step.order,
    title: step.title,
    detail: step.detail,
    requirement: step.requirement ? resolveCitedOrRef(step.requirement) : undefined,
    officialSourceUrl: step.officialSourceUrl,
  }));
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    toolType: input.toolType,
    intro: input.intro,
    steps,
    relatedSlugs: input.relatedSlugs,
  };
}

export const tools: Tool[] = RAW.map(resolveTool);

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function toolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}
