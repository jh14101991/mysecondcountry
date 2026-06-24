# docs/content-projection.md

## Content projection: Place to channel

Every piece of public content derives from a `Place` object in `packages/data`. Nothing is written freehand. The pipeline reads a `Place`, pulls its `CitedValue` fields, and renders into one or more channel outputs. This file defines the projection contract for each channel, the fence rule, fence test assertion, and the 6-week seed calendar.

---

## The fence rule

Every output MUST contain the liability fence string verbatim. The canonical fence string is defined once in `packages/engine/src/fence.ts` and imported by every renderer:

```
Sourced data only. Not legal, tax, visa, or financial advice. Verify all claims with a licensed professional and the official source before making any decision.
```

A Vitest test in `packages/engine/src/__tests__/fence.test.ts` asserts that the fence string is present in the output of every channel renderer: `generatePage`, `generateVideoScript`, `generateSocialPost`, `generateNewsletterBlurb`. If any renderer omits the fence, the test suite fails and the GitHub Actions cron will not open a PR.

The on-camera couple are "relocators sharing sourced data." They do not give advice. The script template enforces this in the voiceover beat and the caption field.

---

## Channel projection contracts

### 1. Programmatic page (`packages/web/src/pages/[...slug].astro`)

Input: one `Place` object.

Output fields rendered:

| CitedValue field | Rendered as |
|---|---|
| `costOfLiving.monthly.singlePerson` | Card: "Monthly budget estimate" with source link + verifiedDate |
| `tax.incomeTaxRate` | Card: "Income tax (non-dom/standard)" with confidence badge |
| `visa.d7.monthlyIncomeRequirement` | Card: "D7 / passive income visa threshold" |
| `climate.sunHoursAnnual` | Card: "Annual sun hours" |
| `climate.winterLowCelsius` | Card: "Winter low (°C)" |
| `internet.medianDownloadMbps` | Card: "Median download speed" |
| `healthcare.publicCoverageForResidents` | Card: boolean + source |
| Any field with `confidence < 0.7` | Rendered with a yellow "low confidence" badge |
| Every card footer | Source name as hyperlink + "Verified [verifiedDate]" |

The page template includes the fence in a `<aside role="note">` block above the fold and again in the `<footer>`. No card omits its `sourceUrl`. The Astro island for screening (`packages/engine`) is client-load-only; it never writes to a database.

Full cited data table format: each row is one `CitedValue`, columns are Value, Source, Verified, Confidence. Rendered as a `<table>` with a caption linking to `FENCE.md` for the legal statement.

### 2. Video script (`packages/content/src/generators/videoScript.ts`)

Input: one `Place` object plus a `VideoScriptConfig` (duration target in seconds, presenter names, hook style).

Output: a structured object `VideoScript` with these fields:

```ts
{
  placeSlug: string, title: string, // 60 chars max, sentence case
  hook: string, // 1 cited surprising fact, ≤ 25 words
  beats: ScriptBeat[], // 2-3 beats
  caption: string, // includes fence string + source URLs
  voiceoverFenceSlate: string, // read aloud at the end
  citedFacts: CitedValue[],
}
```

Beat structure:

```ts
{
  beatIndex: number, speakerNote: string, // e.g. "James on camera, cite the figure"
  citedFact: CitedValue, onScreenText: string, // the cited value formatted for a lower-third
  voiceover: string, // 1-3 sentences, plain English, no jargon
}
```

Rules:

- The hook uses the single most surprising `CitedValue` by `confidence` weighted against `granularity` (town-level preferred over country-level for the hook).
- Beats 1 to 3 cover cost, residency/visa, and climate in that order unless the `Place` has no visa data, in which case beat 3 falls back to internet/healthcare.
- The `voiceoverFenceSlate` is always: "This is sourced data, not advice. Verify with a licensed professional before making any decisions."
- The `caption` always ends with the fence string.
- Scripts are written for a couple on camera: the generator template alternates "James" and "Amanda" as speaker labels. Neither speaks in the first person as an advisor.
- Output is a `.json` file written to `packages/content/output/scripts/[slug]-[date].json`. Remotion reads this file; the script is not embedded in Remotion source.

### 3. Social post (`packages/content/src/generators/socialPost.ts`)

Input: one `Place` object plus `SocialConfig` (platform: `instagram | threads | linkedin`, maxChars: number).

Output: `SocialPost`:

```ts
{
  placeSlug: string, platform: Platform, hook: string, // one surprising cited fact, punchy, ≤ 280 chars
  body: string, // 1-2 sentences of context
  fence: string, // always the canonical fence string
  sourceUrls: string[], // one per cited fact used
  hashtags: string[], // auto-generated from place.tags
}
```

