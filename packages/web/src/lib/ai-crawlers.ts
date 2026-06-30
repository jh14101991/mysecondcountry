export type AiCrawlerId =
  | "gptbot"
  | "oai-searchbot"
  | "chatgpt-user"
  | "claudebot"
  | "claude-searchbot"
  | "perplexitybot"
  | "perplexity-user"
  | "google-extended"
  | "googleother";

export interface AiCrawlerDefinition {
  id: AiCrawlerId;
  label: string;
  pattern: RegExp;
}

export interface AiCrawlerMatch {
  id: AiCrawlerId;
  label: string;
}

export const AI_CRAWLERS: AiCrawlerDefinition[] = [
  { id: "oai-searchbot", label: "OAI-SearchBot", pattern: /\boai-searchbot\b/i },
  { id: "gptbot", label: "GPTBot", pattern: /\bgptbot\b/i },
  { id: "chatgpt-user", label: "ChatGPT-User", pattern: /\bchatgpt-user\b/i },
  { id: "claude-searchbot", label: "Claude-SearchBot", pattern: /\bclaude-searchbot\b/i },
  { id: "claudebot", label: "ClaudeBot", pattern: /\bclaudebot\b/i },
  { id: "perplexitybot", label: "PerplexityBot", pattern: /\bperplexitybot\b/i },
  { id: "perplexity-user", label: "Perplexity-User", pattern: /\bperplexity-user\b/i },
  { id: "google-extended", label: "Google-Extended", pattern: /\bgoogle-extended\b/i },
  { id: "googleother", label: "GoogleOther", pattern: /\bgoogleother\b/i },
];

const STATIC_EXTENSION_RE =
  /\.(?:avif|bmp|css|gif|ico|jpeg|jpg|js|json\.br|map|mp4|otf|png|svg|txt|webmanifest|webp|woff|woff2)$/i;

export function detectAiCrawler(userAgent: string | null | undefined): AiCrawlerMatch | null {
  if (!userAgent) return null;
  const match = AI_CRAWLERS.find((crawler) => crawler.pattern.test(userAgent));
  return match ? { id: match.id, label: match.label } : null;
}

export function isAiCrawlerLoggablePath(pathname: string): boolean {
  if (!pathname?.startsWith("/")) return false;
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/_astro/")) return false;
  if (pathname.startsWith("/brand/")) return false;
  if (pathname.startsWith("/mockups/")) return false;
  if (STATIC_EXTENSION_RE.test(pathname)) return false;
  return true;
}

export function aiCrawlerResourceType(
  pathname: string,
): "page" | "data" | "sitemap" | "robots" | "other" {
  if (pathname === "/robots.txt") return "robots";
  if (pathname.endsWith(".xml")) return "sitemap";
  if (pathname.startsWith("/data/") || pathname.endsWith(".json")) return "data";
  if (!pathname.includes(".")) return "page";
  return "other";
}
