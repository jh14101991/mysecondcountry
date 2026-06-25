# Data lane: qa + topics collections, implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development to execute
> task-by-task, and superpowers:test-driven-development inside each task. Steps use checkbox
> (`- [ ]`) syntax. Author every figure as a real `CitedValue` or a reference to one; never
> fabricate a number to fill a layout.

**Goal:** Stand up the cited `qa` (Question/AEO) and `topics` (fact) collections per the frozen
`docs/template-field-contract.md`, seeded entirely by **reference** to facts already cited in the
live `gr`/`pt`/`es` Place data and the Greece 7% regime, render them through the existing
component kit, and extend the CI guards to walk the two new collections. Single source of truth:
a figure must never be duplicated across two files; a `qa`/`topics` fact field either inlines a
`CitedValue` or references an existing one, resolved at build time.

**Architecture.** A new `refs.ts` + `resolve.ts` pair in `@where/data` adds a fact-reference
mechanism (`{ ref: "regime:<id>#<path>" }` or `place:<id>#<path>`). Each new collection's
`index.ts` parses its authoring JSON (where a fact field is `CitedValue | FactRef`) and resolves
every ref to a plain `CitedValue` at module load, so everything downstream (guards, pages,
JSON-LD) is identical to `places`/`regimes`. This is the contract's sanctioned "render shape vs
source shape": the design lane only ever sees a resolved `CitedValue`.

**Scope boundary (keeps the two lanes apart).** Touch only `packages/data/**`,
`packages/web/src/pages/**` (the wiring), `packages/web/src/lib/jsonld.ts` (pure build-time
projection of cited data, not a component), and `scripts/**` (the guards). Do **not** open or edit
`packages/web/src/components/**` or `DESIGN.md`. Consume each component as a black box via its prop
interface, verified against the live `packages/web/src/pages/[country]/tax/[slug].astro` usage.

**Two documented design-lane follow-ups (non-blocking, do not implement here):** the `DirectAnswer`
polarity chip and the `Masthead` `qa` variant. We wire to the proven `Masthead variant="topic"`
and the proven `DirectAnswer` `question` + slot interface so the reconvergence build is green now.

## Global constraints (the reviewer's attention lens)

- Node >= 22, pnpm only, TypeScript strict, `moduleResolution: bundler`, relative imports end `.js`.
  JSON imports use `with { type: "json" }`. Mirror `packages/data/src/regimes/` exactly.
- **Every fact is a real `CitedValue`** with `sourceUrl` (https), `sourceName`, `verifiedDate`
  (YYYY-MM-DD, not future), `confidence`, `granularity`. **Never fabricate a figure.** In this plan,
  every fact is a **reference** to an existing place/regime fact; no new figures are authored.
- Visa/tax/residency facts are **high or medium confidence only**; `category` is fixed to the
  matching literal. `answerFact` is one of these three categories.
- A page needs **at least four distinct cited fields** (each with its own `sourceUrl`) or it does
  not publish (anti-thin). qa = `answerFact` + 3 `supportingFacts`. topics = >= 4 `facts`.
- Each page emits, at build time, a top-level JSON-LD **array** (not `@graph`): `Article` (whose
  `dateModified` is the newest `verifiedDate` rendered on the page), `BreadcrumbList`, and the
  template's primary type (qa: `QAPage`; topics: `Dataset`).
- Copy rules: **no em dashes** anywhere; no AI-register words (leverage, elevate, transform,
  empower, streamline, harness, unlock, seamless, robust); sentence case; conservative, sourced.
  No individualised advice phrasing: never "you should", "best for you", "in your case", "your
  best option", or "we recommend" (except recommending a source).
- Determinism: collection `index.ts` resolves refs at module load and throws on any unresolved
  ref. A high-liability `answerFact` that resolves to low confidence, or to a non
  tax/visa/residency category, is a hard error (a test asserts this).
- Git hygiene (working tree shared with the `@where/content` thread, which also edits
  `packages/data/src/index.ts`): **never `git add -A`**. Run `git restore --staged .` then stage
  explicit paths only. Re-check `packages/data/src/index.ts` for that thread's lines before
  committing; keep both threads' exports.
