import { collectQaCitedValues, type Qa, qa, qaFactId } from "@where/data";
import type { APIRoute } from "astro";

export function getStaticPaths() {
  return qa.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

function buildDataset(entry: Qa) {
  return {
    id: entry.id,
    slug: entry.slug,
    question: entry.question,
    polarity: entry.polarity,
    answer: entry.answer,
    category: entry.category,
    facts: collectQaCitedValues(entry).map(({ path, cited }) => ({
      id: qaFactId(entry.id, path),
      path,
      ...cited,
    })),
  };
}

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(buildDataset((props as { entry: Qa }).entry), null, 2), {
    headers: { "content-type": "application/json" },
  });
