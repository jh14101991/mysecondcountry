# SHIP.md

## What counts as a ship

A ship is a real market exposure: a published page live on the domain, a posted short-form clip, a sent newsletter issue, a live Stripe fake-door with a checkout URL you could share. Building, refining code, writing internal docs, and opening PRs are not ships. A week that produces more process docs than market touches is a debt week. If that happens, the next available block goes entirely to shipping before any new build work begins.

## Weekly ship floor

Minimum three market exposures per week once v1 is live. Any combination counts: published Place pages, posted Reels or TikToks, a newsletter issue, a fake-door CTA going live. Below three in a rolling seven-day window is a signal to stop building and ship something, even if it is imperfect.

## Bootstrap-first rule

One real Greek town page ships to production before any breadth work begins. Not a localhost preview, not a staging URL, not a Vercel preview deployment: the canonical `mysecondcountry.com` domain, indexed, with a live `<link rel="canonical">` and a cited Place object in the dataset. That page is the proof that the full pipeline works end to end. Everything else waits until that page is live.

## The v1 finish line

The definition of done for v1 is in DEFINITION_OF_DONE.md. Read it before marking any sprint complete. SHIP.md is not the finish-line document; it is the discipline that gets you there.

## Kill/continue gate

Judge the project on a trend signal at month 9 to 12, not on month-6 revenue. The three signals to watch:

1. Organic and AEO traffic is compounding week over week (Plausible + AI-crawler logs).
2. At least one short-form hook has broken out of the founder's own audience (views, shares, saves).
3. The Stripe fake-door shows paid intent: clicks on the checkout link, even with zero completions.

Kill or rework the model if, after a fair window with real posting volume, none of the three signals are moving. A "fair window" means at least 20 published Place pages, 30 posted clips, and 4 newsletter issues. Do not kill on month-3 stasis if the posting volume has not been reached.

## Batch rule for founder-touch surfaces

The founder has near-zero energy for daily manual rituals. Every surface that requires founder input runs on a batch cadence, not a daily one:

- Video recording: one dedicated recording block per week, batch-record multiple clips.
- PR merges for dataset refreshes: review and merge once per week, not on push.
- Newsletter sends: one issue per week, drafted by the content pipeline, reviewed and sent in a single sitting.

No surface should require the founder to open a laptop daily to keep it alive. If a new surface would require that, do not build it until the batch pattern is designed first.

## Remotion license trip-wire

Remotion is free for organisations of three or fewer people. At employee or contractor number four it becomes a paid per-seat license. Before bringing on any fourth person who touches the video pipeline, check the current Remotion license page and confirm the cost. Add a calendar reminder for the month you expect to cross that threshold. Do not let it be a surprise.
