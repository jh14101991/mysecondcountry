// Numbeo cost-of-living client. Numbeo is a PAID API and its ToS prohibits bulk HTML
// scraping, so this client only ever calls the official API and only when a key is
// passed in (the caller reads it from the environment; no secrets live in this package).
// Numbeo data is LOW confidence and must not be redistributed raw (SOURCES.md, CITATIONS.md):
// store only the extracted figure in a CitedValue, always rendered with a LOW badge.

import type { FetchOptions } from "./eurostat.js";

const BASE = "https://www.numbeo.com/api";
const UA = "MySecondCountryBot/1.0 (+https://mysecondcountry.com; data refresh)";

export class NumbeoNoKeyError extends Error {
  constructor() {
    super("No Numbeo API key supplied; field omitted (ToS forbids scraping).");
    this.name = "NumbeoNoKeyError";
  }
}

export interface NumbeoOptions extends FetchOptions {
  apiKey?: string;
}

/** Raw city_prices response for a city. Throws NumbeoNoKeyError without a key. */
export async function fetchNumbeoCityCost(
  city: string,
  opts: NumbeoOptions = {},
): Promise<unknown> {
  if (!opts.apiKey) throw new NumbeoNoKeyError();
  const fetchImpl = opts.fetchImpl ?? fetch;
  const search = new URLSearchParams({ api_key: opts.apiKey, query: city });
  const url = `${BASE}/city_prices?${search.toString()}`;
  const res = await fetchImpl(url, {
    headers: { "user-agent": UA, accept: "application/json" },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000),
  });
  // Do not log the key.
  console.log(`[numbeo] city_prices "${city}" -> ${res.status} @ ${new Date().toISOString()}`);
  if (!res.ok) throw new Error(`Numbeo returned ${res.status}`);
  return await res.json();
}
