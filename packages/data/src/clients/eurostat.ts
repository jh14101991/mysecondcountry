// Eurostat dissemination REST client. Returns raw JSON-stat; no transformation beyond a
// small helper to pull the latest annual value for a single-geo query. Free, no key.
// HIGH confidence source (SOURCES.md). Pure given the injected fetch.

export interface FetchOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";
const UA = "MySecondCountryBot/1.0 (+https://mysecondcountry.com; data refresh)";

export interface EurostatResponse {
  value?: Record<string, number>;
  dimension?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function fetchEurostat(
  datasetCode: string,
  params: Record<string, string> = {},
  opts: FetchOptions = {},
): Promise<EurostatResponse> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const search = new URLSearchParams({ format: "JSON", lang: "EN", ...params });
  const url = `${BASE}/${datasetCode}?${search.toString()}`;
  const res = await fetchImpl(url, {
    headers: { "user-agent": UA, accept: "application/json" },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000),
  });
  console.log(`[eurostat] ${url} -> ${res.status} @ ${new Date().toISOString()}`);
  if (!res.ok) throw new Error(`Eurostat ${datasetCode} returned ${res.status}`);
  return (await res.json()) as EurostatResponse;
}

/**
 * Latest annual value for a single-geo JSON-stat response (e.g. tec00120 with geo=EL).
 * With one geo dimension the value index collapses to the time position.
 */
export function latestEurostatValue(
  resp: EurostatResponse,
): { year: string; value: number } | null {
  const timeIndex = (resp.dimension as { time?: { category?: { index?: Record<string, number> } } })
    ?.time?.category?.index;
  const values = resp.value;
  if (!timeIndex || !values) return null;
  const years = Object.entries(timeIndex).sort((a, b) => b[0].localeCompare(a[0]));
  for (const [year, pos] of years) {
    const v = values[String(pos)];
    if (typeof v === "number") return { year, value: v };
  }
  return null;
}
