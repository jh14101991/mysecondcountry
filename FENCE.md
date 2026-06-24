# FENCE.md

Liability, compliance, and editorial enforcement rules for the relocation intelligence engine. These are operational rules, not legal advice to the founder. Have a qualified lawyer review before launch and at each major expansion (new jurisdiction, monetisation event, UK audience targeting).

---

## TOP RULE: intelligence, never advice

Everything published on this site, in videos, in emails, and in paid dossiers is cited screening intelligence pointing to primary sources. It is never legal, tax, immigration, or financial advice. We report what a named source says, on a named date, with a stated confidence level. We never tell an individual what to do.

This rule is upstream of every other rule in this file. When in doubt, ask: "Are we reporting a fact from a source, or are we directing a reader's decision?" If the latter, rewrite or delete.

---

## CitedValue contract

Every residency, visa, tax, cost, and climate claim that ships must be carried in a `CitedValue` object. The schema is non-negotiable:

```ts
{
  value:        string | number | boolean, sourceUrl:    string, // permalink to the primary source; no homepage-only links
  sourceName:   string, // human-readable authority name
  verifiedDate: string, // ISO 8601, YYYY-MM-DD
  confidence:   "high" | "medium" | "low", granularity:  "country" | "region" | "town",
}
```

Enforcement rules:

- No claim ships without `sourceUrl` AND `verifiedDate`. A claim with one but not the other is treated as uncited.
- "Stale-as-current" is banned: a `CitedValue` whose `verifiedDate` predates the staleness threshold (see staleness banner section below) may not be rendered as if it were current. It must trigger the staleness banner.
- `confidence: "low"` claims must render with an explicit qualifier ("reported, unverified by primary source") and still carry a source and date.
- No derived-fact laundering: if fact B is inferred from fact A plus judgment, B gets its own `CitedValue` pointing to the inferential basis; it does not inherit A's source.
- Ingestion scripts must write the `CitedValue` at import time, not at render time. Render-time citation injection is banned because it decouples the fact from its proof.

---

## The visible fence string

Every page that touches residency, visa, tax, or financial topics must render the following string verbatim, in body text size (not fine print), above the first claim on that page:

> Sourced screening information, not legal, tax, immigration, or financial advice. Verify with a licensed professional before acting.

Rules:

- It must be above the fold on mobile (375 px viewport). A link to `FENCE.md` or a `/legal/screening-notice` page may follow it.
- The Stripe paid dossier must carry this fence on the purchase confirmation page, on the first page of the dossier, and in the delivery email.
- It may not be collapsed behind a toggle or hidden in a footer-only location.
- Video descriptions must include the fence string as the first paragraph of the description, before any affiliate links.
- The fence is not optional for pages that "only" discuss cost of living or climate: cost data informs financial decisions and falls under the same rule.

---

## No individualized recommendations

The following patterns are banned in all content (pages, emails, video scripts, social captions, paid dossiers, code-generated summaries):

- "you should"
- "best for you"
- "in your case"
- "we recommend" (except recommending a source, never a course of action)
- "your best option is"
- Computing any specific reader's tax liability, visa eligibility outcome, or residency qualification in a way that renders a pass/fail verdict for that person

The allowed pattern: state the general rule, cite the source, route the reader to their licensed professional. Example: "Greece's non-dom regime taxes foreign-source income at a flat EUR 100,000 annual fee for up to 15 years (source: Greek Government Gazette, verified 2025-11-03). Consult a licensed Greek tax adviser to confirm eligibility for your situation."

The screening engine (packages/engine) may compute a general-rule match score for a place against user-supplied parameters. It must never output "you qualify" or "you do not qualify." Output must read as "this place's published rules match [N] of your stated criteria" and display the fence string alongside the result.

---

## UK immigration: highest-risk rule

Providing immigration advice in the UK while unregulated is a criminal offence under the Immigration and Asylum Act 1999, ss.84-92, enforced by the Office of the Immigration Services Commissioner (OISC). The penalty is imprisonment.

