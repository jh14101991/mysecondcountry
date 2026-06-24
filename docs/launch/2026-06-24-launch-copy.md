# Launch copy and playbook (Phase A0)

Ready-to-post copy for the audience-less cold start. Posting is the founder's browser task;
this file is the copy and the playbook. Everything below follows the copy rules in AGENTS.md
(no em dashes, no AI-register words, sentence case, conservative, transparent) and the FENCE.md
framing (cited screening intelligence, not advice; relocators sharing sourced data, not advisers).

## Live artifacts to link

- Comparison: https://mysecondcountry.com/compare/greece-portugal-spain
- Screener: https://mysecondcountry.com/screener
- Country pages: /places/greece, /places/portugal, /places/spain

## Go / no-go checklist before posting

- [ ] Pre-launch legal review (FENCE.md): a lawyer has cleared FENCE.md, the trademark, and the
      absence of a privacy policy for a no-collection launch. This gates promotion, per FENCE.md
      and the plan. The build does not, but a public post does. Founder's call.
- [ ] Plausible: the site `mysecondcountry.com` is added in a Plausible account and the Plausible
      DPA is signed, so the demand-signal events actually record. The script is already on every
      page; it just needs the site to exist in Plausible.
- [x] Fence on every page that carries a visa/tax/residency value (enforced by the build).
- [x] Every figure cited, dated, with a confidence mark; all source URLs resolve (CI checks).
- Note: the launch collects no email and takes no payment. The screener runs entirely in the
  browser and stores nothing. So GDPR email-consent and Stripe do not apply yet. A `/privacy`
  page is still worth adding before any email capture (Phase C parallel track).

## Posting rules (so it lands, not spams)

- Post from a genuine personal relocator account, not the brand account (r/expats and r/IWantOut
  downvote brand accounts). Be transparent that you built it; transparency beats stealth and
  avoids bans.
- Lead with the data and a question, never a pitch. The link is the second thing, not the first.
- Check each subreddit's self-promotion rule first. Where the rule is strict, share a couple of
  the surprising cited facts in the post body and let people ask for the link, or follow the 9:1
  rule (nine genuine contributions for each self-link).
- Space the posts out over a few days. Do not cross-post the same text the same hour.

---

## Show HN

**Title**

Show HN: Cited Greece vs Portugal vs Spain relocation comparison and a screener

**Body**

Most relocation comparisons I found were uncited, undated, or quietly affiliate-driven. My
partner and I are actually deciding where in Europe to move, so we built the thing we wanted:
every cost, tax, visa, residency, climate, healthcare, and safety figure is a sourced, dated
claim with a confidence mark, and each one links to its source.

Two things to try:

- Greece vs Portugal vs Spain across 11 sourced dimensions: https://mysecondcountry.com/compare/greece-portugal-spain
- A free screener: enter your budget, climate, visa, and tax constraints and get a cited, ranked
  shortlist: https://mysecondcountry.com/screener

It is screening intelligence, not advice. It never tells you what to do; it shows how each
country's published rules match what you entered, and routes you to a licensed professional for
anything that matters. Tax and visa rules change, so each of those carries a short verify-by date.

Stack, since this is HN: Astro static, content as code in version-controlled JSON, one Zod schema
that turns an uncited value into a build error, a pure TypeScript screening engine, deployed on
Vercel. The data refreshes on a weekly cron that opens a pull request a human merges. No database,
no account, no tracking beyond cookieless Plausible.

It is early: three countries plus one town (Chania) so far. I would value feedback on the sourcing,
the confidence tiers, and which countries or dimensions to add next.

---

## Reddit: r/IWantOut

r/IWantOut is strict on self-promotion. Lead with cited facts; the link is secondary.

**Title**

I compiled a cited Greece vs Portugal vs Spain comparison (cost, tax, visas, healthcare, safety), with sources and dates on every figure

**Body**

I kept finding relocation comparisons that were undated or uncited, so I compiled one where every
number links to its source and shows when it was last verified. A few things that surprised me:

- Portugal closed its old NHR tax regime to new arrivals and replaced it with IFICI, a 20 percent
  flat rate on eligible Portuguese income (source: PwC, dated on the page).
- Spain ended its golden visa on 3 April 2025 (source: La Moncloa, the government press office).
- Greece taxes qualifying foreign pensioners at a flat 7 percent on foreign income for up to 15
  years, and has a separate 100,000 euro per year non-dom option (source: PwC).
- Digital nomad visa income floors differ a lot: Spain about 2,763 euros per month, Greece 3,500,
  Portugal about 3,680.

Full sourced table with confidence marks: https://mysecondcountry.com/compare/greece-portugal-spain

