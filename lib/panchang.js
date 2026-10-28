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

// Everything for one calendar day in one city.
// city: { lat, lon, tz }
export function dayPanchang(y, m, d, city) {
  const obs = new A.Observer(city.lat, city.lon, 0);
  const midnight = zonedMidnight(y, m, d, city.tz);
  const sunrise = riseSet(A.Body.Sun, obs, +1, midnight);
  const sunset = riseSet(A.Body.Sun, obs, -1, sunrise || midnight);
  const nextMidnight = zonedMidnight(y, m, d + 1, city.tz);
  const nextSunrise = riseSet(A.Body.Sun, obs, +1, nextMidnight);
  const moonrise = riseSet(A.Body.Moon, obs, +1, midnight);

  const t = tithiAt(sunrise);
  const tNext = tithiAt(nextSunrise);
  const tSunset = tithiAt(sunset);
  const endsAt = tithiEnd(sunrise);
  // A tithi that begins after sunrise and ends before the next sunrise
  // touches no sunrise ("kshaya"); it is observed on this day.
  const skipped = tNext !== t && tNext !== (t % 30) + 1 ? (t % 30) + 1 : null;
  const has = (n) => t === n || skipped === n;

  const observances = [];
  if (has(11) || has(26)) observances.push("ekadashi");
  if (has(15)) observances.push("purnima");
  if (has(30)) observances.push("amavasya");
  if (tSunset === 13 || tSunset === 28) observances.push("pradosh");
  if (moonrise && tithiAt(moonrise) === 19) observances.push("sankashti");

  return {
    date: { y, m, d },
    sunrise, sunset, nextSunrise, moonrise,
    tithi: t, tithiInfo: tithiName(t), tithiEndsAt: endsAt,
    skippedTithi: skipped,
    observances,
    // Pradosh Kaal: the first fifth of the night, sunset to next sunrise
    // (the convention Drik Panchang uses).
    pradosh: sunset && nextSunrise ? { start: sunset, end: new Date(sunset.getTime() + (nextSunrise - sunset) / 5) } : null,
  };
}

// Ekadashi fast-breaking (parana) window, on the day after the fast:
// from the later of sunrise and the end of Hari Vasara (the first quarter
// of Dwadashi), until the end of Pratahkala (first fifth of daytime) —
// and never after Dwadashi ends.
export function paranaWindow(fastDay, city) {
  const { y, m, d } = fastDay.date;
  const next = dayPanchang(y, m, d + 1, city);
  const dwStart = tithiStart(next.sunrise);
  const dwEnd = tithiEnd(next.sunrise);
  const tNow = tithiAt(next.sunrise);
  if (tNow !== 12 && tNow !== 27) return null; // Dwadashi not at sunrise: rule differs, don't guess
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
