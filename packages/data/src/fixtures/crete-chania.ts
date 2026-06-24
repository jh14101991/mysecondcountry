import { type Place, PlaceSchema } from "../schema.js";

/**
 * Chania, Crete, Greece. The first hand-authored, fully cited Place. Every value was
 * verified against its source on the verifiedDate below. Confidence reflects source
 * class per CITATIONS.md: Eurostat and Koppen are high; the HNMS climate normals are
 * cited via Wikipedia and marked low; the visa and tax figures are official-authority
 * but machine-unreadable / change-prone, so medium with a short staleness window.
 *
 * This object is parsed at load time, so an authoring error throws immediately rather
 * than shipping an uncited or malformed claim.
 */
const chaniaData = {
  id: "gr-crete-chania",
  slug: "chania",
  granularity: "town",
  parentId: "gr-crete",
  name: "Chania",
  country: "Greece",
  coordinates: { lat: 35.5138, lon: 24.018 },
  ancestry: [
    { name: "Greece", slug: "greece", granularity: "country" },
    { name: "Crete", slug: "crete", granularity: "region" },
  ],
  description:
    "Chania sits on the northwest coast of Crete, a harbour town built around a Venetian old town and working port. The facts below are screened, sourced, and dated for anyone weighing a move there. They are not advice.",
  costOfLiving: {
    priceLevelIndexEU27: {
      value: 86.5,
      sourceUrl: "https://ec.europa.eu/eurostat/databrowser/view/tec00120/default/table",
      sourceName:
        "Eurostat, price level index for actual individual consumption (tec00120, EU27=100)",
      verifiedDate: "2026-06-24",
      confidence: "high",
      granularity: "country",
      category: "cost",
      excerpt:
        "Greece price level index for actual individual consumption (EU27 = 100): 86.5 in 2024, about 13 percent below the EU average.",
    },
  },
  climate: {
    averageJanuaryHighC: {
      value: 14.0,
      sourceUrl: "https://en.wikipedia.org/wiki/Chania",
      sourceName:
        "Hellenic National Meteorological Service climate atlas, Chania (Souda) 1971 to 2000, via Wikipedia",
      verifiedDate: "2026-06-24",
      confidence: "low",
      granularity: "town",
      category: "climate",
      excerpt:
        "Chania (Souda airport), 1971 to 2000 normals: mean daily maximum 14.0 C in January.",
    },
    averageJulyHighC: {
      value: 30.5,
      sourceUrl: "https://en.wikipedia.org/wiki/Chania",
      sourceName:
        "Hellenic National Meteorological Service climate atlas, Chania (Souda) 1971 to 2000, via Wikipedia",
      verifiedDate: "2026-06-24",
      confidence: "low",
      granularity: "town",
      category: "climate",
      excerpt:
        "Chania (Souda airport), 1971 to 2000 normals: mean daily maximum 30.5 C in July, the hottest month.",
    },
    averageAnnualSunHours: {
      value: 2813.7,
      sourceUrl: "https://en.wikipedia.org/wiki/Chania",
      sourceName:
        "Hellenic National Meteorological Service climate atlas, Chania (Souda) 1971 to 2000, via Wikipedia",
      verifiedDate: "2026-06-24",
      confidence: "low",
      granularity: "town",
      category: "climate",
      excerpt: "Mean annual sunshine 2,813.7 hours (Chania Souda, 1971 to 2000 normals).",
    },
    koppenClass: {
      value: "Csa",
      sourceUrl: "https://www.gloh2o.org/koppen/",
      sourceName: "GloH2O Koppen-Geiger climate classification (Beck et al. 2023)",
      verifiedDate: "2026-06-24",
      confidence: "high",
      granularity: "town",
      category: "climate",
      excerpt:
        "Koppen-Geiger class Csa, hot-summer Mediterranean, the dominant class for coastal Crete.",
    },
  },
  residency: {
    digitalNomadVisa: {
      value: 3500,
      sourceUrl: "https://migration.gov.gr/en/gas/aitoyntes-kai-dikaioychoi/adeies-diamonis/",
      sourceName:
        "Hellenic Ministry of Migration and Asylum, digital nomad residence permit (Migration Code, Law 5038/2023)",
      verifiedDate: "2026-06-24",
      confidence: "medium",
      granularity: "country",
      category: "visa",
      stalenessDays: 60,
      excerpt:
        "Digital nomad residence permit: minimum net monthly income 3,500 euros, plus 20 percent for a spouse and 15 percent per child. National entry visa valid 12 months, convertible to a 2 year renewable permit.",
    },
  },
  tax: {
    headlinePersonalIncomeTaxRate: {
      value: 44,
      sourceUrl: "https://taxsummaries.pwc.com/greece/individual/taxes-on-personal-income",
      sourceName: "PwC Worldwide Tax Summaries, Greece, taxes on personal income",
      verifiedDate: "2026-06-24",
      confidence: "medium",
      granularity: "country",
      category: "tax",
      excerpt:
        "Top marginal personal income tax rate of 44 percent on income above 60,000 euros (general scale 9, 20, 26, 34, 39, 44 percent).",
    },
  },
};

export const chania: Place = PlaceSchema.parse(chaniaData);
