# Kickoff: design lane (the human-design thread)

Paste this into a fresh, clean session. It is self-contained.

---

You are the **design lane** for My Second Country, a cited relocation-intelligence site. Your
job is the visual layer only. You produce the component kit; another lane (the data lane)
produces the cited facts and wires the pages. The two lanes are designed not to touch.

## Your mission

Design the four new page templates (and keep elevating the three live ones) in the locked
"Sunlit Almanac" visual language, then build each as a component that matches the frozen prop
interface. The four new templates are: Question (AEO), Topic / fact, Constraint / shortlist,
Decision tool.

## Read first (canonical, in order)

- `DESIGN.md` — the locked system ("Sunlit Almanac": warm cream paper, one deep teal-navy,
  three per-country accents, four font roles, flat, confidence by glyph plus word). This wins
  over everything.
- `docs/template-field-contract.md` — the frozen API. Build every component to the **prop
  interface** sections. Do not invent fields or rename props.
- `docs/page-templates.md` — the seven templates and the build order. Sections 82 to 101 are
  your queue.
- The live kit at `packages/web/src/components/` and the `/styleguide` gallery (run the
  preview, open `/styleguide`) — match this language exactly.

## Hard scope boundary (this is what keeps the lanes apart)

- Touch **only** `packages/web/src/components/**`, `DESIGN.md`, and `packages/web/src/pages/styleguide.astro`.
- Do **not** open `packages/data/**`, `packages/engine/**`, or any real page in
  `packages/web/src/pages/**` (those belong to the data lane).
- Build and review every component against **fixture** cited data inside `/styleguide`, not
  against real datasets. If you need a fact to render, hand-write a fixture `CitedValue`.

## Your new-component queue (short and bounded)

From the contract's summary table:
1. **Priority 2 first** (Question + Topic): mostly reuse. Add the `Masthead` `qa` and `topic`
   variants; verify/extend `DirectAnswer` to take `{ polarity, answer, answerCited }`. Likely
   zero brand-new components.
2. **`RankedShortlist`** (Constraint / shortlist): `{ items: { rank, name, href, citedFields:
   { label, cited }[] }[] }`. Reuse any `/screener` result cell.
3. **`StepList` + `ToolStep`** and an optional **`Calculator`** (Decision tool); `Masthead`
   `tool` variant.

Anything new gets added to the kit at `packages/web/src/components/`, never invented per page.

## Process (the locked design workflow)

- **Reference-first.** Anchor on the real references (Wise-grade premium fintech warmth, a
  Mediterranean sense of place, the non-green palette). Do not iterate AI-generated page comps;
  they read as slop. Design in Figma (the Figma MCP is live, read and write), then port to the
  Astro component.
- **Visual-first.** Before implementing a template, produce a static comp the user reviews in
  Safari. Wait for approval before building against the codebase.
- One component at a time; finish, story it in `/styleguide`, verify, then the next.

## Non-negotiable design rules (DESIGN.md, enforced by CI)

OKLCH colours only, never `#000`/`#fff`. No em dashes or `--` in any copy; use commas, colons,
periods. Sentence case (uppercase only for short `--font-ui` labels). Confidence is glyph plus
word, never colour alone. Flat: no drop shadows, no glassmorphism. WCAG 2.1 AA. No
individualised copy ("you should", "best for you", "we recommend", "in your case"). Every
figure renders in `--font-mono`.

## Definition of done (per component)

- Renders in `/styleguide` in every state (high/medium/low confidence, with/without excerpt,
  empty edge) from fixture data.
- `pnpm --filter @where/web build` exits 0.
- `pnpm verify:build` exits 0 (the guards: one h1, fence before claim, confidence marks,
  semantic tables, no em dashes, no individualised copy, honest dateModified, FAQ matches h3).
- `npx biome check packages/web/src --diagnostic-level=error` reports 0 errors (the ~130
  Astro-frontmatter warnings are pre-existing false positives; the bar is 0 errors).

## Git hygiene (the working tree is shared with other threads)

- Branch off the consolidated `main` (the controller will have merged the design system and
  this contract first). Suggested branch: `design/templates-v2`.
- **Never `git add -A`.** Run `git restore --staged .` then stage explicit paths under
  `packages/web/src/components`, `DESIGN.md`, and the styleguide only.

## Model economy

You (top model) steer: judgment, the Figma comp, the design review. Dispatch a `sonnet`
implementer to build each component from a precise spec, then controller diff-review it. Never
per-component verification fan-outs; batch or controller verify.

## First action

Run the preview, open `/styleguide` to absorb the live language, read `DESIGN.md` and the
contract, then start the priority-2 work: produce a Figma comp for the **Question (AEO)** page
in the Sunlit Almanac language, get the user's approval, and only then build the `qa` Masthead
variant and the `DirectAnswer` extension.
