// Panchang calculations for a city: sunrise, sunset, tithi, and the
// recurring observances (Ekadashi, Purnima, Amavasya, Pradosh, Sankashti).
// Uses astronomy-engine (VSOP87 / ELP lunar theory) — accurate to well
// under a minute for these purposes. Tithi = each 12° of the Moon's
// longitude ahead of the Sun; the tithi at local sunrise names the day.
import * as A from "astronomy-engine";

export const TITHI = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
];
export const TITHI_HI = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी",
  "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी",
];

// n = 1..30 (1–15 Shukla, 16–30 Krishna; 15 Purnima, 30 Amavasya)
export function tithiName(n) {
  if (n === 15) return { name: "Purnima", hi: "पूर्णिमा", paksha: "Shukla", pakshaHi: "शुक्ल" };
  if (n === 30) return { name: "Amavasya", hi: "अमावस्या", paksha: "Krishna", pakshaHi: "कृष्ण" };
  const i = (n - 1) % 15;
  const shukla = n <= 15;
  return { name: TITHI[i], hi: TITHI_HI[i], paksha: shukla ? "Shukla" : "Krishna", pakshaHi: shukla ? "शुक्ल" : "कृष्ण" };
}

// Minutes the zone is ahead of UTC at a given instant.
function tzOffsetMin(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const g = (t) => +parts.find((p) => p.type === t).value;
  const asUTC = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return Math.round((asUTC - date.getTime()) / 60000);
}

// The UTC instant of local midnight starting the given calendar day in a zone.
export function zonedMidnight(y, m, d, timeZone) {
  const guess = new Date(Date.UTC(y, m, d));
  const off = tzOffsetMin(guess, timeZone);
  const t = new Date(guess.getTime() - off * 60000);
  const off2 = tzOffsetMin(t, timeZone); // DST edge
  return off2 === off ? t : new Date(guess.getTime() - off2 * 60000);
}

// Calendar day (y, m, d) of an instant, in a zone.
export function zonedYMD(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const g = (t) => +parts.find((p) => p.type === t).value;
  return { y: g("year"), m: g("month") - 1, d: g("day") };
}

export const phase = (date) => A.MoonPhase(date); // Moon − Sun ecliptic longitude, 0–360°
export const tithiAt = (date) => Math.floor(phase(date) / 12) + 1;

// When the tithi running at `date` ends.
export function tithiEnd(date) {
  const target = (Math.floor(phase(date) / 12) + 1) * 12 % 360;
  const r = A.SearchMoonPhase(target, date, 3);
  return r ? r.date : null;
}
export function tithiStart(date) {
  const target = Math.floor(phase(date) / 12) * 12;
  // search backwards: start 2 days earlier and find the crossing
  const r = A.SearchMoonPhase(target, new Date(date.getTime() - 2.5 * 864e5), 3);
  return r ? r.date : null;
}

function riseSet(body, observer, dir, start) {
  const r = A.SearchRiseSet(body, observer, dir, start, 1.2);
  return r ? r.date : null;
}

// A tithi that begins after sunrise and ends before the next sunrise
// touches no sunrise ("kshaya"); it is observed on this day.
export function skippedTithi(t, tNext) {
  return tNext !== t && tNext !== (t % 30) + 1 ? (t % 30) + 1 : null;
}

// Minutes of window [a, b] during which one of the tithis in T runs.
// Windows here are a few hours and a tithi lasts ~19–26 h, so at most one
// tithi change falls inside.
function minutesOf(T, a, b) {
  if (!a || !b) return 0;
  const ta = tithiAt(a), tb = tithiAt(b);
  if (T.includes(ta) && T.includes(tb)) return (b - a) / 6e4;
  if (T.includes(ta)) return (tithiEnd(a) - a) / 6e4;
  if (T.includes(tb)) return (b - tithiStart(b)) / 6e4;
  return 0;
}

const isEka = (t) => t === 11 || t === 26;
const isDwa = (t) => t === 12 || t === 27;

