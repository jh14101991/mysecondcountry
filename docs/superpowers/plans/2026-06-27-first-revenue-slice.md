# First revenue slice implementation plan (Portugal IFICI: email capture + concierge intro block)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put an email capture and a concierge "request a vetted introduction" block on the Portugal
IFICI / NHR pages, so the site can build an owned audience now and broker its first paid referral the
day an adviser is secured.

**Architecture:** The site stays static (Astro `output: static`, no Vercel adapter, no serverless,
per ADR-0013). Both new surfaces use hosted form providers via an embed, so there is no backend to
build. Email capture uses one provider (a list tool); the intro request uses a form tool that emails
the founder. Both are new Astro components styled to the existing design system. The intro block is
gated behind an `INTRO_LIVE` flag and a corridor allow-list, so it is built and reviewable now but
shows to readers only when flipped on, which happens once a Lisbon adviser has agreed.

**Tech Stack:** Astro (static), the existing component kit and design tokens, a hosted email-list
provider (recommend MailerLite, free tier) and a hosted form provider (recommend Tally, free tier).
No new runtime dependency in the repo; providers are loaded by embed or by posting to their endpoint.

## Global Constraints

- The fence (ADR-0008, FENCE.md): screening intelligence, never advice. The intro block routes to a
  professional and never gives a personal verdict. It carries a visible paid-relationship disclosure
  ("we may earn a fee from an introduction") and the framing "a professional we have vetted, not
  advice; confirm everything with them."
- Copy rules: no em dashes anywhere; sentence case; conservative and plain; none of the AI-register
  words (leverage, elevate, transform, empower, streamline, harness, unlock, seamless, robust).
- Design system: new components follow `DESIGN.md` tokens and match the live kit; the site must stay
  green on `pnpm --filter @where/web build`, `pnpm verify:build` (fence, a11y, one-h1, no-em-dash,
  table-semantics, confidence-marks, robots, jsonld, date-modified, faq), and `pnpm exec biome check`.
- Static only: do NOT add `@astrojs/vercel` or any serverless function in this slice. If a self-hosted
  form is ever needed, that is a separate later phase with its own plan.
- Visual-first protocol: a static HTML mockup is produced and the user approves it BEFORE any
  component implementation code is written.
- The intro block does not show to readers until `INTRO_LIVE` is set true, which is gated on a secured,
  vetted adviser (see the ops track at the end).
- Git hygiene: branch off `main` (suggested `feat/first-revenue-slice`); stage explicit paths; never
  `git add -A`; the working tree is shared, so `git restore --staged .` before staging.

## File structure

- `packages/web/src/lib/monetisation.ts` (create): the small config: provider IDs/URLs, the
  `INTRO_LIVE` boolean, and `INTRO_CORRIDOR` (the set of page slugs/ids where the intro block may
  appear, initially the Portugal IFICI corridor). One responsibility: monetisation wiring config.
- `packages/web/src/components/EmailCapture.astro` (create): the email-capture block (provider embed
  or styled form posting to the provider), one responsibility: capture an email.
- `packages/web/src/components/IntroRequest.astro` (create): the intro block (form provider embed or
  styled form), the disclosure and framing, prefilled corridor context. One responsibility: request a
  vetted introduction.
- `packages/web/public/mockups/monetisation-blocks.html` (create, Task 1): the static review mockup.
- Wiring (modify): `packages/web/src/pages/[country]/tax/[slug].astro`,
  `packages/web/src/pages/answers/[slug].astro`, `packages/web/src/pages/topics/[slug].astro` to
  render `EmailCapture` on high-intent pages and `IntroRequest` where the page is in `INTRO_CORRIDOR`.

Note on TDD shape: these are presentational Astro components integrating third-party embeds; the
project has no unit-test layer for web components (data/engine use vitest; web is verified by the
build plus the `verify:build` guards plus a visual screenshot). So each web task's "test" is: build
green, guards green, and a preview screenshot. That is the real verification cycle here; do not invent
unit tests for an embed.

---

### Task 1: Choose providers and get the mockup approved (gate)

**Files:**
- Create: `packages/web/public/mockups/monetisation-blocks.html`

- [ ] **Step 1: Confirm the two providers with the user.** Recommend MailerLite (free, gives the list
  and a newsletter for later) for email capture, and Tally (free, emails the founder on submit, can
  add a webhook later) for the intro request. If the user prefers Buttondown / ConvertKit / Formspree,
  use those; the component shape is identical. Record the choice in this task before mocking.

