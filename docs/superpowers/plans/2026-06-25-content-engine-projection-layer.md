# Content engine, projection layer, implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/content`, a pure projection layer that turns a Place or Regime into postable cited artifacts (social post, rough-card PNG, raw-recordable video script, newsletter issue), so the founder can fire cheap market-touch shots this week.

**Architecture:** A new fourth workspace package, `@where/content`, mirroring the data-to-projection pattern of the web layer. Each generator is a pure, deterministic function: a Place or Regime plus a small config in, a typed artifact out. It depends on `@where/data` and `@where/engine`, never writes a database, and never posts. A targeting selector aims the generators at the highest-surprise cited fact. The canonical liability fence string is lifted into `@where/data` so both web and content import one source.

**Tech Stack:** TypeScript strict, pnpm workspace, Zod 4, Vitest 3, Biome 2. New runtime deps: `satori` (text to SVG) and `@resvg/resvg-js` (SVG to PNG) for the rough card.

**Scope boundary:** This plan is the projection layer only. The wired delivery (the `@astrojs/vercel` adapter, the `/api/subscribe` Vercel Function, the Resend Audience, the newsletter send) is a separate follow-up plan, because it touches `packages/web` (which a parallel design thread is rewriting) and carries the Resend domain-auth DNS gate. Spec: `docs/superpowers/specs/2026-06-25-content-engine-design.md`.

## Global Constraints

- Node >= 22, pnpm only, TypeScript strict, `moduleResolution: bundler`, relative imports end `.js`.
- Read first: the spec above, `docs/content-projection.md`, `FENCE.md`, `docs/page-roadmap.md`.
- Every artifact MUST contain the canonical fence string `FENCE_PRIMARY`, imported from `@where/data`, never copied. The exact text is: `Sourced screening information, not legal, tax, immigration, or financial advice. Verify with a licensed professional before acting.`
- The no-advice guard targets advice-GIVING phrasing, not the word "advice" (the fence contains "advice"). Banned in generated hook/body copy: `you should`, `we recommend`, `i recommend`, `we suggest`, `i suggest`, `our advice`, `best for you`, `best option`. The guard scans the hook and body, NOT the fence string.
- Copy rules: no em dashes; no AI-register words (leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust); sentence case; conservative and sourced.
- Generators are PURE and DETERMINISTIC: no `Date.now()`, no `Math.random()`, no network, no filesystem (except the explicit `writeDrafts` in Task 9). Any "now" or issue number is passed in.
- Do not relitigate locked ADRs. PlaceSchema and RegimeSchema are unchanged by this plan.
- Stage explicit paths on commit, never `git add -A`, and run `git restore --staged .` before staging if the working tree shows unrelated changes (a parallel design thread is active in `packages/web`).
- Guards stay green: `pnpm -r test`, `pnpm exec tsc --noEmit -p tsconfig.json`, `pnpm exec biome check packages/content packages/data`.

## File structure

- `packages/data/src/fence.ts` (create): the canonical fence constants, lifted from web.
- `packages/data/src/index.ts` (modify): re-export the fence.
- `packages/web/src/lib/fence.ts` (modify): re-export from `@where/data` so the live text is unchanged.
- `packages/content/package.json`, `tsconfig.json`, `src/index.ts` (create): the package.
- `packages/content/src/source.ts` (create): discriminate Place vs Regime, resolve name, canonical path, id, cited values.
- `packages/content/src/select.ts` (create): `selectHook`, the highest-surprise cited fact.
- `packages/content/src/instrument.ts` (create): `postId`, `taggedUrl` (UTM).
- `packages/content/src/generators/social-post.ts` (create)
- `packages/content/src/generators/rough-card.ts` (create)
- `packages/content/src/generators/video-script.ts` (create)
- `packages/content/src/generators/newsletter-issue.ts` (create)
- `packages/content/src/write-drafts.ts` (create): run all generators, write artifacts to `packages/content/output/`.
- `packages/content/src/__tests__/*.test.ts` (create): per-unit tests + a cross-generator fence test.

---

### Task 1: Lift the fence constants to @where/data

**Files:**
- Create: `packages/data/src/fence.ts`
- Modify: `packages/data/src/index.ts`
- Modify: `packages/web/src/lib/fence.ts`
- Test: `packages/data/src/__tests__/fence.test.ts`

**Interfaces:**
- Produces: `FENCE_PRIMARY: string`, `FENCE_TAX_RESIDENCY_RIDER: string`, `stalenessBanner(days: number): string`, re-exported from `@where/data`.