- Guards stay green: `pnpm test`, `pnpm verify:data` (exit 0), `pnpm verify:build` (exit 0, now
  covering qa + topics), `pnpm --filter @where/web build` (exit 0). Run `pnpm check` (biome) and
  `pnpm typecheck` on touched packages.

## Facts available to reference today (verified, do not re-fetch)

Place facts (paths from `collectCitedValues`), all `verifiedDate` 2026-06-24:
- `place:es#residency.goldenVisa` (residency, **high**): abolished 3 Apr 2025, Organic Law 1/2025.
- `place:es#residency.digitalNomadVisa` (visa, medium): ~2,763 EUR/month.
- `place:es#tax.specialRegime` (tax, medium): Beckham, 24% to 600k.
- `place:es#tax.headlinePersonalIncomeTaxRate` (tax, medium): 47%.
- `place:pt#tax.specialRegime` (tax, medium): IFICI 20%, NHR closed end 2023.
- `place:pt#tax.headlinePersonalIncomeTaxRate` (tax, medium): 48%.
- `place:pt#residency.digitalNomadVisa` (visa, medium): D8, ~3,680 EUR/month.
- `place:pt#residency.goldenVisa` (residency, medium): funds 500k after 2023 reform.
- `place:gr#residency.goldenVisa` (residency, medium): tiered 800k/400k/250k since 2024.
- `place:gr#residency.digitalNomadVisa` (visa, medium): 3,500 EUR/month.
- `place:gr#tax.specialRegime` (tax, medium): non-dom 5A + pensioner 5B.
- `place:gr#tax.headlinePersonalIncomeTaxRate` (tax, medium): 44%.

Regime facts (paths from `collectRegimeCitedValues`), `verifiedDate` 2026-06-25:
- `regime:greece-foreign-pensioner-flat-tax#headlineRate` (tax, medium): 7.
- `regime:greece-foreign-pensioner-flat-tax#durationYears` (tax, medium): 15.
- `regime:greece-foreign-pensioner-flat-tax#eligibility.priorNonResidency` (residency, medium).
- `regime:greece-foreign-pensioner-flat-tax#eligibility.knownCatch` (tax, medium).

---

## Task 1: Fact-reference foundation (`refs.ts` + `resolve.ts`)

**Files:**
- Create: `packages/data/src/refs.ts`, `packages/data/src/resolve.ts`
- Modify: `packages/data/src/index.ts` (add two re-exports; preserve all existing lines)
- Test: `packages/data/src/__tests__/resolve.test.ts`

**Interfaces produced (verbatim signatures):**
- `FactRefSchema: ZodType`, `type FactRef = { ref: string }`, `isFactRef(v: unknown): v is FactRef`.
- `resolveFactRef(ref: FactRef): CitedValue`, `resolveCitedOrRef(v: CitedValue | FactRef): CitedValue`.

- [ ] **Step 1: Write the failing test** `packages/data/src/__tests__/resolve.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FactRefSchema, isFactRef, resolveCitedOrRef, resolveFactRef } from "../index.js";

describe("fact references", () => {
  it("accepts a well-formed ref and rejects a malformed one", () => {
    expect(FactRefSchema.safeParse({ ref: "place:es#residency.goldenVisa" }).success).toBe(true);
    expect(FactRefSchema.safeParse({ ref: "es residency" }).success).toBe(false);
  });
  it("isFactRef distinguishes a ref from an inline CitedValue", () => {
    expect(isFactRef({ ref: "place:es#residency.goldenVisa" })).toBe(true);
    expect(isFactRef({ value: 7, sourceUrl: "https://x", sourceName: "n", verifiedDate: "2026-01-01", confidence: "medium", granularity: "country" })).toBe(false);
  });
  it("resolves a place ref to the exact cited value", () => {
    const cited = resolveFactRef({ ref: "place:es#residency.goldenVisa" });
    expect(cited.category).toBe("residency");
    expect(cited.confidence).toBe("high");
    expect(String(cited.value)).toContain("3 April 2025");
  });
  it("resolves a regime ref to the exact cited value", () => {
    const cited = resolveFactRef({ ref: "regime:greece-foreign-pensioner-flat-tax#headlineRate" });
    expect(cited.value).toBe(7);
    expect(cited.category).toBe("tax");
  });
  it("passes an inline CitedValue through unchanged", () => {
    const inline = { value: 1, sourceUrl: "https://x.example", sourceName: "n", verifiedDate: "2026-01-01", confidence: "medium", granularity: "country" } as const;
    expect(resolveCitedOrRef(inline)).toBe(inline);
  });
  it("throws on an unknown id or path", () => {
    expect(() => resolveFactRef({ ref: "place:zz#tax.headlinePersonalIncomeTaxRate" })).toThrow();
    expect(() => resolveFactRef({ ref: "regime:greece-foreign-pensioner-flat-tax#nope" })).toThrow();
  });
});
```