- [ ] **Step 2: Build the static mockup** at `packages/web/public/mockups/monetisation-blocks.html`,
  reusing the site's tokens (copy the `:root` variables and the relevant component CSS from
  `Base.astro` and the kit so it looks native). Show, in the context of a mock Portugal IFICI page:
  (a) the email-capture block with the framing "Get told when these rules change" and one email field;
  (b) the intro-request block with: a one-line "what this is", the fence disclosure ("we may earn a
  fee from an introduction"), the framing "a professional we have vetted, not advice; confirm
  everything with them", the corridor shown (Portugal IFICI), and the reader fields (their situation
  in a sentence, prior tax residency yes/no, rough timeline). No em dashes. Sentence case.

- [ ] **Step 3: User reviews in Safari and approves or requests changes.** Do not proceed to Task 2
  until approved. Iterate the mockup on feedback.

- [ ] **Step 4: Commit the mockup.**

```bash
git restore --staged .
git add packages/web/public/mockups/monetisation-blocks.html
git commit -m "mockup(web): email capture + intro request blocks for review"
```

---

### Task 2: Monetisation config + email capture component, wired on high-intent pages

**Files:**
- Create: `packages/web/src/lib/monetisation.ts`, `packages/web/src/components/EmailCapture.astro`
- Modify: `packages/web/src/pages/[country]/tax/[slug].astro`,
  `packages/web/src/pages/answers/[slug].astro`, `packages/web/src/pages/topics/[slug].astro`

**Interfaces:**
- Produces: `EMAIL_PROVIDER` (the embed URL or form action + the list id), `INTRO_LIVE: boolean`,
  `INTRO_CORRIDOR: Set<string>` (ids/slugs), from `monetisation.ts`; an `EmailCapture` component with
  no required props (reads config).

- [ ] **Step 1: Write `packages/web/src/lib/monetisation.ts`** with the confirmed provider values and
  the flags. Use the real provider id from Task 1; keep secrets out (form ids are public embed ids,
  which is fine):

```ts
// Monetisation wiring (static site: hosted providers, no backend). ADR-0013.
export const EMAIL_FORM_ACTION = "https://assets.mailerlite.com/jsonp/REPLACE/subscribe"; // from Task 1
export const INTRO_FORM_URL = "https://tally.so/r/REPLACE"; // from Task 1, emails the founder

// The intro block ships now but shows to readers only when an adviser is secured.
export const INTRO_LIVE = false;

// The corridor the intro block may appear on (Portugal IFICI), by collection id.
export const INTRO_CORRIDOR = new Set<string>([
  "portugal-ifici", // regime
  "is-portugals-nhr-tax-regime-still-available", // qa
  "portugal-ifici-the-nhr-successor", // topic
]);
```