Rules:

- One surprising `CitedValue` per post. The hook must name the source inline: "According to [sourceName]..." or "[Stat], per [sourceName] ([verifiedDate])."
- The fence string appears as the last line of the post, before hashtags.
- Posts never use the word "advice," "recommend," or "suggest." The generator has a string guard that throws if these appear in the output.
- Instagram/Threads use the fence in the caption. LinkedIn uses it as the last paragraph.
- The generator does not auto-post. It writes `.json` to `packages/content/output/social/[platform]/[slug]-[date].json`. James reviews and schedules manually or via a future Buffer/Loomly integration.

### 4. Newsletter blurb (`packages/content/src/generators/newsletterBlurb.ts`)

Input: an array of `Place` objects where at least one `CitedValue` has a `verifiedDate` within the last 14 days (the "freshness filter").

Output: `NewsletterIssue`:

```ts
{
  issueNumber: number, dateRange: { from: string, to: string }, headline: string, blurbs: PlaceBlurb[], fenceFooter: string, // canonical fence string, always present
  unsubscribeNote: string,
}
```

`PlaceBlurb`:

```ts
{
  placeSlug: string, placeName: string, changeNote: string, // what changed and by how much
  citedFact: CitedValue, // the freshest changed value
  pageUrl: string, // link to the full programmatic page
}
```

Rules:

- Only places with at least one `CitedValue` updated in the last 14 days appear in an issue.
- The `changeNote` is generated by comparing `citedFact.value` to the previous value stored in `packages/data/changelog/[slug].json`. If no previous value exists, the note reads "First verified figure."
- The fence appears in the footer of every issue. The Resend template hard-codes the footer; the generator also passes it in `fenceFooter` so any plain-text variant also carries it.
- Issues are written to `packages/content/output/newsletter/issue-[n]-[date].json` and the Resend send is gated behind James's manual merge of the cron PR (see `SHIP.md`).

---

## Field priority matrix

Which `CitedValue` fields project into which channels:

| Field | Page | Video beat | Social hook | Newsletter |
|---|---|---|---|---|
| `costOfLiving.monthly.singlePerson` | yes | beat 1 | eligible | yes if updated |
| `tax.incomeTaxRate` | yes | beat 2 | eligible | yes if updated |
| `visa.d7.monthlyIncomeRequirement` | yes | beat 2 | eligible | yes if updated |
| `climate.sunHoursAnnual` | yes | beat 3 | eligible (hook) | rarely |
| `climate.winterLowCelsius` | yes | beat 3 | eligible | rarely |
| `internet.medianDownloadMbps` | yes | beat 3 fallback | eligible | yes if updated |
| `healthcare.publicCoverageForResidents` | yes | beat 3 fallback | rarely | yes if changed |
| `housing.medianRent1BrCityCenter` | yes | beat 1 | eligible (hook) | yes if updated |

"Eligible (hook)" means this field is in the pool for the video hook and social hook generators. The generator picks the highest-confidence, most town-granular field. If two fields tie, `costOfLiving` wins for video, `climate.sunHoursAnnual` wins for social (higher surprise factor by heuristic weight; see `docs/engine-weights.md`).

---

## Fence test assertion (informative excerpt)

`packages/engine/src/__tests__/fence.test.ts` runs these checks on every generator's output for a fixture `Place` (Nafplio, Greece):

```ts
import { FENCE_STRING } from '../fence'
import { generateVideoScript } from '../generators/videoScript'
import { generateSocialPost } from '../generators/socialPost'
import { generateNewsletterBlurb } from '../generators/newsletterBlurb'

test('video script caption contains fence', () => {
  const script = generateVideoScript(nafplioFixture, defaultConfig)
  expect(script.caption).toContain(FENCE_STRING)
  expect(script.voiceoverFenceSlate).toBeTruthy()
})

test('social post contains fence', () => {
  for (const platform of ['instagram', 'threads', 'linkedin'] as const) {
    const post = generateSocialPost(nafplioFixture, { platform, maxChars: 2200 })
    expect(post.fence).toBe(FENCE_STRING)
    const full = [post.hook, post.body, post.fence].join('\n')
    expect(full).toContain(FENCE_STRING)
  }
})

test('newsletter blurb footer contains fence', () => {
  const issue = generateNewsletterBlurb([nafplioFixture])
  expect(issue.fenceFooter).toBe(FENCE_STRING)
})
```

These tests run in the cron pipeline before any PR is opened. A failure blocks the PR entirely.

---

## 6-week seed calendar

### Format key

