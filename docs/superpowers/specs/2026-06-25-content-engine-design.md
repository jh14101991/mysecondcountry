# Content engine: the cited projection layer

**Status:** Design, pre-build. Builds on `docs/superpowers/specs/2026-06-24-v1-design.md` (section 5.5),
`docs/content-projection.md` (the channel projection contracts), `STRATEGY.md`, `docs/page-roadmap.md`,
and `docs/page-templates.md`. No ADR is superseded.
**Decision frame (2026-06-25):** the founder chose to build the content engine this week, fully wired,
after a red-team on the build-versus-ship tension. The principle that scopes it: build the part that is
certain (the data-to-text projection layer), defer the part that encodes an unvalidated bet (the video
production studio), because build speed does not convert "what format pulls" into a known. Short-form
video is the demand sensor, so the sensor stays cheap until the cheap shots vote.

---

## 1. Goal

Turn the one cited dataset into many market touches per week with batched human effort. The dataset is the
asset; this layer is its projection into social posts, rough cards, raw-recordable video scripts, and an
owned newsletter. The week's scorecard is market touches out the door, not features finished.

## 2. Scope

**In, built fully:**
- A new `packages/content` package, the planned fourth workspace package.
- Generators that project a Place or Regime into: a social post, a rough card image, a video script, and a
  newsletter issue.
- Email capture on the live site, collecting from day one. This adopts the `@astrojs/vercel` adapter
  and ships the first Vercel Function, so the site becomes hybrid: every existing page stays
  prerendered, only the capture route is server-rendered. It pulls the Phase C serverless
  infrastructure forward, which is the consequence of choosing to wire capture now.
- The newsletter send wired through Resend.

**Deferred (a deliberate bet held, not a gap):**
- The Remotion render studio (auto-compositions, b-roll, word-level captions, the polished edit). The cheap
  shots come first and tell us which studio to build.
- Affiliate links (Phase C, turn on only with an approved program and the trust pages live).
- The Stripe paid-dossier fake-door (separate decision).

## 3. Architecture: one dataset, many projections

`packages/content` follows the same projection pattern as the web layer. Each generator is a pure,
deterministic function: a Place or Regime plus a small config in, a typed artifact out. The package depends
on `@where/data` (the source of truth) and `@where/engine` (for the surprise and freshness signals). It
never writes a database. Posting is manual: generators write draft artifacts to an output folder; a human
posts them. This is the maintenance-free shape (FOUNDER.md): the engine generates, the founder does not
hand-make each output.

The generator field contracts in `docs/content-projection.md` (SocialPost, VideoScript, NewsletterIssue)
are the starting point. This spec reconciles them with the shipped state: the data layer now carries both
`Place` and `Regime` objects, so every generator accepts either, projecting regime-first for the build-now
tranche.

## 4. The generators

Each is a single file in `packages/content/src/generators/`, one responsibility, unit-tested in isolation.

1. **`socialPost(input, { platform })` → `SocialPost`.** Platforms: `threads`, `instagram`, `x`, `linkedin`.
   The hook names the source inline ("per [sourceName] ([verifiedDate])"). Carries body, the fence string,
   the source URLs, and hashtags from the source tags. X is handled link-free to dodge the per-link cost.
   A string guard throws if "advice", "recommend", or "suggest" appears in the output.
2. **`roughCard(input)` → a 1080x1920 PNG via Satori.** One cited fact with the fence visible. The cheapest
   visual shot. Its layout adopts the design system the parallel design thread is building (see section 9);
   it ships with a simple cited-fact layout and takes the tokens when they land.
3. **`videoScript(input, { hookStyle })` → `VideoScript`.** Raw-recordable: a hook, two or three beats, the
   voiceover, the on-screen text, and the spoken fence slate. Designed to be filmed in one take with no
   editing, so it does not presuppose the deferred studio. Speaker labels alternate the two faces as
   relocators, never advisers.
4. **`newsletterIssue(inputs[])` → `NewsletterIssue`.** Only sources with a CitedValue updated inside the
   freshness window appear. Each blurb states what changed and links to the full page. The fence is in the
   footer. The issue is sent through Resend.
5. **Email capture.** A form on the live site posts to a Vercel Function that adds the subscriber to a
   Resend Audience with double opt-in. The owned list lives in Resend, not a repo file. This route is the
   one server-rendered surface (see section 8); every other page stays prerendered.

