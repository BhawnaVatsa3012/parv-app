import { describe, it, expect } from "vitest";
import { defaultLayersFor, effectiveLayers, normalizeLayers, systemOf, TRADITIONS, LAYER_IDS } from "@/lib/layers";
import { hijriOf, hijriLabel, hijriSpan } from "@/lib/hijri";
import { tabularShawwal } from "../scripts/festival-dates/hijri.mjs";
import { festivals } from "@/lib/data";
import { FESTIVAL_DATES } from "@/lib/festivalDates";

describe("calendar layer defaults by tradition", () => {
  it("maps each tradition to its starting layers", () => {
    expect(defaultLayersFor("hindu")).toEqual(["panchang"]);
    expect(defaultLayersFor("muslim")).toEqual(["hijri"]);
    expect(defaultLayersFor("christian")).toEqual([]);
    ["sikh", "jain", "buddhist"].forEach((t) => expect(defaultLayersFor(t), t).toEqual(["panchang"]));
    expect(defaultLayersFor("tribal")).toEqual([]);
    expect(TRADITIONS.map((t) => t.label)).toContain("Tribal and folk");
  });
  it("covers every tradition offered at setup, and falls back to Hindu Panchang", () => {
    TRADITIONS.forEach((t) => expect(Array.isArray(defaultLayersFor(t.id)), t.id).toBe(true));
    expect(defaultLayersFor("")).toEqual(["panchang"]);
    expect(defaultLayersFor(undefined)).toEqual(["panchang"]);
  });
  it("returns a copy, so editing a default never changes the table", () => {
    defaultLayersFor("hindu").push("hijri");
    expect(defaultLayersFor("hindu")).toEqual(["panchang"]);
  });
});

describe("effective layers", () => {
  it("keeps today's behaviour (Hindu Panchang on) for users with no choice yet", () => {
    expect(effectiveLayers(null)).toEqual(["panchang"]);
    expect(effectiveLayers(undefined)).toEqual(["panchang"]);
  });
  it("respects an explicit choice, including none", () => {
    expect(effectiveLayers([])).toEqual([]);
    expect(effectiveLayers(["hijri"])).toEqual(["hijri"]);
    expect(effectiveLayers(["hijri", "panchang"])).toEqual(["panchang", "hijri"]);
  });
  it("drops unknown ids and duplicates", () => {
    expect(normalizeLayers(["hijri", "hijri", "nope", 3])).toEqual(["hijri"]);
    expect(normalizeLayers("panchang")).toBeNull();
    expect(effectiveLayers("garbage")).toEqual(["panchang"]);
    expect(LAYER_IDS).toEqual(["panchang", "hijri"]);
  });
});

describe("festival's own calendar", () => {
  it("is set for every festival, independent of layers", () => {
    const by = Object.fromEntries(festivals.map((f) => [f.id, systemOf(f)]));
    expect(by.eid).toBe("hijri");
    expect(by.christmas).toBe("gregorian");
    expect(by.vaisakhi).toBe("solar");
    expect(by.bihu).toBe("solar");
    expect(by.diwali).toBe("lunar");
    expect(by.mahavir).toBe("lunar");
    expect(by.buddha).toBe("lunar");
  });
});

describe("tabular Hijri date", () => {
  it("agrees with tabularShawwal in scripts/festival-dates/hijri.mjs", () => {
    for (let hy = 1447; hy <= 1452; hy++) {
      const t = tabularShawwal(hy);
      const h = hijriOf(t.y, t.m, t.d);
      expect([h.y, h.m + 1, h.d], `1 Shawwal ${hy}`).toEqual([hy, 10, 1]);
    }
  });
  it("lands within two days of the expected Eid date in the app", () => {
    for (let y = 2026; y <= 2030; y++) {
      const [m, d] = FESTIVAL_DATES.eid[y].eid.split("-").map(Number);
      const h = hijriOf(y, m - 1, d);
      const off = h.m === 9 ? h.d - 1 : h.m === 8 ? h.d - 30 : NaN; // days after 1 Shawwal (negative: before)
      expect(Math.abs(off), `Eid ${y} -> ${hijriLabel(h)}`).toBeLessThanOrEqual(2);
    }
  });
  it("counts days consecutively, with months of 29 or 30 days", () => {
    let prev = hijriOf(2026, 0, 1);
    for (let i = 1; i < 800; i++) {
      const h = hijriOf(2026, 0, 1 + i);
      if (h.d === prev.d + 1) expect([h.y, h.m]).toEqual([prev.y, prev.m]);
      else { expect(h.d).toBe(1); expect(prev.d).toBeGreaterThanOrEqual(29); }
      prev = h;
    }
  });
  it("labels and spans", () => {
    const h = hijriOf(2026, 2, 21);
    expect(hijriLabel(h)).toMatch(/^\d+ [A-Za-z' -]+ 1447 AH$/);
    expect(hijriSpan(2026, 2)).toMatch(/1447/);
  });
});
