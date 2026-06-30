// Weekly indexing + freshness digest.
// Prints a Markdown report to stdout and always exits 0 (report, not a gate).
// The freshness logic is a pure exported function; site-health and traffic are separate async sections.

import { createSign } from "node:crypto";
import {
  ageInDays,
  type CitedValue,
  collectCitedValues,
  collectQaCitedValues,
  collectRegimeCitedValues,
  collectToolCitedValues,
  collectTopicsCitedValues,
  DEFAULT_STALENESS_DAYS,
  places,
  qa,
  regimes,
  tools,
  topics,
} from "@where/data";
import { renderAiCrawlerSection } from "./lib/ai-crawler-summary";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FreshRow {
  collection: string;
  id: string;
  path: string;
  sourceName: string;
  verifiedDate: string;
  ageDays: number;
  limitDays: number;
  daysLeft: number;
}

// ---------------------------------------------------------------------------
// (a) Freshness, pure, exported, testable
// ---------------------------------------------------------------------------

const HIGH_LIABILITY = new Set(["visa", "tax", "residency"]);

function limitFor(cited: CitedValue): number {
  return cited.stalenessDays ?? (cited.category ? DEFAULT_STALENESS_DAYS[cited.category] : 90);
}

function makeRow(
  collection: string,
  id: string,
  path: string,
  cited: CitedValue,
  today: Date,
): FreshRow {
  const limitDays = limitFor(cited);
  const ageDays = ageInDays(cited.verifiedDate, today);
  return {
    collection,
    id,
    path,
    sourceName: cited.sourceName,
    verifiedDate: cited.verifiedDate,
    ageDays,
    limitDays,
    daysLeft: limitDays - ageDays,
  };
}