- [ ] **Step 2: Run, verify fail** (`pnpm --filter @where/data exec vitest run src/__tests__/resolve.test.ts`).

- [ ] **Step 3: Create `packages/data/src/refs.ts`** (pure, no collection imports):

```ts
import { z } from "zod";
import type { CitedValue } from "./schema.js";

/** A reference to an existing cited fact: "regime:<id>#<dotted.path>" or "place:<id>#<path>". */
export const FactRefSchema = z.object({
  ref: z
    .string()
    .regex(/^(regime|place):[a-z0-9-]+#[a-zA-Z0-9.]+$/, "ref must be '<regime|place>:<id>#<dotted.path>'"),
});
export type FactRef = z.infer<typeof FactRefSchema>;

/** True for a FactRef, false for an inline CitedValue (which carries `value`, not `ref`). */
export function isFactRef(v: unknown): v is FactRef {
  return typeof v === "object" && v !== null && "ref" in v && !("value" in v);
}
```

- [ ] **Step 4: Create `packages/data/src/resolve.ts`** (imports the collection indexes directly,
  never the root `index.ts`, to avoid an import cycle):

```ts
import type { FactRef } from "./refs.js";
import { isFactRef } from "./refs.js";
import { places } from "./places/index.js";
import { collectRegimeCitedValues } from "./regimes/facts.js";
import { regimes } from "./regimes/index.js";
import { type CitedValue, collectCitedValues } from "./schema.js";

/** Resolve a FactRef to the exact CitedValue it points at. Throws if it does not resolve. */
export function resolveFactRef(ref: FactRef): CitedValue {
  const [kind, rest] = ref.ref.split(":");
  const [id, path] = rest.split("#");
  if (kind === "regime") {
    const regime = regimes.find((r) => r.id === id);
    if (!regime) throw new Error(`fact ref ${ref.ref}: no regime "${id}"`);
    const hit = collectRegimeCitedValues(regime).find((f) => f.path === path);
    if (!hit) throw new Error(`fact ref ${ref.ref}: no cited path "${path}" on regime "${id}"`);
    return hit.cited;
  }
  if (kind === "place") {
    const place = places.find((p) => p.id === id);
    if (!place) throw new Error(`fact ref ${ref.ref}: no place "${id}"`);
    const hit = collectCitedValues(place).find((f) => f.path === path);
    if (!hit) throw new Error(`fact ref ${ref.ref}: no cited path "${path}" on place "${id}"`);
    return hit.cited;
  }
  throw new Error(`fact ref ${ref.ref}: unknown kind "${kind}"`);
}

/** An authoring fact field is a CitedValue or a FactRef; resolve it to a plain CitedValue. */
export function resolveCitedOrRef(v: CitedValue | FactRef): CitedValue {
  return isFactRef(v) ? resolveFactRef(v) : v;
}
```

- [ ] **Step 5: Re-export from `packages/data/src/index.ts`.** Add (keep every existing line, the
  `@where/content` thread may also be editing this file):

```ts
export * from "./refs.js";
export * from "./resolve.js";
```

