import { collectToolCitedValues, type Tool, toolFactId, tools } from "@where/data";
import type { APIRoute } from "astro";

export function getStaticPaths() {
  return tools.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

function buildDataset(entry: Tool) {
  const citedValues = collectToolCitedValues(entry);
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    toolType: entry.toolType,
    steps: entry.steps.map((step, i) => {
      const citedField = citedValues.find((f) => f.path === `steps.${i}.requirement`);
      return {
        order: step.order,
        title: step.title,
        detail: step.detail,
        ...(citedField
          ? {
              requirement: {
                id: toolFactId(entry.id, citedField.path),
                path: citedField.path,
                ...citedField.cited,
              },
            }
          : {}),
      };
    }),
  };
}

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(buildDataset((props as { entry: Tool }).entry), null, 2), {
    headers: { "content-type": "application/json" },
  });
