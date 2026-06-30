# Analytics: event taxonomy and KPI definitions

## Event taxonomy

These client-side events are the planned human-traffic taxonomy. They require a human-analytics
provider before they produce data. Server-side AI-crawler events are captured separately via Vercel
Routing Middleware; they do not prove human visits.

### Client-side events

**`place_page_view`**
Trigger: any `/places/[slug]` page mount (fires once per navigation, not on scroll).
Properties:
- `place_id`: string, e.g. `gr-athens-attica`
- `granularity`: `"country"` | `"region"` | `"town"`
- `path`: current URL path

**`source_link_click`**
Trigger: user clicks any external link rendered from a `CitedValue.sourceUrl`, an evidence-atlas
detail source, or the deduplicated page source list.
Properties:
- `source_name`: `CitedValue.sourceName`, e.g. `"Greek Ministry of Finance"`
- `source_url`: `CitedValue.sourceUrl`
- `cited_value_key`: the field path or stable key for the cited value, e.g. `"tax.incomeTaxRate"`
- `row_key`: evidence-atlas row key when the click comes from the atlas
- `source_placement`: `"cited_value"` | `"place_fact_table"` | `"atlas_detail"` | `"sources_list"`
- `place_id`: string

**`evidence_atlas_lens_selected`**
Trigger: user selects an Evidence atlas lens.
Properties:
- `place_id`: string
- `granularity`: `"country"` | `"region"` | `"town"`
- `lens`: selected lens key, e.g. `"family"` | `"housing"` | `"source-gaps"`
- `visible_count`: number of visible rows after filtering, encoded as a string for provider compatibility

**`evidence_atlas_search_used`**
Trigger: user types a non-empty Evidence atlas search query. Track the first meaningful search per
page load, not every keystroke.
Properties:
- `place_id`: string
- `query_length`: character count only; do not send the raw query
- `visible_count`: number of visible rows after filtering, encoded as a string

**`evidence_atlas_row_opened`**
Trigger: user opens an Evidence atlas row.
Properties:
- `place_id`: string
- `row_key`: canonical matrix row key
- `row_label`: reader-facing row label
- `coverage_status`: reader-facing coverage label
- `confidence`: confidence value when the row has a cited value
- `status_tone`: `"cited"` | `"gap"` | `"inherited"` | `"local"` | `"proxy"`
- `has_source`: `"true"` | `"false"`

**`evidence_atlas_source_click`**
Trigger: user clicks the source link in the Evidence atlas detail pane. This should also emit
`source_link_click` with the same source fields.
Properties:
- same properties as `source_link_click`

**`screener_cta_click`**
Trigger: user clicks a place-page CTA to `/screener`.
Properties:
- `place_id`: string
- `granularity`: `"country"` | `"region"` | `"town"`
- `cta_variant`: stable CTA placement or visible CTA label
- `source_path`: page path where the CTA was clicked

**`affiliate_outbound_click`**
Trigger: user clicks any affiliate-tagged outbound link (health insurance comparison, VPN, flight search, relocation service, etc.).
Properties:
- `partner`: partner slug, e.g. `"cigna-expat"` or `"wise"`
- `place_id`: string where the click occurred
- `placement`: `"inline"` | `"sidebar"` | `"footer"` | `"newsletter"`

**`dossier_fakedoor_click`**
Trigger: user clicks the "Get the full dossier" CTA button before Stripe Checkout loads.
Properties:
- `place_id`: string
- `dossier_type`: e.g. `"country"` | `"city-deep-dive"`

**`dossier_checkout_started`**
Trigger: Stripe Checkout session created; fire from the API route immediately before redirecting to Stripe.
Properties:
- `place_id`: string
- `dossier_type`: string
- `price_usd`: number (numeric, not formatted string)

**`newsletter_signup`**
Trigger: successful 2xx response from the Resend subscribe API route.
Properties:
- `source_page`: path of the page where the form was submitted, e.g. `/places/gr-athens-attica`
- `source_placement`: `"inline"` | `"exit-intent"` | `"footer"`

**`fence_viewed`**
Trigger: the liability fence element enters the viewport (use an `IntersectionObserver` with `threshold: 0.5`; fire once per page load, not on re-entry).
Properties:
- `place_id`: string
- `fence_variant`: string key for the fence text rendered, e.g. `"residency-visa"` | `"tax-general"` | `"immigration-uk"`

---

## KPI definitions

### Manual GSC performance log

Manual Search Console snapshots live in `docs/signals/gsc-performance-log.csv` until the
weekly digest has API-backed GSC exports enabled.

Each snapshot records the raw property total plus visible query, page, and country rows. Do not
treat low-volume impressions as demand proof. Use them as queue evidence only when they repeat
across days or combine with clicks, source clicks, signups, intro requests, or content movement.

### New-page URL inspection rule

When a new page cluster ships, the sitemap handles normal discovery. Do not resubmit the sitemap
for every deploy.