- `P` = programmatic page (Astro static, deployed)
- `V` = video script JSON + batch-record note
- `S` = social post JSON (Instagram/Threads unless noted)
- `N` = newsletter issue
- `R` = rough/ephemeral format (see note below)

### Rough/ephemeral format note

At least one `R` per week. This is a deliberately low-production output: a static screenshot of a single `CitedValue` card with the fence visible, posted as a Stories frame or a plain-text Threads post with no editing. It exercises the pipeline end-to-end with near-zero founder effort and signals to the algorithm before the polished video is edited. The `R` format is generated by a separate renderer (`packages/content/src/generators/roughCard.ts`) that produces a 1080x1920 PNG via Satori, not Remotion.

### Batch-record note

James and Amanda record video in batches, not daily. The calendar marks which weeks contain a video script. Before each batch session, James exports all `V` scripts for that batch window as a single PDF from `packages/content/output/scripts/batch-[date].pdf` (a tsx script renders this). The calendar below shows two batch sessions: end of week 1 and end of week 4.

---

### Week 1: Greece foundation (batch record session 1, end of week)

**Theme:** Introduce the project and the Greece-first frame. Three Greek towns go live. First video introduces James and Amanda as relocators sharing sourced data on Greece.

| Day | Output | Description |
|---|---|---|
| Mon | `P` Nafplio, Greece | Full cited page: cost, visa, climate, internet |
| Mon | `R` Nafplio cost card | Rough card: monthly budget figure, fence visible, Threads plain-text |
| Wed | `P` Chania, Crete | Full cited page |
| Wed | `S` Chania sun hours | "According to Meteoblue, Chania averages X sun hours/year. Sourced data, not advice." |
| Thu | `P` Thessaloniki | Full cited page |
| Thu | `S` Thessaloniki cost vs Athens | One cited comparison, fence in caption |
| Fri | `V` Nafplio intro script | Hook: housing cost; beats: cost, D7 visa threshold, climate; fence in caption and slate |
| Fri | `S` Video teaser | Still frame from Nafplio script with cited hook and fence |
| Fri | `N` Issue 1 | Headline: "First figures: three Greek towns, all cited." Blurbs for Nafplio, Chania, Thessaloniki. Fence in footer. |

Batch record session: Nafplio script only (one location, ~90 seconds). Record raw, edit in week 2.

---

### Week 2: Greece depth + first rough comparison

**Theme:** Add two more Greek towns. First cross-town comparison social. First ephemeral poll format.

| Day | Output | Description |
|---|---|---|
| Mon | `P` Kalamata | Full cited page |
| Mon | `R` D7 visa threshold card | Rough card: the income requirement figure, fence visible, Instagram Stories |
| Tue | `S` Kalamata vs Nafplio rent | Cited comparison, both source names inline |
| Wed | `P` Paros | Full cited page (island granularity; note island-premium on housing) |
| Wed | `S` Paros internet speed | Surprising low-confidence flag visible in caption ("confidence: 0.6, verify this") |
| Thu | `V` Chania vs Kalamata script | Two-place comparison script; beats: cost, climate, visa; fence in caption |
| Thu | `R` Chania vs Kalamata rough card | 1080x1920 side-by-side of two key CitedValues, fence at bottom |
| Fri | `N` Issue 2 | Freshest updated fields from any of the 5 live Greek towns. Fence in footer. |

No new batch session this week. Nafplio video from week 1 is edited and scheduled for publish mid-week.

---

### Week 3: First non-Greek European page + newsletter growth frame

**Theme:** One page outside Greece (Portugal or Spain, whichever has better seed data per `docs/data/SOURCES.md`) signals the broader Europe scope. Social introduces the project frame.

| Day | Output | Description |
|---|---|---|
| Mon | `P` Lisbon, Portugal (or Valencia, Spain) | Full cited page, same schema as Greek pages |
| Mon | `R` Lisbon/Valencia cost card | Rough card with fence, posted as Threads reply to the week 1 Nafplio post |
| Tue | `S` Greece vs Portugal cost | One-line cited comparison; both source names; fence |
| Wed | `S` "Why Greece first?" | Text post citing the D7 visa income threshold vs Portugal NHR change; fence in caption |
| Thu | `V` "Why we looked at Greece first" script | Founder-context video; beats: D7 visa data, cost index, climate data; no advice; fence in voiceover slate and caption |
| Thu | `R` Visa threshold comparison card | Greece D7 vs Portugal D8 figures, both cited, fence at base |
| Fri | `N` Issue 3 | Leads with the new European comparison. Fence in footer. Newsletter sign-up CTA added to page footer this week. |

Chania vs Kalamata video from week 2 publishes this week.

---

### Week 4: Stripe fake-door + screening engine live (batch record session 2)