## 5. Targeting: aim at the roadmap, not at random

A small selector chooses what to project. It runs over the build-now tranche first (the 15 pages in
`docs/page-roadmap.md`), regime-first then place, and within a source picks the highest-surprise,
highest-AEO cited fact, reusing the confidence and freshness weighting already in `docs/engine-weights.md`.
The freshness and dealbreaker facts (the 7 percent rate, the disqualifiers, the changed thresholds) are the
strongest hooks, so they surface first. This keeps the content engine pointed at the pages we are actually
building, not at generic topics.

## 6. The fence and the no-advice discipline (enforced in tests)

Every artifact carries the canonical fence string, imported, never copied. The string lives in one place
that both `packages/web` and `packages/content` can import; lifting the existing constant into a shared
package (`@where/data` is the natural home as the shared dependency) is a small in-scope refactor, with
`packages/web` re-importing it so the live fence text does not change. A Vitest test asserts that every
generator's output for a fixture source contains the fence string; a failure blocks the build and the cron
PR. The no-advice string guard (no "advice", "recommend", "suggest") is a second test. This is the same
mechanical fence the rest of the system uses, extended to the new outputs.

## 7. Instrumentation: the demand sensor reads off-platform

The real signal (views, shares, saves) lives on the platforms, not on the site. So every artifact carries a
UTM tag and a stable post id, and the selector records which source and fact each post projected. When a
post drives a click back to the site, Plausible attributes it (the `source_link_click` and existing event
taxonomy in `docs/analytics.md`). The post id lets a weekly read tie platform engagement to the source
fact, so the winners are obvious and the next depth is demand-led.

## 8. Email capture and the newsletter (fully wired)

Email capture is wired now because the owned list only compounds if it collects from day one. The newsletter
send is wired through Resend, but going live needs Resend domain auth (SPF, DKIM, DMARC plus domain
verification), which is a human gate with DNS propagation latency (definition of done item i). That auth
starts in parallel at build time so it is propagated by the time the code lands. A newsletter send is not a
week-one market touch, because the list starts at zero; the first touches are the cheap shots, and the send
machine is ready for when there is an audience.

## 9. Human gates, all batched

No surface requires the founder daily. Video recording is one weekly block that feeds weeks of clips.
Newsletter review and send is one weekly sitting. Posting is manual but batched from the generated drafts.
The rough-card visual depends on the parallel design thread's system; it is a soft dependency, not a
blocker, since the card ships with a simple layout and adopts the tokens when ready.

## 10. Testing

- Fence test: every generator's output contains the canonical fence string (fixture source).
- No-advice guard: the social and script generators throw on "advice", "recommend", "suggest".
- Generator unit tests: deterministic output shape per generator, real behaviour not mocks.
- Email-capture endpoint test: appends to the log and returns ok without throwing.
- The package joins the existing `pnpm test`, `tsc --noEmit`, and Biome gates.

## 11. Dependencies and risks

- **Vercel adapter and the first function.** Email capture requires adopting `@astrojs/vercel` and shipping
  a server-rendered capture route, moving the site from pure static to hybrid (every existing page stays
  prerendered via `prerender = true`). This pulls the Phase C serverless infrastructure forward, the
  consequence of wiring capture now (ADR-0013 anticipated the adapter as a one-line change). The Vercel
  build command and the verify gates stay green; the deploy target gains one function.
- **Fence location refactor.** The canonical fence constant currently lives in `packages/web`. Lifting it to
  the shared package is required so `packages/content` can import it without a web dependency. Small,
  in-scope, and the live text stays identical.
- **Rough-card visual.** Soft dependency on the design thread. Mitigated by a simple default layout.
- **Resend domain auth.** A human DNS gate with propagation latency. Mitigated by starting it in parallel.
- **The build-versus-ship trap.** Building generators is the founder's highest-energy zone and could become
  avoidance. Mitigated by the rule that the week's scorecard is posts out the door, and the engine counts as
  distribution only if it ends the week posting.

## 12. Open questions deferred to build

- The exact Satori card template and whether it reads design tokens from a shared file or inlines them.
- The newsletter cadence trigger (a fixed weekly slot versus a freshness threshold).
- Whether the X link-free constraint needs a separate copy variant or just drops the URL from the standard
  social post.

---

*Next per the workflow: review this spec, then a separate implementation plan is written from it with
`superpowers:writing-plans`, then execution.*
