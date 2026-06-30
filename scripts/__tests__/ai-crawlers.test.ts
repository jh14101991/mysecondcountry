import { describe, expect, it } from "vitest";
import {
  aiCrawlerResourceType,
  detectAiCrawler,
  isAiCrawlerLoggablePath,
} from "../../packages/web/src/lib/ai-crawlers";
import { type AiCrawlerHitRecord, summarizeAiCrawlerHits } from "../lib/ai-crawler-summary";

describe("AI crawler detection", () => {
  it("detects known AI crawler user agents", () => {
    expect(detectAiCrawler("Mozilla/5.0 AppleWebKit GPTBot/1.2")?.id).toBe("gptbot");
    expect(detectAiCrawler("OAI-SearchBot/1.0")?.id).toBe("oai-searchbot");
    expect(detectAiCrawler("ClaudeBot/1.0")?.id).toBe("claudebot");
    expect(detectAiCrawler("PerplexityBot/1.0")?.id).toBe("perplexitybot");
    expect(detectAiCrawler("Google-Extended")?.id).toBe("google-extended");
  });

  it("ignores ordinary browsers", () => {
    expect(detectAiCrawler("Mozilla/5.0 Safari/605.1.15")).toBeNull();
    expect(detectAiCrawler("Googlebot/2.1")).toBeNull();
    expect(detectAiCrawler("")).toBeNull();
  });

  it("keeps public content paths and skips static assets", () => {
    expect(isAiCrawlerLoggablePath("/places/greece")).toBe(true);
    expect(isAiCrawlerLoggablePath("/data/regimes/foreign-pensioner-flat-tax.json")).toBe(true);
    expect(isAiCrawlerLoggablePath("/sitemap.xml")).toBe(true);
    expect(isAiCrawlerLoggablePath("/_astro/page.js")).toBe(false);
    expect(isAiCrawlerLoggablePath("/brand/monogram.svg")).toBe(false);
    expect(isAiCrawlerLoggablePath("/mockups/homepage.html")).toBe(false);
  });

  it("classifies crawler resources", () => {
    expect(aiCrawlerResourceType("/robots.txt")).toBe("robots");
    expect(aiCrawlerResourceType("/sitemap.xml")).toBe("sitemap");
    expect(aiCrawlerResourceType("/data/regimes/example.json")).toBe("data");
    expect(aiCrawlerResourceType("/places/greece")).toBe("page");
  });
});

describe("AI crawler summary", () => {
  it("groups hits by bot and path", () => {
    const base: AiCrawlerHitRecord = {
      version: 1,
      observedAt: "2026-06-28T19:00:00.000Z",
      bot: "gptbot",
      botName: "GPTBot",
      method: "GET",
      path: "/places/greece",
      search: "",
      url: "https://mysecondcountry.com/places/greece",
      resourceType: "page",
      userAgent: "GPTBot/1.2",
      referrer: "",
      environment: "production",
      deployment: "abc",
    };

    const rows = summarizeAiCrawlerHits([
      base,
      { ...base, observedAt: "2026-06-28T20:00:00.000Z" },
      { ...base, bot: "perplexitybot", botName: "PerplexityBot" },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]?.bot).toBe("gptbot");
    expect(rows[0]?.hits).toBe(2);
    expect(rows[0]?.lastSeen).toBe("2026-06-28T20:00:00.000Z");
  });
});
