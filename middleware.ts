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

function crawlerLogHeaders(): HeadersInit {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.AI_CRAWLER_LOG_SECRET) {
    headers["x-msc-crawler-log-secret"] = process.env.AI_CRAWLER_LOG_SECRET;
  }
  return headers;
}

async function writeCrawlerHit(record: AiCrawlerHit): Promise<void> {
  if (!hasBlobCredentials()) return;
  await fetch(`${new URL(record.url).origin}/api/ai-crawler-log`, {
    method: "POST",
    headers: crawlerLogHeaders(),
    body: JSON.stringify(record),
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
  matcher: ["/((?!api/|_astro/|brand/|mockups/|favicon.ico|og-image.png|site.webmanifest).*)"],
};
