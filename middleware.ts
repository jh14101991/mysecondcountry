import { put } from "@vercel/blob";
import {
  type AiCrawlerId,
  aiCrawlerResourceType,
  detectAiCrawler,
  isAiCrawlerLoggablePath,
} from "./packages/web/src/lib/ai-crawlers.js";

interface VercelMiddlewareContext {
  waitUntil?: (promise: Promise<unknown>) => void;
}

interface AiCrawlerHit {
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

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}

function blobPathFor(record: AiCrawlerHit): string {
  const day = record.observedAt.slice(0, 10);
  const suffix =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `ai-crawlers/raw/${day}/${record.bot}-${Date.now()}-${suffix}.json`;
}

async function writeCrawlerHit(record: AiCrawlerHit): Promise<void> {
  if (!hasBlobCredentials()) {
    console.warn("ai-crawler-log: missing blob credentials", {
      hasBlobStoreId: Boolean(process.env.BLOB_STORE_ID),
      hasOidcToken: Boolean(process.env.VERCEL_OIDC_TOKEN),
      hasReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    });
    return;
  }

  const blob = await put(blobPathFor(record), `${JSON.stringify(record)}\n`, {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  console.info("ai-crawler-log: write ok", {
    bot: record.bot,
    path: record.path,
    blobPath: blob.pathname,
  });
}

export default function middleware(request: Request, context: VercelMiddlewareContext): void {
  if (request.method !== "GET" && request.method !== "HEAD") return;

  const url = new URL(request.url);
  if (!isAiCrawlerLoggablePath(url.pathname)) return;

  const userAgent = request.headers.get("user-agent") ?? "";
  const crawler = detectAiCrawler(userAgent);
  if (!crawler) return;

  const observedAt = new Date().toISOString();
  const record: AiCrawlerHit = {
    version: 1,
    observedAt,
    bot: crawler.id,
    botName: crawler.label,
    method: request.method,
    path: url.pathname,
    search: url.search,
    url: `${url.origin}${url.pathname}${url.search}`,
    resourceType: aiCrawlerResourceType(url.pathname),
    userAgent: userAgent.slice(0, 512),
    referrer: request.headers.get("referer") ?? "",
    environment: process.env.VERCEL_ENV ?? "unknown",
    deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
  };

  const write = writeCrawlerHit(record).catch((error) => {
    console.error("ai-crawler-log: write failed", error);
  });
  context.waitUntil?.(write);
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_astro/|brand/|mockups/|favicon.ico|og-image.png|site.webmanifest).*)"],
};
