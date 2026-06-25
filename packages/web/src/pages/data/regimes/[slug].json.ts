import { collectRegimeCitedValues, type Regime, regimeFactId, regimes } from "@where/data";
import type { APIRoute } from "astro";

export function getStaticPaths() {
  return regimes.map((regime) => ({ params: { slug: regime.slug }, props: { regime } }));
}

function buildDataset(regime: Regime) {
  return {
    id: regime.id,
    slug: regime.slug,
    name: regime.name,
    countryId: regime.countryId,
    regimeType: regime.regimeType,
    facts: collectRegimeCitedValues(regime).map(({ path, cited }) => ({
      id: regimeFactId(regime.id, path),
      path,
      ...cited,
    })),
  };
}

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(buildDataset((props as { regime: Regime }).regime), null, 2), {
    headers: { "content-type": "application/json" },
  });
