import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";

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
    // Design comps under dist/mockups/ are internal scratch served separately (launch.json
    // port 4477), and /styleguide is a noindex dev reference (a component gallery, not a
    // content page). The content-page guards apply to real pages only, so skip both. The
    // same components are guard-checked on the real pages that use them.
    if ((entry === "mockups" || entry === "styleguide") && dir === DIST) continue;
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

type JsonLdNode = Record<string, unknown>;

/** Parse every application/ld+json block in a page, flattening arrays into a node list. */
export function jsonLdNodes(html: string): JsonLdNode[] {
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((m) => m[1] ?? "");
  const nodes: JsonLdNode[] = [];
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block);
    } catch {
      continue;
    }
    for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
      if (node && typeof node === "object") nodes.push(node as JsonLdNode);
    }
  }
  return nodes;
}

/**
 * Visible text of a built page: body textContent with style/script/code/svg/noscript
 * stripped. Copy guards run on this so CSS custom properties (var(--x), which contain "--")
 * and inline scripts never trip a check meant for prose.
 */
export function visibleText(html: string): string {
  const doc = new JSDOM(html).window.document;
  for (const el of doc.querySelectorAll("script, style, code, svg, noscript")) el.remove();
  return doc.body?.textContent ?? "";
}