- [ ] **Step 6: Run, verify pass; tsc + biome.** `pnpm --filter @where/data exec vitest run`,
  `pnpm --filter @where/data exec tsc --noEmit`, `pnpm exec biome check packages/data/src`.

- [ ] **Step 7: Commit.**

```bash
git restore --staged .
git add packages/data/src/refs.ts packages/data/src/resolve.ts packages/data/src/index.ts packages/data/src/__tests__/resolve.test.ts
git commit -m "feat(data): fact-reference resolver for cross-collection single source of truth"
```

---

## Task 2: The `qa` collection, end to end

**Files:**
- Create: `packages/data/src/qa/schema.ts`, `packages/data/src/qa/facts.ts`,
  `packages/data/src/qa/index.ts`, and one `*.json` per entry under `packages/data/src/qa/`.
- Create: `packages/data/src/qa/__tests__/schema.test.ts`, `.../index.test.ts`, `.../facts.test.ts`.
- Modify: `packages/data/src/index.ts` (re-export qa schema, facts, index; preserve existing lines).
- Create: `packages/web/src/pages/answers/[slug].astro`, `packages/web/src/pages/data/qa/[slug].json.ts`.
- Modify: `packages/web/src/lib/jsonld.ts` (add `qaPageJsonLd`).
- Modify: `scripts/check-freshness.ts`, `scripts/assert-uniqueness.ts`, `scripts/check-sources.ts`,
  `scripts/validate-jsonld.ts` (add a qa loop/block to each).
- Modify: `packages/web/public/llms.txt` (add a qa entry).

### 2A. Schema (`packages/data/src/qa/schema.ts`)

Two shapes: `QaInputSchema` (authoring; fact fields are `CitedValue | FactRef`) and the resolved
`Qa` type (fact fields are `CitedValue`). The high-liability inline option must be tax/visa/
residency, high|medium. Mirror the field rules from the contract Template 4 table.

```ts
import { z } from "zod";
import { citedValue, CitedCategorySchema, type CitedValue } from "../schema.js";
import { FactRefSchema } from "../refs.js";

const URL_SAFE = z.string().regex(/^[a-z0-9-]+$/, "must be url-safe");

// answerFact inline option: high-liability (tax|visa|residency, high|medium), number or string.
const AnswerFactInline = citedValue(z.union([z.number(), z.string()])).extend({
  confidence: z.enum(["high", "medium"]),
  category: z.enum(["tax", "visa", "residency"]),
});
// supportingFact inline option: any category, number or string.
const SupportingFactInline = citedValue(z.union([z.number(), z.string()]));

export const QaInputSchema = z.object({
  id: URL_SAFE,
  slug: URL_SAFE,
  question: z.string().min(12),
  polarity: z.enum(["yes", "no", "qualified", "n-a"]),
  answer: z.string().min(12).max(240),
  answerFact: z.union([FactRefSchema, AnswerFactInline]),
  supportingFacts: z.array(z.union([FactRefSchema, SupportingFactInline])).max(3),
  rule: z.string().min(80),
  category: CitedCategorySchema,
  relatedSlugs: z.array(URL_SAFE).max(6),
});
export type QaInput = z.infer<typeof QaInputSchema>;

/** Resolved qa entry: every fact field is a plain CitedValue. */
export interface Qa {
  id: string;
  slug: string;
  question: string;
  polarity: "yes" | "no" | "qualified" | "n-a";
  answer: string;
  answerFact: CitedValue;
  supportingFacts: CitedValue[];
  rule: string;
  category: z.infer<typeof CitedCategorySchema>;
  relatedSlugs: string[];
}
```

### 2B. Facts walker (`packages/data/src/qa/facts.ts`)

