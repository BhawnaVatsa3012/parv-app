import { describe, it, expect } from "vitest";
import { hijriKeyDaysForMonth, hijriKeyDayOn, keyDayOfHijri, HIJRI_KEYDAY_NOTE } from "@/lib/hijriMarkers";
import { hijriOf } from "@/lib/hijri";
import { festivals } from "@/lib/data";

// Published expectations (Saudi Arabia / India), [month 1-12, day]. Tabular must be within 2 days.
const EXPECTED = {
  2026: { ramadan: [2, 18], eidfitr: [3, 20], eidadha: [5, 27], newyear: [6, 16] },
  2027: { ramadan: [2, 8], eidfitr: [3, 9], eidadha: [5, 16], newyear: [6, 6] },
  2028: { ramadan: [1, 28], eidfitr: [2, 26], eidadha: [5, 5], newyear: [5, 25] },
  2029: { ramadan: [1, 16], eidfitr: [2, 14], eidadha: [4, 24], newyear: [5, 14] },
  2030: { ramadan: [1, 5], eidfitr: [2, 4], eidadha: [4, 13], newyear: [5, 4] },
};
const days = (a, b) => Math.abs(a - b) / 864e5;

function found(y) {
  const out = {};
  for (let m = 0; m < 12; m++) for (const [d, k] of Object.entries(hijriKeyDaysForMonth(y, m))) (out[k.id] = out[k.id] || []).push(Date.UTC(y, m, +d));
  return out;
}

describe("Hijri key-day markers", () => {
  for (const y of Object.keys(EXPECTED)) {
    it(`${y}: each key day within 2 days of published expectations`, () => {
      const f = found(+y);
      for (const [id, [m, d]] of Object.entries(EXPECTED[y])) {
        expect(f[id]?.length, `${id} ${y}`).toBeGreaterThanOrEqual(1);
        expect(Math.min(...f[id].map((t) => days(t, Date.UTC(+y, m - 1, d)))), `${id} ${y}`).toBeLessThanOrEqual(2);
      }
    });
  }
  it("classifies only the four Hijri dates", () => {
    expect(keyDayOfHijri({ d: 1, m: 8 })).toBe("ramadan");
    expect(keyDayOfHijri({ d: 1, m: 9 })).toBe("eidfitr");
    expect(keyDayOfHijri({ d: 10, m: 11 })).toBe("eidadha");
    expect(keyDayOfHijri({ d: 1, m: 0 })).toBe("newyear");
    expect(keyDayOfHijri({ d: 2, m: 8 })).toBeNull();
    expect(keyDayOfHijri({ d: 10, m: 0 })).toBeNull();
  });
  it("uses the festival's own Eid al-Fitr date where it differs from the tabular 1 Shawwal (2026)", () => {
    // Tabular 1 Shawwal 1447 is 20 March 2026; the festival's rule gives 21 March.
    const h = hijriOf(2026, 2, 20);
    expect(h.m).toBe(9); expect(h.d).toBe(1);
    const mar = hijriKeyDaysForMonth(2026, 2);
    expect(mar[21]).toMatchObject({ id: "eidfitr", source: "festival" });
    expect(mar[20]).toBeUndefined();
  });
  it("matches the festival's date for every year it covers", async () => {
    const { occurrence } = await import("@/lib/occurrence");
    for (const y of [2026, 2027, 2028, 2029, 2030]) {
      const o = occurrence("eid", y).days[0];
      expect(hijriKeyDaysForMonth(o.y, o.m)[o.d]?.id, String(y)).toBe("eidfitr");
    }
  });
  it("falls back to the tabular date outside the festival's years", () => {
    const f = found(2031);
    expect(f.eidfitr).toHaveLength(1);
    expect(hijriKeyDaysForMonth(2031, new Date(f.eidfitr[0]).getUTCMonth())[new Date(f.eidfitr[0]).getUTCDate()].source).toBe("tabular");
  });
  it("links Eid al-Fitr to an existing festival page and carries the approximate note", () => {
    const d = hijriKeyDayOn(2027, 2, 10);
    expect(d.festivalId).toBe("eid");
    expect(festivals.some((f) => f.id === d.festivalId)).toBe(true);
    expect(HIJRI_KEYDAY_NOTE).toMatch(/moon sighting.*day or two/);
  });
});
