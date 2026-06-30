import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fromUrl, type GeoTIFFImage } from "geotiff";

type Granularity = "country" | "region" | "town";
type CoverageStatus =
  | "local"
  | "regional"
  | "national"
  | "inherited_national"
  | "inherited_regional"
  | "proxy"
  | "relational"
  | "unavailable"
  | "blocked"
  | "deferred";
type MatrixCategory =
  | "identity"
  | "money"
  | "tax_residency"
  | "climate"
  | "travel_connectivity"
  | "health_family_schooling"
  | "safety_rights"
  | "nature_environment"
  | "culture_services";
type Confidence = "high" | "medium" | "low";

type CitedValue = {
  value: number | string | boolean;
  sourceUrl: string;
  sourceName: string;
  verifiedDate: string;
  confidence: Confidence;
  granularity: Granularity;
  category?:
    | "identity"
    | "cost"
    | "climate"
    | "connectivity"
    | "healthcare"
    | "safety"
    | "residency"
    | "tax"
    | "visa";
  excerpt?: string;
};

type MatrixRow = {
  key: string;
  label: string;
  matrixCategory: MatrixCategory;
  intendedGranularity: Granularity;
  observedGranularity?: Granularity;
  coverageStatus: CoverageStatus;
  cited?: CitedValue;
  unit?: string;
  sourceGapReason?: string;
  notes?: string;
};
type CitedMatrixRow = MatrixRow & { cited: CitedValue };

type PlaceEvidenceBundle = {
  id: string;
  placeName: string;
  granularity: Granularity;
  adapterInput?: {
    coordinates?: {
      lat: number;
      lon: number;
      sourceUrl?: string;
      sourceName?: string;
      verifiedDate?: string;
    };
  };
  rows: MatrixRow[];
};

type PlaceTarget = {
  id: string;
  placeName: string;
  granularity: "town";
  lat: number;
  lon: number;
};

type OsmAccessCounts = {
  walkableAmenities: number;
  walkNetworkWays: number;
  sidewalkTaggedWays: number;
  footwayWays: number;
  wheelchairRelevantAmenities: number;
  wheelchairTaggedAmenities: number;
  stepFreeTaggedStations: number;
};
type OsmSeasonalServiceCounts = {
  selectedServices: number;
  openingHoursTaggedServices: number;
  seasonallyCodedServices: number;
};
type OsmEmergencyVetCounts = {
  veterinaryFeatures: number;
  emergencyTaggedVeterinaryFeatures: number;
};
type OsmWildfireEgressMetrics = {
  retainedWayCount: number;
  retainedSegmentCount: number;
  retainedRoadKm: number;
  componentNodeCount: number;
  componentRoadKm: number;
  deadEndNodeCount: number;
  deadEndShareRatio: number;
  outboundCrossingWayCount: number;
  outboundCorridorSectors: number[];
  highwayClassCounts: Record<string, number>;
};

type OsmAccessRowInput = {
  target: PlaceTarget;
  counts: OsmAccessCounts;
  endpoint: string;
  verifiedDate: string;
};
type OsmSeasonalServiceRowInput = {
  target: PlaceTarget;
  counts: OsmSeasonalServiceCounts;
  endpoint: string;
  verifiedDate: string;
};
type OsmEmergencyVetRowInput = {
  target: PlaceTarget;
  counts: OsmEmergencyVetCounts;
  endpoint: string;
  verifiedDate: string;
};
type OsmWildfireEgressRowInput = {
  bundle: PlaceEvidenceBundle;
  target: PlaceTarget;
  metrics: OsmWildfireEgressMetrics;
  sourceUrl: string;
  verifiedDate: string;
};
type OsmOutdoorMetrics = {
  hikingTrailKm: number;
  hikingWayCount: number;
  mtbTrailCount: number;
  climbingSiteCount: number;
  surfSpotCount: number;
  skiPisteKm: number;
  skiPisteWayCount: number;
};
type OsmOutdoorRowInput = {
  target: PlaceTarget;
  metrics: OsmOutdoorMetrics;
  endpoint: string;
  verifiedDate: string;
};
type CoordinatePoint = {
  lat: number;
  lon: number;
};
type ProjectedPoint = {
  x: number;
  y: number;
};
type OsmSurfaceWaterPolygon = {
  id: string;
  name: string;
  tags: Record<string, string>;
  points: ProjectedPoint[];
  areaM2: number;
};
type OsmSurfaceWaterMetrics = {
  waterSharePct: number;
  waterAreaM2: number;
  samplePointCount: number;
  waterSamplePointCount: number;
  retainedPolygonCount: number;
  retainedExamples: Array<{
    id: string;
    name: string;
    tagSummary: string;
    areaM2: number;
  }>;
};
type OsmSurfaceWaterRowInput = {
  bundle: PlaceEvidenceBundle;
  target: PlaceTarget;
  metrics: OsmSurfaceWaterMetrics;
  sourceUrl: string;
  verifiedDate: string;
};
type ArcgisImageSample = {
  locationId: number;
  value: number;
  resolution?: number;
};
type CopernicusHrlForestTreeMetrics = {
  samplePointCount: number;
  treeCanopyPct: number;
  treeValidSampleCount: number;
  treeNoDataSampleCount: number;
  forestCoverPct: number;
  forestValidSampleCount: number;
  forestNoDataSampleCount: number;
  forestClassCounts: {
    nonForest: number;
    broadleaved: number;
    coniferous: number;
  };
  serviceResolutionMetres: number | null;
};
type CopernicusHrlForestTreeRowInput = {
  bundle: PlaceEvidenceBundle;
  target: PlaceTarget;
  metrics: CopernicusHrlForestTreeMetrics;
  treeCoverSourceUrl: string;
  forestTypeSourceUrl: string;
  verifiedDate: string;
};
type TerrainSlopeSegment = {
  from: CoordinatePoint;
  to: CoordinatePoint;
  lengthMetres: number;
  highway: string;
};
type TerrainSlopeGraph = {
  coordinates: CoordinatePoint[];
  segments: TerrainSlopeSegment[];
  sourceWayCount: number;
  sourceSegmentCount: number;
  stepWayCount: number;
};
type TerrainSlopeMetrics = {
  sourceWayCount: number;
  sourceSegmentCount: number;
  sampledSegmentCount: number;
  meanAbsGradePct: number;
  p90AbsGradePct: number;
  shareOver5Pct: number;
  shareOver8Pct: number;
  stepWayCount: number;
};
type TerrainSlopeRowsInput = {
  target: PlaceTarget;
  metrics: TerrainSlopeMetrics;
  overpassSourceUrl: string;
  elevationSourceUrls: string[];
  verifiedDate: string;
};
type OsmPeakCandidate = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevationMetres: number;
  objectUrl: string;
};
type MountainProximityRowInput = {
  target: PlaceTarget;
  peak: OsmPeakCandidate;
  totalPeakCount: number;
  elevatedPeakCount: number;
  sourceUrl: string;
  verifiedDate: string;
};
type ProtectedAreaDistanceRowInput = {
  target: PlaceTarget;
  protectedAreaRow: MatrixRow | null | undefined;
  verifiedDate: string;
};
type BlueFlagRegionalUnit = {
  name: string;
  declaredCount: number;
  municipalities: Map<string, string[]>;
};
type BlueFlagAwardsIndex = {
  sourceUrl: string;
  regionalUnits: Map<string, BlueFlagRegionalUnit>;
};
type BlueFlagTargetConfig = {
  regionalUnit?: string;
  municipality?: string;
  coverageStatus: CoverageStatus;
  observedGranularity: Granularity;
  label: string;
};
type SeatracBeachEntry = {
  title: string;
  href: string;
  status: string;
};
type SeatracRegionDirectory = {
  region: string;
  sourceUrl: string;
  totalCount: number | null;
  beaches: SeatracBeachEntry[];
};
type SeatracAccessibleBeachTargetConfig = {
  regions: string[];
  coverageStatus: CoverageStatus;
  observedGranularity: Granularity;
  granularity: Granularity;
  label: string;
  confidence: Confidence;
  includeNamePatterns?: RegExp[];
  note: string;
};
export type AdapterOnly =
  | "all"
  | "terrain"
  | "mountain"
  | "protected-area"
  | "green-urban"
  | "scenery"
  | "blue-flag"
  | "seatrac-accessible"
  | "uv-index"
  | "citizen-service"
  | "tax-office"
  | "residence-permit-office"
  | "land-registry-office"
  | "international-school"
  | "international-school-tuition"
  | "car-dependency"
  | "pharmacy-duty"
  | "municipal-digital-services"
  | "water-restriction-history"
  | "water-stress-baseline"
  | "surface-water"
  | "forest-tree"
  | "drought-frequency"
  | "light-pollution"
  | "wildfire-egress"
  | "bus-frequency"
  | "cruise-passenger-pressure"
  | "airport-summer-direct-destinations"
  | "transport-schedule-manual"
  | "seasonal-service-dropoff"
  | "emergency-vet"
  | "pollen-severity";
export type AdapterCliArgs = {
  write: boolean;
  only: AdapterOnly;
  regionId: string | null;
  townIds: string[];
  manualSchedulePath?: string;
};
type AdapterRegistryEntry = {
  id: string;
  name: string;
  compilerLane: string;
  sourceFamily: string;
  batchScope: string;
  command: string;
  onlyModes: AdapterOnly[];
  rowKeys: string[];
  proxyCaveat: string;
};
type CityMatrixAdapterRegistry = {
  schemaVersion: number;
  adapters: AdapterRegistryEntry[];
};
type AdapterRunResult = {
  write: boolean;
  changedBundles: string[];
};
type OsmFeatureType =
  | "ferry_terminal"
  | "emergency_hospital"
  | "citizen_service_centre"
  | "tax_office"
  | "residence_permit_office"
  | "land_registry_office"
  | "international_school";
type OsmFeatureCandidate = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  objectUrl: string;
};
type RoutedCandidate = {
  candidate: OsmFeatureCandidate;
  durationMinutes: number;
  distanceKm: number;
};
type FeatureRouteRowsInput = {
  target: PlaceTarget;
  ferryRoute?: RoutedCandidate | null;
  hospitalRoute?: RoutedCandidate | null;
  ferrySourceUrl: string;
  hospitalSourceUrl: string;
  ferryOsrmUrl: string;
  hospitalOsrmUrl: string;
  verifiedDate: string;
};
type CitizenServiceCentreDistanceRowInput = {
  target: PlaceTarget;
  route: RoutedCandidate;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  osrmUrl: string;
  verifiedDate: string;
};
type TaxOfficeDistanceRowInput = {
  target: PlaceTarget;
  route: RoutedCandidate;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  osrmUrl: string;
  verifiedDate: string;
};
type ResidencePermitOfficeDistanceRowInput = {
  target: PlaceTarget;
  route: RoutedCandidate;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  osrmUrl: string;
  verifiedDate: string;
};
type LandRegistryOfficeDistanceRowInput = {
  target: PlaceTarget;
  route: RoutedCandidate;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  osrmUrl: string;
  verifiedDate: string;
};
type InternationalSchoolDistanceRowInput = {
  target: PlaceTarget;
  route: RoutedCandidate;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  osrmUrl: string;
  verifiedDate: string;
};
type CitizenServiceCentreSource = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  geocodeExcerpt: string;
};
type TaxOfficeSource = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  geocodeExcerpt: string;
};
type ResidencePermitOfficeSource = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  geocodeExcerpt: string;
};
type LandRegistryOfficeSource = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  geocodeExcerpt: string;
};
type InternationalSchoolSource = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  geocodeExcerpt: string;
};
type PharmacyDutyRotaSource = {
  placeName: string;
  sourceUrl: string;
  sourceName: string;
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  sourceExcerpt: string;
  coverageNote: string;
};
type MunicipalDigitalServiceSource = {
  placeName: string;
  sourceUrl: string;
  sourceName: string;
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  sourceExcerpt: string;
  coverageNote: string;
};
type WaterRestrictionHistorySource = {
  placeName: string;
  sourceUrl: string;
  sourceName: string;
  noticeDate: string;
  affectedArea: string;
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  sourceExcerpt: string;
  coverageNote: string;
};
type WriAqueductWaterStressSource = {
  regionName: string;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  meaningfulAreaKm2: number;
  noDataAreaKm2: number;
  baselineRaw: number;
  baselineScore: number;
  baselineCategory: number;
  baselineLabel: string;
  rowIds: string[];
  coverageNote: string;
};
type InternationalSchoolTuitionSource = {
  placeName: string;
  sourceUrl: string;
  sourceName: string;
  schoolName: string;
  feeValueEur: number;
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  sourceExcerpt: string;
  coverageNote: string;
};
type BusFrequencyProxySource = {
  placeName: string;
  sourceUrl: string;
  sourceName: string;
  selectedCorridor: string;
  frequencyCount: number;
  frequencyLabel: string;
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  sourceExcerpt: string;
  coverageNote: string;
};
type AirportSummerDirectDestinationsSource = {
  placeName: string;
  airportCode: string;
  airportName: string;
  seasonLabel: string;
  destinationCount: number;
  listedDestinationAirports: number;
  excludedAirports: string[];
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  coverageNote: string;
};
const MANUAL_TRANSPORT_SCHEDULE_ROW_KEYS = [
  "airport_winter_direct_destinations",
  "airport_summer_direct_destinations",
  "ferry_routes_winter",
  "ferry_routes_summer",
] as const;
type TransportScheduleRowKey = (typeof MANUAL_TRANSPORT_SCHEDULE_ROW_KEYS)[number];
const MANUAL_TRANSPORT_SCHEDULE_ROW_KEY_SET = new Set<string>(MANUAL_TRANSPORT_SCHEDULE_ROW_KEYS);
const GRANULARITY_SET = new Set<string>(["country", "region", "town"]);
const MANUAL_TRANSPORT_COVERAGE_STATUS_SET = new Set<string>(["local", "regional", "proxy"]);
const MANUAL_TRANSPORT_CONFIDENCE_SET = new Set<string>(["high", "medium"]);
type TransportScheduleManualRecord = {
  bundleId: string;
  rowKey: TransportScheduleRowKey;
  value: number | string;
  unit: string;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  confidence?: Confidence;
  verifiedDate?: string;
  notes?: string;
};
type TransportScheduleManualFile = {
  schemaVersion: 1;
  records: TransportScheduleManualRecord[];
};
type CruisePassengerPressureSource = {
  placeName: string;
  portName: string;
  calls: number;
  passengers: number;
  year: number;
  observedGranularity: Granularity;
  coverageStatus: CoverageStatus;
  sourceUrl: string;
  sourceName: string;
  sourceExcerpt: string;
  coverageNote: string;
};
type OpenMeteoGridSample = {
  latitude: number;
  longitude: number;
  elevation: number | null;
};
type OpenMeteoPm25Summary = {
  monthlyMeans: Array<number | null>;
  hourlyCount: number;
  dailyCount: number;
  exceedanceDays: number;
  grid: OpenMeteoGridSample;
};
type OpenMeteoSnowfallSummary = {
  snowfallDaysPerYear: number;
  snowfallDayCount: number;
  yearCount: number;
  grid: OpenMeteoGridSample;
};
type OpenMeteoUvIndexSummary = {
  monthlyMeanDailyMax: Array<number | null>;
  hourlyCount: number;
  dailyCount: number;
  year: number;
  grid: OpenMeteoGridSample;
};
type OpenMeteoPollenSummary = {
  year: number;
  hourlyCount: number;
  dailyCount: number;
  threshold: number;
  daysAtOrAboveThreshold: number;
  peakDailyMax: number;
  peakSpecies: string;
  peakSpeciesValue: number;
  monthlyMeanDailyMax: Array<number | null>;
  grid: OpenMeteoGridSample;
};
type OpenMeteoEnvironmentRowsInput = {
  target: PlaceTarget;
  airQualityYear: number;
  climateStartYear: number;
  climateEndYear: number;
  pm25: OpenMeteoPm25Summary;
  snowfall: OpenMeteoSnowfallSummary;
  pm25SourceUrl: string;
  snowfallSourceUrl: string;
  verifiedDate: string;
};
type OpenMeteoUvIndexRowInput = {
  target: PlaceTarget;
  uvIndex: OpenMeteoUvIndexSummary;
  uvIndexSourceUrl: string;
  verifiedDate: string;
};
type OpenMeteoPollenSeverityRowInput = {
  target: PlaceTarget;
  pollen: OpenMeteoPollenSummary;
  pollenSourceUrl: string;
  verifiedDate: string;
};
type EdoCdiGeoTiff = {
  width: number;
  height: number;
  originLon: number;
  originLat: number;
  pixelWidthDeg: number;
  pixelHeightDeg: number;
  values: Uint8Array;
};
type EdoCdiDroughtClassCounts = {
  noDrought: number;
  watch: number;
  warning: number;
  alert: number;
  recoveryOrOther: number;
  noData: number;
};
type EdoCdiDroughtFrequencySample = {
  date: string;
  value: number | null;
};
type EdoCdiDroughtFrequencyMetrics = {
  startDate: string;
  endDate: string;
  requestedObservationCount: number;
  validObservationCount: number;
  droughtObservationCount: number;
  droughtObservationSharePct: number;
  classCounts: EdoCdiDroughtClassCounts;
  sampledValues: EdoCdiDroughtFrequencySample[];
  sampledGrid: {
    row: number;
    col: number;
    lat: number;
    lon: number;
  };
};
type EdoCdiDroughtFrequencyRowInput = {
  bundle: PlaceEvidenceBundle;
  target: PlaceTarget;
  metrics: EdoCdiDroughtFrequencyMetrics;
  sourceUrl: string;
  verifiedDate: string;
};
export type ViirsLightPollutionRasterWindow = {
  rasterWidth: number;
  rasterHeight: number;
  windowWidth: number;
  windowHeight: number;
  originLon: number;
  originLat: number;
  pixelWidthDeg: number;
  pixelHeightDeg: number;
  windowLeft: number;
  windowTop: number;
  values: ArrayLike<number>;
  noDataValue: number;
};
export type ViirsLightPollutionMetrics = {
  sourceYear: number;
  sourceVersion: string;
  sourceFile: string;
  sourceChecksumMd5: string;
  sourceSizeBytes: number;
  sourceScale: number;
  rasterWidth: number;
  rasterHeight: number;
  pixelWidthDeg: number;
  pixelHeightDeg: number;
  windowLeft: number;
  windowTop: number;
  windowRight: number;
  windowBottom: number;
  sampleRadiusMetres: number;
  validSampleCount: number;
  noDataSampleCount: number;
  zeroSampleCount: number;
  rawMean: number;
  rawMin: number;
  rawMax: number;
  rawP50: number;
  rawP90: number;
  radianceMean: number;
  radianceP50: number;
  radianceP90: number;
};
type ViirsLightPollutionRowInput = {
  bundle: PlaceEvidenceBundle;
  target: PlaceTarget;
  metrics: ViirsLightPollutionMetrics;
  sourceUrl: string;
  verifiedDate: string;
};

const BUNDLE_DIR = "packages/data/src/place-bundles";
export const ADAPTER_REGISTRY_PATH = "docs/data/city-matrix-adapter-registry.json";
const CRETE_REGION_ID = "gr-crete-region";
const CRETE_TOWN_IDS = [
  "gr-crete-chania",
  "gr-crete-heraklion",
  "gr-crete-rethymno",
  "gr-crete-agios-nikolaos",
];
const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const OVERPASS_USER_AGENT = "MySecondCountry Data Desk contact: mysecondcountry.com";
const OVERPASS_COUNT_KEYS = [
  "walkableAmenities",
  "walkNetworkWays",
  "sidewalkTaggedWays",
  "footwayWays",
  "wheelchairRelevantAmenities",
  "wheelchairTaggedAmenities",
  "stepFreeTaggedStations",
] as const;
const OVERPASS_SEASONAL_SERVICE_COUNT_KEYS = [
  "selectedServices",
  "openingHoursTaggedServices",
  "seasonallyCodedServices",
] as const;
const WILDFIRE_EGRESS_RADIUS_METRES = 10_000;
const WILDFIRE_EGRESS_INNER_RADIUS_METRES = 1_000;
const WILDFIRE_EGRESS_OUTER_RADIUS_METRES = 7_500;
const WILDFIRE_EGRESS_SECTOR_DEGREES = 45;
const WILDFIRE_EGRESS_DEAD_END_REFERENCE_SHARE = 0.35;
const WILDFIRE_EGRESS_MOTOR_HIGHWAYS = new Set([
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "unclassified",
  "residential",
  "living_street",
]);
const AREA_2KM_KM2 = Math.PI * 2 * 2;
const AREA_2KM_KM2_DISPLAY = Number(AREA_2KM_KM2.toFixed(2));
const MAX_ROUTE_CANDIDATES = 12;
const MAX_OVERPASS_SNAPSHOT_AGE_DAYS = 14;
const PM25_DAILY_GUIDELINE_UG_M3 = 15;
const OUTDOOR_RADIUS_METRES = 25_000;
const SKI_RADIUS_METRES = 100_000;
const TERRAIN_SLOPE_RADIUS_METRES = 2_000;
const MIN_TERRAIN_SLOPE_SEGMENT_METRES = 20;
const MAX_TERRAIN_SLOPE_SEGMENTS = 160;
const SURFACE_WATER_RADIUS_METRES = 2_000;
const SURFACE_WATER_SAMPLE_STEP_METRES = 20;
const COPERNICUS_HRL_RADIUS_METRES = 2_000;
const COPERNICUS_HRL_SAMPLE_STEP_METRES = 50;
const COPERNICUS_HRL_BATCH_SIZE = 800;
const COPERNICUS_HRL_YEAR = 2018;
const COPERNICUS_HRL_TREE_COVER_SOURCE_URL =
  "https://image.discomap.eea.europa.eu/arcgis/rest/services/GioLandPublic/HRL_TreeCoverDensity_2018/ImageServer";
const COPERNICUS_HRL_FOREST_TYPE_SOURCE_URL =
  "https://image.discomap.eea.europa.eu/arcgis/rest/services/GioLandPublic/HRL_ForestType_2018/ImageServer";
const EDO_CDI_WMS_CAPABILITIES_URL =
  "https://drought.emergency.copernicus.eu/api/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities";
const EDO_CDI_WCS_BASE_URL = "https://drought.emergency.copernicus.eu/api/wcs";
const EDO_CDI_DATASET_URL =
  "https://drought.emergency.copernicus.eu/data/Drought_Observatories_datasets/EDO_Combined_Drought_Indicator/ver4-1-0/";
const EDO_CDI_FACTSHEET_URL =
  "https://drought.emergency.copernicus.eu/data/factsheets/factsheet_combinedDroughtIndicator_v4.pdf";
const EDO_CDI_COVERAGE_ID = "cdiad";
const EDO_CDI_SOURCE_NAME =
  "Copernicus Emergency Management Service European Drought Observatory, Combined Drought Indicator v4.1";
const EDO_CDI_OBSERVATION_COUNT = 36;
const EDO_CDI_DROUGHT_CLASS_VALUES = new Set([1, 2, 3]);
const EDO_CDI_VALID_CLASS_VALUES = new Set([0, 1, 2, 3, 4, 5, 6]);
const VIIRS_NIGHTLIGHTS_ZENODO_RECORD_URL = "https://zenodo.org/records/17294744";
const VIIRS_NIGHTLIGHTS_2024_COG_URL =
  "https://zenodo.org/api/records/17294744/files/nightlights.average_viirs.v21_m_500m_s_20240101_20241231_go_epsg4326_v20250904.tif/content";
const VIIRS_NIGHTLIGHTS_2024_FILE =
  "nightlights.average_viirs.v21_m_500m_s_20240101_20241231_go_epsg4326_v20250904.tif";
const VIIRS_NIGHTLIGHTS_2024_MD5 = "0b976892d40c2d0d99177c727289eaf2";
const VIIRS_NIGHTLIGHTS_2024_SIZE_BYTES = 63_713_625;
const VIIRS_NIGHTLIGHTS_SOURCE_YEAR = 2024;
const VIIRS_NIGHTLIGHTS_SOURCE_VERSION = "v20250904";
const VIIRS_NIGHTLIGHTS_SOURCE_SCALE = 10;
const VIIRS_NIGHTLIGHTS_SAMPLE_RADIUS_METRES = 2_000;
const SURFACE_WATER_ALLOWED_VALUES = new Set([
  "basin",
  "canal",
  "lake",
  "pond",
  "reservoir",
  "river",
  "stream",
  "water",
]);
const SURFACE_WATER_EXCLUDED_VALUES = new Set([
  "bay",
  "harbor",
  "harbour",
  "ocean",
  "sea",
  "strait",
]);
const SURFACE_WATER_EXCLUDED_AMENITIES = new Set(["fountain", "swimming_pool"]);
const OPEN_METEO_ELEVATION_BATCH_SIZE = 100;
const TERRAIN_SLOPE_ROW_KEYS = ["slope_proxy", "stroller_hilliness_proxy"] as const;
const POLLEN_THRESHOLD_GRAINS_M3 = 50;
const OPEN_METEO_POLLEN_VARIABLES = [
  "alder_pollen",
  "birch_pollen",
  "grass_pollen",
  "mugwort_pollen",
  "olive_pollen",
  "ragweed_pollen",
] as const;
const POLLEN_SPECIES_LABELS: Record<(typeof OPEN_METEO_POLLEN_VARIABLES)[number], string> = {
  alder_pollen: "alder",
  birch_pollen: "birch",
  grass_pollen: "grass",
  mugwort_pollen: "mugwort",
  olive_pollen: "olive",
  ragweed_pollen: "ragweed",
};
const MOUNTAIN_PEAK_RADIUS_METRES = 100_000;
const MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES = 1_500;
const BLUE_FLAG_AWARDS_YEAR = 2026;
const BLUE_FLAG_AWARDS_SOURCE_URL = `https://www.blueflag.gr/el/awards/${BLUE_FLAG_AWARDS_YEAR}`;
const SEATRAC_DIRECTORY_URL = "https://seatrac.gr/en/beach-directory/";
const SEATRAC_SEARCH_URL = "https://seatrac.gr/Umbraco/Surface/BeachDirectorySurface/SearchBeaches";
const GSIS_KEP_CONTACT_SOURCE_URL =
  "https://www.gsis.gr/sites/default/files/myKEPlive/Kep-Dhmoi-StoixeiaEpikoinwnias.pdf";
const AGIOS_NIKOLAOS_KEP_SOURCE_URL =
  "https://www.agiosnikolaos.gr/2025/12/19/se-neo-choro-to-kep-agiou-nikolaou-prosvasimotita-kai-anavathmismenes-ypiresies-gia-tous-polites/";
const AADE_DOU_CRETE_SOURCE_URL = "https://www.aade.gr/taxonomy/term/29320";
const CRETE_RESIDENCE_PERMIT_OFFICES_SOURCE_URL =
  "https://www.apdkritis.gov.gr/el/%CE%91%CE%BB%CE%BB%CE%BF%CE%B4%CE%B1%CF%80%CE%BF%CE%B9-%CE%BA%CE%B1%CE%B9-%CE%BC%CE%B5%CF%84%CE%B1%CE%BD%CE%B1%CF%83%CF%84%CE%B5%CF%85%CF%83%CE%B7";
const HELLENIC_CADASTRE_CHANIA_OFFICES_PDF_URL =
  "https://cdn.ktimatologio.hast.gr/leitoyrgoynta_kg_ota_2024_03_29_2535eb836b.pdf";
const HELLENIC_CADASTRE_HERAKLION_BRANCH_URL =
  "https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1446";
const HELLENIC_CADASTRE_RETHYMNO_BRANCH_URL =
  "https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1679";
const HELLENIC_CADASTRE_AGIOS_NIKOLAOS_BRANCH_URL =
  "https://www.ktimatologio.gr/grafeio-tipou/deltia-tipou/1656";
const EUROPEAN_SCHOOL_HERAKLION_SOURCE_URL =
  "https://www.eursc.eu/en/accredited-european-schools/locations/heraklion/";
const SCHOOL_OF_EUROPEAN_EDUCATION_HERAKLION_URL = "https://seeh.eu/en/";
const SCHOOL_OF_EUROPEAN_EDUCATION_ENROLMENT_URL =
  "https://seeh.eu/en/the-school/activities?catid=9&id=162%3Asec-enrol&view=article";
const CRETE_PHARMACY_DUTY_ROTA_SOURCE_URL =
  "https://fskriti.gr/%CE%B5%CF%86%CE%B7%CE%BC%CE%B5%CF%81%CE%AF%CE%B5%CF%82/";
const REGION_OF_CRETE_DIGITAL_SERVICES_SOURCE_URL =
  "https://politis.crete.gov.gr/index.php?cat=online";
const KTEL_CHANIA_RETHYMNO_TIMETABLE_PAGE_URL = "https://www.e-ktel.com/en/services/dromologia";
const KTEL_HERAKLION_LASITHI_FAQ_SOURCE_URL =
  "https://www.ktelherlas.gr/en/slug/frequent-asked-questions";
const ELIME_CRUISE_ARRIVALS_2024_SOURCE_URL =
  "https://elime.gr/wp-content/uploads/2025/03/%CE%A4%CE%95%CE%9B%CE%99%CE%9A%CE%91-%CE%A3%CE%A4%CE%9F%CE%99%CE%A7%CE%95%CE%99%CE%91-%CE%91%CE%A6%CE%99%CE%9E%CE%95%CE%A9%CE%9D-%CE%9A%CE%A1%CE%9F%CE%A5%CE%91%CE%96%CE%99%CE%95%CE%A1%CE%91%CE%A3-2024-2023_%CE%9F%CE%A1%CE%98%CE%97-%CE%95%CE%A0%CE%91%CE%9D%CE%91%CE%9B%CE%97%CE%A8%CE%97.pdf";
const ELIME_CRUISE_ARRIVALS_2024_SOURCE_NAME =
  "Hellenic Ports Association (ELIME), cruise arrivals 2024-2023 PDF";
const WRI_AQUEDUCT_4_DATA_ZIP_URL =
  "https://files.wri.org/aqueduct/aqueduct-4-0-water-risk-data.zip";
const CHANIA_AIRPORT_DESTINATIONS_SOURCE_URL =
  "https://www.chq-airport.gr/en/flights--more/flights--destinations/destinations/destinations/dest_id-448/nd_id-448";
const HSCA_CALENDAR_MARCH_2026_SOURCE_URL =
  "https://hsca.gr/hsca-files/calendar-coordination-activities-March2026.pdf";
const AADE_TAX_OFFICES: Record<string, TaxOfficeSource> = {
  "gr-crete-chania": {
    id: "aade-dou-chania-29290",
    name: "AADE DOU Chania (A)",
    address: "Stratigou Tzanakaki 3, 731 34 Chania",
    lat: 35.5109712,
    lon: 24.0248139,
    sourceUrl: "https://www.aade.gr/taxonomy/term/29290",
    sourceName: "AADE DOU Chania (A) office page",
    sourceExcerpt:
      "AADE lists DOU Chania (A), email doy.chanion@aade.gr, and address Stratigou Tzanakaki 3, 731 34 Chania.",
    geocodeExcerpt:
      "Nominatim did not return an exact address point for Stratigou Tzanakaki 3; it returned a Stratigou Tzanakaki street-level coordinate at 35.5109712, 24.0248139. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-heraklion": {
    id: "aade-dou-heraklion-29288",
    name: "AADE DOU Heraklion (A)",
    address: "Leoforos Knossou 255, 714 09 Heraklion",
    lat: 35.3097334,
    lon: 25.1503372,
    sourceUrl: "https://www.aade.gr/taxonomy/term/29288",
    sourceName: "AADE DOU Heraklion (A) office page",
    sourceExcerpt:
      "AADE lists DOU Heraklion (A), email doy.irakleiou@aade.gr, and address Leoforos Knossou 255, 714 09 Heraklion.",
    geocodeExcerpt:
      "Nominatim returned a nearby Leoforos Knossou 259 street/bus-stop feature at 35.3097334, 25.1503372 for Leoforos Knossou 255. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-rethymno": {
    id: "aade-dou-rethymno-29289",
    name: "AADE DOU Rethymno (A)",
    address: "Stamathioudaki 8, 741 00 Rethymno",
    lat: 35.3657383,
    lon: 24.4683251,
    sourceUrl: "https://www.aade.gr/taxonomy/term/29289",
    sourceName: "AADE DOU Rethymno (A) office page",
    sourceExcerpt:
      "AADE lists DOU Rethymno (A), email doy.rethymnou@aade.gr, and address Stamathioudaki 8, 741 00 Rethymno.",
    geocodeExcerpt:
      "Nominatim returned an address-level OSM feature at Stamathioudaki 8, 35.3657383, 24.4683251. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-agios-nikolaos": {
    id: "aade-dou-agios-nikolaos-29287",
    name: "AADE DOU Agios Nikolaos (A)",
    address: "Epimenidou 20, 721 00 Agios Nikolaos",
    lat: 35.1892068,
    lon: 25.7142968,
    sourceUrl: "https://www.aade.gr/taxonomy/term/29287",
    sourceName: "AADE DOU Agios Nikolaos (A) office page",
    sourceExcerpt:
      "AADE lists DOU Agios Nikolaos (A), email doy.agiou-nikolaou@aade.gr, and address Epimenidou 20, 721 00 Agios Nikolaos.",
    geocodeExcerpt:
      "Nominatim did not return an exact address point for Epimenidou 20; it returned an Epimenidou street-level coordinate at 35.1892068, 25.7142968. This is an address-route proxy, not an audited entrance point.",
  },
};
const CRETE_RESIDENCE_PERMIT_OFFICES: Record<string, ResidencePermitOfficeSource> = {
  "gr-crete-chania": {
    id: "apdkritis-residence-permit-chania",
    name: "Residence Permit Department of Chania",
    address: "Therapeftiriou 27, 73200 Chania",
    lat: 35.495268,
    lon: 24.052457,
    sourceUrl: CRETE_RESIDENCE_PERMIT_OFFICES_SOURCE_URL,
    sourceName: "Decentralized Administration of Crete residence-permit department page",
    sourceExcerpt:
      "The Decentralized Administration of Crete lists the Residence Permit Department of Chania and maps it at 35.495268, 24.052457, address Therapeftiriou 27, 73200 Chania.",
    geocodeExcerpt:
      "The official page exposes the mapped office coordinate directly. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-heraklion": {
    id: "apdkritis-residence-permit-heraklion",
    name: "Residence Permit Directorate / Department of Heraklion",
    address: "Elefthernis & Syvritou 2, 71303 Heraklion",
    lat: 35.335578749176,
    lon: 25.117169469595,
    sourceUrl: CRETE_RESIDENCE_PERMIT_OFFICES_SOURCE_URL,
    sourceName: "Decentralized Administration of Crete residence-permit department page",
    sourceExcerpt:
      "The Decentralized Administration of Crete lists the Directorate of Aliens and Migration and the Residence Permit Department of Heraklion, with the mapped Heraklion office at 35.335578749176, 25.117169469595, address Elefthernis & Syvritou 2, 71303 Heraklion.",
    geocodeExcerpt:
      "The official page exposes the mapped office coordinate directly. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-rethymno": {
    id: "apdkritis-residence-permit-rethymno",
    name: "Residence Permit Department of Rethymno",
    address: "Apolloniatou 6, 74100 Rethymno",
    lat: 35.361645,
    lon: 24.480967,
    sourceUrl: CRETE_RESIDENCE_PERMIT_OFFICES_SOURCE_URL,
    sourceName: "Decentralized Administration of Crete residence-permit department page",
    sourceExcerpt:
      "The Decentralized Administration of Crete lists the Residence Permit Department of Rethymno and maps it at 35.361645, 24.480967, address Apolloniatou 6, 74100 Rethymno.",
    geocodeExcerpt:
      "The official page exposes the mapped office coordinate directly. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-agios-nikolaos": {
    id: "apdkritis-residence-permit-lasithi",
    name: "Residence Permit Department of Lasithi",
    address: "Iroon Polytechneiou Administrative Building, 72100 Agios Nikolaos",
    lat: 35.1883,
    lon: 25.719221,
    sourceUrl: CRETE_RESIDENCE_PERMIT_OFFICES_SOURCE_URL,
    sourceName: "Decentralized Administration of Crete residence-permit department page",
    sourceExcerpt:
      "The Decentralized Administration of Crete lists the Residence Permit Department of Lasithi and maps it at 35.1883, 25.719221, address Iroon Polytechneiou Administrative Building, 72100 Agios Nikolaos.",
    geocodeExcerpt:
      "The official page exposes the mapped office coordinate directly. This is an address-route proxy, not an audited entrance point.",
  },
};
const CRETE_LAND_REGISTRY_OFFICES: Record<string, LandRegistryOfficeSource> = {
  "gr-crete-chania": {
    id: "hellenic-cadastre-crete-branch-chania",
    name: "Hellenic Cadastre Crete branch of Chania",
    address: "I. Sfakianaki 30, 73100 Chania",
    lat: 35.5102454,
    lon: 24.0273176,
    sourceUrl: HELLENIC_CADASTRE_CHANIA_OFFICES_PDF_URL,
    sourceName: "Hellenic Cadastre operating cadastral offices PDF",
    sourceExcerpt:
      "The Hellenic Cadastre operating cadastral offices PDF lists the Crete cadastral-office branch of Chania at I. Sfakianaki 30, 73100 Chania.",
    geocodeExcerpt:
      "Nominatim did not return an exact address point for I. Sfakianaki 30; it returned the Ioanni Sfakianaki street-level OSM way coordinate at 35.5102454, 24.0273176. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-heraklion": {
    id: "hellenic-cadastre-crete-branch-heraklion",
    name: "Hellenic Cadastre Crete branch of Heraklion",
    address: "Meteoron 31, Heraklion",
    lat: 35.3417093,
    lon: 25.151077,
    sourceUrl: HELLENIC_CADASTRE_HERAKLION_BRANCH_URL,
    sourceName: "Hellenic Cadastre Heraklion branch press release",
    sourceExcerpt:
      "The Hellenic Cadastre press release lists the Crete cadastral-office branch of Heraklion at Meteoron 31, Heraklion.",
    geocodeExcerpt:
      "Nominatim did not return an exact address point for Meteoron 31; it returned the Meteoron street-level OSM way coordinate at 35.3417093, 25.1510770. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-rethymno": {
    id: "hellenic-cadastre-crete-branch-rethymno",
    name: "Hellenic Cadastre Crete branch of Rethymno",
    address: "Agiou Georgiou Mylouri 1, 741 33 Rethymno",
    lat: 35.3621572,
    lon: 24.5074589,
    sourceUrl: HELLENIC_CADASTRE_RETHYMNO_BRANCH_URL,
    sourceName: "Hellenic Cadastre Rethymno branch relocation press release",
    sourceExcerpt:
      "The Hellenic Cadastre press release says the Crete cadastral-office branch of Rethymno operates at Agiou Georgiou Mylouri 1, Rethymno.",
    geocodeExcerpt:
      "Nominatim did not return an exact address point for Agiou Georgiou Mylouri 1; it returned the Agiou Georgiou Mylouri street-level OSM way coordinate at 35.3621572, 24.5074589. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-agios-nikolaos": {
    id: "hellenic-cadastre-crete-branch-agios-nikolaos",
    name: "Hellenic Cadastre Crete branch of Agios Nikolaos",
    address: "Therissou and Apostolou Titou, 721 00 Agios Nikolaos",
    lat: 35.1904687,
    lon: 25.7155322,
    sourceUrl: HELLENIC_CADASTRE_AGIOS_NIKOLAOS_BRANCH_URL,
    sourceName: "Hellenic Cadastre Agios Nikolaos branch press release",
    sourceExcerpt:
      "The Hellenic Cadastre press release says the Crete cadastral-office branch of Agios Nikolaos operates at Therissou and Apostolou Titou, Agios Nikolaos.",
    geocodeExcerpt:
      "Nominatim did not return an exact address point for the Therissou and Apostolou Titou intersection; it returned an Apostolou Titou street-level OSM way coordinate at 35.1904687, 25.7155322. This is a weak address-route proxy, not an audited junction or entrance point.",
  },
};
const CRETE_ACCREDITED_EUROPEAN_SCHOOL: InternationalSchoolSource = {
  id: "european-school-heraklion",
  name: "School of European Education Heraklion",
  address: "A. Nioti and Savathianon 8, 712 02 Heraklion",
  lat: 35.3403345,
  lon: 25.1271691,
  sourceUrl: EUROPEAN_SCHOOL_HERAKLION_SOURCE_URL,
  sourceName:
    "European Schools accredited location page and School of European Education Heraklion site",
  sourceExcerpt:
    "European Schools lists School of European Education - Heraklion at A. Nioti and Savathianon, 8, 712 02 Heraklion, and says the school is accredited to provide education conforming to European Schools curricula from nursery through European Baccalaureate level. The school site lists Savvathianon & A. Nioti 8, 71202 Heraklion.",
  geocodeExcerpt:
    "Nominatim returned the mapped OSM school feature 'Σχολείο Ευρωπαϊκής Παιδείας' at 35.3403345, 25.1271691 for School of European Education Heraklion. This is an address-route proxy, not an audited entrance point.",
};
const CRETE_INTERNATIONAL_SCHOOL_TUITION_SOURCE: InternationalSchoolTuitionSource = {
  placeName: "Crete",
  sourceUrl: SCHOOL_OF_EUROPEAN_EDUCATION_ENROLMENT_URL,
  sourceName: "School of European Education Heraklion enrolment page",
  schoolName: "School of European Education Heraklion",
  feeValueEur: 0,
  observedGranularity: "region",
  coverageStatus: "proxy",
  sourceExcerpt:
    "The School of European Education Heraklion enrolment page says that no fees apply because the school is a Greek public school.",
  coverageNote:
    "Selected tuition proxy for the European Schools-accredited public school already used by the international-school access row.",
};
const PHARMACY_DUTY_ROTA_SOURCES: Record<string, PharmacyDutyRotaSource> = {
  "gr-crete-chania": {
    placeName: "Chania",
    sourceUrl: "https://chania.efhmeries.gr/",
    sourceName: "Chania duty-pharmacy rota page",
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The page exposes a Chania duty-pharmacy heading, a date selector, a 2026 Chania Crete duty-pharmacy footer, and an API link.",
    coverageNote:
      "Chania named public duty-rota page. This is a rota-page availability signal, not a live pharmacy-access guarantee.",
  },
  "gr-crete-heraklion": {
    placeName: "Heraklion",
    sourceUrl: "https://herakleion.efhmeries.gr/",
    sourceName: "Heraklion duty-pharmacy rota page",
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The page exposes a Heraklion duty-pharmacy heading, a date selector, a 2026 Heraklion Crete duty-pharmacy footer, and an API link.",
    coverageNote:
      "Heraklion named public duty-rota page. This is a rota-page availability signal, not a live pharmacy-access guarantee.",
  },
  "gr-crete-rethymno": {
    placeName: "Rethymno",
    sourceUrl: "https://rethymno.efhmeries.gr/",
    sourceName: "Rethymno duty-pharmacy rota page",
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The page exposes a Rethymno duty-pharmacy heading, a date selector, a sector selector, a 2026 Rethymno duty-pharmacy footer, and an API link.",
    coverageNote:
      "Rethymno named public duty-rota page. This is a rota-page availability signal, not a live pharmacy-access guarantee.",
  },
  "gr-crete-agios-nikolaos": {
    placeName: "Agios Nikolaos",
    sourceUrl: "https://lasithi.efhmeries.gr/",
    sourceName: "Lasithi duty-pharmacy rota page",
    observedGranularity: "region",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The page exposes a Lasithi duty-pharmacy heading, a date selector, a sector selector, a 2026 Lasithi duty-pharmacy footer, and an API link.",
    coverageNote:
      "Lasithi public duty-rota page shown as Agios Nikolaos regional context. This is a rota-page availability signal, not a town-only or live pharmacy-access guarantee.",
  },
};
const MUNICIPAL_DIGITAL_SERVICE_SOURCES: Record<string, MunicipalDigitalServiceSource> = {
  "gr-crete-region": {
    placeName: "Crete",
    sourceUrl: REGION_OF_CRETE_DIGITAL_SERVICES_SOURCE_URL,
    sourceName: "Region of Crete citizen guide online requests page",
    observedGranularity: "region",
    coverageStatus: "regional",
    sourceExcerpt:
      "The Region of Crete citizen guide page is titled 'Οδηγός πολίτη - Αιτήματα πολιτών' and the URL uses cat=online.",
    coverageNote:
      "Region of Crete online citizen-guide request page. This is regional-authority digital-service context, not a municipality-by-municipality service audit.",
  },
  "gr-crete-chania": {
    placeName: "Chania",
    sourceUrl: "https://eservices.chania.gr/",
    sourceName: "Municipality of Chania electronic requests portal",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The Chania portal identifies an electronic-requests service for the Municipality of Chania and exposes a 'New Application' request flow.",
    coverageNote:
      "Chania municipal electronic-requests portal verified at source. This is a local public-service surface signal.",
  },
  "gr-crete-heraklion": {
    placeName: "Heraklion",
    sourceUrl: "https://eservices.heraklion.gr/",
    sourceName: "Municipality of Heraklion electronic services portal",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The Heraklion portal says the municipality offers 135 fully electronic services to citizens and businesses.",
    coverageNote:
      "Heraklion municipal electronic-services portal verified at source. This is a local public-service surface signal.",
  },
  "gr-crete-rethymno": {
    placeName: "Rethymno",
    sourceUrl: "https://www.rethymno.gr/e-services",
    sourceName: "Municipality of Rethymno e-services page",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The Rethymno e-services page lists electronic requests, mobile apps, and electronic payment of debts as citizen e-services.",
    coverageNote:
      "Rethymno municipal e-services page verified at source. This is a local public-service surface signal.",
  },
  "gr-crete-agios-nikolaos": {
    placeName: "Agios Nikolaos",
    sourceUrl: "https://www.agiosnikolaos.gr/e-services/",
    sourceName: "Municipality of Agios Nikolaos e-services page",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The Agios Nikolaos e-services page says it lists services and requests offered electronically.",
    coverageNote:
      "Agios Nikolaos municipal e-services page verified at source. This is a local public-service surface signal.",
  },
};
const WATER_RESTRICTION_HISTORY_SOURCES: Record<string, WaterRestrictionHistorySource> = {
  "gr-crete-chania": {
    placeName: "Chania",
    sourceUrl:
      "https://www.chania.gr/enimerosi/nea/arxeia-dt/archeio-dt-2026/diakopi-nerou-ydrefsis-se-perioches-tis-d-e-keramion/",
    sourceName: "Municipality of Chania and DEYAX water-supply interruption notice",
    noticeDate: "2026-05-25",
    affectedArea:
      "Municipal Unit of Keramia settlements including Malaxa, Panagia, Agios Georgios, Chorafiana, Achlada, Aletrouvari, and Loulou",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The Municipality of Chania notice says DEYAX announced a water-supply interruption on 25 May 2026 in parts of the Keramia municipal unit because of a DEDDIE substation fault feeding the Kontopouloi pumping station.",
    coverageNote:
      "Chania official municipality notice verified through the public page and WordPress JSON endpoint. It is a dated local interruption notice.",
  },
  "gr-crete-heraklion": {
    placeName: "Heraklion",
    sourceUrl:
      "https://www.heraklion.gr/municipality/municipality-press-releases/synexizontai-oi-ergasies-syndesis-neou-diktyoy-DEYAH-11-03-2026.html",
    sourceName: "Municipality of Heraklion and DEYAH water-network works notice",
    noticeDate: "2026-03-11",
    affectedArea: "Agios Ioannis Knossou, Filothei, and the area east of the Mesampelies stream",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The Municipality of Heraklion notice says DEYAH water-network connection works from 22:00 on 11 March 2026 to midday on 12 March required a general supply interruption from the Agios Ioannis pumping station.",
    coverageNote:
      "Heraklion official municipality notice verified at source. It is a dated local interruption notice.",
  },
  "gr-crete-rethymno": {
    placeName: "Rethymno",
    sourceUrl:
      "https://deyar.eu/%CE%B1%CE%BD%CE%B1%CE%BA%CE%BF%CE%AF%CE%BD%CF%89%CF%83%CE%B7-%CE%B4%CE%B5%CF%85%CE%B1%CF%81-%CE%B3%CE%B9%CE%B1-%CE%B4%CE%B9%CE%B1%CE%BA%CE%BF%CF%80%CE%AE-%CE%BD%CE%B5%CF%81%CE%BF%CF%8D-%CF%83%CF%84/",
    sourceName: "DEYA Rethymno water interruption notice",
    noticeDate: "2026-03-12",
    affectedArea: "Kallithea, around the 2nd Lyceum, above IGME, Timios Stavros, and Perivolia",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The DEYA Rethymno notice says a serious fault in the main water-distribution network in Kallithea on 12 March 2026 would cause water-distribution disruption in listed Rethymno areas.",
    coverageNote:
      "Rethymno DEYA public notice verified at source. It is a dated local interruption notice.",
  },
  "gr-crete-agios-nikolaos": {
    placeName: "Agios Nikolaos",
    sourceUrl:
      "https://www.agiosnikolaos.gr/2026/01/13/anakoinosi-gia-diakopi-ydrodotisis-stis-perioches-kritsas-mardatiou-kai-rousas-limnis/",
    sourceName: "Municipality of Agios Nikolaos and DEYAAN water-supply interruption notice",
    noticeDate: "2026-01-13",
    affectedArea: "Kritsa, Mardati, and Roussa Limni",
    observedGranularity: "town",
    coverageStatus: "local",
    sourceExcerpt:
      "The Municipality of Agios Nikolaos notice says DEYAAN announced a water-supply interruption affecting Kritsa, Mardati, and Roussa Limni because of serious damage to water-pumping machinery.",
    coverageNote:
      "Agios Nikolaos official municipality notice verified at source. It is a dated local interruption notice.",
  },
};
const CRETE_WRI_AQUEDUCT_WATER_STRESS_BASELINE: WriAqueductWaterStressSource = {
  regionName: "Crete",
  sourceUrl: WRI_AQUEDUCT_4_DATA_ZIP_URL,
  sourceName: "WRI Aqueduct 4.0 water risk data, baseline annual CSV",
  sourceExcerpt:
    "Aqueduct40_baseline_annual_y2023m07d05.csv rows 212000-GRC.4_1-1570 and 212000-GRC.4_1-None list name_0 Greece, name_1 Crete, bws_raw 2.1240526531793407, bws_score 5.0, bws_cat 4.0, and bws_label Extremely High (>80%). The two Crete no-data slivers total 0.06725837129 km2, compared with 8,391.807457035 km2 carrying the Extremely High label.",
  meaningfulAreaKm2: 8391.807457035,
  noDataAreaKm2: 0.06725837129,
  baselineRaw: 2.1240526531793407,
  baselineScore: 5,
  baselineCategory: 4,
  baselineLabel: "Extremely High (>80%)",
  rowIds: ["212000-GRC.4_1-1570", "212000-GRC.4_1-None"],
  coverageNote:
    "Crete regional baseline water-stress context from WRI Aqueduct 4.0 annual baseline rows for GRC.4_1.",
};
const BUS_FREQUENCY_PROXY_SOURCES: Record<string, BusFrequencyProxySource> = {
  "gr-crete-chania": {
    placeName: "Chania",
    sourceUrl: "https://www.e-ktel.com/images/pdfs/2026/JUN_2026/CHANIA_FROM_27-06-2026.pdf",
    sourceName: "KTEL Chania-Rethymno Chania departures PDF valid from 27 June 2026",
    selectedCorridor: "Chania to Rethymno and Heraklion intercity spine",
    frequencyCount: 22,
    frequencyLabel:
      "22 daily outbound spine departures from Chania, counting 18 Chania-Rethymno-Heraklion services plus 4 express Chania-Heraklion services",
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The KTEL Chania-Rethymno PDF 'Bus departures from Chania' is valid from 27 June 2026. It lists 18 daily Chania-Georgioupolis-Kavros-Rethymno-Bali-Heraklion departures and 4 daily express Chania-Heraklion departures.",
    coverageNote:
      "Chania bus-frequency proxy from a text-readable official KTEL Chania-Rethymno PDF timetable.",
  },
  "gr-crete-heraklion": {
    placeName: "Heraklion",
    sourceUrl: KTEL_HERAKLION_LASITHI_FAQ_SOURCE_URL,
    sourceName: "KTEL Heraklion-Lasithi timetable FAQ",
    selectedCorridor: "Heraklion westbound to Rethymno/Chania and eastbound to Agios Nikolaos",
    frequencyCount: 12,
    frequencyLabel:
      "12 weekday outbound spine departures from Heraklion, counting 5 Heraklion-Rethymno-Chania services plus 7 Heraklion-Agios Nikolaos services",
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The KTEL Heraklion-Lasithi FAQ lists Monday-Friday Heraklion-Rethymno-Chania departures at 7:30, 11:30, 14:30, 17:30, 20:30 and Heraklion-Agios Nikolaos departures at 7:30, 10:00, 12:00, 14:00, 15:45, 17:45, 19:45.",
    coverageNote:
      "Heraklion bus-frequency proxy from an official KTEL Heraklion-Lasithi timetable FAQ.",
  },
  "gr-crete-rethymno": {
    placeName: "Rethymno",
    sourceUrl: "https://www.e-ktel.com/images/pdfs/2026/JUN_2026/RETHYMNO_FROM_23-06-2026.pdf",
    sourceName: "KTEL Chania-Rethymno Rethymno departures PDF valid from 23 June 2026",
    selectedCorridor: "Rethymno westbound to Chania and eastbound to Heraklion",
    frequencyCount: 37,
    frequencyLabel:
      "37 daily outbound spine departures from Rethymno, counting 19 Rethymno-Chania services plus 18 Rethymno-Heraklion services",
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The KTEL Chania-Rethymno PDF 'Timetable with departure from Rethymno' is valid from 23 June 2026. It lists 19 daily Rethymno-Kavros-Georgioupolis-Chania departures and 18 daily Rethymno-Bali-Heraklion departures.",
    coverageNote:
      "Rethymno bus-frequency proxy from a text-readable official KTEL Chania-Rethymno PDF timetable.",
  },
  "gr-crete-agios-nikolaos": {
    placeName: "Agios Nikolaos",
    sourceUrl: KTEL_HERAKLION_LASITHI_FAQ_SOURCE_URL,
    sourceName: "KTEL Heraklion-Lasithi timetable FAQ",
    selectedCorridor: "Agios Nikolaos to Heraklion intercity spine",
    frequencyCount: 6,
    frequencyLabel:
      "6 weekday outbound spine departures from Agios Nikolaos to Heraklion, with 5 Saturday and 5 Sunday departures listed separately",
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceExcerpt:
      "The KTEL Heraklion-Lasithi FAQ lists Monday-Friday Agios Nikolaos-Heraklion departures at 6:30, 9:30, 12:30, 15:30, 17:30, 19:00, with five Saturday and five Sunday departures.",
    coverageNote:
      "Agios Nikolaos bus-frequency proxy from an official KTEL Heraklion-Lasithi timetable FAQ.",
  },
};
const AIRPORT_SUMMER_DIRECT_DESTINATION_SOURCES: Record<
  string,
  AirportSummerDirectDestinationsSource
> = {
  "gr-crete-chania": {
    placeName: "Chania",
    airportCode: "CHQ",
    airportName: "Chania Airport Ioannis Daskalogiannis",
    seasonLabel: "NS26 summer schedule period ending 24 October 2026",
    destinationCount: 115,
    listedDestinationAirports: 116,
    excludedAirports: ["IST"],
    observedGranularity: "region",
    coverageStatus: "proxy",
    sourceUrl: CHANIA_AIRPORT_DESTINATIONS_SOURCE_URL,
    sourceName: "Chania Airport / Fraport Greece destinations timetable",
    sourceExcerpt:
      "Official Chania Airport endpoints returned 116 listed destination airports. The /en/destinations endpoint with ArrivalStatus=D returned outbound timetable rows for 115 airports, with IST listed but no outbound rows. The page says the flight information relates to the period up to 24/10/2026; the HSCA March 2026 calendar identifies NS26 starting 29-Mar-26 and NW26/27 starting 25-Oct-26.",
    coverageNote:
      "Chania selected-airport summer direct-destination count from official Chania/Fraport timetable endpoints, cross-checked against the HSCA seasonal calendar.",
  },
};
const CRUISE_PASSENGER_PRESSURE_SOURCES: Record<string, CruisePassengerPressureSource> = {
  "gr-crete-chania": {
    placeName: "Chania",
    portName: "Chania (Souda)",
    calls: 131,
    passengers: 279_754,
    year: 2024,
    observedGranularity: "town",
    coverageStatus: "proxy",
    sourceUrl: ELIME_CRUISE_ARRIVALS_2024_SOURCE_URL,
    sourceName: ELIME_CRUISE_ARRIVALS_2024_SOURCE_NAME,
    sourceExcerpt:
      "ELIME row 8, Chania (Souda), reports 131 cruise arrivals and 279,754 cruise passenger arrivals for 01/01 to 31/12/2024.",
    coverageNote:
      "Port-level Chania/Souda cruise-call and passenger-arrival row, not a resident population, overnight tourism, ferry passenger, day-crowd distribution, port-capacity, congestion, neighbourhood, spending, or tourism-pressure advice claim.",
  },
  "gr-crete-heraklion": {
    placeName: "Heraklion",
    portName: "Heraklion",
    calls: 266,
    passengers: 518_575,
    year: 2024,
    observedGranularity: "town",
    coverageStatus: "local",
    sourceUrl: ELIME_CRUISE_ARRIVALS_2024_SOURCE_URL,
    sourceName: ELIME_CRUISE_ARRIVALS_2024_SOURCE_NAME,
    sourceExcerpt:
      "ELIME row 5, Heraklion, reports 266 cruise arrivals and 518,575 cruise passenger arrivals for 01/01 to 31/12/2024.",
    coverageNote:
      "Port-level Heraklion cruise-call and passenger-arrival row, not a resident population, overnight tourism, ferry passenger, day-crowd distribution, port-capacity, congestion, neighbourhood, spending, or tourism-pressure advice claim.",
  },
  "gr-crete-rethymno": {
    placeName: "Rethymno",
    portName: "Rethymno",
    calls: 36,
    passengers: 1_788,
    year: 2024,
    observedGranularity: "town",
    coverageStatus: "local",
    sourceUrl: ELIME_CRUISE_ARRIVALS_2024_SOURCE_URL,
    sourceName: ELIME_CRUISE_ARRIVALS_2024_SOURCE_NAME,
    sourceExcerpt:
      "ELIME row 37, Rethymno, reports 36 cruise arrivals and 1,788 cruise passenger arrivals for 01/01 to 31/12/2024.",
    coverageNote:
      "Port-level Rethymno cruise-call and passenger-arrival row, not a resident population, overnight tourism, ferry passenger, day-crowd distribution, port-capacity, congestion, neighbourhood, spending, or tourism-pressure advice claim.",
  },
  "gr-crete-agios-nikolaos": {
    placeName: "Agios Nikolaos",
    portName: "Agios Nikolaos",
    calls: 40,
    passengers: 45_046,
    year: 2024,
    observedGranularity: "town",
    coverageStatus: "local",
    sourceUrl: ELIME_CRUISE_ARRIVALS_2024_SOURCE_URL,
    sourceName: ELIME_CRUISE_ARRIVALS_2024_SOURCE_NAME,
    sourceExcerpt:
      "ELIME row 15, Agios Nikolaos, reports 40 cruise arrivals and 45,046 cruise passenger arrivals for 01/01 to 31/12/2024.",
    coverageNote:
      "Port-level Agios Nikolaos cruise-call and passenger-arrival row, not a resident population, overnight tourism, ferry passenger, day-crowd distribution, port-capacity, congestion, neighbourhood, spending, or tourism-pressure advice claim.",
  },
};
const CITIZEN_SERVICE_CENTRES: Record<string, CitizenServiceCentreSource> = {
  "gr-crete-chania": {
    id: "gsis-kep-chania-0009",
    name: "KEP Chania Municipality",
    address: "Kydonias 29, Chania",
    lat: 35.5123426,
    lon: 24.019111,
    sourceUrl: GSIS_KEP_CONTACT_SOURCE_URL,
    sourceName: "GSIS myKEPlive KEP municipality contact details",
    sourceExcerpt:
      "The GSIS KEP contact list entry for Dimos Chanion lists KEP Dimou Chanion, code 0009, address Kydonias 29.",
    geocodeExcerpt:
      "Nominatim returned OSM feature KEP Chanion at 35.5123426, 24.0191110 for Kydonias 29, Chania.",
  },
  "gr-crete-heraklion": {
    id: "gsis-kep-heraklion-0025",
    name: "KEP Heraklion Municipality",
    address: "Androgeo 2, Heraklion",
    lat: 35.3394189,
    lon: 25.1339436,
    sourceUrl: GSIS_KEP_CONTACT_SOURCE_URL,
    sourceName: "GSIS myKEPlive KEP municipality contact details",
    sourceExcerpt:
      "The GSIS KEP contact list entry for Dimos Irakleiou Kritis lists KEP Dimou Irakleiou, code 0025, address Androgeo 2.",
    geocodeExcerpt:
      "Nominatim returned OSM feature KEP Irakleiou at 35.3394189, 25.1339436 for Androgeo 2, Heraklion.",
  },
  "gr-crete-rethymno": {
    id: "gsis-kep-rethymno-0152",
    name: "KEP Rethymno Municipality",
    address: "Zymvrakaki 10, Rethymno",
    lat: 35.3645123,
    lon: 24.4798771,
    sourceUrl: GSIS_KEP_CONTACT_SOURCE_URL,
    sourceName: "GSIS myKEPlive KEP municipality contact details",
    sourceExcerpt:
      "The GSIS KEP contact list entry for Dimos Rethymnou lists KEP Dimou Rethymnou, code 0152, address Zymvrakaki 10.",
    geocodeExcerpt:
      "Nominatim returned the Zymvrakaki street-level coordinate 35.3645123, 24.4798771 for Rethymno. This is an address-route proxy, not an audited entrance point.",
  },
  "gr-crete-agios-nikolaos": {
    id: "municipality-agios-nikolaos-kep-relocation",
    name: "KEP Agios Nikolaos Municipality",
    address: "Old Town Hall, Roussou Koundourou area, Agios Nikolaos",
    lat: 35.1884023,
    lon: 25.7149218,
    sourceUrl: AGIOS_NIKOLAOS_KEP_SOURCE_URL,
    sourceName: "Municipality of Agios Nikolaos KEP relocation notice",
    sourceExcerpt:
      "The Municipality of Agios Nikolaos relocation notice says the KEP moved to a new accessible space on the ground floor of the Old Town Hall.",
    geocodeExcerpt:
      "Nominatim returned a Roussou Kapetanaki street-level coordinate 35.1884023, 25.7149218 near the Old Town Hall context in Agios Nikolaos. This is an address-route proxy, not an audited entrance point.",
  },
};
const CRETE_BLUE_FLAG_REGIONAL_UNITS = [
  "CHANIA R.U.",
  "RETHYMNO R.U.",
  "HERAKLION R.U.",
  "LASITHI R.U.",
] as const;
const CRETE_SEATRAC_REGIONS = ["Chania", "Crete", "Lasithi", "Rethymno"] as const;
const BLUE_FLAG_TARGETS: Record<string, BlueFlagTargetConfig> = {
  "gr-crete-region": {
    coverageStatus: "regional",
    observedGranularity: "region",
    label: "Crete regional units",
  },
  "gr-crete-chania": {
    regionalUnit: "CHANIA R.U.",
    municipality: "Chania Municipality",
    coverageStatus: "local",
    observedGranularity: "town",
    label: "Chania Municipality",
  },
  "gr-crete-heraklion": {
    regionalUnit: "HERAKLION R.U.",
    coverageStatus: "inherited_regional",
    observedGranularity: "region",
    label: "Heraklion Regional Unit",
  },
  "gr-crete-rethymno": {
    regionalUnit: "RETHYMNO R.U.",
    municipality: "Rethymno Municipality",
    coverageStatus: "local",
    observedGranularity: "town",
    label: "Rethymno Municipality",
  },
  "gr-crete-agios-nikolaos": {
    regionalUnit: "LASITHI R.U.",
    municipality: "Agios Nikolaos Municipality",
    coverageStatus: "local",
    observedGranularity: "town",
    label: "Agios Nikolaos Municipality",
  },
};
const SEATRAC_ACCESSIBLE_BEACH_TARGETS: Record<string, SeatracAccessibleBeachTargetConfig> = {
  "gr-crete-region": {
    regions: [...CRETE_SEATRAC_REGIONS],
    coverageStatus: "regional",
    observedGranularity: "region",
    granularity: "region",
    label: "Crete SEATRAC location groups",
    confidence: "medium",
    note: "Crete regional SEATRAC directory summary across the public Chania, Crete, Lasithi, and Rethymno location groups.",
  },
  "gr-crete-chania": {
    regions: ["Chania"],
    coverageStatus: "inherited_regional",
    observedGranularity: "region",
    granularity: "region",
    label: "SEATRAC Chania location group",
    confidence: "medium",
    note: "SEATRAC Chania location-group count, shown as regional context because the directory group includes beaches outside the Chania town point.",
  },
  "gr-crete-heraklion": {
    regions: ["Crete"],
    coverageStatus: "inherited_regional",
    observedGranularity: "region",
    granularity: "region",
    label: "Heraklion regional-unit matches inside the SEATRAC Crete location group",
    confidence: "low",
    includeNamePatterns: [/hersonissos/i, /malevizi/i],
    note: "Manual name-filtered Heraklion regional-unit count from the SEATRAC Crete location group; the public directory does not expose a Heraklion city group.",
  },
  "gr-crete-rethymno": {
    regions: ["Rethymno"],
    coverageStatus: "inherited_regional",
    observedGranularity: "region",
    granularity: "region",
    label: "SEATRAC Rethymno location group",
    confidence: "medium",
    note: "SEATRAC Rethymno location-group count, shown as regional context because the directory group includes beaches outside the Rethymno town point.",
  },
  "gr-crete-agios-nikolaos": {
    regions: ["Lasithi"],
    coverageStatus: "proxy",
    observedGranularity: "town",
    granularity: "town",
    label: "Agios Nikolaos name matches inside the SEATRAC Lasithi location group",
    confidence: "low",
    includeNamePatterns: [/agios nikolaos/i, /elounda/i, /almyros/i, /kitroplateia/i, /ammos/i],
    note: "Manual target-name match inside the Lasithi SEATRAC directory group; zero means no matching SEATRAC directory entry, not proof that no accessible beach exists.",
  },
};
const FAMILY_AMENITY_COMPONENTS = [
  ["playground_density", "playground"],
  ["nursery_density", "nursery"],
  ["primary_school_density", "school"],
  ["library_density", "library"],
  ["family_doctor_clinic_proxy", "doctor/clinic"],
] as const;
export const ADAPTER_OUTPUT_ROW_KEYS = [
  "walkability_proxy",
  "sidewalk_coverage_proxy",
  "wheelchair_tagged_amenities_share",
  "step_free_station_proxy",
  "nearest_emergency_hospital",
  "emergency_hospital_drive_minutes",
  "ferry_terminal_drive_minutes",
  "pm25_monthly",
  "pm25_exceedance_days",
  "snowfall_days",
  "hiking_trail_km",
  "mtb_trail_count",
  "climbing_sites",
  "surf_spots",
  "ski_piste_km",
  "slope_proxy",
  "stroller_hilliness_proxy",
  "mountain_proximity",
  "nat_park_dist_km",
  "green_urban_pct",
  "scenery_tags",
  "family_amenity_density",
  "blue_flag_beaches",
  "accessible_beach_count",
  "uv_index_monthly",
  "pollen_severity",
  "citizen_service_centre_distance",
  "tax_office_distance",
  "residence_permit_office_distance",
  "land_registry_office_distance",
  "international_school_distance",
  "intl_school_tuition",
  "car_dependency_proxy",
  "after_hours_pharmacy_proxy",
  "municipal_digital_services",
  "water_restriction_history",
  "water_stress_baseline",
  "surface_water_density",
  "forest_cover_pct",
  "tree_canopy_pct",
  "drought_frequency_proxy",
  "light_pollution",
  "wildfire_egress_proxy",
  "bus_frequency_proxy",
  "airport_winter_direct_destinations",
  "airport_summer_direct_destinations",
  "airport_winter_route_ratio",
  "ferry_routes_winter",
  "ferry_routes_summer",
  "seasonal_service_dropoff_proxy",
  "emergency_vet_proxy",
  "cruise_passenger_pressure",
] as const;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function round(value: number, decimals = 1): number {
  return Number(value.toFixed(decimals));
}

export function readCityMatrixAdapterRegistry(
  registryPath = ADAPTER_REGISTRY_PATH,
): CityMatrixAdapterRegistry {
  return JSON.parse(readFileSync(resolve(registryPath), "utf8")) as CityMatrixAdapterRegistry;
}

function registryAdaptersForOnly(
  only: AdapterOnly,
  registry = readCityMatrixAdapterRegistry(),
): AdapterRegistryEntry[] {
  if (only === "all") {
    return registry.adapters.filter((adapter) => adapter.onlyModes.includes("all"));
  }
  return registry.adapters.filter((adapter) => adapter.onlyModes.includes(only));
}

export function buildAdapterCliReport(
  args: AdapterCliArgs,
  result: AdapterRunResult,
  registry = readCityMatrixAdapterRegistry(),
) {
  const adapters = registryAdaptersForOnly(args.only, registry);
  return {
    adapterIds: adapters.map((adapter) => adapter.id),
    sourceFamilies: adapters.map((adapter) => adapter.sourceFamily),
    rowKeys: adapters.flatMap((adapter) => adapter.rowKeys),
    mode: args.write ? "write" : "dry-run",
    only: args.only,
    townIds: args.townIds,
    regionId: args.regionId,
    changedBundles: result.changedBundles,
  };
}

function overpassSourceUrl(endpoint: string, query: string): string {
  return `${endpoint}?data=${encodeURIComponent(query)}`;
}

export function validateOverpassSnapshot(
  response: unknown,
  endpoint: string,
  now = new Date(),
): void {
  const timestamp = (response as { osm3s?: { timestamp_osm_base?: unknown } }).osm3s
    ?.timestamp_osm_base;
  if (typeof timestamp !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) {
    throw new Error(`${endpoint}: invalid Overpass OSM base timestamp ${String(timestamp)}`);
  }

  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${endpoint}: unparsable Overpass OSM base timestamp ${timestamp}`);
  }

  const ageDays = (now.getTime() - parsed) / (24 * 60 * 60 * 1000);
  if (ageDays > MAX_OVERPASS_SNAPSHOT_AGE_DAYS) {
    throw new Error(
      `${endpoint}: stale Overpass OSM base timestamp ${timestamp}, older than ${MAX_OVERPASS_SNAPSHOT_AGE_DAYS} days`,
    );
  }
  if (ageDays < -1) {
    throw new Error(`${endpoint}: future Overpass OSM base timestamp ${timestamp}`);
  }
}

export function buildOpenMeteoAirQualityUrl(
  target: Pick<PlaceTarget, "lat" | "lon">,
  year: number,
): string {
  return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${target.lat}&longitude=${target.lon}&start_date=${year}-01-01&end_date=${year}-12-31&hourly=pm2_5&timezone=UTC`;
}

export function buildOpenMeteoUvIndexUrl(
  target: Pick<PlaceTarget, "lat" | "lon">,
  year: number,
): string {
  return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${target.lat}&longitude=${target.lon}&start_date=${year}-01-01&end_date=${year}-12-31&hourly=uv_index&timezone=UTC`;
}

export function buildOpenMeteoPollenUrl(
  target: Pick<PlaceTarget, "lat" | "lon">,
  year: number,
): string {
  return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${
    target.lat
  }&longitude=${target.lon}&start_date=${year}-01-01&end_date=${year}-12-31&hourly=${OPEN_METEO_POLLEN_VARIABLES.join(
    ",",
  )}&timezone=UTC`;
}

export function buildOpenMeteoSnowfallUrl(
  target: Pick<PlaceTarget, "lat" | "lon">,
  startDate: string,
  endDate: string,
): string {
  return `https://archive-api.open-meteo.com/v1/archive?latitude=${target.lat}&longitude=${target.lon}&start_date=${startDate}&end_date=${endDate}&daily=snowfall_sum&timezone=UTC`;
}

export function buildOpenMeteoElevationUrl(points: CoordinatePoint[]): string {
  const latitudes = points.map((point) => point.lat).join(",");
  const longitudes = points.map((point) => point.lon).join(",");
  return `https://api.open-meteo.com/v1/elevation?latitude=${latitudes}&longitude=${longitudes}`;
}

export function buildBlueFlagAwardsFetchRequest(sourceUrl = BLUE_FLAG_AWARDS_SOURCE_URL): {
  url: string;
  init: RequestInit;
} {
  return {
    url: sourceUrl,
    init: {
      method: "GET",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "accept-language": "en,el;q=0.9",
      },
    },
  };
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    nbsp: " ",
    quot: '"',
    apos: "'",
    rsquo: "'",
    lsquo: "'",
    ndash: "-",
    mdash: "-",
  };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&([a-z]+);/gi, (match, name: string) => named[name] ?? match);
}

export function extractBlueFlagAwardLines(html: string): string[] {
  return html
    .replace(/<(h[1-6]|p|td|tr|div)\b[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "\n")
    .split(/\n+/)
    .map((line) => decodeHtmlEntities(line).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function parseBlueFlagAwardsHtml(
  html: string,
  sourceUrl = BLUE_FLAG_AWARDS_SOURCE_URL,
): BlueFlagAwardsIndex {
  const regionalUnits = new Map<string, BlueFlagRegionalUnit>();
  let currentUnit: BlueFlagRegionalUnit | null = null;
  let currentMunicipality: string | null = null;

  for (const line of extractBlueFlagAwardLines(html)) {
    if (line === "MARINAS") break;

    const regionalUnit = line.match(/^(.+? R\.U\.) \[(\d+)\]$/);
    if (regionalUnit?.[1] && regionalUnit[2]) {
      currentUnit = {
        name: regionalUnit[1],
        declaredCount: Number.parseInt(regionalUnit[2], 10),
        municipalities: new Map<string, string[]>(),
      };
      regionalUnits.set(currentUnit.name, currentUnit);
      currentMunicipality = null;
      continue;
    }

    if (!currentUnit) continue;

    if (line.endsWith(" Municipality")) {
      currentMunicipality = line;
      currentUnit.municipalities.set(currentMunicipality, []);
      continue;
    }

    if (currentMunicipality) {
      currentUnit.municipalities.get(currentMunicipality)?.push(line);
    }
  }

  return { sourceUrl, regionalUnits };
}

function blueFlagRegionalUnit(awards: BlueFlagAwardsIndex, name: string): BlueFlagRegionalUnit {
  const unit = awards.regionalUnits.get(name);
  if (!unit) throw new Error(`Blue Flag awards list missing regional unit ${name}`);
  return unit;
}

function blueFlagMunicipalityBeaches(
  awards: BlueFlagAwardsIndex,
  regionalUnitName: string,
  municipalityName: string,
): string[] {
  const unit = blueFlagRegionalUnit(awards, regionalUnitName);
  const beaches = unit.municipalities.get(municipalityName);
  if (!beaches) {
    throw new Error(`Blue Flag awards list missing ${municipalityName} inside ${regionalUnitName}`);
  }
  return beaches;
}

export function buildBlueFlagBeachRow({
  bundle,
  awards,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  awards: BlueFlagAwardsIndex;
  verifiedDate: string;
}): MatrixRow {
  const config = BLUE_FLAG_TARGETS[bundle.id];
  if (!config) throw new Error(`No Blue Flag target config for ${bundle.id}`);
  const existing = bundle.rows.find((row) => row.key === "blue_flag_beaches");
  if (!existing) throw new Error(`${bundle.id}: missing blue_flag_beaches row`);

  let value: number;
  let excerpt: string;
  let unit = `Blue Flag awarded beaches in ${BLUE_FLAG_AWARDS_YEAR}`;
  let notes: string;

  if (bundle.id === CRETE_REGION_ID) {
    const units = CRETE_BLUE_FLAG_REGIONAL_UNITS.map((name) => blueFlagRegionalUnit(awards, name));
    value = units.reduce((sum, item) => sum + item.declaredCount, 0);
    excerpt = `English official awards list sections for Crete: ${units
      .map((item) => `${item.name} [${item.declaredCount}]`)
      .join(", ")}; sum = ${value}.`;
    unit = `Blue Flag awarded beaches across Crete regional units in ${BLUE_FLAG_AWARDS_YEAR}`;
    notes =
      "Official Blue Flag annual awards count for Crete's four regional units. This is not a town-radius beach count, beach-accessibility claim, safety claim, bathing-water classification, or inventory of unmonitored beaches.";
  } else if (config.municipality && config.regionalUnit) {
    const beaches = blueFlagMunicipalityBeaches(awards, config.regionalUnit, config.municipality);
    value = beaches.length;
    excerpt = `English official awards list has ${config.regionalUnit} > ${config.municipality}: ${value} awarded beaches, including ${beaches
      .slice(0, 4)
      .join(", ")}.`;
    unit = `Blue Flag awarded beaches in ${config.municipality} in ${BLUE_FLAG_AWARDS_YEAR}`;
    notes = `Official Blue Flag annual awards count for ${config.municipality}. This is municipality-level evidence, not a radius count from the town point, beach-accessibility claim, safety claim, bathing-water classification, or inventory of unmonitored beaches.`;
  } else if (config.regionalUnit) {
    const unitRecord = blueFlagRegionalUnit(awards, config.regionalUnit);
    value = unitRecord.declaredCount;
    excerpt = `English official awards list has ${config.regionalUnit} [${value}]. No Heraklion Municipality beach section is used for this row.`;
    unit = `Blue Flag awarded beaches in ${config.label} in ${BLUE_FLAG_AWARDS_YEAR}`;
    notes =
      "Official Blue Flag annual awards count shown as regional-unit context because the source list has no Heraklion Municipality beach section. This is not a Heraklion city-radius beach count, beach-accessibility claim, safety claim, bathing-water classification, or inventory of unmonitored beaches.";
  } else {
    throw new Error(`${bundle.id}: invalid Blue Flag target config`);
  }

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: config.coverageStatus,
    observedGranularity: config.observedGranularity,
    cited: {
      value,
      sourceUrl: awards.sourceUrl,
      sourceName: `Blue Flag Greece, ${BLUE_FLAG_AWARDS_YEAR} awarded beaches list`,
      verifiedDate,
      confidence: "medium",
      granularity: config.observedGranularity,
      excerpt,
    },
    unit,
    notes,
  };
}

function seatracRegionSourceUrl(region: string): string {
  return `${SEATRAC_DIRECTORY_URL}?region=${encodeURIComponent(region)}`;
}

export function buildSeatracDirectoryFetchRequest(sourceUrl = SEATRAC_DIRECTORY_URL): {
  url: string;
  init: RequestInit;
} {
  return {
    url: sourceUrl,
    init: {
      method: "GET",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
    },
  };
}

export function extractSeatracCsrfToken(html: string): string {
  const token = html.match(/name="csrf-token" content="([^"]+)"/)?.[1];
  if (!token) throw new Error("SEATRAC beach directory did not expose a csrf-token meta tag");
  return token;
}

export function buildSeatracSearchFetchRequest({
  token,
  region,
  page,
}: {
  token: string;
  region: string;
  page: number;
}): { url: string; init: RequestInit } {
  return {
    url: SEATRAC_SEARCH_URL,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        __CurrentLocale: "en-US",
        RequestVerificationToken: token,
      },
      body: JSON.stringify({ Region: region, Page: page }),
    },
  };
}

function decodeSeatracJsonString(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "string" ? parsed : trimmed;
  } catch {
    return trimmed;
  }
}

function normalizeSeatracHref(href: string): string {
  if (href.startsWith("https://")) return href;
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return new URL(normalized, SEATRAC_DIRECTORY_URL).toString();
}

export function parseSeatracSearchHtml(html: string): {
  totalCount: number | null;
  pageNumbers: number[];
  beaches: SeatracBeachEntry[];
} {
  const totalMatch = html.match(/Showing:\s*<strong>\s*(\d+)\s+Beaches?/i);
  const pageNumbers = [
    ...new Set(
      [...html.matchAll(/data-page-number="(\d+)"/g)].map((match) =>
        Number.parseInt(match[1] ?? "0", 10),
      ),
    ),
  ].filter((value) => Number.isFinite(value) && value > 0);
  const beaches: SeatracBeachEntry[] = [];

  for (const match of html.matchAll(
    /<div class="card card--beach[\s\S]*?(?=<div class="card card--beach|<nav class="pagination|$)/g,
  )) {
    const card = match[0];
    const href = card.match(/card__title[\s\S]*?<a href="([^"]+)"/)?.[1];
    const title = card.match(/card__title[\s\S]*?<a[^>]*>([^<]+)/)?.[1];
    const status = card.match(/card__status[\s\S]*?<\/span>\s*([^<\r\n]+)/)?.[1];
    if (!href || !title || !status) continue;
    beaches.push({
      title: decodeHtmlEntities(title).replace(/\s+/g, " ").trim(),
      href: normalizeSeatracHref(decodeHtmlEntities(href).trim()),
      status: decodeHtmlEntities(status).replace(/\s+/g, " ").trim(),
    });
  }

  return {
    totalCount: totalMatch?.[1] ? Number.parseInt(totalMatch[1], 10) : null,
    pageNumbers,
    beaches,
  };
}

export function summarizeSeatracRegionPages({
  region,
  pages,
}: {
  region: string;
  pages: string[];
}): SeatracRegionDirectory {
  const seen = new Set<string>();
  const beaches: SeatracBeachEntry[] = [];
  let totalCount: number | null = null;

  for (const html of pages) {
    const parsed = parseSeatracSearchHtml(html);
    totalCount ??= parsed.totalCount;
    for (const beach of parsed.beaches) {
      const key = `${beach.href}|${beach.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      beaches.push(beach);
    }
  }

  return {
    region,
    sourceUrl: seatracRegionSourceUrl(region),
    totalCount,
    beaches,
  };
}

function seatracTargetMatches(
  config: SeatracAccessibleBeachTargetConfig,
  directories: Map<string, SeatracRegionDirectory>,
): Array<SeatracBeachEntry & { region: string }> {
  return config.regions.flatMap((region) => {
    const directory = directories.get(region);
    if (!directory) throw new Error(`Missing SEATRAC directory data for ${region}`);
    return directory.beaches
      .filter((beach) =>
        config.includeNamePatterns
          ? config.includeNamePatterns.some((pattern) => pattern.test(beach.title))
          : true,
      )
      .map((beach) => ({ ...beach, region }));
  });
}

function seatracSourceUrl(config: SeatracAccessibleBeachTargetConfig): string {
  return config.regions.length === 1
    ? seatracRegionSourceUrl(config.regions[0] as string)
    : SEATRAC_DIRECTORY_URL;
}

function seatracDirectoryTotalsText(
  config: SeatracAccessibleBeachTargetConfig,
  directories: Map<string, SeatracRegionDirectory>,
): string {
  return config.regions
    .map((region) => {
      const directory = directories.get(region);
      if (!directory) return `${region}: not fetched`;
      const online = directory.beaches.filter((beach) => beach.status === "Online").length;
      const listed = directory.totalCount ?? directory.beaches.length;
      return `${region}: ${online} Online / ${listed} listed`;
    })
    .join("; ");
}

export function buildSeatracAccessibleBeachRow({
  bundle,
  directories,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  directories: Map<string, SeatracRegionDirectory>;
  verifiedDate: string;
}): MatrixRow {
  const config = SEATRAC_ACCESSIBLE_BEACH_TARGETS[bundle.id];
  if (!config) throw new Error(`No SEATRAC accessible-beach target config for ${bundle.id}`);
  const existing = bundle.rows.find((row) => row.key === "accessible_beach_count");
  if (!existing) throw new Error(`${bundle.id}: missing accessible_beach_count row`);

  const matches = seatracTargetMatches(config, directories);
  const online = matches.filter((beach) => beach.status === "Online");
  const listed = matches.length;
  const notOnline = matches.filter((beach) => beach.status !== "Online");
  const examples = matches
    .slice(0, 8)
    .map((beach) => `${beach.title} (${beach.status}, ${beach.region})`)
    .join("; ");
  const exampleLabel = matches.length > 8 ? "Sample matched entries" : "Matched entries";
  const totals = seatracDirectoryTotalsText(config, directories);
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    coverageStatus: config.coverageStatus,
    observedGranularity: config.observedGranularity,
    cited: {
      value: online.length,
      sourceUrl: seatracSourceUrl(config),
      sourceName: "SEATRAC beach directory",
      verifiedDate,
      confidence: config.confidence,
      granularity: config.granularity,
      excerpt: `${config.label}: ${online.length} Online SEATRAC beach-directory entries out of ${listed} matched listed entries. Directory group totals checked: ${totals}. ${exampleLabel}: ${examples || "none"}. Not-online matched entries: ${
        notOnline.map((beach) => `${beach.title} (${beach.status})`).join("; ") || "none"
      }.`,
    },
    unit: "online SEATRAC beach-directory entries at verification time",
    notes: `${config.note} SEATRAC data is a public facilities-directory signal. It is not a full accessible-beach inventory, not a formal accessibility audit, not a route or parking guarantee, not a sea-state claim, not an assistance-service guarantee, not a bathing-water-quality claim, not a safety claim, and not proof that unmatched beaches are inaccessible.`,
  };
}

export function buildOverpassFetchRequest(
  endpoint: string,
  query: string,
): { url: string; init: RequestInit } {
  return {
    url: overpassSourceUrl(endpoint, query),
    init: {
      method: "GET",
      signal: AbortSignal.timeout(20_000),
      headers: {
        "user-agent": OVERPASS_USER_AGENT,
      },
    },
  };
}

function decodeSourceText(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function extractRepresentativeCoordinate(
  bundle: Pick<PlaceEvidenceBundle, "id" | "placeName" | "granularity" | "adapterInput" | "rows">,
): { lat: number; lon: number } | null {
  const coordinate = bundle.adapterInput?.coordinates;
  if (
    coordinate &&
    Number.isFinite(coordinate.lat) &&
    Number.isFinite(coordinate.lon) &&
    Math.abs(coordinate.lat) <= 90 &&
    Math.abs(coordinate.lon) <= 180
  ) {
    return { lat: coordinate.lat, lon: coordinate.lon };
  }

  for (const row of bundle.rows) {
    const cited = row.cited;
    const texts = [cited?.sourceUrl, cited?.excerpt, row.notes].filter(Boolean) as string[];
    for (const raw of texts) {
      const text = decodeSourceText(raw);
      const around = text.match(/around:\d+,\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
      if (around?.[1] && around[2]) {
        return { lat: Number(around[1]), lon: Number(around[2]) };
      }
      const coordinate = text.match(
        /(?:coordinate|coordinates)\s+(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
      );
      if (coordinate?.[1] && coordinate[2]) {
        return { lat: Number(coordinate[1]), lon: Number(coordinate[2]) };
      }
    }
  }
  return null;
}

export function buildOsmAccessOverpassQuery(target: Pick<PlaceTarget, "lat" | "lon">): string {
  const around2km = `around:2000,${target.lat},${target.lon}`;
  const around5km = `around:5000,${target.lat},${target.lon}`;
  return `[out:json][timeout:90];
(
  nwr(${around2km})["amenity"~"^(cafe|restaurant|pharmacy|school|kindergarten|library|doctors|clinic|bank|post_office|marketplace|toilets|bus_station)$"];
  nwr(${around2km})["shop"~"^(supermarket|convenience|bakery|greengrocer)$"];
);
out count;
(
  way(${around2km})["highway"~"^(residential|living_street|tertiary|secondary|primary|unclassified|service|pedestrian|footway)$"];
);
out count;
(
  way(${around2km})["highway"~"^(residential|living_street|tertiary|secondary|primary|unclassified|service)$"]["sidewalk"];
);
out count;
(
  way(${around2km})["highway"="footway"];
  way(${around2km})["footway"="sidewalk"];
);
out count;
(
  nwr(${around2km})["amenity"~"^(cafe|restaurant|pharmacy|clinic|doctors|hospital|bank|post_office|library|toilets|school|kindergarten|bus_station)$"];
  nwr(${around2km})["shop"~"^(supermarket|convenience|bakery|greengrocer)$"];
);
out count;
(
  nwr(${around2km})["amenity"~"^(cafe|restaurant|pharmacy|clinic|doctors|hospital|bank|post_office|library|toilets|school|kindergarten|bus_station)$"]["wheelchair"];
  nwr(${around2km})["shop"~"^(supermarket|convenience|bakery|greengrocer)$"]["wheelchair"];
);
out count;
(
  nwr(${around5km})["railway"="station"]["wheelchair"="yes"];
  nwr(${around5km})["public_transport"="station"]["wheelchair"="yes"];
  nwr(${around5km})["highway"="elevator"];
);
out count;`;
}

export function buildOsmSeasonalServiceOverpassQuery(
  target: Pick<PlaceTarget, "lat" | "lon">,
): string {
  const around2km = `around:2000,${target.lat},${target.lon}`;
  return `[out:json][timeout:90];
(
  nwr(${around2km})["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|pharmacy|bank|post_office|clinic|doctors|dentist|veterinary|library|marketplace)$"];
  nwr(${around2km})["shop"~"^(supermarket|convenience|bakery|greengrocer|butcher|chemist|clothes|hairdresser)$"];
  nwr(${around2km})["tourism"~"^(hotel|guest_house|hostel|apartment|attraction|museum|information)$"];
);
out tags;`;
}

export function buildOsmEmergencyVetOverpassQuery(
  target: Pick<PlaceTarget, "lat" | "lon">,
): string {
  const around10km = `around:10000,${target.lat},${target.lon}`;
  return `[out:json][timeout:90];
(
  nwr(${around10km})["amenity"="veterinary"];
  nwr(${around10km})["healthcare"="veterinary"];
);
out tags;`;
}

export function buildOsmWildfireEgressOverpassQuery(
  target: Pick<PlaceTarget, "lat" | "lon">,
): string {
  const radius = `around:${WILDFIRE_EGRESS_RADIUS_METRES},${target.lat},${target.lon}`;
  return `[out:json][timeout:120];
(
  way(${radius})["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street)$"]["area"!~"yes"]["access"!~"^(private|no)$"]["vehicle"!~"^(private|no)$"]["motor_vehicle"!~"^(private|no)$"];
);
out geom tags;`;
}

export function buildOsmOutdoorOverpassQuery(target: Pick<PlaceTarget, "lat" | "lon">): string {
  const outdoorRadius = `around:${OUTDOOR_RADIUS_METRES},${target.lat},${target.lon}`;
  const skiRadius = `around:${SKI_RADIUS_METRES},${target.lat},${target.lon}`;
  return `[out:json][timeout:120];
(
  way(${outdoorRadius})["highway"~"^(path|track)$"];
  relation(${outdoorRadius})["route"="mtb"];
  nwr(${outdoorRadius})["sport"="climbing"];
  nwr(${outdoorRadius})["sport"="surfing"];
  way(${skiRadius})["piste:type"="downhill"];
);
out geom tags;`;
}

export function buildOsmSurfaceWaterOverpassQuery(
  target: Pick<PlaceTarget, "lat" | "lon">,
): string {
  const radius = `around:${SURFACE_WATER_RADIUS_METRES},${target.lat},${target.lon}`;
  return `[out:json][timeout:120];
(
  way(${radius})["natural"="water"];
  relation(${radius})["natural"="water"];
  way(${radius})["waterway"="riverbank"];
  relation(${radius})["waterway"="riverbank"];
  way(${radius})["landuse"="reservoir"];
  relation(${radius})["landuse"="reservoir"];
  way(${radius})["water"];
  relation(${radius})["water"];
);
out geom tags;`;
}

export function buildOsmTerrainSlopeOverpassQuery(
  target: Pick<PlaceTarget, "lat" | "lon">,
): string {
  const radius = `around:${TERRAIN_SLOPE_RADIUS_METRES},${target.lat},${target.lon}`;
  return `[out:json][timeout:120];
(
  way(${radius})["highway"~"^(primary|secondary|tertiary|residential|living_street|unclassified|service|pedestrian|footway|path|steps)$"];
);
out geom tags;`;
}

export function buildOsmMountainPeakOverpassQuery(
  target: Pick<PlaceTarget, "lat" | "lon">,
): string {
  const radius = `around:${MOUNTAIN_PEAK_RADIUS_METRES},${target.lat},${target.lon}`;
  return `[out:json][timeout:60];
(
  node(${radius})["natural"="peak"]["ele"];
);
out body;`;
}

export function buildOsmFeatureOverpassQuery(
  target: Pick<PlaceTarget, "lat" | "lon">,
  featureType: OsmFeatureType,
): string {
  const radiusMetres = featureType === "citizen_service_centre" ? 30_000 : 100_000;
  const aroundRadius = `around:${radiusMetres},${target.lat},${target.lon}`;
  const kepNamePattern =
    "(ΚΕΠ|K[.]?E[.]?P[.]?|Citizen Service Centre|Citizens Service Centre|Citizen Service Center|Citizens Service Center|Κέντρο Εξυπηρέτησης Πολιτών)";
  if (featureType === "ferry_terminal") {
    return `[out:json][timeout:90];
(
  nwr(${aroundRadius})["amenity"="ferry_terminal"];
  nwr(${aroundRadius})["seamark:type"="ferry_terminal"];
);
out center tags;`;
  }
  if (featureType === "citizen_service_centre") {
    return `[out:json][timeout:90];
(
  nwr(${aroundRadius})[~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"${kepNamePattern}",i];
  nwr(${aroundRadius})["office"="government"][~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"${kepNamePattern}",i];
);
out center tags;`;
  }
  if (featureType === "tax_office") {
    return `[out:json][timeout:90];
(
  nwr(${aroundRadius})[~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"(AADE|ΑΑΔΕ|ΔΟΥ|D[.]?O[.]?Y[.]?|Tax Office)",i];
  nwr(${aroundRadius})["office"~"^(government|tax)$"][~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"(AADE|ΑΑΔΕ|ΔΟΥ|D[.]?O[.]?Y[.]?|Tax Office)",i];
);
out center tags;`;
  }
  if (featureType === "residence_permit_office") {
    return `[out:json][timeout:90];
(
  nwr(${aroundRadius})[~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"(Residence Permit|Αδειών Διαμονής|Αλλοδαπών|Μετανάστευσης)",i];
  nwr(${aroundRadius})["office"="government"][~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"(Residence Permit|Αδειών Διαμονής|Αλλοδαπών|Μετανάστευσης)",i];
);
out center tags;`;
  }
  if (featureType === "international_school") {
    return `[out:json][timeout:90];
(
  nwr(${aroundRadius})[~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"(European School|School of European Education|Σχολείο Ευρωπαϊκής Παιδείας|International School)",i];
  nwr(${aroundRadius})["amenity"="school"][~"^(name|name:el|name:en|official_name|alt_name|operator|brand|ref)$"~"(European School|School of European Education|Σχολείο Ευρωπαϊκής Παιδείας|International School)",i];
);
out center tags;`;
  }
  return `[out:json][timeout:90];
(
  nwr(${aroundRadius})["amenity"="hospital"]["emergency"="yes"];
  nwr(${aroundRadius})["healthcare"="hospital"]["emergency"="yes"];
  nwr(${aroundRadius})["healthcare:speciality"~"emergency"];
);
out center tags;`;
}

export function parseOverpassCountResponse(response: unknown): OsmAccessCounts {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as { tags?: { total?: string } }[])
    : [];
  const counts = Object.fromEntries(
    OVERPASS_COUNT_KEYS.map((key, index) => {
      const total = Number.parseInt(elements[index]?.tags?.total ?? "0", 10);
      return [key, Number.isFinite(total) ? total : 0];
    }),
  ) as OsmAccessCounts;
  return counts;
}

export function parseOsmSeasonalServiceResponse(response: unknown): OsmSeasonalServiceCounts {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as { tags?: { total?: string } }[])
    : [];
  const countElements = elements.filter((element) => typeof element.tags?.total === "string");
  if (countElements.length > 0) {
    return Object.fromEntries(
      OVERPASS_SEASONAL_SERVICE_COUNT_KEYS.map((key, index) => {
        const total = Number.parseInt(countElements[index]?.tags?.total ?? "0", 10);
        return [key, Number.isFinite(total) ? total : 0];
      }),
    ) as OsmSeasonalServiceCounts;
  }

  const seasonalityPattern =
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|[0-9]{1,2}\/[0-9]{1,2}/iu;
  const tagElements = elements as { tags?: Record<string, unknown> }[];
  const openingHoursTaggedServices = tagElements.filter((element) => {
    const openingHours = element.tags?.opening_hours;
    return typeof openingHours === "string" && openingHours.trim().length > 0;
  }).length;
  const seasonallyCodedServices = tagElements.filter((element) => {
    const openingHours =
      typeof element.tags?.opening_hours === "string" ? element.tags.opening_hours : "";
    const seasonal = element.tags?.seasonal;
    return (
      seasonalityPattern.test(openingHours) ||
      (typeof seasonal === "string" && seasonal.trim().length > 0) ||
      typeof seasonal === "number" ||
      typeof seasonal === "boolean"
    );
  }).length;

  return Object.fromEntries([
    ["selectedServices", tagElements.length],
    ["openingHoursTaggedServices", openingHoursTaggedServices],
    ["seasonallyCodedServices", seasonallyCodedServices],
  ]) as OsmSeasonalServiceCounts;
}

function hasPositiveOsmTagValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && !["no", "false", "0", "none", "closed"].includes(normalized);
}

function hasEmergencyVetSignal(tags: Record<string, unknown>): boolean {
  const openingHours = typeof tags.opening_hours === "string" ? tags.opening_hours : "";
  return (
    hasPositiveOsmTagValue(tags.emergency) ||
    /(^|[;\s])24\/7($|[;\s])/iu.test(openingHours) ||
    hasPositiveOsmTagValue(tags["opening_hours:emergency"]) ||
    hasPositiveOsmTagValue(tags["service:emergency"]) ||
    hasPositiveOsmTagValue(tags["veterinary:emergency"]) ||
    hasPositiveOsmTagValue(tags.emergency_service) ||
    hasPositiveOsmTagValue(tags["healthcare:emergency"]) ||
    /emergency/iu.test(
      typeof tags["healthcare:speciality"] === "string" ? tags["healthcare:speciality"] : "",
    )
  );
}

export function parseOsmEmergencyVetResponse(response: unknown): OsmEmergencyVetCounts {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as {
        type?: string;
        id?: number | string;
        tags?: Record<string, unknown>;
      }[])
    : [];
  const uniqueElements = new Map<string, { tags?: Record<string, unknown> }>();
  for (const element of elements) {
    const key =
      typeof element.type === "string" && element.id !== undefined
        ? `${element.type}:${element.id}`
        : `index:${uniqueElements.size}`;
    uniqueElements.set(key, element);
  }
  const veterinaryElements = [...uniqueElements.values()];
  return {
    veterinaryFeatures: veterinaryElements.length,
    emergencyTaggedVeterinaryFeatures: veterinaryElements.filter((element) =>
      hasEmergencyVetSignal(element.tags ?? {}),
    ).length,
  };
}

function pointDistanceMetres(
  target: Pick<PlaceTarget, "lat" | "lon">,
  point: Pick<CoordinatePoint, "lat" | "lon">,
): number {
  return haversineKm(target, point) * 1000;
}

function bearingDegrees(
  target: Pick<PlaceTarget, "lat" | "lon">,
  point: Pick<CoordinatePoint, "lat" | "lon">,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const toDeg = (value: number) => (value * 180) / Math.PI;
  const lat1 = toRad(target.lat);
  const lat2 = toRad(point.lat);
  const dLon = toRad(point.lon - target.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function sectorForBearing(bearing: number): number {
  return (
    (Math.floor((bearing + WILDFIRE_EGRESS_SECTOR_DEGREES / 2) / WILDFIRE_EGRESS_SECTOR_DEGREES) *
      WILDFIRE_EGRESS_SECTOR_DEGREES) %
    360
  );
}

function hasBlockedWildfireRoadAccess(tags: Record<string, unknown> | undefined): boolean {
  if (!tags) return false;
  return ["access", "vehicle", "motor_vehicle"].some((key) => {
    const value = tags[key];
    return typeof value === "string" && /^(private|no)$/i.test(value);
  });
}

export function parseOsmWildfireEgressResponse(
  response: unknown,
  target: Pick<PlaceTarget, "lat" | "lon">,
): OsmWildfireEgressMetrics {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as Array<{
        type?: string;
        id?: number | string;
        tags?: Record<string, unknown>;
        geometry?: Array<{ lat?: unknown; lon?: unknown }>;
      }>)
    : [];
  const retainedRoads: Array<{
    highway: string;
    points: CoordinatePoint[];
    pointKeys: string[];
    lengthKm: number;
  }> = [];
  const seenWays = new Set<string>();
  const highwayClassCounts: Record<string, number> = {};
  const nodePoints = new Map<string, CoordinatePoint>();
  const graph = new Map<string, Set<string>>();
  const edgeLengthsKm = new Map<string, number>();
  let retainedRoadKm = 0;
  let retainedSegmentCount = 0;
  let retainedWayCount = 0;

  for (const element of elements) {
    if (element.type !== "way" || element.id === undefined) continue;
    const highway = typeof element.tags?.highway === "string" ? element.tags.highway : "";
    if (!WILDFIRE_EGRESS_MOTOR_HIGHWAYS.has(highway)) continue;
    if (hasBlockedWildfireRoadAccess(element.tags)) continue;
    const wayKey = `way:${element.id}`;
    if (seenWays.has(wayKey)) continue;
    seenWays.add(wayKey);
    const geometry = Array.isArray(element.geometry) ? element.geometry : [];
    const points = geometry.flatMap((point) => (validCoordinate(point) ? [point] : []));
    if (points.length < 2) continue;

    retainedWayCount += 1;
    highwayClassCounts[highway] = (highwayClassCounts[highway] ?? 0) + 1;
    const lengthKm = geometryLengthKm(points);
    const pointKeys = points.map(coordinateKey);
    retainedRoadKm += lengthKm;
    retainedSegmentCount += Math.max(0, points.length - 1);
    retainedRoads.push({ highway, points, pointKeys, lengthKm });

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index] as CoordinatePoint;
      const key = pointKeys[index] as string;
      nodePoints.set(key, point);
      if (!graph.has(key)) graph.set(key, new Set());
    }
    for (let index = 1; index < points.length; index += 1) {
      const from = pointKeys[index - 1] as string;
      const to = pointKeys[index] as string;
      graph.get(from)?.add(to);
      graph.get(to)?.add(from);
      const edgeKey = from < to ? `${from}|${to}` : `${to}|${from}`;
      const fromPoint = points[index - 1] as CoordinatePoint;
      const toPoint = points[index] as CoordinatePoint;
      edgeLengthsKm.set(edgeKey, haversineKm(fromPoint, toPoint));
    }
  }

  const visited = new Set<string>();
  const components: string[][] = [];
  for (const key of graph.keys()) {
    if (visited.has(key)) continue;
    const queue = [key];
    const component: string[] = [];
    visited.add(key);
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index] as string;
      component.push(current);
      for (const next of graph.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        queue.push(next);
      }
    }
    components.push(component);
  }

  const componentStats = components.map((component) => {
    const nodeSet = new Set(component);
    const coreNodeCount = component.filter((key) => {
      const point = nodePoints.get(key);
      return point
        ? pointDistanceMetres(target, point) <= WILDFIRE_EGRESS_INNER_RADIUS_METRES
        : false;
    }).length;
    let roadKm = 0;
    for (const [edgeKey, lengthKm] of edgeLengthsKm) {
      const [from, to] = edgeKey.split("|");
      if (from && to && nodeSet.has(from) && nodeSet.has(to)) roadKm += lengthKm;
    }
    return { component, nodeSet, coreNodeCount, roadKm };
  });
  const selected =
    componentStats
      .filter((item) => item.coreNodeCount > 0)
      .sort((a, b) => b.coreNodeCount - a.coreNodeCount || b.roadKm - a.roadKm)[0] ??
    componentStats.sort((a, b) => b.roadKm - a.roadKm)[0];
  if (!selected) {
    return {
      retainedWayCount,
      retainedSegmentCount,
      retainedRoadKm: round(retainedRoadKm, 2),
      componentNodeCount: 0,
      componentRoadKm: 0,
      deadEndNodeCount: 0,
      deadEndShareRatio: 1,
      outboundCrossingWayCount: 0,
      outboundCorridorSectors: [],
      highwayClassCounts,
    };
  }

  const deadEndNodeCount = selected.component.filter(
    (key) => (graph.get(key)?.size ?? 0) <= 1,
  ).length;
  const outerComponentPoints = selected.component.flatMap((key) => {
    const point = nodePoints.get(key);
    if (!point) return [];
    const metres = pointDistanceMetres(target, point);
    return metres >= WILDFIRE_EGRESS_OUTER_RADIUS_METRES ? [{ key, point, metres }] : [];
  });
  const sectorSet = new Set(
    outerComponentPoints.map((item) => sectorForBearing(bearingDegrees(target, item.point))),
  );

  return {
    retainedWayCount,
    retainedSegmentCount,
    retainedRoadKm: round(retainedRoadKm, 2),
    componentNodeCount: selected.component.length,
    componentRoadKm: round(selected.roadKm, 2),
    deadEndNodeCount,
    deadEndShareRatio:
      selected.component.length > 0 ? round(deadEndNodeCount / selected.component.length, 3) : 1,
    outboundCrossingWayCount: outerComponentPoints.length,
    outboundCorridorSectors: [...sectorSet].sort((a, b) => a - b),
    highwayClassCounts,
  };
}

function openMeteoGrid(response: unknown): OpenMeteoGridSample {
  const item = response as { latitude?: unknown; longitude?: unknown; elevation?: unknown };
  return {
    latitude: typeof item.latitude === "number" ? item.latitude : Number.NaN,
    longitude: typeof item.longitude === "number" ? item.longitude : Number.NaN,
    elevation: typeof item.elevation === "number" ? item.elevation : null,
  };
}

export function parseOpenMeteoPm25Response(response: unknown): OpenMeteoPm25Summary {
  const hourly = (response as { hourly?: { time?: unknown[]; pm2_5?: unknown[] } }).hourly;
  const times = Array.isArray(hourly?.time) ? hourly.time : [];
  const values = Array.isArray(hourly?.pm2_5) ? hourly.pm2_5 : [];
  const monthlySums = Array.from({ length: 12 }, () => 0);
  const monthlyCounts = Array.from({ length: 12 }, () => 0);
  const daily = new Map<string, { sum: number; count: number }>();
  let hourlyCount = 0;

  for (let index = 0; index < times.length; index += 1) {
    const rawTime = times[index];
    const time = typeof rawTime === "string" ? rawTime : "";
    const value = values[index];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    const month = Number.parseInt(time.slice(5, 7), 10) - 1;
    if (month >= 0 && month < 12) {
      monthlySums[month] = (monthlySums[month] ?? 0) + value;
      monthlyCounts[month] = (monthlyCounts[month] ?? 0) + 1;
    }
    const dayKey = time.slice(0, 10);
    if (dayKey) {
      const item = daily.get(dayKey) ?? { sum: 0, count: 0 };
      item.sum += value;
      item.count += 1;
      daily.set(dayKey, item);
    }
    hourlyCount += 1;
  }

  const dailyMeans = [...daily.values()].flatMap((item) =>
    item.count > 0 ? [item.sum / item.count] : [],
  );

  return {
    monthlyMeans: monthlySums.map((sum, index) => {
      const count = monthlyCounts[index] ?? 0;
      return count > 0 ? round(sum / count) : null;
    }),
    hourlyCount,
    dailyCount: dailyMeans.length,
    exceedanceDays: dailyMeans.filter((value) => value > PM25_DAILY_GUIDELINE_UG_M3).length,
    grid: openMeteoGrid(response),
  };
}

export function parseOpenMeteoUvIndexResponse(
  response: unknown,
  year: number,
): OpenMeteoUvIndexSummary {
  const hourly = (response as { hourly?: { time?: unknown[]; uv_index?: unknown[] } }).hourly;
  const times = Array.isArray(hourly?.time) ? hourly.time : [];
  const values = Array.isArray(hourly?.uv_index) ? hourly.uv_index : [];
  const dailyMax = new Map<string, { month: number; max: number }>();
  let hourlyCount = 0;

  for (let index = 0; index < times.length; index += 1) {
    const rawTime = times[index];
    const time = typeof rawTime === "string" ? rawTime : "";
    const value = values[index];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    const dayKey = time.slice(0, 10);
    const month = Number.parseInt(time.slice(5, 7), 10) - 1;
    if (!dayKey || month < 0 || month > 11) continue;
    const current = dailyMax.get(dayKey);
    if (!current || value > current.max) {
      dailyMax.set(dayKey, { month, max: value });
    }
    hourlyCount += 1;
  }

  const monthlySums = Array.from({ length: 12 }, () => 0);
  const monthlyCounts = Array.from({ length: 12 }, () => 0);
  for (const item of dailyMax.values()) {
    monthlySums[item.month] = (monthlySums[item.month] ?? 0) + item.max;
    monthlyCounts[item.month] = (monthlyCounts[item.month] ?? 0) + 1;
  }

  return {
    monthlyMeanDailyMax: monthlySums.map((sum, index) => {
      const count = monthlyCounts[index] ?? 0;
      return count > 0 ? round(sum / count) : null;
    }),
    hourlyCount,
    dailyCount: dailyMax.size,
    year,
    grid: openMeteoGrid(response),
  };
}

export function parseOpenMeteoPollenResponse(
  response: unknown,
  year: number,
  threshold = POLLEN_THRESHOLD_GRAINS_M3,
): OpenMeteoPollenSummary {
  const hourly = (response as { hourly?: Record<string, unknown> }).hourly ?? {};
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  const dailyMax = new Map<string, { month: number; max: number }>();
  let hourlyCount = 0;
  let peakSpecies: string = "none";
  let peakSpeciesValue = 0;

  for (let index = 0; index < times.length; index += 1) {
    const rawTime = times[index];
    const time = typeof rawTime === "string" ? rawTime : "";
    const dayKey = time.slice(0, 10);
    const month = Number.parseInt(time.slice(5, 7), 10) - 1;
    if (!dayKey || month < 0 || month > 11) continue;

    let hourlyMax: number | null = null;
    for (const species of OPEN_METEO_POLLEN_VARIABLES) {
      const values = Array.isArray(hourly[species]) ? hourly[species] : [];
      const value = values[index];
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      if (hourlyMax === null || value > hourlyMax) hourlyMax = value;
      if (value > peakSpeciesValue) {
        peakSpeciesValue = value;
        peakSpecies = POLLEN_SPECIES_LABELS[species];
      }
    }

    if (hourlyMax === null) continue;
    const current = dailyMax.get(dayKey);
    if (!current || hourlyMax > current.max) {
      dailyMax.set(dayKey, { month, max: hourlyMax });
    }
    hourlyCount += 1;
  }

  const monthlySums = Array.from({ length: 12 }, () => 0);
  const monthlyCounts = Array.from({ length: 12 }, () => 0);
  let peakDailyMax = 0;
  let daysAtOrAboveThreshold = 0;

  for (const item of dailyMax.values()) {
    monthlySums[item.month] = (monthlySums[item.month] ?? 0) + item.max;
    monthlyCounts[item.month] = (monthlyCounts[item.month] ?? 0) + 1;
    if (item.max > peakDailyMax) peakDailyMax = item.max;
    if (item.max >= threshold) daysAtOrAboveThreshold += 1;
  }

  return {
    year,
    hourlyCount,
    dailyCount: dailyMax.size,
    threshold,
    daysAtOrAboveThreshold,
    peakDailyMax: round(peakDailyMax),
    peakSpecies,
    peakSpeciesValue: round(peakSpeciesValue),
    monthlyMeanDailyMax: monthlySums.map((sum, index) => {
      const count = monthlyCounts[index] ?? 0;
      return count > 0 ? round(sum / count) : null;
    }),
    grid: openMeteoGrid(response),
  };
}

export function parseOpenMeteoSnowfallResponse(response: unknown): OpenMeteoSnowfallSummary {
  const daily = (response as { daily?: { time?: unknown[]; snowfall_sum?: unknown[] } }).daily;
  const times = Array.isArray(daily?.time) ? daily.time : [];
  const values = Array.isArray(daily?.snowfall_sum) ? daily.snowfall_sum : [];
  const years = new Set<string>();
  let snowfallDayCount = 0;

  for (let index = 0; index < times.length; index += 1) {
    const rawTime = times[index];
    const time = typeof rawTime === "string" ? rawTime : "";
    const value = values[index];
    if (time.length >= 4) years.add(time.slice(0, 4));
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      snowfallDayCount += 1;
    }
  }

  const yearCount = years.size;
  return {
    snowfallDaysPerYear: yearCount > 0 ? round(snowfallDayCount / yearCount) : 0,
    snowfallDayCount,
    yearCount,
    grid: openMeteoGrid(response),
  };
}

function bestFeatureName(tags: Record<string, string>, fallback: string): string {
  return tags["name:en"] ?? tags.int_name ?? tags.name ?? tags.ref ?? fallback;
}

export function parseOsmFeatureResponse(response: unknown): OsmFeatureCandidate[] {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as {
        type?: string;
        id?: number;
        lat?: number;
        lon?: number;
        center?: { lat?: number; lon?: number };
        tags?: Record<string, string>;
      }[])
    : [];
  const candidates = new Map<string, OsmFeatureCandidate>();

  for (const element of elements) {
    if (!element.type || !element.id) continue;
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const id = `${element.type}/${element.id}`;
    const tags = element.tags ?? {};
    candidates.set(id, {
      id,
      name: bestFeatureName(tags, id),
      lat: lat as number,
      lon: lon as number,
      tags,
      objectUrl: `https://www.openstreetmap.org/${id}`,
    });
  }

  return [...candidates.values()];
}

function haversineKm(
  a: Pick<PlaceTarget, "lat" | "lon">,
  b: Pick<OsmFeatureCandidate, "lat" | "lon">,
) {
  const radiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radiusKm * Math.asin(Math.sqrt(h));
}

function geometryLengthKm(geometry: Array<{ lat?: unknown; lon?: unknown }> | undefined): number {
  if (!Array.isArray(geometry) || geometry.length < 2) return 0;
  let total = 0;
  for (let index = 1; index < geometry.length; index += 1) {
    const previous = geometry[index - 1];
    const current = geometry[index];
    if (
      typeof previous?.lat !== "number" ||
      typeof previous.lon !== "number" ||
      typeof current?.lat !== "number" ||
      typeof current.lon !== "number"
    ) {
      continue;
    }
    total += haversineKm(
      { lat: previous.lat, lon: previous.lon },
      { lat: current.lat, lon: current.lon },
    );
  }
  return total;
}

function projectCoordinateToLocalMetres(
  point: Pick<CoordinatePoint, "lat" | "lon">,
  origin: Pick<CoordinatePoint, "lat" | "lon">,
): ProjectedPoint {
  const earthRadiusMetres = 6_371_000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  return {
    x: toRad(point.lon - origin.lon) * earthRadiusMetres * Math.cos(toRad(origin.lat)),
    y: toRad(point.lat - origin.lat) * earthRadiusMetres,
  };
}

function projectLocalMetresToCoordinate(
  point: ProjectedPoint,
  origin: Pick<CoordinatePoint, "lat" | "lon">,
): CoordinatePoint {
  const earthRadiusMetres = 6_371_000;
  const toDeg = (value: number) => (value * 180) / Math.PI;
  const toRad = (value: number) => (value * Math.PI) / 180;
  return {
    lat: origin.lat + toDeg(point.y / earthRadiusMetres),
    lon: origin.lon + toDeg(point.x / (earthRadiusMetres * Math.cos(toRad(origin.lat)))),
  };
}

export function buildCircleSamplePoints({
  target,
  radiusMetres,
  sampleStepMetres,
}: {
  target: Pick<PlaceTarget, "lat" | "lon">;
  radiusMetres: number;
  sampleStepMetres: number;
}): CoordinatePoint[] {
  const points: CoordinatePoint[] = [];
  for (let y = -radiusMetres; y <= radiusMetres; y += sampleStepMetres) {
    for (let x = -radiusMetres; x <= radiusMetres; x += sampleStepMetres) {
      if (x * x + y * y > radiusMetres * radiusMetres) continue;
      points.push(projectLocalMetresToCoordinate({ x, y }, target));
    }
  }
  return points;
}

function pointInProjectedPolygon(point: ProjectedPoint, polygon: ProjectedPoint[]): boolean {
  let inside = false;
  for (
    let index = 0, previousIndex = polygon.length - 1;
    index < polygon.length;
    previousIndex = index++
  ) {
    const current = polygon[index];
    const previous = polygon[previousIndex];
    if (!current || !previous) continue;
    const crosses =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function projectedPolygonAreaM2(points: ProjectedPoint[]): number {
  if (points.length < 4) return 0;
  let area = 0;
  for (
    let index = 0, previousIndex = points.length - 1;
    index < points.length;
    previousIndex = index++
  ) {
    const current = points[index];
    const previous = points[previousIndex];
    if (!current || !previous) continue;
    area += (previous.x + current.x) * (previous.y - current.y);
  }
  return Math.abs(area) / 2;
}

function stringTags(tags: Record<string, unknown> | undefined): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tags ?? {}).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : [],
    ),
  );
}

function isRetainedSurfaceWaterTags(tags: Record<string, string>): boolean {
  const water = (tags.water ?? "").toLowerCase();
  const amenity = (tags.amenity ?? "").toLowerCase();
  const name = `${tags.name ?? ""} ${tags["name:en"] ?? ""}`.toLowerCase();
  if (SURFACE_WATER_EXCLUDED_AMENITIES.has(amenity)) return false;
  if (SURFACE_WATER_EXCLUDED_VALUES.has(water)) return false;
  if ((tags.salt ?? "").toLowerCase() === "yes") return false;
  if (tags.natural === "bay" || tags.natural === "coastline" || tags.place === "sea") return false;
  if (/\bpool\b|πισίνα/iu.test(name)) return false;
  if (tags.natural === "water") {
    return !water || SURFACE_WATER_ALLOWED_VALUES.has(water);
  }
  if (tags.waterway === "riverbank") return true;
  return tags.landuse === "reservoir" || SURFACE_WATER_ALLOWED_VALUES.has(water);
}

function surfaceWaterTagSummary(tags: Record<string, string>): string {
  return [
    tags.natural ? `natural=${tags.natural}` : null,
    tags.water ? `water=${tags.water}` : null,
    tags.waterway ? `waterway=${tags.waterway}` : null,
    tags.landuse ? `landuse=${tags.landuse}` : null,
  ]
    .filter((item): item is string => Boolean(item))
    .join(" ");
}

function surfaceWaterFeatureName(tags: Record<string, string>, fallback: string): string {
  return (
    tags["name:en"] ??
    tags.name ??
    tags.water ??
    tags.waterway ??
    tags.landuse ??
    tags.natural ??
    fallback
  );
}

export function parseOsmOutdoorResponse(response: unknown): OsmOutdoorMetrics {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as {
        type?: string;
        tags?: Record<string, string>;
        geometry?: Array<{ lat?: unknown; lon?: unknown }>;
      }[])
    : [];
  const metrics: OsmOutdoorMetrics = {
    hikingTrailKm: 0,
    hikingWayCount: 0,
    mtbTrailCount: 0,
    climbingSiteCount: 0,
    surfSpotCount: 0,
    skiPisteKm: 0,
    skiPisteWayCount: 0,
  };

  for (const element of elements) {
    const tags = element.tags ?? {};
    if (
      element.type === "way" &&
      (tags.highway === "path" || tags.highway === "track") &&
      !tags["piste:type"]
    ) {
      metrics.hikingTrailKm += geometryLengthKm(element.geometry);
      metrics.hikingWayCount += 1;
    }
    if (element.type === "relation" && tags.route === "mtb") {
      metrics.mtbTrailCount += 1;
    }
    if (tags.sport === "climbing") {
      metrics.climbingSiteCount += 1;
    }
    if (tags.sport === "surfing") {
      metrics.surfSpotCount += 1;
    }
    if (element.type === "way" && tags["piste:type"] === "downhill") {
      metrics.skiPisteKm += geometryLengthKm(element.geometry);
      metrics.skiPisteWayCount += 1;
    }
  }

  return {
    ...metrics,
    hikingTrailKm: round(metrics.hikingTrailKm),
    skiPisteKm: round(metrics.skiPisteKm),
  };
}

export function parseOsmSurfaceWaterResponse(
  response: unknown,
  target: Pick<PlaceTarget, "lat" | "lon">,
  options: {
    radiusMetres?: number;
    sampleStepMetres?: number;
  } = {},
): OsmSurfaceWaterMetrics {
  const radiusMetres = options.radiusMetres ?? SURFACE_WATER_RADIUS_METRES;
  const sampleStepMetres = options.sampleStepMetres ?? SURFACE_WATER_SAMPLE_STEP_METRES;
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as {
        type?: string;
        id?: number | string;
        tags?: Record<string, unknown>;
        geometry?: Array<{ lat?: unknown; lon?: unknown }>;
      }[])
    : [];
  const polygons: OsmSurfaceWaterPolygon[] = [];

  for (const element of elements) {
    if (!element.type || element.id === undefined) continue;
    const tags = stringTags(element.tags);
    if (!isRetainedSurfaceWaterTags(tags)) continue;
    const geometry = Array.isArray(element.geometry) ? element.geometry : [];
    if (geometry.length < 4) continue;
    const first = geometry[0] ?? {};
    const last = geometry[geometry.length - 1] ?? {};
    if (!validCoordinate(first) || !validCoordinate(last)) continue;
    const firstPoint = first;
    const lastPoint = last;
    if (
      Math.abs(firstPoint.lat - lastPoint.lat) > 1e-7 ||
      Math.abs(firstPoint.lon - lastPoint.lon) > 1e-7
    ) {
      continue;
    }
    const points = geometry.flatMap((point) =>
      validCoordinate(point) ? [projectCoordinateToLocalMetres(point, target)] : [],
    );
    if (points.length < 4) continue;
    const id = `${element.type}/${element.id}`;
    polygons.push({
      id,
      name: surfaceWaterFeatureName(tags, id),
      tags,
      points,
      areaM2: Math.round(projectedPolygonAreaM2(points)),
    });
  }

  let samplePointCount = 0;
  let waterSamplePointCount = 0;
  for (let y = -radiusMetres; y <= radiusMetres; y += sampleStepMetres) {
    for (let x = -radiusMetres; x <= radiusMetres; x += sampleStepMetres) {
      if (x * x + y * y > radiusMetres * radiusMetres) continue;
      samplePointCount += 1;
      if (polygons.some((polygon) => pointInProjectedPolygon({ x, y }, polygon.points))) {
        waterSamplePointCount += 1;
      }
    }
  }

  const waterShare = samplePointCount > 0 ? (waterSamplePointCount / samplePointCount) * 100 : 0;
  const waterAreaM2 =
    samplePointCount > 0
      ? Math.round((waterSamplePointCount / samplePointCount) * Math.PI * radiusMetres ** 2)
      : 0;
  const retainedExamples = polygons
    .sort((a, b) => b.areaM2 - a.areaM2)
    .slice(0, 4)
    .map((polygon) => ({
      id: polygon.id,
      name: polygon.name,
      tagSummary: surfaceWaterTagSummary(polygon.tags),
      areaM2: polygon.areaM2,
    }));

  return {
    waterSharePct: round(waterShare, 2),
    waterAreaM2,
    samplePointCount,
    waterSamplePointCount,
    retainedPolygonCount: polygons.length,
    retainedExamples,
  };
}

export function parseArcgisImageSamplesResponse(response: unknown): ArcgisImageSample[] {
  const samples = Array.isArray((response as { samples?: unknown[] }).samples)
    ? ((response as { samples: unknown[] }).samples as Array<{
        locationId?: unknown;
        value?: unknown;
        resolution?: unknown;
      }>)
    : [];
  return samples.flatMap((sample, index) => {
    const value =
      typeof sample.value === "number"
        ? sample.value
        : typeof sample.value === "string" && sample.value.trim() !== ""
          ? Number(sample.value)
          : Number.NaN;
    if (!Number.isFinite(value)) return [];
    return [
      {
        locationId: typeof sample.locationId === "number" ? sample.locationId : index,
        value,
        resolution: typeof sample.resolution === "number" ? sample.resolution : undefined,
      },
    ];
  });
}

export function calculateCopernicusHrlForestTreeMetrics({
  samplePointCount,
  treeCoverSamples,
  forestTypeSamples,
}: {
  samplePointCount: number;
  treeCoverSamples: ArcgisImageSample[];
  forestTypeSamples: ArcgisImageSample[];
}): CopernicusHrlForestTreeMetrics {
  const treeValues = treeCoverSamples
    .map((sample) => sample.value)
    .filter((value) => value >= 0 && value <= 100);
  const forestValues = forestTypeSamples
    .map((sample) => sample.value)
    .filter((value) => value === 0 || value === 1 || value === 2);
  if (treeValues.length === 0) throw new Error("No valid Copernicus HRL tree-cover samples");
  if (forestValues.length === 0) throw new Error("No valid Copernicus HRL forest-type samples");

  const forestClassCounts = {
    nonForest: forestValues.filter((value) => value === 0).length,
    broadleaved: forestValues.filter((value) => value === 1).length,
    coniferous: forestValues.filter((value) => value === 2).length,
  };
  const forestSampleCount = forestClassCounts.broadleaved + forestClassCounts.coniferous;
  const resolutions = [...treeCoverSamples, ...forestTypeSamples].flatMap((sample) =>
    typeof sample.resolution === "number" && Number.isFinite(sample.resolution)
      ? [sample.resolution]
      : [],
  );

  return {
    samplePointCount,
    treeCanopyPct: round(treeValues.reduce((sum, value) => sum + value, 0) / treeValues.length, 2),
    treeValidSampleCount: treeValues.length,
    treeNoDataSampleCount: Math.max(0, samplePointCount - treeValues.length),
    forestCoverPct: round((forestSampleCount / forestValues.length) * 100, 2),
    forestValidSampleCount: forestValues.length,
    forestNoDataSampleCount: Math.max(0, samplePointCount - forestValues.length),
    forestClassCounts,
    serviceResolutionMetres: resolutions.length > 0 ? Math.min(...resolutions) : null,
  };
}

function coordinateKey(point: CoordinatePoint): string {
  return `${Number(point.lat.toFixed(6))},${Number(point.lon.toFixed(6))}`;
}

function validCoordinate(point: { lat?: unknown; lon?: unknown }): point is CoordinatePoint {
  return (
    typeof point.lat === "number" &&
    Number.isFinite(point.lat) &&
    typeof point.lon === "number" &&
    Number.isFinite(point.lon)
  );
}

function selectEvenly<T>(items: T[], maxItems: number): T[] {
  if (items.length <= maxItems) return items;
  return Array.from({ length: maxItems }, (_, index) => {
    const sourceIndex = Math.round((index * (items.length - 1)) / (maxItems - 1));
    return items[sourceIndex] as T;
  });
}

function uniqueSegmentKey(segment: TerrainSlopeSegment): string {
  const a = coordinateKey(segment.from);
  const b = coordinateKey(segment.to);
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function uniqueCoordinates(segments: TerrainSlopeSegment[]): CoordinatePoint[] {
  const coordinates = new Map<string, CoordinatePoint>();
  for (const segment of segments) {
    coordinates.set(coordinateKey(segment.from), segment.from);
    coordinates.set(coordinateKey(segment.to), segment.to);
  }
  return [...coordinates.values()];
}

export function parseOsmTerrainSlopeResponse(response: unknown): TerrainSlopeGraph {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as {
        type?: string;
        tags?: Record<string, string>;
        geometry?: Array<{ lat?: unknown; lon?: unknown }>;
      }[])
    : [];
  const segmentsByKey = new Map<string, TerrainSlopeSegment>();
  let sourceWayCount = 0;
  let sourceSegmentCount = 0;
  let stepWayCount = 0;

  for (const element of elements) {
    if (element.type !== "way") continue;
    const highway = element.tags?.highway ?? "unknown";
    const geometry = Array.isArray(element.geometry) ? element.geometry : [];
    if (geometry.length < 2) continue;
    sourceWayCount += 1;
    if (highway === "steps") stepWayCount += 1;

    for (let index = 1; index < geometry.length; index += 1) {
      const from = geometry[index - 1];
      const to = geometry[index];
      if (!from || !to || !validCoordinate(from) || !validCoordinate(to)) continue;
      const lengthMetres = haversineKm(from, to) * 1000;
      if (lengthMetres < MIN_TERRAIN_SLOPE_SEGMENT_METRES) continue;
      sourceSegmentCount += 1;
      const segment = { from, to, lengthMetres, highway };
      segmentsByKey.set(uniqueSegmentKey(segment), segment);
    }
  }

  const segments = selectEvenly([...segmentsByKey.values()], MAX_TERRAIN_SLOPE_SEGMENTS);
  return {
    coordinates: uniqueCoordinates(segments),
    segments,
    sourceWayCount,
    sourceSegmentCount,
    stepWayCount,
  };
}

export function parseOpenMeteoElevationResponse(
  points: CoordinatePoint[],
  response: unknown,
): Map<string, number> {
  const elevations = (response as { elevation?: unknown[] }).elevation;
  const result = new Map<string, number>();
  if (!Array.isArray(elevations)) return result;

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const elevation = elevations[index];
    if (!point || typeof elevation !== "number" || !Number.isFinite(elevation)) continue;
    result.set(coordinateKey(point), elevation);
  }
  return result;
}

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(percentileValue * sorted.length) - 1),
  );
  return sorted[index] ?? 0;
}

export function calculateTerrainSlopeMetrics(
  graph: TerrainSlopeGraph,
  elevations: Map<string, number>,
): TerrainSlopeMetrics {
  const grades = graph.segments.flatMap((segment) => {
    const fromElevation = elevations.get(coordinateKey(segment.from));
    const toElevation = elevations.get(coordinateKey(segment.to));
    if (fromElevation === undefined || toElevation === undefined) return [];
    if (segment.lengthMetres <= 0) return [];
    return [round((Math.abs(toElevation - fromElevation) / segment.lengthMetres) * 100)];
  });
  if (grades.length === 0) {
    return {
      sourceWayCount: graph.sourceWayCount,
      sourceSegmentCount: graph.sourceSegmentCount,
      sampledSegmentCount: 0,
      meanAbsGradePct: 0,
      p90AbsGradePct: 0,
      shareOver5Pct: 0,
      shareOver8Pct: 0,
      stepWayCount: graph.stepWayCount,
    };
  }

  return {
    sourceWayCount: graph.sourceWayCount,
    sourceSegmentCount: graph.sourceSegmentCount,
    sampledSegmentCount: grades.length,
    meanAbsGradePct: round(grades.reduce((sum, value) => sum + value, 0) / grades.length),
    p90AbsGradePct: round(percentile(grades, 0.9)),
    shareOver5Pct: round((grades.filter((value) => value > 5).length / grades.length) * 100),
    shareOver8Pct: round((grades.filter((value) => value > 8).length / grades.length) * 100),
    stepWayCount: graph.stepWayCount,
  };
}

function parseElevationMetres(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value)
    .trim()
    .replace(/\s*m(?:et(?:er|re)s?)?$/iu, "");
  const numeric =
    /^\d{1,3},\d{3}(?:\.\d+)?$/u.test(normalized) || /^\d{1,3}\.\d{3},\d+$/u.test(normalized)
      ? normalized.replace(",", "")
      : normalized.replace(",", ".");
  const parsed = Number.parseFloat(numeric);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export function parseOsmMountainPeakResponse(response: unknown): OsmPeakCandidate[] {
  const elements = Array.isArray((response as { elements?: unknown[] }).elements)
    ? ((response as { elements: unknown[] }).elements as {
        type?: string;
        id?: number;
        lat?: number;
        lon?: number;
        tags?: Record<string, string>;
      }[])
    : [];

  return elements.flatMap((element) => {
    if (element.type !== "node" || !element.id) return [];
    if (typeof element.lat !== "number" || typeof element.lon !== "number") return [];
    const elevationMetres = parseElevationMetres(element.tags?.ele);
    if (elevationMetres === null) return [];
    const id = `node/${element.id}`;
    const tags = element.tags ?? {};
    return [
      {
        id,
        name: bestFeatureName(tags, id),
        lat: element.lat,
        lon: element.lon,
        elevationMetres,
        objectUrl: `https://www.openstreetmap.org/${id}`,
      },
    ];
  });
}

export function selectNearestElevatedPeak(
  target: Pick<PlaceTarget, "lat" | "lon">,
  peaks: OsmPeakCandidate[],
): (OsmPeakCandidate & { distanceKm: number }) | null {
  const elevated = peaks.flatMap((peak) =>
    peak.elevationMetres >= MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES
      ? [{ ...peak, distanceKm: round(haversineKm(target, peak)) }]
      : [],
  );
  if (elevated.length === 0) return null;
  return elevated.reduce((best, peak) => (peak.distanceKm < best.distanceKm ? peak : best));
}

function mountainDistanceFromRow(row: MatrixRow): number | null {
  const value = String(row.cited?.value ?? "");
  const match = value.match(/^(\d+(?:\.\d+)?) km straight-line/);
  return match?.[1] ? Number(match[1]) : null;
}

function placeFromMountainRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) mapped peak/)?.[1] ?? "town";
}

function displayPeakName(name: string, id: string): string {
  return name === id || /^node\/\d+$/u.test(name) ? `unnamed mapped peak ${id}` : name;
}

function normalizeUnnamedPeakReferences(text: string): string {
  return text
    .replace(/(: )node\/(\d+)(?= \()/gu, "$1unnamed mapped peak node/$2")
    .replace(/(, )node\/(\d+)(?=, ele=)/gu, "$1unnamed mapped peak node/$2");
}

export function buildTownMountainProximityRow({
  target,
  peak,
  totalPeakCount,
  elevatedPeakCount,
  sourceUrl,
  verifiedDate,
}: MountainProximityRowInput): MatrixRow {
  const distanceKm = round(haversineKm(target, peak));
  const peakName = displayPeakName(peak.name, peak.id);
  return {
    key: "mountain_proximity",
    label: "Distance to peak >=1500m",
    matrixCategory: "nature_environment",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `${distanceKm} km straight-line to nearest mapped OSM natural=peak with ele>=${MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES}m: ${peakName} (${peak.elevationMetres} m).`,
      sourceUrl,
      sourceName: `OpenStreetMap contributors via Overpass API, ${target.placeName} mapped peak proximity proxy`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "connectivity",
      excerpt: `${target.placeName}: Overpass returned ${totalPeakCount} mapped OSM natural=peak nodes with ele tags within ${MOUNTAIN_PEAK_RADIUS_METRES / 1000} km of ${target.lat}, ${target.lon}; ${elevatedPeakCount} peaks at or above ${MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES} m. Selected ${peak.id} (${peak.objectUrl}), ${peakName}, ele=${peak.elevationMetres} m, at ${distanceKm} km straight-line.`,
    },
    unit: `km straight-line to nearest OSM natural=peak with ele>=${MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES}m within ${MOUNTAIN_PEAK_RADIUS_METRES / 1000} km`,
    notes:
      "OSM mapped peak and elevation-tag proximity proxy, not an official DEM peak inventory, hiking access, road access, route-time, trail condition, safety, weather, rescue, property-risk, or mountain-access claim.",
  };
}

export function summarizeRegionalMountainProximityRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const distances = rows.flatMap((row) => {
    const value = mountainDistanceFromRow(row);
    return value === null ? [] : [value];
  });
  if (distances.length !== rows.length) return null;
  const [first] = rows;
  if (!first) return null;
  const examples = rows
    .map(
      (row) =>
        `${placeFromMountainRow(row)}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`,
    )
    .join("; ");

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value: `Priority-town range for ${regionName}: ${rangeFromValues(distances)} km straight-line to nearest mapped OSM natural=peak with ele>=${MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES}m. ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `OpenStreetMap mapped peak proximity proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town OSM mapped peak proximity summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
    },
    notes:
      "Priority-town summary from OSM mapped peak and elevation-tag proximity proxy rows, not an island-wide DEM peak inventory, hiking-access guide, road-access claim, route-time estimate, trail-condition report, safety advice, weather, rescue, property-risk, or mountain-access assessment.",
  };
}

function protectedAreaDistanceFromRow(row: MatrixRow): number | null {
  const value = `${String(row.cited?.value ?? "")} ${String(row.cited?.excerpt ?? "")}`;
  return numberFromPattern(value, /nearest\s+(\d+(?:\.\d+)?)\s+km/i);
}

function placeFromProtectedAreaRow(row: MatrixRow): string {
  return (
    row.cited?.sourceName.match(/query for (.+)$/)?.[1] ??
    row.cited?.sourceName.match(/, (.+?) protected-area/)?.[1] ??
    "town"
  );
}

export function buildProtectedAreaDistanceProxyRow({
  target,
  protectedAreaRow,
  verifiedDate,
}: ProtectedAreaDistanceRowInput): MatrixRow | null {
  if (!protectedAreaRow?.cited) return null;
  const distanceKm = protectedAreaDistanceFromRow(protectedAreaRow);
  if (distanceKm === null) return null;
  const excerpt = String(protectedAreaRow.cited.excerpt ?? protectedAreaRow.cited.value);

  return {
    key: "nat_park_dist_km",
    label: "Distance to national park",
    matrixCategory: "nature_environment",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `${distanceKm} km straight-line to nearest mapped OSM protected-area or nature-reserve feature center.`,
      sourceUrl: protectedAreaRow.cited.sourceUrl,
      sourceName: `OpenStreetMap contributors via Overpass API, ${target.placeName} protected-area distance proxy`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "climate",
      excerpt: `${target.placeName}: derived from the cited protected_area_overlap row. ${excerpt} This is the nearest mapped feature-center distance, not the official WDPA or IUCN Category II national-park distance.`,
    },
    unit: "km straight-line to nearest mapped OSM protected-area or nature-reserve feature center",
    notes:
      "Derived proxy from the existing cited OSM protected_area_overlap row. This is not the official WDPA, Natura 2000, IUCN Category II, legal national-park, trailhead, public-access, route-time, habitat-quality, safety, or recreation-quality value. Feature centers can understate or overstate distance to polygon edges.",
  };
}

function protectedAreaDistanceFromDistanceRow(row: MatrixRow): number | null {
  return numberFromPattern(row.cited?.value, /^(\d+(?:\.\d+)?) km straight-line/);
}

export function summarizeRegionalProtectedAreaDistanceRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const distances = rows.flatMap((row) => {
    const value = protectedAreaDistanceFromDistanceRow(row);
    return value === null ? [] : [value];
  });
  if (distances.length !== rows.length) return null;
  const [first] = rows;
  if (!first) return null;
  const examples = rows
    .map(
      (row) =>
        `${placeFromProtectedAreaRow(row)}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`,
    )
    .join("; ");

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value: `Priority-town range for ${regionName}: ${rangeFromValues(distances)} km straight-line to nearest mapped OSM protected-area or nature-reserve feature center. ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `OpenStreetMap protected-area distance proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town protected-area distance proxy summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
    },
    notes:
      "Priority-town summary from existing cited OSM protected_area_overlap rows, not an island-wide WDPA, Natura 2000, IUCN Category II, legal national-park, public-access, route-time, habitat-quality, safety, or recreation-quality value. Feature centers can understate or overstate distance to polygon edges.",
  };
}

function closestRouteCandidates(
  target: PlaceTarget,
  candidates: OsmFeatureCandidate[],
): OsmFeatureCandidate[] {
  return [...candidates]
    .sort((a, b) => haversineKm(target, a) - haversineKm(target, b))
    .slice(0, MAX_ROUTE_CANDIDATES);
}

export function filterFeatureCandidates(
  _target: PlaceTarget,
  featureType: OsmFeatureType,
  candidates: OsmFeatureCandidate[],
): OsmFeatureCandidate[] {
  if (featureType === "emergency_hospital") {
    return candidates.filter((candidate) => candidate.tags.emergency === "yes");
  }
  if (featureType === "citizen_service_centre") {
    const kepPattern =
      /(ΚΕΠ|K\.?E\.?P\.?|Citizen Service Centre|Citizens Service Centre|Citizen Service Center|Citizens Service Center|Κέντρο Εξυπηρέτησης Πολιτών)/i;
    return candidates.filter((candidate) => {
      if (candidate.tags.access === "private") return false;
      const searchable = [
        candidate.name,
        candidate.tags.name,
        candidate.tags["name:el"],
        candidate.tags["name:en"],
        candidate.tags.official_name,
        candidate.tags.alt_name,
        candidate.tags.operator,
        candidate.tags.brand,
        candidate.tags.ref,
      ]
        .filter(Boolean)
        .join(" ");
      return kepPattern.test(searchable);
    });
  }
  if (featureType === "tax_office") {
    const taxOfficePattern = /(AADE|ΑΑΔΕ|ΔΟΥ|D\.?O\.?Y\.?|Tax Office|φορολογ)/i;
    return candidates.filter((candidate) => {
      if (candidate.tags.access === "private") return false;
      const searchable = [
        candidate.name,
        candidate.tags.name,
        candidate.tags["name:el"],
        candidate.tags["name:en"],
        candidate.tags.official_name,
        candidate.tags.alt_name,
        candidate.tags.operator,
        candidate.tags.brand,
        candidate.tags.ref,
      ]
        .filter(Boolean)
        .join(" ");
      return taxOfficePattern.test(searchable);
    });
  }
  if (featureType === "residence_permit_office") {
    const residencePermitPattern =
      /(Residence Permit|Αδειών Διαμονής|Αλλοδαπών|Μετανάστευσης|Migration)/i;
    return candidates.filter((candidate) => {
      if (candidate.tags.access === "private") return false;
      const searchable = [
        candidate.name,
        candidate.tags.name,
        candidate.tags["name:el"],
        candidate.tags["name:en"],
        candidate.tags.official_name,
        candidate.tags.alt_name,
        candidate.tags.operator,
        candidate.tags.brand,
        candidate.tags.ref,
      ]
        .filter(Boolean)
        .join(" ");
      return residencePermitPattern.test(searchable);
    });
  }
  if (featureType === "land_registry_office") {
    const landRegistryPattern =
      /(Cadastre|Cadastral|Κτηματολόγιο|Κτηματολογικό|Land Registry|Υποθηκοφυλακ)/i;
    return candidates.filter((candidate) => {
      if (candidate.tags.access === "private") return false;
      const searchable = [
        candidate.name,
        candidate.tags.name,
        candidate.tags["name:el"],
        candidate.tags["name:en"],
        candidate.tags.official_name,
        candidate.tags.alt_name,
        candidate.tags.operator,
        candidate.tags.brand,
        candidate.tags.ref,
      ]
        .filter(Boolean)
        .join(" ");
      return landRegistryPattern.test(searchable);
    });
  }
  if (featureType === "international_school") {
    const internationalSchoolPattern =
      /(European School|School of European Education|Σχολείο Ευρωπαϊκής Παιδείας|International School)/i;
    return candidates.filter((candidate) => {
      if (candidate.tags.access === "private") return false;
      const searchable = [
        candidate.name,
        candidate.tags.name,
        candidate.tags["name:el"],
        candidate.tags["name:en"],
        candidate.tags.official_name,
        candidate.tags.alt_name,
        candidate.tags.operator,
        candidate.tags.brand,
        candidate.tags.ref,
      ]
        .filter(Boolean)
        .join(" ");
      return internationalSchoolPattern.test(searchable);
    });
  }

  const rejectedName =
    /(champion|jet|semi\s*submarine|submarine|tickets?|ticket office|glass.?bottom|boat trip|cruise)/i;
  const filtered = candidates.filter((candidate) => {
    const name = candidate.name;
    if (rejectedName.test(name)) return false;
    if (candidate.tags.access === "private") return false;
    if (candidate.tags.leisure === "slipway") return false;
    return candidate.tags.ferry === "yes" || candidate.tags.public_transport === "station";
  });
  return filtered.length > 0 ? filtered : candidates;
}

export function buildOsrmTableFetchRequest(
  target: Pick<PlaceTarget, "lat" | "lon">,
  candidates: OsmFeatureCandidate[],
): { url: string; init: RequestInit } {
  const coordinates = [
    `${target.lon},${target.lat}`,
    ...candidates.map((candidate) => `${candidate.lon},${candidate.lat}`),
  ].join(";");
  const destinations = candidates.map((_, index) => index + 1).join(";");
  return {
    url: `https://router.project-osrm.org/table/v1/driving/${coordinates}?sources=0&destinations=${destinations}&annotations=duration,distance`,
    init: {
      method: "GET",
    },
  };
}

export function parseOsrmTableResponse(
  response: unknown,
  candidates: OsmFeatureCandidate[],
): RoutedCandidate[] {
  const durations = (response as { durations?: unknown[][] }).durations?.[0] ?? [];
  const distances = (response as { distances?: unknown[][] }).distances?.[0] ?? [];
  const offset = durations.length === candidates.length ? 0 : 1;

  return candidates.flatMap((candidate, index) => {
    const durationSeconds = durations[index + offset];
    const distanceMeters = distances[index + offset];
    if (typeof durationSeconds !== "number" || typeof distanceMeters !== "number") return [];
    return [
      {
        candidate,
        durationMinutes: round(durationSeconds / 60),
        distanceKm: round(distanceMeters / 1000),
      },
    ];
  });
}

export function selectFastestRouteCandidate(routes: RoutedCandidate[]): RoutedCandidate | null {
  if (routes.length === 0) return null;
  return routes.reduce((best, route) =>
    route.durationMinutes < best.durationMinutes ? route : best,
  );
}

export function buildOsmAccessRows({
  target,
  counts,
  endpoint,
  verifiedDate,
}: OsmAccessRowInput): MatrixRow[] {
  const query = buildOsmAccessOverpassQuery(target);
  const sourceUrl = overpassSourceUrl(endpoint, query);
  const sourceName = `OpenStreetMap contributors via Overpass API, ${target.placeName} walkability and accessibility proxy query`;
  const sourceBase = {
    sourceUrl,
    sourceName,
    verifiedDate,
    granularity: "town" as const,
  };
  const sidewalkShare = round(
    ((counts.sidewalkTaggedWays + counts.footwayWays) / Math.max(counts.walkNetworkWays, 1)) * 100,
  );
  const wheelchairShare = round(
    (counts.wheelchairTaggedAmenities / Math.max(counts.wheelchairRelevantAmenities, 1)) * 100,
  );
  const walkabilityDensity = round(counts.walkableAmenities / AREA_2KM_KM2);

  return [
    {
      key: "walkability_proxy",
      label: "Walkability proxy",
      matrixCategory: "travel_connectivity",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: walkabilityDensity,
        ...sourceBase,
        confidence: "medium",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${counts.walkableAmenities} selected walkable-service OSM features within 2 km of ${target.lat}, ${target.lon}, equal to ${walkabilityDensity} features/km2.`,
      },
      unit: "selected OSM walkable-service features per km2 within 2 km",
      notes:
        "OSM walkability proxy from selected amenities and shops around the representative town coordinate. This is not a pedestrian-safety, step-free, route-quality, traffic, or car-free-living guarantee.",
    },
    {
      key: "sidewalk_coverage_proxy",
      label: "Sidewalk and footway coverage proxy",
      matrixCategory: "culture_services",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: sidewalkShare,
        ...sourceBase,
        confidence: "low",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${counts.sidewalkTaggedWays} selected street ways with a sidewalk tag, ${counts.footwayWays} footway or sidewalk ways, and ${counts.walkNetworkWays} selected walk-network ways within 2 km. Count-share proxy: ${sidewalkShare}%.`,
      },
      unit: "percent of selected OSM street/footway ways, count-share proxy",
      notes:
        "Low-confidence OSM tag-completeness proxy, not a formal accessibility audit, sidewalk inventory, legal access claim, or guarantee for any route.",
    },
    {
      key: "wheelchair_tagged_amenities_share",
      label: "Share of amenities with wheelchair tags",
      matrixCategory: "culture_services",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: wheelchairShare,
        ...sourceBase,
        confidence: "low",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${counts.wheelchairTaggedAmenities} wheelchair-tagged selected amenities or shops out of ${counts.wheelchairRelevantAmenities} selected relevant amenities or shops within 2 km. Tagged-share proxy: ${wheelchairShare}%.`,
      },
      unit: "percent of selected OSM amenities/shops with any wheelchair tag",
      notes:
        "Low-confidence OSM tag-completeness proxy, not a formal accessibility audit, venue-accessibility guarantee, opening-hours claim, or route-access claim.",
    },
    {
      key: "step_free_station_proxy",
      label: "Step-free rail or transit access proxy",
      matrixCategory: "culture_services",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: counts.stepFreeTaggedStations,
        ...sourceBase,
        confidence: "low",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${counts.stepFreeTaggedStations} OSM railway/public-transport station or elevator features with wheelchair=yes or elevator tagging within 5 km of the representative town coordinate.`,
      },
      unit: "OSM wheelchair/elevator-tagged station features within 5 km",
      notes:
        "Low-confidence mapped-feature proxy, not a formal accessibility audit, operator accessibility statement, timetable claim, or guarantee of step-free access.",
    },
  ];
}

function seasonalServiceShare(counts: OsmSeasonalServiceCounts): number {
  return round(
    (counts.seasonallyCodedServices / Math.max(counts.openingHoursTaggedServices, 1)) * 100,
  );
}

export function buildOsmSeasonalServiceDropoffRow({
  target,
  counts,
  endpoint,
  verifiedDate,
}: OsmSeasonalServiceRowInput): MatrixRow {
  const query = buildOsmSeasonalServiceOverpassQuery(target);
  const sourceUrl = overpassSourceUrl(endpoint, query);
  const share = seasonalServiceShare(counts);
  return {
    key: "seasonal_service_dropoff_proxy",
    label: "Winter-vs-summer service drop-off proxy",
    matrixCategory: "culture_services",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: share,
      sourceUrl,
      sourceName: `OpenStreetMap contributors via Overpass API, ${target.placeName} seasonal opening-hours proxy query`,
      verifiedDate,
      confidence: "low",
      granularity: "town",
      excerpt: `${target.placeName}: Overpass returned ${counts.selectedServices} selected service, shop, and tourism OSM features within 2 km of ${target.lat}, ${target.lon}; ${counts.openingHoursTaggedServices} had opening_hours tags; ${counts.seasonallyCodedServices} had month/date-range opening_hours or seasonal tags. Seasonally coded opening-hours share: ${share}%.`,
    },
    unit: "percent of opening-hours-tagged selected OSM service features with month/date-range or seasonal tags",
    notes:
      "Low-confidence OSM tag proxy for visible seasonality in mapped service opening-hours data. This is not a full winter-vs-summer service-drop-off measure, not a proof that services are open or closed, not a business-hours guarantee, not a tourism seasonality measure, not a resident-service availability audit, and not advice. Zero means no selected mapped features returned explicit month/date-range seasonality tags, not proof that no seasonal drop-off exists.",
  };
}

export function buildOsmEmergencyVetProxyRow({
  target,
  counts,
  endpoint,
  verifiedDate,
}: OsmEmergencyVetRowInput): MatrixRow {
  const query = buildOsmEmergencyVetOverpassQuery(target);
  const sourceUrl = overpassSourceUrl(endpoint, query);
  return {
    key: "emergency_vet_proxy",
    label: "Emergency veterinary-care proxy",
    matrixCategory: "culture_services",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: counts.emergencyTaggedVeterinaryFeatures,
      sourceUrl,
      sourceName: `OpenStreetMap contributors via Overpass API, ${target.placeName} emergency-veterinary tag proxy query`,
      verifiedDate,
      confidence: "low",
      granularity: "town",
      excerpt: `${target.placeName}: Overpass returned ${counts.veterinaryFeatures} selected veterinary OSM features within 10 km of ${target.lat}, ${target.lon}; ${counts.emergencyTaggedVeterinaryFeatures} had explicit emergency, emergency-service, emergency opening-hours, 24/7 opening-hours, or emergency-speciality tags.`,
    },
    unit: "OSM veterinary features within 10 km with explicit emergency or 24/7 tags",
    notes:
      "Low-confidence OSM tag proxy for mapped emergency veterinary-care signals. This is not a complete veterinary directory, after-hours rota, emergency-service guarantee, opening-hours guarantee, phone-triage availability, clinical-quality measure, price claim, insurance claim, animal-health advice, or proof that untagged veterinary services do not offer emergency care. Zero means no selected mapped veterinary features returned explicit emergency or 24/7 tags, not proof that emergency veterinary care is unavailable.",
  };
}

function sourceTagSummary(candidate: OsmFeatureCandidate): string {
  const tags = Object.entries(candidate.tags)
    .filter(([key]) =>
      [
        "amenity",
        "healthcare",
        "emergency",
        "ferry",
        "public_transport",
        "office",
        "operator",
        "brand",
        "ref",
        "address",
        "source",
        "name:en",
        "name:el",
      ].includes(key),
    )
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
  return tags || "selected OSM feature tags";
}

function trimTerminalPunctuation(value: string): string {
  return value.replace(/[.]+$/u, "");
}

export function buildFeatureRouteRows({
  target,
  ferryRoute,
  hospitalRoute,
  ferrySourceUrl,
  hospitalSourceUrl,
  ferryOsrmUrl,
  hospitalOsrmUrl,
  verifiedDate,
}: FeatureRouteRowsInput): MatrixRow[] {
  const rows: MatrixRow[] = [];

  if (hospitalRoute) {
    rows.push(
      {
        key: "nearest_emergency_hospital",
        label: "Nearest hospital with emergency-care signal",
        matrixCategory: "health_family_schooling",
        intendedGranularity: "town",
        observedGranularity: "town",
        coverageStatus: "proxy",
        cited: {
          value: `Nearest OSM emergency-tagged hospital feature from ${target.placeName}: ${hospitalRoute.candidate.name}.`,
          sourceUrl: hospitalSourceUrl,
          sourceName: `OpenStreetMap contributors via Overpass API, ${target.placeName} emergency-tagged hospital feature query`,
          verifiedDate,
          confidence: "low",
          granularity: "town",
          category: "healthcare",
          excerpt: `${target.placeName}: selected ${hospitalRoute.candidate.id} (${hospitalRoute.candidate.objectUrl}), ${hospitalRoute.candidate.name}, from OSM hospital features with emergency=yes or emergency speciality tags. Tags used: ${sourceTagSummary(hospitalRoute.candidate)}.`,
        },
        unit: "nearest OSM emergency-tagged hospital feature",
        notes:
          "Low-confidence OSM emergency-care proxy. This is not an official hospital registry confirmation, emergency access guarantee, ambulance, triage, appointment, waiting-time, language-access, insurance, or care-quality claim.",
      },
      {
        key: "emergency_hospital_drive_minutes",
        label: "Drive time to nearest emergency hospital",
        matrixCategory: "health_family_schooling",
        intendedGranularity: "town",
        observedGranularity: "town",
        coverageStatus: "proxy",
        cited: {
          value: `OSRM route proxy from ${target.placeName} town point to ${hospitalRoute.candidate.name}: ${hospitalRoute.durationMinutes} minutes, ${hospitalRoute.distanceKm} km.`,
          sourceUrl: hospitalOsrmUrl,
          sourceName: `OSRM public routing table over OpenStreetMap-derived road graph, ${target.placeName} to selected OSM emergency-tagged hospital feature`,
          verifiedDate,
          confidence: "low",
          granularity: "town",
          category: "healthcare",
          excerpt: `OSRM table route proxy from ${target.placeName} representative coordinate to ${hospitalRoute.candidate.name} returned ${hospitalRoute.durationMinutes} minutes and ${hospitalRoute.distanceKm} km. Hospital source: ${hospitalRoute.candidate.objectUrl}.`,
        },
        unit: "OSRM driving route proxy",
        notes:
          "Low-confidence route proxy because the emergency-care signal is from OSM tags. This is not emergency access, ambulance response, live traffic, triage, appointment, waiting-time, language-access, insurance, or care-quality advice.",
      },
    );
  }

  if (ferryRoute) {
    rows.push({
      key: "ferry_terminal_drive_minutes",
      label: "Drive time to nearest ferry terminal",
      matrixCategory: "travel_connectivity",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: `OSRM route proxy from ${target.placeName} town point to nearest routed OSM ferry-terminal feature, ${ferryRoute.candidate.name}: ${ferryRoute.durationMinutes} minutes, ${ferryRoute.distanceKm} km.`,
        sourceUrl: ferryOsrmUrl,
        sourceName: `OSRM public routing table over OpenStreetMap-derived road graph, ${target.placeName} to selected OSM ferry-terminal feature`,
        verifiedDate,
        confidence: "medium",
        granularity: "town",
        category: "connectivity",
        excerpt: `OSRM table route proxy from ${target.placeName} representative coordinate to ${ferryRoute.candidate.name} returned ${ferryRoute.durationMinutes} minutes and ${ferryRoute.distanceKm} km. OSM terminal source: ${ferryRoute.candidate.objectUrl}. Overpass source query: ${ferrySourceUrl}.`,
      },
      unit: "OSRM driving route proxy to OSM ferry-terminal feature",
      notes:
        "OSM/OSRM ferry-terminal access proxy, not ferry-route, timetable, ticketing, car-ferry, seasonal-operation, live-traffic, parking, or service-availability evidence. Some OSM ferry-terminal features may represent local or tourist-boat boarding points.",
    });
  }

  return rows;
}

export function buildCitizenServiceCentreDistanceRow({
  target,
  route,
  sourceUrl,
  sourceName,
  sourceExcerpt,
  osrmUrl,
  verifiedDate,
}: CitizenServiceCentreDistanceRowInput): MatrixRow {
  return {
    key: "citizen_service_centre_distance",
    label: "Distance to citizen-service centre",
    matrixCategory: "culture_services",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `OSRM route proxy from ${target.placeName} town point to nearest routed mapped KEP or citizen-service feature, ${route.candidate.name}: ${route.durationMinutes} minutes, ${route.distanceKm} km.`,
      sourceUrl: osrmUrl,
      sourceName: `OSRM public routing table over OpenStreetMap-derived road graph, ${target.placeName} to selected KEP or citizen-service address from ${sourceName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "connectivity",
      excerpt: `OSRM table route proxy from ${target.placeName} representative coordinate to ${route.candidate.name} returned ${route.durationMinutes} minutes and ${route.distanceKm} km. Office/address source: ${sourceUrl}. Source excerpt: ${sourceExcerpt}. Feature or address point source: ${route.candidate.objectUrl}. Tags used: ${sourceTagSummary(route.candidate)}.`,
    },
    unit: "OSRM driving route proxy to mapped KEP or citizen-service feature",
    notes:
      "Official KEP address or mapped KEP feature plus OSM/OSRM route proxy, not an official service-area assignment, appointment availability, opening-hours, processing-time, eligibility, language-access, or legal or administrative advice claim.",
  };
}

export function buildTaxOfficeDistanceRow({
  target,
  route,
  sourceUrl,
  sourceName,
  sourceExcerpt,
  osrmUrl,
  verifiedDate,
}: TaxOfficeDistanceRowInput): MatrixRow {
  return {
    key: "tax_office_distance",
    label: "Distance to relevant tax office",
    matrixCategory: "tax_residency",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `OSRM route proxy from ${target.placeName} town point to selected AADE tax-office address, ${route.candidate.name}: ${route.durationMinutes} minutes, ${route.distanceKm} km.`,
      sourceUrl: osrmUrl,
      sourceName: `OSRM public routing table over OpenStreetMap-derived road graph, ${target.placeName} to selected AADE tax-office address from ${sourceName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "tax",
      excerpt: `OSRM table route proxy from ${target.placeName} representative coordinate to ${route.candidate.name} returned ${route.durationMinutes} minutes and ${route.distanceKm} km. AADE office/address source: ${sourceUrl}. Source excerpt: ${sourceExcerpt}. Feature or address point source: ${route.candidate.objectUrl}. Tags used: ${sourceTagSummary(route.candidate)}.`,
    },
    unit: "OSRM driving route proxy to AADE tax-office address",
    notes:
      "AADE office-address evidence plus OSM/OSRM route proxy, not an official tax-office assignment, appointment availability, opening-hours, processing-time, eligibility, jurisdiction, tax-residency determination, or tax obligation. This is not tax advice. Address-point geocoding may be street-level where the office itself is not mapped.",
  };
}

export function buildResidencePermitOfficeDistanceRow({
  target,
  route,
  sourceUrl,
  sourceName,
  sourceExcerpt,
  osrmUrl,
  verifiedDate,
}: ResidencePermitOfficeDistanceRowInput): MatrixRow {
  return {
    key: "residence_permit_office_distance",
    label: "Distance to relevant residence-permit office",
    matrixCategory: "tax_residency",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `OSRM route proxy from ${target.placeName} town point to official Crete residence-permit office address, ${route.candidate.name}: ${route.durationMinutes} minutes, ${route.distanceKm} km.`,
      sourceUrl: osrmUrl,
      sourceName: `OSRM public routing table over OpenStreetMap-derived road graph, ${target.placeName} to official Crete residence-permit office address from ${sourceName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "residency",
      excerpt: `OSRM table route proxy from ${target.placeName} representative coordinate to ${route.candidate.name} returned ${route.durationMinutes} minutes and ${route.distanceKm} km. Residence-permit office/address source: ${sourceUrl}. Source excerpt: ${sourceExcerpt}. Feature or address point source: ${route.candidate.objectUrl}. Tags used: ${sourceTagSummary(route.candidate)}.`,
    },
    unit: "OSRM driving route proxy to official residence-permit office address",
    notes:
      "Official Crete residence-permit office-address evidence plus OSM/OSRM route proxy, not an official service-area assignment, appointment availability, opening-hours, processing-time, eligibility, visa or residence-route qualification, application outcome, language-access, legal advice, immigration advice, or administrative advice claim.",
  };
}

export function buildLandRegistryOfficeDistanceRow({
  target,
  route,
  sourceUrl,
  sourceName,
  sourceExcerpt,
  osrmUrl,
  verifiedDate,
}: LandRegistryOfficeDistanceRowInput): MatrixRow {
  return {
    key: "land_registry_office_distance",
    label: "Distance to land or property registry office",
    matrixCategory: "tax_residency",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `OSRM route proxy from ${target.placeName} town point to selected Hellenic Cadastre office address, ${route.candidate.name}: ${route.durationMinutes} minutes, ${route.distanceKm} km.`,
      sourceUrl: osrmUrl,
      sourceName: `OSRM public routing table over OpenStreetMap-derived road graph, ${target.placeName} to selected Hellenic Cadastre office address from ${sourceName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      excerpt: `OSRM table route proxy from ${target.placeName} representative coordinate to ${route.candidate.name} returned ${route.durationMinutes} minutes and ${route.distanceKm} km. Hellenic Cadastre office/address source: ${sourceUrl}. Source excerpt: ${sourceExcerpt}. Feature or address point source: ${route.candidate.objectUrl}. Tags used: ${sourceTagSummary(route.candidate)}.`,
    },
    unit: "OSRM driving route proxy to Hellenic Cadastre office address",
    notes:
      "Hellenic Cadastre office-address evidence plus OSM/OSRM route proxy, not an official jurisdiction assignment, service-area assignment, appointment availability, opening-hours, processing-time, title, ownership, property-rights, legal-status, land-registration outcome, property advice, legal advice, or administrative advice claim. Address-point geocoding may be street-level where the office itself is not mapped.",
  };
}

export function buildInternationalSchoolDistanceRow({
  target,
  route,
  sourceUrl,
  sourceName,
  sourceExcerpt,
  osrmUrl,
  verifiedDate,
}: InternationalSchoolDistanceRowInput): MatrixRow {
  return {
    key: "international_school_distance",
    label: "Distance to accredited European School",
    matrixCategory: "health_family_schooling",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `OSRM route proxy from ${target.placeName} town point to the identified European Schools-accredited school in Crete, ${route.candidate.name}: ${route.durationMinutes} minutes, ${route.distanceKm} km.`,
      sourceUrl: osrmUrl,
      sourceName: `OSRM public routing table over OpenStreetMap-derived road graph, ${target.placeName} to ${route.candidate.name}, with school accreditation and address evidence from ${sourceName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      excerpt: `OSRM table route proxy from ${target.placeName} representative coordinate to ${route.candidate.name} returned ${route.durationMinutes} minutes and ${route.distanceKm} km. School accreditation/address source: ${sourceUrl}. School site: ${SCHOOL_OF_EUROPEAN_EDUCATION_HERAKLION_URL}. Source excerpt: ${sourceExcerpt}. Feature or address point source: ${route.candidate.objectUrl}. Tags used: ${sourceTagSummary(route.candidate)}.`,
    },
    unit: "OSRM driving route proxy to accredited European School",
    notes:
      "Accredited European School access proxy, not a complete international-school inventory, admission availability, tuition, curriculum fit, grade placement, special-education provision, school-bus service, commute guarantee, childcare availability, or education advice. Private bilingual, language, tutoring, nursery, or non-accredited schools are not included unless separately sourced.",
  };
}

export function buildAfterHoursPharmacyProxyRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: PharmacyDutyRotaSource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "after_hours_pharmacy_proxy");
  if (!existing) throw new Error(`${bundle.id}: missing after_hours_pharmacy_proxy row`);
  const scopeLabel = source.observedGranularity === "region" ? "regional" : "local";

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: source.coverageStatus,
    observedGranularity: source.observedGranularity,
    cited: {
      value: `Public ${scopeLabel} duty-pharmacy rota page verified for ${source.placeName}; the source exposes a date-based rota interface for ${scopeLabel} on-duty pharmacy listings.`,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "medium",
      granularity: source.observedGranularity,
      category: "healthcare",
      excerpt: source.sourceExcerpt,
    },
    unit: "public duty-pharmacy rota pages verified at source",
    notes: `${source.coverageNote} This is not proof that a specific pharmacy is open, not a 24/7 pharmacy-density measure, not emergency care, stock, prescription, language, insurance, ambulance, clinical access, or medical advice. Dynamic duty rosters change daily and must be refreshed close to publication.`,
  };
}

export function buildMunicipalDigitalServicesRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: MunicipalDigitalServiceSource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "municipal_digital_services");
  if (!existing) throw new Error(`${bundle.id}: missing municipal_digital_services row`);
  const scopeLabel = source.observedGranularity === "region" ? "regional" : "municipal";

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: source.coverageStatus,
    observedGranularity: source.observedGranularity,
    cited: {
      value: `Official ${scopeLabel} digital-service or request page verified for ${source.placeName}.`,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "medium",
      granularity: source.observedGranularity,
      excerpt: source.sourceExcerpt,
    },
    unit: "official public digital-service pages verified at source",
    notes: `${source.coverageNote} This is a public digital-service surface signal only, not a service-completeness audit, service-quality measure, appointment-availability claim, processing-time claim, account-eligibility claim, accessibility audit, language-access guarantee, or administrative advice.`,
  };
}

export function buildWaterRestrictionHistoryRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: WaterRestrictionHistorySource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "water_restriction_history");
  if (!existing) throw new Error(`${bundle.id}: missing water_restriction_history row`);

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: source.coverageStatus,
    observedGranularity: source.observedGranularity,
    cited: {
      value: `Recent official water-supply interruption notice verified for ${source.placeName}: ${source.noticeDate}, affecting ${source.affectedArea}.`,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "low",
      granularity: source.observedGranularity,
      excerpt: source.sourceExcerpt,
    },
    unit: "official municipal or water-utility notice-history signal",
    notes: `${source.coverageNote} This is a low-confidence recent-notice history signal only, not a continuous water-stress baseline, not a current outage status, not a water-quality claim, not a utility-capacity assessment, not a household supply guarantee, not a future restriction prediction, not legal or utility advice, and not health advice.`,
  };
}

function placeFromWaterRestrictionRow(row: MatrixRow): string {
  const sourceName = row.cited?.sourceName ?? "";
  if (sourceName.includes("Chania")) return "Chania";
  if (sourceName.includes("Heraklion")) return "Heraklion";
  if (sourceName.includes("Rethymno")) return "Rethymno";
  if (sourceName.includes("Agios Nikolaos")) return "Agios Nikolaos";
  return "town";
}

export function summarizeRegionalWaterRestrictionHistoryRows({
  region,
  townRows,
  verifiedDate,
}: {
  region: PlaceEvidenceBundle;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const existing = region.rows.find((row) => row.key === "water_restriction_history");
  if (!existing) throw new Error(`${region.id}: missing water_restriction_history row`);
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map(
      (row) =>
        `${placeFromWaterRestrictionRow(row)}: ${trimTerminalPunctuation(
          String(row.cited?.value ?? ""),
        )}`,
    )
    .join("; ");
  const sourceUrls = rows
    .map((row) => row.cited?.sourceUrl)
    .filter((value): value is string => Boolean(value))
    .join("; ");
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    coverageStatus: "proxy",
    observedGranularity: "region",
    cited: {
      value: `Priority-town recent official water-supply interruption notice history for ${region.placeName}: ${examples}.`,
      sourceUrl: rows[0]?.cited?.sourceUrl ?? "https://www.chania.gr/",
      sourceName: `Official municipal and DEYA water-supply interruption notice rows for priority ${region.placeName} towns`,
      verifiedDate,
      confidence: "low",
      granularity: "region",
      excerpt: `${region.placeName} priority-town water-notice aggregate from cited town rows. Source URLs: ${sourceUrls}.`,
    },
    unit: "priority-town official municipal or water-utility notice-history aggregate",
    notes:
      "Accepted priority-town aggregate from official dated municipal or DEYA notice rows. This is not a true island-wide regional restriction history, continuous water-stress baseline, current outage status, water-quality claim, utility-capacity assessment, household supply guarantee, future restriction prediction, legal or utility advice, or health advice.",
  };
}

export function buildWriAqueductWaterStressBaselineRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: WriAqueductWaterStressSource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "water_stress_baseline");
  if (!existing) throw new Error(`${bundle.id}: missing water_stress_baseline row`);

  const isRegion = bundle.granularity === "region";
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    coverageStatus: isRegion ? "regional" : "inherited_regional",
    observedGranularity: "region",
    cited: {
      value: `${source.regionName} baseline water stress: ${source.baselineLabel}; Aqueduct score ${source.baselineScore}, category ${source.baselineCategory}, raw value ${round(
        source.baselineRaw,
        3,
      )}.`,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: "climate",
      excerpt: source.sourceExcerpt,
    },
    unit: "WRI Aqueduct baseline water-stress category and score",
    notes: `${source.coverageNote} Extracted row ids: ${source.rowIds.join(
      ", ",
    )}. Meaningful Crete area in the extracted rows is ${round(
      source.meaningfulAreaKm2,
      3,
    )} km2; no-data slivers total ${round(
      source.noDataAreaKm2,
      3,
    )} km2 and are not used to change the label. This is regional water-stress screening context, not a household service guarantee, not a current outage status, not a water-quality claim, not a utility-capacity assessment, not a property-suitability assessment, not an agricultural water-rights claim, not a future restriction prediction, not legal or utility advice, and not health advice.`,
  };
}

export function buildInternationalSchoolTuitionRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: InternationalSchoolTuitionSource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "intl_school_tuition");
  if (!existing) throw new Error(`${bundle.id}: missing intl_school_tuition row`);
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    coverageStatus: source.coverageStatus,
    observedGranularity: source.observedGranularity,
    cited: {
      value: `${source.feeValueEur} EUR annual tuition for the selected European Schools-accredited public school, ${source.schoolName}; the source says no fees apply because it is a Greek public school.`,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "medium",
      granularity: source.observedGranularity,
      category: "healthcare",
      excerpt: source.sourceExcerpt,
    },
    unit: "EUR annual tuition for selected European Schools-accredited public school",
    notes: `${source.coverageNote} This is a selected-school tuition proxy, not a median of all private international-school tuition in the town, not admissions availability, not a grade-placement guarantee, not a school-bus, meals, uniform, trips, exam-fee, or support-service cost estimate, and not education advice.`,
  };
}

export function buildBusFrequencyProxyRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: BusFrequencyProxySource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "bus_frequency_proxy");
  if (!existing) throw new Error(`${bundle.id}: missing bus_frequency_proxy row`);

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: source.coverageStatus,
    observedGranularity: source.observedGranularity,
    cited: {
      value: `${source.frequencyLabel}. Selected corridor: ${source.selectedCorridor}.`,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "medium",
      granularity: source.observedGranularity,
      category: "connectivity",
      excerpt: source.sourceExcerpt,
    },
    unit: "selected official KTEL timetable departures",
    notes: `${source.coverageNote} This is a selected intercity-corridor timetable proxy, not a full public-transport network score, not a local bus coverage audit, not a headway guarantee, not a real-time reliability measure, not an accessibility claim, not a ticket availability claim, not a strike or cancellation warning, not a door-to-door commute estimate, and not transport advice. Refresh before publication because timetables are seasonal.`,
  };
}

export function summarizeRegionalBusFrequencyProxyRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map((row) => {
      const value = String(row.cited?.value ?? "");
      const place =
        value.match(/from (Chania|Heraklion|Rethymno|Agios Nikolaos)/)?.[1] ??
        row.cited?.sourceName.match(/(Chania|Heraklion|Rethymno|Agios Nikolaos)/)?.[1] ??
        "town";
      return `${place}: ${trimTerminalPunctuation(value)}`;
    })
    .join("; ");
  const counts = rows
    .map((row) => String(row.cited?.value).match(/^(\d+)/))
    .flatMap((match) => (match?.[1] ? [Number(match[1])] : []));
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    coverageStatus: "regional",
    observedGranularity: "region",
    cited: {
      value:
        counts.length > 0
          ? `Priority-town KTEL spine-frequency proxy range for ${regionName}: ${Math.min(
              ...counts,
            )}-${Math.max(...counts)} selected departures. ${examples}.`
          : `Priority-town KTEL spine-frequency proxy summary for ${regionName}: ${examples}.`,
      sourceUrl: KTEL_CHANIA_RETHYMNO_TIMETABLE_PAGE_URL,
      sourceName: `Official KTEL Chania-Rethymno and KTEL Heraklion-Lasithi timetable proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: "connectivity",
      excerpt: `${regionName} priority-town KTEL timetable proxy summary. Source URLs and exact excerpts are stored on the corresponding town evidence rows.`,
    },
    unit: "selected official KTEL timetable departures",
    notes:
      "Priority-town summary from selected official KTEL intercity-corridor timetable proxy rows, not a full public-transport network score, not an island-wide public-transport network score, not a local bus coverage audit, not a headway guarantee, not a real-time reliability measure, not an accessibility claim, not a ticket availability claim, not a strike or cancellation warning, not a door-to-door commute estimate, and not transport advice. Refresh before publication because timetables are seasonal.",
  };
}

export function buildAirportSummerDirectDestinationsRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: AirportSummerDirectDestinationsSource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "airport_summer_direct_destinations");
  if (!existing) throw new Error(`${bundle.id}: missing airport_summer_direct_destinations row`);

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: source.coverageStatus,
    observedGranularity: source.observedGranularity,
    cited: {
      value: source.destinationCount,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "medium",
      granularity: source.observedGranularity,
      category: "connectivity",
      excerpt: source.sourceExcerpt,
    },
    unit: `outbound direct destination airports, ${source.seasonLabel}`,
    notes: `${source.coverageNote} Counted ${source.destinationCount} outbound destination airports from ${source.listedDestinationAirports} listed airport options for ${source.airportCode}; excluded listed airports with no outbound timetable rows: ${source.excludedAirports.join(
      ", ",
    )}. HSCA seasonal calendar source checked: ${HSCA_CALENDAR_MARCH_2026_SOURCE_URL}. This is a selected-airport timetable count, not flight frequency, seats, fares, airline coverage, live operation, year-round availability, not a service guarantee, not booking advice, not travel advice, and not proof that every listed destination operates on every day of the season.`,
  };
}

function transportScheduleCaveat(rowKey: TransportScheduleRowKey): string {
  if (rowKey.startsWith("airport_")) {
    return "This is a selected-airport seasonal timetable count, not flight frequency, seats, fares, airline coverage, live operation, year-round availability, not a service guarantee, not booking advice, and not travel advice.";
  }
  return "This is a selected-port seasonal ferry-route count, not sailing frequency, seats, vehicle capacity, fares, live operation, year-round availability, not a service guarantee, not booking advice, and not travel advice.";
}

export function buildManualTransportScheduleRow({
  bundle,
  record,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  record: TransportScheduleManualRecord;
  verifiedDate: string;
}): MatrixRow {
  if (record.bundleId !== bundle.id) {
    throw new Error(`${bundle.id}: manual transport schedule record targets ${record.bundleId}`);
  }
  const existing = bundle.rows.find((row) => row.key === record.rowKey);
  if (!existing) throw new Error(`${bundle.id}: missing ${record.rowKey} row`);
  if (record.confidence === "low") {
    throw new Error(
      `${bundle.id}:${record.rowKey}: transport schedule rows require medium/high confidence`,
    );
  }
  if (!["local", "regional", "proxy"].includes(record.coverageStatus)) {
    throw new Error(
      `${bundle.id}:${record.rowKey}: manual transport schedule coverage must be local, regional, or proxy`,
    );
  }

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: record.coverageStatus,
    observedGranularity: record.observedGranularity,
    cited: {
      value: record.value,
      sourceUrl: record.sourceUrl,
      sourceName: record.sourceName,
      verifiedDate: record.verifiedDate ?? verifiedDate,
      confidence: record.confidence ?? "medium",
      granularity: record.observedGranularity,
      category: "connectivity",
      excerpt: record.sourceExcerpt,
    },
    unit: record.unit,
    notes: `${record.notes ? `${record.notes} ` : ""}${transportScheduleCaveat(record.rowKey)}`,
  };
}

export function buildAirportWinterRouteRatioRow({
  bundle,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  verifiedDate: string;
}): MatrixRow {
  const ratioRow = bundle.rows.find((row) => row.key === "airport_winter_route_ratio");
  if (!ratioRow) throw new Error(`${bundle.id}: missing airport_winter_route_ratio row`);
  const winterRow = bundle.rows.find((row) => row.key === "airport_winter_direct_destinations");
  const summerRow = bundle.rows.find((row) => row.key === "airport_summer_direct_destinations");
  if (!winterRow?.cited || !summerRow?.cited) {
    throw new Error(`${bundle.id}: airport winter/summer counts must be cited before ratio`);
  }
  if (typeof winterRow.cited.value !== "number" || typeof summerRow.cited.value !== "number") {
    throw new Error(`${bundle.id}: airport winter/summer counts must be numeric before ratio`);
  }
  if (summerRow.cited.value <= 0) {
    throw new Error(`${bundle.id}: airport summer count must be greater than zero before ratio`);
  }

  const ratio = Number((winterRow.cited.value / summerRow.cited.value).toFixed(2));
  const coverageStatus =
    winterRow.coverageStatus === summerRow.coverageStatus ? winterRow.coverageStatus : "proxy";
  const observedGranularity =
    winterRow.observedGranularity ?? summerRow.observedGranularity ?? winterRow.cited.granularity;
  const base: MatrixRow = { ...ratioRow };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus,
    observedGranularity,
    cited: {
      value: ratio,
      sourceUrl: winterRow.cited.sourceUrl,
      sourceName: `Derived from ${winterRow.cited.sourceName} and ${summerRow.cited.sourceName}`,
      verifiedDate,
      confidence:
        winterRow.cited.confidence === "high" && summerRow.cited.confidence === "high"
          ? "high"
          : "medium",
      granularity: observedGranularity,
      category: "connectivity",
      excerpt: `Formula: ${winterRow.cited.value} winter direct destinations / ${summerRow.cited.value} summer direct destinations = ${ratio}. Winter source: ${winterRow.cited.sourceUrl}. Summer source: ${summerRow.cited.sourceUrl}.`,
    },
    unit: "winter direct destinations / summer direct destinations",
    notes:
      "Derived only after both selected-airport seasonal direct-destination component rows are cited for the same selected-airport basis. This is a route-seasonality ratio, not flight frequency, seats, fares, live operation, year-round availability, not a service guarantee, not booking advice, and not travel advice.",
  };
}

export function buildCruisePassengerPressureRow({
  bundle,
  source,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  source: CruisePassengerPressureSource;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "cruise_passenger_pressure");
  if (!existing) throw new Error(`${bundle.id}: missing cruise_passenger_pressure row`);

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: source.coverageStatus,
    observedGranularity: source.observedGranularity,
    cited: {
      value: `${source.portName} recorded ${source.calls.toLocaleString(
        "en-US",
      )} cruise calls and ${source.passengers.toLocaleString(
        "en-US",
      )} cruise passenger arrivals in ${source.year}.`,
      sourceUrl: source.sourceUrl,
      sourceName: source.sourceName,
      verifiedDate,
      confidence: "medium",
      granularity: source.observedGranularity,
      excerpt: source.sourceExcerpt,
    },
    unit: "annual cruise calls and passenger arrivals",
    notes: `${source.coverageNote} Cruise passenger arrivals are port visit counts, not unique individuals, not resident pressure, not overnight-stay counts, not ferry passengers, and not a complete tourism-pressure measure.`,
  };
}

export function summarizeRegionalCruisePassengerPressureRows({
  region,
  townRows,
  verifiedDate,
}: {
  region: PlaceEvidenceBundle;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const passengerValues = rows
    .map((row) => String(row.cited?.value).match(/and ([\d,]+) cruise passenger arrivals/))
    .flatMap((match) => (match?.[1] ? [Number(match[1].replaceAll(",", ""))] : []));
  const callValues = rows
    .map((row) => String(row.cited?.value).match(/recorded ([\d,]+) cruise calls/))
    .flatMap((match) => (match?.[1] ? [Number(match[1].replaceAll(",", ""))] : []));
  if (passengerValues.length !== rows.length || callValues.length !== rows.length) return null;

  const existing = region.rows.find((row) => row.key === "cruise_passenger_pressure");
  if (!existing) throw new Error(`${region.id}: missing cruise_passenger_pressure row`);
  const examples = rows
    .map((row) => trimTerminalPunctuation(String(row.cited?.value ?? "")))
    .join("; ");
  const passengerTotal = passengerValues.reduce((sum, value) => sum + value, 0);
  const callTotal = callValues.reduce((sum, value) => sum + value, 0);

  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;
  return {
    ...base,
    coverageStatus: "regional",
    observedGranularity: "region",
    cited: {
      value: `Priority-port total for ${region.placeName}: ${callTotal.toLocaleString(
        "en-US",
      )} cruise calls and ${passengerTotal.toLocaleString(
        "en-US",
      )} cruise passenger arrivals in 2024 across Chania (Souda), Heraklion, Rethymno, and Agios Nikolaos. ${examples}.`,
      sourceUrl: ELIME_CRUISE_ARRIVALS_2024_SOURCE_URL,
      sourceName: ELIME_CRUISE_ARRIVALS_2024_SOURCE_NAME,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      excerpt:
        "ELIME 2024 rows report Heraklion 266 calls and 518,575 passengers; Chania (Souda) 131 calls and 279,754 passengers; Agios Nikolaos 40 calls and 45,046 passengers; Rethymno 36 calls and 1,788 passengers. These sum to 473 calls and 845,163 passenger arrivals for the four priority Crete ports.",
    },
    unit: "annual cruise calls and passenger arrivals",
    notes:
      "Priority-port summary from ELIME 2024 port rows for Chania (Souda), Heraklion, Rethymno, and Agios Nikolaos, not an island-wide all-tourism measure, not unique individuals, not resident pressure, not overnight-stay counts, not ferry passengers, not day-crowd distribution, not port-capacity, not congestion, not neighbourhood impact, not spending, and not a tourism-pressure advice claim.",
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function firstNumberFromCitedText(row: MatrixRow | undefined): number | null {
  const value = row?.cited?.value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function routeMinutesFromCitedText(row: MatrixRow | undefined): number | null {
  const value = row?.cited?.value;
  if (typeof value !== "string") return null;
  const match = value.match(/:\s*(-?\d+(?:\.\d+)?) minutes/);
  return match?.[1] ? Number(match[1]) : firstNumberFromCitedText(row);
}

function requireCarDependencyComponent(
  bundle: PlaceEvidenceBundle,
  key: string,
  value: number | null,
): number {
  if (value === null || !Number.isFinite(value)) {
    throw new Error(`${bundle.id}: missing cited numeric component for ${key}`);
  }
  return value;
}

export function buildCarDependencyProxyRow({
  bundle,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  verifiedDate: string;
}): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "car_dependency_proxy");
  if (!existing) throw new Error(`${bundle.id}: missing car_dependency_proxy row`);
  const rowByKey = new Map(bundle.rows.map((row) => [row.key, row]));
  const familyAmenityRow = rowByKey.get("family_amenity_density");
  const walkability = requireCarDependencyComponent(
    bundle,
    "walkability_proxy",
    numericCitedValue(rowByKey.get("walkability_proxy")),
  );
  const busFrequency = requireCarDependencyComponent(
    bundle,
    "bus_frequency_proxy",
    firstNumberFromCitedText(rowByKey.get("bus_frequency_proxy")),
  );
  const airportMinutes = requireCarDependencyComponent(
    bundle,
    "airport_drive_minutes",
    routeMinutesFromCitedText(rowByKey.get("airport_drive_minutes")),
  );
  const ferryMinutes = requireCarDependencyComponent(
    bundle,
    "ferry_terminal_drive_minutes",
    routeMinutesFromCitedText(rowByKey.get("ferry_terminal_drive_minutes")),
  );
  const familyDensity = requireCarDependencyComponent(
    bundle,
    "family_amenity_density",
    familyAmenityRow ? numericFamilyAmenityDensity(familyAmenityRow) : null,
  );
  const citizenServiceMinutes = requireCarDependencyComponent(
    bundle,
    "citizen_service_centre_distance",
    routeMinutesFromCitedText(rowByKey.get("citizen_service_centre_distance")),
  );
  const walkPenalty = clamp01((30 - walkability) / 30);
  const busPenalty = clamp01((20 - busFrequency) / 20);
  const airportPenalty = clamp01(airportMinutes / 90);
  const ferryPenalty = clamp01(ferryMinutes / 30);
  const localPenalty = (clamp01((4 - familyDensity) / 4) + clamp01(citizenServiceMinutes / 10)) / 2;
  const score = round(
    100 *
      (0.35 * walkPenalty +
        0.25 * busPenalty +
        0.15 * airportPenalty +
        0.1 * ferryPenalty +
        0.15 * localPenalty),
    0,
  );
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `Derived car-dependency proxy for ${bundle.placeName}: ${score}/100. Components: walkability ${walkability} OSM walkable-service features/km2; bus ${busFrequency} selected KTEL departures; airport ${airportMinutes} minutes; ferry ${ferryMinutes} minutes; family amenities ${familyDensity} features/km2; KEP ${citizenServiceMinutes} minutes. Higher means more car-dependent.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `Derived from cited OSM, OSRM, KTEL, and citizen-service proxy rows, ${bundle.placeName} car-dependency formula`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "connectivity",
      excerpt: `${bundle.placeName} car-dependency formula: 100 * (0.35 * clamp((30 - walkability) / 30, 0, 1) + 0.25 * clamp((20 - selected bus departures) / 20, 0, 1) + 0.15 * clamp(airport minutes / 90, 0, 1) + 0.10 * clamp(ferry minutes / 30, 0, 1) + 0.15 * mean(clamp((4 - family amenities/km2) / 4, 0, 1), clamp(KEP minutes / 10, 0, 1))). Component source URLs remain on walkability_proxy, bus_frequency_proxy, airport_drive_minutes, ferry_terminal_drive_minutes, family_amenity_density, and citizen_service_centre_distance.`,
    },
    unit: "0-100 derived car-dependency proxy, higher means more car-dependent",
    notes:
      "Derived screening proxy from already cited walkability, KTEL frequency, airport-drive, ferry-terminal-drive, family-amenity, and KEP-distance rows. It is not a car-ownership rate, not commute advice, not a full local bus coverage audit, not a traffic or parking measure, not an accessibility guarantee, not a school-run suitability claim, not a night/weekend service measure, not a route guarantee, and not transport advice.",
  };
}

function carDependencyScore(row: MatrixRow): number | null {
  const value = row.cited?.value;
  if (typeof value !== "string") return null;
  const match = value.match(/:\s*(\d+(?:\.\d+)?)\/100/);
  return match?.[1] ? Number(match[1]) : null;
}

function placeFromCarDependencyRow(row: MatrixRow): string {
  return (
    (typeof row.cited?.value === "string" ? row.cited.value.match(/for (.+?):/)?.[1] : null) ??
    "town"
  );
}

export function summarizeRegionalCarDependencyProxyRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const scores = rows.flatMap((row) => {
    const value = carDependencyScore(row);
    return value === null ? [] : [value];
  });
  if (scores.length !== rows.length) return null;
  const examples = rows
    .map((row) => `${placeFromCarDependencyRow(row)}: ${carDependencyScore(row)}/100`)
    .join("; ");

  return {
    key: "car_dependency_proxy",
    label: "Car-dependency signal",
    matrixCategory: "travel_connectivity",
    intendedGranularity: "town",
    observedGranularity: "region",
    coverageStatus: "regional",
    cited: {
      value: `Priority-town derived car-dependency proxy range for ${regionName}: ${Math.min(
        ...scores,
      )}-${Math.max(...scores)}/100. ${examples}. Higher means more car-dependent.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `Derived car-dependency proxy rows for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: "connectivity",
      excerpt: `${regionName} priority-town car-dependency summary from cited town formula rows. The formula uses cited walkability, KTEL bus-frequency, airport-drive, ferry-terminal-drive, family-amenity, and KEP-distance rows. Component source URLs remain on the town evidence rows.`,
    },
    unit: "0-100 derived car-dependency proxy, higher means more car-dependent",
    notes:
      "Priority-town summary from derived car-dependency proxy rows, not an island-wide transport dependency index, not a car-ownership rate, not commute advice, not a full local bus coverage audit, not a traffic or parking measure, not an accessibility guarantee, not a school-run suitability claim, not a night/weekend service measure, not a route guarantee, and not transport advice.",
  };
}

function wildfireContextRow(bundle: PlaceEvidenceBundle): CitedMatrixRow {
  const row = bundle.rows.find((candidate) => candidate.key === "wildfire_risk");
  if (!row?.cited) throw new Error(`${bundle.id}: missing cited wildfire_risk context row`);
  return row as CitedMatrixRow;
}

function highwayClassCountsText(counts: Record<string, number>): string {
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key} ${value}`)
    .join(", ");
}

function wildfireRoadDependenceLabel(metrics: OsmWildfireEgressMetrics): string {
  const sectors = metrics.outboundCorridorSectors.length;
  if (sectors <= 2) return "higher mapped road-dependence signal";
  if (sectors <= 4) return "moderate mapped road-dependence signal";
  return "lower mapped road-dependence signal";
}

export function calculateWildfireEgressRoadDependenceScore({
  exitBearingCount,
  deadEndShareRatio,
  carDependencyScoreValue,
}: {
  exitBearingCount: number;
  deadEndShareRatio: number;
  carDependencyScoreValue: number;
}): number {
  return round(
    100 *
      (0.55 * clamp01((3 - exitBearingCount) / 3) +
        0.3 * clamp01(deadEndShareRatio / WILDFIRE_EGRESS_DEAD_END_REFERENCE_SHARE) +
        0.15 * clamp01(carDependencyScoreValue / 100)),
    0,
  );
}

export function buildOsmWildfireEgressProxyRow({
  bundle,
  target,
  metrics,
  sourceUrl,
  verifiedDate,
}: OsmWildfireEgressRowInput): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "wildfire_egress_proxy");
  if (!existing) throw new Error(`${bundle.id}: missing wildfire_egress_proxy row`);
  const context = wildfireContextRow(bundle);
  if (metrics.retainedWayCount === 0 || metrics.componentNodeCount === 0) {
    throw new Error(`${bundle.id}: missing retained OSM road graph for wildfire_egress_proxy`);
  }
  const carDependencyRow = bundle.rows.find((row) => row.key === "car_dependency_proxy");
  if (!carDependencyRow) {
    throw new Error(`${bundle.id}: missing car_dependency_proxy row`);
  }
  const carScore = carDependencyScore(carDependencyRow);
  if (carScore === null) {
    throw new Error(`${bundle.id}: missing cited car_dependency_proxy score`);
  }
  const exitBearingCount = metrics.outboundCorridorSectors.length;
  const score = calculateWildfireEgressRoadDependenceScore({
    exitBearingCount,
    deadEndShareRatio: metrics.deadEndShareRatio,
    carDependencyScoreValue: carScore,
  });
  const label = wildfireRoadDependenceLabel(metrics);
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `${target.placeName} low-confidence wildfire-context road-dependence proxy: ${score}/100. Components: ${exitBearingCount} mapped outbound motor-road bearing sectors from the 1 km representative-town core to beyond ${WILDFIRE_EGRESS_OUTER_RADIUS_METRES / 1000} km; ${round(metrics.deadEndShareRatio * 100, 1)}% dead-end node share in the selected OSM drivable-road component; ${carScore}/100 existing car-dependency proxy; ${metrics.retainedRoadKm} km retained mapped motor-road geometry within ${WILDFIRE_EGRESS_RADIUS_METRES / 1000} km; ${label}. Higher means more road-dependent under the cited wildfire context, not more dangerous. National wildfire screening context row says ${context.cited.value}.`,
      sourceUrl,
      sourceName: `OpenStreetMap contributors via Overpass API road-network proxy, existing car-dependency proxy, and ${context.cited.sourceName}, ${target.placeName}`,
      verifiedDate,
      confidence: "low",
      granularity: "town",
      category: "safety",
      excerpt: `${target.placeName}: formula = round(100 * (0.55 * clamp((3 - exitBearingCount) / 3, 0, 1) + 0.30 * clamp(deadEndShare / ${WILDFIRE_EGRESS_DEAD_END_REFERENCE_SHARE}, 0, 1) + 0.15 * carDependencyScore / 100)). Inputs: exitBearingCount ${exitBearingCount}; deadEndShare ${metrics.deadEndShareRatio}; carDependencyScore ${carScore}; computed score ${score}. Overpass returned ${metrics.retainedWayCount} retained mapped motor-road ways, ${metrics.retainedSegmentCount} geometry segments, and ${metrics.retainedRoadKm} km retained mapped motor-road geometry within ${WILDFIRE_EGRESS_RADIUS_METRES / 1000} km of representative coordinate ${target.lat}, ${target.lon}. Selected town-core component has ${metrics.componentNodeCount} nodes, ${metrics.componentRoadKm} km road geometry, and ${metrics.deadEndNodeCount} dead-end nodes. Outbound sectors use ${WILDFIRE_EGRESS_SECTOR_DEGREES}-degree bearing buckets for selected-component motor-road nodes extending beyond ${WILDFIRE_EGRESS_OUTER_RADIUS_METRES / 1000} km from a component that touches the ${WILDFIRE_EGRESS_INNER_RADIUS_METRES / 1000} km town core. Sectors: ${metrics.outboundCorridorSectors.join(", ") || "none"}. Outer-ring selected-component nodes: ${metrics.outboundCrossingWayCount}. Highway class counts: ${highwayClassCountsText(metrics.highwayClassCounts) || "none"}. Wildfire context source: ${context.cited.sourceUrl}; value: ${context.cited.value}; source excerpt: ${context.cited.excerpt ?? "not stored"}.`,
    },
    unit: "0-100 low-confidence road-dependence proxy, higher means more constrained",
    notes:
      "Low-confidence OSM road-network proxy under cited national wildfire screening context. This is not an EFFIS/GWIS fire-behaviour grid, not an evacuation route, not an emergency plan, not road-capacity evidence, not live traffic, not smoke, wind, closure, response-time, insurance, parcel, property, safety, legal, health, or personal advice. OSM geometry can omit roads, duplicate roads, misclassify roads, or distort corridor redundancy; dead-end share and bearing sectors can overstate or understate practical road dependence.",
  };
}

function placeFromWildfireEgressRow(row: MatrixRow): string {
  return (
    (typeof row.cited?.value === "string"
      ? row.cited.value.match(/^(.+?) low-confidence wildfire-context/)?.[1]
      : null) ?? "town"
  );
}

function wildfireEgressSectorCount(row: MatrixRow): number | null {
  return numberFromPattern(row.cited?.value, /: (\d+) mapped outbound motor-road bearing sectors/);
}

function wildfireEgressScore(row: MatrixRow): number | null {
  return numberFromPattern(row.cited?.value, /: (\d+(?:\.\d+)?)\/100/);
}

export function summarizeRegionalOsmWildfireEgressProxyRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const scores = rows.flatMap((row) => {
    const value = wildfireEgressScore(row);
    return value === null ? [] : [value];
  });
  if (scores.length !== rows.length) return null;
  const examples = rows
    .map(
      (row) =>
        `${placeFromWildfireEgressRow(row)}: ${wildfireEgressScore(row)}/100, ${wildfireEgressSectorCount(row)} sectors`,
    )
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town wildfire-context road-dependence proxy range for ${regionName}: ${Math.min(
        ...scores,
      )}-${Math.max(...scores)}/100. ${examples}. Higher means more road-dependent under cited wildfire context, not more dangerous.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `OpenStreetMap contributors via per-town Overpass API road-corridor proxy queries for ${regionName}`,
      verifiedDate,
      confidence: "low",
      granularity: "region",
      category: "safety",
      excerpt: `${regionName} priority-town wildfire-context road-dependence proxy summary. ${examples}. Town row excerpts store the exact query URL, formula inputs, retained road geometry counts, dead-end share, sector definition, highway class counts, car-dependency component, and wildfire context source.`,
    },
    notes:
      "Priority-town summary from low-confidence OSM road-corridor proxy rows under cited national wildfire screening context. This is not an island-wide wildfire egress model, EFFIS/GWIS fire-behaviour grid, evacuation route, emergency plan, road-capacity evidence, live traffic, closure, response-time, insurance, parcel, property, safety, legal, health, or personal advice.",
  };
}

function gridText(grid: OpenMeteoGridSample): string {
  const elevation =
    typeof grid.elevation === "number" && Number.isFinite(grid.elevation)
      ? `, elevation ${grid.elevation} m`
      : "";
  return `${grid.latitude}, ${grid.longitude}${elevation}`;
}

function monthSeriesText(values: Array<number | null>, unitSuffix = ""): string {
  return values
    .map(
      (value, index) =>
        `${MONTH_LABELS[index]} ${value === null ? "n/a" : `${value}${unitSuffix}`}`,
    )
    .join("; ");
}

export function buildOpenMeteoEnvironmentRows({
  target,
  airQualityYear,
  climateStartYear,
  climateEndYear,
  pm25,
  snowfall,
  pm25SourceUrl,
  snowfallSourceUrl,
  verifiedDate,
}: OpenMeteoEnvironmentRowsInput): MatrixRow[] {
  const monthlyText = monthSeriesText(pm25.monthlyMeans);
  const climateYears = `${climateStartYear}-${climateEndYear}`;
  return [
    {
      key: "pm25_monthly",
      label: "PM2.5 monthly mean",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: monthlyText,
        sourceUrl: pm25SourceUrl,
        sourceName: `Open-Meteo Air Quality API, ${airQualityYear} hourly PM2.5 grid proxy for ${target.placeName}`,
        verifiedDate,
        confidence: "medium",
        granularity: "town",
        category: "healthcare",
        excerpt: `${target.placeName}: ${airQualityYear} monthly mean PM2.5 from ${pm25.hourlyCount} hourly Open-Meteo grid values: ${monthlyText}. Returned grid point ${gridText(pm25.grid)}.`,
      },
      unit: "micrograms per cubic metre, monthly mean",
      notes:
        "Gridded Open-Meteo air-quality proxy, not a regulatory monitoring-station observation, indoor-air measure, wildfire-smoke warning, personal exposure estimate, medical advice, or guarantee of neighbourhood air quality.",
    },
    {
      key: "pm25_exceedance_days",
      label: "Days over WHO PM2.5 guideline",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: pm25.exceedanceDays,
        sourceUrl: pm25SourceUrl,
        sourceName: `Open-Meteo Air Quality API, ${airQualityYear} daily PM2.5 exceedance proxy for ${target.placeName}`,
        verifiedDate,
        confidence: "medium",
        granularity: "town",
        category: "healthcare",
        excerpt: `${target.placeName}: ${pm25.exceedanceDays} days in ${airQualityYear} had an Open-Meteo grid daily mean PM2.5 above ${PM25_DAILY_GUIDELINE_UG_M3} micrograms per cubic metre, calculated from ${pm25.dailyCount} daily means and ${pm25.hourlyCount} hourly values. Returned grid point ${gridText(pm25.grid)}. Threshold reference: WHO global air quality guidelines 2021, daily PM2.5 guideline.`,
      },
      unit: `days/year, daily mean PM2.5 >${PM25_DAILY_GUIDELINE_UG_M3} micrograms per cubic metre`,
      notes:
        "Gridded daily PM2.5 exceedance proxy, not a regulatory monitoring-station observation, indoor-air measure, wildfire-smoke warning, personal exposure estimate, diagnosis, medical advice, or live air-quality alert.",
    },
    {
      key: "snowfall_days",
      label: "Snowfall days per year",
      matrixCategory: "climate",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: snowfall.snowfallDaysPerYear,
        sourceUrl: snowfallSourceUrl,
        sourceName: `Open-Meteo Historical Weather API, ${climateYears} snowfall-day grid proxy for ${target.placeName}`,
        verifiedDate,
        confidence: "medium",
        granularity: "town",
        category: "climate",
        excerpt: `${target.placeName}: average ${snowfall.snowfallDaysPerYear} snowfall days/year across ${climateYears}, using daily snowfall_sum >0 cm. Counted ${snowfall.snowfallDayCount} snowfall days across ${snowfall.yearCount} years. Returned grid point ${gridText(snowfall.grid)}.`,
      },
      unit: "days/year, daily snowfall_sum >0 cm",
      notes:
        "Open-Meteo historical-weather snowfall proxy, not a current-weather or road-safety claim, microclimate guarantee, mountain-condition report, or parcel-level snow-risk estimate.",
    },
  ];
}

export function buildOpenMeteoUvIndexRow({
  target,
  uvIndex,
  uvIndexSourceUrl,
  verifiedDate,
}: OpenMeteoUvIndexRowInput): MatrixRow {
  const monthlyText = monthSeriesText(uvIndex.monthlyMeanDailyMax);
  return {
    key: "uv_index_monthly",
    label: "Monthly UV index",
    matrixCategory: "climate",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: monthlyText,
      sourceUrl: uvIndexSourceUrl,
      sourceName: `Open-Meteo Air Quality API, ${uvIndex.year} hourly UV-index grid proxy for ${target.placeName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "climate",
      excerpt: `${target.placeName}: ${uvIndex.year} monthly mean daily maximum UV index from ${uvIndex.dailyCount} daily maxima and ${uvIndex.hourlyCount} hourly Open-Meteo uv_index grid values: ${monthlyText}. Returned grid point ${gridText(uvIndex.grid)}.`,
    },
    unit: "UV index, monthly mean of daily maximum hourly values",
    notes:
      "Open-Meteo gridded UV-index proxy for the previous complete calendar year, not a TEMIS long-term UV climatology, current forecast, medical advice, personal exposure measure, beach-safety claim, sunburn-risk advice, or microclimate guarantee.",
  };
}

export function buildOpenMeteoPollenSeverityRow({
  target,
  pollen,
  pollenSourceUrl,
  verifiedDate,
}: OpenMeteoPollenSeverityRowInput): MatrixRow {
  const monthlyText = monthSeriesText(pollen.monthlyMeanDailyMax, " grains/m3");
  return {
    key: "pollen_severity",
    label: "Pollen season severity",
    matrixCategory: "nature_environment",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `${pollen.year} proxy: ${pollen.daysAtOrAboveThreshold} days with selected pollen species at or above ${pollen.threshold} grains/m3; peak daily maximum ${pollen.peakDailyMax} grains/m3; peak species ${pollen.peakSpecies} ${pollen.peakSpeciesValue} grains/m3.`,
      sourceUrl: pollenSourceUrl,
      sourceName: `Open-Meteo Air Quality API, ${pollen.year} CAMS pollen grid proxy for ${target.placeName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "healthcare",
      excerpt: `${target.placeName}: ${pollen.year} selected-species pollen proxy from ${pollen.hourlyCount} hourly Open-Meteo grid values and ${pollen.dailyCount} daily maxima. Species: ${OPEN_METEO_POLLEN_VARIABLES.map(
        (species) => POLLEN_SPECIES_LABELS[species],
      ).join(", ")}. Monthly mean daily maxima: ${monthlyText}. Returned grid point ${gridText(
        pollen.grid,
      )}.`,
    },
    unit: `days/year and grains/m3, daily maximum of selected species, threshold ${pollen.threshold} grains/m3`,
    notes:
      "Open-Meteo gridded CAMS pollen proxy for the previous complete calendar year. This is not a medical, diagnosis, treatment, allergy-risk, medication, current-forecast, personal-exposure, indoor-air, street-level vegetation, or neighbourhood microclimate claim. Species sensitivity thresholds differ, so the threshold is a comparable screening proxy only.",
  };
}

function familyAmenityTownName(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) family amenity density/)?.[1] ?? "town";
}

export function buildFamilyAmenityDensityRow({
  target,
  rows,
  verifiedDate,
}: {
  target: PlaceTarget;
  rows: MatrixRow[];
  verifiedDate: string;
}): MatrixRow | null {
  const rowByKey = new Map(rows.map((row) => [row.key, row]));
  const componentValues = FAMILY_AMENITY_COMPONENTS.map(([key, label]) => {
    const row = rowByKey.get(key);
    const value = numericCitedValue(row);
    return value === null ? null : { key, label, row, value };
  });
  const greenSpaceRow = rowByKey.get("green_space_pct");
  const greenSpacePct = numericCitedValue(greenSpaceRow);
  if (componentValues.some((item) => item === null) || greenSpacePct === null) {
    return null;
  }

  const components = componentValues as Array<{
    key: string;
    label: string;
    row: MatrixRow;
    value: number;
  }>;
  const totalFeatures = components.reduce((sum, item) => sum + item.value, 0);
  const density = round(totalFeatures / AREA_2KM_KM2);
  const componentText = components.map((item) => `${item.label} ${item.value}`).join(" + ");
  const sourceUrl = components[0]?.row.cited?.sourceUrl ?? "https://www.openstreetmap.org/";

  return {
    key: "family_amenity_density",
    label: "Combined family amenity density",
    matrixCategory: "health_family_schooling",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: `${density} OSM family-service features/km2; mapped green-space share ${greenSpacePct}%.`,
      sourceUrl,
      sourceName: `Derived from cited OpenStreetMap proxy rows, ${target.placeName} family amenity density`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      excerpt: `${target.placeName}: ${componentText} = ${totalFeatures} selected family-service features within 2 km. ${totalFeatures} / ${AREA_2KM_KM2_DISPLAY} km2 = ${density} features/km2; mapped green-space proxy ${greenSpacePct}%. Component source URLs are stored on the component evidence rows.`,
    },
    unit: "OSM family-service features per km2 within 2 km plus mapped green-space share",
    notes:
      "Derived proxy from already cited OSM component rows: playground, nursery, primary school, library, doctor/clinic, and mapped green-space share within 2 km. This is not childcare availability, school quality, admissions, paediatric care, safety, stroller route, park usability, opening-hours, and not family suitability advice.",
  };
}

function numericFamilyAmenityDensity(row: MatrixRow): number | null {
  const value = typeof row.cited?.value === "string" ? row.cited.value : "";
  const match = value.match(/^(\d+(?:\.\d+)?) OSM family-service features\/km2/);
  return match?.[1] ? Number(match[1]) : null;
}

function numericFamilyGreenShare(row: MatrixRow): number | null {
  const value = typeof row.cited?.value === "string" ? row.cited.value : "";
  const match = value.match(/mapped green-space share (\d+(?:\.\d+)?)%/);
  return match?.[1] ? Number(match[1]) : null;
}

export function summarizeRegionalFamilyAmenityRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const densities = rows.flatMap((row) => {
    const value = numericFamilyAmenityDensity(row);
    return value === null ? [] : [value];
  });
  const greenShares = rows.flatMap((row) => {
    const value = numericFamilyGreenShare(row);
    return value === null ? [] : [value];
  });
  if (densities.length !== rows.length || greenShares.length !== rows.length) return null;

  const examples = rows
    .map((row) => `${familyAmenityTownName(row)}: ${row.cited?.value}`)
    .join(" ");

  return {
    key: "family_amenity_density",
    label: "Combined family amenity density",
    matrixCategory: "health_family_schooling",
    intendedGranularity: "town",
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town range for ${regionName}: ${round(Math.min(...densities))}-${round(
        Math.max(...densities),
      )} OSM family-service features/km2; green-space share ${round(
        Math.min(...greenShares),
      )}-${round(Math.max(...greenShares))}%. ${examples}`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `Derived from cited OpenStreetMap family amenity proxy rows for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      excerpt: `${regionName} priority-town family amenity density summary. ${examples} Source URLs are stored on the corresponding component and town evidence rows.`,
    },
    unit: "OSM family-service features per km2 within 2 km plus mapped green-space share",
    notes:
      "Priority-town summary from derived OSM family amenity proxy rows, not an island-wide family-service inventory, childcare availability claim, school-quality measure, park-access guarantee, clinic-access claim, stroller-route measure, or family suitability advice.",
  };
}

export function buildOsmOutdoorRows({
  target,
  metrics,
  endpoint,
  verifiedDate,
}: OsmOutdoorRowInput): MatrixRow[] {
  const query = buildOsmOutdoorOverpassQuery(target);
  const sourceUrl = overpassSourceUrl(endpoint, query);
  const sourceName = `OpenStreetMap contributors via Overpass API, ${target.placeName} outdoor mapped-feature proxy query`;
  const sourceBase = {
    sourceUrl,
    sourceName,
    verifiedDate,
    granularity: "town" as const,
  };
  const zeroNote =
    "For count rows, zero means no matching mapped OSM features were returned by this query, not proof that no real-world feature exists.";

  return [
    {
      key: "hiking_trail_km",
      label: "Hiking trail km nearby",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: metrics.hikingTrailKm,
        ...sourceBase,
        confidence: "medium",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${metrics.hikingWayCount} selected OSM highway=path or highway=track ways within ${OUTDOOR_RADIUS_METRES / 1000} km of ${target.lat}, ${target.lon}, totalling ${metrics.hikingTrailKm} km by geometry length.`,
      },
      unit: `km of selected OSM path/track ways within ${OUTDOOR_RADIUS_METRES / 1000} km`,
      notes:
        "OSM mapped trail-like way length proxy, not a hiking safety, access-rights, waymarking, maintenance, difficulty, weather, rescue, or route-quality claim.",
    },
    {
      key: "mtb_trail_count",
      label: "Mountain-bike routes nearby",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: metrics.mtbTrailCount,
        ...sourceBase,
        confidence: "medium",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${metrics.mtbTrailCount} OSM route=mtb relations within ${OUTDOOR_RADIUS_METRES / 1000} km of ${target.lat}, ${target.lon}.`,
      },
      unit: `OSM route=mtb relations within ${OUTDOOR_RADIUS_METRES / 1000} km`,
      notes: `OSM mapped mountain-bike route proxy, not an access, legality, safety, maintenance, difficulty, rental, operator, or current-trail-condition claim. ${zeroNote}`,
    },
    {
      key: "climbing_sites",
      label: "Rock-climbing sites nearby",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: metrics.climbingSiteCount,
        ...sourceBase,
        confidence: "medium",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${metrics.climbingSiteCount} OSM sport=climbing features within ${OUTDOOR_RADIUS_METRES / 1000} km of ${target.lat}, ${target.lon}.`,
      },
      unit: `OSM sport=climbing features within ${OUTDOOR_RADIUS_METRES / 1000} km`,
      notes: `OSM mapped climbing-feature proxy, not a safety, access-rights, route grade, guidebook, equipment, insurance, rockfall, or current-condition claim. ${zeroNote}`,
    },
    {
      key: "surf_spots",
      label: "Surf spots nearby",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: metrics.surfSpotCount,
        ...sourceBase,
        confidence: "low",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${metrics.surfSpotCount} OSM sport=surfing features within ${OUTDOOR_RADIUS_METRES / 1000} km of ${target.lat}, ${target.lon}.`,
      },
      unit: `OSM sport=surfing features within ${OUTDOOR_RADIUS_METRES / 1000} km`,
      notes: `Low-confidence OSM mapped surf-feature proxy, not a wave-quality, seasonality, water-safety, lifeguard, current, wind, equipment, access, or current-condition claim. ${zeroNote}`,
    },
    {
      key: "ski_piste_km",
      label: "Downhill piste km nearby",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: metrics.skiPisteKm,
        ...sourceBase,
        confidence: "medium",
        category: "connectivity",
        excerpt: `${target.placeName}: Overpass returned ${metrics.skiPisteWayCount} OSM piste:type=downhill ways within ${SKI_RADIUS_METRES / 1000} km of ${target.lat}, ${target.lon}, totalling ${metrics.skiPisteKm} km by geometry length.`,
      },
      unit: `km of OSM piste:type=downhill ways within ${SKI_RADIUS_METRES / 1000} km`,
      notes: `OSM mapped downhill-piste proxy, not a guarantee of operating ski service, snow cover, lift operation, access, piste grooming, safety, or current mountain conditions. ${zeroNote}`,
    },
  ];
}

export function summarizeRegionalOsmAccessRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: MatrixRow[][];
  verifiedDate: string;
}): MatrixRow[] {
  const keys = [
    "walkability_proxy",
    "sidewalk_coverage_proxy",
    "wheelchair_tagged_amenities_share",
    "step_free_station_proxy",
  ];

  return keys.map((key) => {
    const rows = townRows.map((rowsForTown) => {
      const row = rowsForTown.find((candidate) => candidate.key === key);
      if (!row?.cited) throw new Error(`Missing town row for regional ${key}`);
      return row;
    });
    const numericValues = rows.map((row) => Number(row.cited?.value)).filter(Number.isFinite);
    const range =
      numericValues.length > 0
        ? `${round(Math.min(...numericValues))}-${round(Math.max(...numericValues))}`
        : "not available";
    const examples = rows
      .map((row) => {
        const place = row.cited?.sourceName.match(/, (.+?) walkability/)?.[1] ?? "town";
        return `${place}: ${row.cited?.value}`;
      })
      .join("; ");
    const first = rows[0] as MatrixRow;

    return {
      ...first,
      observedGranularity: "region" as const,
      cited: {
        value: `Priority-town range for ${regionName}: ${range}. ${examples}.`,
        sourceUrl: "https://www.openstreetmap.org/",
        sourceName: `OpenStreetMap contributors via per-town Overpass API proxy queries for ${regionName}`,
        verifiedDate,
        confidence: first.cited?.confidence ?? "low",
        granularity: "region" as const,
        category: first.cited?.category,
        excerpt: `${regionName} summary across priority town proxy rows. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
      },
      notes: `${regionName} priority-town summary from the four town proxy rows, not an island-wide measurement, official accessibility audit, route guarantee, or service availability claim.`,
    };
  });
}

export function summarizeRegionalOsmSeasonalServiceDropoffRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const numericValues = rows.map((row) => Number(row.cited?.value)).filter(Number.isFinite);
  if (numericValues.length === 0) return null;
  const examples = rows
    .map((row) => {
      const place = row.cited?.sourceName.match(/, (.+?) seasonal opening-hours/)?.[1] ?? "town";
      return `${place}: ${row.cited?.value}%`;
    })
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value: `Priority-town range for ${regionName}: ${round(Math.min(...numericValues))}-${round(
        Math.max(...numericValues),
      )}% of opening-hours-tagged selected OSM service features had month/date-range or seasonal tags. ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `OpenStreetMap contributors via per-town Overpass API seasonal opening-hours proxy queries for ${regionName}`,
      verifiedDate,
      confidence: "low",
      granularity: "region",
      excerpt: `${regionName} priority-town seasonal-service proxy summary. ${examples}. Source URLs and exact count denominators are stored on the corresponding town evidence rows.`,
    },
    unit: first.unit,
    notes:
      "Priority-town range from low-confidence OSM seasonality-tag proxy rows, not an island-wide winter-vs-summer service-drop-off measure, not proof that services are open or closed, not business-hours guarantees, not a tourism seasonality measure, not resident-service availability, and not advice. Sparse or missing opening_hours tags can understate or distort the signal.",
  };
}

export function summarizeRegionalOsmEmergencyVetProxyRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const numericValues = rows.map((row) => Number(row.cited?.value)).filter(Number.isFinite);
  if (numericValues.length === 0) return null;
  const examples = rows
    .map((row) => {
      const place = row.cited?.sourceName.match(/, (.+?) emergency-veterinary tag/)?.[1] ?? "town";
      return `${place}: ${row.cited?.value}`;
    })
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value: `Priority-town range for ${regionName}: ${round(Math.min(...numericValues))}-${round(
        Math.max(...numericValues),
      )} mapped veterinary features with explicit emergency or 24/7 tags within 10 km. ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `OpenStreetMap contributors via per-town Overpass API emergency-veterinary tag proxy queries for ${regionName}`,
      verifiedDate,
      confidence: "low",
      granularity: "region",
      excerpt: `${regionName} priority-town emergency-veterinary tag proxy summary. ${examples}. Source URLs and exact count denominators are stored on the corresponding town evidence rows.`,
    },
    unit: first.unit,
    notes:
      "Priority-town range from low-confidence OSM emergency-veterinary tag proxy rows, not a complete veterinary directory and not an island-wide emergency-vet registry, after-hours rota, service guarantee, opening-hours guarantee, clinical-quality measure, animal-health advice, or proof that untagged veterinary services do not offer emergency care. Sparse OSM emergency tags can understate or distort the signal.",
  };
}

function placeFromOutdoorRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) outdoor mapped-feature/)?.[1] ?? "town";
}

export function summarizeRegionalOsmOutdoorRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: MatrixRow[][];
  verifiedDate: string;
}): MatrixRow[] {
  const keys = [
    "hiking_trail_km",
    "mtb_trail_count",
    "climbing_sites",
    "surf_spots",
    "ski_piste_km",
  ];

  return keys.map((key) => {
    const rows = townRows.map((rowsForTown) => {
      const row = rowsForTown.find((candidate) => candidate.key === key);
      if (!row?.cited) throw new Error(`Missing town row for regional ${key}`);
      return row;
    });
    const numericValues = rows.map((row) => Number(row.cited?.value)).filter(Number.isFinite);
    const range =
      numericValues.length > 0
        ? `${round(Math.min(...numericValues))}-${round(Math.max(...numericValues))}`
        : "not available";
    const examples = rows
      .map((row) => `${placeFromOutdoorRow(row)}: ${row.cited?.value}`)
      .join("; ");
    const first = rows[0] as MatrixRow;
    const unit = first.unit?.replace(/^km of /, "km of ") ?? "mapped OSM features";
    const rangeUnit =
      key === "hiking_trail_km" || key === "ski_piste_km" ? unit : "mapped OSM features";

    return {
      ...first,
      observedGranularity: "region" as const,
      cited: {
        value: `Priority-town range for ${regionName}: ${range} ${rangeUnit}. ${examples}.`,
        sourceUrl: "https://www.openstreetmap.org/",
        sourceName: `OpenStreetMap contributors via per-town Overpass API outdoor proxy queries for ${regionName}`,
        verifiedDate,
        confidence: first.cited?.confidence ?? "medium",
        granularity: "region" as const,
        category: first.cited?.category,
        excerpt: `${regionName} priority-town outdoor mapped-feature summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
      },
      notes: `${regionName} priority-town summary from town OSM outdoor mapped-feature proxy rows, not an island-wide outdoor inventory, safety guide, access-rights guide, route-quality claim, current-condition report, or service-operation guarantee.`,
    };
  });
}

export function summarizeRegionalRouteRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: MatrixRow[][];
  verifiedDate: string;
}): MatrixRow[] {
  const keys = [
    "nearest_emergency_hospital",
    "emergency_hospital_drive_minutes",
    "ferry_terminal_drive_minutes",
  ];

  return keys.flatMap((key) => {
    const rows = townRows.flatMap((rowsForTown) => {
      const row = rowsForTown.find((candidate) => candidate.key === key);
      return row?.cited ? [row] : [];
    });
    if (rows.length === 0) return [];

    const examples = rows
      .map((row) => {
        const place =
          row.cited?.sourceName.match(/, (.+?) (?:to|emergency|walkability)/)?.[1] ?? "town";
        return `${place}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`;
      })
      .join("; ");
    const minuteValues = rows
      .map((row) => String(row.cited?.value).match(/: (\d+(?:\.\d+)?) minutes/))
      .flatMap((match) => (match?.[1] ? [Number(match[1])] : []));
    const value =
      key === "nearest_emergency_hospital" || minuteValues.length === 0
        ? `Priority-town selections for ${regionName}: ${examples}.`
        : `Priority-town range for ${regionName}: ${round(Math.min(...minuteValues))}-${round(
            Math.max(...minuteValues),
          )} minutes. ${examples}.`;
    const first = rows[0] as MatrixRow;

    return [
      {
        ...first,
        observedGranularity: "region" as const,
        cited: {
          value,
          sourceUrl: "https://www.openstreetmap.org/",
          sourceName: `OpenStreetMap contributors and OSRM route proxies for priority ${regionName} towns`,
          verifiedDate,
          confidence: first.cited?.confidence ?? "low",
          granularity: "region" as const,
          category: first.cited?.category,
          excerpt: `${regionName} priority-town route-feature summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
        },
        notes: `${regionName} priority-town summary from town route-feature proxy rows, not an island-wide official service inventory, access guarantee, timetable, emergency-care, ferry-route, traffic, or care-quality claim.`,
      },
    ];
  });
}

export function summarizeRegionalCitizenServiceCentreDistanceRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map((row) => {
      const place =
        row.cited?.sourceName.match(/, (.+?) to selected (?:mapped )?KEP/)?.[1] ?? "town";
      return `${place}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`;
    })
    .join("; ");
  const minuteValues = rows
    .map((row) => String(row.cited?.value).match(/: (\d+(?:\.\d+)?) minutes/))
    .flatMap((match) => (match?.[1] ? [Number(match[1])] : []));
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value:
        minuteValues.length > 0
          ? `Priority-town range for ${regionName}: ${round(Math.min(...minuteValues))}-${round(
              Math.max(...minuteValues),
            )} minutes to nearest routed mapped KEP or citizen-service feature. ${examples}.`
          : `Priority-town selections for ${regionName}: ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `OpenStreetMap contributors and OSRM mapped KEP route proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: first.cited?.confidence ?? "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town mapped KEP route proxy summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
    },
    notes:
      "Priority-town summary from town OSM/OSRM mapped KEP route proxy rows, not an island-wide official KEP registry, official service-area assignment, appointment availability, opening-hours, processing-time, eligibility, language-access, or legal or administrative advice claim.",
  };
}

export function summarizeRegionalTaxOfficeDistanceRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map((row) => {
      const place =
        row.cited?.sourceName.match(/, (.+?) to selected AADE tax-office/)?.[1] ?? "town";
      return `${place}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`;
    })
    .join("; ");
  const minuteValues = rows
    .map((row) => String(row.cited?.value).match(/: (\d+(?:\.\d+)?) minutes/))
    .flatMap((match) => (match?.[1] ? [Number(match[1])] : []));
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value:
        minuteValues.length > 0
          ? `Priority-town range for ${regionName}: ${round(Math.min(...minuteValues))}-${round(
              Math.max(...minuteValues),
            )} minutes to selected AADE tax-office address route proxies. ${examples}.`
          : `Priority-town selections for ${regionName}: ${examples}.`,
      sourceUrl: AADE_DOU_CRETE_SOURCE_URL,
      sourceName: `AADE tax-office pages and OSRM route proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: first.cited?.confidence ?? "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town AADE tax-office route proxy summary. ${examples}. Town row excerpts store the exact AADE office pages, address evidence, geocoding limitation, and OSRM request URL.`,
    },
    notes:
      "Priority-town summary from AADE office-address evidence plus town OSM/OSRM route proxy rows, not an island-wide official tax-office assignment, jurisdiction map, appointment availability, opening-hours, processing-time, eligibility, tax-residency determination, tax obligation, or tax advice claim.",
  };
}

export function summarizeRegionalResidencePermitOfficeDistanceRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map((row) => {
      const place =
        row.cited?.sourceName.match(/, (.+?) to official Crete residence-permit/)?.[1] ?? "town";
      return `${place}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`;
    })
    .join("; ");
  const minuteValues = rows
    .map((row) => String(row.cited?.value).match(/: (\d+(?:\.\d+)?) minutes/))
    .flatMap((match) => (match?.[1] ? [Number(match[1])] : []));
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value:
        minuteValues.length > 0
          ? `Priority-town range for ${regionName}: ${round(Math.min(...minuteValues))}-${round(
              Math.max(...minuteValues),
            )} minutes to official Crete residence-permit office address route proxies. ${examples}.`
          : `Priority-town selections for ${regionName}: ${examples}.`,
      sourceUrl: CRETE_RESIDENCE_PERMIT_OFFICES_SOURCE_URL,
      sourceName: `Decentralized Administration of Crete residence-permit office page and OSRM route proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: first.cited?.confidence ?? "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town residence-permit office route proxy summary. ${examples}. Town row excerpts store the exact official office page, address and coordinate evidence, geocoding limitation, and OSRM request URL.`,
    },
    notes:
      "Priority-town summary from official Crete residence-permit office-address evidence plus town OSM/OSRM route proxy rows, not an island-wide official residence-office assignment, appointment availability, opening-hours, processing-time, eligibility, visa or residence-route qualification, application outcome, language-access, legal advice, immigration advice, or administrative advice claim.",
  };
}

export function summarizeRegionalLandRegistryOfficeDistanceRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map((row) => {
      const place =
        row.cited?.sourceName.match(/, (.+?) to selected Hellenic Cadastre/)?.[1] ?? "town";
      return `${place}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`;
    })
    .join("; ");
  const minuteValues = rows
    .map((row) => String(row.cited?.value).match(/: (\d+(?:\.\d+)?) minutes/))
    .flatMap((match) => (match?.[1] ? [Number(match[1])] : []));
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value:
        minuteValues.length > 0
          ? `Priority-town range for ${regionName}: ${round(Math.min(...minuteValues))}-${round(
              Math.max(...minuteValues),
            )} minutes to selected Hellenic Cadastre office address route proxies. ${examples}.`
          : `Priority-town selections for ${regionName}: ${examples}.`,
      sourceUrl: HELLENIC_CADASTRE_CHANIA_OFFICES_PDF_URL,
      sourceName: `Hellenic Cadastre office-address sources and OSRM route proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: first.cited?.confidence ?? "medium",
      granularity: "region",
      excerpt: `${regionName} priority-town Hellenic Cadastre office route proxy summary. ${examples}. Town row excerpts store the exact official Cadastre office page or PDF, address evidence, geocoding limitation, and OSRM request URL.`,
    },
    notes:
      "Priority-town summary from Hellenic Cadastre office-address evidence plus town OSM/OSRM route proxy rows, not an island-wide official land-registry assignment, not an official jurisdiction assignment, not a jurisdiction map, service-area assignment, appointment availability, opening-hours, processing-time, title, ownership, property-rights, legal-status, land-registration outcome, property advice, legal advice, or administrative advice claim.",
  };
}

export function summarizeRegionalInternationalSchoolDistanceRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map((row) => {
      const place =
        row.cited?.sourceName.match(/, (.+?) to School of European Education Heraklion/)?.[1] ??
        "town";
      return `${place}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`;
    })
    .join("; ");
  const minuteValues = rows
    .map((row) => String(row.cited?.value).match(/: (\d+(?:\.\d+)?) minutes/))
    .flatMap((match) => (match?.[1] ? [Number(match[1])] : []));
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value:
        minuteValues.length > 0
          ? `Priority-town range for ${regionName}: ${round(Math.min(...minuteValues))}-${round(
              Math.max(...minuteValues),
            )} minutes to the identified European Schools-accredited school in Crete. ${examples}.`
          : `Priority-town selections for ${regionName}: ${examples}.`,
      sourceUrl: EUROPEAN_SCHOOL_HERAKLION_SOURCE_URL,
      sourceName: `European Schools Heraklion accredited-location page and OSRM route proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: first.cited?.confidence ?? "medium",
      granularity: "region",
      excerpt: `${regionName} priority-town accredited European School access proxy summary. ${examples}. Town row excerpts store the exact European Schools source page, school site, address evidence, geocoding limitation, and OSRM request URL.`,
    },
    notes:
      "Priority-town summary from European Schools accreditation/address evidence plus town OSM/OSRM route proxy rows, not an island-wide international-school inventory, admission availability, tuition, curriculum fit, grade placement, special-education provision, school-bus service, commute guarantee, childcare availability, or education advice.",
  };
}

function pharmacyDutyPlaceFromRow(row: MatrixRow): string {
  const value = String(row.cited?.value ?? "");
  return value.match(/verified for (.+?);/)?.[1] ?? "town";
}

export function summarizeRegionalAfterHoursPharmacyProxyRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const examples = rows
    .map((row) => `${pharmacyDutyPlaceFromRow(row)}: ${row.cited?.sourceName}`)
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town duty-pharmacy rota pages verified for ${regionName}: ${examples}.`,
      sourceUrl: CRETE_PHARMACY_DUTY_ROTA_SOURCE_URL,
      sourceName:
        "Federation of Pharmacists' Associations of Crete duty-pharmacy link page and local rota pages",
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: "healthcare",
      excerpt: `${regionName} priority-town source summary. Federation page links to Heraklion, Chania, Rethymno, and Lasithi duty-pharmacy rota surfaces. Town row excerpts store each local rota page verification.`,
    },
    unit: "public duty-pharmacy rota pages verified at source",
    notes:
      "Priority-town summary from public duty-pharmacy rota pages, not an island-wide pharmacy-access guarantee, live opening-hours claim, 24/7 pharmacy-density measure, emergency care, stock, prescription, language, insurance, ambulance, clinical access, or medical advice. Dynamic duty rosters change daily and must be refreshed close to publication.",
  };
}

function placeFromEnvironmentRow(row: MatrixRow): string {
  return (
    row.cited?.sourceName.match(/ for (.+)$/)?.[1] ??
    row.cited?.sourceName.match(/, (.+?) /)?.[1] ??
    "town"
  );
}

function numericCitedValue(row: MatrixRow | undefined): number | null {
  const value = row?.cited?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function placeFromGreenUrbanRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) green urban/)?.[1] ?? "town";
}

export function buildGreenUrbanProxyRow({
  target,
  greenSpaceRow,
  verifiedDate,
}: {
  target: PlaceTarget;
  greenSpaceRow: MatrixRow | null | undefined;
  verifiedDate: string;
}): MatrixRow | null {
  const greenShare = numericCitedValue(greenSpaceRow ?? undefined);
  if (!greenSpaceRow?.cited || greenShare === null) return null;

  return {
    key: "green_urban_pct",
    label: "Green urban space share",
    matrixCategory: "nature_environment",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: greenShare,
      sourceUrl: greenSpaceRow.cited.sourceUrl,
      sourceName: `Derived from cited OpenStreetMap mapped green-space proxy, ${target.placeName} green urban share`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: greenSpaceRow.cited.category,
      excerpt: `${target.placeName}: green_urban_pct uses the already cited green_space_pct OSM mapped green-polygon proxy value of ${greenShare}% within the 2 km representative-town circle. Source row excerpt: ${greenSpaceRow.cited.excerpt ?? greenSpaceRow.cited.value}.`,
    },
    unit: "percent of 2 km circle, OSM mapped green-polygon proxy",
    notes:
      "Derived proxy from the cited OSM green_space_pct row. This is not Copernicus Urban Atlas, not functional urban area coverage, not public-park access, tree canopy, shade, ecological quality, legal open-space inventory, or a guarantee of usable green space.",
  };
}

export function summarizeRegionalGreenUrbanProxyRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const greenShares = rows.flatMap((row) => {
    const value = numericCitedValue(row);
    return value === null ? [] : [value];
  });
  if (greenShares.length !== rows.length) return null;
  const examples = rows
    .map((row) => `${placeFromGreenUrbanRow(row)}: ${row.cited?.value}%`)
    .join("; ");

  return {
    key: "green_urban_pct",
    label: "Green urban space share",
    matrixCategory: "nature_environment",
    intendedGranularity: "town",
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town range for ${regionName}: ${rangeFromValues(greenShares)}% OSM mapped green-polygon proxy. ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `Derived from cited OpenStreetMap mapped green-space proxy rows for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: rows[0]?.cited?.category,
      excerpt: `${regionName} priority-town green urban proxy summary. ${examples}. Source URLs are stored on the corresponding green_space_pct and green_urban_pct town evidence rows.`,
    },
    unit: "percent of 2 km circle, OSM mapped green-polygon proxy",
    notes:
      "Priority-town summary from derived OSM green urban proxy rows, not Copernicus Urban Atlas, not an island-wide urban-green inventory, not functional urban area coverage, public-park access, tree canopy, shade, ecological quality, legal open-space inventory, or a guarantee of usable green space.",
  };
}

function surfaceWaterExamples(metrics: OsmSurfaceWaterMetrics): string {
  if (metrics.retainedExamples.length === 0) return "none retained";
  return metrics.retainedExamples
    .map((example) => `${example.id} ${example.tagSummary || example.name}`)
    .join("; ");
}

function placeFromSurfaceWaterRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) mapped inland-water/)?.[1] ?? "town";
}

export function buildOsmSurfaceWaterDensityRow({
  bundle,
  target,
  metrics,
  sourceUrl,
  verifiedDate,
}: OsmSurfaceWaterRowInput): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "surface_water_density");
  if (!existing) throw new Error(`${bundle.id}: missing surface_water_density row`);
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: metrics.waterSharePct,
      sourceUrl,
      sourceName: `OpenStreetMap contributors via Overpass API, ${target.placeName} mapped inland-water polygon proxy`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "climate",
      excerpt: `${target.placeName}: ${metrics.waterSharePct}% of the 2 km representative-town circle was sampled as retained OSM mapped inland-water polygons. Retained ${metrics.retainedPolygonCount} closed polygons after excluding coastline, sea, bay/ocean/strait/harbour water tags, fountains, swimming-pool tags, and pool-like names. Sampled ${metrics.samplePointCount} points on a ${SURFACE_WATER_SAMPLE_STEP_METRES} m grid; ${metrics.waterSamplePointCount} points intersected retained polygons, approximately ${metrics.waterAreaM2} m2 of ${Math.round(
        Math.PI * SURFACE_WATER_RADIUS_METRES ** 2,
      )} m2. Largest retained examples: ${surfaceWaterExamples(metrics)}.`,
    },
    unit: "percent of 2 km circle, OSM mapped inland-water polygon proxy",
    notes:
      "OSM mapped inland-water polygon proxy used while the preferred JRC Global Surface Water raster build remains unavailable in this environment. This is not JRC Global Surface Water, not a municipal boundary value, not household water-service evidence, not water quality, not drought, not flood risk, not beach access, not parcel suitability, not proof that narrow or unmapped streams are absent, and not legal, utility, health, or safety advice. A zero means no sampled point intersected retained mapped inland-water polygons under this query, not proof that no water feature exists.",
  };
}

export function summarizeRegionalOsmSurfaceWaterDensityRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const values = rows.flatMap((row) => {
    const value = numericCitedValue(row);
    return value === null ? [] : [value];
  });
  if (values.length !== rows.length) return null;
  const examples = rows
    .map((row) => `${placeFromSurfaceWaterRow(row)}: ${row.cited?.value}%`)
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value: `Priority-town range for ${regionName}: ${round(Math.min(...values), 2)}-${round(
        Math.max(...values),
        2,
      )}% OSM mapped inland-water polygon proxy within 2 km circles; unweighted priority-town mean ${round(
        values.reduce((sum, value) => sum + value, 0) / values.length,
        2,
      )}%. ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `OpenStreetMap mapped inland-water polygon proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town OSM mapped inland-water proxy summary. ${examples}. Town row excerpts store exact Overpass query URLs, retained polygon counts, sample-point counts, exclusions, and examples.`,
    },
    notes:
      "Priority-town summary from OSM mapped inland-water polygon proxy rows. This is not a true island-wide Crete water-area share, not JRC Global Surface Water, not a municipal or NUTS boundary value, not household water-service evidence, not water quality, not drought, not flood risk, not beach access, not parcel suitability, not proof that narrow or unmapped streams are absent, and not legal, utility, health, or safety advice.",
  };
}

function placeFromCopernicusHrlRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) (?:forest-cover|tree-canopy) sample/)?.[1] ?? "town";
}

function copernicusHrlSampleExcerpt(
  target: PlaceTarget,
  metrics: CopernicusHrlForestTreeMetrics,
): string {
  const resolutionText = metrics.serviceResolutionMetres
    ? `${metrics.serviceResolutionMetres} m`
    : "service-reported";
  return `${target.placeName}: ${COPERNICUS_HRL_YEAR} Copernicus/EEA HRL samples inside a ${COPERNICUS_HRL_RADIUS_METRES / 1000} km representative-town circle using ${COPERNICUS_HRL_SAMPLE_STEP_METRES} m sample spacing. Sample points requested: ${metrics.samplePointCount}. Tree-cover density valid samples: ${metrics.treeValidSampleCount}; no-data samples excluded: ${metrics.treeNoDataSampleCount}. Forest-type valid samples: ${metrics.forestValidSampleCount}; no-data samples excluded: ${metrics.forestNoDataSampleCount}. Forest-type class counts: non-forest ${metrics.forestClassCounts.nonForest}, broadleaved forest ${metrics.forestClassCounts.broadleaved}, coniferous forest ${metrics.forestClassCounts.coniferous}. Source service resolution reported as ${resolutionText}.`;
}

export function buildCopernicusHrlForestTreeRows({
  bundle,
  target,
  metrics,
  treeCoverSourceUrl,
  forestTypeSourceUrl,
  verifiedDate,
}: CopernicusHrlForestTreeRowInput): MatrixRow[] {
  const forestRow = bundle.rows.find((row) => row.key === "forest_cover_pct");
  const canopyRow = bundle.rows.find((row) => row.key === "tree_canopy_pct");
  if (!forestRow) throw new Error(`${bundle.id}: missing forest_cover_pct row`);
  if (!canopyRow) throw new Error(`${bundle.id}: missing tree_canopy_pct row`);
  const forestBase: MatrixRow = { ...forestRow };
  const canopyBase: MatrixRow = { ...canopyRow };
  delete forestBase.sourceGapReason;
  delete canopyBase.sourceGapReason;
  const commonExcerpt = copernicusHrlSampleExcerpt(target, metrics);

  return [
    {
      ...forestBase,
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: metrics.forestCoverPct,
        sourceUrl: forestTypeSourceUrl,
        sourceName: `Copernicus/EEA High Resolution Layer Forest Type ${COPERNICUS_HRL_YEAR}, ${target.placeName} forest-cover sample`,
        verifiedDate,
        confidence: "medium",
        granularity: "town",
        excerpt: `${commonExcerpt} forest_cover_pct is calculated as broadleaved plus coniferous forest samples divided by valid forest-type samples.`,
      },
      unit: "percent of valid Copernicus HRL Forest Type samples within 2 km circle",
      notes:
        "Copernicus/EEA HRL Forest Type raster sample over a representative 2 km town circle. This is not a municipal forest inventory, legal forest classification, parcel-level land-cover value, public-access claim, shade measure, biodiversity assessment, wildfire-risk score, insurance measure, safety advice, or property advice. No-data pixels are excluded, not counted as zero forest.",
    },
    {
      ...canopyBase,
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: metrics.treeCanopyPct,
        sourceUrl: treeCoverSourceUrl,
        sourceName: `Copernicus/EEA High Resolution Layer Tree Cover Density ${COPERNICUS_HRL_YEAR}, ${target.placeName} tree-canopy sample`,
        verifiedDate,
        confidence: "medium",
        granularity: "town",
        excerpt: `${commonExcerpt} tree_canopy_pct is the mean 0-100 tree-cover-density value across valid tree-cover-density samples.`,
      },
      unit: "mean percent tree-cover density across valid Copernicus HRL samples within 2 km circle",
      notes:
        "Copernicus/EEA HRL Tree Cover Density raster sample over a representative 2 km town circle. This is not a municipal tree inventory, street-shade measure, parcel-level canopy value, public-park access measure, heat exposure score, biodiversity assessment, legal land-cover claim, safety advice, or property advice. No-data pixels are excluded, not counted as zero canopy.",
    },
  ];
}

export function summarizeRegionalCopernicusHrlRows({
  regionName,
  townRows,
  key,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  key: "forest_cover_pct" | "tree_canopy_pct";
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => row?.key === key && Boolean(row.cited));
  if (rows.length === 0) return null;
  const values = rows.flatMap((row) => {
    const value = numericCitedValue(row);
    return value === null ? [] : [value];
  });
  if (values.length !== rows.length) return null;
  const examples = rows
    .map((row) => `${placeFromCopernicusHrlRow(row)}: ${row.cited?.value}%`)
    .join("; ");
  const first = rows[0] as MatrixRow;
  const label =
    key === "forest_cover_pct"
      ? "Copernicus/EEA HRL Forest Type"
      : "Copernicus/EEA HRL Tree Cover Density";
  const method =
    key === "forest_cover_pct" ? "forest-cover samples" : "tree-cover-density mean samples";

  return {
    ...first,
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town range for ${regionName}: ${round(Math.min(...values), 2)}-${round(
        Math.max(...values),
        2,
      )}% ${label} ${COPERNICUS_HRL_YEAR} ${method} within 2 km circles; unweighted priority-town mean ${round(
        values.reduce((sum, value) => sum + value, 0) / values.length,
        2,
      )}%. ${examples}.`,
      sourceUrl:
        key === "forest_cover_pct"
          ? COPERNICUS_HRL_FOREST_TYPE_SOURCE_URL
          : COPERNICUS_HRL_TREE_COVER_SOURCE_URL,
      sourceName: `${label} ${COPERNICUS_HRL_YEAR} priority-town samples for ${regionName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      excerpt: `${regionName} priority-town ${key} summary from ${COPERNICUS_HRL_YEAR} Copernicus/EEA HRL sampled rows. ${examples}. Town row excerpts store sample counts, no-data exclusions, source service, radius, spacing, and class-count or mean method.`,
    },
    notes:
      key === "forest_cover_pct"
        ? "Priority-town summary from Copernicus/EEA HRL Forest Type raster samples, not a true island-wide Crete forest-cover value, municipal forest inventory, legal forest classification, parcel-level land-cover value, wildfire-risk score, public-access claim, safety advice, or property advice."
        : "Priority-town summary from Copernicus/EEA HRL Tree Cover Density raster samples, not a true island-wide Crete tree-canopy value, municipal tree inventory, street-shade measure, parcel-level canopy value, heat exposure score, safety advice, or property advice.",
  };
}

type TiffEndian = "little" | "big";

function readTiffUInt16(buffer: Buffer, offset: number, endian: TiffEndian): number {
  return endian === "little" ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset);
}

function readTiffUInt32(buffer: Buffer, offset: number, endian: TiffEndian): number {
  return endian === "little" ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
}

function readTiffDouble(buffer: Buffer, offset: number, endian: TiffEndian): number {
  return endian === "little" ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset);
}

function tiffTypeSize(type: number): number {
  if (type === 1 || type === 2) return 1;
  if (type === 3) return 2;
  if (type === 4) return 4;
  if (type === 5) return 8;
  if (type === 12) return 8;
  throw new Error(`Unsupported TIFF type ${type}`);
}

function readTiffTagValues({
  buffer,
  valueOffset,
  type,
  count,
  endian,
}: {
  buffer: Buffer;
  valueOffset: number;
  type: number;
  count: number;
  endian: TiffEndian;
}): number[] {
  const byteLength = tiffTypeSize(type) * count;
  const start = byteLength <= 4 ? valueOffset : readTiffUInt32(buffer, valueOffset, endian);
  return Array.from({ length: count }, (_, index) => {
    const offset = start + index * tiffTypeSize(type);
    if (type === 1) return buffer.readUInt8(offset);
    if (type === 2) return buffer.readUInt8(offset);
    if (type === 3) return readTiffUInt16(buffer, offset, endian);
    if (type === 4) return readTiffUInt32(buffer, offset, endian);
    if (type === 5) {
      const numerator = readTiffUInt32(buffer, offset, endian);
      const denominator = readTiffUInt32(buffer, offset + 4, endian);
      return denominator === 0 ? Number.NaN : numerator / denominator;
    }
    if (type === 12) return readTiffDouble(buffer, offset, endian);
    throw new Error(`Unsupported numeric TIFF type ${type}`);
  });
}

export function parseEdoCdiGeoTiff(input: ArrayBuffer | Buffer): EdoCdiGeoTiff {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const byteOrder = buffer.subarray(0, 2).toString("ascii");
  const endian: TiffEndian =
    byteOrder === "II"
      ? "little"
      : byteOrder === "MM"
        ? "big"
        : (() => {
            throw new Error("Invalid TIFF byte order");
          })();
  const magic = readTiffUInt16(buffer, 2, endian);
  if (magic !== 42) throw new Error(`Unsupported TIFF magic ${magic}`);
  const ifdOffset = readTiffUInt32(buffer, 4, endian);
  const entryCount = readTiffUInt16(buffer, ifdOffset, endian);
  const tags = new Map<number, number[]>();

  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = ifdOffset + 2 + index * 12;
    const tag = readTiffUInt16(buffer, entryOffset, endian);
    const type = readTiffUInt16(buffer, entryOffset + 2, endian);
    const count = readTiffUInt32(buffer, entryOffset + 4, endian);
    tags.set(
      tag,
      readTiffTagValues({
        buffer,
        valueOffset: entryOffset + 8,
        type,
        count,
        endian,
      }),
    );
  }

  const width = tags.get(256)?.[0];
  const height = tags.get(257)?.[0];
  const bitsPerSample = tags.get(258)?.[0];
  const compression = tags.get(259)?.[0];
  const samplesPerPixel = tags.get(277)?.[0] ?? 1;
  const stripOffsets = tags.get(273) ?? [];
  const stripByteCounts = tags.get(279) ?? [];
  const pixelScale = tags.get(33550) ?? [];
  const tiepoint = tags.get(33922) ?? [];

  if (!width || !height) throw new Error("EDO CDI GeoTIFF missing width or height");
  if (bitsPerSample !== 8) throw new Error(`EDO CDI GeoTIFF bits per sample is ${bitsPerSample}`);
  if (compression !== 1) throw new Error(`EDO CDI GeoTIFF compression is ${compression}`);
  if (samplesPerPixel !== 1) {
    throw new Error(`EDO CDI GeoTIFF samples per pixel is ${samplesPerPixel}`);
  }
  if (stripOffsets.length === 0 || stripOffsets.length !== stripByteCounts.length) {
    throw new Error("EDO CDI GeoTIFF missing strip offsets or byte counts");
  }
  if (pixelScale.length < 2 || tiepoint.length < 6) {
    throw new Error("EDO CDI GeoTIFF missing georeference tags");
  }

  const values = new Uint8Array(width * height);
  let writeOffset = 0;
  for (let index = 0; index < stripOffsets.length; index += 1) {
    const offset = stripOffsets[index] as number;
    const byteCount = stripByteCounts[index] as number;
    values.set(buffer.subarray(offset, offset + byteCount), writeOffset);
    writeOffset += byteCount;
  }
  if (writeOffset < values.length) {
    throw new Error(`EDO CDI GeoTIFF read ${writeOffset} raster bytes, expected ${values.length}`);
  }

  return {
    width,
    height,
    originLon: tiepoint[3] as number,
    originLat: tiepoint[4] as number,
    pixelWidthDeg: Math.abs(pixelScale[0] as number),
    pixelHeightDeg: Math.abs(pixelScale[1] as number),
    values,
  };
}

export function sampleEdoCdiGeoTiffAtPoint(
  raster: EdoCdiGeoTiff,
  point: Pick<PlaceTarget, "lat" | "lon">,
): { value: number | null; row: number; col: number; lat: number; lon: number } {
  const col = Math.floor((point.lon - raster.originLon) / raster.pixelWidthDeg);
  const row = Math.floor((raster.originLat - point.lat) / raster.pixelHeightDeg);
  if (col < 0 || col >= raster.width || row < 0 || row >= raster.height) {
    return { value: null, row, col, lat: point.lat, lon: point.lon };
  }
  const value = raster.values[row * raster.width + col];
  return {
    value: typeof value === "number" && EDO_CDI_VALID_CLASS_VALUES.has(value) ? value : null,
    row,
    col,
    lat: round(raster.originLat - (row + 0.5) * raster.pixelHeightDeg, 4),
    lon: round(raster.originLon + (col + 0.5) * raster.pixelWidthDeg, 4),
  };
}

function previousEdoCdiTenDayDate(date: Date): Date {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = next.getUTCDate();
  if (day > 21) {
    next.setUTCDate(21);
    return next;
  }
  if (day > 11) {
    next.setUTCDate(11);
    return next;
  }
  if (day > 1) {
    next.setUTCDate(1);
    return next;
  }
  next.setUTCDate(0);
  next.setUTCDate(21);
  return next;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildEdoCdiTenDayDateSeries(
  latestDate: string,
  observationCount: number,
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(latestDate)) {
    throw new Error(`Invalid EDO CDI latest date ${latestDate}`);
  }
  const dates: string[] = [];
  let cursor = new Date(`${latestDate}T00:00:00Z`);
  for (let index = 0; index < observationCount; index += 1) {
    dates.push(isoDate(cursor));
    cursor = previousEdoCdiTenDayDate(cursor);
  }
  return dates.reverse();
}

export function extractEdoCdiLatestDateFromWmsCapabilities(xml: string): string {
  const layerStart = xml.indexOf("<Name>cdiad</Name>");
  if (layerStart === -1) throw new Error("EDO WMS capabilities missing cdiad layer");
  const layerEnd = xml.indexOf("</Layer>", layerStart);
  const layerXml = xml.slice(layerStart, layerEnd === -1 ? undefined : layerEnd);
  const match = layerXml.match(
    /<Dimension\b[^>]*name="time"[^>]*>\s*\d{4}-\d{2}-\d{2}\/(\d{4}-\d{2}-\d{2})\/P10D\s*<\/Dimension>/u,
  );
  if (!match?.[1]) throw new Error("EDO WMS capabilities missing cdiad P10D time extent");
  return match[1];
}

export function buildEdoCdiWcsGeoTiffUrl(date: string): string {
  return `${EDO_CDI_WCS_BASE_URL}?map=DO_WCS&SERVICE=WCS&VERSION=2.0.0&REQUEST=GetCoverage&coverageID=${EDO_CDI_COVERAGE_ID}&CRS=EPSG:4326&format=GEOTIFF&TIME=${date}`;
}

function countEdoCdiClassValues(samples: EdoCdiDroughtFrequencySample[]): EdoCdiDroughtClassCounts {
  const counts: EdoCdiDroughtClassCounts = {
    noDrought: 0,
    watch: 0,
    warning: 0,
    alert: 0,
    recoveryOrOther: 0,
    noData: 0,
  };
  for (const sample of samples) {
    if (sample.value === null) {
      counts.noData += 1;
    } else if (sample.value === 0) {
      counts.noDrought += 1;
    } else if (sample.value === 1) {
      counts.watch += 1;
    } else if (sample.value === 2) {
      counts.warning += 1;
    } else if (sample.value === 3) {
      counts.alert += 1;
    } else {
      counts.recoveryOrOther += 1;
    }
  }
  return counts;
}

export function calculateEdoCdiDroughtFrequencyMetrics({
  target,
  samples,
  sampledGrid,
}: {
  target: PlaceTarget;
  samples: EdoCdiDroughtFrequencySample[];
  sampledGrid: EdoCdiDroughtFrequencyMetrics["sampledGrid"];
}): EdoCdiDroughtFrequencyMetrics {
  const validObservationCount = samples.filter((sample) => sample.value !== null).length;
  const droughtObservationCount = samples.filter(
    (sample) => sample.value !== null && EDO_CDI_DROUGHT_CLASS_VALUES.has(sample.value),
  ).length;
  const dates = samples.map((sample) => sample.date).sort();
  if (dates.length === 0) throw new Error(`${target.id}: no EDO CDI sample dates`);
  return {
    startDate: dates[0] as string,
    endDate: dates[dates.length - 1] as string,
    requestedObservationCount: samples.length,
    validObservationCount,
    droughtObservationCount,
    droughtObservationSharePct:
      validObservationCount > 0
        ? round((droughtObservationCount / validObservationCount) * 100)
        : 0,
    classCounts: countEdoCdiClassValues(samples),
    sampledValues: samples,
    sampledGrid,
  };
}

function edoCdiClassCountText(counts: EdoCdiDroughtClassCounts): string {
  return `no drought ${counts.noDrought}, Watch ${counts.watch}, Warning ${counts.warning}, Alert ${counts.alert}, recovery/other ${counts.recoveryOrOther}, no-data ${counts.noData}`;
}

function edoCdiDroughtSampleText(metrics: EdoCdiDroughtFrequencyMetrics): string {
  return metrics.sampledValues
    .map((sample) => `${sample.date}:${sample.value ?? "no-data"}`)
    .join(", ");
}

export function buildEdoCdiDroughtFrequencyRow({
  bundle,
  target,
  metrics,
  sourceUrl,
  verifiedDate,
}: EdoCdiDroughtFrequencyRowInput): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "drought_frequency_proxy");
  if (!existing) throw new Error(`${bundle.id}: missing drought_frequency_proxy row`);
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: metrics.droughtObservationSharePct,
      sourceUrl,
      sourceName: `${EDO_CDI_SOURCE_NAME}, ${target.placeName} ten-day grid-cell drought-frequency proxy`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "climate",
      excerpt: `${target.placeName}: nearest EDO CDI v4.1 grid cell to representative coordinate ${target.lat}, ${target.lon} was sampled at grid row ${metrics.sampledGrid.row}, column ${metrics.sampledGrid.col}, cell centre ${metrics.sampledGrid.lat}, ${metrics.sampledGrid.lon}. ${metrics.droughtObservationCount} of ${metrics.validObservationCount} valid ten-day observations from ${metrics.startDate} to ${metrics.endDate} were primary drought classes Watch, Warning, or Alert, equal to ${metrics.droughtObservationSharePct}%. Class counts: ${edoCdiClassCountText(metrics.classCounts)}. Requested ${metrics.requestedObservationCount} WCS GeoTIFF observations from ${EDO_CDI_WCS_BASE_URL}; layer time extent read from ${EDO_CDI_WMS_CAPABILITIES_URL}; CDI class definitions checked against ${EDO_CDI_FACTSHEET_URL}. Sampled class series: ${edoCdiDroughtSampleText(metrics)}.`,
    },
    unit: "percent of valid EDO CDI ten-day observations with Watch, Warning, or Alert",
    notes:
      "European Drought Observatory CDI v4.1 nearest-grid-cell proxy for agricultural drought-screening frequency. This is not a municipal drought declaration, not household water-service evidence, not a current restriction or outage status, not water-quality evidence, not a utility-capacity assessment, not a farm, garden, fire, flood, property, insurance, safety, legal, utility, health, or personal advice claim. Recovery classes and no-data cells are not counted as active primary drought classes.",
  };
}

function placeFromEdoCdiDroughtRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) ten-day grid-cell/)?.[1] ?? "town";
}

export function summarizeRegionalEdoCdiDroughtFrequencyRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const values = rows.flatMap((row) => {
    const value = numericCitedValue(row);
    return value === null ? [] : [value];
  });
  if (values.length !== rows.length) return null;
  const examples = rows
    .map((row) => `${placeFromEdoCdiDroughtRow(row)}: ${row.cited?.value}%`)
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town EDO CDI drought-frequency proxy range for ${regionName}: ${round(
        Math.min(...values),
      )}-${round(Math.max(...values))}% of valid ten-day observations in Watch, Warning, or Alert; unweighted priority-town mean ${round(
        values.reduce((sum, value) => sum + value, 0) / values.length,
      )}%. ${examples}.`,
      sourceUrl: EDO_CDI_DATASET_URL,
      sourceName: `${EDO_CDI_SOURCE_NAME} priority-town drought-frequency proxies for ${regionName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: "climate",
      excerpt: `${regionName} priority-town EDO CDI v4.1 drought-frequency proxy summary. ${examples}. Town row excerpts store the exact date range, requested observation count, class counts, sampled grid cell, and WCS GeoTIFF request source.`,
    },
    notes:
      "Priority-town summary from EDO CDI v4.1 nearest-grid-cell drought-frequency proxy rows. This is not a true island-wide Crete drought frequency, not a municipal drought declaration, not household water-service evidence, not a current restriction or outage status, not water-quality evidence, not utility-capacity assessment, not farm, garden, fire, flood, property, insurance, safety, legal, utility, health, or personal advice.",
  };
}

function requireFiniteRasterNumber(value: number | undefined, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`VIIRS nightlights raster missing finite ${label}`);
  }
  return value;
}

function clampRasterIndex(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lightPollutionWindowBounds({
  target,
  image,
  radiusMetres,
}: {
  target: Pick<PlaceTarget, "lat" | "lon">;
  image: GeoTIFFImage;
  radiusMetres: number;
}) {
  const origin = image.getOrigin();
  const resolution = image.getResolution();
  const originLon = requireFiniteRasterNumber(origin[0], "origin longitude");
  const originLat = requireFiniteRasterNumber(origin[1], "origin latitude");
  const pixelWidthDeg = Math.abs(requireFiniteRasterNumber(resolution[0], "longitude resolution"));
  const pixelHeightDeg = Math.abs(requireFiniteRasterNumber(resolution[1], "latitude resolution"));
  const rasterWidth = image.getWidth();
  const rasterHeight = image.getHeight();
  const radiusLatDeg = radiusMetres / 111_320;
  const lonCosine = Math.max(0.1, Math.cos((target.lat * Math.PI) / 180));
  const radiusLonDeg = radiusMetres / (111_320 * lonCosine);
  const minLon = target.lon - radiusLonDeg;
  const maxLon = target.lon + radiusLonDeg;
  const minLat = target.lat - radiusLatDeg;
  const maxLat = target.lat + radiusLatDeg;
  const windowLeft = clampRasterIndex(
    Math.floor((minLon - originLon) / pixelWidthDeg),
    0,
    rasterWidth,
  );
  const windowRight = clampRasterIndex(
    Math.ceil((maxLon - originLon) / pixelWidthDeg) + 1,
    0,
    rasterWidth,
  );
  const windowTop = clampRasterIndex(
    Math.floor((originLat - maxLat) / pixelHeightDeg),
    0,
    rasterHeight,
  );
  const windowBottom = clampRasterIndex(
    Math.ceil((originLat - minLat) / pixelHeightDeg) + 1,
    0,
    rasterHeight,
  );

  if (windowRight <= windowLeft || windowBottom <= windowTop) {
    throw new Error(
      `VIIRS nightlights raster window outside coverage for ${target.lat}, ${target.lon}`,
    );
  }

  return {
    rasterWidth,
    rasterHeight,
    originLon,
    originLat,
    pixelWidthDeg,
    pixelHeightDeg,
    windowLeft,
    windowTop,
    windowRight,
    windowBottom,
  };
}

export async function readViirsLightPollutionRasterWindow({
  image,
  target,
  radiusMetres = VIIRS_NIGHTLIGHTS_SAMPLE_RADIUS_METRES,
}: {
  image: GeoTIFFImage;
  target: Pick<PlaceTarget, "lat" | "lon">;
  radiusMetres?: number;
}): Promise<ViirsLightPollutionRasterWindow> {
  const bounds = lightPollutionWindowBounds({ target, image, radiusMetres });
  const values = await image.readRasters({
    window: [bounds.windowLeft, bounds.windowTop, bounds.windowRight, bounds.windowBottom],
    interleave: true,
  });
  return {
    rasterWidth: bounds.rasterWidth,
    rasterHeight: bounds.rasterHeight,
    windowWidth: bounds.windowRight - bounds.windowLeft,
    windowHeight: bounds.windowBottom - bounds.windowTop,
    originLon: bounds.originLon,
    originLat: bounds.originLat,
    pixelWidthDeg: bounds.pixelWidthDeg,
    pixelHeightDeg: bounds.pixelHeightDeg,
    windowLeft: bounds.windowLeft,
    windowTop: bounds.windowTop,
    values,
    noDataValue: image.getGDALNoData() ?? -32768,
  };
}

export function calculateViirsLightPollutionMetricsFromRasterWindow({
  target,
  raster,
  sampleRadiusMetres = VIIRS_NIGHTLIGHTS_SAMPLE_RADIUS_METRES,
  sourceScale = VIIRS_NIGHTLIGHTS_SOURCE_SCALE,
}: {
  target: PlaceTarget;
  raster: ViirsLightPollutionRasterWindow;
  sampleRadiusMetres?: number;
  sourceScale?: number;
}): ViirsLightPollutionMetrics {
  const rawValues: number[] = [];
  let noDataSampleCount = 0;
  let zeroSampleCount = 0;

  for (let localRow = 0; localRow < raster.windowHeight; localRow += 1) {
    for (let localCol = 0; localCol < raster.windowWidth; localCol += 1) {
      const col = raster.windowLeft + localCol;
      const row = raster.windowTop + localRow;
      const lon = raster.originLon + (col + 0.5) * raster.pixelWidthDeg;
      const lat = raster.originLat - (row + 0.5) * raster.pixelHeightDeg;
      if (pointDistanceMetres(target, { lat, lon }) > sampleRadiusMetres) continue;
      const value = raster.values[localRow * raster.windowWidth + localCol];
      if (typeof value !== "number" || !Number.isFinite(value) || value === raster.noDataValue) {
        noDataSampleCount += 1;
        continue;
      }
      if (value === 0) zeroSampleCount += 1;
      rawValues.push(value);
    }
  }

  if (rawValues.length === 0) {
    throw new Error(`${target.id}: VIIRS nightlights sample produced no valid raster values`);
  }

  const rawMean = rawValues.reduce((sum, value) => sum + value, 0) / rawValues.length;
  const rawP50 = percentile(rawValues, 0.5);
  const rawP90 = percentile(rawValues, 0.9);
  const radianceMean = rawMean / sourceScale;

  return {
    sourceYear: VIIRS_NIGHTLIGHTS_SOURCE_YEAR,
    sourceVersion: VIIRS_NIGHTLIGHTS_SOURCE_VERSION,
    sourceFile: VIIRS_NIGHTLIGHTS_2024_FILE,
    sourceChecksumMd5: VIIRS_NIGHTLIGHTS_2024_MD5,
    sourceSizeBytes: VIIRS_NIGHTLIGHTS_2024_SIZE_BYTES,
    sourceScale,
    rasterWidth: raster.rasterWidth,
    rasterHeight: raster.rasterHeight,
    pixelWidthDeg: raster.pixelWidthDeg,
    pixelHeightDeg: raster.pixelHeightDeg,
    windowLeft: raster.windowLeft,
    windowTop: raster.windowTop,
    windowRight: raster.windowLeft + raster.windowWidth,
    windowBottom: raster.windowTop + raster.windowHeight,
    sampleRadiusMetres,
    validSampleCount: rawValues.length,
    noDataSampleCount,
    zeroSampleCount,
    rawMean: round(rawMean, 2),
    rawMin: Math.min(...rawValues),
    rawMax: Math.max(...rawValues),
    rawP50,
    rawP90,
    radianceMean: round(radianceMean, 2),
    radianceP50: round(rawP50 / sourceScale, 2),
    radianceP90: round(rawP90 / sourceScale, 2),
  };
}

async function fetchViirsLightPollutionMetricsForTargets(
  targets: PlaceTarget[],
): Promise<Map<string, ViirsLightPollutionMetrics>> {
  const tiff = await fromUrl(VIIRS_NIGHTLIGHTS_2024_COG_URL);
  const image = await tiff.getImage();
  const entries: Array<[string, ViirsLightPollutionMetrics]> = [];
  for (const target of targets) {
    const raster = await readViirsLightPollutionRasterWindow({ image, target });
    entries.push([
      target.id,
      calculateViirsLightPollutionMetricsFromRasterWindow({ target, raster }),
    ]);
  }
  return new Map(entries);
}

function lightPollutionPlaceFromRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) nighttime-radiance sample/)?.[1] ?? "town";
}

export function buildViirsLightPollutionRow({
  bundle,
  target,
  metrics,
  sourceUrl,
  verifiedDate,
}: ViirsLightPollutionRowInput): MatrixRow {
  const existing = bundle.rows.find((row) => row.key === "light_pollution");
  if (!existing) throw new Error(`${bundle.id}: missing light_pollution row`);
  const base: MatrixRow = { ...existing };
  delete base.sourceGapReason;

  return {
    ...base,
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: metrics.radianceMean,
      sourceUrl,
      sourceName: `OpenGeoHub Zenodo annual VIIRS nighttime lights ${metrics.sourceYear} COG, ${target.placeName} nighttime-radiance sample`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "climate",
      excerpt: `${target.placeName}: sampled ${metrics.sourceFile} within a ${metrics.sampleRadiusMetres / 1000} km representative-town circle around ${target.lat}, ${target.lon}. The Zenodo source states original Annual VNL V2 values were converted from 0-200 to 0-2000 scale; this adapter reports raw/source-scale ${metrics.sourceScale} as a NOAA-like average DNB radiance proxy in nW/sr/cm2. Valid samples ${metrics.validSampleCount}; no-data samples ${metrics.noDataSampleCount}; zero samples ${metrics.zeroSampleCount}; raw mean ${metrics.rawMean}, raw min ${metrics.rawMin}, raw max ${metrics.rawMax}, raw p50 ${metrics.rawP50}, raw p90 ${metrics.rawP90}; reported mean ${metrics.radianceMean}, p50 ${metrics.radianceP50}, p90 ${metrics.radianceP90}. Raster ${metrics.rasterWidth}x${metrics.rasterHeight}, pixel resolution ${round(metrics.pixelWidthDeg, 6)} by ${round(metrics.pixelHeightDeg, 6)} degrees, read window [${metrics.windowLeft}, ${metrics.windowTop}, ${metrics.windowRight}, ${metrics.windowBottom}], file md5 ${metrics.sourceChecksumMd5}, file size ${metrics.sourceSizeBytes} bytes, source version ${metrics.sourceVersion}.`,
    },
    unit: "mean 2024 VIIRS annual average DNB radiance proxy, nW/sr/cm2, 2 km circle",
    notes:
      "Medium-confidence VIIRS nighttime-radiance proxy from the 2024 OpenGeoHub/Zenodo COG derived from NOAA/EOG Annual VNL V2.2. This is not Bortle class, not a stargazing guarantee, not a skyglow model, not visible-stars evidence, not street-light coverage, not safety, health, parcel, property, legal, or personal advice, and not a neighborhood value. Background filtering and 500 m pixels can understate or overstate lived night-light exposure.",
  };
}

export function summarizeRegionalViirsLightPollutionRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const values = rows.flatMap((row) => {
    const value = numericCitedValue(row);
    return value === null ? [] : [value];
  });
  if (values.length !== rows.length) return null;
  const examples = rows
    .map((row) => `${lightPollutionPlaceFromRow(row)}: ${row.cited?.value}`)
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town VIIRS nighttime-radiance proxy range for ${regionName}: ${round(
        Math.min(...values),
        2,
      )}-${round(Math.max(...values), 2)} nW/sr/cm2; unweighted priority-town mean ${round(
        values.reduce((sum, value) => sum + value, 0) / values.length,
        2,
      )} nW/sr/cm2. ${examples}.`,
      sourceUrl: VIIRS_NIGHTLIGHTS_ZENODO_RECORD_URL,
      sourceName: `OpenGeoHub Zenodo annual VIIRS nighttime lights ${VIIRS_NIGHTLIGHTS_SOURCE_YEAR} priority-town samples for ${regionName}`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: "climate",
      excerpt: `${regionName} priority-town summary from ${VIIRS_NIGHTLIGHTS_2024_FILE}. ${examples}. Town row excerpts store sample counts, no-data counts, source-scale conversion, raster window, checksum, and caveats.`,
    },
    notes:
      "Priority-town summary from VIIRS nighttime-radiance proxy rows, not a true island-wide Crete light-pollution mean, not Bortle class, not a stargazing guarantee, not a skyglow model, not visible-stars evidence, not street-light coverage, not safety, health, parcel, property, legal, or personal advice.",
  };
}

function placeFromSceneryTagsRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/proxy rows, (.+?) scenery tags/)?.[1] ?? "town";
}

function nearbyBathingWaterSiteCount(row: MatrixRow | undefined): number | null {
  return numberFromPattern(row?.cited?.value, /(\d+) EEA monitored bathing-water sites/i);
}

function buildSceneryTagList({
  coastKm,
  mountainKm,
  greenShare,
  protectedAreaKm,
  bathingWaterSites,
}: {
  coastKm: number;
  mountainKm: number;
  greenShare: number;
  protectedAreaKm: number;
  bathingWaterSites: number;
}): string[] {
  const tags: string[] = [];
  if (coastKm <= 2) tags.push("coastal");
  if (mountainKm <= 30) tags.push("mountain-proximate");
  if (greenShare > 0) tags.push("mapped green-space present");
  if (protectedAreaKm <= 25) tags.push("protected-area-proximate");
  if (bathingWaterSites > 0) tags.push("monitored bathing-water nearby");
  return tags;
}

export function buildSceneryTagsRow({
  target,
  rows,
  verifiedDate,
}: {
  target: PlaceTarget;
  rows: MatrixRow[];
  verifiedDate: string;
}): MatrixRow | null {
  const rowByKey = new Map(rows.map((row) => [row.key, row]));
  const coastRow = rowByKey.get("dist_coast_km");
  const mountainRow = rowByKey.get("mountain_proximity");
  const greenSpaceRow = rowByKey.get("green_space_pct");
  const protectedAreaRow = rowByKey.get("nat_park_dist_km");
  const bathingWaterRow = rowByKey.get("bathing_water_quality");
  const coastKm = numericCitedValue(coastRow);
  const mountainKm = mountainRow ? mountainDistanceFromRow(mountainRow) : null;
  const greenShare = numericCitedValue(greenSpaceRow);
  const protectedAreaKm = protectedAreaRow
    ? protectedAreaDistanceFromDistanceRow(protectedAreaRow)
    : null;
  const bathingWaterSites = nearbyBathingWaterSiteCount(bathingWaterRow);

  if (
    !coastRow?.cited ||
    !mountainRow?.cited ||
    !greenSpaceRow?.cited ||
    !protectedAreaRow?.cited ||
    !bathingWaterRow?.cited ||
    coastKm === null ||
    mountainKm === null ||
    greenShare === null ||
    protectedAreaKm === null ||
    bathingWaterSites === null
  ) {
    return null;
  }

  const tags = buildSceneryTagList({
    coastKm,
    mountainKm,
    greenShare,
    protectedAreaKm,
    bathingWaterSites,
  });
  if (tags.length === 0) return null;

  return {
    key: "scenery_tags",
    label: "Coast/mountain/forest/lake/plain present",
    matrixCategory: "nature_environment",
    intendedGranularity: "town",
    observedGranularity: "town",
    coverageStatus: "proxy",
    cited: {
      value: tags.join("; "),
      sourceUrl: coastRow.cited.sourceUrl,
      sourceName: `Derived from cited OSM, EEA, and Open-Meteo proxy rows, ${target.placeName} scenery tags`,
      verifiedDate,
      confidence: "medium",
      granularity: "town",
      category: "climate",
      excerpt: `${target.placeName}: derived scenery tags from cited component rows. Coast ${coastKm} km; nearest mapped peak >=${MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES}m ${mountainKm} km; mapped green-space proxy ${greenShare}%; nearest mapped protected-area or nature-reserve feature ${protectedAreaKm} km; monitored EEA bathing-water sites within 10 km ${bathingWaterSites}. Component source URLs are stored on the component evidence rows.`,
    },
    unit: "derived tags from cited component rows",
    notes:
      "Derived proxy from cited coast-distance, mapped-peak proximity, mapped green-space, protected-area distance, and bathing-water rows. This is not a subjective beauty score, forest-cover value, lake or plain classification, official tourism category, route/safety/accessibility claim, or site-specific environmental assessment.",
  };
}

export function summarizeRegionalSceneryTagsRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const tagSet = new Set<string>();
  for (const row of rows) {
    for (const tag of String(row.cited?.value ?? "").split("; ")) {
      if (tag) tagSet.add(tag);
    }
  }
  if (tagSet.size === 0) return null;
  const examples = rows
    .map((row) => `${placeFromSceneryTagsRow(row)}: ${row.cited?.value}`)
    .join("; ");

  return {
    key: "scenery_tags",
    label: "Coast/mountain/forest/lake/plain present",
    matrixCategory: "nature_environment",
    intendedGranularity: "town",
    observedGranularity: "region",
    coverageStatus: "proxy",
    cited: {
      value: `Priority-town scenery tags for ${regionName}: ${[...tagSet].join("; ")}. ${examples}.`,
      sourceUrl: "https://www.openstreetmap.org/",
      sourceName: `Derived scenery-tag proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: rows[0]?.cited?.category,
      excerpt: `${regionName} priority-town scenery-tag summary. ${examples}. Source URLs are stored on the corresponding component and town evidence rows.`,
    },
    unit: "derived tags from cited component rows",
    notes:
      "Priority-town summary from derived scenery-tag proxy rows, not an island-wide forest-cover value, lake or plain classification, official tourism category, subjective beauty score, route/safety/accessibility claim, or site-specific environmental assessment.",
  };
}

function numericValuesFromText(value: unknown): number[] {
  if (typeof value !== "string") return [];
  return [...value.matchAll(/(?:^| )(-?\d+(?:\.\d+)?)(?=;|$)/g)].map((match) => Number(match[1]));
}

export function summarizeRegionalOpenMeteoEnvironmentRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: MatrixRow[][];
  verifiedDate: string;
}): MatrixRow[] {
  const keys = ["pm25_monthly", "pm25_exceedance_days", "snowfall_days"];

  return keys.flatMap((key) => {
    const rows = townRows.flatMap((rowsForTown) => {
      const row = rowsForTown.find((candidate) => candidate.key === key);
      return row?.cited ? [row] : [];
    });
    if (rows.length === 0) return [];

    const first = rows[0] as MatrixRow;
    const examples = rows
      .map((row) => `${placeFromEnvironmentRow(row)}: ${row.cited?.value}`)
      .join("; ");
    const numericValues =
      key === "pm25_monthly"
        ? rows.flatMap((row) => numericValuesFromText(row.cited?.value))
        : rows.flatMap((row) => {
            const value = numericCitedValue(row);
            return value === null ? [] : [value];
          });
    const range =
      numericValues.length > 0
        ? `${round(Math.min(...numericValues))}-${round(Math.max(...numericValues))}`
        : "not available";
    const value =
      key === "pm25_monthly"
        ? `Priority-town monthly PM2.5 range for ${regionName}: ${range} micrograms per cubic metre. ${examples}.`
        : `Priority-town range for ${regionName}: ${range} ${first.unit ?? "value"}. ${examples}.`;

    return [
      {
        ...first,
        observedGranularity: "region" as const,
        cited: {
          value,
          sourceUrl: "https://open-meteo.com/",
          sourceName: `Open-Meteo gridded environment proxies for priority ${regionName} towns`,
          verifiedDate,
          confidence: first.cited?.confidence ?? "medium",
          granularity: "region" as const,
          category: first.cited?.category,
          excerpt: `${regionName} priority-town Open-Meteo environment summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
        },
        notes: `${regionName} priority-town summary from town Open-Meteo grid proxy rows, not an island-wide raster average, regulatory monitoring-station observation, current-weather report, health advice, road-safety claim, or parcel-level condition.`,
      },
    ];
  });
}

export function summarizeRegionalOpenMeteoUvIndexRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const numericValues = rows.flatMap((row) => numericValuesFromText(row.cited?.value));
  const range =
    numericValues.length > 0
      ? `${round(Math.min(...numericValues))}-${round(Math.max(...numericValues))}`
      : "not available";
  const examples = rows
    .map((row) => `${placeFromEnvironmentRow(row)}: ${row.cited?.value}`)
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value: `Priority-town monthly UV-index proxy range for ${regionName}: ${range}. ${examples}.`,
      sourceUrl: "https://open-meteo.com/en/docs/air-quality-api",
      sourceName: `Open-Meteo gridded UV-index proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town Open-Meteo UV-index proxy summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
    },
    notes:
      "Priority-town summary from town Open-Meteo UV-index proxy rows, not an island-wide UV raster average, TEMIS UV climatology, current forecast, medical advice, personal exposure measure, beach-safety claim, sunburn-risk advice, or microclimate guarantee.",
  };
}

function pollenDaysFromValue(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.match(/: (\d+) days with selected pollen species/);
  return match?.[1] ? Number(match[1]) : null;
}

export function summarizeRegionalOpenMeteoPollenSeverityRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: Array<MatrixRow | null | undefined>;
  verifiedDate: string;
}): MatrixRow | null {
  const rows = townRows.filter((row): row is MatrixRow => Boolean(row?.cited));
  if (rows.length === 0) return null;
  const dayCounts = rows.flatMap((row) => {
    const value = pollenDaysFromValue(row.cited?.value);
    return value === null ? [] : [value];
  });
  if (dayCounts.length !== rows.length) return null;
  const examples = rows
    .map(
      (row) =>
        `${placeFromEnvironmentRow(row)}: ${trimTerminalPunctuation(
          String(row.cited?.value ?? ""),
        )}`,
    )
    .join("; ");
  const first = rows[0] as MatrixRow;

  return {
    ...first,
    observedGranularity: "region",
    cited: {
      value: `Priority-town pollen-severity proxy range for ${regionName}: ${Math.min(
        ...dayCounts,
      )}-${Math.max(...dayCounts)} days at or above ${POLLEN_THRESHOLD_GRAINS_M3} grains/m3. ${examples}.`,
      sourceUrl: "https://open-meteo.com/en/docs/air-quality-api",
      sourceName: `Open-Meteo gridded CAMS pollen proxies for priority ${regionName} towns`,
      verifiedDate,
      confidence: "medium",
      granularity: "region",
      category: first.cited?.category,
      excerpt: `${regionName} priority-town Open-Meteo CAMS pollen proxy summary. ${examples}. Source URLs and grid points are stored on the corresponding town evidence rows.`,
    },
    notes:
      "Priority-town summary from town Open-Meteo CAMS pollen grid proxy rows, not an island-wide pollen raster average, not medical advice, diagnosis, treatment, allergy-risk score, current forecast, personal-exposure estimate, indoor-air measure, street-level vegetation measure, or neighbourhood microclimate guarantee. Species sensitivity thresholds differ, so the threshold is a comparable screening proxy only.",
  };
}

export function buildTerrainSlopeRows({
  target,
  metrics,
  overpassSourceUrl,
  elevationSourceUrls,
  verifiedDate,
}: TerrainSlopeRowsInput): MatrixRow[] {
  const elevationSourceText =
    elevationSourceUrls.length > 0
      ? `Open-Meteo elevation request URLs used: ${elevationSourceUrls.join(" ")}`
      : "Open-Meteo elevation request URL was not available.";
  const sourceName = `OpenStreetMap contributors via Overpass API and Open-Meteo Elevation API, ${target.placeName} terrain slope proxy`;
  const sourceBase = {
    sourceUrl: overpassSourceUrl,
    sourceName,
    verifiedDate,
    confidence: "medium" as const,
    granularity: "town" as const,
    category: "connectivity" as const,
  };
  const excerptBase = `${target.placeName}: ${metrics.sampledSegmentCount} sampled street/footway segments from ${metrics.sourceWayCount} OSM ways within ${TERRAIN_SLOPE_RADIUS_METRES / 1000} km of ${target.lat}, ${target.lon}; source graph had ${metrics.sourceSegmentCount} eligible segments before deterministic sampling and ${metrics.stepWayCount} OSM highway=steps ways. ${elevationSourceText}`;

  return [
    {
      key: "slope_proxy",
      label: "Street-network slope proxy",
      matrixCategory: "nature_environment",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: `Mean absolute street-segment grade ${metrics.meanAbsGradePct}%; p90 ${metrics.p90AbsGradePct}%; ${metrics.shareOver5Pct}% over 5%.`,
        ...sourceBase,
        excerpt: `${excerptBase} Mean absolute grade ${metrics.meanAbsGradePct}%; p90 ${metrics.p90AbsGradePct}%; share over 5% grade ${metrics.shareOver5Pct}%; share over 8% grade ${metrics.shareOver8Pct}%.`,
      },
      unit: "percent grade over sampled OSM street/footway graph within 2 km",
      notes:
        "DEM and OSM street-network proxy using Open-Meteo elevation samples and mapped OSM ways. This is not a parcel, flood, mobility, or accessibility assessment, and not a route-quality or neighbourhood guarantee.",
    },
    {
      key: "stroller_hilliness_proxy",
      label: "Stroller hilliness proxy",
      matrixCategory: "health_family_schooling",
      intendedGranularity: "town",
      observedGranularity: "town",
      coverageStatus: "proxy",
      cited: {
        value: `${metrics.shareOver5Pct}% of sampled street/footway segments over 5% grade; ${metrics.shareOver8Pct}% over 8%; p90 ${metrics.p90AbsGradePct}%.`,
        ...sourceBase,
        excerpt: `${excerptBase} Stroller hilliness proxy uses slope thresholds only: share over 5% grade ${metrics.shareOver5Pct}%; share over 8% grade ${metrics.shareOver8Pct}%; p90 grade ${metrics.p90AbsGradePct}%.`,
      },
      unit: "share of sampled OSM street/footway segments over grade thresholds within 2 km",
      notes:
        "Hilliness proxy from DEM samples over the OSM street/footway graph. This is not accessibility advice for a specific route, stroller suitability advice, sidewalk quality, kerb, surface, traffic, heat, safety, or step-free access evidence.",
    },
  ];
}

function placeFromTerrainRow(row: MatrixRow): string {
  return row.cited?.sourceName.match(/, (.+?) terrain slope proxy/)?.[1] ?? "town";
}

function numberFromPattern(value: unknown, pattern: RegExp): number | null {
  if (typeof value !== "string") return null;
  const match = value.match(pattern);
  return match?.[1] ? Number(match[1]) : null;
}

function rangeFromValues(values: number[]): string {
  if (values.length === 0) return "not available";
  return `${round(Math.min(...values))}-${round(Math.max(...values))}`;
}

export function summarizeRegionalTerrainSlopeRows({
  regionName,
  townRows,
  verifiedDate,
}: {
  regionName: string;
  townRows: MatrixRow[][];
  verifiedDate: string;
}): MatrixRow[] {
  const keys = ["slope_proxy", "stroller_hilliness_proxy"];

  return keys.flatMap((key) => {
    const rows = townRows.flatMap((rowsForTown) => {
      const row = rowsForTown.find((candidate) => candidate.key === key);
      return row?.cited ? [row] : [];
    });
    if (rows.length === 0) return [];

    const examples = rows
      .map(
        (row) =>
          `${placeFromTerrainRow(row)}: ${trimTerminalPunctuation(String(row.cited?.value ?? ""))}`,
      )
      .join("; ");
    const p90Values = rows.flatMap((row) => {
      const value = numberFromPattern(row.cited?.value, /p90 (\d+(?:\.\d+)?)%/);
      return value === null ? [] : [value];
    });
    const over5Values = rows.flatMap((row) => {
      const value =
        key === "slope_proxy"
          ? numberFromPattern(row.cited?.value, /; (\d+(?:\.\d+)?)% over 5%/)
          : numberFromPattern(row.cited?.value, /^(\d+(?:\.\d+)?)% of sampled/);
      return value === null ? [] : [value];
    });
    const first = rows[0] as MatrixRow;
    const value =
      key === "slope_proxy"
        ? `Priority-town terrain slope proxy for ${regionName}: mean grade range ${rangeFromValues(
            rows.flatMap((row) => {
              const value = numberFromPattern(
                row.cited?.value,
                /Mean absolute street-segment grade (\d+(?:\.\d+)?)%/,
              );
              return value === null ? [] : [value];
            }),
          )}%; p90 range ${rangeFromValues(p90Values)}%; over-5% segment share range ${rangeFromValues(
            over5Values,
          )}%. ${examples}.`
        : `Priority-town stroller hilliness proxy for ${regionName}: over-5% segment share range ${rangeFromValues(
            over5Values,
          )}%; over-8% segment share range ${rangeFromValues(
            rows.flatMap((row) => {
              const value = numberFromPattern(row.cited?.value, /; (\d+(?:\.\d+)?)% over 8%/);
              return value === null ? [] : [value];
            }),
          )}%; p90 grade range ${rangeFromValues(p90Values)}%. ${examples}.`;

    return [
      {
        ...first,
        observedGranularity: "region" as const,
        cited: {
          value,
          sourceUrl: "https://open-meteo.com/en/docs/elevation-api",
          sourceName: `OpenStreetMap street graph and Open-Meteo elevation terrain proxies for priority ${regionName} towns`,
          verifiedDate,
          confidence: first.cited?.confidence ?? "medium",
          granularity: "region" as const,
          category: first.cited?.category,
          excerpt: `${regionName} priority-town DEM and OSM terrain proxy summary. ${examples}. Source URLs are stored on the corresponding town evidence rows.`,
        },
        notes:
          key === "slope_proxy"
            ? `${regionName} priority-town summary from town DEM and OSM terrain proxy rows, not an island-wide slope raster, parcel survey, flood-risk measure, mobility assessment, accessibility audit, or route-quality claim.`
            : `${regionName} priority-town summary from town DEM and OSM terrain proxy rows, not an island-wide stroller accessibility audit, route-specific suitability claim, sidewalk-quality measure, kerb, surface, traffic, heat, safety, or step-free access assessment.`,
      },
    ];
  });
}

function readBundle(id: string): PlaceEvidenceBundle {
  return JSON.parse(readFileSync(resolve(`${BUNDLE_DIR}/${id}.json`), "utf8"));
}

function writeBundle(bundle: PlaceEvidenceBundle): void {
  writeFileSync(resolve(`${BUNDLE_DIR}/${bundle.id}.json`), `${JSON.stringify(bundle, null, 2)}\n`);
}

function replaceRows(
  bundle: PlaceEvidenceBundle,
  replacementRows: MatrixRow[],
): PlaceEvidenceBundle {
  const replacements = new Map(replacementRows.map((row) => [row.key, row]));
  return {
    ...bundle,
    rows: bundle.rows.map((row) => replacements.get(row.key) ?? row),
  };
}

function stableJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stableJsonValue(item));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, stableJsonValue(nestedValue)]),
  );
}

function stableJsonString(value: unknown): string {
  return JSON.stringify(stableJsonValue(value));
}

export function filterChangedReplacementRows(
  bundle: PlaceEvidenceBundle,
  replacementRows: MatrixRow[],
): MatrixRow[] {
  return replacementRows.filter((row) => {
    const existing = bundle.rows.find((candidate) => candidate.key === row.key);
    return stableJsonString(existing) !== stableJsonString(row);
  });
}

function existingCitedTerrainRows(bundle: PlaceEvidenceBundle): MatrixRow[] | null {
  const rows = TERRAIN_SLOPE_ROW_KEYS.map((key) => bundle.rows.find((row) => row.key === key));
  return rows.every((row): row is MatrixRow => Boolean(row?.cited)) ? rows : null;
}

function existingCitedMountainRow(bundle: PlaceEvidenceBundle): MatrixRow | null {
  const row = bundle.rows.find((row) => row.key === "mountain_proximity");
  if (!row?.cited) return null;
  return {
    ...row,
    cited: {
      ...row.cited,
      value:
        typeof row.cited.value === "string"
          ? normalizeUnnamedPeakReferences(row.cited.value)
          : row.cited.value,
      excerpt: row.cited.excerpt
        ? normalizeUnnamedPeakReferences(row.cited.excerpt)
        : row.cited.excerpt,
    },
  };
}

function existingCitedSeasonalServiceDropoffRow(bundle: PlaceEvidenceBundle): MatrixRow | null {
  const row = bundle.rows.find((row) => row.key === "seasonal_service_dropoff_proxy");
  return row?.cited ? row : null;
}

function existingCitedEmergencyVetProxyRow(bundle: PlaceEvidenceBundle): MatrixRow | null {
  const row = bundle.rows.find((row) => row.key === "emergency_vet_proxy");
  return row?.cited ? row : null;
}

function existingProtectedAreaOverlapRow(bundle: PlaceEvidenceBundle): MatrixRow | null {
  const row = bundle.rows.find((row) => row.key === "protected_area_overlap");
  return row?.cited ? row : null;
}

async function fetchOverpassCounts(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ counts: OsmAccessCounts; endpoint: string }> {
  const query = buildOsmAccessOverpassQuery(target);
  const failures: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const request = buildOverpassFetchRequest(endpoint, query);
      const response = await fetch(request.url, request.init);
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = await response.json();
      validateOverpassSnapshot(parsed, endpoint);
      return { counts: parseOverpassCountResponse(parsed), endpoint };
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }
  throw new Error(
    `Overpass access proxy query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function fetchOsmSeasonalServiceCounts(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ counts: OsmSeasonalServiceCounts; endpoint: string }> {
  const query = buildOsmSeasonalServiceOverpassQuery(target);
  const failures: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const request = buildOverpassFetchRequest(endpoint, query);
      const response = await fetch(request.url, request.init);
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = await response.json();
      validateOverpassSnapshot(parsed, endpoint);
      return { counts: parseOsmSeasonalServiceResponse(parsed), endpoint };
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }
  throw new Error(
    `Overpass seasonal-service proxy query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function fetchOsmEmergencyVetCounts(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ counts: OsmEmergencyVetCounts; endpoint: string }> {
  const query = buildOsmEmergencyVetOverpassQuery(target);
  const failures: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const request = buildOverpassFetchRequest(endpoint, query);
      const response = await fetch(request.url, request.init);
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = await response.json();
      validateOverpassSnapshot(parsed, endpoint);
      return { counts: parseOsmEmergencyVetResponse(parsed), endpoint };
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }
  throw new Error(
    `Overpass emergency-vet proxy query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function fetchOsmWildfireEgressMetrics(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ metrics: OsmWildfireEgressMetrics; sourceUrl: string }> {
  const query = buildOsmWildfireEgressOverpassQuery(target);
  const failures: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const request = buildOverpassFetchRequest(endpoint, query);
      const response = await fetch(request.url, request.init);
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = await response.json();
      validateOverpassSnapshot(parsed, endpoint);
      return {
        metrics: parseOsmWildfireEgressResponse(parsed, target),
        sourceUrl: request.url,
      };
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }
  throw new Error(
    `Overpass wildfire egress proxy query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function fetchOsmOutdoorMetrics(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ metrics: OsmOutdoorMetrics; endpoint: string }> {
  const query = buildOsmOutdoorOverpassQuery(target);
  const failures: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const request = buildOverpassFetchRequest(endpoint, query);
      const response = await fetch(request.url, request.init);
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = await response.json();
      validateOverpassSnapshot(parsed, endpoint);
      return { metrics: parseOsmOutdoorResponse(parsed), endpoint };
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }
  throw new Error(
    `Overpass outdoor proxy query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function fetchOsmSurfaceWaterMetrics(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ metrics: OsmSurfaceWaterMetrics; sourceUrl: string }> {
  const query = buildOsmSurfaceWaterOverpassQuery(target);
  const failures: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const request = buildOverpassFetchRequest(endpoint, query);
      const response = await fetch(request.url, request.init);
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = await response.json();
      validateOverpassSnapshot(parsed, endpoint);
      return {
        metrics: parseOsmSurfaceWaterResponse(parsed, target),
        sourceUrl: request.url,
      };
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }
  throw new Error(
    `Overpass surface-water proxy query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

export function buildArcgisImageSamplesFetchRequest(
  serviceUrl: string,
  points: CoordinatePoint[],
): { url: string; init: RequestInit } {
  const geometry = {
    points: points.map((point) => [point.lon, point.lat]),
    spatialReference: { wkid: 4326 },
  };
  return {
    url: `${serviceUrl}/getSamples`,
    init: {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        f: "json",
        geometryType: "esriGeometryMultipoint",
        geometry: JSON.stringify(geometry),
        returnGeometry: "false",
      }),
    },
  };
}

async function fetchArcgisImageSamples(
  serviceUrl: string,
  points: CoordinatePoint[],
): Promise<ArcgisImageSample[]> {
  const samples: ArcgisImageSample[] = [];
  for (let index = 0; index < points.length; index += COPERNICUS_HRL_BATCH_SIZE) {
    const request = buildArcgisImageSamplesFetchRequest(
      serviceUrl,
      points.slice(index, index + COPERNICUS_HRL_BATCH_SIZE),
    );
    const response = await fetch(request.url, request.init);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${request.url}`);
    }
    const parsed = (await response.json()) as { error?: { message?: string } };
    if (parsed.error) {
      throw new Error(parsed.error.message ?? `ArcGIS ImageServer error for ${request.url}`);
    }
    samples.push(...parseArcgisImageSamplesResponse(parsed));
  }
  return samples;
}

async function fetchCopernicusHrlForestTreeMetrics(
  target: PlaceTarget,
): Promise<CopernicusHrlForestTreeMetrics> {
  const points = buildCircleSamplePoints({
    target,
    radiusMetres: COPERNICUS_HRL_RADIUS_METRES,
    sampleStepMetres: COPERNICUS_HRL_SAMPLE_STEP_METRES,
  });
  const [treeCoverSamples, forestTypeSamples] = await Promise.all([
    fetchArcgisImageSamples(COPERNICUS_HRL_TREE_COVER_SOURCE_URL, points),
    fetchArcgisImageSamples(COPERNICUS_HRL_FOREST_TYPE_SOURCE_URL, points),
  ]);
  return calculateCopernicusHrlForestTreeMetrics({
    samplePointCount: points.length,
    treeCoverSamples,
    forestTypeSamples,
  });
}

async function fetchEdoCdiWmsCapabilities(): Promise<string> {
  const response = await fetch(EDO_CDI_WMS_CAPABILITIES_URL, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${EDO_CDI_WMS_CAPABILITIES_URL}`);
  }
  return response.text();
}

async function fetchEdoCdiGeoTiff(date: string): Promise<EdoCdiGeoTiff> {
  const url = buildEdoCdiWcsGeoTiffUrl(date);
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return parseEdoCdiGeoTiff(await response.arrayBuffer());
}

async function fetchEdoCdiDroughtFrequencyMetricsForTargets(
  targets: PlaceTarget[],
): Promise<Map<string, EdoCdiDroughtFrequencyMetrics>> {
  const capabilities = await fetchEdoCdiWmsCapabilities();
  const latestDate = extractEdoCdiLatestDateFromWmsCapabilities(capabilities);
  const dates = buildEdoCdiTenDayDateSeries(latestDate, EDO_CDI_OBSERVATION_COUNT);
  const samplesByTarget = new Map<string, EdoCdiDroughtFrequencySample[]>(
    targets.map((target) => [target.id, []]),
  );
  const sampledGridByTarget = new Map<string, EdoCdiDroughtFrequencyMetrics["sampledGrid"]>();

  for (const date of dates) {
    const raster = await fetchEdoCdiGeoTiff(date);
    for (const target of targets) {
      const sample = sampleEdoCdiGeoTiffAtPoint(raster, target);
      samplesByTarget.get(target.id)?.push({ date, value: sample.value });
      sampledGridByTarget.set(target.id, {
        row: sample.row,
        col: sample.col,
        lat: sample.lat,
        lon: sample.lon,
      });
    }
  }

  return new Map(
    targets.map((target) => {
      const samples = samplesByTarget.get(target.id) ?? [];
      const sampledGrid = sampledGridByTarget.get(target.id);
      if (!sampledGrid) throw new Error(`${target.id}: missing EDO CDI sampled grid metadata`);
      return [
        target.id,
        calculateEdoCdiDroughtFrequencyMetrics({
          target,
          samples,
          sampledGrid,
        }),
      ];
    }),
  );
}

async function fetchFeatureCandidates(
  target: PlaceTarget,
  featureType: OsmFeatureType,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ candidates: OsmFeatureCandidate[]; sourceUrl: string }> {
  const query = buildOsmFeatureOverpassQuery(target, featureType);
  const failures: string[] = [];

  for (const endpoint of endpoints) {
    const request = buildOverpassFetchRequest(endpoint, query);
    try {
      const response = await fetch(request.url, request.init);
      const body = await response.text();
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = JSON.parse(body);
      validateOverpassSnapshot(parsed, endpoint);
      const candidates = parseOsmFeatureResponse(parsed);
      if (candidates.length > 0) return { candidates, sourceUrl: request.url };
      failures.push(`${endpoint}: no ${featureType} candidates`);
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }

  throw new Error(
    `Overpass ${featureType} query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function fetchRoutedCandidate(
  target: PlaceTarget,
  candidates: OsmFeatureCandidate[],
  featureType: OsmFeatureType,
): Promise<{ route: RoutedCandidate | null; osrmUrl: string }> {
  const routeCandidates = closestRouteCandidates(
    target,
    filterFeatureCandidates(target, featureType, candidates),
  );
  if (routeCandidates.length === 0) {
    return { route: null, osrmUrl: "https://router.project-osrm.org/" };
  }
  const request = buildOsrmTableFetchRequest(target, routeCandidates);
  const response = await fetch(request.url, request.init);
  if (!response.ok) {
    throw new Error(`OSRM route table failed for ${target.placeName}: HTTP ${response.status}`);
  }
  const routes = parseOsrmTableResponse(await response.json(), routeCandidates);
  return { route: selectFastestRouteCandidate(routes), osrmUrl: request.url };
}

async function buildFeatureRouteRowsForTarget(target: PlaceTarget, verifiedDate: string) {
  let ferryRoute: RoutedCandidate | null = null;
  let hospitalRoute: RoutedCandidate | null = null;
  let ferrySourceUrl = "https://www.openstreetmap.org/";
  let hospitalSourceUrl = "https://www.openstreetmap.org/";
  let ferryOsrmUrl = "https://router.project-osrm.org/";
  let hospitalOsrmUrl = "https://router.project-osrm.org/";

  try {
    const ferry = await fetchFeatureCandidates(target, "ferry_terminal");
    ferrySourceUrl = ferry.sourceUrl;
    const routed = await fetchRoutedCandidate(target, ferry.candidates, "ferry_terminal");
    ferryRoute = routed.route;
    ferryOsrmUrl = routed.osrmUrl;
  } catch (error) {
    console.warn(`${target.id}: ferry route adapter left source gap: ${(error as Error).message}`);
  }

  try {
    const hospital = await fetchFeatureCandidates(target, "emergency_hospital");
    hospitalSourceUrl = hospital.sourceUrl;
    const routed = await fetchRoutedCandidate(target, hospital.candidates, "emergency_hospital");
    hospitalRoute = routed.route;
    hospitalOsrmUrl = routed.osrmUrl;
  } catch (error) {
    console.warn(
      `${target.id}: emergency hospital route adapter left source gap: ${(error as Error).message}`,
    );
  }

  return buildFeatureRouteRows({
    target,
    ferryRoute,
    hospitalRoute,
    ferrySourceUrl,
    hospitalSourceUrl,
    ferryOsrmUrl,
    hospitalOsrmUrl,
    verifiedDate,
  });
}

async function buildCitizenServiceCentreDistanceRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow | null> {
  const official = CITIZEN_SERVICE_CENTRES[target.id];
  if (official) {
    const candidate: OsmFeatureCandidate = {
      id: official.id,
      name: official.name,
      lat: official.lat,
      lon: official.lon,
      tags: {
        office: "government",
        operator: official.sourceName,
        ref: "KEP",
        address: official.address,
        source: official.geocodeExcerpt,
      },
      objectUrl: official.sourceUrl,
    };
    const routed = await fetchRoutedCandidate(target, [candidate], "citizen_service_centre");
    if (!routed.route) return null;
    return buildCitizenServiceCentreDistanceRow({
      target,
      route: routed.route,
      sourceUrl: official.sourceUrl,
      sourceName: official.sourceName,
      sourceExcerpt: `${official.sourceExcerpt} ${official.geocodeExcerpt}`,
      osrmUrl: routed.osrmUrl,
      verifiedDate,
    });
  }

  const candidates = await fetchFeatureCandidates(target, "citizen_service_centre");
  const routed = await fetchRoutedCandidate(
    target,
    candidates.candidates,
    "citizen_service_centre",
  );
  if (!routed.route) return null;
  return buildCitizenServiceCentreDistanceRow({
    target,
    route: routed.route,
    sourceUrl: candidates.sourceUrl,
    sourceName: "OpenStreetMap contributors via Overpass API",
    sourceExcerpt: `Overpass mapped KEP or citizen-service candidate query for ${target.placeName}.`,
    osrmUrl: routed.osrmUrl,
    verifiedDate,
  });
}

async function buildTaxOfficeDistanceRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow | null> {
  const official = AADE_TAX_OFFICES[target.id];
  if (!official) return null;

  const candidate: OsmFeatureCandidate = {
    id: official.id,
    name: official.name,
    lat: official.lat,
    lon: official.lon,
    tags: {
      office: "government",
      operator: "AADE",
      brand: official.sourceName,
      ref: "DOY",
      address: official.address,
      source: official.geocodeExcerpt,
    },
    objectUrl: official.sourceUrl,
  };
  const routed = await fetchRoutedCandidate(target, [candidate], "tax_office");
  if (!routed.route) return null;
  return buildTaxOfficeDistanceRow({
    target,
    route: routed.route,
    sourceUrl: official.sourceUrl,
    sourceName: official.sourceName,
    sourceExcerpt: `${official.sourceExcerpt} ${official.geocodeExcerpt}`,
    osrmUrl: routed.osrmUrl,
    verifiedDate,
  });
}

async function buildResidencePermitOfficeDistanceRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow | null> {
  const official = CRETE_RESIDENCE_PERMIT_OFFICES[target.id];
  if (!official) return null;

  const candidate: OsmFeatureCandidate = {
    id: official.id,
    name: official.name,
    lat: official.lat,
    lon: official.lon,
    tags: {
      office: "government",
      operator: "Decentralized Administration of Crete",
      ref: "residence_permit",
      address: official.address,
      source: official.geocodeExcerpt,
    },
    objectUrl: official.sourceUrl,
  };
  const routed = await fetchRoutedCandidate(target, [candidate], "residence_permit_office");
  if (!routed.route) return null;
  return buildResidencePermitOfficeDistanceRow({
    target,
    route: routed.route,
    sourceUrl: official.sourceUrl,
    sourceName: official.sourceName,
    sourceExcerpt: `${official.sourceExcerpt} ${official.geocodeExcerpt}`,
    osrmUrl: routed.osrmUrl,
    verifiedDate,
  });
}

async function buildLandRegistryOfficeDistanceRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow | null> {
  const official = CRETE_LAND_REGISTRY_OFFICES[target.id];
  if (!official) return null;

  const candidate: OsmFeatureCandidate = {
    id: official.id,
    name: official.name,
    lat: official.lat,
    lon: official.lon,
    tags: {
      office: "government",
      operator: "Hellenic Cadastre",
      ref: "land_registry",
      address: official.address,
      source: official.geocodeExcerpt,
    },
    objectUrl: official.sourceUrl,
  };
  const routed = await fetchRoutedCandidate(target, [candidate], "land_registry_office");
  if (!routed.route) return null;
  return buildLandRegistryOfficeDistanceRow({
    target,
    route: routed.route,
    sourceUrl: official.sourceUrl,
    sourceName: official.sourceName,
    sourceExcerpt: `${official.sourceExcerpt} ${official.geocodeExcerpt}`,
    osrmUrl: routed.osrmUrl,
    verifiedDate,
  });
}

async function buildInternationalSchoolDistanceRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow | null> {
  const school = CRETE_ACCREDITED_EUROPEAN_SCHOOL;
  const candidate: OsmFeatureCandidate = {
    id: school.id,
    name: school.name,
    lat: school.lat,
    lon: school.lon,
    tags: {
      amenity: "school",
      operator: "School of European Education Heraklion",
      accreditation: "European Schools",
      address: school.address,
      source: school.geocodeExcerpt,
    },
    objectUrl: "https://www.openstreetmap.org/way/352274736",
  };
  const routed = await fetchRoutedCandidate(target, [candidate], "international_school");
  if (!routed.route) return null;
  return buildInternationalSchoolDistanceRow({
    target,
    route: routed.route,
    sourceUrl: school.sourceUrl,
    sourceName: school.sourceName,
    sourceExcerpt: `${school.sourceExcerpt} ${school.geocodeExcerpt}`,
    osrmUrl: routed.osrmUrl,
    verifiedDate,
  });
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchBlueFlagAwards(): Promise<BlueFlagAwardsIndex> {
  const request = buildBlueFlagAwardsFetchRequest();
  const response = await fetch(request.url, request.init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${request.url}`);
  }
  return parseBlueFlagAwardsHtml(await response.text(), request.url);
}

async function fetchSeatracRegionDirectory({
  token,
  region,
}: {
  token: string;
  region: string;
}): Promise<SeatracRegionDirectory> {
  const firstRequest = buildSeatracSearchFetchRequest({ token, region, page: 1 });
  const firstResponse = await fetch(firstRequest.url, firstRequest.init);
  if (!firstResponse.ok) {
    throw new Error(`HTTP ${firstResponse.status} for ${firstRequest.url} region ${region}`);
  }
  const firstHtml = decodeSeatracJsonString(await firstResponse.text());
  const firstParsed = parseSeatracSearchHtml(firstHtml);
  const maxPage = Math.max(1, ...firstParsed.pageNumbers);
  const pages = [firstHtml];

  for (let page = 2; page <= maxPage; page += 1) {
    const request = buildSeatracSearchFetchRequest({ token, region, page });
    const response = await fetch(request.url, request.init);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${request.url} region ${region} page ${page}`);
    }
    pages.push(decodeSeatracJsonString(await response.text()));
  }

  return summarizeSeatracRegionPages({ region, pages });
}

async function fetchSeatracDirectories(
  regions: readonly string[] = CRETE_SEATRAC_REGIONS,
): Promise<Map<string, SeatracRegionDirectory>> {
  const request = buildSeatracDirectoryFetchRequest();
  const response = await fetch(request.url, request.init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${request.url}`);
  }
  const token = extractSeatracCsrfToken(await response.text());
  const directories = new Map<string, SeatracRegionDirectory>();

  for (const region of regions) {
    directories.set(region, await fetchSeatracRegionDirectory({ token, region }));
  }

  return directories;
}

async function buildOpenMeteoEnvironmentRowsForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow[]> {
  const airQualityYear = new Date().getUTCFullYear() - 1;
  const climateStartYear = 1991;
  const climateEndYear = 2020;
  const pm25SourceUrl = buildOpenMeteoAirQualityUrl(target, airQualityYear);
  const snowfallSourceUrl = buildOpenMeteoSnowfallUrl(
    target,
    `${climateStartYear}-01-01`,
    `${climateEndYear}-12-31`,
  );

  const [pm25Response, snowfallResponse] = await Promise.all([
    fetchJson(pm25SourceUrl),
    fetchJson(snowfallSourceUrl),
  ]);

  return buildOpenMeteoEnvironmentRows({
    target,
    airQualityYear,
    climateStartYear,
    climateEndYear,
    pm25: parseOpenMeteoPm25Response(pm25Response),
    snowfall: parseOpenMeteoSnowfallResponse(snowfallResponse),
    pm25SourceUrl,
    snowfallSourceUrl,
    verifiedDate,
  });
}

async function buildOpenMeteoUvIndexRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow> {
  const year = new Date().getUTCFullYear() - 1;
  const uvIndexSourceUrl = buildOpenMeteoUvIndexUrl(target, year);
  const uvIndexResponse = await fetchJson(uvIndexSourceUrl);

  return buildOpenMeteoUvIndexRow({
    target,
    uvIndex: parseOpenMeteoUvIndexResponse(uvIndexResponse, year),
    uvIndexSourceUrl,
    verifiedDate,
  });
}

async function buildOpenMeteoPollenSeverityRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow> {
  const year = new Date().getUTCFullYear() - 1;
  const pollenSourceUrl = buildOpenMeteoPollenUrl(target, year);
  const pollenResponse = await fetchJson(pollenSourceUrl);

  return buildOpenMeteoPollenSeverityRow({
    target,
    pollen: parseOpenMeteoPollenResponse(pollenResponse, year),
    pollenSourceUrl,
    verifiedDate,
  });
}

async function fetchOsmTerrainSlopeGraph(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ graph: TerrainSlopeGraph; sourceUrl: string }> {
  const query = buildOsmTerrainSlopeOverpassQuery(target);
  const failures: string[] = [];

  for (const endpoint of endpoints) {
    const request = buildOverpassFetchRequest(endpoint, query);
    try {
      const response = await fetch(request.url, request.init);
      const body = await response.text();
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = JSON.parse(body);
      validateOverpassSnapshot(parsed, endpoint);
      const graph = parseOsmTerrainSlopeResponse(parsed);
      if (graph.segments.length > 0 && graph.coordinates.length > 0) {
        return { graph, sourceUrl: request.url };
      }
      failures.push(`${endpoint}: no eligible terrain slope segments`);
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }

  throw new Error(
    `Overpass terrain slope query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function fetchOpenMeteoElevations(
  points: CoordinatePoint[],
): Promise<{ elevations: Map<string, number>; sourceUrls: string[] }> {
  const elevations = new Map<string, number>();
  const sourceUrls: string[] = [];

  for (let index = 0; index < points.length; index += OPEN_METEO_ELEVATION_BATCH_SIZE) {
    const batch = points.slice(index, index + OPEN_METEO_ELEVATION_BATCH_SIZE);
    const sourceUrl = buildOpenMeteoElevationUrl(batch);
    sourceUrls.push(sourceUrl);
    const parsed = parseOpenMeteoElevationResponse(batch, await fetchJson(sourceUrl));
    for (const [key, value] of parsed) {
      elevations.set(key, value);
    }
  }

  return { elevations, sourceUrls };
}

async function buildTerrainSlopeRowsForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow[]> {
  const { graph, sourceUrl } = await fetchOsmTerrainSlopeGraph(target);
  const { elevations, sourceUrls } = await fetchOpenMeteoElevations(graph.coordinates);
  const metrics = calculateTerrainSlopeMetrics(graph, elevations);
  if (metrics.sampledSegmentCount === 0) {
    throw new Error(`No elevation-backed terrain slope segments for ${target.placeName}`);
  }
  return buildTerrainSlopeRows({
    target,
    metrics,
    overpassSourceUrl: sourceUrl,
    elevationSourceUrls: sourceUrls,
    verifiedDate,
  });
}

async function fetchOsmMountainPeaks(
  target: PlaceTarget,
  endpoints = DEFAULT_OVERPASS_ENDPOINTS,
): Promise<{ peaks: OsmPeakCandidate[]; sourceUrl: string }> {
  const query = buildOsmMountainPeakOverpassQuery(target);
  const failures: string[] = [];

  for (const endpoint of endpoints) {
    const request = buildOverpassFetchRequest(endpoint, query);
    try {
      const response = await fetch(request.url, request.init);
      const body = await response.text();
      if (!response.ok) {
        failures.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      const parsed = JSON.parse(body);
      validateOverpassSnapshot(parsed, endpoint);
      const peaks = parseOsmMountainPeakResponse(parsed);
      if (peaks.length > 0) return { peaks, sourceUrl: request.url };
      failures.push(`${endpoint}: no OSM peak candidates with ele tags`);
    } catch (error) {
      failures.push(`${endpoint}: ${(error as Error).message}`);
    }
  }

  throw new Error(
    `Overpass mapped peak query failed for ${target.placeName}: ${failures.join("; ")}`,
  );
}

async function buildMountainProximityRowForTarget(
  target: PlaceTarget,
  verifiedDate: string,
): Promise<MatrixRow> {
  const { peaks, sourceUrl } = await fetchOsmMountainPeaks(target);
  const peak = selectNearestElevatedPeak(target, peaks);
  if (!peak) {
    throw new Error(
      `No OSM natural=peak candidate with ele>=${MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES}m for ${target.placeName}`,
    );
  }
  return buildTownMountainProximityRow({
    target,
    peak,
    totalPeakCount: peaks.length,
    elevatedPeakCount: peaks.filter(
      (candidate) => candidate.elevationMetres >= MOUNTAIN_PEAK_ELEVATION_THRESHOLD_METRES,
    ).length,
    sourceUrl,
    verifiedDate,
  });
}

function readArgValue(args: string[], flag: string): string | null {
  const equals = args.find((arg) => arg.startsWith(`${flag}=`));
  if (equals) return equals.slice(flag.length + 1);
  const index = args.indexOf(flag);
  if (index >= 0) return args[index + 1] ?? null;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireManualTransportString(
  raw: Record<string, unknown>,
  field: keyof TransportScheduleManualRecord,
  path: string,
  index: number,
): string {
  const value = raw[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path}: records[${index}].${field} must be a non-empty string`);
  }
  return value;
}

export function validateManualTransportScheduleRecord(
  raw: unknown,
  index: number,
  path: string,
): TransportScheduleManualRecord {
  if (!isRecord(raw)) {
    throw new Error(`${path}: records[${index}] must be an object`);
  }

  const rowKey = requireManualTransportString(raw, "rowKey", path, index);
  if (rowKey === "airport_winter_route_ratio") {
    throw new Error(
      `${path}: records[${index}].rowKey airport_winter_route_ratio is derived only; provide cited winter and summer airport component rows instead`,
    );
  }
  if (!MANUAL_TRANSPORT_SCHEDULE_ROW_KEY_SET.has(rowKey)) {
    throw new Error(`${path}: records[${index}].rowKey is not a manual transport row`);
  }

  const observedGranularity = requireManualTransportString(raw, "observedGranularity", path, index);
  if (!GRANULARITY_SET.has(observedGranularity)) {
    throw new Error(`${path}: records[${index}].observedGranularity is invalid`);
  }

  const coverageStatus = requireManualTransportString(raw, "coverageStatus", path, index);
  if (!MANUAL_TRANSPORT_COVERAGE_STATUS_SET.has(coverageStatus)) {
    throw new Error(`${path}: records[${index}].coverageStatus must be local, regional, or proxy`);
  }

  const confidence = raw.confidence;
  if (confidence !== undefined && !MANUAL_TRANSPORT_CONFIDENCE_SET.has(String(confidence))) {
    throw new Error(`${path}: records[${index}].confidence must be medium or high`);
  }

  const value = raw.value;
  if (typeof value !== "number" && (typeof value !== "string" || value.trim() === "")) {
    throw new Error(`${path}: records[${index}].value must be a number or non-empty string`);
  }

  const verifiedDate = raw.verifiedDate;
  if (verifiedDate !== undefined && (typeof verifiedDate !== "string" || verifiedDate === "")) {
    throw new Error(`${path}: records[${index}].verifiedDate must be a non-empty string`);
  }

  const notes = raw.notes;
  if (notes !== undefined && typeof notes !== "string") {
    throw new Error(`${path}: records[${index}].notes must be a string`);
  }

  return {
    bundleId: requireManualTransportString(raw, "bundleId", path, index),
    rowKey: rowKey as TransportScheduleRowKey,
    value,
    unit: requireManualTransportString(raw, "unit", path, index),
    sourceUrl: requireManualTransportString(raw, "sourceUrl", path, index),
    sourceName: requireManualTransportString(raw, "sourceName", path, index),
    sourceExcerpt: requireManualTransportString(raw, "sourceExcerpt", path, index),
    observedGranularity: observedGranularity as Granularity,
    coverageStatus: coverageStatus as CoverageStatus,
    ...(confidence ? { confidence: confidence as Confidence } : {}),
    ...(verifiedDate ? { verifiedDate } : {}),
    ...(notes ? { notes } : {}),
  };
}

function readManualTransportScheduleFile(path: string): TransportScheduleManualFile {
  const parsed = JSON.parse(readFileSync(resolve(path), "utf8")) as {
    schemaVersion?: unknown;
    records?: unknown;
  };
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.records)) {
    throw new Error(`${path}: invalid manual transport schedule file`);
  }
  return {
    schemaVersion: 1,
    records: parsed.records.map((record, index) =>
      validateManualTransportScheduleRecord(record, index, path),
    ),
  };
}

function transportScheduleRecordsByBundle(
  path: string | undefined,
): Map<string, TransportScheduleManualRecord[]> {
  if (!path) return new Map();
  const file = readManualTransportScheduleFile(path);
  const byBundle = new Map<string, TransportScheduleManualRecord[]>();
  for (const record of file.records) {
    byBundle.set(record.bundleId, [...(byBundle.get(record.bundleId) ?? []), record]);
  }
  return byBundle;
}

export function buildManualTransportScheduleRowsForBundle({
  bundle,
  records,
  verifiedDate,
}: {
  bundle: PlaceEvidenceBundle;
  records: TransportScheduleManualRecord[];
  verifiedDate: string;
}): MatrixRow[] {
  if (records.length === 0) return [];
  const directRows = records.map((record) =>
    buildManualTransportScheduleRow({ bundle, record, verifiedDate }),
  );
  const withDirectRows = replaceRows(bundle, directRows);
  try {
    return [
      ...directRows,
      buildAirportWinterRouteRatioRow({ bundle: withDirectRows, verifiedDate }),
    ];
  } catch (error) {
    const hasAirportScheduleRecord = records.some((record) => record.rowKey.startsWith("airport_"));
    if (hasAirportScheduleRecord) {
      console.warn(
        `${bundle.id}: airport winter-route ratio left source-gapped: ${(error as Error).message}`,
      );
    }
    return directRows;
  }
}

export function parseAdapterCliArgs(argv: string[]): AdapterCliArgs {
  const args = argv.slice(2);
  const write = args.includes("--write");
  const singleBundle = readArgValue(args, "--bundle");
  const townBundles = readArgValue(args, "--town-bundles");
  const regionId = readArgValue(args, "--region-bundle");
  const manualSchedulePath = readArgValue(args, "--manual-schedule-file") ?? undefined;
  const onlyArg = readArgValue(args, "--only") ?? "all";
  if (
    onlyArg !== "all" &&
    onlyArg !== "terrain" &&
    onlyArg !== "mountain" &&
    onlyArg !== "protected-area" &&
    onlyArg !== "green-urban" &&
    onlyArg !== "scenery" &&
    onlyArg !== "blue-flag" &&
    onlyArg !== "seatrac-accessible" &&
    onlyArg !== "uv-index" &&
    onlyArg !== "citizen-service" &&
    onlyArg !== "tax-office" &&
    onlyArg !== "residence-permit-office" &&
    onlyArg !== "land-registry-office" &&
    onlyArg !== "international-school" &&
    onlyArg !== "international-school-tuition" &&
    onlyArg !== "car-dependency" &&
    onlyArg !== "pharmacy-duty" &&
    onlyArg !== "municipal-digital-services" &&
    onlyArg !== "water-restriction-history" &&
    onlyArg !== "water-stress-baseline" &&
    onlyArg !== "surface-water" &&
    onlyArg !== "forest-tree" &&
    onlyArg !== "drought-frequency" &&
    onlyArg !== "light-pollution" &&
    onlyArg !== "wildfire-egress" &&
    onlyArg !== "bus-frequency" &&
    onlyArg !== "cruise-passenger-pressure" &&
    onlyArg !== "airport-summer-direct-destinations" &&
    onlyArg !== "transport-schedule-manual" &&
    onlyArg !== "seasonal-service-dropoff" &&
    onlyArg !== "emergency-vet" &&
    onlyArg !== "pollen-severity"
  ) {
    throw new Error(`Unsupported adapter --only value: ${onlyArg}`);
  }
  const only: AdapterOnly = onlyArg;
  const maybeManualSchedulePath = manualSchedulePath ? { manualSchedulePath } : {};

  if (singleBundle) {
    return {
      write,
      only,
      regionId: regionId ?? null,
      townIds: [singleBundle],
      ...maybeManualSchedulePath,
    };
  }
  if (townBundles) {
    return {
      write,
      only,
      regionId: regionId ?? null,
      townIds: townBundles
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
      ...maybeManualSchedulePath,
    };
  }
  return {
    write,
    only,
    regionId: regionId ?? CRETE_REGION_ID,
    townIds: CRETE_TOWN_IDS,
    ...maybeManualSchedulePath,
  };
}

async function runOsmAccessAdapter({
  write,
  only,
  townIds,
  regionId,
  manualSchedulePath,
}: AdapterCliArgs) {
  const verifiedDate = new Date().toISOString().slice(0, 10);
  const runAll = only === "all";
  const runTerrain = only === "all" || only === "terrain";
  const runMountain = only === "all" || only === "mountain";
  const runProtectedArea = only === "all" || only === "protected-area";
  const runGreenUrban = only === "all" || only === "green-urban";
  const runScenery = only === "all" || only === "scenery";
  const runBlueFlag = only === "all" || only === "blue-flag";
  const runSeatracAccessible = only === "all" || only === "seatrac-accessible";
  const runUvIndex = only === "all" || only === "uv-index";
  const runCitizenService = only === "all" || only === "citizen-service";
  const runTaxOffice = only === "all" || only === "tax-office";
  const runResidencePermitOffice = only === "all" || only === "residence-permit-office";
  const runLandRegistryOffice = only === "all" || only === "land-registry-office";
  const runInternationalSchool = only === "all" || only === "international-school";
  const runInternationalSchoolTuition = only === "all" || only === "international-school-tuition";
  const runCarDependency = only === "all" || only === "car-dependency";
  const runPharmacyDuty = only === "all" || only === "pharmacy-duty";
  const runMunicipalDigitalServices = only === "all" || only === "municipal-digital-services";
  const runWaterRestrictionHistory = only === "all" || only === "water-restriction-history";
  const runWaterStressBaseline = only === "all" || only === "water-stress-baseline";
  const runSurfaceWater = only === "all" || only === "surface-water";
  const runForestTree = only === "all" || only === "forest-tree";
  const runDroughtFrequency = only === "all" || only === "drought-frequency";
  const runLightPollution = only === "all" || only === "light-pollution";
  const runWildfireEgress = only === "all" || only === "wildfire-egress";
  const runBusFrequency = only === "all" || only === "bus-frequency";
  const runCruisePassengerPressure = only === "all" || only === "cruise-passenger-pressure";
  const runAirportSummerDirectDestinations =
    only === "all" || only === "airport-summer-direct-destinations";
  const runTransportScheduleManual = only === "transport-schedule-manual";
  const runSeasonalServiceDropoff = only === "all" || only === "seasonal-service-dropoff";
  const runEmergencyVet = only === "all" || only === "emergency-vet";
  const runPollenSeverity = only === "all" || only === "pollen-severity";
  if (runTransportScheduleManual && !manualSchedulePath) {
    throw new Error("--manual-schedule-file is required for --only transport-schedule-manual");
  }
  const manualTransportScheduleRecords = runTransportScheduleManual
    ? transportScheduleRecordsByBundle(manualSchedulePath)
    : new Map<string, TransportScheduleManualRecord[]>();
  const blueFlagAwards = runBlueFlag ? await fetchBlueFlagAwards() : null;
  const seatracDirectories = runSeatracAccessible ? await fetchSeatracDirectories() : null;
  const accessTownRows: MatrixRow[][] = [];
  const routeTownRows: MatrixRow[][] = [];
  const environmentTownRows: MatrixRow[][] = [];
  const outdoorTownRows: MatrixRow[][] = [];
  const terrainTownRows: MatrixRow[][] = [];
  const mountainTownRows: Array<MatrixRow | null> = [];
  const protectedAreaDistanceTownRows: Array<MatrixRow | null> = [];
  const greenUrbanTownRows: Array<MatrixRow | null> = [];
  const sceneryTagTownRows: Array<MatrixRow | null> = [];
  const uvIndexTownRows: Array<MatrixRow | null> = [];
  const citizenServiceTownRows: Array<MatrixRow | null> = [];
  const taxOfficeTownRows: Array<MatrixRow | null> = [];
  const residencePermitOfficeTownRows: Array<MatrixRow | null> = [];
  const landRegistryOfficeTownRows: Array<MatrixRow | null> = [];
  const internationalSchoolTownRows: Array<MatrixRow | null> = [];
  const internationalSchoolTuitionTownRows: Array<MatrixRow | null> = [];
  const carDependencyTownRows: Array<MatrixRow | null> = [];
  const pharmacyDutyTownRows: Array<MatrixRow | null> = [];
  const waterRestrictionHistoryTownRows: Array<MatrixRow | null> = [];
  const waterStressBaselineTownRows: Array<MatrixRow | null> = [];
  const surfaceWaterTownRows: Array<MatrixRow | null> = [];
  const forestCoverTownRows: Array<MatrixRow | null> = [];
  const treeCanopyTownRows: Array<MatrixRow | null> = [];
  const droughtFrequencyTownRows: Array<MatrixRow | null> = [];
  const lightPollutionTownRows: Array<MatrixRow | null> = [];
  const wildfireEgressTownRows: Array<MatrixRow | null> = [];
  const busFrequencyTownRows: Array<MatrixRow | null> = [];
  const cruisePassengerPressureTownRows: Array<MatrixRow | null> = [];
  const seasonalServiceDropoffTownRows: Array<MatrixRow | null> = [];
  const emergencyVetTownRows: Array<MatrixRow | null> = [];
  const pollenSeverityTownRows: Array<MatrixRow | null> = [];
  const familyAmenityTownRows: Array<MatrixRow | null> = [];
  const changedBundles: string[] = [];
  const targetEntries = townIds.map((id) => {
    const bundle = readBundle(id);
    const coordinate = extractRepresentativeCoordinate(bundle);
    if (!coordinate) throw new Error(`Could not resolve representative coordinate for ${id}`);

    const target: PlaceTarget = {
      id,
      placeName: bundle.placeName,
      granularity: "town",
      ...coordinate,
    };
    return { id, bundle, target };
  });
  const droughtFrequencyMetricsByTarget = runDroughtFrequency
    ? await fetchEdoCdiDroughtFrequencyMetricsForTargets(targetEntries.map((entry) => entry.target))
    : new Map<string, EdoCdiDroughtFrequencyMetrics>();
  const lightPollutionMetricsByTarget = runLightPollution
    ? await fetchViirsLightPollutionMetricsForTargets(targetEntries.map((entry) => entry.target))
    : new Map<string, ViirsLightPollutionMetrics>();

  for (const { id, bundle, target } of targetEntries) {
    let accessRows: MatrixRow[] = [];
    if (runAll) {
      const { counts, endpoint } = await fetchOverpassCounts(target);
      accessRows = buildOsmAccessRows({ target, counts, endpoint, verifiedDate });
    }
    let outdoorRows: MatrixRow[] = [];
    if (runAll) {
      try {
        const outdoor = await fetchOsmOutdoorMetrics(target);
        outdoorRows = buildOsmOutdoorRows({
          target,
          metrics: outdoor.metrics,
          endpoint: outdoor.endpoint,
          verifiedDate,
        });
      } catch (error) {
        console.warn(
          `${target.id}: OSM outdoor adapter left source gap: ${(error as Error).message}`,
        );
      }
    }
    const routeRows = runAll ? await buildFeatureRouteRowsForTarget(target, verifiedDate) : [];
    let environmentRows: MatrixRow[] = [];
    if (runAll) {
      try {
        environmentRows = await buildOpenMeteoEnvironmentRowsForTarget(target, verifiedDate);
      } catch (error) {
        console.warn(
          `${target.id}: Open-Meteo environment adapter left source gap: ${(error as Error).message}`,
        );
      }
    }
    let terrainRows: MatrixRow[] = [];
    if (runTerrain) {
      const existingTerrainRows = only === "terrain" ? existingCitedTerrainRows(bundle) : null;
      if (existingTerrainRows) {
        terrainRows = existingTerrainRows;
      } else {
        try {
          terrainRows = await buildTerrainSlopeRowsForTarget(target, verifiedDate);
        } catch (error) {
          console.warn(
            `${target.id}: terrain slope adapter left source gap: ${(error as Error).message}`,
          );
        }
      }
    }
    let mountainRow: MatrixRow | null = null;
    if (runMountain) {
      const existingMountainRow = only === "mountain" ? existingCitedMountainRow(bundle) : null;
      if (existingMountainRow) {
        mountainRow = existingMountainRow;
      } else {
        try {
          mountainRow = await buildMountainProximityRowForTarget(target, verifiedDate);
        } catch (error) {
          console.warn(
            `${target.id}: mountain proximity adapter left source gap: ${(error as Error).message}`,
          );
        }
      }
    }
    const protectedAreaDistanceRow = runProtectedArea
      ? buildProtectedAreaDistanceProxyRow({
          target,
          protectedAreaRow: existingProtectedAreaOverlapRow(bundle),
          verifiedDate,
        })
      : null;
    const greenUrbanRow = runGreenUrban
      ? buildGreenUrbanProxyRow({
          target,
          greenSpaceRow: bundle.rows.find((row) => row.key === "green_space_pct"),
          verifiedDate,
        })
      : null;
    const sceneryTagRow = runScenery
      ? buildSceneryTagsRow({
          target,
          rows: bundle.rows,
          verifiedDate,
        })
      : null;
    let uvIndexRow: MatrixRow | null = null;
    if (runUvIndex) {
      try {
        uvIndexRow = await buildOpenMeteoUvIndexRowForTarget(target, verifiedDate);
      } catch (error) {
        console.warn(
          `${target.id}: Open-Meteo UV-index adapter left source gap: ${(error as Error).message}`,
        );
      }
    }
    let pollenSeverityRow: MatrixRow | null = null;
    if (runPollenSeverity) {
      try {
        pollenSeverityRow = await buildOpenMeteoPollenSeverityRowForTarget(target, verifiedDate);
      } catch (error) {
        console.warn(
          `${target.id}: Open-Meteo pollen-severity adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    let citizenServiceRow: MatrixRow | null = null;
    if (runCitizenService) {
      try {
        citizenServiceRow = await buildCitizenServiceCentreDistanceRowForTarget(
          target,
          verifiedDate,
        );
      } catch (error) {
        console.warn(
          `${target.id}: citizen-service centre route adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    let taxOfficeRow: MatrixRow | null = null;
    if (runTaxOffice) {
      try {
        taxOfficeRow = await buildTaxOfficeDistanceRowForTarget(target, verifiedDate);
      } catch (error) {
        console.warn(
          `${target.id}: AADE tax-office route adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    let residencePermitOfficeRow: MatrixRow | null = null;
    if (runResidencePermitOffice) {
      try {
        residencePermitOfficeRow = await buildResidencePermitOfficeDistanceRowForTarget(
          target,
          verifiedDate,
        );
      } catch (error) {
        console.warn(
          `${target.id}: Crete residence-permit office route adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    let landRegistryOfficeRow: MatrixRow | null = null;
    if (runLandRegistryOffice) {
      try {
        landRegistryOfficeRow = await buildLandRegistryOfficeDistanceRowForTarget(
          target,
          verifiedDate,
        );
      } catch (error) {
        console.warn(
          `${target.id}: Hellenic Cadastre land-registry office route adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    let internationalSchoolRow: MatrixRow | null = null;
    if (runInternationalSchool) {
      try {
        internationalSchoolRow = await buildInternationalSchoolDistanceRowForTarget(
          target,
          verifiedDate,
        );
      } catch (error) {
        console.warn(
          `${target.id}: accredited European School route adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    const internationalSchoolTuitionRow = runInternationalSchoolTuition
      ? buildInternationalSchoolTuitionRow({
          bundle,
          source: CRETE_INTERNATIONAL_SCHOOL_TUITION_SOURCE,
          verifiedDate,
        })
      : null;
    const pharmacyDutyRow = runPharmacyDuty
      ? buildAfterHoursPharmacyProxyRow({
          bundle,
          source: PHARMACY_DUTY_ROTA_SOURCES[id] as PharmacyDutyRotaSource,
          verifiedDate,
        })
      : null;
    const municipalDigitalServicesRow = runMunicipalDigitalServices
      ? buildMunicipalDigitalServicesRow({
          bundle,
          source: MUNICIPAL_DIGITAL_SERVICE_SOURCES[id] as MunicipalDigitalServiceSource,
          verifiedDate,
        })
      : null;
    const waterRestrictionHistorySource = WATER_RESTRICTION_HISTORY_SOURCES[id];
    const waterRestrictionHistoryRow =
      runWaterRestrictionHistory && waterRestrictionHistorySource
        ? buildWaterRestrictionHistoryRow({
            bundle,
            source: waterRestrictionHistorySource,
            verifiedDate,
          })
        : null;
    const waterStressBaselineRow = runWaterStressBaseline
      ? buildWriAqueductWaterStressBaselineRow({
          bundle,
          source: CRETE_WRI_AQUEDUCT_WATER_STRESS_BASELINE,
          verifiedDate,
        })
      : null;
    let surfaceWaterRow: MatrixRow | null = null;
    if (runSurfaceWater) {
      try {
        const surfaceWater = await fetchOsmSurfaceWaterMetrics(target);
        surfaceWaterRow = buildOsmSurfaceWaterDensityRow({
          bundle,
          target,
          metrics: surfaceWater.metrics,
          sourceUrl: surfaceWater.sourceUrl,
          verifiedDate,
        });
      } catch (error) {
        console.warn(
          `${target.id}: OSM surface-water polygon adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    let forestTreeRows: MatrixRow[] = [];
    if (runForestTree) {
      try {
        const forestTreeMetrics = await fetchCopernicusHrlForestTreeMetrics(target);
        forestTreeRows = buildCopernicusHrlForestTreeRows({
          bundle,
          target,
          metrics: forestTreeMetrics,
          treeCoverSourceUrl: COPERNICUS_HRL_TREE_COVER_SOURCE_URL,
          forestTypeSourceUrl: COPERNICUS_HRL_FOREST_TYPE_SOURCE_URL,
          verifiedDate,
        });
      } catch (error) {
        console.warn(
          `${target.id}: Copernicus HRL forest/tree adapter left source gap: ${
            (error as Error).message
          }`,
        );
      }
    }
    const droughtFrequencyMetrics = droughtFrequencyMetricsByTarget.get(id);
    const droughtFrequencyRow =
      runDroughtFrequency && droughtFrequencyMetrics
        ? buildEdoCdiDroughtFrequencyRow({
            bundle,
            target,
            metrics: droughtFrequencyMetrics,
            sourceUrl: EDO_CDI_DATASET_URL,
            verifiedDate,
          })
        : null;
    const lightPollutionMetrics = lightPollutionMetricsByTarget.get(id);
    const lightPollutionRow =
      runLightPollution && lightPollutionMetrics
        ? buildViirsLightPollutionRow({
            bundle,
            target,
            metrics: lightPollutionMetrics,
            sourceUrl: VIIRS_NIGHTLIGHTS_ZENODO_RECORD_URL,
            verifiedDate,
          })
        : null;
    let wildfireEgressRow: MatrixRow | null = null;
    if (runWildfireEgress) {
      try {
        const wildfireEgress = await fetchOsmWildfireEgressMetrics(target);
        wildfireEgressRow = buildOsmWildfireEgressProxyRow({
          bundle,
          target,
          metrics: wildfireEgress.metrics,
          sourceUrl: wildfireEgress.sourceUrl,
          verifiedDate,
        });
      } catch (error) {
        console.warn(
          `${target.id}: OSM wildfire-egress adapter left source gap: ${(error as Error).message}`,
        );
      }
    }
    const busFrequencySource = BUS_FREQUENCY_PROXY_SOURCES[id];
    const busFrequencyRow =
      runBusFrequency && busFrequencySource
        ? buildBusFrequencyProxyRow({
            bundle,
            source: busFrequencySource,
            verifiedDate,
          })
        : null;
    const airportSummerDirectDestinationSource = AIRPORT_SUMMER_DIRECT_DESTINATION_SOURCES[id];
    const airportSummerDirectDestinationRow =
      runAirportSummerDirectDestinations && airportSummerDirectDestinationSource
        ? buildAirportSummerDirectDestinationsRow({
            bundle,
            source: airportSummerDirectDestinationSource,
            verifiedDate,
          })
        : null;
    const cruisePassengerPressureSource = CRUISE_PASSENGER_PRESSURE_SOURCES[id];
    const cruisePassengerPressureRow =
      runCruisePassengerPressure && cruisePassengerPressureSource
        ? buildCruisePassengerPressureRow({
            bundle,
            source: cruisePassengerPressureSource,
            verifiedDate,
          })
        : null;
    const manualTransportScheduleRows = runTransportScheduleManual
      ? buildManualTransportScheduleRowsForBundle({
          bundle,
          records: manualTransportScheduleRecords.get(id) ?? [],
          verifiedDate,
        })
      : [];
    let seasonalServiceDropoffRow: MatrixRow | null = null;
    if (runSeasonalServiceDropoff) {
      const existingSeasonalServiceDropoffRow =
        only === "seasonal-service-dropoff" ? existingCitedSeasonalServiceDropoffRow(bundle) : null;
      if (existingSeasonalServiceDropoffRow) {
        seasonalServiceDropoffRow = existingSeasonalServiceDropoffRow;
      } else {
        try {
          const seasonalService = await fetchOsmSeasonalServiceCounts(target);
          seasonalServiceDropoffRow = buildOsmSeasonalServiceDropoffRow({
            target,
            counts: seasonalService.counts,
            endpoint: seasonalService.endpoint,
            verifiedDate,
          });
        } catch (error) {
          console.warn(
            `${target.id}: OSM seasonal-service adapter left source gap: ${
              (error as Error).message
            }`,
          );
        }
      }
    }
    let emergencyVetRow: MatrixRow | null = null;
    if (runEmergencyVet) {
      const existingEmergencyVetRow =
        only === "emergency-vet" ? existingCitedEmergencyVetProxyRow(bundle) : null;
      if (existingEmergencyVetRow) {
        emergencyVetRow = existingEmergencyVetRow;
      } else {
        try {
          const emergencyVet = await fetchOsmEmergencyVetCounts(target);
          emergencyVetRow = buildOsmEmergencyVetProxyRow({
            target,
            counts: emergencyVet.counts,
            endpoint: emergencyVet.endpoint,
            verifiedDate,
          });
        } catch (error) {
          console.warn(
            `${target.id}: OSM emergency-vet adapter left source gap: ${(error as Error).message}`,
          );
        }
      }
    }
    const familyAmenityRow = runAll
      ? buildFamilyAmenityDensityRow({
          target,
          rows: bundle.rows,
          verifiedDate,
        })
      : null;
    const carDependencyComponentRows = [
      ...accessRows,
      ...routeRows,
      ...(citizenServiceRow ? [citizenServiceRow] : []),
      ...(busFrequencyRow ? [busFrequencyRow] : []),
      ...(familyAmenityRow ? [familyAmenityRow] : []),
    ];
    const carDependencyRow = runCarDependency
      ? buildCarDependencyProxyRow({
          bundle:
            carDependencyComponentRows.length > 0
              ? replaceRows(bundle, carDependencyComponentRows)
              : bundle,
          verifiedDate,
        })
      : null;
    const blueFlagRow =
      runBlueFlag && blueFlagAwards
        ? buildBlueFlagBeachRow({
            bundle,
            awards: blueFlagAwards,
            verifiedDate,
          })
        : null;
    const seatracAccessibleRow =
      runSeatracAccessible && seatracDirectories
        ? buildSeatracAccessibleBeachRow({
            bundle,
            directories: seatracDirectories,
            verifiedDate,
          })
        : null;
    const familyAmenityRows = familyAmenityRow ? [familyAmenityRow] : [];
    const rows = [
      ...accessRows,
      ...outdoorRows,
      ...routeRows,
      ...environmentRows,
      ...terrainRows,
      ...(mountainRow ? [mountainRow] : []),
      ...(protectedAreaDistanceRow ? [protectedAreaDistanceRow] : []),
      ...(greenUrbanRow ? [greenUrbanRow] : []),
      ...(sceneryTagRow ? [sceneryTagRow] : []),
      ...(uvIndexRow ? [uvIndexRow] : []),
      ...(pollenSeverityRow ? [pollenSeverityRow] : []),
      ...(citizenServiceRow ? [citizenServiceRow] : []),
      ...(taxOfficeRow ? [taxOfficeRow] : []),
      ...(residencePermitOfficeRow ? [residencePermitOfficeRow] : []),
      ...(landRegistryOfficeRow ? [landRegistryOfficeRow] : []),
      ...(internationalSchoolRow ? [internationalSchoolRow] : []),
      ...(internationalSchoolTuitionRow ? [internationalSchoolTuitionRow] : []),
      ...(pharmacyDutyRow ? [pharmacyDutyRow] : []),
      ...(municipalDigitalServicesRow ? [municipalDigitalServicesRow] : []),
      ...(waterRestrictionHistoryRow ? [waterRestrictionHistoryRow] : []),
      ...(waterStressBaselineRow ? [waterStressBaselineRow] : []),
      ...(surfaceWaterRow ? [surfaceWaterRow] : []),
      ...forestTreeRows,
      ...(droughtFrequencyRow ? [droughtFrequencyRow] : []),
      ...(lightPollutionRow ? [lightPollutionRow] : []),
      ...(wildfireEgressRow ? [wildfireEgressRow] : []),
      ...(busFrequencyRow ? [busFrequencyRow] : []),
      ...(airportSummerDirectDestinationRow ? [airportSummerDirectDestinationRow] : []),
      ...manualTransportScheduleRows,
      ...(cruisePassengerPressureRow ? [cruisePassengerPressureRow] : []),
      ...(seasonalServiceDropoffRow ? [seasonalServiceDropoffRow] : []),
      ...(emergencyVetRow ? [emergencyVetRow] : []),
      ...familyAmenityRows,
      ...(carDependencyRow ? [carDependencyRow] : []),
      ...(blueFlagRow ? [blueFlagRow] : []),
      ...(seatracAccessibleRow ? [seatracAccessibleRow] : []),
    ];
    accessTownRows.push(accessRows);
    outdoorTownRows.push(outdoorRows);
    routeTownRows.push(routeRows);
    environmentTownRows.push(environmentRows);
    terrainTownRows.push(terrainRows);
    mountainTownRows.push(mountainRow);
    protectedAreaDistanceTownRows.push(protectedAreaDistanceRow);
    greenUrbanTownRows.push(greenUrbanRow);
    sceneryTagTownRows.push(sceneryTagRow);
    uvIndexTownRows.push(uvIndexRow);
    pollenSeverityTownRows.push(pollenSeverityRow);
    citizenServiceTownRows.push(citizenServiceRow);
    taxOfficeTownRows.push(taxOfficeRow);
    residencePermitOfficeTownRows.push(residencePermitOfficeRow);
    landRegistryOfficeTownRows.push(landRegistryOfficeRow);
    internationalSchoolTownRows.push(internationalSchoolRow);
    internationalSchoolTuitionTownRows.push(internationalSchoolTuitionRow);
    carDependencyTownRows.push(carDependencyRow);
    pharmacyDutyTownRows.push(pharmacyDutyRow);
    waterRestrictionHistoryTownRows.push(waterRestrictionHistoryRow);
    waterStressBaselineTownRows.push(waterStressBaselineRow);
    surfaceWaterTownRows.push(surfaceWaterRow);
    forestCoverTownRows.push(forestTreeRows.find((row) => row.key === "forest_cover_pct") ?? null);
    treeCanopyTownRows.push(forestTreeRows.find((row) => row.key === "tree_canopy_pct") ?? null);
    droughtFrequencyTownRows.push(droughtFrequencyRow);
    lightPollutionTownRows.push(lightPollutionRow);
    wildfireEgressTownRows.push(wildfireEgressRow);
    busFrequencyTownRows.push(busFrequencyRow);
    cruisePassengerPressureTownRows.push(cruisePassengerPressureRow);
    seasonalServiceDropoffTownRows.push(seasonalServiceDropoffRow);
    emergencyVetTownRows.push(emergencyVetRow);
    familyAmenityTownRows.push(familyAmenityRow);
    const changedRows = filterChangedReplacementRows(bundle, rows);
    if (changedRows.length > 0) {
      changedBundles.push(`${id}: ${changedRows.map((row) => row.key).join(", ")}`);
      if (write) writeBundle(replaceRows(bundle, changedRows));
    }
  }

  if (regionId) {
    const region = readBundle(regionId);
    const regionRows = [
      ...(runTransportScheduleManual
        ? buildManualTransportScheduleRowsForBundle({
            bundle: region,
            records: manualTransportScheduleRecords.get(regionId) ?? [],
            verifiedDate,
          })
        : []),
      ...(runAll
        ? summarizeRegionalOsmAccessRows({
            regionName: region.placeName,
            townRows: accessTownRows,
            verifiedDate,
          })
        : []),
      ...(runAll
        ? summarizeRegionalRouteRows({
            regionName: region.placeName,
            townRows: routeTownRows,
            verifiedDate,
          })
        : []),
      ...(runAll && outdoorTownRows.every((rows) => rows.length > 0)
        ? summarizeRegionalOsmOutdoorRows({
            regionName: region.placeName,
            townRows: outdoorTownRows,
            verifiedDate,
          })
        : []),
      ...(runAll
        ? summarizeRegionalOpenMeteoEnvironmentRows({
            regionName: region.placeName,
            townRows: environmentTownRows,
            verifiedDate,
          })
        : []),
      ...(terrainTownRows.every((rows) => rows.length > 0)
        ? summarizeRegionalTerrainSlopeRows({
            regionName: region.placeName,
            townRows: terrainTownRows,
            verifiedDate,
          })
        : []),
      ...(mountainTownRows.every(Boolean)
        ? [
            summarizeRegionalMountainProximityRows({
              regionName: region.placeName,
              townRows: mountainTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(protectedAreaDistanceTownRows.every(Boolean)
        ? [
            summarizeRegionalProtectedAreaDistanceRows({
              regionName: region.placeName,
              townRows: protectedAreaDistanceTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(greenUrbanTownRows.every(Boolean)
        ? [
            summarizeRegionalGreenUrbanProxyRows({
              regionName: region.placeName,
              townRows: greenUrbanTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(sceneryTagTownRows.every(Boolean)
        ? [
            summarizeRegionalSceneryTagsRows({
              regionName: region.placeName,
              townRows: sceneryTagTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(uvIndexTownRows.every(Boolean)
        ? [
            summarizeRegionalOpenMeteoUvIndexRows({
              regionName: region.placeName,
              townRows: uvIndexTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(pollenSeverityTownRows.every(Boolean)
        ? [
            summarizeRegionalOpenMeteoPollenSeverityRows({
              regionName: region.placeName,
              townRows: pollenSeverityTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(citizenServiceTownRows.every(Boolean)
        ? [
            summarizeRegionalCitizenServiceCentreDistanceRows({
              regionName: region.placeName,
              townRows: citizenServiceTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(taxOfficeTownRows.every(Boolean)
        ? [
            summarizeRegionalTaxOfficeDistanceRows({
              regionName: region.placeName,
              townRows: taxOfficeTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(residencePermitOfficeTownRows.every(Boolean)
        ? [
            summarizeRegionalResidencePermitOfficeDistanceRows({
              regionName: region.placeName,
              townRows: residencePermitOfficeTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(landRegistryOfficeTownRows.every(Boolean)
        ? [
            summarizeRegionalLandRegistryOfficeDistanceRows({
              regionName: region.placeName,
              townRows: landRegistryOfficeTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(internationalSchoolTownRows.every(Boolean)
        ? [
            summarizeRegionalInternationalSchoolDistanceRows({
              regionName: region.placeName,
              townRows: internationalSchoolTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(internationalSchoolTuitionTownRows.every(Boolean)
        ? [
            buildInternationalSchoolTuitionRow({
              bundle: region,
              source: {
                ...CRETE_INTERNATIONAL_SCHOOL_TUITION_SOURCE,
                coverageStatus: "regional",
              },
              verifiedDate,
            }),
          ]
        : []),
      ...(pharmacyDutyTownRows.every(Boolean)
        ? [
            summarizeRegionalAfterHoursPharmacyProxyRows({
              regionName: region.placeName,
              townRows: pharmacyDutyTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(runMunicipalDigitalServices
        ? [
            buildMunicipalDigitalServicesRow({
              bundle: region,
              source: MUNICIPAL_DIGITAL_SERVICE_SOURCES[region.id] as MunicipalDigitalServiceSource,
              verifiedDate,
            }),
          ]
        : []),
      ...(waterRestrictionHistoryTownRows.every(Boolean)
        ? [
            summarizeRegionalWaterRestrictionHistoryRows({
              region,
              townRows: waterRestrictionHistoryTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(runWaterStressBaseline && waterStressBaselineTownRows.every(Boolean)
        ? [
            buildWriAqueductWaterStressBaselineRow({
              bundle: region,
              source: CRETE_WRI_AQUEDUCT_WATER_STRESS_BASELINE,
              verifiedDate,
            }),
          ]
        : []),
      ...(surfaceWaterTownRows.every(Boolean)
        ? [
            summarizeRegionalOsmSurfaceWaterDensityRows({
              regionName: region.placeName,
              townRows: surfaceWaterTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(forestCoverTownRows.every(Boolean)
        ? [
            summarizeRegionalCopernicusHrlRows({
              regionName: region.placeName,
              townRows: forestCoverTownRows,
              key: "forest_cover_pct",
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(treeCanopyTownRows.every(Boolean)
        ? [
            summarizeRegionalCopernicusHrlRows({
              regionName: region.placeName,
              townRows: treeCanopyTownRows,
              key: "tree_canopy_pct",
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(droughtFrequencyTownRows.every(Boolean)
        ? [
            summarizeRegionalEdoCdiDroughtFrequencyRows({
              regionName: region.placeName,
              townRows: droughtFrequencyTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(lightPollutionTownRows.every(Boolean)
        ? [
            summarizeRegionalViirsLightPollutionRows({
              regionName: region.placeName,
              townRows: lightPollutionTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(wildfireEgressTownRows.every(Boolean)
        ? [
            summarizeRegionalOsmWildfireEgressProxyRows({
              regionName: region.placeName,
              townRows: wildfireEgressTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(busFrequencyTownRows.every(Boolean)
        ? [
            summarizeRegionalBusFrequencyProxyRows({
              regionName: region.placeName,
              townRows: busFrequencyTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(cruisePassengerPressureTownRows.every(Boolean)
        ? [
            summarizeRegionalCruisePassengerPressureRows({
              region,
              townRows: cruisePassengerPressureTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(seasonalServiceDropoffTownRows.every(Boolean)
        ? [
            summarizeRegionalOsmSeasonalServiceDropoffRows({
              regionName: region.placeName,
              townRows: seasonalServiceDropoffTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(emergencyVetTownRows.every(Boolean)
        ? [
            summarizeRegionalOsmEmergencyVetProxyRows({
              regionName: region.placeName,
              townRows: emergencyVetTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(familyAmenityTownRows.every(Boolean)
        ? [
            summarizeRegionalFamilyAmenityRows({
              regionName: region.placeName,
              townRows: familyAmenityTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(carDependencyTownRows.every(Boolean)
        ? [
            summarizeRegionalCarDependencyProxyRows({
              regionName: region.placeName,
              townRows: carDependencyTownRows,
              verifiedDate,
            }),
          ].filter((row): row is MatrixRow => Boolean(row))
        : []),
      ...(runBlueFlag && blueFlagAwards
        ? [
            buildBlueFlagBeachRow({
              bundle: region,
              awards: blueFlagAwards,
              verifiedDate,
            }),
          ]
        : []),
      ...(runSeatracAccessible && seatracDirectories
        ? [
            buildSeatracAccessibleBeachRow({
              bundle: region,
              directories: seatracDirectories,
              verifiedDate,
            }),
          ]
        : []),
    ];
    const changedRegionRows = filterChangedReplacementRows(region, regionRows);
    if (changedRegionRows.length > 0) {
      changedBundles.push(`${regionId}: ${changedRegionRows.map((row) => row.key).join(", ")}`);
      if (write) writeBundle(replaceRows(region, changedRegionRows));
    }
  }

  return { write, changedBundles };
}

async function main() {
  const args = parseAdapterCliArgs(process.argv);
  const result = await runOsmAccessAdapter(args);
  console.log(JSON.stringify(buildAdapterCliReport(args, result), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