Operational rules:

- We never tell any reader whether they will, can, or should apply for any UK visa or immigration route.
- We may report: published visa categories, published eligibility criteria, published fee schedules, published processing times. Each claim carries the GOV.UK permalink and verified date.
- We never interpret a reader's individual circumstances against published rules. Phrases like "based on what you've told us, you would likely qualify" are banned.
- All UK immigration pages must carry, in addition to the standard fence string, the following: "UK immigration advice from unregulated persons is a criminal offence. For your individual position, consult an OISC-registered adviser."
- If the site ever targets UK users for UK visa content, the couple's on-camera framing must explicitly disclaim any advisory role and route to OISC.gov.uk.
- This rule applies regardless of audience geography: if the page discusses a UK visa route, the rule applies.

---

## The couple framing rule

James and Amanda are "relocators sharing sourced data." They are not advisors, consultants, experts, or professionals.

Enforced in:

- Channel bios (YouTube, Instagram, TikTok): must include "relocators sharing sourced data, not advisers" or equivalent
- Video scripts: no line positions either person as an authority ("in my professional opinion", "as an expert in..."); they report what sources say
- About page: same
- Email footer: same
- Paid dossier cover page: "compiled by relocators from public sources; not professional advice"

If a video features a licensed professional (lawyer, accountant), the professional may give their own views; the couple still does not characterise those views as advice to the viewer.

---

## Affiliate disclosure

Jurisdiction basis: FTC Guides (16 CFR Part 255), UK ASA/CAP Code (rule 2.1 and 2.3), EU UCPD (Directive 2005/29/EC). Tightest rule wins; UK/EU require "prominent" disclosure before the consumer encounters the promotion.

Rules:

- Every page containing affiliate links must carry this disclosure at the TOP of the page, above the fold, before the first link: "This page contains affiliate links. If you buy through them we may earn a commission, at no extra cost to you."
- Every monetised video must include the disclosure verbally at the START of the video ("this video contains affiliate links") AND as a visible on-screen text overlay at the same moment, AND in the video description as the second paragraph (after the fence string, before any links).
- Disclose for ALL forms of consideration: cash commission, product gifts, free stays, press-rate accommodation, software licenses. There is no gift threshold below which disclosure is optional.
- Banned shorthands: "aff", "sp", "spon", bare "affiliate" (must say what "affiliate" means in plain terms), "#collab", "#partner" alone, "#gifted" alone (must say "gifted" in a sentence).
- Bottom-of-page or below-the-fold-only disclosure is banned; it does not satisfy UK/EU requirements.
- Programmatically generated pages (city comparison, place profile) that contain affiliate links inherit the disclosure via a shared template component; the component must render the disclosure string first, before any affiliate link in the DOM.

---

## Email list: consent and GDPR

Legal bases: GDPR Art 6(1)(a) (consent), ePrivacy Directive / UK PECR for commercial email. Germany additionally requires confirmed (double) opt-in as a near-universal court standard; use it globally.

Rules:

- Double opt-in only: a signup triggers a confirmation email; the address is not added to the send list until the confirmation link is clicked.
- No purchased, scraped, rented, or borrowed lists, ever.
- No soft opt-in: there is no prior product sale from which to infer marketing consent; every address must have explicit opt-in.
- Consent record: store, per address: timestamp of signup form submission, exact text of the consent checkbox/statement at the time of signup, timestamp of confirmation click, IP address (as a technical record, not for profiling), form identifier. Do not delete this record even after unsubscribe (needed to prove lawful basis if challenged).
- Every email send must include a one-click unsubscribe link. "One-click" means unsubscribing does not require the user to log in, confirm on a second page, or state a reason. Resend's unsubscribe header satisfies this mechanically; verify it is active.
- Name the data controller in the privacy policy and in the email footer: "byImprint / [legal entity name], [jurisdiction]."
- Re-consent or purge: any address inactive for 24 months must either receive a re-consent email (and be purged if no response within 30 days) or be purged immediately. Document the decision.