```ts
import type { CitedValue } from "../schema.js";
import type { Qa } from "./schema.js";

/** Walk every resolved CitedValue on a qa entry, with a dotted path. */
export function collectQaCitedValues(qa: Qa): { path: string; cited: CitedValue }[] {
  const out: { path: string; cited: CitedValue }[] = [
    { path: "answerFact", cited: qa.answerFact },
  ];
  qa.supportingFacts.forEach((cited, i) => out.push({ path: `supportingFacts.${i}`, cited }));
  return out;
}

/** Stable fact id from a qa id and a dotted path. */
export function qaFactId(qaId: string, path: string): string {
  return `${qaId}#${path}`;
}
```

### 2C. Index (`packages/data/src/qa/index.ts`)

Import each entry JSON explicitly (ADR-0001, no dynamic imports), parse via `QaInputSchema`,
resolve refs to a resolved `Qa`, and validate the resolved `answerFact` is high|medium and
tax/visa/residency (throw otherwise). Provide `qaBySlug`/`qaById`.

```ts
import { resolveCitedOrRef } from "../resolve.js";
import { type Qa, QaInputSchema } from "./schema.js";
import spainGoldenVisaRaw from "./can-i-still-get-a-spanish-golden-visa.json" with { type: "json" };
import greecePensionRaw from "./does-greece-tax-foreign-pensions-at-7-percent.json" with { type: "json" };
import portugalNhrRaw from "./is-portugals-nhr-tax-regime-still-available.json" with { type: "json" };

const RAW: unknown[] = [spainGoldenVisaRaw, greecePensionRaw, portugalNhrRaw];

function resolveQa(raw: unknown): Qa {
  const input = QaInputSchema.parse(raw);
  const answerFact = resolveCitedOrRef(input.answerFact);
  if (!["high", "medium"].includes(answerFact.confidence) || !["tax", "visa", "residency"].includes(answerFact.category ?? "")) {
    throw new Error(`qa ${input.id}: answerFact must resolve to a high|medium tax/visa/residency CitedValue`);
  }
  return {
    ...input,
    answerFact,
    supportingFacts: input.supportingFacts.map(resolveCitedOrRef),
  };
}

export const qa: Qa[] = RAW.map(resolveQa);

export function qaBySlug(slug: string): Qa | undefined {
  return qa.find((q) => q.slug === slug);
}
export function qaById(id: string): Qa | undefined {
  return qa.find((q) => q.id === id);
}
```

### 2D. Entries (one `.json` per file, fact fields are refs only)

Author exactly these three. Each has `answerFact` + 3 `supportingFacts` = 4 cited fields. The
`answer` leads with the conclusion, is general (no advice phrasing), and carries no em dash. `rule`
is >= 80 chars of general rule prose. `relatedSlugs` link the other two qa slugs where sensible.

1. `can-i-still-get-a-spanish-golden-visa.json` (polarity `no`, category `residency`):
   - `answerFact`: `place:es#residency.goldenVisa`
   - `supportingFacts`: `place:es#residency.digitalNomadVisa`, `place:es#tax.specialRegime`,
     `place:es#tax.headlinePersonalIncomeTaxRate`
   - answer e.g.: "No. Spain abolished its golden visa on 3 April 2025 under Organic Law 1/2025,
     ending residence permits tied to real estate investment over 500,000 euros."

2. `does-greece-tax-foreign-pensions-at-7-percent.json` (polarity `qualified`, category `tax`):
   - `answerFact`: `regime:greece-foreign-pensioner-flat-tax#headlineRate`
   - `supportingFacts`: `regime:greece-foreign-pensioner-flat-tax#durationYears`,
     `regime:greece-foreign-pensioner-flat-tax#eligibility.priorNonResidency`,
     `regime:greece-foreign-pensioner-flat-tax#eligibility.knownCatch`
   - answer e.g.: "Qualified yes. Greece applies a flat 7 percent on foreign-source income for
     foreign pensioners who transfer tax residence and meet the rules, for up to 15 years."

3. `is-portugals-nhr-tax-regime-still-available.json` (polarity `no`, category `tax`):
   - `answerFact`: `place:pt#tax.specialRegime`
   - `supportingFacts`: `place:pt#tax.headlinePersonalIncomeTaxRate`,
     `place:pt#residency.digitalNomadVisa`, `place:pt#residency.goldenVisa`
   - answer e.g.: "No for new entrants. The NHR regime closed to new applicants at the end of
     2023; its successor, IFICI, gives a 20 percent flat rate on eligible Portuguese income."

