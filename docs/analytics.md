# Analytics: event taxonomy and KPI definitions

## Event taxonomy

Client-side events should be captured by a first-party event log before they are used for queue decisions. Server-side AI-crawler events are captured separately via Vercel Routing Middleware and Vercel Blob; they are not human traffic.

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

### AI crawler sightings

**Definition:** server-side requests from known AI crawler user agents, measured by bot, path, resource type, and week.

**What this does prove:** an AI crawler, AI search fetcher, or AI-related user agent requested a public MSC route.

**What this does not prove:** an AI answer cited MSC, a human saw MSC in an AI interface, or the request produced revenue demand.

Known user-agent families:

```
GPTBot
OAI-SearchBot
ChatGPT-User
ClaudeBot
Claude-SearchBot
PerplexityBot
Perplexity-User
Google-Extended
GoogleOther
```

**Data source:** Vercel Routing Middleware at the repository root (`middleware.ts`). It detects known AI crawler user agents and posts matching records to the Node serverless writer at `api/ai-crawler-log.ts`, which writes private JSON records to Vercel Blob under `ai-crawlers/raw/YYYY-MM-DD/*.json`. It does not log IP addresses, cookies, request bodies, or ordinary human traffic.

**Parser:** `scripts/parse-ai-crawlers.ts`. The weekly digest calls the same parser and reports whether Blob reading is configured. If Blob credentials are missing, a zero-hit report is not meaningful.

**Baseline rule:** an empty weekly crawler section only counts as a true zero when the digest says Blob reading is configured. If Blob reading is not configured, the metric state is "not wired", not "quiet week."

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

**Data source:** future first-party event log, grouped by `partner`, `place_id`, and `placement`. Until this is wired, do not infer affiliate intent from GSC impressions or crawler sightings.

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

**Data source:** future first-party event log. The numerator (`dossier_checkout_started`) must be fired server-side from the API route immediately before redirecting to checkout. The denominator (`dossier_fakedoor_click`) is client-side; expect a small systematic undercount when scripts are blocked, which makes the reported rate a conservative floor.

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

**Data source:** future first-party event log, grouped by `source_page` and `source_placement`.

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

**Data source:** future first-party event log, grouped by `cited_value_key`.

---

## Instrumentation rules

1. Every event listed above must be wired before the first public URL is indexed, not after traffic arrives. A page that exists for 48 hours with no instrumentation has lost its baseline permanently.
2. `fence_viewed` must fire on every page that renders residency, tax, visa, or immigration `CitedValue` fields. The `IntersectionObserver` hook lives in a shared Astro island component (`packages/web/src/components/LiabilityFence.astro`); it is not optional per-page.
3. `dossier_checkout_started` is server-side only. Do not fire it from the client. The API route must write the event immediately before issuing the checkout redirect. This ensures the event is captured even if the user's browser blocks client-side scripts.
4. The AI-crawler log parser (`scripts/parse-ai-crawlers.ts`) reports ingestion signals only. It must not be described as AI citation, AI search impression, or human demand proof.
5. Do not add paid analytics by default. If the first-party log becomes too limited, make a separate decision before adding a third-party paid analytics tool.
6. All event property values must be strings or numbers. No booleans, no nested objects. Keep props flat so they can be exported cleanly.