---

## Privacy, processors, and data transfers

Required before any email collection begins:

1. Publish a privacy policy at `/privacy`. Minimum content: controller identity, data collected, purpose and lawful basis per category, processor list with links to their privacy policies, data subject rights (access/erasure/portability/objection), retention periods, contact address for requests.

2. Sign an Article 28 Data Processing Agreement (DPA) with each processor before sending them personal data:
   - Resend (email delivery)
   - Stripe (payment processing)
   - Plausible (analytics; confirm they are GDPR-compliant by design, but document it)
   - Vercel (infrastructure; sign their DPA or confirm their standard DPA covers your use)

3. International transfer mechanism: Resend, Stripe, and Vercel are US-based. Document the transfer mechanism for each. EU-US Data Privacy Framework (DPF) participation covers many US processors; verify each processor's DPF status at the DPF list. Where DPF does not apply, use Standard Contractual Clauses (SCCs, 2021 EU version). Document the chosen mechanism in the Article 30 record.

4. Maintain an Article 30 Record of Processing Activities. Minimum per processing activity: purpose, categories of data subjects, categories of personal data, recipients, third-country transfers and safeguard, retention period. This is an internal document; it does not need to be published but must exist and be kept current.

5. Retention periods must be documented. Recommendation: email address and consent record retained until unsubscribe plus 3 years (to defend against complaints); payment records per tax law of operating jurisdiction; access log data purged after 90 days.

---

## Cookies and tracking

Plausible Analytics is cookieless and does not process personal data in a way requiring consent under ePrivacy. Server-side AI-crawler logs likewise require no consent if they log only non-personal request metadata. This is the baseline; no consent banner is required for this setup alone.

The moment any of the following are added, a real opt-in consent banner with reject-as-easy-as-accept becomes mandatory before those technologies load:

- Any pixel (Meta, Google, TikTok, Pinterest, or similar)
- A/B testing tools that set cookies or fingerprint users
- Embedded YouTube, Vimeo, or other third-party media players (they set third-party cookies on load)
- Any advertising tag

"Reject as easy as accept" means: a reject button is visible on the first layer of the banner, at the same prominence as the accept button. A consent wall (content blocked unless user accepts) is banned.

Stripe: Stripe sets cookies for payment fraud prevention. These are strictly necessary for the checkout transaction and do not require consent. Document them in the privacy policy and cookie policy as strictly necessary. Do not add any Stripe marketing or tracking integrations beyond the core payment flow without reassessing consent requirements.

---

## Scraping and data ingestion

Rules for the data refresh pipeline (tsx scripts, GitHub Actions cron):

- Ingest facts, not expression. Permissible: a number, a date, a proper noun, a statutory threshold from an official source. Not permissible: lifting paragraphs of explanatory prose, replicating a table's exact layout, reproducing images.
- Cite and link to the source; never mirror the source's content to replace it.
- EU database right (sui generis, Directive 96/9/EC): do not bulk-extract a substantial part of any single EU database. "Substantial" is not defined by volume alone; repeated extraction of non-substantial parts that cumulatively amount to a substantial part is also prohibited. Spread fact collection across many primary sources.
- No scraping behind authentication, paywalls, or clickwrap agreements.
- Respect each source's `robots.txt`. If `robots.txt` disallows crawling for a path, do not scrape that path regardless of technical ability.
- Rate-limit all ingestion scripts. Do not send more than one request per second to any single domain unless that domain's API terms explicitly permit higher rates.
- Record per-source provenance in the CitedValue at ingestion time. The pipeline must log: source URL, fetch timestamp, HTTP status, raw response hash. Store this log per run; do not discard it before the next run completes successfully.
- Do not ingest personal data of individuals (names, addresses, phone numbers, email addresses of private persons). Public figures' published professional contact details are a grey area; avoid them unless clearly necessary and legally permissible.

