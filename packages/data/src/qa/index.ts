import { resolveCitedOrRef } from "../resolve.js";
import spainGoldenVisaRaw from "./can-i-still-get-a-spanish-golden-visa.json" with { type: "json" };
import greecePensionRaw from "./does-greece-tax-foreign-pensions-at-7-percent.json" with {
  type: "json",
};
import portugalNhrRaw from "./is-portugals-nhr-tax-regime-still-available.json" with {
  type: "json",
};
import { type Qa, QaInputSchema } from "./schema.js";
import greeceExpiryRaw from "./what-happens-when-greece-7-percent-pensioner-tax-expires.json" with {
  type: "json",
};
import greeceDisqualifiersRaw from "./who-does-not-qualify-for-greece-7-percent-pensioner-tax.json" with {
  type: "json",
};

const RAW: unknown[] = [
  spainGoldenVisaRaw,
  greecePensionRaw,
  portugalNhrRaw,
  greeceDisqualifiersRaw,
  greeceExpiryRaw,
];

function resolveQa(raw: unknown): Qa {
  const input = QaInputSchema.parse(raw);
  const answerFact = resolveCitedOrRef(input.answerFact);
  if (
    !["high", "medium"].includes(answerFact.confidence) ||
    !["tax", "visa", "residency"].includes(answerFact.category ?? "")
  ) {
    throw new Error(
      `qa ${input.id}: answerFact must resolve to a high|medium tax/visa/residency CitedValue`,
    );
  }
  return {
    ...input,
    answerFact,
    supportingFacts: input.supportingFacts.map((f) => ({
      label: f.label,
      cited: resolveCitedOrRef(f.cited),
    })),
  };
}

export const qa: Qa[] = RAW.map(resolveQa);

export function qaBySlug(slug: string): Qa | undefined {
  return qa.find((q) => q.slug === slug);
}
export function qaById(id: string): Qa | undefined {
  return qa.find((q) => q.id === id);
}