**Theme:** The Astro island screening engine goes live. Stripe fake-door is wired. Social and video drive to the screening tool.

| Day | Output | Description |
|---|---|---|
| Mon | `P` Screening engine page (`/screen`) | Astro island live; no form data stored; Stripe fake-door CTA for "full report" |
| Mon | `S` "We built a screening tool" | Screenshot of the island UI, cited that it pulls from the dataset, fence |
| Tue | `R` Screening tool rough walkthrough | 15-second screen-record rough video of the island, no editing, posted as Reel |
| Wed | `P` Two new Greek towns (from the candidate list in `docs/data/greece-seed.md`) | Pages 6 and 7 |
| Wed | `S` New town social (one of the two) | Cited hook from whichever town has the most surprising `CitedValue` |
| Thu | `V` "How we screen a town" script | James walks through the island live; beats: what data we pull, how confidence works, the fence; Amanda reads the fence slate aloud |
| Fri | `N` Issue 4 | Leads with the screening tool launch. Fence in footer. |

Batch record session: "Why we looked at Greece first" script (week 3) + "How we screen a town" script (week 4). Record both in one session. Edit over two weeks.

---

### Week 5: First claimed affiliate link + cost-of-living deep cut

**Theme:** First affiliate-linked content (e.g., Wise for currency transfer, Numbeo cited as source). Cost-of-living deep cut on housing in one Greek town. Newsletter crosses 100 subscribers if referral loop is active.

| Day | Output | Description |
|---|---|---|
| Mon | `P` Housing deep-cut: Nafplio | Expanded housing section: rental ranges by area, cited from local listing aggregators + `verifiedDate` |
| Mon | `S` Nafplio rent range | Cited range with source name and date; fence; affiliate link to Wise in bio note |
| Tue | `R` Housing card: Nafplio | Rough card with the rent range figure, fence, and "see full data at [url]" |
| Wed | `P` Two more European towns (Portugal interior or Spanish coast) | Expanding the Europe index |
| Wed | `S` European town social | Cited hook |
| Thu | `V` Nafplio housing deep cut script | Beats: rental range, buyer market overview (cited), D7 income vs rent; fence in slate and caption; Wise mentioned as a tool (not endorsed, cited as a common expat tool) |
| Fri | `N` Issue 5 | Housing focus. Affiliate link disclosure in footer alongside fence. |

---

### Week 6: Consolidation + first self-referential transparency post

**Theme:** Publish a transparency post about how the dataset works (cites the CitedValue schema, explains the confidence field, explains the fence). This is both content and trust-building. No new towns; consolidate quality on existing pages.

| Day | Output | Description |
|---|---|---|
| Mon | `S` "How we cite data" | Explains CitedValue fields, confidence, verifiedDate; screenshot of a real card; fence |
| Mon | `R` Rough "behind the scenes" card | Screenshot of a raw JSON CitedValue, fence at base, posted as Threads |
| Tue | `P` /how-we-cite page | Static Astro page explaining the citation schema, the fence rule, and links to FENCE.md and CITATIONS.md |
| Wed | `S` Update: one Greek town re-verified | If any field has been re-verified since week 1, a post announcing the update with old vs new value and new verifiedDate |
| Thu | `V` "How we source this data" script | Amanda-led; beats: what CitedValue is, how we handle low-confidence data, the fence; no advice; fence in slate and caption |
| Thu | `R` Confidence badge explainer card | Shows a low-confidence card with yellow badge, explains what it means, fence |
| Fri | `N` Issue 6 | Transparency theme. Links to /how-we-cite. Fence in footer. 6-week review note: which places were most visited, which `CitedValue` fields had the most updates. |

---

## Projection invariants (summary)

1. No output ships without a `CitedValue` source for every claim it makes.
2. The fence string in `packages/engine/src/fence.ts` is the single source of truth; renderers import it, never copy it.
3. The fence test must pass before any cron PR is opened.
4. Social posts never use "advice," "recommend," or "suggest"; the generator throws on these words.
5. Video scripts name speakers as relocators, not advisors; the script template enforces the speaker label format.
6. Newsletter issues only include places with a `CitedValue` updated in the last 14 days; stale places are silently excluded.
7. Rough/ephemeral formats are generated by `roughCard.ts` using Satori; they do not go through Remotion and require no editing.
8. Batch recording is driven by the calendar's `V` entries; James exports a batch PDF before each session using `tsx scripts/export-batch-scripts.ts`.
9. Affiliate links are disclosed in the newsletter footer and in any social post that includes one; the disclosure is a field in `SocialPost` and `NewsletterIssue`, not optional copy.
10. The screening engine island never stores form data; it is purely client-side logic reading the static dataset.
