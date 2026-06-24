# CITATIONS.md

## Citation and provenance discipline

Every claim in the dataset is a `CitedValue`. There are no bare numbers, no unsourced strings for facts, and no "generally accepted" assertions. If a value cannot be cited to a primary source, it does not exist in the dataset.

## The CitedValue contract

```ts
type Confidence = "HIGH" | "MEDIUM" | "LOW";
type Granularity = "country" | "region" | "town";

interface CitedValue<T> {
  value: T;
  sourceUrl: string;        // canonical URL of the primary source page or PDF
  sourceName: string;       // human-readable name, e.g. "Eurostat" or "AADE"
  verifiedDate: string;     // ISO 8601 date, e.g. "2026-05-14"
  archiveUrl: string;       // Wayback/archive.today snapshot URL, set at verify time
  excerpt: string;          // the specific sentence or table cell that contains the value
  confidence: Confidence;
  granularity: Granularity;
}
```

The Zod 4 schema for `CitedValue` marks every field required. An object that omits `sourceUrl`, `verifiedDate`, `archiveUrl`, `excerpt`, or `confidence` fails schema validation at build time. This is not a convention; it is a type-level fence. Validation runs in `packages/data/src/schema.ts` and is exercised by `vitest` in the same package. A build that fails data validation does not deploy.

See also FENCE.md for the human-visible disclaimer text that must accompany every rendered CitedValue.

## Confidence tiers

Confidence is not a judgment call; it is determined by source class.

**HIGH** sources include:

- Eurostat (official EU statistical office; NUTS-level breakdowns available)
- World Bank Open Data
- Köppen-Geiger climate classification database (Beck et al., doi:10.1038/sdata.2018.214)
- OurAirports open dataset (airport/IATA codes, runway data)
- Ookla Speedtest Global Index (monthly, country-level)
- OpenAQ (air quality, sensor-level data)
- Official gazette publications (Greek Government Gazette / FEK for tax law text)

**MEDIUM** sources include:

- PwC Worldwide Tax Summaries
- OECD Taxing Wages
- Bank of Greece statistical releases
- AADE (Greek tax authority) published PDFs and web pages

Note: AADE returns HTTP 403 to automated bots and its PDFs rot without warning. Verify AADE figures manually, store an archive snapshot immediately, and record the excerpt verbatim. Do not rely on automated link-rot detection for AADE; flag it as manually-monitored in `docs/data/SOURCES.md`.

**LOW** sources include:

- Numbeo (crowd-sourced; useful for cost-of-living directional data only)
- Spitogatos and similar property listing aggregators (asking prices, not transaction prices)
- Extrapolated figures (any value derived by applying a ratio or growth rate to a primary figure)
- Expat forums, blog posts, or any non-institutional source

The confidence field renders visibly on every public page alongside the claim. Rendering rules are in `packages/web/src/components/CitedValue.astro`. HIGH renders as a filled indicator, MEDIUM as half-filled, LOW as hollow, with a tooltip explaining the tier definition. A LOW confidence claim is not suppressed; it is shown with its label so the reader can weight it appropriately.

## Granularity and the honesty rule

The `granularity` field records the actual geographic scope of the underlying data, not the scope of the Place object the claim is attached to.

If a `CitedValue` attached to a town-level Place has `granularity: "country"`, the rendered page must display the label: "National figure shown for [Town Name]." This text is generated automatically by `CitedValue.astro` when `granularity` does not match the Place's own level. Suppressing this label is a schema-level violation; the component throws at build time if the label text is absent when required.

Do not interpolate or extrapolate a national figure down to town level and call it a town figure. Record the national figure, set `granularity: "country"`, and let the label do its job.

## The 90-day staleness rule for visa and tax claims

Any `CitedValue` where the parent field is tagged `category: "visa" | "tax" | "residency"` in the Place schema must have a `verifiedDate` no older than 90 days from the current build date.

A CI step in `.github/workflows/ci.yml` runs `packages/data/src/check-staleness.ts` at build time. This script computes `today - verifiedDate` for every visa/tax/residency `CitedValue` and fails the build if any value exceeds 90 days. The failure message names the field path and the verifiedDate so the refresh script knows exactly what to re-verify.

The refresh pipeline (a separate scheduled GitHub Actions workflow, see AGENTS.md) is responsible for keeping these values inside the 90-day window. The human gate is merge: the pipeline opens a PR with updated `CitedValue` objects and a changelog; a human reviews and merges before the next deploy.

Cost-of-living, climate, and connectivity CitedValues carry a softer expectation: re-verify at least annually, or when a source signals a major update. Staleness for these fields does not fail the build; it opens a GitHub issue via the link-rot checker.

## Archive snapshots and excerpt integrity

At the moment a CitedValue is first authored or re-verified, the ingest script must:

1. Submit the `sourceUrl` to the Wayback Machine Save API (`https://web.archive.org/save/`) and store the returned archive URL in `archiveUrl`.
2. If the Wayback API fails or the URL is not archiveable (e.g., gated PDFs), use archive.today as fallback and record that URL instead.
3. Copy the exact sentence, table row, or PDF excerpt that contains the claimed value into the `excerpt` field. The excerpt must be long enough to be uniquely locatable in the source document; a single number in isolation is not sufficient.

The purpose of the excerpt is source-rot detection. When the link-rot checker fetches a live page and the excerpt string is no longer present in the response body, it flags the claim as potentially stale even if the URL still returns 200. This catches silent rewrites, which are common for government pages.

## The link-rot checker

A scheduled GitHub Actions workflow (weekly on Monday at 06:00 UTC) runs `scripts/check-links.ts`. For every `CitedValue` in the dataset it:

1. Fetches the `sourceUrl` with a descriptive User-Agent string (see AGENTS.md for the agent identity convention).
2. On HTTP 404 or 410: opens a GitHub issue titled "Source rot: [sourceName] [field path]" and labels it `citation-rot`. The build is not immediately failed, but the issue is required to be resolved before the next visa/tax/residency staleness check would pass.
3. On HTTP 403: records the result as "bot-blocked" rather than "rotted." Bot-blocked sources (notably AADE) are excluded from automated re-fetch and flagged for manual verification in the issue body.
4. On HTTP 200 but excerpt not found in response body: opens a GitHub issue titled "Silent rewrite: [sourceName] [field path]" labeled `citation-rot`.
5. On HTTP 301/302: updates `sourceUrl` to the final redirect target in the dataset and opens a PR.

The checker does not attempt to re-verify values or generate replacements. It only detects and signals. Resolution is a human task, typically completed by running the refresh pipeline against the flagged field and merging the resulting PR.

## Ingest rule: facts, not expression

When the Claude API content-generation pipeline (see AGENTS.md) authors or paraphrases a claim, it must ingest the underlying fact from the primary source, not copy the expression used by an intermediary. This applies to:

- Tax rates: ingest from the official gazette or AADE, not from a tax-guide blog that cites AADE.
- Cost figures: ingest the Eurostat or Numbeo figure directly, not a journalist's summary of it.
- Visa rules: ingest from the Greek Ministry of Migration official page or EUR-Lex directive text, not from an expat guide.

Intermediary sources may be used to locate primary sources, but they are not recorded as `sourceName` or `sourceUrl`. If the primary source cannot be located, the confidence tier is LOW and `sourceName` must name the intermediary explicitly, making the indirection visible.

## References

Source inventory with contact points, update cadences, and known access restrictions: `docs/data/SOURCES.md`.

Liability fence text and rendering requirements: FENCE.md.
