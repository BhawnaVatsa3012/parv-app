import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// The Calendar only asks for key days when the Hijri layer is on.
describe("Calendar wiring for Hijri key days", () => {
  const src = readFileSync("app/calendar/CalendarClient.js", "utf8");
  it("computes key days only with the Hijri layer, so no marker when it is off", () => {
    expect(src).toMatch(/const keyDays = showHijri \? hijriKeyDaysForMonth\(y, m\) : \{\};/);
    expect(src).toMatch(/\{showHijri && <span[^>]*>.*HIJRI_KEYDAY_LEGEND/);
  });
});

describe("Kashmir Eid story", () => {
  it("no longer carries the Jamia Masjid closure passage and keeps its sources", async () => {
    const { stories } = await import("@/lib/data").then((m) => ({ stories: m }));
    const text = JSON.stringify(stories);
    expect(text).not.toMatch(/Jamia Masjid in Srinagar|barred for a seventh year/);
    expect(text).toMatch(/Hazratbal/);
    expect(text).toMatch(/Kashmir Life, 21 March 2026; The Tribune \(J&K\), 10 April 2024/);
  });
});