/** Pure freshness computation. Returns stale (daysLeft < 0) and aging (0 <= daysLeft <= 14). */
export function freshnessDigest(today: Date): { stale: FreshRow[]; aging: FreshRow[] } {
  // Dedupe key: sourceUrl|value|verifiedDate. A referenced fact counts once.
  const seen = new Map<string, FreshRow>();

  function process(collection: string, id: string, cited: CitedValue, path: string): void {
    if (!cited.category || !HIGH_LIABILITY.has(cited.category)) return;
    if (cited.confidence === "low") return;
    // Use value-as-string for deduplication; the CitedValue.value is unknown so coerce.
    const dedupeKey = `${cited.sourceUrl}|${String(cited.value)}|${cited.verifiedDate}`;
    if (!seen.has(dedupeKey)) {
      seen.set(dedupeKey, makeRow(collection, id, path, cited, today));
    }
  }

  for (const place of places) {
    for (const { path, cited } of collectCitedValues(place)) {
      process("places", place.id, cited, path);
    }
  }

  for (const regime of regimes) {
    for (const { path, cited } of collectRegimeCitedValues(regime)) {
      process("regimes", regime.id, cited, path);
    }
  }

  for (const entry of qa) {
    for (const { path, cited } of collectQaCitedValues(entry)) {
      process("qa", entry.id, cited, path);
    }
  }

  for (const topic of topics) {
    for (const { path, cited } of collectTopicsCitedValues(topic)) {
      process("topics", topic.id, cited, path);
    }
  }

  for (const tool of tools) {
    for (const { path, cited } of collectToolCitedValues(tool)) {
      process("tools", tool.id, cited, path);
    }
  }

  const allRows = [...seen.values()];
  const stale = allRows.filter((r) => r.daysLeft < 0).sort((a, b) => a.daysLeft - b.daysLeft);
  const aging = allRows
    .filter((r) => r.daysLeft >= 0 && r.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return { stale, aging };
}

function renderFreshnessSection(today: Date): string {
  const { stale, aging } = freshnessDigest(today);
  const lines: string[] = ["## Freshness (visa / tax / residency)", ""];

  if (stale.length === 0 && aging.length === 0) {
    lines.push("All visa/tax/residency facts are comfortably within their windows.");
    lines.push("");
    return lines.join("\n");
  }

  lines.push(
    `**${stale.length} stale** (past window) | **${aging.length} aging** (within 14 days of expiry)`,
  );
  lines.push("");

  function tableRows(rows: FreshRow[]): string {
    if (rows.length === 0) return "_none_\n";
    const header = "| Collection | ID#Path | Source | Verified | Days left |";
    const sep = "| --- | --- | --- | --- | --- |";
    const body = rows
      .map(
        (r) =>
          `| ${r.collection} | ${r.id}#${r.path} | ${r.sourceName} | ${r.verifiedDate} | ${r.daysLeft} |`,
      )
      .join("\n");
    return [header, sep, body, ""].join("\n");
  }

  if (stale.length > 0) {
    lines.push("### Stale (must refresh before next deploy)");
    lines.push("");
    lines.push(tableRows(stale));
  }

  if (aging.length > 0) {
    lines.push("### Aging (refresh soon)");
    lines.push("");
    lines.push(tableRows(aging));
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// (b) Site health
// ---------------------------------------------------------------------------

async function siteHealth(): Promise<string> {
  const lines: string[] = ["## Site health", ""];

  // Sitemap
  try {
    const res = await fetch("https://mysecondcountry.com/sitemap.xml", {
      signal: AbortSignal.timeout(12_000),
    });
    if (res.status === 200) {
      const text = await res.text();
      const matches = text.match(/<loc>/g);
      const sitemapCount = matches ? matches.length : 0;
      lines.push(`- sitemap.xml: 200 OK, ${sitemapCount} \`<loc>\` entries`);
    } else {
      lines.push(`- sitemap.xml: HTTP ${res.status} (unexpected)`);
    }
  } catch (e) {
    lines.push(`- sitemap.xml: network error (${String(e)})`);
  }

  // robots.txt
  try {
    const res = await fetch("https://mysecondcountry.com/robots.txt", {
      signal: AbortSignal.timeout(12_000),
    });
    if (res.status === 200) {
      const text = await res.text();
      const hasSitemap = /^Sitemap:/m.test(text);
      lines.push(`- robots.txt: 200 OK, Sitemap: line ${hasSitemap ? "present" : "MISSING"}`);
    } else {
      lines.push(`- robots.txt: HTTP ${res.status} (unexpected)`);
    }
  } catch (e) {
    lines.push(`- robots.txt: network error (${String(e)})`);
  }

  // Sample URLs
  lines.push("");
  lines.push("### URL sample");
  lines.push("");

  const sampleUrls: string[] = ["https://mysecondcountry.com/"];

  // Pull up to 5 <loc> entries from sitemap XML (re-fetch or reuse text above)
  try {
    const res = await fetch("https://mysecondcountry.com/sitemap.xml", {
      signal: AbortSignal.timeout(12_000),
    });
    if (res.status === 200) {
      const text = await res.text();
      const locMatches = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)];
      for (const m of locMatches.slice(0, 5)) {
        const url = m[1]?.trim();
        if (url && !sampleUrls.includes(url)) sampleUrls.push(url);
      }
    }
  } catch {
    // silently skip; homepage is still in the list
  }

  sampleUrls.push("https://mysecondcountry.com/data/regimes/foreign-pensioner-flat-tax.json");

  for (const url of sampleUrls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      const flag = res.status === 200 ? "" : " **NON-200**";
      lines.push(`- \`${url}\`: ${res.status}${flag}`);
    } catch (e) {
      lines.push(`- \`${url}\`: network error (${String(e)})`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// (c) Google Search Console
// ---------------------------------------------------------------------------

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getGscToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const jwt = `${signingInput}.${base64url(signer.sign(sa.private_key))}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error(`GSC token exchange failed: HTTP ${res.status}`);
  return json.access_token;
}

async function gscSection(): Promise<string> {
  const lines: string[] = [];

  if (!process.env.GSC_SERVICE_ACCOUNT_JSON) {
    lines.push("## Google Search Console");
    lines.push("");
    lines.push(
      "Set the GSC_SERVICE_ACCOUNT_JSON repo secret (a Google Cloud service-account JSON with read access to the sc-domain:mysecondcountry.com property) to include indexing, clicks, impressions, and top queries here.",
    );
    lines.push("");
    return lines.join("\n");
  }

  lines.push("## Google Search Console (last 28 days)");
  lines.push("");

  try {
    const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON) as {
      client_email: string;
      private_key: string;
    };
    const token = await getGscToken(sa);

    const siteUrl = encodeURIComponent("sc-domain:mysecondcountry.com");
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`;
    const authHeaders = {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };

    // Compute date window: endDate = today - 3 days, startDate = endDate - 27 days (28-day window).
    const endDateObj = new Date();
    endDateObj.setUTCDate(endDateObj.getUTCDate() - 3);
    const startDateObj = new Date(endDateObj);
    startDateObj.setUTCDate(startDateObj.getUTCDate() - 27);
    const endDate = endDateObj.toISOString().slice(0, 10);
    const startDate = startDateObj.toISOString().slice(0, 10);

    // (1) Totals
    let clicks = 0;
    let impressions = 0;
    let ctr = 0;
    let position = 0;
    try {
      const totalsRes = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ startDate, endDate }),
        signal: AbortSignal.timeout(12_000),
      });
      const totalsJson = (await totalsRes.json()) as {
        rows?: { clicks: number; impressions: number; ctr: number; position: number }[];
      };
      if (totalsJson.rows?.[0]) {
        ({ clicks, impressions, ctr, position } = totalsJson.rows[0]);
      }
    } catch (e) {
      lines.push(`_GSC totals: ${String(e)}_`);
    }

    if (impressions === 0) {
      lines.push("No search impressions yet (normal until Google finishes indexing the new site).");
      lines.push("");
      return lines.join("\n");
    }

    lines.push(
      `**Clicks:** ${clicks} | **Impressions:** ${impressions} | **CTR:** ${(ctr * 100).toFixed(1)}% | **Avg position:** ${position.toFixed(1)}`,
    );
    lines.push("");

    // (2) Top queries
    try {
      const queriesRes = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 10 }),
        signal: AbortSignal.timeout(12_000),
      });
      const queriesJson = (await queriesRes.json()) as {
        rows?: { keys: string[]; clicks: number; impressions: number }[];
      };
      if (queriesJson.rows && queriesJson.rows.length > 0) {
        lines.push("### Top queries");
        lines.push("");
        lines.push("| Query | Clicks | Impressions |");
        lines.push("| --- | --- | --- |");
        for (const row of queriesJson.rows) {
          lines.push(`| ${row.keys[0]} | ${row.clicks} | ${row.impressions} |`);
        }
        lines.push("");
      }
    } catch (e) {
      lines.push(`_GSC queries: ${String(e)}_`);
    }

    // (3) Top pages
    try {
      const pagesRes = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ startDate, endDate, dimensions: ["page"], rowLimit: 10 }),
        signal: AbortSignal.timeout(12_000),
      });
      const pagesJson = (await pagesRes.json()) as {
        rows?: { keys: string[]; clicks: number; impressions: number }[];
      };
      if (pagesJson.rows && pagesJson.rows.length > 0) {
        lines.push("### Top pages");
        lines.push("");
        lines.push("| Page | Clicks | Impressions |");
        lines.push("| --- | --- | --- |");
        for (const row of pagesJson.rows) {
          lines.push(`| ${row.keys[0]} | ${row.clicks} | ${row.impressions} |`);
        }
        lines.push("");
      }
    } catch (e) {
      lines.push(`_GSC pages: ${String(e)}_`);
    }
  } catch (e) {
    lines.push(`_GSC: ${String(e)}_`);
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// (d) Human traffic and referrers
// ---------------------------------------------------------------------------

async function trafficSection(): Promise<string> {
  const lines: string[] = ["## Human traffic and referrers", ""];

  const key = process.env.PLAUSIBLE_API_KEY;
  if (!key) {
    lines.push(
      "Human traffic analytics is not wired in this digest. Do not infer human demand from GSC impressions or AI crawler sightings. The free next path is first-party event logging for source clicks, screener starts, newsletter signups, and referrer snapshots.",
    );
    lines.push("");
    return lines.join("\n");
  }

  const headers = { Authorization: `Bearer ${key}` };

  try {
    // Aggregate stats
    const aggRes = await fetch(
      "https://plausible.io/api/v1/stats/aggregate?site_id=mysecondcountry.com&period=7d&metrics=visitors,pageviews",
      { headers, signal: AbortSignal.timeout(12_000) },
    );
    if (aggRes.ok) {
      const agg = (await aggRes.json()) as {
        results: { visitors: { value: number }; pageviews: { value: number } };
      };
      lines.push(
        `**Last 7 days:** ${agg.results.visitors.value} visitors, ${agg.results.pageviews.value} pageviews`,
      );
      lines.push("");
    } else {
      lines.push(`_Plausible aggregate: HTTP ${aggRes.status}_`);
      lines.push("");
    }
  } catch (e) {
    lines.push(`_Plausible aggregate: network error (${String(e)})_`);
    lines.push("");
  }

  // Top pages
  try {
    const pagesRes = await fetch(
      "https://plausible.io/api/v1/stats/breakdown?site_id=mysecondcountry.com&period=7d&property=event:page&metrics=visitors&limit=10",
      { headers, signal: AbortSignal.timeout(12_000) },
    );
    if (pagesRes.ok) {
      const pages = (await pagesRes.json()) as {
        results: { page: string; visitors: number }[];
      };
      lines.push("### Top pages (7d)");
      lines.push("");
      lines.push("| Page | Visitors |");
      lines.push("| --- | --- |");
      for (const row of pages.results) {
        lines.push(`| \`${row.page}\` | ${row.visitors} |`);
      }
      lines.push("");
    } else {
      lines.push(`_Plausible top pages: HTTP ${pagesRes.status}_`);
      lines.push("");
    }
  } catch (e) {
    lines.push(`_Plausible top pages: network error (${String(e)})_`);
    lines.push("");
  }

  // Top referrers
  try {
    const refRes = await fetch(
      "https://plausible.io/api/v1/stats/breakdown?site_id=mysecondcountry.com&period=7d&property=visit:source&metrics=visitors&limit=10",
      { headers, signal: AbortSignal.timeout(12_000) },
    );
    if (refRes.ok) {
      const refs = (await refRes.json()) as {
        results: { source: string; visitors: number }[];
      };
      lines.push("### Top referrers (7d, including AI sources)");
      lines.push("");
      lines.push("| Source | Visitors |");
      lines.push("| --- | --- |");
      for (const row of refs.results) {
        lines.push(`| ${row.source} | ${row.visitors} |`);
      }
      lines.push("");
    } else {
      lines.push(`_Plausible top referrers: HTTP ${refRes.status}_`);
      lines.push("");
    }
  } catch (e) {
    lines.push(`_Plausible top referrers: network error (${String(e)})_`);
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// (d) Manual checks
// ---------------------------------------------------------------------------

function manualChecksSection(): string {
  return [
    "## Manual checks (need your login)",
    "",
    "- [Bing Webmaster Tools](https://www.bing.com/webmasters): check crawl and index coverage.",
    "- Google: run a [`site:mysecondcountry.com`](https://www.google.com/search?q=site:mysecondcountry.com) query to gauge how many pages are indexed.",
    "- Ask target questions in Perplexity, ChatGPT search, Google AI Overviews, and Claude: check whether mysecondcountry.com is cited.",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  const title = `# My Second Country: weekly digest ${dateStr}\n`;

  const freshness = renderFreshnessSection(today);
  const health = await siteHealth();
  const gsc = await gscSection();
  const aiCrawlers = await renderAiCrawlerSection();
  const traffic = await trafficSection();
  const manual = manualChecksSection();

  process.stdout.write([title, freshness, health, gsc, aiCrawlers, traffic, manual].join("\n"));
}

main().catch((err) => {
  console.error("digest: unexpected error", err);
  process.exit(0); // still exit 0; this is a report
});
