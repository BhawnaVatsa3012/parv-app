import { describe, it, expect } from "vitest";
import { festivals, storyData } from "@/lib/data";
import { REGION_STATES } from "@/lib/regions";
import { FESTIVAL_DATES } from "@/lib/festivalDates";
import { occurrence, years, fillDates } from "@/lib/occurrence";
import { checklistItems } from "@/lib/checklists";
import { HI, HUE } from "@/lib/design";

const COMMUNITIES = ["Hindu", "Sikh", "Jain", "Buddhist", "Christian", "Muslim"];
// One free story per community (a label only: nothing reads freeStory yet).
const FREE = ["diwali", "vaisakhi", "mahavir", "buddha", "christmas", "eid"];
// Older entries with short stories or a region left unmapped; held to the looser checks only.
const LEGACY = new Set(["bhaidooj", "teej", "newyear"]);

describe("festival library", () => {
  it("has a community on every festival and the agreed free-story labels", () => {
    festivals.forEach((f) => expect(COMMUNITIES, f.id).toContain(f.community));
    expect(festivals.filter((f) => f.freeStory).map((f) => f.id).sort()).toEqual([...FREE].sort());
  });

  it.each(festivals.map((f) => f.id))("%s is fully wired", (id) => {
    const d = storyData[id];
    expect(d, "story").toBeTruthy();
    expect(HI[id], "Hindi label").toBeTruthy();
    expect(HUE[id], "hue").toBeTypeOf("number");
    expect(d.regions.length).toBeGreaterThanOrEqual(1);
    d.regions.forEach((r) => {
      if (!LEGACY.has(id)) expect(r.text.length, `${id}/${r.name} text`).toBeGreaterThan(200);
      expect(r.source, `${id}/${r.name} source`).toBeTruthy();
    });
    // Every regional story is mapped to states (possibly none, for stories abroad).
    const mapped = Object.keys(REGION_STATES[id] || {}).sort();
    const names = d.regions.map((r) => r.name).sort();
    if (LEGACY.has(id)) mapped.forEach((n) => expect(names, `${id} mapping`).toContain(n));
    else expect(mapped, "region mapping").toEqual(names);
    expect((d.rituals || []).length).toBeGreaterThanOrEqual(1);
    expect(checklistItems(id).length).toBeGreaterThan(3);
    // Dates exist for every year, and every {token} in story text resolves.
    expect(years(id)).toEqual([2026, 2027, 2028, 2029, 2030]);
    years(id).forEach((y) => {
      expect(occurrence(id, y), `${id} ${y}`).toBeTruthy();
      const texts = [...d.regions.map((r) => r.date), ...d.rituals.map((r) => r.when)];
      texts.forEach((t) => expect(fillDates(t, id, y), `${id} ${y}: ${t}`).not.toMatch(/\{\w/));
    });
  });

  it("keeps the generated dates for Mahavir Jayanti", () => {
    expect(Object.fromEntries(Object.entries(FESTIVAL_DATES.mahavir).map(([y, v]) => [y, v.mahavir]))).toEqual({ 2026: "3-31", 2027: "4-19", 2028: "4-7", 2029: "4-26", 2030: "4-16" });
  });

  it("keeps the generated dates for Buddha Purnima", () => {
    expect(Object.fromEntries(Object.entries(FESTIVAL_DATES.buddha).map(([y, v]) => [y, v.buddha]))).toEqual({ 2026: "5-1", 2027: "5-20", 2028: "5-8", 2029: "5-27", 2030: "5-17" });
  });

  it("keeps the expected dates for Eid al-Fitr (1 Shawwal in India)", () => {
    expect(Object.fromEntries(Object.entries(FESTIVAL_DATES.eid).map(([y, v]) => [y, v.eid]))).toEqual({ 2026: "3-21", 2027: "3-10", 2028: "2-27", 2029: "2-15", 2030: "2-5" });
    expect(Object.fromEntries(Object.entries(FESTIVAL_DATES.eid).map(([y, v]) => [y, v.eve]))).toEqual({ 2026: "3-20", 2027: "3-9", 2028: "2-26", 2029: "2-14", 2030: "2-4" });
  });

  it("labels Eid as expected, with its Hijri date", () => {
    const o = occurrence("eid", 2027);
    expect(o.label).toBe("Expected Mar 10, 2027");
    expect(o.hijri).toBe("1 Shawwal 1448 AH");
  });

  it("keeps Christmas on 24 and 25 December", () => {
    for (const y of [2026, 2027, 2028, 2029, 2030]) expect(FESTIVAL_DATES.christmas[y]).toEqual({ eve: "12-24", christmas: "12-25" });
  });

  it("keeps the generated dates for Vaisakhi", () => {
    expect(Object.fromEntries(Object.entries(FESTIVAL_DATES.vaisakhi).map(([y, v]) => [y, v.vaisakhi]))).toEqual({ 2026: "4-14", 2027: "4-14", 2028: "4-13", 2029: "4-14", 2030: "4-14" });
  });
});
