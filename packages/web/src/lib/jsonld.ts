import {
  collectRegimeCitedValues,
  type Place,
  placeById,
  placePath,
  type Regime,
  regimeFactId,
} from "@where/data";

type JsonLdNode = Record<string, unknown>;

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
    isPartOf: {
      "@type": "DataCatalog",
      name: "My Second Country relocation dataset",
      url: siteUrl,
    },
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

/**
 * schema.org Dataset markup for a tax regime page.
 * The @id and url use the canonical mysecondcountry.com host.
 */
export function regimeDatasetJsonLd(regime: Regime, siteUrl: string): JsonLdNode {
  const countryPlace = placeById(regime.countryId);
  if (!countryPlace) {
    throw new Error(`Regime ${regime.id} references unknown countryId "${regime.countryId}"`);
  }
  const country = countryPlace.slug;
  const url = `${siteUrl}/${country}/tax/${regime.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": url,
    name: regime.name,
    description: regime.summary,
    url,
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "My Second Country",
      url: siteUrl,
    },
    license: siteUrl,
    isPartOf: {
      "@type": "DataCatalog",
      name: "My Second Country relocation dataset",
      url: siteUrl,
    },
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${siteUrl}/data/regimes/${regime.slug}.json`,
      },
    ],
    variableMeasured: collectRegimeCitedValues(regime).map(({ path }) => ({
      "@type": "PropertyValue",
      "@id": regimeFactId(regime.id, path),
      name: path,
    })),
  };
}