JSON entry shape (refs only):

```json
{
  "id": "can-i-still-get-a-spanish-golden-visa",
  "slug": "can-i-still-get-a-spanish-golden-visa",
  "question": "Can you still get a Spanish golden visa?",
  "polarity": "no",
  "answer": "No. Spain abolished its golden visa on 3 April 2025 under Organic Law 1/2025, ending residence permits tied to real estate investment over 500,000 euros.",
  "answerFact": { "ref": "place:es#residency.goldenVisa" },
  "supportingFacts": [
    { "ref": "place:es#residency.digitalNomadVisa" },
    { "ref": "place:es#tax.specialRegime" },
    { "ref": "place:es#tax.headlinePersonalIncomeTaxRate" }
  ],
  "rule": "Spain ended its investor residence permit (golden visa) on 3 April 2025; people relocating now use ordinary routes such as the telework (digital nomad) visa or a non-lucrative visa, with their own income and tax rules.",
  "category": "residency",
  "relatedSlugs": ["is-portugals-nhr-tax-regime-still-available"]
}
```

### 2E. Data-layer tests (`packages/data/src/qa/__tests__/`)

- `schema.test.ts`: a known-good input parses; a malformed `answerFact` (low confidence inline,
  or category `cost`) fails; `answer` over 240 chars fails; `supportingFacts` length 4 fails.
- `index.test.ts`: `qa.length >= 3`; `qaBySlug`/`qaById` resolve; every entry's `answerFact` is a
  resolved `CitedValue` (has `value` + `sourceUrl`) with confidence high|medium and category in
  {tax,visa,residency}; every entry has >= 4 collected cited fields.
- `facts.test.ts` (the **freshness back-date proof**): take a real entry, build a back-dated copy
  of one collected fact (`verifiedDate` set ~400 days before today via `ageInDays`/`isStale` from
  `@where/data`), assert `isStale(backDated) === true`, proving the freshness predicate covers qa.

### 2F. Web wiring (`packages/web/src/pages/answers/[slug].astro`)

Model on `packages/web/src/pages/[country]/tax/[slug].astro`. Import `qa`, `qaBySlug`,
`collectQaCitedValues`, `qaFactId`, `isStale`, `DEFAULT_STALENESS_DAYS` from `@where/data`. Reuse
only proven components: `Breadcrumb`, `Masthead` (`variant="topic"`), `FenceBlock`, `DirectAnswer`
(`question` prop + slot), `SectionHeading`, `FactsTable`, `CiteThis`, `RelatedLinks`, `Base`.

- `getStaticPaths`: `qa.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }))`.
- `SITE = "https://mysecondcountry.com"`, `canonical = ${SITE}/answers/${entry.slug}`.
- `allFacts = collectQaCitedValues(entry)`, `maxDate = maxVerifiedDate(...)`,
  `dateline = buildDateline({ citedLabel: monthYearLabel(maxDate), sourceCount: uniqueSources })`.
- Staleness banner exactly as the regime page (`stale`, `staleDays`).
- Body order (fence before any claim): `Breadcrumb`; `Masthead variant="topic" title={entry.question}
  dateline={dateline}`; `FenceBlock hasLegalClaims={true} staleDays={staleDays}`; a
  `DirectAnswer question={entry.question}` whose slot is `<p>{entry.answer}</p>` plus the cited
  source (`{answerFact.sourceName}, verified {answerFact.verifiedDate}`); a "The rule" section
  (`SectionHeading as="h2"` + `<p>{entry.rule}</p>`); a "Supporting facts" section with a
  `FactsTable` whose rows are the `supportingFacts` (label them from the source/category, e.g. the
  `sourceName`); `CiteThis lines={...}` (one line per collected fact, `citationUrl =
  ${canonical}#${path}`); `RelatedLinks` resolving each `relatedSlug` through `qaBySlug` to
  `{ label: related.question, href: /answers/<slug> }`, skipping any that do not resolve.
