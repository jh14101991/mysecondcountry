import {
  collectQaCitedValues,
  collectRegimeCitedValues,
  collectToolCitedValues,
  collectTopicsCitedValues,
  placeById,
  placePath,
  places,
  qa,
  regimes,
  shortlists,
  tools,
  topics,
} from "@where/data";
import type { APIRoute } from "astro";

const SITE = "https://mysecondcountry.com";
const FALLBACK_DATE = "2026-06-25";
const TRUST_ROUTE_DATE = "2026-06-29";

function maxDate(dates: string[]): string {
  if (dates.length === 0) return FALLBACK_DATE;
  return dates.reduce((a, b) => (a > b ? a : b));
}

function urlEntry(loc: string, lastmod: string): string {
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
}

export const GET: APIRoute = () => {
  const lines: string[] = [];

  // Static pages
  lines.push(urlEntry(`${SITE}/`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/about`, TRUST_ROUTE_DATE));
  lines.push(urlEntry(`${SITE}/affiliate-disclosure`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/compare`, TRUST_ROUTE_DATE));
  lines.push(urlEntry(`${SITE}/compare/greece-portugal-spain`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/guides`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/methodology`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/places`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/privacy`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/screening-notice`, TRUST_ROUTE_DATE));
  lines.push(urlEntry(`${SITE}/screener`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/sources`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/terms`, FALLBACK_DATE));

  // Index/hub pages
  lines.push(urlEntry(`${SITE}/answers`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/topics`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/tax`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/tools`, FALLBACK_DATE));
  lines.push(urlEntry(`${SITE}/shortlists`, FALLBACK_DATE));

  // Place pages
  for (const place of places) {
    lines.push(urlEntry(`${SITE}${placePath(place)}`, FALLBACK_DATE));
  }

  // Regime pages
  for (const regime of regimes) {
    const country = placeById(regime.countryId);
    if (!country) continue;
    const facts = collectRegimeCitedValues(regime);
    const lastmod = maxDate(facts.map((f) => f.cited.verifiedDate));
    lines.push(urlEntry(`${SITE}/${country.slug}/tax/${regime.slug}`, lastmod));
  }

  // QA pages
  for (const entry of qa) {
    const facts = collectQaCitedValues(entry);
    const lastmod = maxDate(facts.map((f) => f.cited.verifiedDate));
    lines.push(urlEntry(`${SITE}/answers/${entry.slug}`, lastmod));
  }

  // Topic pages
  for (const topic of topics) {
    const facts = collectTopicsCitedValues(topic);
    const lastmod = maxDate(facts.map((f) => f.cited.verifiedDate));
    lines.push(urlEntry(`${SITE}/topics/${topic.slug}`, lastmod));
  }

  // Shortlist pages (no collect function; use fallback date)
  for (const shortlist of shortlists) {
    lines.push(urlEntry(`${SITE}/shortlists/${shortlist.slug}`, FALLBACK_DATE));
  }

  // Tool pages
  for (const tool of tools) {
    const facts = collectToolCitedValues(tool);
    const lastmod = maxDate(facts.map((f) => f.cited.verifiedDate));
    lines.push(urlEntry(`${SITE}/tools/${tool.slug}`, lastmod));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
