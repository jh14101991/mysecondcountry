import { describe, expect, it, vi } from "vitest";
import { fetchEurostat, latestEurostatValue } from "../clients/eurostat.js";
import { fetchNumbeoCityCost, NumbeoNoKeyError } from "../clients/numbeo.js";
import { fetchWorldBank, latestWorldBankValue } from "../clients/worldbank.js";

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe("eurostat client (hermetic)", () => {
  it("returns raw JSON and extracts the latest annual value", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse(200, {
        value: { "0": 86.5, "1": 87.4 },
        dimension: { time: { category: { index: { "2024": 0, "2025": 1 } } } },
      }),
    );
    const resp = await fetchEurostat("tec00120", { geo: "EL" }, { fetchImpl });
    expect(latestEurostatValue(resp)).toEqual({ year: "2025", value: 87.4 });
  });

  it("throws on non-200", async () => {
    const fetchImpl = vi.fn(async () => mockResponse(500, {}));
    await expect(fetchEurostat("tec00120", {}, { fetchImpl })).rejects.toThrow();
  });
});

describe("worldbank client (hermetic)", () => {
  it("returns the [meta, data] tuple and the latest non-null value", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse(200, [
        { page: 1 },
        [
          { date: "2024", value: null },
          { date: "2023", value: 0.6 },
        ],
      ]),
    );
    const [, data] = await fetchWorldBank("GR", "PA.NUS.PPPC.RF", {}, { fetchImpl });
    expect(latestWorldBankValue(data)).toEqual({ year: "2023", value: 0.6 });
  });

  it("throws on non-200", async () => {
    const fetchImpl = vi.fn(async () => mockResponse(404, {}));
    await expect(fetchWorldBank("GR", "X", {}, { fetchImpl })).rejects.toThrow();
  });
});

describe("numbeo client (hermetic)", () => {
  it("throws NumbeoNoKeyError when no key is supplied", async () => {
    await expect(fetchNumbeoCityCost("Chania", { fetchImpl: vi.fn() })).rejects.toBeInstanceOf(
      NumbeoNoKeyError,
    );
  });

  it("returns data when a key is supplied", async () => {
    const fetchImpl = vi.fn(async () => mockResponse(200, { prices: [] }));
    const data = await fetchNumbeoCityCost("Chania", { apiKey: "k", fetchImpl });
    expect(data).toEqual({ prices: [] });
  });
});