// What each observance depends on, for one day. `rise` is that day's
// sunrise and `nextRise` the following one (shared between days).
function dayFacts(y, m, d, city, obs, rise, nextRise) {
  const sunset = riseSet(A.Body.Sun, obs, -1, rise);
  const t = tithiAt(rise);
  const f = { y, m, d, sunrise: rise, sunset, nextSunrise: nextRise, t, tNext: tithiAt(nextRise) };
  f.skipped = skippedTithi(t, f.tNext);
  // Pradosh Kaal: the first fifth of the night (Drik Panchang's convention).
  f.kaal = sunset && nextRise ? { start: sunset, end: new Date(sunset.getTime() + (nextRise - sunset) / 5) } : null;
  f.pradoshMin = f.kaal && [12, 13, 27, 28].some((n) => n === t || n === f.tNext) ? minutesOf([13, 28], f.kaal.start, f.kaal.end) : 0;
  // Madhyahna: the middle fifth of daytime.
  const fifth = sunset ? (sunset - rise) / 5 : 0;
  f.purnimaMidday = sunset && (t >= 14 && t <= 16) ? minutesOf([15], new Date(rise.getTime() + 2 * fifth), new Date(rise.getTime() + 3 * fifth)) > 0 : false;
  // Moonrise matters only for Sankashti, around Krishna Chaturthi.
  f.tMoon = null;
  if (t >= 16 && t <= 20) {
    const mr = riseSet(A.Body.Moon, obs, +1, zonedMidnight(y, m, d, city.tz));
    f.tMoon = mr ? tithiAt(mr) : null;
  }
  return f;
}

// The recurring observances of day `a`, given the day before (z) and the
// two after (b, c). One set of rules for the Today card, the calendar grid
// and the day view, so they never disagree. Each rule was checked against
// Drik Panchang's 2026 lists (New Delhi, plus three other cities for
// Pradosh): Ekadashi 24/24, Purnima 13/13, Sankashti 13/13, Pradosh 100/100,
// Amavasya 12/12.
function observancesOf(z, a, b, c) {
  const out = [];
  // Ekadashi (Smarta, the householders' date). Normally the day Ekadashi is
  // at sunrise. If it touches no sunrise, the day it runs. If it is at two
  // sunrises, the second day only when Dwadashi still lasts to the sunrise
  // after (so the fast can be broken in Dwadashi); otherwise the first.
  // Example: Padmini Ekadashi 2026 (26–27 May) is kept on 27 May.
  if (isEka(a.skipped)) out.push("ekadashi");
  else if (isEka(a.t)) {
    if (isEka(b.t)) { if (!isDwa(c.t)) out.push("ekadashi"); }
    else if (isEka(z.t)) { if (isDwa(b.t)) out.push("ekadashi"); }
    else out.push("ekadashi");
  }
  // Purnima vrat: the first day Purnima runs at midday. If it misses
  // midday on every day, the day it holds at sunrise.
  if (a.purnimaMidday && !z.purnimaMidday) out.push("purnima");
  else if (!a.purnimaMidday && !z.purnimaMidday && !b.purnimaMidday && (a.t === 15 || a.skipped === 15)) out.push("purnima");
  // Amavasya: the day it holds at sunrise (or runs, if it touches none).
  if (a.t === 30 || a.skipped === 30) out.push("amavasya");
  // Pradosh: Trayodashi in Pradosh Kaal; if on two evenings, the one with more of it.
  if (a.pradoshMin > 0 && a.pradoshMin > z.pradoshMin && a.pradoshMin >= b.pradoshMin) out.push("pradosh");
  // Sankashti: Krishna Chaturthi at moonrise; if on two nights, the first.
  // If it rises on neither (Chaturthi falls between moonrises), the night it begins.
  if ((a.tMoon === 19 && z.tMoon !== 19) || (a.tMoon === 18 && b.tMoon === 20)) out.push("sankashti");
  return out;
}

