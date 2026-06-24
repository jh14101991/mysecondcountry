// World Bank Indicators API client. Returns the raw [metadata, data] tuple; no
// transformation. Free, no key. HIGH confidence for macro baselines on non-EU Europe
// where Eurostat has no coverage (SOURCES.md). Pure given the injected fetch.

import type { FetchOptions } from "./eurostat.js";

const BASE = "https://api.worldbank.org/v2";
const UA = "MySecondCountryBot/1.0 (+https://mysecondcountry.com; data refresh)";

export interface WorldBankPoint {
  date: string;
  value: number | null;
  [key: string]: unknown;
}

/** Returns the raw World Bank response: [metadataObject, dataPointArray]. Throws on non-200. */
export async function fetchWorldBank(
  countryIso: string,
  indicator: string,
  params: Record<string, string> = {},
  opts: FetchOptions = {},
): Promise<[Record<string, unknown>, WorldBankPoint[]]> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const search = new URLSearchParams({ format: "json", per_page: "100", ...params });
  const url = `${BASE}/country/${countryIso}/indicator/${indicator}?${search.toString()}`;
  const res = await fetchImpl(url, {
    headers: { "user-agent": UA, accept: "application/json" },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000),
  });
  console.log(`[worldbank] ${url} -> ${res.status} @ ${new Date().toISOString()}`);
  if (!res.ok) throw new Error(`World Bank ${indicator} returned ${res.status}`);
  const json = (await res.json()) as unknown;
  if (!Array.isArray(json) || json.length < 2) {
    throw new Error(`World Bank ${indicator}: unexpected response shape`);
  }
  return json as [Record<string, unknown>, WorldBankPoint[]];
}

/** Most recent non-null data point. */
export function latestWorldBankValue(
  data: WorldBankPoint[],
): { year: string; value: number } | null {
  for (const point of data) {
    if (typeof point.value === "number") return { year: point.date, value: point.value };
  }
  return null;
}