- [ ] **Step 1: Write the failing test** `packages/data/src/__tests__/fence.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { FENCE_PRIMARY, FENCE_TAX_RESIDENCY_RIDER, stalenessBanner } from "../index.js";

describe("fence constants", () => {
  it("exposes the verbatim primary fence", () => {
    expect(FENCE_PRIMARY).toBe(
      "Sourced screening information, not legal, tax, immigration, or financial advice. Verify with a licensed professional before acting.",
    );
  });
  it("exposes the tax/residency rider with the DOD phrase", () => {
    expect(FENCE_TAX_RESIDENCY_RIDER).toContain("not legal or tax advice");
  });
  it("builds a staleness banner naming the day count", () => {
    expect(stalenessBanner(60)).toContain("60");
  });
});
```

- [ ] **Step 2: Run, verify fail.** `pnpm --filter @where/data exec vitest run src/__tests__/fence.test.ts` (no such export).

- [ ] **Step 3: Create `packages/data/src/fence.ts`** by moving the three exports verbatim from `packages/web/src/lib/fence.ts` (the `FENCE_PRIMARY`, `FENCE_TAX_RESIDENCY_RIDER`, and `stalenessBanner` definitions and their JSDoc, unchanged).

- [ ] **Step 4: Re-export from the data index.** Add to `packages/data/src/index.ts`: `export * from "./fence.js";`

- [ ] **Step 5: Repoint the web fence to the shared source.** Replace the body of `packages/web/src/lib/fence.ts` with a single re-export so the live text is identical and there is one source of truth:

```ts
// The liability fence text now lives in @where/data so packages/content imports the same
// source (FENCE.md: imported, never copied). Re-exported here for the web components.
export { FENCE_PRIMARY, FENCE_TAX_RESIDENCY_RIDER, stalenessBanner } from "@where/data";
```

- [ ] **Step 6: Run, verify pass; confirm web still resolves.** `pnpm --filter @where/data exec vitest run src/__tests__/fence.test.ts` (pass), then `pnpm --filter @where/web exec tsc --noEmit` and `pnpm --filter @where/web build` (FenceBlock.astro still imports the same names; the regime/places pages still render the fence).

- [ ] **Step 7: Commit.**

```bash
git restore --staged .
git add packages/data/src/fence.ts packages/data/src/index.ts packages/data/src/__tests__/fence.test.ts packages/web/src/lib/fence.ts
git commit -m "refactor(data): lift the fence constants to @where/data, web re-exports"
```

---

### Task 2: Scaffold the @where/content package

**Files:**
- Create: `packages/content/package.json`, `packages/content/tsconfig.json`, `packages/content/src/index.ts`
- Test: `packages/content/src/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: the `@where/content` package importable across the workspace; `export const CONTENT_PACKAGE = "@where/content"` as a smoke export (removed once real exports land).

- [ ] **Step 1: Write `packages/content/package.json`** (mirror `@where/data`, add the engine + render deps):

```json
{
  "name": "@where/content",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "types": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run" },
  "dependencies": {
    "@where/data": "workspace:*",
    "@where/engine": "workspace:*",
    "satori": "^0.12.0",
    "@resvg/resvg-js": "^2.6.2"
  },
  "devDependencies": { "@types/node": "^22.10.0" }
}
```

- [ ] **Step 2: Write `packages/content/tsconfig.json`** (identical to `packages/data/tsconfig.json`):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "noEmit": true },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Write the smoke test** `packages/content/src/__tests__/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CONTENT_PACKAGE } from "../index.js";

describe("@where/content", () => {
  it("is importable", () => {
    expect(CONTENT_PACKAGE).toBe("@where/content");
  });
});
```

- [ ] **Step 4: Write `packages/content/src/index.ts`:** `export const CONTENT_PACKAGE = "@where/content";`

- [ ] **Step 5: Install and verify.** Run `pnpm install` (links the workspace package and fetches satori + resvg; confirm the installed major versions and adjust the `^` ranges in package.json if pnpm resolves a different major). Then `pnpm --filter @where/content test` (pass) and `pnpm --filter @where/content exec tsc --noEmit` (clean).

- [ ] **Step 6: Commit.**

```bash
git restore --staged .
git add packages/content/package.json packages/content/tsconfig.json packages/content/src/index.ts packages/content/src/__tests__/smoke.test.ts pnpm-lock.yaml
git commit -m "feat(content): scaffold @where/content package"
```

---

### Task 3: Source helpers and the targeting selector

**Files:**
- Create: `packages/content/src/source.ts`, `packages/content/src/select.ts`
- Test: `packages/content/src/__tests__/select.test.ts`

**Interfaces:**
- Consumes: `Place`, `Regime`, `CitedValue`, `placePath`, `placeById`, `collectCitedValues`, `collectRegimeCitedValues` (from `@where/data`).
- Produces: `type Source = Place | Regime`; `sourceName(s)`, `sourcePath(s)`, `sourceId(s)`, `sourceCitedValues(s)` in `source.ts`; `selectHook(s: Source): { path: string; cited: CitedValue }` in `select.ts`.

- [ ] **Step 1: Write the failing test** `packages/content/src/__tests__/select.test.ts`:

```ts
import { regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { sourceName, sourcePath } from "../source.js";
import { selectHook } from "../select.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");

