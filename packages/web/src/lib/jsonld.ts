import { type Place, placePath } from "@where/data";

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
