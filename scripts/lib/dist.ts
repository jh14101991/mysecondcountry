import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const DIST = "packages/web/dist";

export function ensureBuilt(): void {
  if (!existsSync(DIST)) {
    console.error(`${DIST} not found. Run \`pnpm --filter @where/web build\` first.`);
    process.exit(1);
  }
}

export function htmlFiles(dir: string = DIST): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (entry.endsWith(".html")) out.push(p);
  }
  return out;
}

export function read(path: string): string {
  return readFileSync(path, "utf8");
}

export function rel(path: string): string {
  return path.startsWith(`${DIST}/`) ? path.slice(DIST.length + 1) : path;
}
