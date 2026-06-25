import {
  type CitedValue,
  collectCitedValues,
  collectRegimeCitedValues,
  collectTopicsCitedValues,
  type Place,
  placeById,
  placePath,
  type Regime,
  regimeFactId,
  type Topic,
} from "@where/data";
import { CONFIDENCE_DISPLAY } from "./cited.ts";

type JsonLdNode = Record<string, unknown>;

const ORG = (siteUrl: string): JsonLdNode => ({
  "@type": "Organization",
  name: "My Second Country",
  url: siteUrl,
});

const DATA_CATALOG = (siteUrl: string): JsonLdNode => ({
  "@type": "DataCatalog",
  name: "My Second Country relocation dataset",
  url: siteUrl,
});

/** Newest verifiedDate across a set of CitedValues. The page's freshness signal. */
export function maxVerifiedDate(cited: Pick<CitedValue, "verifiedDate">[]): string {
  return cited.reduce((max, c) => (c.verifiedDate > max ? c.verifiedDate : max), "0000-00-00");
}

/**
 * One enriched schema.org PropertyValue per cited fact: value, unit, the source URL, the
 * source name and verified date as description, and the confidence tier as the measurement
 * technique. This is the machine half of every CitedValue, read by AI answer engines.
 */
export function citedPropertyValue(opts: {
  name: string;
  cited: CitedValue;
  unitText?: string;
  id?: string;
}): JsonLdNode {
  const { name, cited, unitText, id } = opts;
  return {
    "@type": "PropertyValue",
    ...(id ? { "@id": id } : {}),
    name,
    value: cited.value,
    ...(unitText ? { unitText } : {}),
    url: cited.sourceUrl,
    description: `${cited.sourceName}, verified ${cited.verifiedDate}`,
    measurementTechnique: `${CONFIDENCE_DISPLAY[cited.confidence].word} confidence`,
  };
}

/** schema.org Article carrying the page's freshness signal (dateModified = newest verifiedDate). */
export function articleJsonLd(opts: {
  url: string;
  headline: string;
  description: string;
  dateModified: string;
  siteUrl: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${opts.url}#article`,
    headline: opts.headline,
    description: opts.description,
    dateModified: opts.dateModified,
    url: opts.url,
    isAccessibleForFree: true,
    author: ORG(opts.siteUrl),
    publisher: ORG(opts.siteUrl),
    mainEntityOfPage: opts.url,
  };
}

/**
 * schema.org BreadcrumbList from ordered crumbs. Each crumb's `href` is a relative path
 * (the same value the visible Breadcrumb renders); the absolute `item` url is built here so
 * the trail and its structured data are driven by one array.
 */
export function breadcrumbJsonLd(
  items: { name: string; href?: string }[],
  siteUrl: string,
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.href ? { item: `${siteUrl}${it.href}` } : {}),
    })),
  };
}

/** schema.org FAQPage. Each Question.name must match a visible heading (assert-faq-jsonld). */
export function faqPageJsonLd(items: { question: string; answer: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

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

/** schema.org DefinedTerm for a named legal instrument (a tax regime, a visa route). */
export function definedTermJsonLd(opts: {
  url: string;
  name: string;
  description: string;
  siteUrl: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${opts.url}#term`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inDefinedTermSet: DATA_CATALOG(opts.siteUrl),
  };
}

/** Nested schema.org Place chain from ancestry (country -> ... -> immediate parent). */
function containedInPlace(place: Place): JsonLdNode | undefined {
  return place.ancestry.reduce<JsonLdNode | undefined>(
    (child, ancestor) => ({
      "@type": "Place",
      name: ancestor.name,
      ...(child ? { containedInPlace: child } : {}),
    }),
    undefined,
  );
}

/**
 * schema.org Place markup with a DataCatalog reference (plan 1d, DOD d). The @id and url
 * use the canonical mysecondcountry.com host.
 */
export function placeJsonLd(place: Place, siteUrl: string): JsonLdNode {
  const url = `${siteUrl}${placePath(place)}`;
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": url,
    name: place.name,
    description: place.description,
    url,
    isPartOf: DATA_CATALOG(siteUrl),
  };

  const within = containedInPlace(place);
  if (within) node.containedInPlace = within;

  if (place.coordinates) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: place.coordinates.lat,
      longitude: place.coordinates.lon,
    };
  }

  return node;
}

/** Human label and unit for a Place's cited fields, keyed by collectCitedValues path. */
const PLACE_FIELD_META: Record<string, { name: string; unitText?: string }> = {
  "costOfLiving.priceLevelIndexEU27": {
    name: "Cost of living, price level index",
    unitText: "EU27=100",
  },
  "climate.averageJanuaryHighC": { name: "Average January high", unitText: "degrees Celsius" },
  "climate.averageJulyHighC": { name: "Average July high", unitText: "degrees Celsius" },
  "climate.averageAnnualSunHours": { name: "Annual sunshine", unitText: "hours per year" },
  "climate.koppenClass": { name: "Koppen-Geiger climate class" },
  "residency.digitalNomadVisa": {
    name: "Digital nomad visa, minimum net income",
    unitText: "EUR per month",
  },
  "residency.goldenVisa": { name: "Investor residency (golden visa)" },
  "tax.headlinePersonalIncomeTaxRate": {
    name: "Top personal income tax rate",
    unitText: "percent",
  },
  "tax.specialRegime": { name: "Special tax regime for movers" },
  "healthcare.physiciansPer1000": { name: "Physicians per 1,000 people", unitText: "per 1,000" },
  "safety.peaceIndexScore": { name: "Global Peace Index score" },
};

