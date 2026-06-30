import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADAPTER_OUTPUT_ROW_KEYS,
  ADAPTER_REGISTRY_PATH,
  buildAdapterCliReport,
  buildAfterHoursPharmacyProxyRow,
  buildAirportSummerDirectDestinationsRow,
  buildAirportWinterRouteRatioRow,
  buildArcgisImageSamplesFetchRequest,
  buildBlueFlagAwardsFetchRequest,
  buildBlueFlagBeachRow,
  buildBusFrequencyProxyRow,
  buildCarDependencyProxyRow,
  buildCircleSamplePoints,
  buildCitizenServiceCentreDistanceRow,
  buildCopernicusHrlForestTreeRows,
  buildCruisePassengerPressureRow,
  buildEdoCdiDroughtFrequencyRow,
  buildEdoCdiTenDayDateSeries,
  buildEdoCdiWcsGeoTiffUrl,
  buildFamilyAmenityDensityRow,
  buildFeatureRouteRows,
  buildGreenUrbanProxyRow,
  buildInternationalSchoolDistanceRow,
  buildInternationalSchoolTuitionRow,
  buildLandRegistryOfficeDistanceRow,
  buildManualTransportScheduleRow,
  buildManualTransportScheduleRowsForBundle,
  buildMunicipalDigitalServicesRow,
  buildOpenMeteoAirQualityUrl,
  buildOpenMeteoElevationUrl,
  buildOpenMeteoEnvironmentRows,
  buildOpenMeteoPollenSeverityRow,
  buildOpenMeteoPollenUrl,
  buildOpenMeteoSnowfallUrl,
  buildOpenMeteoUvIndexRow,
  buildOpenMeteoUvIndexUrl,
  buildOsmAccessOverpassQuery,
  buildOsmAccessRows,
  buildOsmEmergencyVetOverpassQuery,
  buildOsmEmergencyVetProxyRow,
  buildOsmFeatureOverpassQuery,
  buildOsmMountainPeakOverpassQuery,
  buildOsmOutdoorOverpassQuery,
  buildOsmOutdoorRows,
  buildOsmSeasonalServiceDropoffRow,
  buildOsmSeasonalServiceOverpassQuery,
  buildOsmSurfaceWaterDensityRow,
  buildOsmSurfaceWaterOverpassQuery,
  buildOsmTerrainSlopeOverpassQuery,
  buildOsmWildfireEgressOverpassQuery,
  buildOsmWildfireEgressProxyRow,
  buildOsrmTableFetchRequest,
  buildOverpassFetchRequest,
  buildProtectedAreaDistanceProxyRow,
  buildResidencePermitOfficeDistanceRow,
  buildSceneryTagsRow,
  buildSeatracAccessibleBeachRow,
  buildSeatracDirectoryFetchRequest,
  buildSeatracSearchFetchRequest,
  buildTaxOfficeDistanceRow,
  buildTerrainSlopeRows,
  buildTownMountainProximityRow,
  buildViirsLightPollutionRow,
  buildWaterRestrictionHistoryRow,
  buildWriAqueductWaterStressBaselineRow,
  calculateCopernicusHrlForestTreeMetrics,
  calculateEdoCdiDroughtFrequencyMetrics,
  calculateTerrainSlopeMetrics,
  calculateViirsLightPollutionMetricsFromRasterWindow,
  calculateWildfireEgressRoadDependenceScore,
  extractEdoCdiLatestDateFromWmsCapabilities,
  extractRepresentativeCoordinate,
  extractSeatracCsrfToken,
  filterChangedReplacementRows,
  filterFeatureCandidates,
  parseAdapterCliArgs,
  parseArcgisImageSamplesResponse,
  parseBlueFlagAwardsHtml,
  parseEdoCdiGeoTiff,
  parseOpenMeteoElevationResponse,
  parseOpenMeteoPm25Response,
  parseOpenMeteoPollenResponse,
  parseOpenMeteoSnowfallResponse,
  parseOpenMeteoUvIndexResponse,
  parseOsmEmergencyVetResponse,
  parseOsmFeatureResponse,
  parseOsmMountainPeakResponse,
  parseOsmOutdoorResponse,
  parseOsmSeasonalServiceResponse,
  parseOsmSurfaceWaterResponse,
  parseOsmTerrainSlopeResponse,
  parseOsmWildfireEgressResponse,
  parseOsrmTableResponse,
  parseOverpassCountResponse,
  parseSeatracSearchHtml,
  sampleEdoCdiGeoTiffAtPoint,
  selectFastestRouteCandidate,
  selectNearestElevatedPeak,
  summarizeRegionalAfterHoursPharmacyProxyRows,
  summarizeRegionalBusFrequencyProxyRows,
  summarizeRegionalCarDependencyProxyRows,
  summarizeRegionalCitizenServiceCentreDistanceRows,
  summarizeRegionalCopernicusHrlRows,
  summarizeRegionalCruisePassengerPressureRows,
  summarizeRegionalEdoCdiDroughtFrequencyRows,
  summarizeRegionalFamilyAmenityRows,
  summarizeRegionalGreenUrbanProxyRows,
  summarizeRegionalInternationalSchoolDistanceRows,
  summarizeRegionalLandRegistryOfficeDistanceRows,
  summarizeRegionalMountainProximityRows,
  summarizeRegionalOpenMeteoEnvironmentRows,
  summarizeRegionalOpenMeteoPollenSeverityRows,
  summarizeRegionalOpenMeteoUvIndexRows,
  summarizeRegionalOsmAccessRows,
  summarizeRegionalOsmEmergencyVetProxyRows,
  summarizeRegionalOsmOutdoorRows,
  summarizeRegionalOsmSeasonalServiceDropoffRows,
  summarizeRegionalOsmSurfaceWaterDensityRows,
  summarizeRegionalOsmWildfireEgressProxyRows,
  summarizeRegionalProtectedAreaDistanceRows,
  summarizeRegionalResidencePermitOfficeDistanceRows,
  summarizeRegionalRouteRows,
  summarizeRegionalSceneryTagsRows,
  summarizeRegionalTaxOfficeDistanceRows,
  summarizeRegionalTerrainSlopeRows,
  summarizeRegionalViirsLightPollutionRows,
  summarizeRegionalWaterRestrictionHistoryRows,
  summarizeSeatracRegionPages,
  validateManualTransportScheduleRecord,
  validateOverpassSnapshot,
} from "../run-city-matrix-adapters.js";

type AdapterBundle = Parameters<typeof buildCarDependencyProxyRow>[0]["bundle"];
type AdapterRow = AdapterBundle["rows"][number];

const target = {
  id: "gr-crete-chania",
  placeName: "Chania",
  granularity: "town" as const,
  lat: 35.5120831,
  lon: 24.0191544,
};

function citedNumberRow(key: string, value: number, sourceName: string) {
  return {
    key,
    label: key,
    matrixCategory: "health_family_schooling" as const,
    intendedGranularity: "town" as const,
    observedGranularity: "town" as const,
    coverageStatus: "proxy" as const,
    cited: {
      value,
      sourceUrl: `https://example.com/${key}`,
      sourceName,
      verifiedDate: "2026-06-28",
      confidence: "medium" as const,
      granularity: "town" as const,
    },
    unit: key === "green_space_pct" ? "percent" : "OSM features within 2 km",
    notes: "test component row",
  };
}

function citedStringRow(key: string, value: string, sourceName: string) {
  return {
    key,
    label: key,
    matrixCategory: "nature_environment" as const,
    intendedGranularity: "town" as const,
    observedGranularity: "town" as const,
    coverageStatus: "proxy" as const,
    cited: {
      value,
      sourceUrl: `https://example.com/${key}`,
      sourceName,
      verifiedDate: "2026-06-28",
      confidence: "medium" as const,
      granularity: "town" as const,
    },
    unit: key,
    notes: "test component row",
  };
}

function writeTiffEntry({
  buffer,
  entryOffset,
  tag,
  type,
  count,
  value,
}: {
  buffer: Buffer;
  entryOffset: number;
  tag: number;
  type: number;
  count: number;
  value: number;
}) {
  buffer.writeUInt16LE(tag, entryOffset);
  buffer.writeUInt16LE(type, entryOffset + 2);
  buffer.writeUInt32LE(count, entryOffset + 4);
  if (type === 3 && count === 1) {
    buffer.writeUInt16LE(value, entryOffset + 8);
  } else {
    buffer.writeUInt32LE(value, entryOffset + 8);
  }
}

function makeTinyEdoCdiGeoTiff(): Buffer {
  const entryCount = 10;
  const ifdOffset = 8;
  const rasterOffset = ifdOffset + 2 + entryCount * 12 + 4;
  const pixelScaleOffset = rasterOffset + 4;
  const tiepointOffset = pixelScaleOffset + 24;
  const buffer = Buffer.alloc(tiepointOffset + 48);
  buffer.write("II", 0, "ascii");
  buffer.writeUInt16LE(42, 2);
  buffer.writeUInt32LE(ifdOffset, 4);
  buffer.writeUInt16LE(entryCount, ifdOffset);

  const entries = [
    [256, 4, 1, 2],
    [257, 4, 1, 2],
    [258, 3, 1, 8],
    [259, 3, 1, 1],
    [273, 4, 1, rasterOffset],
    [277, 3, 1, 1],
    [278, 4, 1, 2],
    [279, 4, 1, 4],
    [33550, 12, 3, pixelScaleOffset],
    [33922, 12, 6, tiepointOffset],
  ] as const;
  entries.forEach(([tag, type, count, value], index) => {
    writeTiffEntry({
      buffer,
      entryOffset: ifdOffset + 2 + index * 12,
      tag,
      type,
      count,
      value,
    });
  });

  Buffer.from([1, 2, 3, 4]).copy(buffer, rasterOffset);
  [0.5, 0.5, 0].forEach((value, index) => {
    buffer.writeDoubleLE(value, pixelScaleOffset + index * 8);
  });
  [0, 0, 0, -25, 72, 0].forEach((value, index) => {
    buffer.writeDoubleLE(value, tiepointOffset + index * 8);
  });
  return buffer;
}