---

## Paid dossier fence

The Stripe paid dossier is sold as cited screening research. The purchase flow must enforce the following:

- The Stripe Checkout page must carry the fence string before the buy button.
- The order confirmation email must carry the fence string in the first paragraph.
- The dossier document (PDF or rendered page) must carry the fence string on the cover and on every section that contains residency, visa, tax, or financial data.
- The dossier must not be titled or described as a "personalised plan", "roadmap for you", or equivalent. Acceptable: "screened intelligence report for [place]", "sourced data summary for [place]".
- The buyer's inputs (parameters they supplied) may appear in the dossier to explain how the screening criteria were applied. They must not appear as a conclusion ("based on your inputs, you qualify"). They must appear as a filter record ("filtered for: [criteria list]. Match rate against published rules: [N/M criteria]").

---

## Staleness banner

Every page that renders CitedValues must compute a staleness state at build time.

Rules:

- Staleness threshold by claim type:
  - Visa fee, tax rate, eligibility threshold: 90 days
  - Cost of living index: 180 days
  - Climate data (monthly averages): 365 days
  - General regulatory description: 180 days

- If any CitedValue on a page exceeds its threshold AND no human has re-verified it (marked via the PR gate process defined in SHIP.md), the page must render, immediately below the fence string: "Some data on this page was last verified more than [N] days ago and may be outdated. Verify with primary sources before relying on it."

- The build must fail or the page must render the staleness banner automatically; there is no manual override that suppresses the banner without a re-verification merge.

- A confident-looking number presented without a staleness banner when the underlying CitedValue is stale is the failure mode this rule prevents. Prefer a banner over a suppressed warning.

---

## Jurisdiction-specific notes

These notes are summaries for operational awareness; they are not legal opinions.

- Greece: tax regime changes are common; the non-dom flat-tax and digital-nomad visa rules have each changed within 24 months of this writing. Treat Greek tax and residency claims as having a 60-day practical staleness window, not 90.
- Germany: double opt-in for email is enforced by courts as the standard of proof for consent. The 90-day re-verification email cadence for inactive subscribers is tested and upheld.
- EU broadly: the UCPD (Unfair Commercial Practices Directive) and national implementations require that "paid for" content not be presented as editorial. Affiliate and sponsored content disclosure is not optional anywhere in the EU.
- UK: post-Brexit, the UK GDPR (UK retained law) mirrors EU GDPR substantively. PECR applies to email marketing. The Immigration and Asylum Act 1999 immigration advice prohibition has no revenue or scale threshold; it applies from the first piece of individualized immigration guidance.
- US (federal): FTC disclosure rules apply when a US person is the reader, regardless of publisher location. If the site is accessible in the US, FTC rules apply.

---

## Operational checklist before launch

The following gates must pass before the site accepts any email address or processes any payment. This checklist is for tracking; it is not exhaustive legal due diligence.

- [ ] Privacy policy published at `/privacy`, names the legal entity and contact address
- [ ] DPAs signed with Resend, Stripe, Plausible, Vercel
- [ ] Transfer mechanism (DPF or SCCs) documented per processor
- [ ] Article 30 record created and stored
- [ ] Double opt-in configured and tested end-to-end in Resend
- [ ] Unsubscribe link tested; one-click confirmed
- [ ] Fence string present on all residency/visa/tax pages, above the fold, mobile
- [ ] Staleness banner logic verified in build output
- [ ] Affiliate disclosure at top of every monetised page, tested mobile
- [ ] Paid dossier fence string present on checkout page, confirmation email, and document
- [ ] Couple bio and channel descriptions use "relocators sharing sourced data" framing
- [ ] UK immigration pages carry the OISC routing notice
- [ ] Lawyer reviewed this file and the privacy policy

---

This file is one of the four permitted process docs. It may be replaced but not supplemented by an additional process doc. Substantive updates require a PR with a changelog note in docs/decisions/ADR-log.md.