// Facts for days dStart-1 … dStart+count+1 (neighbours are needed by the
// rules), each sunrise found once and shared with the day before.
function rangeFacts(y, m, dStart, count, city) {
  const obs = new A.Observer(city.lat, city.lon, 0);
  const rises = [];
  for (let i = -1; i <= count + 2; i++) rises.push(riseSet(A.Body.Sun, obs, +1, zonedMidnight(y, m, dStart + i, city.tz)));
  const facts = [];
  for (let i = -1; i <= count + 1; i++) {
    const { y: yy, m: mm, d: dd } = zonedYMD(new Date(zonedMidnight(y, m, dStart + i, city.tz).getTime() + 12 * 36e5), city.tz);
    facts.push(dayFacts(yy, mm, dd, city, obs, rises[i + 1], rises[i + 2]));
  }
  return facts.slice(1, count + 1).map((a, k) => ({ ...a, observances: observancesOf(facts[k], a, facts[k + 2], facts[k + 3]) }));
}

// A run of days in one city (light: no moonrise or tithi end times), e.g.
// the next 20 days for the Today card. Returns [{ date, tithi, ... }].
export function rangePanchang(y, m, dStart, count, city) {
  return rangeFacts(y, m, dStart, count, city).map((f) => ({
    date: { y: f.y, m: f.m, d: f.d }, tithi: f.t, info: tithiName(f.t), skipped: f.skipped, observances: f.observances,
  }));
}

// Every day of a month, for the calendar grid.
export function monthPanchang(y, m, city) {
  const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return rangePanchang(y, m, 1, n, city).map((r) => ({ ...r, d: r.date.d }));
}

// "S9", "K14"; Purnima and Amavasya get their own names.
export function tithiShort(n) {
  if (n === 15) return "Purnima";
  if (n === 30) return "Amavasya";
  return n < 15 ? `S${n}` : `K${n - 15}`;
}

// Everything for one calendar day in one city.
// city: { lat, lon, tz }
export function dayPanchang(y, m, d, city) {
  const [f] = rangeFacts(y, m, d, 1, city);
  const obs = new A.Observer(city.lat, city.lon, 0);
  const moonrise = riseSet(A.Body.Moon, obs, +1, zonedMidnight(y, m, d, city.tz));
  return {
    date: { y, m, d },
    sunrise: f.sunrise, sunset: f.sunset, nextSunrise: f.nextSunrise, moonrise,
    tithi: f.t, tithiInfo: tithiName(f.t), tithiEndsAt: tithiEnd(f.sunrise),
    skippedTithi: f.skipped,
    observances: f.observances,
    pradosh: f.kaal,
  };
}

// Ekadashi fast-breaking (parana) window, on the day after the fast:
// from the later of sunrise and the end of Hari Vasara (the first quarter
// of Dwadashi), until the end of Pratahkala (first fifth of daytime) —
// and never after Dwadashi ends. Works when Ekadashi is still running at
// the next sunrise (Dwadashi then starts later that morning).
export function paranaWindow(fastDay, city) {
  const { y, m, d } = fastDay.date;
  const next = dayPanchang(y, m, d + 1, city);
  const tNow = tithiAt(next.sunrise);
  let dwStart, dwEnd;
  if (isDwa(tNow)) { dwStart = tithiStart(next.sunrise); dwEnd = tithiEnd(next.sunrise); }
  else if (isEka(tNow)) { dwStart = tithiEnd(next.sunrise); dwEnd = tithiEnd(new Date(dwStart.getTime() + 60000)); }
  else return null; // Dwadashi already over by sunrise: rule differs, don't guess
  const hariVasaraEnd = new Date(dwStart.getTime() + (dwEnd - dwStart) / 4);
  const start = new Date(Math.max(next.sunrise, hariVasaraEnd));
  const dayLen = next.sunset - next.sunrise;
  let end = new Date(next.sunrise.getTime() + dayLen / 5);
  if (dwEnd < end) end = dwEnd;
  if (end <= start) return null;
  return { start, end, dwadashiEnds: dwEnd };
}

export function fmtTime(date, tz) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(date).replace(" ", " ").toLowerCase();
}