I also built a free screener that ranks the three against your own budget, climate, visa, and tax
constraints: https://mysecondcountry.com/screener

Full disclosure: my partner and I built this while deciding where to move. It is free, no signup,
and it is sourced data, not advice. What countries, dimensions, or corrections would you add?

---

## Reddit: r/digitalnomad

Lead with the visa and tax angle this audience cares about.

**Title**

Cited comparison of the Greece, Portugal, and Spain digital nomad visas and tax regimes (every figure sourced and dated)

**Body**

I put together a sourced comparison of the three most-asked European bases, focused on the things
that actually decide it for remote workers:

- Digital nomad visa minimum income: Spain about 2,763 euros per month (200 percent of the minimum
  wage), Greece 3,500, Portugal about 3,680 (four times the minimum wage).
- Special tax regimes for movers: Spain's Beckham regime (24 percent flat up to 600,000 euros for
  six years), Portugal's IFICI (20 percent flat, the NHR successor), Greece's non-dom and 7 percent
  pensioner regimes.
- Cost of living, climate, healthcare, and safety, each cited.

Every figure links to its source with a verified date, since these rules change often:
https://mysecondcountry.com/compare/greece-portugal-spain

There is also a free screener that ranks them against your income, climate, and tax limits:
https://mysecondcountry.com/screener

I built this (deciding where to move myself), it is free and stores nothing, and it is screening
data not advice. Keen to hear what is wrong or missing.

---

## Reddit: r/expats

**Title**

Built a cited Greece vs Portugal vs Spain comparison because I was tired of undated relocation numbers

**Body**

After comparing Greece, Portugal, and Spain for our own move and finding most sources undated or
uncited, I built a comparison where every figure (cost, tax, residency, climate, healthcare,
safety) links to its source and shows the date we last checked it, with a confidence mark when the
source is weaker.

Comparison: https://mysecondcountry.com/compare/greece-portugal-spain
Free screener against your own constraints: https://mysecondcountry.com/screener

It is free, no account, and framed as sourced data, not advice; for anything that matters it points
you to a licensed professional. I would genuinely value corrections from people who have done one of
these moves, especially on the tax regimes and visa income floors.

---

## Facebook: Greece expat groups (e.g. "Expats in Greece", "Americans/Brits in Greece")

Casual, lead with Greece, disclose, ask for corrections.

Hi all. My partner and I are weighing a move and I got frustrated that most Greece vs Portugal vs
Spain comparisons online are undated or uncited, so I built one where every figure links to its
source with a verified date: cost, the 7 percent pensioner and non-dom tax regimes, the digital
nomad visa income floor, the golden visa tiers, climate, healthcare, and safety. Here it is, free
and no signup: https://mysecondcountry.com/places/greece and the full comparison at
https://mysecondcountry.com/compare/greece-portugal-spain. There is also a free screener that ranks
the three against your own budget and constraints. It is sourced data, not advice. If anyone here
has done the Greek residency or tax process, I would love corrections on the numbers.

## Facebook: Portugal expat groups (e.g. "Expats in Portugal", "Americans & FriendsPT")

Hi everyone. While deciding where in Europe to move, I built a cited comparison of Portugal, Spain,
and Greece where every figure (cost, the IFICI and NHR tax situation, the D8 digital nomad visa
income floor, golden visa routes after the 2023 changes, climate, healthcare, safety) links to its
source and shows when it was last verified. Portugal page: https://mysecondcountry.com/places/portugal
and the comparison: https://mysecondcountry.com/compare/greece-portugal-spain. Free, no signup,
sourced data not advice. Corrections very welcome, especially on IFICI and the current golden visa
routes.

---

## Demand signal: what to read after posting

The whole point of the launch is the demand sensor. After posting, watch in Plausible (and the
weekly AI-crawler log once wired):

- `Screener Run`: are people using the tool, and what `top` country comes back most.
- `Comparison Viewed`: traffic to the comparison page.
- Outbound link clicks (auto-tracked): which source citations people click, a proxy for which
  claims they care about and trust-check.
- Pageviews by country page (/places/greece vs /portugal vs /spain): which country pulls.
- Referrers: which channel (HN, a specific subreddit, a Facebook group) actually converts to use.

Use that to choose the first Phase A1 depth cluster: build region and town pages for the country
and the dimensions the launch showed people clicked and searched, not by guess.

## Assets

- The comparison page and the screener are the shareable visuals; their Open Graph title and
  description unfurl on each platform.
- Fast-follow worth doing before a bigger push: a static Open Graph image (1200x630) of the
  comparison table for richer link previews, and a `/privacy` page before any email capture.