/**
 * schema.org Dataset for a Place, with one enriched PropertyValue per cited field.
 * Pairs with placeJsonLd; the page emits both plus Article and BreadcrumbList.
 */
export function placeDatasetJsonLd(place: Place, siteUrl: string): JsonLdNode {
  const url = `${siteUrl}${placePath(place)}`;
  const facts = collectCitedValues(place);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: `${place.name}: cited relocation facts`,
    description: place.description,
    url,
    isAccessibleForFree: true,
    creator: ORG(siteUrl),
    license: siteUrl,
    isPartOf: DATA_CATALOG(siteUrl),
    dateModified: maxVerifiedDate(facts.map((f) => f.cited)),
    variableMeasured: facts.map(({ path, cited }) =>
      citedPropertyValue({
        name: PLACE_FIELD_META[path]?.name ?? path,
        unitText: PLACE_FIELD_META[path]?.unitText,
        cited,
        id: `${url}#${path}`,
      }),
    ),
  };
}

/**
 * schema.org ItemList for a shortlist page. Each item is a ranked ListItem pointing to a
 * place URL. Required primary type for /shortlists/ pages (validate-jsonld guards for it).
 */
export function itemListJsonLd(opts: {
  url: string;
  items: { position: number; name: string; url: string }[];
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${opts.url}#list`,
    url: opts.url,
    itemListElement: opts.items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * schema.org HowTo for a tools (checklist) page. Each step becomes a HowToStep.
 * Required primary type for /tools/ pages (validate-jsonld guards for it).
 */
export function howToJsonLd(opts: {
  url: string;
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${opts.url}#howto`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * schema.org Dataset for a Topic page, with one enriched PropertyValue per cited fact.
 * Mirrors placeDatasetJsonLd; dateModified = maxVerifiedDate(facts.map(f => f.cited)).
 */
export function topicDatasetJsonLd(topic: Topic, siteUrl: string): JsonLdNode {
  const url = `${siteUrl}/topics/${topic.slug}`;
  const facts = collectTopicsCitedValues(topic);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: topic.title,
    description: topic.context,
    url,
    isAccessibleForFree: true,
    creator: ORG(siteUrl),
    license: siteUrl,
    isPartOf: DATA_CATALOG(siteUrl),
    dateModified: maxVerifiedDate(facts.map((f) => f.cited)),
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${siteUrl}/data/topics/${topic.slug}.json`,
      },
    ],
    variableMeasured: topic.facts.map((fact) =>
      citedPropertyValue({
        name: fact.label,
        cited: fact.cited,
        id: `${url}#${fact.key}`,
      }),
    ),
  };
}

/** Human label and unit for a Regime's cited fields, keyed by collectRegimeCitedValues path. */
const REGIME_FIELD_META: Record<string, { name: string; unitText?: string }> = {
  headlineRate: { name: "Headline tax rate", unitText: "percent" },
  durationYears: { name: "Maximum regime duration", unitText: "years" },
  "eligibility.priorNonResidency": { name: "Prior non-residency requirement" },
  "eligibility.qualifyingCountry": { name: "Qualifying country of transfer" },
  "eligibility.residencyObligation": { name: "Residency obligation during the regime" },
  "eligibility.applicationWindow": { name: "Application window" },
  "eligibility.knownCatch": { name: "Known catch" },
  "eligibility.investmentRequirement": { name: "Minimum investment requirement" },
  "eligibility.priorRegimeExclusion": { name: "Prior-regime exclusion" },
};

/**
 * schema.org Dataset markup for a tax regime page, with one enriched PropertyValue per
 * cited fact. The @id and url use the canonical mysecondcountry.com host.
 */
export function regimeDatasetJsonLd(regime: Regime, siteUrl: string): JsonLdNode {
  const countryPlace = placeById(regime.countryId);
  if (!countryPlace) {
    throw new Error(`Regime ${regime.id} references unknown countryId "${regime.countryId}"`);
  }
  const country = countryPlace.slug;
  const url = `${siteUrl}/${country}/tax/${regime.slug}`;
  const facts = collectRegimeCitedValues(regime);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: regime.name,
    description: regime.summary,
    url,
    isAccessibleForFree: true,
    creator: ORG(siteUrl),
    license: siteUrl,
    isPartOf: DATA_CATALOG(siteUrl),
    dateModified: maxVerifiedDate(facts.map((f) => f.cited)),
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${siteUrl}/data/regimes/${regime.slug}.json`,
      },
    ],
    variableMeasured: facts.map(({ path, cited }) =>
      citedPropertyValue({
        name: REGIME_FIELD_META[path]?.name ?? path,
        unitText:
          path === "headlineRate"
            ? regime.rateType === "lumpSum"
              ? "EUR per year"
              : "percent"
            : REGIME_FIELD_META[path]?.unitText,
        cited,
        id: regimeFactId(regime.id, path),
      }),
    ),
  };
}
