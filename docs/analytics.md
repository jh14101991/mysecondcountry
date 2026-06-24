# Analytics: event taxonomy and KPI definitions

## Event taxonomy

All client-side events fire via Plausible's custom event API (`plausible(eventName, { props })`). Server-side AI-crawler events are captured separately via Vercel Edge Middleware; they never appear in Plausible.

### Client-side events

**`place_page_view`**
Trigger: any `/places/[slug]` page mount (fires once per navigation, not on scroll).
Properties:
- `place_id`: string, e.g. `gr-athens-attica`
- `granularity`: `"country"` | `"region"` | `"town"`

**`source_link_click`**
Trigger: user clicks any external link rendered from a `CitedValue.sourceUrl`.
Properties:
- `source_name`: `CitedValue.sourceName`, e.g. `"Greek Ministry of Finance"`
- `source_url`: `CitedValue.sourceUrl`
- `cited_value_key`: the field path on the Place object that holds this `CitedValue`, e.g. `"tax.incomeTaxRate"`
- `place_id`: string

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

### AI-citation rate

**Definition:** the share of place-page requests that originate from known AI crawlers, measured per page per calendar week.

**Formula:**

```
AI-citation rate (page, week) =
  AI-crawler hits on page (week) / total requests on page (week)
```

where "AI-crawler hits" counts any request whose `User-Agent` contains one of:
`GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`, `Google-Extended`.

**Data source:** a Vercel Edge Middleware (`packages/web/src/middleware.ts`) that runs on every request, detects known AI-crawler user-agents (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended), and records the hit. These crawlers strip cookies and never execute JavaScript, so they never appear in Plausible. The middleware writes each hit to a Vercel Blob store (or a Vercel Log Drain on Pro) as a structured JSON record. A standalone `tsx` script at `scripts/parse-ai-crawlers.ts` reads those records on the same GitHub Actions cron schedule as the data-refresh pipeline, emits a dated JSON summary to `docs/analytics/ai-crawlers/YYYY-WW.json`, and opens a PR alongside any data-refresh PR so the human gate also reviews crawler trend. Note: Vercel Log Drains are an alternative on the Pro plan and require no custom middleware for log capture.

**Baseline rule:** the log parser must be wired from the first commit and first deployment. Even with zero traffic, an empty weekly file proves the pipeline is running. Any week with no baseline file is a pipeline failure, not a "quiet week."

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

**Data source:** Plausible custom events dashboard. Export via Plausible Stats API (`/api/v1/stats/breakdown?property=event:props:partner`).

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

**Data source:** Plausible custom events. The numerator (`dossier_checkout_started`) is fired server-side from the API route, so it is not blocked by ad blockers. The denominator (`dossier_fakedoor_click`) is client-side; expect a small systematic undercount on the denominator from blocked scripts, which makes the reported rate a conservative floor.

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

**Data source:** Plausible custom events. Plausible is cookieless and GDPR-compliant by design; no consent banner is required. This is a non-negotiable reason to use Plausible over GA4.

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

**Data source:** Plausible custom events, breakdown by `event:props:cited_value_key`.

---

## Instrumentation rules

1. Every event listed above must be wired before the first public URL is indexed, not after traffic arrives. A page that exists for 48 hours with no instrumentation has lost its baseline permanently.
2. `fence_viewed` must fire on every page that renders residency, tax, visa, or immigration `CitedValue` fields. The `IntersectionObserver` hook lives in a shared Astro island component (`packages/web/src/components/LiabilityFence.astro`); it is not optional per-page.
3. `dossier_checkout_started` is server-side only. Do not fire it from the client. The API route fires it via Plausible's server-side events API immediately before issuing the Stripe redirect. This ensures the event is captured even if the user's browser blocks the Plausible script.
4. The AI-crawler log parser (`scripts/parse-ai-crawlers.ts`) is part of the same cron family as `scripts/refresh-data.ts`. Both run on the same schedule. Both open PRs. Neither auto-merges.
5. Plausible script tag goes in the `<head>` of the Astro base layout with `defer` and `data-domain` set. No custom domain proxy is required initially; add one if Plausible is blocked at a measurably high rate.
6. All event property values must be strings or numbers. No booleans, no nested objects. Plausible flattens props to a flat key-value map.