- `jsonLd = [articleJsonLd({ url: canonical, headline: entry.question, description: entry.answer,
  dateModified: maxDate, siteUrl: SITE }), breadcrumbJsonLd([{ name: "Answers" }, { name:
  entry.question, href: /answers/<slug> }], SITE), qaPageJsonLd({ url: canonical, question:
  entry.question, answer: <answer + " (" + sourceName + ", verified " + verifiedDate + ")">,
  siteUrl: SITE })]`.
- Do NOT emit PropertyValue nodes on qa (so `assert-date-modified` skips the page cleanly); do NOT
  emit a `FAQPage` (supportingFacts are not Q&A pairs and would fail `assert-faq-jsonld`).

### 2G. JSON-LD builder (`packages/web/src/lib/jsonld.ts`, add `qaPageJsonLd`)

```ts
/** schema.org QAPage: the literal question and its single accepted, cited answer. */
export function qaPageJsonLd(opts: {
  url: string;
  question: string;
  answer: string;
  siteUrl: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "@id": `${opts.url}#qa`,
    url: opts.url,
    mainEntity: {
      "@type": "Question",
      name: opts.question,
      acceptedAnswer: { "@type": "Answer", text: opts.answer, url: opts.url },
    },
  };
}
```

### 2H. Data endpoint (`packages/web/src/pages/data/qa/[slug].json.ts`)

Mirror `data/regimes/[slug].json.ts`: emit `{ id, slug, question, polarity, answer, category,
facts: collectQaCitedValues(entry).map(({path,cited}) => ({ id: qaFactId(entry.id, path), path,
...cited })) }`.

### 2I. Guard extensions (add a qa loop/block to each; do not weaken existing logic)

- `scripts/check-freshness.ts`: import `qa`, `collectQaCitedValues`; add the same high-liability
  staleness loop used for `regimes`.
- `scripts/assert-uniqueness.ts`: import `qa`, `collectQaCitedValues`; add a loop requiring
  `collectQaCitedValues(entry).filter(({cited}) => cited.sourceUrl).length >= MIN_UNIQUE` (4).
- `scripts/check-sources.ts`: import `qa`, `collectQaCitedValues`; add their `sourceUrl`s to the set.
- `scripts/validate-jsonld.ts`: add an `/answers/` filter requiring each page to carry a `QAPage`
  node with `@context` and a `mainEntity` whose `name` is a non-empty string (mirror the Place/
  Dataset blocks; report `No QAPage node` / `QAPage missing @context` / `QAPage missing question`).

### 2J. llms.txt

Add a qa entry describing the `/answers/` surface and the `/data/qa/<slug>.json` endpoint, in the
same voice as the existing regime entry.

- [ ] Verify: `pnpm --filter @where/data test`, `pnpm verify:data` (exit 0),
  `pnpm --filter @where/web build`, `pnpm verify:build` (exit 0), `pnpm check`, `pnpm typecheck`.
- [ ] Commit (explicit paths under `packages/data/src/qa`, the two web pages,
  `packages/web/src/lib/jsonld.ts`, the four scripts, `packages/web/public/llms.txt`, and the
  preserved `packages/data/src/index.ts`).

---

## Task 3: The `topics` collection, end to end

Same five-part shape and the same guard/wiring extensions, for `topics` (contract Template 5).

**Files:** mirror Task 2 under `packages/data/src/topics/` and
`packages/web/src/pages/topics/[slug].astro` + `packages/web/src/pages/data/topics/[slug].json.ts`;
add `topicDatasetJsonLd` to `jsonld.ts`; add a `topics` loop to the four guard scripts and a
`/topics/` Dataset block to `validate-jsonld.ts`; add a topics llms.txt entry.

### 3A. Schema (`packages/data/src/topics/schema.ts`)

Per contract Template 5. A `fact` is `{ key, label, cited: CitedValue | FactRef }` (authoring) and
`{ key, label, cited: CitedValue }` (resolved). `countryId: string | null`. `facts` min 1 in the
schema; entries author >= 4 (anti-thin, enforced by the guard). `context` min 80. `definedTerm`
optional `{ name, description }`. `faqs` optional `{ question, answer }[]` (adds FAQPage when length
>= 2). `relatedSlugs` max 6.

### 3B/3C. Facts walker + index

`collectTopicsCitedValues(topic)` walks `facts[].cited` with path `facts.<i>` and `topicFactId`.
`index.ts` imports each entry JSON explicitly, parses via `TopicInputSchema`, resolves each
`fact.cited` via `resolveCitedOrRef`, exposes `topics`, `topicBySlug`, `topicById`.

### 3D. Entries (refs only, >= 4 facts each)

1. `portugal-ifici-the-nhr-successor.json` (`countryId: "pt"`): facts referencing
   `place:pt#tax.specialRegime`, `place:pt#tax.headlinePersonalIncomeTaxRate`,
   `place:pt#residency.digitalNomadVisa`, `place:pt#residency.goldenVisa`. `definedTerm` for IFICI.
