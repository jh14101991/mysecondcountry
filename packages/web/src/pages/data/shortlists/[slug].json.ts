import { places, type Shortlist, shortlists } from "@where/data";
import { evaluateShortlist } from "@where/engine";
import type { APIRoute } from "astro";

const countryPlaces = places.filter((p) => p.granularity === "country");

export function getStaticPaths() {
  return shortlists.map((shortlist) => ({
    params: { slug: shortlist.slug },
    props: { shortlist },
  }));
}

function buildDataset(shortlist: Shortlist) {
  const items = evaluateShortlist(shortlist.constraint, countryPlaces);
  return {
    id: shortlist.id,
    slug: shortlist.slug,
    title: shortlist.title,
    items: items.map((item) => ({
      rank: item.rank,
      placeId: item.placeId,
      name: item.name,
      citedFields: item.citedFields,
    })),
  };
}

export const GET: APIRoute = ({ props }) =>
  new Response(
    JSON.stringify(buildDataset((props as { shortlist: Shortlist }).shortlist), null, 2),
    { headers: { "content-type": "application/json" } },
  );
