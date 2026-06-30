import { get, list } from "@vercel/blob";
import { AI_CRAWLERS, type AiCrawlerId } from "../../packages/web/src/lib/ai-crawlers";

export interface AiCrawlerHitRecord {
  version: 1;
  observedAt: string;
  bot: AiCrawlerId;
  botName: string;
  method: string;
  path: string;
  search: string;
  url: string;
  resourceType: "page" | "data" | "sitemap" | "robots" | "other";
  userAgent: string;
  referrer: string;
  environment: string;
  deployment: string;
}

export interface AiCrawlerSummaryRow {
  bot: AiCrawlerId;
  botName: string;
  path: string;
  resourceType: AiCrawlerHitRecord["resourceType"];
  hits: number;
  firstSeen: string;
  lastSeen: string;
}

interface AiCrawlerSummaryOptions {
  days?: number;
  now?: Date;
}

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateKeysForWindow(days: number, now: Date): string[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    date.setUTCDate(date.getUTCDate() - index);
    return dateKey(date);
  });
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return await new Response(stream).text();
}

export function parseAiCrawlerRecord(text: string): AiCrawlerHitRecord | null {
  try {
    const value = JSON.parse(text) as Partial<AiCrawlerHitRecord>;
    if (
      value.version !== 1 ||
      !value.observedAt ||
      !value.bot ||
      !value.botName ||
      !value.path ||
      !value.resourceType
    ) {
      return null;
    }
    if (value.environment === "probe" || value.deployment === "probe") {
      return null;
    }
    return value as AiCrawlerHitRecord;
  } catch {
    return null;
  }
}

async function listRawCrawlerBlobPathnames(date: string): Promise<string[]> {
  const pathnames: string[] = [];
  let cursor: string | undefined;
  do {
    const result = await list({
      prefix: `ai-crawlers/raw/${date}/`,
      limit: 1000,
      cursor,
    });
    pathnames.push(...result.blobs.map((blob) => blob.pathname));
    cursor = result.cursor;
  } while (cursor);
  return pathnames;
}

export async function loadAiCrawlerHits(
  options: AiCrawlerSummaryOptions = {},
): Promise<{ configured: boolean; hits: AiCrawlerHitRecord[]; error?: string }> {
  if (!hasBlobCredentials()) {
    return { configured: false, hits: [] };
  }

  const days = options.days ?? 7;
  const now = options.now ?? new Date();
  const hits: AiCrawlerHitRecord[] = [];

  try {
    for (const date of dateKeysForWindow(days, now)) {
      const pathnames = await listRawCrawlerBlobPathnames(date);
      for (const pathname of pathnames) {
        const blob = await get(pathname, { access: "private" });
        if (blob?.statusCode !== 200 || !blob.stream) continue;
        const record = parseAiCrawlerRecord(await streamToText(blob.stream));
        if (record) hits.push(record);
      }
    }
    return { configured: true, hits };
  } catch (error) {
    return { configured: true, hits, error: String(error) };
  }
}

export function summarizeAiCrawlerHits(hits: AiCrawlerHitRecord[]): AiCrawlerSummaryRow[] {
  const rows = new Map<string, AiCrawlerSummaryRow>();

  for (const hit of hits) {
    const key = `${hit.bot}|${hit.path}|${hit.resourceType}`;
    const existing = rows.get(key);
    if (!existing) {
      rows.set(key, {
        bot: hit.bot,
        botName: hit.botName,
        path: hit.path,
        resourceType: hit.resourceType,
        hits: 1,
        firstSeen: hit.observedAt,
        lastSeen: hit.observedAt,
      });
      continue;
    }
    existing.hits += 1;
    if (hit.observedAt < existing.firstSeen) existing.firstSeen = hit.observedAt;
    if (hit.observedAt > existing.lastSeen) existing.lastSeen = hit.observedAt;
  }

  return [...rows.values()].sort((a, b) => {
    if (b.hits !== a.hits) return b.hits - a.hits;
    return b.lastSeen.localeCompare(a.lastSeen);
  });
}

export async function renderAiCrawlerSection(
  options: AiCrawlerSummaryOptions = {},
): Promise<string> {
  const days = options.days ?? 7;
  const lines: string[] = ["## AI crawler sightings", ""];
  lines.push(
    "These are server-side bot sightings, not AI-search impressions, citations, or human visits.",
  );
  lines.push("");

  const { configured, hits, error } = await loadAiCrawlerHits(options);
  if (!configured) {
    lines.push(
      "Set `BLOB_READ_WRITE_TOKEN` for the weekly digest to read the Vercel Blob crawler log.",
    );
    lines.push("");
    lines.push(`Tracked bots: ${AI_CRAWLERS.map((crawler) => crawler.label).join(", ")}.`);
    lines.push("");
    return lines.join("\n");
  }

  if (error) {
    lines.push(`_Crawler log read error: ${error}_`);
    lines.push("");
  }

  if (hits.length === 0) {
    lines.push(`No tracked AI crawler hits recorded in the last ${days} days.`);
    lines.push("");
    return lines.join("\n");
  }

  const rows = summarizeAiCrawlerHits(hits).slice(0, 20);
  lines.push(`**Last ${days} days:** ${hits.length} tracked crawler hits.`);
  lines.push("");
  lines.push("| Bot | Path | Type | Hits | Last seen |");
  lines.push("| --- | --- | --- | ---: | --- |");
  for (const row of rows) {
    lines.push(
      `| ${row.botName} | \`${row.path}\` | ${row.resourceType} | ${row.hits} | ${row.lastSeen} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}
