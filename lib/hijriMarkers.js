// Key days of the Hijri year, marked on the Calendar when the Hijri layer is
// on: the start of Ramadan, Eid al-Fitr, Eid al-Adha and the Islamic New Year.
// Dates come from the tabular arithmetic in lib/hijri.js, so they are
// APPROXIMATE: the real day follows the moon sighting and can differ by a day
// or two. Always show HIJRI_KEYDAY_NOTE with them.
//
// Eid al-Fitr is the exception: the app already has its own date for that
// festival (from an astronomical sighting rule, lib/festivalDates.js). Where
// that date is within a few days of the tabular 1 Shawwal, the festival's date
// is used, so the marker and the festival never disagree. Outside the years
// the festival covers, the tabular date is used.
import { hijriOf } from "@/lib/hijri";
import { occurrence } from "@/lib/occurrence";

export const HIJRI_KEYDAY_NOTE = "Approximate: depends on moon sighting; can differ by a day or two.";
export const HIJRI_KEYDAY_LEGEND = "Hijri key day (approximate)";

export const KEY_DAYS = {
  ramadan: { id: "ramadan", title: "Ramadan begins", sub: "1 Ramadan", short: "Ram 1" },
  eidfitr: { id: "eidfitr", title: "Eid al-Fitr", sub: "1 Shawwal", short: "Eid", festivalId: "eid" },
  eidadha: { id: "eidadha", title: "Eid al-Adha", sub: "10 Dhu al-Hijjah", short: "Adha" },
  newyear: { id: "newyear", title: "Islamic New Year", sub: "1 Muharram", short: "New Yr" },
};

// Which key day, if any, a Hijri date is by the tabular rule.
export function keyDayOfHijri(h) {
  if (h.d === 1 && h.m === 8) return "ramadan";
  if (h.d === 1 && h.m === 9) return "eidfitr";
  if (h.d === 10 && h.m === 11) return "eidadha";
  if (h.d === 1 && h.m === 0) return "newyear";
  return null;
}

const ord = (o) => Date.UTC(o.y, o.m, o.d);

// The festival's own Eid al-Fitr day, if it is the Eid for the tabular 1
// Shawwal on (y, m, d): the festival's first day within 3 days of it.
function festivalEidFor(y, m, d) {
  for (const yr of [y - 1, y, y + 1]) {
    const day = occurrence("eid", yr)?.days?.[0];
    if (day && Math.abs(ord(day) - Date.UTC(y, m, d)) <= 3 * 864e5) return day;
  }
  return null;
}

// Key days in a Gregorian month: { dayOfMonth: { ...KEY_DAYS entry, source } }.
// For Eid al-Fitr, source is "festival" when its own date was used.
export function hijriKeyDaysForMonth(y, m) {
  const out = {};
  const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  // Tabular day -> key day. Eid al-Fitr is moved to the festival's own date.
  const put = (day, id, source) => { out[day] = { ...KEY_DAYS[id], source }; };
  for (let d = 1; d <= n; d++) {
    const id = keyDayOfHijri(hijriOf(y, m, d));
    if (!id) continue;
    if (id === "eidfitr") continue; // handled below, so the festival's date can win
    put(d, id, "tabular");
  }
  // Eid al-Fitr: look at 1 Shawwal near this month (tabular), and use the festival date when it exists.
  const lo = new Date(Date.UTC(y, m, 1) - 4 * 864e5), hi = new Date(Date.UTC(y, m, n) + 4 * 864e5);
  for (let t = lo.getTime(); t <= hi.getTime(); t += 864e5) {
    const x = new Date(t);
    const ty = x.getUTCFullYear(), tm = x.getUTCMonth(), td = x.getUTCDate();
    if (keyDayOfHijri(hijriOf(ty, tm, td)) !== "eidfitr") continue;
    const fest = festivalEidFor(ty, tm, td);
    const day = fest || { y: ty, m: tm, d: td };
    if (day.y === y && day.m === m) put(day.d, "eidfitr", fest ? "festival" : "tabular");
  }
  return out;
}

// The key day on one date, or null.
export const hijriKeyDayOn = (y, m, d) => hijriKeyDaysForMonth(y, m)[d] || null;