describe("city matrix adapters", () => {
  it("registers every row produced by the current adapter runner", () => {
    const registry = JSON.parse(readFileSync(resolve(ADAPTER_REGISTRY_PATH), "utf8")) as {
      adapters: Array<{
        id?: string;
        compilerLane?: string;
        sourceFamily?: string;
        batchScope?: string;
        command?: string;
        proxyCaveat?: string;
        rowKeys?: string[];
      }>;
    };
    const registeredRowKeys = new Set(
      registry.adapters.flatMap((adapter) => adapter.rowKeys ?? []),
    );

    expect(registry.adapters.length).toBeGreaterThan(0);
    for (const adapter of registry.adapters) {
      expect(adapter.id).toMatch(/^[a-z0-9-]+$/);
      expect(adapter.compilerLane).toMatch(
        /^(geospatial_adapter|derived_formula|api_adapter|ai_official_crawl|licensed_or_manual)$/,
      );
      expect(adapter.sourceFamily).toMatch(/^[a-z0-9_]+$/);
      expect(adapter.batchScope).toMatch(/^(cluster|town|region|country|manual_batch)$/);
      expect(adapter.command).toContain("pnpm data:city-adapters");
      expect(adapter.proxyCaveat).toMatch(/\S/);
      expect(adapter.rowKeys?.length).toBeGreaterThan(0);
    }
    expect([...registeredRowKeys].sort()).toEqual([...ADAPTER_OUTPUT_ROW_KEYS].sort());
  });

  it("reports registry adapter names instead of one opaque adapter string", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "terrain",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: slope_proxy, stroller_hilliness_proxy"],
      },
    );

    expect(report.adapterIds).toEqual(["terrain-slope"]);
    expect(report.sourceFamilies).toEqual(["osm_open_meteo_terrain"]);
    expect(report.rowKeys).toEqual(["slope_proxy", "stroller_hilliness_proxy"]);
    expect(report).not.toHaveProperty("adapter");
  });

  it("reports the Blue Flag adapter as its own official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "blue-flag",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: blue_flag_beaches"],
      },
    );

    expect(report.adapterIds).toEqual(["blue-flag-awards"]);
    expect(report.sourceFamilies).toEqual(["blue_flag_awards"]);
    expect(report.rowKeys).toEqual(["blue_flag_beaches"]);
  });

  it("reports the Crete pharmacy-duty adapter as a repeatable official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "pharmacy-duty",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: after_hours_pharmacy_proxy"],
      },
    );

    expect(report.adapterIds).toEqual(["crete-pharmacy-duty-rota"]);
    expect(report.sourceFamilies).toEqual(["crete_pharmacy_duty_rota"]);
    expect(report.rowKeys).toEqual(["after_hours_pharmacy_proxy"]);
  });

  it("reports the Chania airport summer destination adapter as a town official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "airport-summer-direct-destinations",
        regionId: null,
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: airport_summer_direct_destinations"],
      },
    );

    expect(report.adapterIds).toEqual(["chania-airport-summer-direct-destinations"]);
    expect(report.sourceFamilies).toEqual(["fraport_chania_airport_timetable"]);
    expect(report.rowKeys).toEqual(["airport_summer_direct_destinations"]);
  });

  it("reports transport schedule manual intake as a licensed/manual batch", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "transport-schedule-manual",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
        manualSchedulePath: "docs/data/manual/transport-schedule-manual.json",
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: airport_winter_direct_destinations"],
      },
    );

    expect(report.adapterIds).toEqual(["transport-schedule-manual-intake"]);
    expect(report.sourceFamilies).toEqual(["transport_schedule_manual"]);
    expect(report.rowKeys).toEqual([
      "airport_winter_direct_destinations",
      "airport_summer_direct_destinations",
      "airport_winter_route_ratio",
      "ferry_routes_winter",
      "ferry_routes_summer",
    ]);
  });

  it("reports the WRI Aqueduct water-stress baseline adapter as its own source family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "water-stress-baseline",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: water_stress_baseline"],
      },
    );

    expect(report.adapterIds).toEqual(["wri-aqueduct-water-stress-baseline"]);
    expect(report.sourceFamilies).toEqual(["wri_aqueduct_water_stress"]);
    expect(report.rowKeys).toEqual(["water_stress_baseline"]);
  });

  it("reports the OSM seasonal-service adapter as a repeatable geospatial family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "seasonal-service-dropoff",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: seasonal_service_dropoff_proxy"],
      },
    );

    expect(report.adapterIds).toEqual(["osm-seasonal-service-dropoff"]);
    expect(report.sourceFamilies).toEqual(["osm_seasonal_opening_hours"]);
    expect(report.rowKeys).toEqual(["seasonal_service_dropoff_proxy"]);
  });

  it("reports the OSM emergency-vet adapter as a repeatable geospatial family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "emergency-vet",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: emergency_vet_proxy"],
      },
    );

    expect(report.adapterIds).toEqual(["osm-emergency-vet-proxy"]);
    expect(report.sourceFamilies).toEqual(["osm_emergency_vet_tags"]);
    expect(report.rowKeys).toEqual(["emergency_vet_proxy"]);
  });

  it("reports the Open-Meteo pollen adapter as a repeatable geospatial family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "pollen-severity",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: pollen_severity"],
      },
    );

    expect(report.adapterIds).toEqual(["open-meteo-cams-pollen-severity"]);
    expect(report.sourceFamilies).toEqual(["open_meteo_cams_pollen"]);
    expect(report.rowKeys).toEqual(["pollen_severity"]);
  });

  it("reports the Crete municipal digital-services adapter as a repeatable official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "municipal-digital-services",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: municipal_digital_services"],
      },
    );

    expect(report.adapterIds).toEqual(["crete-municipal-digital-services"]);
    expect(report.sourceFamilies).toEqual(["crete_municipal_digital_services"]);
    expect(report.rowKeys).toEqual(["municipal_digital_services"]);
  });

  it("reports the Crete water-restriction history adapter as a repeatable official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "water-restriction-history",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: water_restriction_history"],
      },
    );

    expect(report.adapterIds).toEqual(["crete-water-restriction-history"]);
    expect(report.sourceFamilies).toEqual(["crete_water_restriction_history"]);
    expect(report.rowKeys).toEqual(["water_restriction_history"]);
  });

  it("reports the Crete KTEL bus-frequency adapter as a repeatable official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "bus-frequency",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: bus_frequency_proxy"],
      },
    );

    expect(report.adapterIds).toEqual(["crete-ktel-bus-frequency"]);
    expect(report.sourceFamilies).toEqual(["crete_ktel_bus_frequency"]);
    expect(report.rowKeys).toEqual(["bus_frequency_proxy"]);
  });

  it("reports the ELIME cruise-passenger adapter as a repeatable official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "cruise-passenger-pressure",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: cruise_passenger_pressure"],
      },
    );

    expect(report.adapterIds).toEqual(["elime-cruise-passenger-pressure"]);
    expect(report.sourceFamilies).toEqual(["elime_cruise_passenger_pressure"]);
    expect(report.rowKeys).toEqual(["cruise_passenger_pressure"]);
  });

  it("reports the derived car-dependency adapter as a formula source family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "car-dependency",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: car_dependency_proxy"],
      },
    );

    expect(report.adapterIds).toEqual(["derived-car-dependency-proxy"]);
    expect(report.sourceFamilies).toEqual(["derived_car_dependency_proxy"]);
    expect(report.rowKeys).toEqual(["car_dependency_proxy"]);
  });

  it("reports the OSM wildfire-egress adapter as a repeatable geospatial family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "wildfire-egress",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: wildfire_egress_proxy"],
      },
    );

    expect(report.adapterIds).toEqual(["osm-wildfire-egress-road-dependence"]);
    expect(report.sourceFamilies).toEqual(["osm_wildfire_egress_road_dependence"]);
    expect(report.rowKeys).toEqual(["wildfire_egress_proxy"]);
  });

  it("reports the VIIRS light-pollution adapter as a repeatable geospatial family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "light-pollution",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: light_pollution"],
      },
    );

    expect(report.adapterIds).toEqual(["zenodo-viirs-light-pollution"]);
    expect(report.sourceFamilies).toEqual(["zenodo_opengeohub_viirs_nightlights"]);
    expect(report.rowKeys).toEqual(["light_pollution"]);
  });

  it("reports the Crete residence-permit office adapter as a route source family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "residence-permit-office",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: residence_permit_office_distance"],
      },
    );

    expect(report.adapterIds).toEqual(["apdkritis-osrm-residence-permit-office-distance"]);
    expect(report.sourceFamilies).toEqual(["apdkritis_osrm_residence_permit_office_route"]);
    expect(report.rowKeys).toEqual(["residence_permit_office_distance"]);
  });

  it("reports the Hellenic Cadastre land-registry office adapter as a route source family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "land-registry-office",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: land_registry_office_distance"],
      },
    );

    expect(report.adapterIds).toEqual(["hellenic-cadastre-osrm-land-registry-office-distance"]);
    expect(report.sourceFamilies).toEqual(["hellenic_cadastre_osrm_land_registry_office_route"]);
    expect(report.rowKeys).toEqual(["land_registry_office_distance"]);
  });

  it("reports the accredited European School adapter as a route source family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "international-school",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: international_school_distance"],
      },
    );

    expect(report.adapterIds).toEqual(["european-school-osrm-international-school-distance"]);
    expect(report.sourceFamilies).toEqual(["european_school_osrm_international_school_route"]);
    expect(report.rowKeys).toEqual(["international_school_distance"]);
  });

  it("reports the selected European School tuition adapter as an official crawl family", () => {
    const report = buildAdapterCliReport(
      {
        write: false,
        only: "international-school-tuition",
        regionId: "gr-crete-region",
        townIds: ["gr-crete-chania"],
      },
      {
        write: false,
        changedBundles: ["gr-crete-chania: intl_school_tuition"],
      },
    );

    expect(report.adapterIds).toEqual(["european-school-tuition-proxy"]);
    expect(report.sourceFamilies).toEqual(["european_school_tuition"]);
    expect(report.rowKeys).toEqual(["intl_school_tuition"]);
  });

  it("parses official Blue Flag award sections into regional-unit and municipality counts", () => {
    const awards = parseBlueFlagAwardsHtml(
      `<h3 class="nomos">CHANIA R.U. [3]</h3>
       <h4 class="dimos">Chania Municipality</h4>
       <p class="akti">Ag. Apostoli 1</p>
       <p class="akti">Nea Chora</p>
       <h4 class="dimos">Apokoronas Municipality</h4>
       <p class="akti">Almyrida</p>
       <h3 class="nomos">RETHYMNO R.U. [1]</h3>
       <h4 class="dimos">Rethymno Municipality</h4>
       <p class="akti">Rethymno 1</p>
       <h3 class="nomos">HERAKLION R.U. [1]</h3>
       <h4 class="dimos">Malevizi Municipality</h4>
       <p class="akti">Ammoudara 1</p>
       <h3 class="nomos">LASITHI R.U. [2]</h3>
       <h4 class="dimos">Agios Nikolaos Municipality</h4>
       <p class="akti">Almyros</p>
       <p class="akti">Kitroplateia</p>
       <h2>MARINAS</h2>
       <h3 class="nomos">LASITHI R.U. [1]</h3>
       <h4 class="dimos">Agios Nikolaos Municipality</h4>
       <p class="akti">Agios Nikolaos Marina</p>`,
      "https://www.blueflag.gr/el/awards/2026",
    );

    expect(awards.regionalUnits.get("CHANIA R.U.")?.declaredCount).toBe(3);
    expect(
      awards.regionalUnits.get("CHANIA R.U.")?.municipalities.get("Chania Municipality"),
    ).toEqual(["Ag. Apostoli 1", "Nea Chora"]);
    expect(
      awards.regionalUnits.get("LASITHI R.U.")?.municipalities.get("Agios Nikolaos Municipality"),
    ).toEqual(["Almyros", "Kitroplateia"]);
  });

  it("builds Blue Flag CitedValues with honest local and regional granularity", () => {
    const awards = parseBlueFlagAwardsHtml(
      `<h3 class="nomos">CHANIA R.U. [3]</h3>
       <h4 class="dimos">Chania Municipality</h4>
       <p class="akti">Ag. Apostoli 1</p>
       <p class="akti">Nea Chora</p>
       <h4 class="dimos">Apokoronas Municipality</h4>
       <p class="akti">Almyrida</p>
       <h3 class="nomos">RETHYMNO R.U. [1]</h3>
       <h4 class="dimos">Rethymno Municipality</h4>
       <p class="akti">Rethymno 1</p>
       <h3 class="nomos">HERAKLION R.U. [1]</h3>
       <h4 class="dimos">Malevizi Municipality</h4>
       <p class="akti">Ammoudara 1</p>
       <h3 class="nomos">LASITHI R.U. [2]</h3>
       <h4 class="dimos">Agios Nikolaos Municipality</h4>
       <p class="akti">Almyros</p>
       <p class="akti">Kitroplateia</p>`,
      "https://www.blueflag.gr/el/awards/2026",
    );
    const baseRow = {
      key: "blue_flag_beaches",
      label: "Blue Flag beaches nearby",
      matrixCategory: "nature_environment" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "requires_geospatial_build",
      notes: "completed gap",
    };
    const chaniaRow = buildBlueFlagBeachRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      awards,
      verifiedDate: "2026-06-29",
    });
    const heraklionRow = buildBlueFlagBeachRow({
      bundle: {
        id: "gr-crete-heraklion",
        placeName: "Heraklion",
        granularity: "town",
        rows: [baseRow],
      },
      awards,
      verifiedDate: "2026-06-29",
    });
    const regionRow = buildBlueFlagBeachRow({
      bundle: {
        id: "gr-crete-region",
        placeName: "Crete",
        granularity: "region",
        rows: [baseRow],
      },
      awards,
      verifiedDate: "2026-06-29",
    });

    expect(chaniaRow.coverageStatus).toBe("local");
    expect(chaniaRow.observedGranularity).toBe("town");
    expect(chaniaRow.cited?.value).toBe(2);
    expect(chaniaRow.sourceGapReason).toBeUndefined();
    expect(heraklionRow.coverageStatus).toBe("inherited_regional");
    expect(heraklionRow.observedGranularity).toBe("region");
    expect(heraklionRow.notes).toContain("no Heraklion Municipality");
    expect(regionRow.coverageStatus).toBe("regional");
    expect(regionRow.cited?.value).toBe(7);
  });

  it("fetches the Blue Flag awards page with the browser headers required by the source", () => {
    const request = buildBlueFlagAwardsFetchRequest();

    expect(request.url).toBe("https://www.blueflag.gr/el/awards/2026");
    expect((request.init.headers as Record<string, string>)["user-agent"]).toContain("Mozilla");
    expect((request.init.headers as Record<string, string>)["accept-language"]).toContain("en");
  });

  it("parses SEATRAC beach search cards with online and uninstalled statuses", () => {
    const html = `
      <div class="directory-head">
        <span class="directory-head__count">Showing: <strong>7 Beaches</strong></span>
      </div>
      <div class="list-beaches">
        <div class="card card--beach card--shadow">
          <div class="card__status"><span class="status-dot status-dot--active"></span>Online</div>
          <h2 class="h2 card__title"><a href="/en/beach-directory/chania-agioi-apostoloi/">Chania Agioi Apostoloi</a></h2>
        </div>
        <div class="card card--beach card--shadow">
          <div class="card__status"><span class="status-dot status-dot--missing"></span>Uninstalled</div>
          <h2 class="h2 card__title"><a href="/en/beach-directory/chania-nea-chora/">Chania Nea Chora</a></h2>
        </div>
      </div>
      <nav class="pagination"><a data-page-number="1">1</a><a data-page-number="2">2</a></nav>
    `;

    const parsed = parseSeatracSearchHtml(html);

    expect(parsed.totalCount).toBe(7);
    expect(parsed.pageNumbers).toEqual([1, 2]);
    expect(parsed.beaches).toEqual([
      {
        title: "Chania Agioi Apostoloi",
        href: "https://seatrac.gr/en/beach-directory/chania-agioi-apostoloi/",
        status: "Online",
      },
      {
        title: "Chania Nea Chora",
        href: "https://seatrac.gr/en/beach-directory/chania-nea-chora/",
        status: "Uninstalled",
      },
    ]);
  });

  it("builds SEATRAC accessible-beach CitedValues with active-count caveats", () => {
    const chaniaDirectory = summarizeSeatracRegionPages({
      region: "Chania",
      pages: [
        `<span>Showing: <strong>2 Beaches</strong></span>
         <div class="card card--beach"><div class="card__status"><span></span>Online</div>
         <h2 class="card__title"><a href="/en/beach-directory/chania-agioi-apostoloi/">Chania Agioi Apostoloi</a></h2></div>
         <div class="card card--beach"><div class="card__status"><span></span>Uninstalled</div>
         <h2 class="card__title"><a href="/en/beach-directory/chania-nea-chora/">Chania Nea Chora</a></h2></div>`,
      ],
    });
    const lasithiDirectory = summarizeSeatracRegionPages({
      region: "Lasithi",
      pages: [
        `<span>Showing: <strong>1 Beaches</strong></span>
         <div class="card card--beach"><div class="card__status"><span></span>Uninstalled</div>
         <h2 class="card__title"><a href="/en/beach-directory/ierapetra-gorgona/">Ierapetra Gorgona</a></h2></div>`,
      ],
    });
    const directories = new Map([
      ["Chania", chaniaDirectory],
      ["Lasithi", lasithiDirectory],
    ]);
    const baseRow = {
      key: "accessible_beach_count",
      label: "Accessible beach count",
      matrixCategory: "culture_services" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed gap",
    };

    const chaniaRow = buildSeatracAccessibleBeachRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      directories,
      verifiedDate: "2026-06-29",
    });
    const agiosRow = buildSeatracAccessibleBeachRow({
      bundle: {
        id: "gr-crete-agios-nikolaos",
        placeName: "Agios Nikolaos",
        granularity: "town",
        rows: [baseRow],
      },
      directories,
      verifiedDate: "2026-06-29",
    });

    expect(chaniaRow.coverageStatus).toBe("inherited_regional");
    expect(chaniaRow.cited?.value).toBe(1);
    expect(chaniaRow.cited?.excerpt).toContain("1 Online SEATRAC");
    expect(chaniaRow.cited?.excerpt).toContain("Chania Nea Chora (Uninstalled)");
    expect(chaniaRow.sourceGapReason).toBeUndefined();
    expect(agiosRow.coverageStatus).toBe("proxy");
    expect(agiosRow.cited?.value).toBe(0);
    expect(agiosRow.notes).toContain("zero means no matching SEATRAC directory entry");
    expect(agiosRow.notes).toContain("not a full accessible-beach inventory");
  });

  it("builds SEATRAC requests from public directory tokens", () => {
    expect(extractSeatracCsrfToken('<meta name="csrf-token" content="abc123" />')).toBe("abc123");

    const directoryRequest = buildSeatracDirectoryFetchRequest();
    expect(directoryRequest.url).toBe("https://seatrac.gr/en/beach-directory/");
    expect((directoryRequest.init.headers as Record<string, string>)["user-agent"]).toContain(
      "Mozilla",
    );

    const searchRequest = buildSeatracSearchFetchRequest({
      token: "abc123",
      region: "Chania",
      page: 2,
    });
    expect(searchRequest.url).toBe(
      "https://seatrac.gr/Umbraco/Surface/BeachDirectorySurface/SearchBeaches",
    );
    expect((searchRequest.init.headers as Record<string, string>).__CurrentLocale).toBe("en-US");
    expect(searchRequest.init.body).toBe(JSON.stringify({ Region: "Chania", Page: 2 }));
  });

  it("extracts a representative coordinate from existing Overpass evidence", () => {
    const coordinate = extractRepresentativeCoordinate({
      id: "gr-crete-chania",
      placeName: "Chania",
      granularity: "town",
      rows: [
        {
          key: "dist_coast_km",
          label: "Distance to coast",
          matrixCategory: "nature_environment",
          intendedGranularity: "town",
          coverageStatus: "local",
          cited: {
            value: 0.53,
            sourceUrl:
              "https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%3Bway(around%3A25000%2C35.5120831%2C24.0191544)%5B%22natural%22%3D%22coastline%22%5D%3Bout%20geom%3B",
            sourceName: "OpenStreetMap contributors via Overpass API",
            verifiedDate: "2026-06-28",
            confidence: "medium",
            granularity: "town",
          },
        },
      ],
    });

    expect(coordinate).toEqual({ lat: 35.5120831, lon: 24.0191544 });
  });

  it("builds one Overpass count query for repeatable walkability and accessibility pulls", () => {
    const query = buildOsmAccessOverpassQuery(target);

    expect(query).toContain("[out:json][timeout:90]");
    expect(query).toContain("around:2000,35.5120831,24.0191544");
    expect(query).toContain('"amenity"~');
    expect(query).toContain('"sidewalk"');
    expect(query).toContain('"wheelchair"');
    expect(query).toContain('"public_transport"="station"');
    expect(query.match(/out count/g)).toHaveLength(7);
  });

  it("parses ordered Overpass count elements into named metrics", () => {
    const counts = parseOverpassCountResponse({
      elements: [
        { tags: { total: "126" } },
        { tags: { total: "241" } },
        { tags: { total: "18" } },
        { tags: { total: "31" } },
        { tags: { total: "118" } },
        { tags: { total: "12" } },
        { tags: { total: "3" } },
      ],
    });

    expect(counts).toEqual({
      walkableAmenities: 126,
      walkNetworkWays: 241,
      sidewalkTaggedWays: 18,
      footwayWays: 31,
      wheelchairRelevantAmenities: 118,
      wheelchairTaggedAmenities: 12,
      stepFreeTaggedStations: 3,
    });
  });

  it("builds one Overpass count query for seasonal opening-hours proxies", () => {
    const query = buildOsmSeasonalServiceOverpassQuery(target);

    expect(query).toContain("[out:json][timeout:90]");
    expect(query).toContain("around:2000,35.5120831,24.0191544");
    expect(query).toContain('"amenity"~');
    expect(query).toContain('"shop"~');
    expect(query).toContain('"tourism"~');
    expect(query).toContain("out tags");
    expect(query).not.toContain("out count");
  });

  it("parses ordered seasonal-service Overpass count elements into named metrics", () => {
    const counts = parseOsmSeasonalServiceResponse({
      elements: [{ tags: { total: "100" } }, { tags: { total: "20" } }, { tags: { total: "5" } }],
    });

    expect(counts).toEqual({
      selectedServices: 100,
      openingHoursTaggedServices: 20,
      seasonallyCodedServices: 5,
    });
  });

  it("parses seasonal-service Overpass tag elements into named metrics", () => {
    const counts = parseOsmSeasonalServiceResponse({
      elements: [
        { tags: { amenity: "restaurant", opening_hours: "Mo-Su 09:00-22:00" } },
        { tags: { shop: "clothes", opening_hours: "May-Sep Mo-Su 10:00-20:00" } },
        { tags: { tourism: "hotel", seasonal: "summer" } },
        { tags: { amenity: "pharmacy" } },
      ],
    });

    expect(counts).toEqual({
      selectedServices: 4,
      openingHoursTaggedServices: 2,
      seasonallyCodedServices: 2,
    });
  });

  it("builds one Overpass tag query for emergency veterinary proxies", () => {
    const query = buildOsmEmergencyVetOverpassQuery(target);

    expect(query).toContain("[out:json][timeout:90]");
    expect(query).toContain("around:10000,35.5120831,24.0191544");
    expect(query).toContain('"amenity"="veterinary"');
    expect(query).toContain('"healthcare"="veterinary"');
    expect(query).toContain("out tags");
    expect(query).not.toContain("out count");
  });

  it("parses emergency veterinary tag elements into named metrics", () => {
    const counts = parseOsmEmergencyVetResponse({
      elements: [
        { type: "node", id: 1, tags: { amenity: "veterinary", emergency: "yes" } },
        {
          type: "node",
          id: 2,
          tags: { amenity: "veterinary", opening_hours: "Mo-Fr 09:00-17:00" },
        },
        { type: "way", id: 3, tags: { healthcare: "veterinary", opening_hours: "24/7" } },
        { type: "way", id: 3, tags: { healthcare: "veterinary", opening_hours: "24/7" } },
        { type: "node", id: 4, tags: { amenity: "veterinary", emergency: "no" } },
      ],
    });

    expect(counts).toEqual({
      veterinaryFeatures: 4,
      emergencyTaggedVeterinaryFeatures: 2,
    });
  });

  it("builds one Overpass geometry query for mapped inland-water proxies", () => {
    const query = buildOsmSurfaceWaterOverpassQuery(target);

    expect(query).toContain("[out:json][timeout:120]");
    expect(query).toContain("around:2000,35.5120831,24.0191544");
    expect(query).toContain('"natural"="water"');
    expect(query).toContain('"waterway"="riverbank"');
    expect(query).toContain('"landuse"="reservoir"');
    expect(query).toContain("out geom tags");
  });

  it("samples mapped inland-water polygons and filters sea or pool-like features", () => {
    const metrics = parseOsmSurfaceWaterResponse(
      {
        elements: [
          {
            type: "way",
            id: 1,
            tags: { natural: "water", water: "pond" },
            geometry: [
              { lat: 35.5116344, lon: 24.0186352 },
              { lat: 35.5116344, lon: 24.0196736 },
              { lat: 35.5125318, lon: 24.0196736 },
              { lat: 35.5125318, lon: 24.0186352 },
              { lat: 35.5116344, lon: 24.0186352 },
            ],
          },
          {
            type: "way",
            id: 2,
            tags: { natural: "water", water: "sea" },
            geometry: [
              { lat: 35.5116344, lon: 24.0186352 },
              { lat: 35.5116344, lon: 24.0196736 },
              { lat: 35.5125318, lon: 24.0196736 },
              { lat: 35.5125318, lon: 24.0186352 },
              { lat: 35.5116344, lon: 24.0186352 },
            ],
          },
          {
            type: "way",
            id: 3,
            tags: { natural: "water", water: "basin", name: "Πισίνα Ξενία" },
            geometry: [
              { lat: 35.5116344, lon: 24.0186352 },
              { lat: 35.5116344, lon: 24.0196736 },
              { lat: 35.5125318, lon: 24.0196736 },
              { lat: 35.5125318, lon: 24.0186352 },
              { lat: 35.5116344, lon: 24.0186352 },
            ],
          },
        ],
      },
      target,
      { radiusMetres: 100, sampleStepMetres: 50 },
    );

    expect(metrics.retainedPolygonCount).toBe(1);
    expect(metrics.retainedExamples[0]?.id).toBe("way/1");
    expect(metrics.waterSamplePointCount).toBeGreaterThan(0);
    expect(metrics.waterSharePct).toBeGreaterThan(0);
    expect(metrics.waterSharePct).toBeLessThan(100);
  });

  it("builds surface-water density as an OSM mapped-feature proxy row", () => {
    const row = buildOsmSurfaceWaterDensityRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [
          {
            key: "surface_water_density",
            label: "Lake/river area share",
            matrixCategory: "nature_environment",
            intendedGranularity: "town",
            coverageStatus: "blocked",
            sourceGapReason: "requires_geospatial_build",
          },
        ],
      },
      target,
      metrics: {
        waterSharePct: 0.2,
        waterAreaM2: 20_000,
        samplePointCount: 31_417,
        waterSamplePointCount: 50,
        retainedPolygonCount: 4,
        retainedExamples: [
          {
            id: "way/1061485921",
            name: "river",
            tagSummary: "natural=water water=river",
            areaM2: 39_380,
          },
        ],
      },
      sourceUrl: "https://overpass-api.de/api/interpreter?data=surface-water",
      verifiedDate: "2026-06-29",
    });

    expect(row.coverageStatus).toBe("proxy");
    expect(row.observedGranularity).toBe("town");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.cited?.value).toBe(0.2);
    expect(row.cited?.sourceName).toContain("mapped inland-water polygon proxy");
    expect(row.cited?.excerpt).toContain("excluding coastline");
    expect(row.cited?.excerpt).toContain("Sampled 31417 points");
    expect(row.notes).toContain("not JRC Global Surface Water");
    expect(row.notes).toContain("not proof that narrow or unmapped streams are absent");
  });

  it("summarizes surface-water density into a regional priority-town row", () => {
    const townRows = [
      ["Chania", 0],
      ["Heraklion", 0.16],
      ["Rethymno", 0],
      ["Agios Nikolaos", 0.02],
    ].map(([placeName, value]) =>
      buildOsmSurfaceWaterDensityRow({
        bundle: {
          id: `town-${placeName}`,
          placeName: String(placeName),
          granularity: "town",
          rows: [
            {
              key: "surface_water_density",
              label: "Lake/river area share",
              matrixCategory: "nature_environment",
              intendedGranularity: "town",
              coverageStatus: "blocked",
            },
          ],
        },
        target: { ...target, placeName: String(placeName) },
        metrics: {
          waterSharePct: Number(value),
          waterAreaM2: 0,
          samplePointCount: 100,
          waterSamplePointCount: 0,
          retainedPolygonCount: 0,
          retainedExamples: [],
        },
        sourceUrl: "https://overpass-api.de/api/interpreter?data=surface-water",
        verifiedDate: "2026-06-29",
      }),
    );

    const row = summarizeRegionalOsmSurfaceWaterDensityRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row).toBeDefined();
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.cited?.value).toContain("Priority-town range for Crete: 0-0.16%");
    expect(row?.cited?.value).toContain("unweighted priority-town mean");
    expect(row?.notes).toContain("not a true island-wide Crete water-area share");
  });

  it("builds Copernicus HRL sample requests and metrics with no-data excluded", () => {
    const points = buildCircleSamplePoints({
      target,
      radiusMetres: 100,
      sampleStepMetres: 100,
    });
    const request = buildArcgisImageSamplesFetchRequest(
      "https://image.discomap.eea.europa.eu/arcgis/rest/services/GioLandPublic/HRL_TreeCoverDensity_2018/ImageServer",
      points,
    );
    const body = request.init.body as URLSearchParams;
    const parsedSamples = parseArcgisImageSamplesResponse({
      samples: [
        { locationId: 0, value: "0", resolution: 10 },
        { locationId: 1, value: "20", resolution: 10 },
        { locationId: 2, value: "80", resolution: 10 },
        { locationId: 3, value: "255", resolution: 10 },
      ],
    });
    const metrics = calculateCopernicusHrlForestTreeMetrics({
      samplePointCount: 4,
      treeCoverSamples: parsedSamples,
      forestTypeSamples: parseArcgisImageSamplesResponse({
        samples: [
          { locationId: 0, value: "0", resolution: 10 },
          { locationId: 1, value: "1", resolution: 10 },
          { locationId: 2, value: "2", resolution: 10 },
          { locationId: 3, value: "255", resolution: 10 },
        ],
      }),
    });

    expect(points).toHaveLength(5);
    expect(request.url).toContain("/getSamples");
    expect(request.init.method).toBe("POST");
    expect(body.get("geometryType")).toBe("esriGeometryMultipoint");
    expect(body.get("geometry")).toContain("spatialReference");
    expect(parsedSamples.map((sample) => sample.value)).toEqual([0, 20, 80, 255]);
    expect(metrics.treeCanopyPct).toBe(33.33);
    expect(metrics.treeValidSampleCount).toBe(3);
    expect(metrics.treeNoDataSampleCount).toBe(1);
    expect(metrics.forestCoverPct).toBe(66.67);
    expect(metrics.forestClassCounts).toEqual({
      nonForest: 1,
      broadleaved: 1,
      coniferous: 1,
    });
    expect(metrics.forestNoDataSampleCount).toBe(1);
  });

  it("builds Copernicus HRL forest and canopy rows plus regional summaries", () => {
    const bundle: AdapterBundle = {
      id: "gr-crete-chania",
      placeName: "Chania",
      granularity: "town",
      rows: [
        {
          key: "forest_cover_pct",
          label: "Forest cover percent",
          matrixCategory: "nature_environment",
          intendedGranularity: "town",
          coverageStatus: "blocked",
          sourceGapReason: "requires_geospatial_build",
        },
        {
          key: "tree_canopy_pct",
          label: "Tree canopy density",
          matrixCategory: "nature_environment",
          intendedGranularity: "town",
          coverageStatus: "blocked",
          sourceGapReason: "requires_geospatial_build",
        },
      ],
    };
    const rows = buildCopernicusHrlForestTreeRows({
      bundle,
      target,
      metrics: {
        samplePointCount: 5,
        treeCanopyPct: 12.5,
        treeValidSampleCount: 4,
        treeNoDataSampleCount: 1,
        forestCoverPct: 25,
        forestValidSampleCount: 4,
        forestNoDataSampleCount: 1,
        forestClassCounts: { nonForest: 3, broadleaved: 1, coniferous: 0 },
        serviceResolutionMetres: 10,
      },
      treeCoverSourceUrl:
        "https://image.discomap.eea.europa.eu/arcgis/rest/services/GioLandPublic/HRL_TreeCoverDensity_2018/ImageServer",
      forestTypeSourceUrl:
        "https://image.discomap.eea.europa.eu/arcgis/rest/services/GioLandPublic/HRL_ForestType_2018/ImageServer",
      verifiedDate: "2026-06-29",
    });
    const forestRow = rows.find((row) => row.key === "forest_cover_pct");
    const canopyRow = rows.find((row) => row.key === "tree_canopy_pct");
    const regionForestRow = summarizeRegionalCopernicusHrlRows({
      regionName: "Crete",
      key: "forest_cover_pct",
      townRows: [
        forestRow,
        {
          ...(forestRow as AdapterRow),
          cited: {
            ...(forestRow?.cited as NonNullable<AdapterRow["cited"]>),
            value: 5,
            sourceName:
              "Copernicus/EEA High Resolution Layer Forest Type 2018, Heraklion forest-cover sample",
          },
        },
      ],
      verifiedDate: "2026-06-29",
    });

    expect(forestRow?.coverageStatus).toBe("proxy");
    expect(forestRow?.sourceGapReason).toBeUndefined();
    expect(forestRow?.cited?.value).toBe(25);
    expect(forestRow?.cited?.confidence).toBe("medium");
    expect(forestRow?.cited?.sourceName).toContain("Forest Type 2018");
    expect(forestRow?.cited?.excerpt).toContain("no-data samples excluded: 1");
    expect(forestRow?.notes).toContain("not a municipal forest inventory");
    expect(canopyRow?.cited?.value).toBe(12.5);
    expect(canopyRow?.cited?.sourceName).toContain("Tree Cover Density 2018");
    expect(canopyRow?.notes).toContain("not a municipal tree inventory");
    expect(regionForestRow?.coverageStatus).toBe("proxy");
    expect(regionForestRow?.observedGranularity).toBe("region");
    expect(regionForestRow?.cited?.value).toContain("Priority-town range for Crete: 5-25%");
    expect(regionForestRow?.cited?.value).toContain("Heraklion: 5%");
    expect(regionForestRow?.notes).toContain("not a true island-wide Crete forest-cover value");
  });

  it("builds feature queries for ferry terminals, emergency-tagged hospitals, and KEP offices", () => {
    const ferryQuery = buildOsmFeatureOverpassQuery(target, "ferry_terminal");
    const hospitalQuery = buildOsmFeatureOverpassQuery(target, "emergency_hospital");
    const citizenServiceQuery = buildOsmFeatureOverpassQuery(target, "citizen_service_centre");

    expect(ferryQuery).toContain('"amenity"="ferry_terminal"');
    expect(ferryQuery).toContain('"seamark:type"="ferry_terminal"');
    expect(hospitalQuery).toContain('"amenity"="hospital"');
    expect(hospitalQuery).toContain('"emergency"="yes"');
    expect(hospitalQuery).toContain('"healthcare:speciality"~"emergency"');
    expect(hospitalQuery).toContain("out center tags");
    expect(citizenServiceQuery).toContain("ΚΕΠ");
    expect(citizenServiceQuery).toContain("Citizen Service Centre");
    expect(citizenServiceQuery).toContain('"office"="government"');
    expect(citizenServiceQuery).toContain("around:30000");
  });

  it("parses OSM feature candidates with coordinates and stable object URLs", () => {
    const candidates = parseOsmFeatureResponse({
      elements: [
        {
          type: "node",
          id: 576432749,
          lat: 35.489,
          lon: 24.069,
          tags: { name: "Σούδα", "name:en": "Souda", amenity: "ferry_terminal" },
        },
        {
          type: "way",
          id: 295135916,
          center: { lat: 35.488, lon: 24.009 },
          tags: {
            name: "Γενικό Νοσοκομείο Χανίων - Άγιος Γεώργιος",
            "name:en": "Chania General Hospital - Agios Georgios",
            amenity: "hospital",
            emergency: "yes",
          },
        },
      ],
    });

    expect(candidates).toEqual([
      {
        id: "node/576432749",
        name: "Souda",
        lat: 35.489,
        lon: 24.069,
        tags: { name: "Σούδα", "name:en": "Souda", amenity: "ferry_terminal" },
        objectUrl: "https://www.openstreetmap.org/node/576432749",
      },
      {
        id: "way/295135916",
        name: "Chania General Hospital - Agios Georgios",
        lat: 35.488,
        lon: 24.009,
        tags: {
          name: "Γενικό Νοσοκομείο Χανίων - Άγιος Γεώργιος",
          "name:en": "Chania General Hospital - Agios Georgios",
          amenity: "hospital",
          emergency: "yes",
        },
        objectUrl: "https://www.openstreetmap.org/way/295135916",
      },
    ]);
  });

  it("builds OSRM table requests and selects the fastest routed candidate", () => {
    const candidates = [
      {
        id: "node/1",
        name: "Slow terminal",
        lat: 35.6,
        lon: 24.2,
        tags: {},
        objectUrl: "https://www.openstreetmap.org/node/1",
      },
      {
        id: "node/2",
        name: "Fast terminal",
        lat: 35.49,
        lon: 24.07,
        tags: {},
        objectUrl: "https://www.openstreetmap.org/node/2",
      },
    ];
    const request = buildOsrmTableFetchRequest(target, candidates);
    const routes = parseOsrmTableResponse(
      {
        durations: [[null, 1200, 600]],
        distances: [[null, 20000, 8000]],
      },
      candidates,
    );

    expect(request.url).toContain("router.project-osrm.org/table/v1/driving/");
    expect(request.url).toContain("sources=0");
    expect(routes).toEqual([
      { candidate: candidates[0], durationMinutes: 20, distanceKm: 20 },
      { candidate: candidates[1], durationMinutes: 10, distanceKm: 8 },
    ]);
    expect(selectFastestRouteCandidate(routes)?.candidate.name).toBe("Fast terminal");
  });

  it("filters ferry candidates without throwing away unnamed station features", () => {
    const candidates = [
      {
        id: "node/267668226",
        name: "Worldchampion Jet  &  Champions League Jet 1",
        lat: 35.3419982,
        lon: 25.1411165,
        tags: {
          amenity: "ferry_terminal",
          ferry: "yes",
          public_transport: "station",
        } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/267668226",
      },
      {
        id: "node/518600577",
        name: "Crete semi submarine",
        lat: 35.1912234,
        lon: 25.7203601,
        tags: {
          amenity: "ferry_terminal",
          ferry: "yes",
          public_transport: "station",
        } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/518600577",
      },
      {
        id: "node/6488401288",
        name: "node/6488401288",
        lat: 35.3681357,
        lon: 24.4826993,
        tags: {
          amenity: "ferry_terminal",
          ferry: "yes",
          public_transport: "station",
        } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/6488401288",
      },
      {
        id: "node/1187906551",
        name: "Heraklion",
        lat: 35.3425307,
        lon: 25.1435076,
        tags: {
          amenity: "ferry_terminal",
          ferry: "yes",
          public_transport: "station",
        } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/1187906551",
      },
      {
        id: "node/private",
        name: "Private slipway",
        lat: 35.1,
        lon: 25.9,
        tags: {
          amenity: "ferry_terminal",
          access: "private",
          leisure: "slipway",
        } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/private",
      },
    ];

    expect(
      filterFeatureCandidates(target, "ferry_terminal", candidates).map((item) => item.id),
    ).toEqual(["node/6488401288", "node/1187906551"]);
  });

  it("filters citizen-service candidates to mapped KEP-like features", () => {
    const candidates = [
      {
        id: "node/1",
        name: "ΚΕΠ Δήμου Χανίων",
        lat: target.lat,
        lon: target.lon,
        tags: { office: "government", name: "ΚΕΠ Δήμου Χανίων" } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/1",
      },
      {
        id: "node/2",
        name: "Generic government office",
        lat: target.lat,
        lon: target.lon,
        tags: { office: "government", name: "Generic government office" } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/2",
      },
      {
        id: "node/3",
        name: "Citizen Service Centre",
        lat: target.lat,
        lon: target.lon,
        tags: {
          amenity: "public_service",
          access: "private",
          name: "Citizen Service Centre",
        } as Record<string, string>,
        objectUrl: "https://www.openstreetmap.org/node/3",
      },
    ];

    expect(
      filterFeatureCandidates(target, "citizen_service_centre", candidates).map((item) => item.id),
    ).toEqual(["node/1"]);
  });

  it("builds ferry and emergency-hospital route rows as cited proxies", () => {
    const ferry = {
      id: "node/576432749",
      name: "Souda",
      lat: 35.489,
      lon: 24.069,
      tags: { amenity: "ferry_terminal", ferry: "yes" },
      objectUrl: "https://www.openstreetmap.org/node/576432749",
    };
    const hospital = {
      id: "way/295135916",
      name: "Chania General Hospital - Agios Georgios",
      lat: 35.488,
      lon: 24.009,
      tags: { amenity: "hospital", emergency: "yes" },
      objectUrl: "https://www.openstreetmap.org/way/295135916",
    };

    const rows = buildFeatureRouteRows({
      target,
      ferryRoute: { candidate: ferry, durationMinutes: 18.2, distanceKm: 12.4 },
      hospitalRoute: { candidate: hospital, durationMinutes: 10.1, distanceKm: 5.2 },
      ferrySourceUrl: "https://overpass-api.de/api/interpreter?data=ferry",
      hospitalSourceUrl: "https://overpass-api.de/api/interpreter?data=hospital",
      ferryOsrmUrl: "https://router.project-osrm.org/table/v1/driving/ferry",
      hospitalOsrmUrl: "https://router.project-osrm.org/table/v1/driving/hospital",
      verifiedDate: "2026-06-28",
    });

    expect(rows.map((row) => row.key)).toEqual([
      "nearest_emergency_hospital",
      "emergency_hospital_drive_minutes",
      "ferry_terminal_drive_minutes",
    ]);
    expect(rows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(rows.every((row) => row.sourceGapReason === undefined)).toBe(true);
    expect(rows[0]?.cited?.confidence).toBe("low");
    expect(rows[1]?.cited?.value).toContain("10.1 minutes");
    expect(rows[2]?.cited?.confidence).toBe("medium");
    expect(rows[2]?.notes).toContain("not ferry-route, timetable");
  });

  it("summarizes route proxy rows into regional priority-town rows", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildFeatureRouteRows({
        target: { ...target, id: `town-${i}`, placeName },
        ferryRoute: {
          candidate: {
            id: `node/${i}`,
            name: `${placeName} ferry`,
            lat: target.lat,
            lon: target.lon,
            tags: {},
            objectUrl: `https://www.openstreetmap.org/node/${i}`,
          },
          durationMinutes: 10 + i,
          distanceKm: 5 + i,
        },
        hospitalRoute: {
          candidate: {
            id: `way/${i}`,
            name: `${placeName} hospital`,
            lat: target.lat,
            lon: target.lon,
            tags: { emergency: "yes" },
            objectUrl: `https://www.openstreetmap.org/way/${i}`,
          },
          durationMinutes: 6 + i,
          distanceKm: 3 + i,
        },
        ferrySourceUrl: "https://overpass-api.de/api/interpreter?data=ferry",
        hospitalSourceUrl: "https://overpass-api.de/api/interpreter?data=hospital",
        ferryOsrmUrl: "https://router.project-osrm.org/table/v1/driving/ferry",
        hospitalOsrmUrl: "https://router.project-osrm.org/table/v1/driving/hospital",
        verifiedDate: "2026-06-28",
      }),
    );

    const regionRows = summarizeRegionalRouteRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(regionRows).toHaveLength(3);
    expect(regionRows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(regionRows.every((row) => row.observedGranularity === "region")).toBe(true);
    expect(regionRows[0]?.cited?.value).toContain("Priority-town selections");
    expect(regionRows[1]?.cited?.value).toContain("Priority-town range");
  });

  it("builds and summarizes citizen-service centre route rows as cited proxies", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildCitizenServiceCentreDistanceRow({
        target: { ...target, id: `town-${i}`, placeName },
        route: {
          candidate: {
            id: `node/${i}`,
            name: `${placeName} KEP`,
            lat: target.lat,
            lon: target.lon,
            tags: { office: "government", name: `${placeName} KEP`, ref: "KEP" },
            objectUrl: `https://www.openstreetmap.org/node/${i}`,
          },
          durationMinutes: 4 + i,
          distanceKm: 1 + i,
        },
        sourceUrl: "https://overpass-api.de/api/interpreter?data=kep",
        sourceName: "test KEP source",
        sourceExcerpt: "test KEP source excerpt",
        osrmUrl: "https://router.project-osrm.org/table/v1/driving/kep",
        verifiedDate: "2026-06-29",
      }),
    );

    const row = townRows[0];
    if (!row) {
      throw new Error("Expected a citizen-service route row for the first town.");
    }
    const regionRow = summarizeRegionalCitizenServiceCentreDistanceRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("citizen_service_centre_distance");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.value).toContain("nearest routed mapped KEP");
    expect(row.cited?.excerpt).toContain("Office/address source");
    expect(row.notes).toContain("not an official service-area assignment");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete");
    expect(regionRow?.notes).toContain("not an island-wide official KEP registry");
  });

  it("builds and summarizes AADE tax-office route rows as cited proxies", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildTaxOfficeDistanceRow({
        target: { ...target, id: `town-${i}`, placeName },
        route: {
          candidate: {
            id: `aade-tax-office-${i}`,
            name: `${placeName} AADE DOU`,
            lat: target.lat,
            lon: target.lon,
            tags: { office: "government", operator: "AADE", ref: "DOY" },
            objectUrl: `https://www.aade.gr/taxonomy/term/${29287 + i}`,
          },
          durationMinutes: 5 + i,
          distanceKm: 2 + i,
        },
        sourceUrl: `https://www.aade.gr/taxonomy/term/${29287 + i}`,
        sourceName: "test AADE DOU source",
        sourceExcerpt: "test AADE DOU source excerpt",
        osrmUrl: "https://router.project-osrm.org/table/v1/driving/tax-office",
        verifiedDate: "2026-06-29",
      }),
    );

    const row = townRows[0];
    if (!row) {
      throw new Error("Expected a tax-office route row for the first town.");
    }
    const regionRow = summarizeRegionalTaxOfficeDistanceRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("tax_office_distance");
    expect(row.matrixCategory).toBe("tax_residency");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.category).toBe("tax");
    expect(row.cited?.value).toContain("selected AADE tax-office address");
    expect(row.cited?.excerpt).toContain("AADE office/address source");
    expect(row.notes).toContain("not an official tax-office assignment");
    expect(row.notes).toContain("not tax advice");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete");
    expect(regionRow?.cited?.sourceName).toContain("AADE tax-office pages");
    expect(regionRow?.notes).toContain("not an island-wide official tax-office assignment");
  });

  it("builds and summarizes Crete residence-permit office route rows as cited proxies", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildResidencePermitOfficeDistanceRow({
        target: { ...target, id: `town-${i}`, placeName },
        route: {
          candidate: {
            id: `apdkritis-residence-permit-${i}`,
            name: `${placeName} residence-permit office`,
            lat: target.lat,
            lon: target.lon,
            tags: {
              office: "government",
              operator: "Decentralized Administration of Crete",
              ref: "residence_permit",
            },
            objectUrl: "https://www.apdkritis.gov.gr/el/allodapoi-kai-metanasteysi",
          },
          durationMinutes: 6 + i,
          distanceKm: 3 + i,
        },
        sourceUrl: "https://www.apdkritis.gov.gr/el/allodapoi-kai-metanasteysi",
        sourceName: "test Crete residence-permit office source",
        sourceExcerpt: "test Crete residence-permit office source excerpt",
        osrmUrl: "https://router.project-osrm.org/table/v1/driving/residence-permit-office",
        verifiedDate: "2026-06-29",
      }),
    );

    const row = townRows[0];
    if (!row) {
      throw new Error("Expected a residence-permit office route row for the first town.");
    }
    const regionRow = summarizeRegionalResidencePermitOfficeDistanceRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("residence_permit_office_distance");
    expect(row.matrixCategory).toBe("tax_residency");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.category).toBe("residency");
    expect(row.cited?.value).toContain("official Crete residence-permit office address");
    expect(row.cited?.excerpt).toContain("Residence-permit office/address source");
    expect(row.notes).toContain("not an official service-area assignment");
    expect(row.notes).toContain("not");
    expect(row.notes).toContain("immigration advice");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete");
    expect(regionRow?.cited?.sourceName).toContain(
      "Decentralized Administration of Crete residence-permit office page",
    );
    expect(regionRow?.notes).toContain("not an island-wide official residence-office assignment");
  });

  it("builds and summarizes Hellenic Cadastre office route rows as cited proxies", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildLandRegistryOfficeDistanceRow({
        target: { ...target, id: `town-${i}`, placeName },
        route: {
          candidate: {
            id: `hellenic-cadastre-${i}`,
            name: `${placeName} Hellenic Cadastre branch`,
            lat: target.lat,
            lon: target.lon,
            tags: {
              office: "government",
              operator: "Hellenic Cadastre",
              ref: "land_registry",
            },
            objectUrl: "https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1446",
          },
          durationMinutes: 7 + i,
          distanceKm: 4 + i,
        },
        sourceUrl: "https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1446",
        sourceName: "test Hellenic Cadastre branch source",
        sourceExcerpt: "test Hellenic Cadastre branch source excerpt",
        osrmUrl: "https://router.project-osrm.org/table/v1/driving/land-registry-office",
        verifiedDate: "2026-06-29",
      }),
    );

    const row = townRows[0];
    if (!row) {
      throw new Error("Expected a land-registry office route row for the first town.");
    }
    const regionRow = summarizeRegionalLandRegistryOfficeDistanceRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("land_registry_office_distance");
    expect(row.matrixCategory).toBe("tax_residency");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.category).toBeUndefined();
    expect(row.cited?.value).toContain("selected Hellenic Cadastre office address");
    expect(row.cited?.excerpt).toContain("Hellenic Cadastre office/address source");
    expect(row.notes).toContain("not an official jurisdiction assignment");
    expect(row.notes).toContain("not");
    expect(row.notes).toContain("property advice");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete");
    expect(regionRow?.cited?.sourceName).toContain("Hellenic Cadastre office-address sources");
    expect(regionRow?.notes).toContain("not an island-wide official land-registry assignment");
  });

  it("builds and summarizes accredited European School access rows as cited proxies", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildInternationalSchoolDistanceRow({
        target: { ...target, id: `town-${i}`, placeName },
        route: {
          candidate: {
            id: "european-school-heraklion",
            name: "School of European Education Heraklion",
            lat: target.lat,
            lon: target.lon,
            tags: {
              amenity: "school",
              operator: "School of European Education Heraklion",
              accreditation: "European Schools",
            },
            objectUrl: "https://www.openstreetmap.org/way/352274736",
          },
          durationMinutes: 40 + i,
          distanceKm: 20 + i,
        },
        sourceUrl: "https://www.eursc.eu/en/accredited-european-schools/locations/heraklion/",
        sourceName: "test European Schools source",
        sourceExcerpt: "test European Schools accreditation and address excerpt",
        osrmUrl: "https://router.project-osrm.org/table/v1/driving/international-school",
        verifiedDate: "2026-06-29",
      }),
    );

    const row = townRows[0];
    if (!row) {
      throw new Error("Expected an international-school route row for the first town.");
    }
    const regionRow = summarizeRegionalInternationalSchoolDistanceRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("international_school_distance");
    expect(row.matrixCategory).toBe("health_family_schooling");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.value).toContain("European Schools-accredited school in Crete");
    expect(row.cited?.excerpt).toContain("School accreditation/address source");
    expect(row.notes).toContain("not a complete international-school inventory");
    expect(row.notes).toContain("tuition");
    expect(row.notes).toContain("education advice");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete");
    expect(regionRow?.cited?.sourceName).toContain("European Schools Heraklion");
    expect(regionRow?.notes).toContain("not an island-wide international-school inventory");
  });

  it("builds selected European School tuition rows without treating them as private-school averages", () => {
    const baseRow = {
      key: "intl_school_tuition",
      label: "International school tuition proxy",
      matrixCategory: "health_family_schooling" as const,
      intendedGranularity: "region" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed source-gap disposition",
    };
    const row = buildInternationalSchoolTuitionRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      source: {
        placeName: "Crete",
        sourceUrl:
          "https://seeh.eu/en/the-school/activities?catid=9&id=162%3Asec-enrol&view=article",
        sourceName: "School of European Education Heraklion enrolment page",
        schoolName: "School of European Education Heraklion",
        feeValueEur: 0,
        observedGranularity: "region",
        coverageStatus: "proxy",
        sourceExcerpt:
          "The School of European Education Heraklion enrolment page says that no fees apply because the school is a Greek public school.",
        coverageNote:
          "Selected tuition proxy for the European Schools-accredited public school already used by the international-school access row.",
      },
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("intl_school_tuition");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.coverageStatus).toBe("proxy");
    expect(row.observedGranularity).toBe("region");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.granularity).toBe("region");
    expect(row.cited?.value).toContain("0 EUR annual tuition");
    expect(row.cited?.value).toContain("Greek public school");
    expect(row.cited?.sourceName).toBe("School of European Education Heraklion enrolment page");
    expect(row.unit).toBe(
      "EUR annual tuition for selected European Schools-accredited public school",
    );
    expect(row.notes).toContain("not a median of all private international-school tuition");
    expect(row.notes).toContain("not admissions availability");
    expect(row.notes).toContain("not education advice");
  });

  it("builds and summarizes after-hours pharmacy rota rows as dated proxy evidence", () => {
    const baseRow = {
      key: "after_hours_pharmacy_proxy",
      label: "After-hours pharmacy availability signal",
      matrixCategory: "health_family_schooling" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed source-gap disposition",
    };
    const townRows = [
      {
        placeName: "Chania",
        sourceUrl: "https://chania.efhmeries.gr/",
        sourceName: "Chania duty-pharmacy rota page",
        observedGranularity: "town" as const,
        coverageStatus: "proxy" as const,
        sourceExcerpt: "Chania duty-pharmacy page exposes a date selector and API link.",
        coverageNote: "Chania named public duty-rota page.",
      },
      {
        placeName: "Agios Nikolaos",
        sourceUrl: "https://lasithi.efhmeries.gr/",
        sourceName: "Lasithi duty-pharmacy rota page",
        observedGranularity: "region" as const,
        coverageStatus: "proxy" as const,
        sourceExcerpt: "Lasithi duty-pharmacy page exposes a date selector and API link.",
        coverageNote: "Lasithi regional page shown as Agios Nikolaos context.",
      },
    ].map((source, index) =>
      buildAfterHoursPharmacyProxyRow({
        bundle: {
          id: `town-${index}`,
          placeName: source.placeName,
          granularity: "town",
          rows: [baseRow],
        },
        source,
        verifiedDate: "2026-06-29",
      }),
    );

    const chaniaRow = townRows[0];
    const agiosRow = townRows[1];
    const regionRow = summarizeRegionalAfterHoursPharmacyProxyRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(chaniaRow?.key).toBe("after_hours_pharmacy_proxy");
    expect(chaniaRow?.sourceGapReason).toBeUndefined();
    expect(chaniaRow?.coverageStatus).toBe("proxy");
    expect(chaniaRow?.observedGranularity).toBe("town");
    expect(chaniaRow?.cited?.category).toBe("healthcare");
    expect(chaniaRow?.cited?.value).toContain("duty-pharmacy rota page verified");
    expect(chaniaRow?.notes).toContain("not proof that a specific pharmacy is open");
    expect(chaniaRow?.notes).toContain("medical advice");
    expect(agiosRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.sourceUrl).toContain("fskriti.gr");
    expect(regionRow?.cited?.value).toContain("Priority-town duty-pharmacy rota pages");
    expect(regionRow?.notes).toContain("Dynamic duty rosters change daily");
  });

  it("builds municipal digital-service rows as official public-service surface evidence", () => {
    const baseRow = {
      key: "municipal_digital_services",
      label: "Municipal digital-service availability",
      matrixCategory: "culture_services" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed source-gap disposition",
    };
    const row = buildMunicipalDigitalServicesRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      source: {
        placeName: "Chania",
        sourceUrl: "https://eservices.chania.gr/",
        sourceName: "Municipality of Chania electronic requests portal",
        observedGranularity: "town",
        coverageStatus: "local",
        sourceExcerpt:
          "The Chania portal identifies an electronic-requests service for the Municipality of Chania.",
        coverageNote: "Chania municipal electronic-requests portal verified at source.",
      },
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("municipal_digital_services");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.coverageStatus).toBe("local");
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.sourceUrl).toBe("https://eservices.chania.gr/");
    expect(row.cited?.value).toContain("Official municipal digital-service");
    expect(row.unit).toBe("official public digital-service pages verified at source");
    expect(row.notes).toContain("not a service-completeness audit");
    expect(row.notes).toContain("processing-time claim");
    expect(row.notes).toContain("administrative advice");
  });

  it("builds water-restriction history rows from dated official notices without overclaiming supply risk", () => {
    const baseRow = {
      key: "water_restriction_history",
      label: "Recent water-restriction history",
      matrixCategory: "nature_environment" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed source-gap disposition",
    };
    const row = buildWaterRestrictionHistoryRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      source: {
        placeName: "Chania",
        sourceUrl: "https://www.chania.gr/water-notice",
        sourceName: "Municipality of Chania and DEYAX water-supply interruption notice",
        noticeDate: "2026-05-25",
        affectedArea: "Keramia municipal-unit settlements",
        observedGranularity: "town",
        coverageStatus: "local",
        sourceExcerpt:
          "DEYAX announced a water-supply interruption in parts of the Keramia municipal unit.",
        coverageNote: "Chania official municipality notice verified at source.",
      },
      verifiedDate: "2026-06-29",
    });
    const heraklionRow = buildWaterRestrictionHistoryRow({
      bundle: {
        id: "gr-crete-heraklion",
        placeName: "Heraklion",
        granularity: "town",
        rows: [baseRow],
      },
      source: {
        placeName: "Heraklion",
        sourceUrl: "https://www.heraklion.gr/water-notice",
        sourceName: "Municipality of Heraklion and DEYAH water-network works notice",
        noticeDate: "2026-03-11",
        affectedArea: "Heraklion network-connection works area",
        observedGranularity: "town",
        coverageStatus: "local",
        sourceExcerpt:
          "DEYAH announced network connection works with water-supply interruption context.",
        coverageNote: "Heraklion official municipality notice verified at source.",
      },
      verifiedDate: "2026-06-29",
    });
    const regionRow = summarizeRegionalWaterRestrictionHistoryRows({
      region: {
        id: "gr-crete-region",
        placeName: "Crete",
        granularity: "region",
        rows: [baseRow],
      },
      townRows: [row, heraklionRow],
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("water_restriction_history");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.coverageStatus).toBe("local");
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("low");
    expect(row.cited?.sourceUrl).toBe("https://www.chania.gr/water-notice");
    expect(row.cited?.value).toContain("Recent official water-supply interruption notice");
    expect(row.cited?.value).toContain("2026-05-25");
    expect(row.unit).toBe("official municipal or water-utility notice-history signal");
    expect(row.notes).toContain("low-confidence recent-notice history signal");
    expect(row.notes).toContain("not a continuous water-stress baseline");
    expect(row.notes).toContain("not a current outage status");
    expect(row.notes).toContain("not a household supply guarantee");
    expect(row.notes).toContain("health advice");
    expect(regionRow?.sourceGapReason).toBeUndefined();
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.sourceName).toContain("Official municipal and DEYA");
    expect(regionRow?.cited?.value).toContain("Priority-town recent official water-supply");
    expect(regionRow?.unit).toBe(
      "priority-town official municipal or water-utility notice-history aggregate",
    );
    expect(regionRow?.notes).toContain("Accepted priority-town aggregate");
    expect(regionRow?.notes).toContain("not a true island-wide regional restriction history");
  });

  it("builds WRI Aqueduct water-stress baseline rows as regional context", () => {
    const baseRow = {
      key: "water_stress_baseline",
      label: "Water-stress or drought baseline",
      matrixCategory: "nature_environment" as const,
      intendedGranularity: "region" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "requires_geospatial_build",
      notes: "completed source-gap disposition",
    };
    const source = {
      regionName: "Crete",
      sourceUrl: "https://files.wri.org/aqueduct/aqueduct-4-0-water-risk-data.zip",
      sourceName: "WRI Aqueduct 4.0 water risk data, baseline annual CSV",
      sourceExcerpt:
        "Aqueduct40_baseline_annual_y2023m07d05.csv rows 212000-GRC.4_1-1570 and 212000-GRC.4_1-None list Crete bws_label Extremely High (>80%).",
      meaningfulAreaKm2: 8391.807457035,
      noDataAreaKm2: 0.06725837129,
      baselineRaw: 2.1240526531793407,
      baselineScore: 5,
      baselineCategory: 4,
      baselineLabel: "Extremely High (>80%)",
      rowIds: ["212000-GRC.4_1-1570", "212000-GRC.4_1-None"],
      coverageNote: "Crete regional baseline water-stress context from WRI Aqueduct.",
    };

    const townRow = buildWriAqueductWaterStressBaselineRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      source,
      verifiedDate: "2026-06-29",
    });
    const regionRow = buildWriAqueductWaterStressBaselineRow({
      bundle: {
        id: "gr-crete-region",
        placeName: "Crete",
        granularity: "region",
        rows: [baseRow],
      },
      source,
      verifiedDate: "2026-06-29",
    });

    expect(townRow.key).toBe("water_stress_baseline");
    expect(townRow.sourceGapReason).toBeUndefined();
    expect(townRow.coverageStatus).toBe("inherited_regional");
    expect(townRow.observedGranularity).toBe("region");
    expect(townRow.cited?.confidence).toBe("medium");
    expect(townRow.cited?.granularity).toBe("region");
    expect(townRow.cited?.sourceName).toContain("WRI Aqueduct 4.0");
    expect(townRow.cited?.value).toContain("Extremely High (>80%)");
    expect(townRow.cited?.value).toContain("score 5");
    expect(townRow.unit).toBe("WRI Aqueduct baseline water-stress category and score");
    expect(townRow.notes).toContain("Extracted row ids");
    expect(townRow.notes).toContain("not a household service guarantee");
    expect(townRow.notes).toContain("not a water-quality claim");
    expect(townRow.notes).toContain("not a future restriction prediction");
    expect(regionRow.coverageStatus).toBe("regional");
    expect(regionRow.observedGranularity).toBe("region");
  });

  it("parses and samples EDO CDI GeoTIFF metadata for drought frequency", () => {
    const raster = parseEdoCdiGeoTiff(makeTinyEdoCdiGeoTiff());
    const firstCell = sampleEdoCdiGeoTiffAtPoint(raster, { lat: 71.75, lon: -24.75 });
    const lastCell = sampleEdoCdiGeoTiffAtPoint(raster, { lat: 71.25, lon: -24.25 });

    expect(raster.width).toBe(2);
    expect(raster.height).toBe(2);
    expect(raster.originLon).toBe(-25);
    expect(raster.originLat).toBe(72);
    expect(firstCell).toMatchObject({ row: 0, col: 0, value: 1 });
    expect(lastCell).toMatchObject({ row: 1, col: 1, value: 4 });
  });

  it("builds EDO CDI date series and source URLs from capabilities metadata", () => {
    const capabilities = `
      <Layer>
        <Name>cdiad</Name>
        <Dimension name="time" units="ISO8601" nearestValue="0">2012-01-01/2026-06-01/P10D</Dimension>
      </Layer>
    `;

    expect(extractEdoCdiLatestDateFromWmsCapabilities(capabilities)).toBe("2026-06-01");
    expect(buildEdoCdiTenDayDateSeries("2026-06-01", 5)).toEqual([
      "2026-04-21",
      "2026-05-01",
      "2026-05-11",
      "2026-05-21",
      "2026-06-01",
    ]);
    expect(buildEdoCdiWcsGeoTiffUrl("2026-06-01")).toContain(
      "coverageID=cdiad&CRS=EPSG:4326&format=GEOTIFF&TIME=2026-06-01",
    );
  });

  it("builds EDO CDI drought-frequency rows as bounded screening proxies", () => {
    const baseRow = {
      key: "drought_frequency_proxy",
      label: "Drought-frequency proxy",
      matrixCategory: "nature_environment" as const,
      intendedGranularity: "region" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "requires_geospatial_build",
      notes: "completed source-gap disposition",
    };
    const samples = [
      { date: "2026-05-01", value: 0 },
      { date: "2026-05-11", value: 1 },
      { date: "2026-05-21", value: 2 },
      { date: "2026-06-01", value: 3 },
      { date: "2026-06-11", value: 4 },
      { date: "2026-06-21", value: null },
    ];
    const metrics = calculateEdoCdiDroughtFrequencyMetrics({
      target,
      samples,
      sampledGrid: { row: 876, col: 1176, lat: 35.52, lon: 24.02 },
    });
    const row = buildEdoCdiDroughtFrequencyRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      target,
      metrics,
      sourceUrl: "https://drought.emergency.copernicus.eu/api/wms",
      verifiedDate: "2026-06-29",
    });
    const secondTownRow = structuredClone(row);
    if (!secondTownRow.cited) throw new Error("expected drought row to include a CitedValue");
    secondTownRow.cited.value = 20;
    secondTownRow.cited.sourceName =
      "Copernicus Emergency Management Service European Drought Observatory, Combined Drought Indicator v4.1, Heraklion ten-day grid-cell drought-frequency proxy";
    const regionRow = summarizeRegionalEdoCdiDroughtFrequencyRows({
      regionName: "Crete",
      townRows: [row, secondTownRow],
      verifiedDate: "2026-06-29",
    });

    expect(metrics.droughtObservationSharePct).toBe(60);
    expect(metrics.classCounts).toMatchObject({
      noDrought: 1,
      watch: 1,
      warning: 1,
      alert: 1,
      recoveryOrOther: 1,
      noData: 1,
    });
    expect(row.key).toBe("drought_frequency_proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.coverageStatus).toBe("proxy");
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.granularity).toBe("town");
    expect(row.cited?.value).toBe(60);
    expect(row.cited?.sourceName).toContain("European Drought Observatory");
    expect(row.cited?.excerpt).toContain("Watch, Warning, or Alert");
    expect(row.unit).toBe(
      "percent of valid EDO CDI ten-day observations with Watch, Warning, or Alert",
    );
    expect(row.notes).toContain("not household water-service evidence");
    expect(row.notes).toContain("not a current restriction or outage status");
    expect(row.notes).toContain("not");
    expect(row.notes).toContain("personal advice");
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("20-60%");
    expect(regionRow?.notes).toContain("not a true island-wide Crete drought frequency");
  });

  it("samples VIIRS nighttime-light raster windows and builds bounded proxy rows", () => {
    const sampleTarget = {
      id: "test-town",
      placeName: "Test town",
      granularity: "town" as const,
      lat: 0,
      lon: 0,
    };
    const metrics = calculateViirsLightPollutionMetricsFromRasterWindow({
      target: sampleTarget,
      sampleRadiusMetres: 1_600,
      raster: {
        rasterWidth: 3,
        rasterHeight: 3,
        windowWidth: 3,
        windowHeight: 3,
        originLon: -0.015,
        originLat: 0.015,
        pixelWidthDeg: 0.01,
        pixelHeightDeg: 0.01,
        windowLeft: 0,
        windowTop: 0,
        values: new Int16Array([0, 10, 20, 30, -32768, 40, 50, 60, 70]),
        noDataValue: -32768,
      },
    });
    const baseRow = {
      key: "light_pollution",
      label: "Night-sky radiance",
      matrixCategory: "nature_environment" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "requires_geospatial_build",
      notes: "Completed source discovery; needs geospatial build.",
    };
    const row = buildViirsLightPollutionRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      target,
      metrics,
      sourceUrl: "https://zenodo.org/records/17294744",
      verifiedDate: "2026-06-30",
    });
    const heraklionRow = structuredClone(row);
    if (!heraklionRow.cited) throw new Error("expected light row to include a CitedValue");
    heraklionRow.cited.value = 6.9;
    heraklionRow.cited.sourceName =
      "OpenGeoHub Zenodo annual VIIRS nighttime lights 2024 COG, Heraklion nighttime-radiance sample";
    const regionRow = summarizeRegionalViirsLightPollutionRows({
      regionName: "Crete",
      townRows: [row, heraklionRow],
      verifiedDate: "2026-06-30",
    });

    expect(metrics.validSampleCount).toBe(8);
    expect(metrics.noDataSampleCount).toBe(1);
    expect(metrics.zeroSampleCount).toBe(1);
    expect(metrics.rawMean).toBe(35);
    expect(metrics.radianceMean).toBe(3.5);
    expect(metrics.radianceP50).toBe(3);
    expect(metrics.radianceP90).toBe(7);
    expect(row.key).toBe("light_pollution");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.coverageStatus).toBe("proxy");
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.granularity).toBe("town");
    expect(row.cited?.value).toBe(3.5);
    expect(row.cited?.sourceName).toContain("OpenGeoHub Zenodo annual VIIRS");
    expect(row.cited?.excerpt).toContain("raw/source-scale 10");
    expect(row.unit).toContain("nW/sr/cm2");
    expect(row.notes).toContain("not Bortle class");
    expect(row.notes).toContain("not a stargazing guarantee");
    expect(row.notes).toContain("not street-light coverage");
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("3.5-6.9 nW/sr/cm2");
    expect(regionRow?.notes).toContain("not a true island-wide Crete light-pollution mean");
  });

  it("builds bus-frequency proxy rows from selected official KTEL timetable sources", () => {
    const baseRow = {
      key: "bus_frequency_proxy",
      label: "Bus frequency proxy",
      matrixCategory: "travel_connectivity" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed source-gap disposition",
    };
    const chaniaRow = buildBusFrequencyProxyRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      source: {
        placeName: "Chania",
        sourceUrl: "https://www.e-ktel.com/images/pdfs/2026/JUN_2026/CHANIA_FROM_27-06-2026.pdf",
        sourceName: "KTEL Chania-Rethymno Chania departures PDF valid from 27 June 2026",
        selectedCorridor: "Chania to Rethymno and Heraklion intercity spine",
        frequencyCount: 22,
        frequencyLabel: "22 daily outbound spine departures from Chania",
        observedGranularity: "town",
        coverageStatus: "proxy",
        sourceExcerpt: "The official PDF lists 22 daily outbound spine departures from Chania.",
        coverageNote: "Chania bus-frequency proxy from an official KTEL timetable.",
      },
      verifiedDate: "2026-06-29",
    });
    const agiosRow = buildBusFrequencyProxyRow({
      bundle: {
        id: "gr-crete-agios-nikolaos",
        placeName: "Agios Nikolaos",
        granularity: "town",
        rows: [baseRow],
      },
      source: {
        placeName: "Agios Nikolaos",
        sourceUrl: "https://www.ktelherlas.gr/en/slug/frequent-asked-questions",
        sourceName: "KTEL Heraklion-Lasithi timetable FAQ",
        selectedCorridor: "Agios Nikolaos to Heraklion intercity spine",
        frequencyCount: 6,
        frequencyLabel: "6 weekday outbound spine departures from Agios Nikolaos to Heraklion",
        observedGranularity: "town",
        coverageStatus: "proxy",
        sourceExcerpt:
          "The official FAQ lists six Monday-Friday Agios Nikolaos-Heraklion departures.",
        coverageNote: "Agios Nikolaos bus-frequency proxy from an official KTEL FAQ.",
      },
      verifiedDate: "2026-06-29",
    });
    const regionRow = summarizeRegionalBusFrequencyProxyRows({
      regionName: "Crete",
      townRows: [chaniaRow, agiosRow],
      verifiedDate: "2026-06-29",
    });

    expect(chaniaRow.key).toBe("bus_frequency_proxy");
    expect(chaniaRow.sourceGapReason).toBeUndefined();
    expect(chaniaRow.coverageStatus).toBe("proxy");
    expect(chaniaRow.observedGranularity).toBe("town");
    expect(chaniaRow.cited?.confidence).toBe("medium");
    expect(chaniaRow.cited?.category).toBe("connectivity");
    expect(chaniaRow.cited?.sourceUrl).toContain("CHANIA_FROM_27-06-2026.pdf");
    expect(chaniaRow.cited?.value).toContain("22 daily outbound spine departures");
    expect(chaniaRow.unit).toBe("selected official KTEL timetable departures");
    expect(chaniaRow.notes).toContain("not a full public-transport network score");
    expect(chaniaRow.notes).toContain("Refresh before publication");
    expect(regionRow?.coverageStatus).toBe("regional");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.sourceName).toContain("Official KTEL Chania-Rethymno");
    expect(regionRow?.cited?.value).toContain("6-22 selected departures");
    expect(regionRow?.notes).toContain("not an island-wide public-transport network score");
  });

  it("builds a Chania summer airport direct-destination row from official timetable evidence", () => {
    const baseRow = {
      key: "airport_summer_direct_destinations",
      label: "Summer direct-destination count",
      matrixCategory: "travel_connectivity" as const,
      intendedGranularity: "region" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed source-gap disposition",
    };
    const row = buildAirportSummerDirectDestinationsRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      source: {
        placeName: "Chania",
        airportCode: "CHQ",
        airportName: "Chania Airport Ioannis Daskalogiannis",
        seasonLabel: "NS26 summer schedule period ending 24 October 2026",
        destinationCount: 115,
        listedDestinationAirports: 116,
        excludedAirports: ["IST"],
        observedGranularity: "region",
        coverageStatus: "proxy",
        sourceUrl:
          "https://www.chq-airport.gr/en/flights--more/flights--destinations/destinations/destinations/dest_id-448/nd_id-448",
        sourceName: "Chania Airport / Fraport Greece destinations timetable",
        sourceExcerpt:
          "Official Chania Airport endpoints returned 116 listed destination airports and 115 outbound airport rows.",
        coverageNote:
          "Chania selected-airport summer direct-destination count from official Chania/Fraport timetable endpoints.",
      },
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("airport_summer_direct_destinations");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.coverageStatus).toBe("proxy");
    expect(row.observedGranularity).toBe("region");
    expect(row.cited?.value).toBe(115);
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.category).toBe("connectivity");
    expect(row.cited?.granularity).toBe("region");
    expect(row.unit).toContain("NS26 summer schedule period");
    expect(row.notes).toContain("excluded listed airports with no outbound timetable rows: IST");
    expect(row.notes).toContain("not flight frequency");
    expect(row.notes).toContain("not a service guarantee");
    expect(row.notes).toContain("not travel advice");
  });

  it("builds manual or licensed transport schedule rows with citation discipline", () => {
    const baseRow = {
      key: "ferry_routes_winter",
      label: "Winter ferry-route count",
      matrixCategory: "travel_connectivity" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
      notes: "completed source-gap disposition",
    };
    const row = buildManualTransportScheduleRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      record: {
        bundleId: "gr-crete-chania",
        rowKey: "ferry_routes_winter",
        value: 1,
        unit: "scheduled passenger ferry route pairs, NW26/27 winter season",
        sourceUrl: "https://operator.example/timetable.pdf",
        sourceName: "Example official ferry operator timetable",
        sourceExcerpt:
          "Dated winter timetable lists one scheduled passenger ferry route from Souda.",
        observedGranularity: "town",
        coverageStatus: "local",
        confidence: "medium",
        notes:
          "Manual browser export counted unique scheduled passenger/vehicle destination ports.",
      },
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("ferry_routes_winter");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.coverageStatus).toBe("local");
    expect(row.cited?.value).toBe(1);
    expect(row.cited?.sourceName).toContain("official ferry operator");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.category).toBe("connectivity");
    expect(row.notes).toContain("Manual browser export");
    expect(row.notes).toContain("not sailing frequency");
    expect(row.notes).toContain("not travel advice");
  });

  it("rejects low-confidence manual transport schedule rows", () => {
    expect(() =>
      buildManualTransportScheduleRow({
        bundle: {
          id: "gr-crete-chania",
          placeName: "Chania",
          granularity: "town",
          rows: [
            {
              key: "airport_winter_direct_destinations",
              label: "Winter direct-destination count",
              matrixCategory: "travel_connectivity" as const,
              intendedGranularity: "region" as const,
              coverageStatus: "blocked" as const,
              sourceGapReason: "source_bot_blocked_manual_needed",
            },
          ],
        },
        record: {
          bundleId: "gr-crete-chania",
          rowKey: "airport_winter_direct_destinations",
          value: 12,
          unit: "outbound direct destination airports, NW26/27 winter season",
          sourceUrl: "https://airport.example/timetable",
          sourceName: "Example airport timetable",
          sourceExcerpt: "Example schedule count",
          observedGranularity: "region",
          coverageStatus: "proxy",
          confidence: "low",
        },
        verifiedDate: "2026-06-29",
      }),
    ).toThrow("require medium/high confidence");
  });

  it("rejects manual airport winter-route ratio records at runtime", () => {
    expect(() =>
      validateManualTransportScheduleRecord(
        {
          bundleId: "gr-crete-chania",
          rowKey: "airport_winter_route_ratio",
          value: 0.2,
          unit: "winter direct destinations / summer direct destinations",
          sourceUrl: "https://airport.example/timetable",
          sourceName: "Example airport timetable",
          sourceExcerpt: "Example ratio",
          observedGranularity: "region",
          coverageStatus: "proxy",
          confidence: "medium",
        },
        0,
        "docs/data/manual/transport-schedule-manual.json",
      ),
    ).toThrow("airport_winter_route_ratio is derived only");
  });

  it("rejects low-confidence manual transport schedule records at runtime", () => {
    expect(() =>
      validateManualTransportScheduleRecord(
        {
          bundleId: "gr-crete-chania",
          rowKey: "airport_winter_direct_destinations",
          value: 12,
          unit: "outbound direct destination airports, NW26/27 winter season",
          sourceUrl: "https://airport.example/timetable",
          sourceName: "Example airport timetable",
          sourceExcerpt: "Example count",
          observedGranularity: "region",
          coverageStatus: "proxy",
          confidence: "low",
        },
        0,
        "docs/data/manual/transport-schedule-manual.json",
      ),
    ).toThrow("confidence must be medium or high");
  });

  it("derives airport winter-route ratio only from cited component counts", () => {
    const component = (key: string, value: number, sourceName: string) => ({
      key,
      label: key,
      matrixCategory: "travel_connectivity" as const,
      intendedGranularity: "region" as const,
      observedGranularity: "region" as const,
      coverageStatus: "proxy" as const,
      cited: {
        value,
        sourceUrl: `https://airport.example/${key}`,
        sourceName,
        verifiedDate: "2026-06-29",
        confidence: "medium" as const,
        granularity: "region" as const,
        category: "connectivity" as const,
      },
    });
    const row = buildAirportWinterRouteRatioRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [
          {
            key: "airport_winter_route_ratio",
            label: "Winter-to-summer direct-destination ratio",
            matrixCategory: "travel_connectivity" as const,
            intendedGranularity: "region" as const,
            coverageStatus: "blocked" as const,
            sourceGapReason: "source_bot_blocked_manual_needed",
          },
          component("airport_winter_direct_destinations", 23, "Winter timetable"),
          component("airport_summer_direct_destinations", 115, "Summer timetable"),
        ],
      },
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("airport_winter_route_ratio");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.cited?.value).toBe(0.2);
    expect(row.cited?.sourceName).toContain("Winter timetable");
    expect(row.cited?.excerpt).toContain("23 winter direct destinations / 115 summer");
    expect(row.notes).toContain("Derived only after both selected-airport");
    expect(row.notes).toContain("not travel advice");
  });

  it("filters unchanged replacement rows before reporting adapter changes", () => {
    const baseRow = {
      key: "ferry_routes_summer",
      label: "Summer ferry-route count",
      matrixCategory: "travel_connectivity" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
    };
    const replacementRow = buildManualTransportScheduleRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow],
      },
      record: {
        bundleId: "gr-crete-chania",
        rowKey: "ferry_routes_summer",
        value: 2,
        unit: "scheduled passenger ferry route pairs, NS26 summer season",
        sourceUrl: "https://operator.example/summer-timetable.pdf",
        sourceName: "Example official ferry operator summer timetable",
        sourceExcerpt: "Dated summer timetable lists two scheduled passenger ferry route pairs.",
        observedGranularity: "town",
        coverageStatus: "local",
        confidence: "medium",
      },
      verifiedDate: "2026-06-30",
    });
    const bundle = {
      id: "gr-crete-chania",
      placeName: "Chania",
      granularity: "town" as const,
      rows: [JSON.parse(JSON.stringify(replacementRow)) as AdapterRow],
    };
    const changedReplacementRow = {
      ...replacementRow,
      cited: {
        ...replacementRow.cited,
        value: 3,
      },
    };

    expect(filterChangedReplacementRows(bundle, [replacementRow])).toEqual([]);
    expect(filterChangedReplacementRows(bundle, [changedReplacementRow])).toEqual([
      changedReplacementRow,
    ]);
  });

  it("builds parent-region manual transport rows and derives the airport ratio", () => {
    const placeholder = (key: string) => ({
      key,
      label: key,
      matrixCategory: "travel_connectivity" as const,
      intendedGranularity: "region" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "source_bot_blocked_manual_needed",
    });
    const rows = buildManualTransportScheduleRowsForBundle({
      bundle: {
        id: "gr-crete-region",
        placeName: "Crete",
        granularity: "region",
        rows: [
          placeholder("airport_winter_direct_destinations"),
          placeholder("airport_summer_direct_destinations"),
          placeholder("airport_winter_route_ratio"),
        ],
      },
      records: [
        {
          bundleId: "gr-crete-region",
          rowKey: "airport_winter_direct_destinations",
          value: 25,
          unit: "outbound direct destination airports, NW26/27 winter season",
          sourceUrl: "https://airport.example/winter",
          sourceName: "Example official airport winter timetable",
          sourceExcerpt: "Dated winter airport timetable lists 25 outbound destinations.",
          observedGranularity: "region",
          coverageStatus: "regional",
          confidence: "high",
        },
        {
          bundleId: "gr-crete-region",
          rowKey: "airport_summer_direct_destinations",
          value: 100,
          unit: "outbound direct destination airports, NS26 summer season",
          sourceUrl: "https://airport.example/summer",
          sourceName: "Example official airport summer timetable",
          sourceExcerpt: "Dated summer airport timetable lists 100 outbound destinations.",
          observedGranularity: "region",
          coverageStatus: "regional",
          confidence: "high",
        },
      ],
      verifiedDate: "2026-06-30",
    });

    const ratioRow = rows.find((row) => row.key === "airport_winter_route_ratio");
    expect(rows.map((row) => row.key)).toEqual([
      "airport_winter_direct_destinations",
      "airport_summer_direct_destinations",
      "airport_winter_route_ratio",
    ]);
    expect(ratioRow?.cited?.value).toBe(0.25);
    expect(ratioRow?.coverageStatus).toBe("regional");
    expect(ratioRow?.observedGranularity).toBe("region");
  });

  it("builds derived car-dependency rows only from cited component rows", () => {
    type CarDependencyComponentValues = {
      walkability_proxy: number;
      bus_frequency_proxy: string;
      airport_drive_minutes: string;
      ferry_terminal_drive_minutes: string;
      family_amenity_density: string;
      citizen_service_centre_distance: string;
    };

    function componentRow(key: string, value: string | number | boolean): AdapterRow {
      return {
        key,
        label: key,
        matrixCategory: "travel_connectivity",
        intendedGranularity: "town",
        observedGranularity: "town",
        coverageStatus: "proxy",
        cited: {
          value,
          sourceUrl: `https://example.com/${key}`,
          sourceName: `${key} source`,
          verifiedDate: "2026-06-29",
          confidence: "medium",
          granularity: "town",
          category: "connectivity",
        },
        unit: key,
      };
    }

    function bundleFor(placeName: string, values: CarDependencyComponentValues): AdapterBundle {
      return {
        id: `test-${placeName.toLowerCase().replaceAll(" ", "-")}`,
        placeName,
        granularity: "town",
        rows: [
          {
            key: "car_dependency_proxy",
            label: "Car-dependency signal",
            matrixCategory: "travel_connectivity",
            intendedGranularity: "town",
            coverageStatus: "blocked",
            sourceGapReason: "requires_geospatial_build",
            notes: "completed source-gap disposition",
          },
          componentRow("walkability_proxy", values.walkability_proxy),
          componentRow("bus_frequency_proxy", values.bus_frequency_proxy),
          componentRow("airport_drive_minutes", values.airport_drive_minutes),
          componentRow("ferry_terminal_drive_minutes", values.ferry_terminal_drive_minutes),
          componentRow("family_amenity_density", values.family_amenity_density),
          componentRow("citizen_service_centre_distance", values.citizen_service_centre_distance),
        ],
      };
    }

    const chaniaRow = buildCarDependencyProxyRow({
      bundle: bundleFor("Chania", {
        walkability_proxy: 34.1,
        bus_frequency_proxy: "22 daily outbound spine departures from Chania",
        airport_drive_minutes: "OSRM route proxy from Chania: 24.4 minutes, 15.7 km.",
        ferry_terminal_drive_minutes: "OSRM route proxy from Chania: 3 minutes, 1.3 km.",
        family_amenity_density: "2.4 OSM family-service features/km2; mapped green-space share 8%.",
        citizen_service_centre_distance: "OSRM route proxy from Chania: 0.8 minutes, 0.2 km.",
      }),
      verifiedDate: "2026-06-29",
    });
    const agiosRow = buildCarDependencyProxyRow({
      bundle: bundleFor("Agios Nikolaos", {
        walkability_proxy: 15,
        bus_frequency_proxy: "6 weekday outbound spine departures from Agios Nikolaos",
        airport_drive_minutes: "OSRM route proxy from Agios Nikolaos: 58.1 minutes, 61.6 km.",
        ferry_terminal_drive_minutes:
          "OSRM route proxy from Agios Nikolaos: 16.2 minutes, 12.1 km.",
        family_amenity_density:
          "2.5 OSM family-service features/km2; mapped green-space share 12.9%.",
        citizen_service_centre_distance:
          "OSRM route proxy from Agios Nikolaos: 0.9 minutes, 0.4 km.",
      }),
      verifiedDate: "2026-06-29",
    });
    const regionRow = summarizeRegionalCarDependencyProxyRows({
      regionName: "Crete",
      townRows: [chaniaRow, agiosRow],
      verifiedDate: "2026-06-29",
    });

    expect(chaniaRow.key).toBe("car_dependency_proxy");
    expect(chaniaRow.sourceGapReason).toBeUndefined();
    expect(chaniaRow.coverageStatus).toBe("proxy");
    expect(chaniaRow.observedGranularity).toBe("town");
    expect(chaniaRow.cited?.confidence).toBe("medium");
    expect(chaniaRow.cited?.category).toBe("connectivity");
    expect(chaniaRow.cited?.value).toContain("Chania: 9/100");
    expect(chaniaRow.cited?.excerpt).toContain("0.35 * clamp");
    expect(chaniaRow.unit).toBe(
      "0-100 derived car-dependency proxy, higher means more car-dependent",
    );
    expect(chaniaRow.notes).toContain("not a car-ownership rate");
    expect(chaniaRow.notes).toContain("not a full local bus coverage audit");
    expect(chaniaRow.notes).toContain("not");
    expect(chaniaRow.notes).toContain("transport advice");
    expect(regionRow?.coverageStatus).toBe("regional");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("9-54/100");
    expect(regionRow?.notes).toContain("not an island-wide transport dependency index");
  });

  it("builds ELIME cruise-passenger pressure rows and a priority-port regional total", () => {
    const bundleFor = (id: string, placeName: string): AdapterBundle => ({
      id,
      placeName,
      granularity: id === "gr-crete-region" ? "region" : "town",
      rows: [
        {
          key: "cruise_passenger_pressure",
          label: "Cruise passenger pressure",
          matrixCategory: "culture_services",
          intendedGranularity: "region",
          coverageStatus: "blocked",
          sourceGapReason: "source_bot_blocked_manual_needed",
          notes: "completed source-gap disposition",
        },
      ],
    });
    const sources = [
      {
        placeName: "Chania",
        portName: "Chania (Souda)",
        calls: 131,
        passengers: 279_754,
      },
      {
        placeName: "Heraklion",
        portName: "Heraklion",
        calls: 266,
        passengers: 518_575,
      },
    ].map((source) => ({
      ...source,
      year: 2024,
      observedGranularity: "town" as const,
      coverageStatus: "local" as const,
      sourceUrl: "https://elime.gr/cruise.pdf",
      sourceName: "Hellenic Ports Association (ELIME), cruise arrivals 2024-2023 PDF",
      sourceExcerpt: `${source.portName} source excerpt`,
      coverageNote: `${source.portName} coverage note.`,
    }));
    const townRows = sources.map((source, index) =>
      buildCruisePassengerPressureRow({
        bundle: bundleFor(`town-${index}`, source.placeName),
        source,
        verifiedDate: "2026-06-29",
      }),
    );
    const regionRow = summarizeRegionalCruisePassengerPressureRows({
      region: bundleFor("gr-crete-region", "Crete"),
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(townRows[0]?.key).toBe("cruise_passenger_pressure");
    expect(townRows[0]?.coverageStatus).toBe("local");
    expect(townRows[0]?.sourceGapReason).toBeUndefined();
    expect(townRows[0]?.cited?.value).toContain("131 cruise calls");
    expect(townRows[0]?.cited?.value).toContain("279,754 cruise passenger arrivals");
    expect(townRows[0]?.notes).toContain("not unique individuals");
    expect(townRows[0]?.notes).toContain("not a complete tourism-pressure measure");
    expect(regionRow?.coverageStatus).toBe("regional");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("397 cruise calls");
    expect(regionRow?.cited?.value).toContain("798,329 cruise passenger arrivals");
    expect(regionRow?.notes).toContain("Priority-port summary");
  });

  it("builds Open-Meteo environment API URLs for air quality, UV, and snowfall", () => {
    expect(buildOpenMeteoAirQualityUrl(target, 2025)).toBe(
      "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=35.5120831&longitude=24.0191544&start_date=2025-01-01&end_date=2025-12-31&hourly=pm2_5&timezone=UTC",
    );
    expect(buildOpenMeteoUvIndexUrl(target, 2025)).toBe(
      "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=35.5120831&longitude=24.0191544&start_date=2025-01-01&end_date=2025-12-31&hourly=uv_index&timezone=UTC",
    );
    expect(buildOpenMeteoPollenUrl(target, 2025)).toBe(
      "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=35.5120831&longitude=24.0191544&start_date=2025-01-01&end_date=2025-12-31&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=UTC",
    );
    expect(buildOpenMeteoSnowfallUrl(target, "1991-01-01", "2020-12-31")).toBe(
      "https://archive-api.open-meteo.com/v1/archive?latitude=35.5120831&longitude=24.0191544&start_date=1991-01-01&end_date=2020-12-31&daily=snowfall_sum&timezone=UTC",
    );
  });

  it("builds repeatable OSM terrain and Open-Meteo elevation API requests", () => {
    const query = buildOsmTerrainSlopeOverpassQuery(target);

    expect(query).toContain("[out:json][timeout:120]");
    expect(query).toContain("around:2000,35.5120831,24.0191544");
    expect(query).toContain(
      '"highway"~"^(primary|secondary|tertiary|residential|living_street|unclassified|service|pedestrian|footway|path|steps)$"',
    );
    expect(query).toContain("out geom tags");

    expect(
      buildOpenMeteoElevationUrl([
        { lat: 35.5120831, lon: 24.0191544 },
        { lat: 35.513, lon: 24.02 },
      ]),
    ).toBe(
      "https://api.open-meteo.com/v1/elevation?latitude=35.5120831,35.513&longitude=24.0191544,24.02",
    );
  });

  it("builds and parses OSM peak queries for mountain proximity", () => {
    const query = buildOsmMountainPeakOverpassQuery(target);
    const peaks = parseOsmMountainPeakResponse({
      elements: [
        {
          type: "node",
          id: 1,
          lat: 35.4,
          lon: 24.1,
          tags: { name: "Low hill", ele: "900" },
        },
        {
          type: "node",
          id: 2,
          lat: 35.6,
          lon: 24.2,
          tags: { name: "High peak", "name:en": "High Peak", ele: "1,650 m" },
        },
      ],
    });
    const selected = selectNearestElevatedPeak(target, peaks);

    expect(query).toContain("[out:json][timeout:60]");
    expect(query).toContain("around:100000,35.5120831,24.0191544");
    expect(query).toContain('"natural"="peak"');
    expect(query).toContain('"ele"');
    expect(query).toContain("out body;");
    expect(peaks).toHaveLength(2);
    expect(peaks[1]).toMatchObject({
      id: "node/2",
      name: "High Peak",
      elevationMetres: 1650,
      objectUrl: "https://www.openstreetmap.org/node/2",
    });
    expect(selected?.name).toBe("High Peak");
  });

  it("builds mountain proximity rows as mapped-feature proxies", () => {
    const row = buildTownMountainProximityRow({
      target,
      peak: {
        id: "node/2",
        name: "High Peak",
        lat: 35.6,
        lon: 24.2,
        elevationMetres: 1650,
        objectUrl: "https://www.openstreetmap.org/node/2",
      },
      totalPeakCount: 12,
      elevatedPeakCount: 3,
      sourceUrl: "https://overpass-api.de/api/interpreter?data=peaks",
      verifiedDate: "2026-06-28",
    });

    expect(row.key).toBe("mountain_proximity");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.value).toContain("nearest mapped OSM natural=peak");
    expect(row.cited?.excerpt).toContain("3 peaks at or above 1500 m");
    expect(row.notes).toContain("not an official DEM peak inventory");
  });

  it("labels unnamed OSM mountain peaks without hiding their node id", () => {
    const row = buildTownMountainProximityRow({
      target,
      peak: {
        id: "node/2",
        name: "node/2",
        lat: 35.6,
        lon: 24.2,
        elevationMetres: 1650,
        objectUrl: "https://www.openstreetmap.org/node/2",
      },
      totalPeakCount: 12,
      elevatedPeakCount: 3,
      sourceUrl: "https://overpass-api.de/api/interpreter?data=peaks",
      verifiedDate: "2026-06-28",
    });

    expect(row.cited?.value).toContain("unnamed mapped peak node/2");
    expect(row.cited?.excerpt).toContain("unnamed mapped peak node/2, ele=1650 m");
  });

  it("summarizes mountain proximity rows into a regional priority-town row", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildTownMountainProximityRow({
        target: { ...target, id: `town-${i}`, placeName },
        peak: {
          id: `node/${i}`,
          name: `${placeName} peak`,
          lat: target.lat + i / 10,
          lon: target.lon,
          elevationMetres: 1500 + i,
          objectUrl: `https://www.openstreetmap.org/node/${i}`,
        },
        totalPeakCount: 10 + i,
        elevatedPeakCount: 2 + i,
        sourceUrl: "https://overpass-api.de/api/interpreter?data=peaks",
        verifiedDate: "2026-06-28",
      }),
    );

    const row = summarizeRegionalMountainProximityRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(row).toBeDefined();
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.cited?.value).toContain("Priority-town range for Crete");
    expect(row?.notes).toContain("not an island-wide DEM peak inventory");
  });

  it("builds protected-area distance rows from existing OSM protected-area evidence", () => {
    const row = buildProtectedAreaDistanceProxyRow({
      target,
      protectedAreaRow: {
        key: "protected_area_overlap",
        label: "Protected area nearby",
        matrixCategory: "nature_environment",
        intendedGranularity: "town",
        observedGranularity: "town",
        coverageStatus: "proxy",
        cited: {
          value: "2 mapped protected-area or nature-reserve features within 25 km; nearest 10.3 km",
          sourceUrl: "https://overpass-api.de/api/interpreter?data=protected",
          sourceName:
            "OpenStreetMap contributors via Overpass API, protected-area and nature-reserve proximity query for Chania",
          verifiedDate: "2026-06-28",
          confidence: "medium",
          granularity: "town",
          excerpt:
            "Chania: 2 unique mapped OSM features tagged boundary=protected_area, leisure=nature_reserve, or protect_class within 25 km; 12 within 50 km. Nearest feature way/140515050 (Stylou - Katochoriou) at 10.3 km.",
        },
        unit: "mapped features and nearest km",
      },
      verifiedDate: "2026-06-28",
    });

    expect(row?.key).toBe("nat_park_dist_km");
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.sourceGapReason).toBeUndefined();
    expect(row?.observedGranularity).toBe("town");
    expect(row?.cited?.confidence).toBe("medium");
    expect(row?.cited?.value).toContain("10.3 km straight-line");
    expect(row?.cited?.excerpt).toContain("way/140515050");
    expect(row?.notes).toContain("not the official WDPA");
  });

  it("summarizes protected-area distance rows into a regional priority-town row", () => {
    const townRows = [
      ["Chania", 10.3],
      ["Heraklion", 10.2],
      ["Rethymno", 6.5],
      ["Agios Nikolaos", 1.9],
    ].map(([placeName, distance], index) =>
      buildProtectedAreaDistanceProxyRow({
        target: { ...target, id: `town-${index}`, placeName: String(placeName) },
        protectedAreaRow: {
          key: "protected_area_overlap",
          label: "Protected area nearby",
          matrixCategory: "nature_environment",
          intendedGranularity: "town",
          observedGranularity: "town",
          coverageStatus: "proxy",
          cited: {
            value: `2 mapped protected-area or nature-reserve features within 25 km; nearest ${distance} km`,
            sourceUrl: "https://overpass-api.de/api/interpreter?data=protected",
            sourceName: `OpenStreetMap contributors via Overpass API, protected-area and nature-reserve proximity query for ${placeName}`,
            verifiedDate: "2026-06-28",
            confidence: "medium",
            granularity: "town",
            excerpt: `${placeName}: nearest mapped protected-area feature at ${distance} km.`,
          },
          unit: "mapped features and nearest km",
        },
        verifiedDate: "2026-06-28",
      }),
    );

    const row = summarizeRegionalProtectedAreaDistanceRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(row).toBeDefined();
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.cited?.value).toContain("Priority-town range for Crete: 1.9-10.3 km");
    expect(row?.notes).toContain("not an island-wide WDPA");
  });

  it("parses OSM terrain graph and Open-Meteo elevations into slope metrics", () => {
    const graph = parseOsmTerrainSlopeResponse({
      elements: [
        {
          type: "way",
          id: 1,
          tags: { highway: "residential" },
          geometry: [
            { lat: 0, lon: 0 },
            { lat: 0, lon: 0.00089932 },
            { lat: 0, lon: 0.00179864 },
          ],
        },
        {
          type: "way",
          id: 2,
          tags: { highway: "steps" },
          geometry: [
            { lat: 0, lon: 0.01 },
            { lat: 0, lon: 0.01089932 },
          ],
        },
      ],
    });
    const elevations = parseOpenMeteoElevationResponse(graph.coordinates, {
      elevation: [0, 5, 15, 0, 8],
    });
    const metrics = calculateTerrainSlopeMetrics(graph, elevations);

    expect(graph.sourceWayCount).toBe(2);
    expect(graph.stepWayCount).toBe(1);
    expect(graph.segments).toHaveLength(3);
    expect(metrics.sampledSegmentCount).toBe(3);
    expect(metrics.meanAbsGradePct).toBeCloseTo(7.7, 1);
    expect(metrics.p90AbsGradePct).toBeCloseTo(10, 1);
    expect(metrics.shareOver5Pct).toBeCloseTo(66.7, 1);
    expect(metrics.shareOver8Pct).toBeCloseTo(33.3, 1);
  });

  it("builds terrain slope and stroller hilliness rows as cited proxies", () => {
    const rows = buildTerrainSlopeRows({
      target,
      metrics: {
        sourceWayCount: 84,
        sourceSegmentCount: 220,
        sampledSegmentCount: 160,
        meanAbsGradePct: 4.2,
        p90AbsGradePct: 10.6,
        shareOver5Pct: 34.2,
        shareOver8Pct: 12.5,
        stepWayCount: 4,
      },
      overpassSourceUrl: "https://overpass-api.de/api/interpreter?data=terrain",
      elevationSourceUrls: ["https://api.open-meteo.com/v1/elevation?latitude=..."],
      verifiedDate: "2026-06-28",
    });

    expect(rows.map((row) => row.key)).toEqual(["slope_proxy", "stroller_hilliness_proxy"]);
    expect(rows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(rows.every((row) => row.sourceGapReason === undefined)).toBe(true);
    expect(rows.every((row) => row.cited?.confidence === "medium")).toBe(true);
    expect(rows[0]?.cited?.value).toContain("Mean absolute street-segment grade 4.2%");
    expect(rows[0]?.notes).toContain("not a parcel, flood, mobility, or accessibility assessment");
    expect(rows[1]?.cited?.value).toContain("34.2% of sampled street/footway segments over 5%");
    expect(rows[1]?.notes).toContain("not accessibility advice for a specific route");
  });

  it("summarizes terrain slope rows into regional priority-town rows", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildTerrainSlopeRows({
        target: { ...target, id: `town-${i}`, placeName },
        metrics: {
          sourceWayCount: 80 + i,
          sourceSegmentCount: 200 + i,
          sampledSegmentCount: 160,
          meanAbsGradePct: 3 + i,
          p90AbsGradePct: 8 + i,
          shareOver5Pct: 20 + i,
          shareOver8Pct: 8 + i,
          stepWayCount: i,
        },
        overpassSourceUrl: "https://overpass-api.de/api/interpreter?data=terrain",
        elevationSourceUrls: ["https://api.open-meteo.com/v1/elevation?latitude=..."],
        verifiedDate: "2026-06-28",
      }),
    );

    const regionRows = summarizeRegionalTerrainSlopeRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(regionRows).toHaveLength(2);
    expect(regionRows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(regionRows.every((row) => row.observedGranularity === "region")).toBe(true);
    expect(regionRows[0]?.cited?.value).toContain("mean grade range 3-6%");
    expect(regionRows[1]?.cited?.value).toContain("over-5% segment share range 20-23%");
    expect(regionRows[1]?.notes).toContain("not an island-wide stroller accessibility audit");
  });

  it("parses hourly Open-Meteo PM2.5 into monthly means and exceedance days", () => {
    const parsed = parseOpenMeteoPm25Response({
      latitude: 35.5,
      longitude: 24,
      elevation: 15,
      hourly: {
        time: [
          "2025-01-01T00:00",
          "2025-01-01T12:00",
          "2025-01-02T00:00",
          "2025-02-01T00:00",
          "2025-02-01T12:00",
          "2025-02-02T00:00",
        ],
        pm2_5: [10, 22, null, 6, 8, 12],
      },
    });

    expect(parsed.monthlyMeans.slice(0, 2)).toEqual([16, 8.7]);
    expect(parsed.hourlyCount).toBe(5);
    expect(parsed.dailyCount).toBe(3);
    expect(parsed.exceedanceDays).toBe(1);
    expect(parsed.grid).toEqual({ latitude: 35.5, longitude: 24, elevation: 15 });
  });

  it("parses hourly Open-Meteo UV index into monthly mean daily maxima", () => {
    const parsed = parseOpenMeteoUvIndexResponse(
      {
        latitude: 35.5,
        longitude: 24,
        elevation: 15,
        hourly: {
          time: [
            "2025-01-01T09:00",
            "2025-01-01T10:00",
            "2025-01-01T11:00",
            "2025-01-02T09:00",
            "2025-01-02T10:00",
            "2025-02-01T09:00",
            "2025-02-01T10:00",
          ],
          uv_index: [1.2, 2.1, 1.7, 2.6, 2.3, 4.2, 5.8],
        },
      },
      2025,
    );

    expect(parsed.monthlyMeanDailyMax[0]).toBe(2.4);
    expect(parsed.monthlyMeanDailyMax[1]).toBe(5.8);
    expect(parsed.monthlyMeanDailyMax[2]).toBeNull();
    expect(parsed.hourlyCount).toBe(7);
    expect(parsed.dailyCount).toBe(3);
    expect(parsed.year).toBe(2025);
    expect(parsed.grid).toEqual({ latitude: 35.5, longitude: 24, elevation: 15 });
  });

  it("parses hourly Open-Meteo pollen species into a severity proxy", () => {
    const parsed = parseOpenMeteoPollenResponse(
      {
        latitude: 35.5,
        longitude: 24,
        elevation: 15,
        hourly: {
          time: ["2025-01-01T09:00", "2025-01-01T10:00", "2025-01-02T09:00", "2025-02-01T09:00"],
          alder_pollen: [3, 4, 5, 6],
          birch_pollen: [10, 65, null, 12],
          grass_pollen: [20, 8, 55, 40],
          mugwort_pollen: [1, 2, 3, 4],
          olive_pollen: [30, 15, 45, 70],
          ragweed_pollen: [0, 0, 0, 0],
        },
      },
      2025,
      50,
    );

    expect(parsed.year).toBe(2025);
    expect(parsed.hourlyCount).toBe(4);
    expect(parsed.dailyCount).toBe(3);
    expect(parsed.daysAtOrAboveThreshold).toBe(3);
    expect(parsed.peakDailyMax).toBe(70);
    expect(parsed.peakSpecies).toBe("olive");
    expect(parsed.peakSpeciesValue).toBe(70);
    expect(parsed.monthlyMeanDailyMax[0]).toBe(60);
    expect(parsed.monthlyMeanDailyMax[1]).toBe(70);
    expect(parsed.grid).toEqual({ latitude: 35.5, longitude: 24, elevation: 15 });
  });

  it("parses Open-Meteo snowfall into average annual snowfall days", () => {
    const parsed = parseOpenMeteoSnowfallResponse({
      latitude: 35.5,
      longitude: 24,
      elevation: 15,
      daily: {
        time: ["1991-01-01", "1991-01-02", "1992-01-01", "1992-01-02"],
        snowfall_sum: [0, 0.5, 0.2, null],
      },
    });

    expect(parsed.snowfallDaysPerYear).toBe(1);
    expect(parsed.snowfallDayCount).toBe(2);
    expect(parsed.yearCount).toBe(2);
    expect(parsed.grid).toEqual({ latitude: 35.5, longitude: 24, elevation: 15 });
  });

  it("builds Open-Meteo environment rows as cited proxies", () => {
    const rows = buildOpenMeteoEnvironmentRows({
      target,
      airQualityYear: 2025,
      climateStartYear: 1991,
      climateEndYear: 2020,
      pm25: {
        monthlyMeans: [15, 8.7, 7.1, 6.9, 5.1, 4.9, 4.8, 5, 5.8, 7.2, 9.1, 11.3],
        hourlyCount: 8760,
        dailyCount: 365,
        exceedanceDays: 3,
        grid: { latitude: 35.5, longitude: 24, elevation: 15 },
      },
      snowfall: {
        snowfallDaysPerYear: 0.2,
        snowfallDayCount: 6,
        yearCount: 30,
        grid: { latitude: 35.536026, longitude: 24.146341, elevation: 15 },
      },
      pm25SourceUrl: "https://air-quality-api.open-meteo.com/v1/air-quality?...",
      snowfallSourceUrl: "https://archive-api.open-meteo.com/v1/archive?...",
      verifiedDate: "2026-06-28",
    });

    expect(rows.map((row) => row.key)).toEqual([
      "pm25_monthly",
      "pm25_exceedance_days",
      "snowfall_days",
    ]);
    expect(rows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(rows.every((row) => row.sourceGapReason === undefined)).toBe(true);
    expect(rows[0]?.cited?.sourceName).toContain("Open-Meteo Air Quality API");
    expect(rows[0]?.cited?.value).toContain("Jan 15");
    expect(rows[1]?.cited?.value).toBe(3);
    expect(rows[1]?.notes).toContain("not a regulatory monitoring-station observation");
    expect(rows[2]?.cited?.sourceName).toContain("Open-Meteo Historical Weather API");
    expect(rows[2]?.notes).toContain("not a current-weather or road-safety claim");
  });

  it("builds Open-Meteo UV-index rows as cited proxies", () => {
    const row = buildOpenMeteoUvIndexRow({
      target,
      uvIndex: {
        monthlyMeanDailyMax: [1.9, 3.1, 4.5, 6.4, 8.3, 9.7, 10.1, 9.2, 7.1, 4.8, 2.6, 1.7],
        hourlyCount: 8760,
        dailyCount: 365,
        year: 2025,
        grid: { latitude: 35.5, longitude: 24, elevation: 15 },
      },
      uvIndexSourceUrl: "https://air-quality-api.open-meteo.com/v1/air-quality?...",
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("uv_index_monthly");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.cited?.sourceName).toContain("Open-Meteo Air Quality API");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.value).toContain("Jul 10.1");
    expect(row.cited?.excerpt).toContain("monthly mean daily maximum UV index");
    expect(row.notes).toContain("not a TEMIS long-term UV climatology");
  });

  it("builds Open-Meteo pollen-severity rows as cited proxies", () => {
    const row = buildOpenMeteoPollenSeverityRow({
      target,
      pollen: {
        year: 2025,
        hourlyCount: 8760,
        dailyCount: 365,
        threshold: 50,
        daysAtOrAboveThreshold: 42,
        peakDailyMax: 119.4,
        peakSpecies: "olive",
        peakSpeciesValue: 119.4,
        monthlyMeanDailyMax: [2, 3, 18, 45, 61, 24, 12, 7, 9, 10, 5, 2],
        grid: { latitude: 35.5, longitude: 24, elevation: 15 },
      },
      pollenSourceUrl: "https://air-quality-api.open-meteo.com/v1/air-quality?...",
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("pollen_severity");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.cited?.sourceName).toContain("Open-Meteo Air Quality API");
    expect(row.cited?.sourceName).toContain("CAMS pollen grid proxy");
    expect(row.cited?.confidence).toBe("medium");
    expect(row.cited?.value).toContain("42 days");
    expect(row.cited?.value).toContain("peak species olive");
    expect(row.cited?.excerpt).toContain("Species: alder, birch, grass");
    expect(row.unit).toContain("threshold 50 grains/m3");
    expect(row.notes).toContain("not a medical");
    expect(row.notes).toContain("allergy-risk");
    expect(row.notes).toContain("current-forecast");
  });

  it("summarizes Open-Meteo environment rows into regional priority-town rows", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildOpenMeteoEnvironmentRows({
        target: { ...target, id: `town-${i}`, placeName },
        airQualityYear: 2025,
        climateStartYear: 1991,
        climateEndYear: 2020,
        pm25: {
          monthlyMeans: [
            6 + i,
            7 + i,
            8 + i,
            9 + i,
            10 + i,
            11 + i,
            12 + i,
            13 + i,
            14 + i,
            15 + i,
            16 + i,
            17 + i,
          ],
          hourlyCount: 8760,
          dailyCount: 365,
          exceedanceDays: i,
          grid: { latitude: 35.5, longitude: 24, elevation: 15 },
        },
        snowfall: {
          snowfallDaysPerYear: i / 10,
          snowfallDayCount: i * 3,
          yearCount: 30,
          grid: { latitude: 35.536026, longitude: 24.146341, elevation: 15 },
        },
        pm25SourceUrl: "https://air-quality-api.open-meteo.com/v1/air-quality?...",
        snowfallSourceUrl: "https://archive-api.open-meteo.com/v1/archive?...",
        verifiedDate: "2026-06-28",
      }),
    );

    const regionRows = summarizeRegionalOpenMeteoEnvironmentRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(regionRows).toHaveLength(3);
    expect(regionRows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(regionRows.every((row) => row.observedGranularity === "region")).toBe(true);
    expect(regionRows[0]?.cited?.value).toContain("Priority-town monthly PM2.5 range");
    expect(regionRows[1]?.cited?.value).toContain("Priority-town range for Crete: 0-3 days");
    expect(regionRows[2]?.cited?.value).toContain("Priority-town range for Crete: 0-0.3 days/year");
  });

  it("summarizes Open-Meteo UV-index rows into a regional priority-town row", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildOpenMeteoUvIndexRow({
        target: { ...target, id: `town-${i}`, placeName },
        uvIndex: {
          monthlyMeanDailyMax: [
            2 + i,
            3 + i,
            4 + i,
            5 + i,
            6 + i,
            7 + i,
            8 + i,
            7 + i,
            6 + i,
            5 + i,
            4 + i,
            3 + i,
          ],
          hourlyCount: 8760,
          dailyCount: 365,
          year: 2025,
          grid: { latitude: 35.5, longitude: 24, elevation: 15 },
        },
        uvIndexSourceUrl: "https://air-quality-api.open-meteo.com/v1/air-quality?...",
        verifiedDate: "2026-06-29",
      }),
    );

    const regionRow = summarizeRegionalOpenMeteoUvIndexRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(regionRow?.key).toBe("uv_index_monthly");
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town monthly UV-index proxy range");
    expect(regionRow?.notes).toContain("not an island-wide UV raster average");
  });

  it("summarizes Open-Meteo pollen-severity rows into a regional priority-town row", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildOpenMeteoPollenSeverityRow({
        target: { ...target, id: `town-${i}`, placeName },
        pollen: {
          year: 2025,
          hourlyCount: 8760,
          dailyCount: 365,
          threshold: 50,
          daysAtOrAboveThreshold: 20 + i,
          peakDailyMax: 80 + i,
          peakSpecies: "olive",
          peakSpeciesValue: 80 + i,
          monthlyMeanDailyMax: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          grid: { latitude: 35.5, longitude: 24, elevation: 15 },
        },
        pollenSourceUrl: "https://air-quality-api.open-meteo.com/v1/air-quality?...",
        verifiedDate: "2026-06-29",
      }),
    );

    const regionRow = summarizeRegionalOpenMeteoPollenSeverityRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(regionRow?.key).toBe("pollen_severity");
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town pollen-severity proxy range");
    expect(regionRow?.cited?.value).toContain("20-23 days");
    expect(regionRow?.notes).toContain("not an island-wide pollen raster average");
    expect(regionRow?.notes).toContain("not medical advice");
  });

  it("builds one OSM outdoor query with declared radii", () => {
    const query = buildOsmOutdoorOverpassQuery(target);

    expect(query).toContain("[out:json][timeout:120]");
    expect(query).toContain("around:25000,35.5120831,24.0191544");
    expect(query).toContain("around:100000,35.5120831,24.0191544");
    expect(query).toContain('"highway"~"^(path|track)$"');
    expect(query).toContain('"route"="mtb"');
    expect(query).toContain('"sport"="climbing"');
    expect(query).toContain('"sport"="surfing"');
    expect(query).toContain('"piste:type"="downhill"');
    expect(query).toContain("out geom tags");
  });

  it("parses OSM outdoor response into mapped-feature metrics", () => {
    const metrics = parseOsmOutdoorResponse({
      elements: [
        {
          type: "way",
          id: 1,
          tags: { highway: "path" },
          geometry: [
            { lat: 35, lon: 24 },
            { lat: 35, lon: 24.01 },
          ],
        },
        {
          type: "way",
          id: 2,
          tags: { highway: "track" },
          geometry: [
            { lat: 35, lon: 24 },
            { lat: 35.01, lon: 24 },
          ],
        },
        {
          type: "relation",
          id: 3,
          tags: { route: "mtb" },
        },
        {
          type: "node",
          id: 4,
          tags: { sport: "climbing" },
        },
        {
          type: "way",
          id: 5,
          tags: { sport: "surfing" },
        },
        {
          type: "way",
          id: 6,
          tags: { "piste:type": "downhill" },
          geometry: [
            { lat: 35, lon: 24 },
            { lat: 35.02, lon: 24 },
          ],
        },
      ],
    });

    expect(metrics.hikingTrailKm).toBeCloseTo(2, 0);
    expect(metrics.hikingWayCount).toBe(2);
    expect(metrics.mtbTrailCount).toBe(1);
    expect(metrics.climbingSiteCount).toBe(1);
    expect(metrics.surfSpotCount).toBe(1);
    expect(metrics.skiPisteKm).toBeCloseTo(2.2, 1);
    expect(metrics.skiPisteWayCount).toBe(1);
  });

  it("builds OSM outdoor rows as mapped-feature proxies", () => {
    const rows = buildOsmOutdoorRows({
      target,
      metrics: {
        hikingTrailKm: 12.4,
        hikingWayCount: 10,
        mtbTrailCount: 2,
        climbingSiteCount: 1,
        surfSpotCount: 0,
        skiPisteKm: 0,
        skiPisteWayCount: 0,
      },
      endpoint: "https://overpass-api.de/api/interpreter",
      verifiedDate: "2026-06-28",
    });

    expect(rows.map((row) => row.key)).toEqual([
      "hiking_trail_km",
      "mtb_trail_count",
      "climbing_sites",
      "surf_spots",
      "ski_piste_km",
    ]);
    expect(rows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(rows.every((row) => row.sourceGapReason === undefined)).toBe(true);
    expect(rows[0]?.cited?.value).toBe(12.4);
    expect(rows[0]?.notes).toContain("not a hiking safety");
    expect(rows[3]?.cited?.confidence).toBe("low");
    expect(rows[3]?.notes).toContain("zero means no matching mapped OSM features");
    expect(rows[4]?.notes).toContain("not a guarantee of operating ski service");
  });

  it("derives green urban share from cited mapped green-space evidence", () => {
    const row = buildGreenUrbanProxyRow({
      target,
      greenSpaceRow: citedNumberRow("green_space_pct", 8, "OSM mapped green polygon query"),
      verifiedDate: "2026-06-29",
    });

    expect(row).toBeDefined();
    expect(row?.key).toBe("green_urban_pct");
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("town");
    expect(row?.sourceGapReason).toBeUndefined();
    expect(row?.cited?.value).toBe(8);
    expect(row?.cited?.sourceName).toContain(
      "Derived from cited OpenStreetMap mapped green-space proxy",
    );
    expect(row?.cited?.excerpt).toContain("Chania");
    expect(row?.notes).toContain("not Copernicus Urban Atlas");
    expect(row?.notes).toContain("not functional urban area");
  });

  it("leaves green urban share unresolved without a cited mapped green-space row", () => {
    const row = buildGreenUrbanProxyRow({
      target,
      greenSpaceRow: {
        ...citedNumberRow("green_space_pct", 8, "OSM mapped green polygon query"),
        cited: undefined,
      },
      verifiedDate: "2026-06-29",
    });

    expect(row).toBeNull();
  });

  it("summarizes green urban share into a regional priority-town row", () => {
    const townRows = [
      ["Chania", 8],
      ["Heraklion", 5.8],
      ["Rethymno", 13.9],
      ["Agios Nikolaos", 12.9],
    ].flatMap(([placeName, green], index) =>
      buildGreenUrbanProxyRow({
        target: { ...target, id: `town-${index}`, placeName: String(placeName) },
        greenSpaceRow: citedNumberRow(
          "green_space_pct",
          Number(green),
          "OSM mapped green polygon query",
        ),
        verifiedDate: "2026-06-29",
      }),
    );

    const row = summarizeRegionalGreenUrbanProxyRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row).toBeDefined();
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.cited?.value).toContain("Priority-town range for Crete: 5.8-13.9%");
    expect(row?.notes).toContain("not Copernicus Urban Atlas");
    expect(row?.notes).toContain("not an island-wide urban-green inventory");
  });

  it("derives scenery tags from existing cited component rows", () => {
    const row = buildSceneryTagsRow({
      target,
      rows: [
        citedNumberRow("dist_coast_km", 0.53, "OSM coastline query"),
        citedStringRow(
          "mountain_proximity",
          "15.4 km straight-line to nearest mapped OSM natural=peak with ele>=1500m.",
          "OSM mapped peak query",
        ),
        citedNumberRow("green_space_pct", 8, "OSM mapped green polygon query"),
        citedStringRow(
          "nat_park_dist_km",
          "10.3 km straight-line to nearest mapped OSM protected-area or nature-reserve feature center.",
          "OSM protected area query",
        ),
        citedStringRow(
          "bathing_water_quality",
          "15 EEA monitored bathing-water sites within 10 km of the Chania town point, all classified Excellent for the 2025 bathing season.",
          "EEA bathing water query",
        ),
      ],
      verifiedDate: "2026-06-29",
    });

    expect(row).toBeDefined();
    expect(row?.key).toBe("scenery_tags");
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("town");
    expect(row?.sourceGapReason).toBeUndefined();
    expect(row?.cited?.value).toContain("coastal");
    expect(row?.cited?.value).toContain("mountain-proximate");
    expect(row?.cited?.value).toContain("mapped green-space present");
    expect(row?.cited?.value).toContain("protected-area-proximate");
    expect(row?.cited?.value).toContain("monitored bathing-water nearby");
    expect(row?.cited?.sourceName).toContain("Derived from cited OSM, EEA, and Open-Meteo");
    expect(row?.cited?.excerpt).toContain("Component source URLs");
    expect(row?.notes).toContain("not a subjective beauty score");
    expect(row?.notes).toContain("forest-cover value");
  });

  it("leaves scenery tags unresolved when component rows are missing", () => {
    const row = buildSceneryTagsRow({
      target,
      rows: [citedNumberRow("dist_coast_km", 0.53, "OSM coastline query")],
      verifiedDate: "2026-06-29",
    });

    expect(row).toBeNull();
  });

  it("summarizes scenery tags into a regional priority-town row", () => {
    const townRows = ["Chania", "Heraklion"].flatMap((placeName, index) =>
      buildSceneryTagsRow({
        target: { ...target, id: `town-${index}`, placeName },
        rows: [
          citedNumberRow("dist_coast_km", 0.5, "OSM coastline query"),
          citedStringRow(
            "mountain_proximity",
            "15 km straight-line to nearest mapped OSM natural=peak with ele>=1500m.",
            "OSM mapped peak query",
          ),
          citedNumberRow("green_space_pct", 8, "OSM mapped green polygon query"),
          citedStringRow(
            "nat_park_dist_km",
            "10 km straight-line to nearest mapped OSM protected-area or nature-reserve feature center.",
            "OSM protected area query",
          ),
          citedStringRow(
            "bathing_water_quality",
            "15 EEA monitored bathing-water sites within 10 km of the town point, all classified Excellent for the 2025 bathing season.",
            "EEA bathing water query",
          ),
        ],
        verifiedDate: "2026-06-29",
      }),
    );

    const row = summarizeRegionalSceneryTagsRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-29",
    });

    expect(row).toBeDefined();
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.cited?.value).toContain("Priority-town scenery tags for Crete");
    expect(row?.cited?.value).toContain("Chania");
    expect(row?.notes).toContain("not an island-wide forest-cover value");
  });

  it("derives family amenity density from cited OSM component rows", () => {
    const componentRows = [
      citedNumberRow("playground_density", 9, "OSM family service query"),
      citedNumberRow("nursery_density", 1, "OSM family service query"),
      citedNumberRow("primary_school_density", 17, "OSM family service query"),
      citedNumberRow("library_density", 1, "OSM family service query"),
      citedNumberRow("family_doctor_clinic_proxy", 2, "OSM clinic service query"),
      citedNumberRow("green_space_pct", 8, "OSM mapped green polygon query"),
    ];

    const row = buildFamilyAmenityDensityRow({
      target,
      rows: componentRows,
      verifiedDate: "2026-06-28",
    });

    expect(row).toBeDefined();
    expect(row?.key).toBe("family_amenity_density");
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("town");
    expect(row?.sourceGapReason).toBeUndefined();
    expect(row?.cited?.value).toBe(
      "2.4 OSM family-service features/km2; mapped green-space share 8%.",
    );
    expect(row?.cited?.sourceName).toContain("Derived from cited OpenStreetMap proxy rows");
    expect(row?.cited?.excerpt).toContain("playground 9 + nursery 1 + school 17");
    expect(row?.cited?.excerpt).toContain("30 / 12.57 km2 = 2.4 features/km2");
    expect(row?.notes).toContain("not childcare availability");
    expect(row?.notes).toContain("not family suitability advice");
  });

  it("leaves family amenity density unresolved when a required component row is missing", () => {
    const row = buildFamilyAmenityDensityRow({
      target,
      rows: [
        citedNumberRow("playground_density", 9, "OSM family service query"),
        citedNumberRow("nursery_density", 1, "OSM family service query"),
      ],
      verifiedDate: "2026-06-28",
    });

    expect(row).toBeNull();
  });

  it("summarizes derived family amenity density into a regional priority-town row", () => {
    const townRows = [
      ["Chania", 9, 1, 17, 1, 2, 8],
      ["Heraklion", 25, 3, 36, 2, 7, 5.8],
      ["Rethymno", 6, 1, 13, 1, 6, 13.9],
      ["Agios Nikolaos", 13, 2, 11, 1, 5, 12.9],
    ].flatMap(([placeName, playground, nursery, school, library, clinic, green], index) =>
      buildFamilyAmenityDensityRow({
        target: { ...target, id: `town-${index}`, placeName: String(placeName) },
        rows: [
          citedNumberRow("playground_density", Number(playground), "OSM family service query"),
          citedNumberRow("nursery_density", Number(nursery), "OSM family service query"),
          citedNumberRow("primary_school_density", Number(school), "OSM family service query"),
          citedNumberRow("library_density", Number(library), "OSM family service query"),
          citedNumberRow("family_doctor_clinic_proxy", Number(clinic), "OSM clinic service query"),
          citedNumberRow("green_space_pct", Number(green), "OSM mapped green polygon query"),
        ],
        verifiedDate: "2026-06-28",
      }),
    );

    const row = summarizeRegionalFamilyAmenityRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(row).toBeDefined();
    expect(row?.coverageStatus).toBe("proxy");
    expect(row?.observedGranularity).toBe("region");
    expect(row?.cited?.value).toContain("Priority-town range for Crete: 2.1-5.8");
    expect(row?.cited?.value).toContain("green-space share 5.8-13.9%");
    expect(row?.notes).toContain("not an island-wide family-service inventory");
  });

  it("summarizes OSM outdoor rows into regional priority-town rows", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildOsmOutdoorRows({
        target: { ...target, id: `town-${i}`, placeName },
        metrics: {
          hikingTrailKm: 10 + i,
          hikingWayCount: 10 + i,
          mtbTrailCount: i,
          climbingSiteCount: i + 1,
          surfSpotCount: i === 0 ? 1 : 0,
          skiPisteKm: 0,
          skiPisteWayCount: 0,
        },
        endpoint: "https://overpass-api.de/api/interpreter",
        verifiedDate: "2026-06-28",
      }),
    );

    const regionRows = summarizeRegionalOsmOutdoorRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(regionRows).toHaveLength(5);
    expect(regionRows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(regionRows.every((row) => row.observedGranularity === "region")).toBe(true);
    expect(regionRows[0]?.cited?.value).toContain("Priority-town range for Crete: 10-13");
    expect(regionRows[3]?.cited?.value).toContain("0-1 mapped OSM");
    expect(regionRows[4]?.notes).toContain("not an island-wide outdoor inventory");
  });

  it("builds Overpass fetch requests with a project contact user agent", () => {
    const request = buildOverpassFetchRequest(
      "https://overpass-api.de/api/interpreter",
      "[out:json];node(1);out;",
    );

    expect(request.url).toBe(
      "https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%3Bnode(1)%3Bout%3B",
    );
    expect(request.init.method).toBe("GET");
    expect(request.init.headers).toEqual({
      "user-agent": "MySecondCountry Data Desk contact: mysecondcountry.com",
    });
  });

  it("rejects malformed or stale Overpass snapshot timestamps", () => {
    const now = new Date("2026-06-28T22:00:00Z");

    expect(() =>
      validateOverpassSnapshot(
        { osm3s: { timestamp_osm_base: "2026-06-28T21:37:40Z" } },
        "https://overpass-api.de/api/interpreter",
        now,
      ),
    ).not.toThrow();

    expect(() =>
      validateOverpassSnapshot(
        { osm3s: { timestamp_osm_base: "115272" } },
        "https://overpass.osm.ch/api/interpreter",
        now,
      ),
    ).toThrow("invalid Overpass OSM base timestamp");

    expect(() =>
      validateOverpassSnapshot(
        { osm3s: { timestamp_osm_base: "2026-05-01T00:00:00Z" } },
        "https://stale-overpass.example/api/interpreter",
        now,
      ),
    ).toThrow("stale Overpass OSM base timestamp");
  });

  it("parses a specific bundle run without forcing the Crete default cluster", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--bundle",
      "gr-crete-chania",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "all",
      regionId: null,
      townIds: ["gr-crete-chania"],
    });
  });

  it("parses a terrain-only retry run", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--town-bundles",
      "gr-crete-chania,gr-crete-heraklion",
      "--region-bundle",
      "gr-crete-region",
      "--only",
      "terrain",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "terrain",
      regionId: "gr-crete-region",
      townIds: ["gr-crete-chania", "gr-crete-heraklion"],
    });
  });

  it("parses a mountain-only retry run", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "mountain",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "mountain",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a protected-area-only retry run", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "protected-area",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "protected-area",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a green-urban-only retry run", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "green-urban",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "green-urban",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a scenery-only retry run", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "scenery",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "scenery",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a citizen-service-only retry run", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "citizen-service",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "citizen-service",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a tax-office-only retry run", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "tax-office",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "tax-office",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a residence-permit-office-only route pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "residence-permit-office",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "residence-permit-office",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses an international-school-only route pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "international-school",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "international-school",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses an international-school-tuition-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "international-school-tuition",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "international-school-tuition",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a car-dependency-only formula pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "car-dependency",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "car-dependency",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a wildfire-egress-only geospatial pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "wildfire-egress",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "wildfire-egress",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a light-pollution-only geospatial pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "light-pollution",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "light-pollution",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a pharmacy-duty-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "pharmacy-duty",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "pharmacy-duty",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a municipal-digital-services-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "municipal-digital-services",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "municipal-digital-services",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a bus-frequency-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "bus-frequency",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "bus-frequency",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a manual transport-schedule intake pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "transport-schedule-manual",
      "--manual-schedule-file",
      "docs/data/manual/transport-schedule-manual.json",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "transport-schedule-manual",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
      manualSchedulePath: "docs/data/manual/transport-schedule-manual.json",
    });
  });

  it("parses a seasonal-service-dropoff-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "seasonal-service-dropoff",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "seasonal-service-dropoff",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses an emergency-vet-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "emergency-vet",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "emergency-vet",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a pollen-severity-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "pollen-severity",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "pollen-severity",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("parses a water-stress-baseline-only source pass", () => {
    const args = parseAdapterCliArgs([
      "node",
      "scripts/run-city-matrix-adapters.ts",
      "--only",
      "water-stress-baseline",
      "--write",
    ]);

    expect(args).toEqual({
      write: true,
      only: "water-stress-baseline",
      regionId: "gr-crete-region",
      townIds: [
        "gr-crete-chania",
        "gr-crete-heraklion",
        "gr-crete-rethymno",
        "gr-crete-agios-nikolaos",
      ],
    });
  });

  it("converts OSM access counts into cited proxy rows without keeping source gaps", () => {
    const rows = buildOsmAccessRows({
      target,
      counts: {
        walkableAmenities: 126,
        walkNetworkWays: 241,
        sidewalkTaggedWays: 18,
        footwayWays: 31,
        wheelchairRelevantAmenities: 118,
        wheelchairTaggedAmenities: 12,
        stepFreeTaggedStations: 3,
      },
      endpoint: "https://overpass-api.de/api/interpreter",
      verifiedDate: "2026-06-28",
    });

    expect(rows.map((row) => row.key)).toEqual([
      "walkability_proxy",
      "sidewalk_coverage_proxy",
      "wheelchair_tagged_amenities_share",
      "step_free_station_proxy",
    ]);
    expect(rows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(rows.every((row) => row.sourceGapReason === undefined)).toBe(true);
    expect(rows.every((row) => row.observedGranularity === "town")).toBe(true);
    expect(rows.every((row) => row.cited?.sourceUrl.startsWith("https://"))).toBe(true);

    const walkability = rows.find((row) => row.key === "walkability_proxy");
    expect(walkability?.cited?.value).toBe(10);
    expect(walkability?.unit).toBe("selected OSM walkable-service features per km2 within 2 km");

    const sidewalk = rows.find((row) => row.key === "sidewalk_coverage_proxy");
    expect(sidewalk?.cited?.value).toBe(20.3);
    expect(sidewalk?.cited?.confidence).toBe("low");
    expect(sidewalk?.notes).toContain("not a formal accessibility audit");
  });

  it("converts OSM seasonal-service counts into a cited proxy row", () => {
    const row = buildOsmSeasonalServiceDropoffRow({
      target,
      counts: {
        selectedServices: 100,
        openingHoursTaggedServices: 20,
        seasonallyCodedServices: 5,
      },
      endpoint: "https://overpass-api.de/api/interpreter",
      verifiedDate: "2026-06-28",
    });

    expect(row.key).toBe("seasonal_service_dropoff_proxy");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.value).toBe(25);
    expect(row.cited?.confidence).toBe("low");
    expect(row.cited?.sourceUrl).toContain("overpass-api.de");
    expect(row.unit).toContain("opening-hours-tagged");
    expect(row.notes).toContain("not a full winter-vs-summer service-drop-off measure");
    expect(row.notes).toContain("Zero means no selected mapped features returned explicit");
  });

  it("converts OSM emergency-vet counts into a cited proxy row", () => {
    const row = buildOsmEmergencyVetProxyRow({
      target,
      counts: {
        veterinaryFeatures: 6,
        emergencyTaggedVeterinaryFeatures: 1,
      },
      endpoint: "https://overpass-api.de/api/interpreter",
      verifiedDate: "2026-06-28",
    });

    expect(row.key).toBe("emergency_vet_proxy");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.value).toBe(1);
    expect(row.cited?.confidence).toBe("low");
    expect(row.cited?.sourceUrl).toContain("overpass-api.de");
    expect(row.unit).toContain("explicit emergency or 24/7 tags");
    expect(row.notes).toContain("not a complete veterinary directory");
    expect(row.notes).toContain("Zero means no selected mapped veterinary features returned");
  });

  it("parses OSM roads into a wildfire-context road-dependence proxy row", () => {
    const query = buildOsmWildfireEgressOverpassQuery(target);
    expect(query).toContain("around:10000");
    expect(query).toContain("motorway|trunk|primary");
    expect(query).not.toContain("service");
    expect(query).toContain("out geom tags");

    const metrics = parseOsmWildfireEgressResponse(
      {
        osm3s: { timestamp_osm_base: "2026-06-29T00:00:00Z" },
        elements: [
          {
            type: "way",
            id: 1,
            tags: { highway: "primary" },
            geometry: [
              { lat: target.lat, lon: target.lon },
              { lat: target.lat + 0.08, lon: target.lon },
            ],
          },
          {
            type: "way",
            id: 2,
            tags: { highway: "secondary" },
            geometry: [
              { lat: target.lat, lon: target.lon },
              { lat: target.lat, lon: target.lon + 0.09 },
            ],
          },
          {
            type: "way",
            id: 3,
            tags: { highway: "residential" },
            geometry: [
              { lat: target.lat, lon: target.lon },
              { lat: target.lat + 0.005, lon: target.lon + 0.005 },
            ],
          },
          {
            type: "way",
            id: 4,
            tags: { highway: "primary", access: "private" },
            geometry: [
              { lat: target.lat, lon: target.lon },
              { lat: target.lat - 0.08, lon: target.lon },
            ],
          },
          {
            type: "way",
            id: 5,
            tags: { highway: "service" },
            geometry: [
              { lat: target.lat, lon: target.lon },
              { lat: target.lat, lon: target.lon - 0.09 },
            ],
          },
        ],
      },
      target,
    );

    expect(metrics.retainedWayCount).toBe(3);
    expect(metrics.outboundCorridorSectors).toHaveLength(2);
    expect(metrics.deadEndShareRatio).toBeGreaterThan(0.5);

    const score = calculateWildfireEgressRoadDependenceScore({
      exitBearingCount: metrics.outboundCorridorSectors.length,
      deadEndShareRatio: metrics.deadEndShareRatio,
      carDependencyScoreValue: 40,
    });
    expect(score).toBe(54);

    const baseRow = {
      key: "wildfire_egress_proxy",
      label: "Wildfire egress proxy",
      matrixCategory: "safety_rights" as const,
      intendedGranularity: "town" as const,
      coverageStatus: "blocked" as const,
      sourceGapReason: "requires_geospatial_build",
      notes: "Completed source discovery; needs geospatial build.",
    };
    const wildfireRiskRow = {
      key: "wildfire_risk",
      label: "Wildfire risk",
      matrixCategory: "safety_rights" as const,
      intendedGranularity: "country" as const,
      observedGranularity: "country" as const,
      coverageStatus: "inherited_national" as const,
      cited: {
        value: "ThinkHazard classifies wildfire hazard for Greece as High.",
        sourceUrl: "https://thinkhazard.org/en/report/96-greece/WF",
        sourceName: "ThinkHazard Greece wildfire hazard",
        verifiedDate: "2026-06-28",
        confidence: "medium" as const,
        granularity: "country" as const,
        category: "safety" as const,
        excerpt: "Wildfire hazard for Greece is classified as High.",
      },
      notes: "National hazard screening context.",
    };
    const carDependencyRow = {
      key: "car_dependency_proxy",
      label: "Car dependency proxy",
      matrixCategory: "travel_connectivity" as const,
      intendedGranularity: "town" as const,
      observedGranularity: "town" as const,
      coverageStatus: "proxy" as const,
      cited: {
        value: "Derived car-dependency proxy for Chania: 40/100.",
        sourceUrl: "https://example.com/car",
        sourceName: "Derived car-dependency proxy",
        verifiedDate: "2026-06-28",
        confidence: "medium" as const,
        granularity: "town" as const,
      },
      unit: "0-100",
      notes: "Derived car-dependency score.",
    };
    const row = buildOsmWildfireEgressProxyRow({
      bundle: {
        id: "gr-crete-chania",
        placeName: "Chania",
        granularity: "town",
        rows: [baseRow, wildfireRiskRow, carDependencyRow],
      },
      target,
      metrics,
      sourceUrl: "https://overpass-api.de/api/interpreter?data=test",
      verifiedDate: "2026-06-29",
    });

    expect(row.key).toBe("wildfire_egress_proxy");
    expect(row.coverageStatus).toBe("proxy");
    expect(row.sourceGapReason).toBeUndefined();
    expect(row.observedGranularity).toBe("town");
    expect(row.cited?.confidence).toBe("low");
    expect(row.cited?.category).toBe("safety");
    expect(row.cited?.value).toContain("54/100");
    expect(row.cited?.value).toContain("Higher means more road-dependent");
    expect(row.unit).toContain("0-100 low-confidence");
    expect(row.notes).toContain("not an evacuation route");
    expect(row.notes).toContain("not");
    expect(row.notes).toContain("safety");

    const secondTownRow = {
      ...row,
      cited: {
        ...row.cited,
        value:
          "Heraklion low-confidence wildfire-context road-dependence proxy: 22/100. Components: 4 mapped outbound motor-road bearing sectors from the 1 km representative-town core to beyond 7.5 km.",
      },
    } as AdapterRow;
    const regionRow = summarizeRegionalOsmWildfireEgressProxyRows({
      regionName: "Crete",
      townRows: [row, secondTownRow],
      verifiedDate: "2026-06-29",
    });

    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("22-54/100");
    expect(regionRow?.cited?.value).toContain("Chania: 54/100");
    expect(regionRow?.notes).toContain("not an island-wide wildfire egress model");
  });

  it("summarizes town proxy rows into a regional Crete proxy row", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildOsmAccessRows({
        target: { ...target, id: `town-${i}`, placeName },
        counts: {
          walkableAmenities: 100 + i,
          walkNetworkWays: 200,
          sidewalkTaggedWays: 10,
          footwayWays: 20,
          wheelchairRelevantAmenities: 90,
          wheelchairTaggedAmenities: 9,
          stepFreeTaggedStations: i,
        },
        endpoint: "https://overpass-api.de/api/interpreter",
        verifiedDate: "2026-06-28",
      }),
    );

    const regionRows = summarizeRegionalOsmAccessRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(regionRows).toHaveLength(4);
    expect(regionRows.every((row) => row.coverageStatus === "proxy")).toBe(true);
    expect(regionRows.every((row) => row.observedGranularity === "region")).toBe(true);
    expect(regionRows[0]?.cited?.value).toContain("Priority-town range");
    expect(regionRows[0]?.notes).toContain("not an island-wide measurement");
  });

  it("summarizes town seasonal-service proxy rows into a regional Crete proxy row", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildOsmSeasonalServiceDropoffRow({
        target: { ...target, id: `town-${i}`, placeName },
        counts: {
          selectedServices: 100 + i,
          openingHoursTaggedServices: 20,
          seasonallyCodedServices: 4 + i,
        },
        endpoint: "https://overpass-api.de/api/interpreter",
        verifiedDate: "2026-06-28",
      }),
    );

    const regionRow = summarizeRegionalOsmSeasonalServiceDropoffRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(regionRow?.key).toBe("seasonal_service_dropoff_proxy");
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete: 20-35%");
    expect(regionRow?.cited?.value).toContain("Chania: 20%");
    expect(regionRow?.notes).toContain("not an island-wide winter-vs-summer");
    expect(regionRow?.notes).toContain("Sparse or missing opening_hours tags");
  });

  it("summarizes town emergency-vet proxy rows into a regional Crete proxy row", () => {
    const townRows = ["Chania", "Heraklion", "Rethymno", "Agios Nikolaos"].map((placeName, i) =>
      buildOsmEmergencyVetProxyRow({
        target: { ...target, id: `town-${i}`, placeName },
        counts: {
          veterinaryFeatures: 3 + i,
          emergencyTaggedVeterinaryFeatures: i,
        },
        endpoint: "https://overpass-api.de/api/interpreter",
        verifiedDate: "2026-06-28",
      }),
    );

    const regionRow = summarizeRegionalOsmEmergencyVetProxyRows({
      regionName: "Crete",
      townRows,
      verifiedDate: "2026-06-28",
    });

    expect(regionRow?.key).toBe("emergency_vet_proxy");
    expect(regionRow?.coverageStatus).toBe("proxy");
    expect(regionRow?.observedGranularity).toBe("region");
    expect(regionRow?.cited?.value).toContain("Priority-town range for Crete: 0-3");
    expect(regionRow?.cited?.value).toContain("Chania: 0");
    expect(regionRow?.notes).toContain("not an island-wide emergency-vet registry");
    expect(regionRow?.notes).toContain("Sparse OSM emergency tags");
  });
});
