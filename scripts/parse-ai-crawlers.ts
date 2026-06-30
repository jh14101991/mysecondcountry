import { pathToFileURL } from "node:url";
import { renderAiCrawlerSection } from "./lib/ai-crawler-summary";

function numberArg(name: string, fallback: number): number {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function main(): Promise<void> {
  const days = numberArg("--days", 7);
  process.stdout.write(await renderAiCrawlerSection({ days }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("parse-ai-crawlers: unexpected error", error);
    process.exitCode = 1;
  });
}