Use Google Search Console URL Inspection only for the top-of-funnel page or the few pages that
matter most for the shipped cluster:

- one parent page for a place cluster, such as the region or country hub;
- one to three high-intent child pages, such as the flagship town, rule, checklist, or answer;
- any page that is already getting impressions but shows a live-test issue.

After deploy, run **Test live URL** first. If the live test passes and the page is not indexed,
request indexing. Do not repeatedly request indexing for the same unchanged URL. Log meaningful
snapshots in `docs/signals/gsc-performance-log.csv`.

Treat URL Inspection as a hand-raise for priority pages, not as the main indexing mechanism.

---

### AI crawler sightings

**Definition:** tracked requests from known AI crawlers, measured by page and bot per calendar
week.

This is not the same as AI-search impressions, AI citations, or human traffic. It only tells us
that an AI crawler or AI retrieval user-agent requested a page.

**Primary readout:**

- total tracked crawler hits in the last 7 days;
- top bots by path;
- top paths by crawler attention;
- newest hit per bot and path.

**Data source:** Vercel Routing Middleware (`middleware.ts`) detects known AI-crawler user
agents and records only matching public-content requests to private Vercel Blob files under
`ai-crawlers/raw/YYYY-MM-DD/*.json`. It does not log IP addresses, cookies, request bodies, or
ordinary human browser traffic.

Tracked user-agent families:
`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`,
`Perplexity-User`, `Google-Extended`, and `GoogleOther`.

The standalone parser is `scripts/parse-ai-crawlers.ts`. The weekly digest calls the same parser
and reports a conservative "AI crawler sightings" section. To enable the digest reader, set the
GitHub secret `BLOB_READ_WRITE_TOKEN` to the Vercel Blob read/write token. Production logging uses
the Vercel project environment for the same Blob store.

**Baseline rule:** zero hits is a real result only when the digest says the Blob reader is
configured. If the digest says `BLOB_READ_WRITE_TOKEN` is missing, the pipeline is not measuring.

---

### Affiliate click-through rate (CTR)

**Definition:** the share of place-page sessions in which at least one `affiliate_outbound_click` event fires.

**Formula:**

```
Affiliate CTR =
  unique sessions with >= 1 affiliate_outbound_click /
  total unique sessions on place pages
```

Report per partner slug to distinguish high-performing placements from underperformers.

**Data source:** future human-traffic analytics. If Plausible is enabled later, export via the
Plausible Stats API (`/api/v1/stats/breakdown?property=event:props:partner`).

---

### Fake-door conversion percent

**Definition:** the share of `dossier_fakedoor_click` events that progress to `dossier_checkout_started`.

**Formula:**

```
Fake-door conversion % =
  count(dossier_checkout_started) /
  count(dossier_fakedoor_click)
  × 100
```

Both events carry `place_id` and `dossier_type`, so you can slice by place or dossier variant.

**Data source:** future human-traffic analytics. The numerator (`dossier_checkout_started`) should
be fired server-side from the API route, so it is not blocked by ad blockers. The denominator
(`dossier_fakedoor_click`) is client-side; expect a small systematic undercount on the denominator
from blocked scripts.

---

### Newsletter signup rate

**Definition:** the share of place-page sessions in which a `newsletter_signup` event fires.

**Formula:**

```
Newsletter signup rate =
  unique sessions with >= 1 newsletter_signup /
  total unique sessions on place pages
```

Slice by `source_placement` to identify whether inline, footer, or exit-intent placements are driving signups.

**Data source:** future human-traffic analytics. Keep this separate from AI crawler sightings.

---

### Source-click depth (trust proxy)

**Definition:** the average number of `source_link_click` events per place-page session. This is a proxy for reader trust in cited data: a reader who clicks through to verify primary sources is engaging with the citation layer, not just consuming surface-level summaries.

**Formula:**

```
Source-click depth =
  total source_link_click events on place pages /
  total unique sessions on place pages
```

A secondary cut: breakdown by `cited_value_key` to learn which data categories (tax rates, cost of living, visa rules) readers most want to verify independently. Prioritize those fields for citation quality improvements.

**Data source:** future human-traffic analytics, broken down by `event:props:cited_value_key`.

---

## Instrumentation rules

1. When a human-traffic analytics provider is enabled, every event listed above must be wired
   before new conversion surfaces ship.
2. `fence_viewed` must fire on every page that renders residency, tax, visa, or immigration `CitedValue` fields. The fence markup lives in `packages/web/src/components/FenceBlock.astro`; the shared `IntersectionObserver` hook lives in `packages/web/src/layouts/Base.astro`. It is not optional per-page.
3. `dossier_checkout_started` is server-side only. Do not fire it from the client.
4. The AI-crawler parser (`scripts/parse-ai-crawlers.ts`) is part of the weekly digest. It reports
   ingestion signals only. It does not prove AI citations or human demand.
5. If a human-traffic analytics provider is enabled later, all event property values must be
   strings or numbers. No booleans, no nested objects.