describe("targeting", () => {
  it("resolves a regime's name and canonical path", () => {
    expect(sourceName(regime)).toContain("Greece");
    expect(sourcePath(regime)).toBe("/greece/tax/foreign-pensioner-flat-tax");
  });
  it("selects a high-liability cited fact as the hook", () => {
    const { path, cited } = selectHook(regime);
    expect(["tax", "residency", "visa"]).toContain(cited.category);
    expect(typeof path).toBe("string");
  });
  it("is deterministic", () => {
    expect(selectHook(regime)).toEqual(selectHook(regime));
  });
});
```

- [ ] **Step 2: Run, verify fail.** `pnpm --filter @where/content exec vitest run src/__tests__/select.test.ts`.

- [ ] **Step 3: Write `packages/content/src/source.ts`:**

```ts
import {
  type CitedValue,
  collectCitedValues,
  collectRegimeCitedValues,
  type Place,
  placeById,
  placePath,
  type Regime,
} from "@where/data";

export type Source = Place | Regime;

const isRegime = (s: Source): s is Regime => "regimeType" in s;

export function sourceName(s: Source): string {
  return s.name;
}

export function sourceId(s: Source): string {
  return s.id;
}

/** The canonical site path for the source's page. */
export function sourcePath(s: Source): string {
  if (isRegime(s)) {
    const country = placeById(s.countryId);
    if (!country) throw new Error(`regime ${s.id} references unknown countryId "${s.countryId}"`);
    return `/${country.slug}/tax/${s.slug}`;
  }
  return placePath(s);
}

/** Every CitedValue on the source, with its dotted path. */
export function sourceCitedValues(s: Source): { path: string; cited: CitedValue }[] {
  return isRegime(s) ? collectRegimeCitedValues(s) : collectCitedValues(s);
}
```

- [ ] **Step 4: Write `packages/content/src/select.ts`:**

```ts
import type { CitedValue } from "@where/data";
import { type Source, sourceCitedValues } from "./source.js";

const CATEGORY_WEIGHT: Record<string, number> = {
  tax: 5, visa: 5, residency: 5, cost: 3, climate: 2, healthcare: 2, safety: 2, connectivity: 1, identity: 1,
};
const CONFIDENCE_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 };

const weight = (cited: CitedValue): number =>
  (CATEGORY_WEIGHT[cited.category ?? "identity"] ?? 1) * (CONFIDENCE_WEIGHT[cited.confidence] ?? 1);

/**
 * The most surprising, most citeable fact to lead a hook with. Deterministic: highest
 * category-times-confidence weight, ties broken toward the shallowest field path (the headline
 * fact over a nested one), then lexical path order for full determinism.
 */
export function selectHook(s: Source): { path: string; cited: CitedValue } {
  const facts = sourceCitedValues(s);
  if (facts.length === 0) throw new Error(`source ${s.id} has no cited values to project`);
  return [...facts].sort((a, b) => {
    const dw = weight(b.cited) - weight(a.cited);
    if (dw !== 0) return dw;
    const dd = a.path.split(".").length - b.path.split(".").length;
    if (dd !== 0) return dd;
    return a.path.localeCompare(b.path);
  })[0];
}
```

- [ ] **Step 5: Run, verify pass; tsc + biome.** `pnpm --filter @where/content exec vitest run src/__tests__/select.test.ts`, then `pnpm --filter @where/content exec tsc --noEmit` and `pnpm exec biome check packages/content/src`.

- [ ] **Step 6: Commit.**

```bash
git restore --staged .
git add packages/content/src/source.ts packages/content/src/select.ts packages/content/src/__tests__/select.test.ts
git commit -m "feat(content): source helpers + targeting selector"
```

---

### Task 4: Instrumentation (UTM + post id)

**Files:**
- Create: `packages/content/src/instrument.ts`
- Test: `packages/content/src/__tests__/instrument.test.ts`

**Interfaces:**
- Consumes: `Source`, `sourcePath`, `sourceId` (from `./source.js`).
- Produces: `SITE: string`, `postId(s: Source, path: string): string`, `taggedUrl(s: Source, path: string, platform: string): string`.

- [ ] **Step 1: Write the failing test** `packages/content/src/__tests__/instrument.test.ts`:

```ts
import { regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { postId, taggedUrl } from "../instrument.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");