2. `greece-golden-visa-price-tiers.json` (`countryId: "gr"`): facts referencing
   `place:gr#residency.goldenVisa`, `place:gr#residency.digitalNomadVisa`, `place:gr#tax.specialRegime`,
   `place:gr#tax.headlinePersonalIncomeTaxRate`. `definedTerm` for the Greek golden visa.

`context` (>= 80 chars) is general, sourced-in-spirit prose, no em dash, no advice phrasing.

### 3E. Tests

`schema.test.ts` (good parse; a `facts` entry missing `cited` fails; `context` < 80 fails);
`index.test.ts` (`topics.length >= 2`, lookups resolve, every `fact.cited` is a resolved
`CitedValue`, every topic has >= 4 facts); `facts.test.ts` (freshness back-date proof, as in 2E).

### 3F. Web wiring (`packages/web/src/pages/topics/[slug].astro`)

Reuse `Breadcrumb`, `Masthead variant="topic"`, `FenceBlock` (render whenever any fact category is
tax/visa/residency, which both seed topics are), `SectionHeading` + serif body for `context`,
`FactsTable` (caption + the facts rows), optional `FaqItem` list (visible `<h3>` questions matching
the FAQPage), `CiteThis`, `RelatedLinks`, `Base`. Title `${topic.title} | My Second Country`,
canonical `${SITE}/topics/${slug}`.

`jsonLd = [articleJsonLd, breadcrumbJsonLd, topicDatasetJsonLd(topic, SITE), definedTermJsonLd?
(when present), faqPageJsonLd(topic.faqs)? (when length >= 2)]`. `topicDatasetJsonLd` mirrors
`placeDatasetJsonLd`: `variableMeasured = facts.map(({key,label,cited}) => citedPropertyValue({
name: label, cited, id: <url>#<key> }))`, `dateModified = maxVerifiedDate(facts.map(f => f.cited))`.
If `faqs` are rendered, the visible `FaqItem` `<h3>` text must equal the FAQPage `Question.name`.

### 3G. Guard extensions + endpoint + llms.txt

Exactly as Task 2I/2H/2J but for `topics`, with the `validate-jsonld.ts` `/topics/` block
requiring a `Dataset` node (reuse the existing regime Dataset assertion shape).

- [ ] Verify: full suite green (`pnpm test`, `pnpm verify:data`, `pnpm --filter @where/web build`,
  `pnpm verify:build`, `pnpm check`, `pnpm typecheck`), all exit 0.
- [ ] Commit (explicit paths).

---

## Definition of done (whole increment)

- `pnpm test` green (data + engine + web).
- `pnpm verify:data` exits 0, freshness + uniqueness now walking qa + topics.
- `pnpm verify:build` exits 0, with `validate-jsonld` covering `/answers/` (QAPage) and `/topics/`
  (Dataset), and every other guard green on the new pages.
- `pnpm --filter @where/web build` exits 0; each `/answers/<slug>` and `/topics/<slug>` page renders
  real cited data (resolved from place/regime facts) through the live components.
- No figure is duplicated: every qa/topics fact is a reference to an existing place/regime fact.
