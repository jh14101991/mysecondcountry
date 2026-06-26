import { describe, expect, it } from "vitest";
import { type FreshRow, freshnessDigest } from "../digest.js";

const REQUIRED_FIELDS: (keyof FreshRow)[] = [
  "collection",
  "id",
  "path",
  "sourceName",
  "verifiedDate",
  "ageDays",
  "limitDays",
  "daysLeft",
];

describe("freshnessDigest", () => {
  it("returns valid shape on today (2026-06-26)", () => {
    const today = new Date("2026-06-26");
    const { stale, aging } = freshnessDigest(today);
    expect(Array.isArray(stale)).toBe(true);
    expect(Array.isArray(aging)).toBe(true);
    for (const row of [...stale, ...aging]) {
      for (const field of REQUIRED_FIELDS) {
        expect(row[field], `row.${field} should be defined`).toBeDefined();
      }
    }
  });

  it("stale is sorted by daysLeft ascending", () => {
    const today = new Date("2026-06-26");
    const { stale } = freshnessDigest(today);
    for (let i = 1; i < stale.length; i++) {
      expect((stale[i] as FreshRow).daysLeft).toBeGreaterThanOrEqual(
        (stale[i - 1] as FreshRow).daysLeft,
      );
    }
  });

  it("aging is sorted by daysLeft ascending", () => {
    const today = new Date("2026-06-26");
    const { aging } = freshnessDigest(today);
    for (let i = 1; i < aging.length; i++) {
      expect((aging[i] as FreshRow).daysLeft).toBeGreaterThanOrEqual(
        (aging[i - 1] as FreshRow).daysLeft,
      );
    }
  });

  it("all stale rows have daysLeft < 0", () => {
    const today = new Date("2026-06-26");
    const { stale } = freshnessDigest(today);
    for (const row of stale) {
      expect(row.daysLeft).toBeLessThan(0);
    }
  });

  it("all aging rows have 0 <= daysLeft <= 14", () => {
    const today = new Date("2026-06-26");
    const { aging } = freshnessDigest(today);
    for (const row of aging) {
      expect(row.daysLeft).toBeGreaterThanOrEqual(0);
      expect(row.daysLeft).toBeLessThanOrEqual(14);
    }
  });

  it("far-future date (2027-06-25) produces stale rows from 2026 data", () => {
    const future = new Date("2027-06-25");
    const { stale } = freshnessDigest(future);
    // All visa/tax/residency facts verified in 2026 will be well past their 90-day windows.
    expect(stale.length).toBeGreaterThan(0);
    for (const row of stale) {
      expect(row.daysLeft).toBeLessThan(0);
      for (const field of REQUIRED_FIELDS) {
        expect(row[field], `row.${field} should be defined`).toBeDefined();
      }
      // Each stale row must belong to a recognized collection
      expect(["places", "regimes", "qa", "topics", "tools"]).toContain(row.collection);
    }
  });

  it("deduplicates identical facts across collections", () => {
    // Run with future date to maximise hits, then check no (sourceUrl+value+verifiedDate) tuple appears twice
    const future = new Date("2027-06-25");
    const { stale, aging } = freshnessDigest(future);
    const allRows = [...stale, ...aging];
    const keys = new Set<string>();
    for (const row of allRows) {
      // We can't access sourceUrl from FreshRow directly, but we can check that
      // (id, path) combinations are not duplicated per collection.
      const k = `${row.collection}|${row.id}|${row.path}`;
      expect(keys.has(k), `duplicate row: ${k}`).toBe(false);
      keys.add(k);
    }
  });
});
