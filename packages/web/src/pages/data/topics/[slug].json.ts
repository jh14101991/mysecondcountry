import { collectTopicsCitedValues, type Topic, topicFactId, topics } from "@where/data";
import type { APIRoute } from "astro";

export function getStaticPaths() {
  return topics.map((topic) => ({ params: { slug: topic.slug }, props: { topic } }));
}

function buildDataset(topic: Topic) {
  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    countryId: topic.countryId,
    facts: collectTopicsCitedValues(topic).map(({ path, cited }) => ({
      id: topicFactId(topic.id, path),
      path,
      ...cited,
    })),
  };
}

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(buildDataset((props as { topic: Topic }).topic), null, 2), {
    headers: { "content-type": "application/json" },
  });