describe("instrumentation", () => {
  it("builds a deterministic post id from id and path", () => {
    expect(postId(regime, "eligibility.knownCatch")).toBe(
      "greece-foreign-pensioner-flat-tax__eligibility-knownCatch",
    );
  });
  it("builds a UTM-tagged canonical url", () => {
    const url = taggedUrl(regime, "headlineRate", "threads");
    expect(url).toContain("https://mysecondcountry.com/greece/tax/foreign-pensioner-flat-tax");
    expect(url).toContain("utm_source=threads");
    expect(url).toContain("utm_medium=social");
    expect(url).toContain("utm_campaign=greece-foreign-pensioner-flat-tax__headlineRate");
  });
});
```

- [ ] **Step 2: Run, verify fail.**

- [ ] **Step 3: Write `packages/content/src/instrument.ts`:**

```ts
import { type Source, sourceId, sourcePath } from "./source.js";

export const SITE = "https://mysecondcountry.com";

/** A stable id tying a post to the exact source fact it projected, for the weekly demand read. */
export function postId(s: Source, path: string): string {
  return `${sourceId(s)}__${path.replace(/\./g, "-")}`;
}

/** The canonical page url with UTM tags so a click-back is attributable in Plausible. */
export function taggedUrl(s: Source, path: string, platform: string): string {
  const u = new URL(`${SITE}${sourcePath(s)}`);
  u.searchParams.set("utm_source", platform);
  u.searchParams.set("utm_medium", "social");
  u.searchParams.set("utm_campaign", postId(s, path));
  return u.toString();
}
```

- [ ] **Step 4: Run, verify pass; tsc + biome.**

- [ ] **Step 5: Commit.**

```bash
git restore --staged .
git add packages/content/src/instrument.ts packages/content/src/__tests__/instrument.test.ts
git commit -m "feat(content): UTM + post-id instrumentation"
```

---

### Task 5: Social post generator

**Files:**
- Create: `packages/content/src/generators/social-post.ts`
- Test: `packages/content/src/__tests__/social-post.test.ts`

**Interfaces:**
- Consumes: `FENCE_PRIMARY` (`@where/data`), `selectHook`, `sourceName`, `taggedUrl`, `postId`.
- Produces: `type Platform = "threads" | "instagram" | "x" | "linkedin"`; `interface SocialPost { platform: Platform; hook: string; body: string; fence: string; url: string; postId: string; hashtags: string[] }`; `socialPost(s: Source, opts: { platform: Platform }): SocialPost`.

- [ ] **Step 1: Write the failing test** `packages/content/src/__tests__/social-post.test.ts`:

```ts
import { FENCE_PRIMARY, regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { socialPost } from "../generators/social-post.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");