- [ ] **Step 2: Write `EmailCapture.astro`** as a styled block matching the kit (border, radius,
  serif body, the `--font-*` and color tokens), a single email input and a submit, posting to
  `EMAIL_FORM_ACTION` (or the provider's embed). Heading "Get told when these rules change." One short
  sentence of body. No em dashes. Mark up accessibly (label for the input, a real `<button>`).

- [ ] **Step 3: Wire `EmailCapture`** near the foot of the article on the three high-intent templates
  (regime, qa, topic), above the existing "How to read this page" block. Import it and place
  `<EmailCapture />`.

- [ ] **Step 4: Build and verify.**

Run: `pnpm --filter @where/web build` (expected: exit 0) then `pnpm verify:build` (expected: exit 0,
all guards green, including a11y and no-em-dash) and `pnpm exec biome check packages/web/src`
(expected: clean).

- [ ] **Step 5: Screenshot the rendered block** on a built page (preview the dist output) to confirm
  it looks native and the copy is right.

- [ ] **Step 6: Commit.**

```bash
git restore --staged .
git add packages/web/src/lib/monetisation.ts packages/web/src/components/EmailCapture.astro \
  "packages/web/src/pages/[country]/tax/[slug].astro" "packages/web/src/pages/answers/[slug].astro" \
  "packages/web/src/pages/topics/[slug].astro"
git commit -m "feat(web): email capture on high-intent pages (static, hosted list)"
```

---

### Task 3: Intro-request block (built, gated off)

**Files:**
- Create: `packages/web/src/components/IntroRequest.astro`
- Modify: the same three page templates as Task 2

**Interfaces:**
- Consumes: `INTRO_LIVE`, `INTRO_CORRIDOR`, `INTRO_FORM_URL` from `monetisation.ts`.
- Produces: an `IntroRequest` component taking `{ corridorLabel: string; pageId: string }`.

- [ ] **Step 1: Write `IntroRequest.astro`.** A styled block matching the kit, containing: a heading
  ("Talk to a vetted professional about this"), one sentence of what it is, the **disclosure** line
  ("We may earn a fee if you proceed with an introduction.") and the **fence framing** ("This is a
  professional we have vetted, not advice. Confirm everything with them."), the corridor shown from
  `corridorLabel`, and the reader fields posting to `INTRO_FORM_URL` (situation sentence, prior tax
  residency, timeline) plus a hidden field carrying `pageId` so the founder knows which page it came
  from. No em dashes. Accessible labels. The component renders nothing unless shown by the page (the
  page gates it), but as a safety net it also returns null if `INTRO_LIVE` is false.

- [ ] **Step 2: Wire it** on the three templates: render `<IntroRequest .../>` only when
  `INTRO_LIVE && INTRO_CORRIDOR.has(<this page's id>)`, placed just after the dealbreaker/answer
  section (the anxiety peak), before `CiteThis`. Pass `corridorLabel="Portugal IFICI"` and the page id.

- [ ] **Step 3: Build and verify with the block temporarily visible.** Temporarily set `INTRO_LIVE =
  true` locally, run `pnpm --filter @where/web build` and `pnpm verify:build` (expected: exit 0; the
  fence and a11y and no-em-dash guards must pass with the block present), screenshot the block on the
  built IFICI page, then set `INTRO_LIVE = false` again before committing.

- [ ] **Step 4: Commit (with `INTRO_LIVE = false`).**

```bash
git restore --staged .
git add packages/web/src/components/IntroRequest.astro packages/web/src/lib/monetisation.ts \
  "packages/web/src/pages/[country]/tax/[slug].astro" "packages/web/src/pages/answers/[slug].astro" \
  "packages/web/src/pages/topics/[slug].astro"
git commit -m "feat(web): concierge intro-request block, gated off until an adviser is secured"
```

---

### Task 4: Flip the intro block live (gated on the ops track)

Do this ONLY after a Lisbon adviser has agreed (ops track below). One-line change.

- [ ] **Step 1:** set `INTRO_LIVE = true` in `monetisation.ts`.
- [ ] **Step 2:** `pnpm --filter @where/web build` and `pnpm verify:build` (expected: exit 0), confirm
  the block now renders on the three IFICI pages, screenshot.
- [ ] **Step 3:** commit `feat(web): intro block live for the Portugal IFICI corridor` and deploy
  (push to main; IndexNow pings automatically).

---

## Ops track (parallel, founder-run, not code)

This runs alongside the build and is where most of the 30 hours go. It is not part of the coded tasks,
but the slice is not "done" until it happens.

**Lane 5, start now (do not wait on anything):**
- Build the stale-thread hit list: search the queries the IFICI pages target ("is NHR still available
  2026", "Portugal NHR replacement", "IFICI eligibility") and list the Reddit, Quora, and forum
  threads whose top answer predates the 2024 NHR closure.
- For each, post one genuinely useful, dated correction with the cited source and a single link back,
  ninety percent help. Track which threads send visits (watch referrers).

**Sourcing sprint, ~2 weeks:**
- Find candidates: the Lisbon cross-border tax advisers and UK-Portugal pension specialists who
  already publish on IFICI (they wrote the posts ranking for it). Vet by reading their published work.
- Outreach: a short, plain message offering pre-screened, fenced introductions, non-exclusive, with
  the first month free to prove lead quality.
- Vet before routing anyone: credentials, a reference, and a two or three intro trial with reader
  feedback. Do not flip Task 4 live until one adviser passes.

---

## Self-review

- Spec coverage: this slice implements the spec's section 10 (first executable slice) and the resolved
  decisions in section 11 (Portugal IFICI corridor; sourcing sprint; the intro block gated until an
  adviser is secured). Lanes 2/3/4 and corridor widening are explicitly out of scope (later phases).
- Placeholder scan: the only placeholders are the provider ids (`REPLACE`), which are real values the
  user supplies in Task 1; every other step has concrete content.
- Type consistency: `INTRO_LIVE`, `INTRO_CORRIDOR`, `EMAIL_FORM_ACTION`, `INTRO_FORM_URL` are defined
  in `monetisation.ts` (Task 2) and consumed by name in Task 3.
- Fence: the disclosure and framing are required content in Task 1's mockup and Task 3's component, and
  the existing fence/a11y/no-em-dash guards gate every build step.
