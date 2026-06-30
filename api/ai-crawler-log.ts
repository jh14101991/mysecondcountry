import { put } from "@vercel/blob";

interface ApiResponse {
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
  statusCode: number;
}

interface ApiRequest extends AsyncIterable<Buffer | string> {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

interface AiCrawlerHit {
  version: 1;
  observedAt: string;
  bot: string;
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

function send(response: ApiResponse, statusCode: number, body = ""): void {
  response.statusCode = statusCode;
  if (body) response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(body);
}

function headerValue(headers: ApiRequest["headers"], name: string): string | undefined {
  const value = headers?.[name.toLowerCase()] ?? headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function authorized(request: ApiRequest): boolean {
  const secret = process.env.AI_CRAWLER_LOG_SECRET;
  if (!secret) return true;
  return headerValue(request.headers, "x-msc-crawler-log-secret") === secret;
}

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}

function validRecord(record: Partial<AiCrawlerHit>): record is AiCrawlerHit {
  return Boolean(
    record.version === 1 &&
      record.observedAt &&
      record.bot &&
      record.botName &&
      record.method &&
      record.path?.startsWith("/") &&
      record.url?.startsWith("https://mysecondcountry.com") &&
      record.resourceType &&
      record.userAgent !== undefined,
  );
}

async function readBody(request: ApiRequest): Promise<string> {
  if (typeof request.body === "string") return request.body;
  if (request.body && typeof request.body === "object") {
    return JSON.stringify(request.body);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function blobPathFor(record: AiCrawlerHit): string {
  const day = record.observedAt.slice(0, 10);
  const suffix = crypto.randomUUID();
  return `ai-crawlers/raw/${day}/${record.bot}-${Date.now()}-${suffix}.json`;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method !== "POST") {
    send(response, 405, JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  if (!authorized(request)) {
    send(response, 401, JSON.stringify({ error: "unauthorized" }));
    return;
  }

  if (!hasBlobCredentials()) {
    send(response, 204);
    return;
  }

  try {
    const record = JSON.parse(await readBody(request)) as Partial<AiCrawlerHit>;
    if (!validRecord(record)) {
      send(response, 400, JSON.stringify({ error: "invalid_record" }));
      return;
    }

    await put(blobPathFor(record), `${JSON.stringify(record)}\n`, {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    send(response, 204);
  } catch (error) {
    console.error("ai-crawler-log-api: write failed", error);
    send(response, 500, JSON.stringify({ error: "write_failed" }));
  }
}