describe("socialPost", () => {
  it("carries the verbatim fence", () => {
    expect(socialPost(regime, { platform: "threads" }).fence).toBe(FENCE_PRIMARY);
  });
  it("names the source in the hook", () => {
    const post = socialPost(regime, { platform: "threads" });
    expect(post.hook).toContain("PwC");
    expect(post.hook).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
  it("tags the url for instagram, drops it for x", () => {
    expect(socialPost(regime, { platform: "instagram" }).url).toContain("utm_source=instagram");
    expect(socialPost(regime, { platform: "x" }).url).toBe("");
  });
  it("does not give advice", () => {
    const post = socialPost(regime, { platform: "linkedin" });
    expect(`${post.hook} ${post.body}`.toLowerCase()).not.toMatch(/you should|we recommend|best for you/);
  });
});
```

- [ ] **Step 2: Run, verify fail.**

- [ ] **Step 3: Write `packages/content/src/generators/social-post.ts`:**

```ts
import { FENCE_PRIMARY } from "@where/data";
import { postId, taggedUrl } from "../instrument.js";
import { selectHook } from "../select.js";
import { type Source, sourceName } from "../source.js";

export type Platform = "threads" | "instagram" | "x" | "linkedin";

export interface SocialPost {
  platform: Platform;
  hook: string;
  body: string;
  fence: string;
  url: string;
  postId: string;
  hashtags: string[];
}

// Advice-GIVING phrasing only. The fence legitimately contains "advice", so the word itself is
// not banned; per-user advice phrasing is.
const ADVICE = /\b(you should|we recommend|i recommend|we suggest|i suggest|our advice|best for you|best option)\b/i;

export function socialPost(s: Source, opts: { platform: Platform }): SocialPost {
  const { path, cited } = selectHook(s);
  const hook = `${cited.value} for ${sourceName(s)}, per ${cited.sourceName} (${cited.verifiedDate}).`;
  const body = "Screening data with the source and the date it was verified. The full cited figure is on the page.";
  if (ADVICE.test(`${hook} ${body}`)) throw new Error("social post contains advice-giving language");
  return {
    platform: opts.platform,
    hook,
    body,
    fence: FENCE_PRIMARY,
    url: opts.platform === "x" ? "" : taggedUrl(s, path, opts.platform),
    postId: postId(s, path),
    hashtags: [],
  };
}
```

- [ ] **Step 4: Run, verify pass; tsc + biome.**

- [ ] **Step 5: Commit.**

```bash
git restore --staged .
git add packages/content/src/generators/social-post.ts packages/content/src/__tests__/social-post.test.ts
git commit -m "feat(content): social post generator"
```

---

### Task 6: Rough-card generator (SVG then PNG)

**Files:**
- Create: `packages/content/src/generators/rough-card.ts`
- Test: `packages/content/src/__tests__/rough-card.test.ts`

**Interfaces:**
- Consumes: `FENCE_PRIMARY`, `selectHook`, `sourceName`.
- Produces: `roughCardContent(s: Source): { headline: string; source: string; fence: string }` (pure, assert-able) and `roughCard(s: Source): Promise<Buffer>` (a 1080x1920 PNG rendered from that content).

- [ ] **Step 1: Write the failing test** `packages/content/src/__tests__/rough-card.test.ts`:

```ts
import { FENCE_PRIMARY, regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { roughCard, roughCardContent } from "../generators/rough-card.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");

describe("roughCard", () => {
  it("puts the fact and the verbatim fence in the card content", () => {
    const content = roughCardContent(regime);
    expect(content.fence).toBe(FENCE_PRIMARY);
    expect(content.headline).toContain("Greece");
  });
  it("renders a PNG buffer", async () => {
    const png = await roughCard(regime);
    // PNG magic bytes
    expect(png.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });
});
```

- [ ] **Step 2: Run, verify fail.**

- [ ] **Step 3: Verify the satori + resvg API against the installed versions** (read their READMEs or query context7 for `satori` and `@resvg/resvg-js`). Satori needs a font buffer; bundle one in the repo so the render is deterministic and offline. Then write `packages/content/src/generators/rough-card.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { FENCE_PRIMARY } from "@where/data";
import satori from "satori";
import { selectHook } from "../select.js";
import { type Source, sourceName } from "../source.js";

const FONT = readFileSync(fileURLToPath(new URL("../../assets/Figtree-Regular.ttf", import.meta.url)));

export interface RoughCardContent {
  headline: string;
  source: string;
  fence: string;
}

/** The card's text content. Pure and assert-able, so the fence presence is tested without satori
 * (satori outlines text to vector paths, so the literal string is not in its SVG output). */
export function roughCardContent(s: Source): RoughCardContent {
  const { cited } = selectHook(s);
  return {
    headline: `${cited.value} for ${sourceName(s)}`,
    source: `${cited.sourceName}, verified ${cited.verifiedDate}`,
    fence: FENCE_PRIMARY,
  };
}

export async function roughCard(s: Source): Promise<Buffer> {
  const c = roughCardContent(s);
  const svg = await satori(
    {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column", justifyContent: "space-between", width: "1080px", height: "1920px", padding: "96px", background: "#faf7f2", color: "#1d1b18" },
        children: [
          { type: "div", props: { style: { fontSize: "64px" }, children: c.headline } },
          { type: "div", props: { style: { fontSize: "36px" }, children: c.source } },
          { type: "div", props: { style: { fontSize: "30px" }, children: c.fence } },
        ],
      },
    },
    { width: 1080, height: 1920, fonts: [{ name: "Figtree", data: FONT, weight: 400, style: "normal" }] },
  );
  return Buffer.from(new Resvg(svg).render().asPng());
}
```

Note: `roughCardContent` is the pure, testable text spec and the fence assertion runs against it; `roughCard` renders that content through satori to a PNG, so satori outlining text to paths never breaks the fence test. If the design thread provides a card layout, swap the satori tree but keep the three content nodes. Add `packages/content/assets/Figtree-Regular.ttf` (the OFL font the site already loads); if absent, download the OFL Figtree regular and commit it.

- [ ] **Step 4: Run, verify pass; tsc + biome.** If the PNG test is slow or the font is missing, fix the font path before proceeding.

- [ ] **Step 5: Commit.**

```bash
git restore --staged .
git add packages/content/src/generators/rough-card.ts packages/content/src/__tests__/rough-card.test.ts packages/content/assets/Figtree-Regular.ttf
git commit -m "feat(content): rough-card generator (satori SVG to PNG)"
```

---

### Task 7: Video script generator

**Files:**
- Create: `packages/content/src/generators/video-script.ts`
- Test: `packages/content/src/__tests__/video-script.test.ts`

**Interfaces:**
- Consumes: `FENCE_PRIMARY`, `selectHook`, `sourceName`, `sourceCitedValues`.
- Produces: `interface ScriptBeat { speaker: "James" | "Amanda"; onScreenText: string; voiceover: string }`; `interface VideoScript { title: string; hook: string; beats: ScriptBeat[]; voiceoverFenceSlate: string; caption: string }`; `videoScript(s: Source): VideoScript`.

- [ ] **Step 1: Write the failing test** `packages/content/src/__tests__/video-script.test.ts`:

```ts
import { FENCE_PRIMARY, regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { videoScript } from "../generators/video-script.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");

describe("videoScript", () => {
  const script = videoScript(regime);
  it("ends the caption with the verbatim fence", () => {
    expect(script.caption.endsWith(FENCE_PRIMARY)).toBe(true);
  });
  it("always carries the spoken fence slate", () => {
    expect(script.voiceoverFenceSlate).toContain("not advice");
  });
  it("has two or three beats with alternating speakers", () => {
    expect(script.beats.length).toBeGreaterThanOrEqual(2);
    expect(script.beats.length).toBeLessThanOrEqual(3);
    expect(script.beats[0].speaker).not.toBe(script.beats[1].speaker);
  });
  it("does not give advice", () => {
    const all = [script.hook, ...script.beats.map((b) => b.voiceover)].join(" ").toLowerCase();
    expect(all).not.toMatch(/you should|we recommend|best for you/);
  });
});
```

- [ ] **Step 2: Run, verify fail.**

- [ ] **Step 3: Write `packages/content/src/generators/video-script.ts`:**

```ts
import { FENCE_PRIMARY } from "@where/data";
import { selectHook } from "../select.js";
import { type Source, sourceCitedValues, sourceName } from "../source.js";

export interface ScriptBeat {
  speaker: "James" | "Amanda";
  onScreenText: string;
  voiceover: string;
}

export interface VideoScript {
  title: string;
  hook: string;
  beats: ScriptBeat[];
  voiceoverFenceSlate: string;
  caption: string;
}

const SPEAKERS: ScriptBeat["speaker"][] = ["James", "Amanda"];

export function videoScript(s: Source): VideoScript {
  const facts = sourceCitedValues(s).slice(0, 3);
  const lead = selectHook(s);
  const hook = `${lead.cited.value} for ${sourceName(s)}, and here is the cited source.`;
  const beats: ScriptBeat[] = facts.slice(0, Math.max(2, Math.min(3, facts.length))).map((f, i) => ({
    speaker: SPEAKERS[i % 2],
    onScreenText: `${f.cited.value} (${f.cited.sourceName}, ${f.cited.verifiedDate})`,
    voiceover: `${f.cited.sourceName} reports ${f.cited.value}, verified ${f.cited.verifiedDate}.`,
  }));
  const voiceoverFenceSlate = "This is sourced data, not advice. Verify with a licensed professional before making any decisions.";
  const caption = `${sourceName(s)}, cited and dated. ${FENCE_PRIMARY}`;
  return { title: sourceName(s), hook, beats, voiceoverFenceSlate, caption };
}
```

- [ ] **Step 4: Run, verify pass; tsc + biome.**

- [ ] **Step 5: Commit.**

```bash
git restore --staged .
git add packages/content/src/generators/video-script.ts packages/content/src/__tests__/video-script.test.ts
git commit -m "feat(content): raw-recordable video script generator"
```

---

### Task 8: Newsletter issue generator

**Files:**
- Create: `packages/content/src/generators/newsletter-issue.ts`
- Test: `packages/content/src/__tests__/newsletter-issue.test.ts`

**Interfaces:**
- Consumes: `FENCE_PRIMARY`, `selectHook`, `sourceName`, `sourcePath`.
- Produces: `interface PlaceBlurb { name: string; pagePath: string; fact: string; source: string; verifiedDate: string }`; `interface NewsletterIssue { issueNumber: number; blurbs: PlaceBlurb[]; fenceFooter: string }`; `newsletterIssue(sources: Source[], issueNumber: number): NewsletterIssue`.

- [ ] **Step 1: Write the failing test** `packages/content/src/__tests__/newsletter-issue.test.ts`:

```ts
import { FENCE_PRIMARY, regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { newsletterIssue } from "../generators/newsletter-issue.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");

describe("newsletterIssue", () => {
  const issue = newsletterIssue([regime], 1);
  it("carries the fence in the footer", () => {
    expect(issue.fenceFooter).toBe(FENCE_PRIMARY);
  });
  it("makes one blurb per source with its page path and cited fact", () => {
    expect(issue.blurbs).toHaveLength(1);
    expect(issue.blurbs[0].pagePath).toBe("/greece/tax/foreign-pensioner-flat-tax");
    expect(issue.blurbs[0].source).toContain("PwC");
    expect(issue.blurbs[0].verifiedDate).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
```

- [ ] **Step 2: Run, verify fail.**

- [ ] **Step 3: Write `packages/content/src/generators/newsletter-issue.ts`:**

```ts
import { FENCE_PRIMARY } from "@where/data";
import { selectHook } from "../select.js";
import { type Source, sourceName, sourcePath } from "../source.js";

export interface PlaceBlurb {
  name: string;
  pagePath: string;
  fact: string;
  source: string;
  verifiedDate: string;
}

export interface NewsletterIssue {
  issueNumber: number;
  blurbs: PlaceBlurb[];
  fenceFooter: string;
}

export function newsletterIssue(sources: Source[], issueNumber: number): NewsletterIssue {
  const blurbs: PlaceBlurb[] = sources.map((s) => {
    const { cited } = selectHook(s);
    return {
      name: sourceName(s),
      pagePath: sourcePath(s),
      fact: String(cited.value),
      source: cited.sourceName,
      verifiedDate: cited.verifiedDate,
    };
  });
  return { issueNumber, blurbs, fenceFooter: FENCE_PRIMARY };
}
```

- [ ] **Step 4: Run, verify pass; tsc + biome.**

- [ ] **Step 5: Commit.**

```bash
git restore --staged .
git add packages/content/src/generators/newsletter-issue.ts packages/content/src/__tests__/newsletter-issue.test.ts
git commit -m "feat(content): newsletter issue generator"
```

---

### Task 9: Package index, cross-generator fence guard, and the drafts writer

**Files:**
- Modify: `packages/content/src/index.ts`
- Create: `packages/content/src/write-drafts.ts`
- Test: `packages/content/src/__tests__/fence.test.ts`, `packages/content/src/__tests__/write-drafts.test.ts`

**Interfaces:**
- Consumes: all generators.
- Produces: a barrel `index.ts` exporting every generator + type; `writeDrafts(s: Source, dir: string): Promise<string[]>` writing the social post, card PNG, video script, and a single-source newsletter to `dir`, returning the file paths.

- [ ] **Step 1: Write the cross-generator fence test** `packages/content/src/__tests__/fence.test.ts` (the content-projection.md fence assertion, ported):

```ts
import { FENCE_PRIMARY, regimeById } from "@where/data";
import { describe, expect, it } from "vitest";
import { newsletterIssue, roughCardContent, socialPost, videoScript } from "../index.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");

describe("every generator carries the fence", () => {
  it("social post", () => {
    expect(socialPost(regime, { platform: "threads" }).fence).toBe(FENCE_PRIMARY);
  });
  it("rough card content", () => {
    expect(roughCardContent(regime).fence).toBe(FENCE_PRIMARY);
  });
  it("video script caption", () => {
    expect(videoScript(regime).caption).toContain(FENCE_PRIMARY);
  });
  it("newsletter footer", () => {
    expect(newsletterIssue([regime], 1).fenceFooter).toBe(FENCE_PRIMARY);
  });
});
```

- [ ] **Step 2: Run, verify fail** (the barrel does not export these yet).

- [ ] **Step 3: Replace `packages/content/src/index.ts` with the barrel:**

```ts
export { socialPost, type Platform, type SocialPost } from "./generators/social-post.js";
export { roughCard, roughCardContent, type RoughCardContent } from "./generators/rough-card.js";
export { videoScript, type VideoScript, type ScriptBeat } from "./generators/video-script.js";
export { newsletterIssue, type NewsletterIssue, type PlaceBlurb } from "./generators/newsletter-issue.js";
export { selectHook } from "./select.js";
export { type Source, sourceName, sourcePath, sourceId } from "./source.js";
export { postId, taggedUrl, SITE } from "./instrument.js";
export { writeDrafts } from "./write-drafts.js";
```

- [ ] **Step 4: Write `packages/content/src/write-drafts.ts`:**

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { newsletterIssue } from "./generators/newsletter-issue.js";
import { roughCard } from "./generators/rough-card.js";
import { socialPost } from "./generators/social-post.js";
import { videoScript } from "./generators/video-script.js";
import { type Source, sourceId } from "./source.js";

/** Run every generator for one source and write the draft artifacts to `dir`. Manual posting reads these. */
export async function writeDrafts(s: Source, dir: string): Promise<string[]> {
  await mkdir(dir, { recursive: true });
  const id = sourceId(s);
  const paths: string[] = [];
  const social = join(dir, `${id}.social.json`);
  await writeFile(social, JSON.stringify(socialPost(s, { platform: "threads" }), null, 2));
  paths.push(social);
  const script = join(dir, `${id}.script.json`);
  await writeFile(script, JSON.stringify(videoScript(s), null, 2));
  paths.push(script);
  const news = join(dir, `${id}.newsletter.json`);
  await writeFile(news, JSON.stringify(newsletterIssue([s], 1), null, 2));
  paths.push(news);
  const card = join(dir, `${id}.card.png`);
  await writeFile(card, await roughCard(s));
  paths.push(card);
  return paths;
}
```

- [ ] **Step 5: Write `packages/content/src/__tests__/write-drafts.test.ts`** (writes to a temp dir, asserts four files, then cleans up):

```ts
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { regimeById } from "@where/data";
import { afterAll, describe, expect, it } from "vitest";
import { writeDrafts } from "../write-drafts.js";

const regime = regimeById("greece-foreign-pensioner-flat-tax");
if (!regime) throw new Error("regime fixture missing");
const dir = mkdtempSync(join(tmpdir(), "content-drafts-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("writeDrafts", () => {
  it("writes social, script, newsletter, and card artifacts", async () => {
    const paths = await writeDrafts(regime, dir);
    expect(paths).toHaveLength(4);
    const files = readdirSync(dir);
    expect(files.some((f) => f.endsWith(".card.png"))).toBe(true);
    expect(files.some((f) => f.endsWith(".social.json"))).toBe(true);
  });
});
```

- [ ] **Step 6: Add the output dir to gitignore.** Append `packages/content/output/` to `.gitignore` only if a build writes there; the tests use a temp dir, so this is optional. Remove the smoke test (`packages/content/src/__tests__/smoke.test.ts`) and the `CONTENT_PACKAGE` export now that real exports exist.

- [ ] **Step 7: Run the full package + workspace gates.** `pnpm --filter @where/content test` (all pass), `pnpm -r test` (data + engine + web + content all green), `pnpm exec tsc --noEmit -p tsconfig.json`, `pnpm exec biome check packages/content packages/data`.

- [ ] **Step 8: Commit.**

```bash
git restore --staged .
git add packages/content/src/index.ts packages/content/src/write-drafts.ts packages/content/src/__tests__/fence.test.ts packages/content/src/__tests__/write-drafts.test.ts
git rm packages/content/src/__tests__/smoke.test.ts
git commit -m "feat(content): package barrel, cross-generator fence guard, drafts writer"
```

---

## Self-review notes

- Spec coverage: the projection layer (spec section 4 generators 1 to 4 minus the Resend send), targeting (5), the fence discipline + tests (6), instrumentation (7). Email capture + the Resend send + the Vercel adapter (spec sections 4.5, 8) are the deferred Plan B, called out in the scope boundary.
- The fence is lifted to `@where/data` (Task 1) so content imports one source; the live web text is unchanged (re-export).
- The no-advice guard targets advice-giving phrasing, not the word "advice" (the fence contains it). This is a deliberate correction of the content-projection.md wording.
- Determinism: every generator is pure; the newsletter issue number and any date come in as parameters; the card font is bundled, not fetched.
- Parallel-thread safety: every commit runs `git restore --staged .` first and stages explicit paths, because the design thread is mutating `packages/web`. Only Task 1 touches web (a one-line re-export of `fence.ts`, which the design thread is not modifying); coordinate if that file is in flight.
- Open risk carried to build: the satori + resvg API and the bundled font path need confirming against the installed versions in Task 6.
