// Shared astronomy for festival rules: sidereal (Lahiri) sun, sankrantis,
// amanta lunar months with adhik detection, and tithi-in-window helpers.
import * as A from "astronomy-engine";
import { tithiAt, tithiEnd, tithiStart, zonedMidnight, zonedYMD } from "./panchang.generated.mjs";
export const DELHI = { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };
const obs = (c) => new A.Observer(c.lat, c.lon, 0);
// Lahiri ayanamsa (linear fit; calibrated below against published sankranti times)
export let AYAN0 = 23.86296; // deg at J2000
const RATE = 1.396971; // deg per Julian century
export const ayan = (t) => AYAN0 + ((t.getTime() / 864e5 + 2440587.5 - 2451545) / 36525) * RATE;
export const sidSun = (t) => (((A.SunPosition(t).elon - ayan(t)) % 360) + 360) % 360;
// Moment the Sun enters sidereal sign k (0 = Mesha) after `from`
export function sankranti(k, from) {
  const target = k * 30;
  const f = (t) => { let d = sidSun(t.date) - target; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
  const r = A.Search(f, A.MakeTime(from), A.MakeTime(new Date(from.getTime() + 40 * 864e5)), { dt_tolerance_seconds: 1 });
  return r ? r.date : null;
}
export const rs = (c, body, dir, t) => { const r = A.SearchRiseSet(body, obs(c), dir, t, 1.2); return r ? r.date : null; };
export const sunrise = (y, m, d, c = DELHI) => rs(c, A.Body.Sun, +1, zonedMidnight(y, m, d, c.tz));
export const sunset = (y, m, d, c = DELHI) => rs(c, A.Body.Sun, -1, sunrise(y, m, d, c));
export const moonrise = (y, m, d, c = DELHI) => rs(c, A.Body.Moon, +1, zonedMidnight(y, m, d, c.tz));
// Moment (after `from`, within `limitDays`) the Moon is `deg` degrees ahead of the Sun.
export const phaseTime = (deg, from, limitDays = 3) => A.SearchMoonPhase(deg, from, limitDays)?.date;
export const ymd = (t, c = DELHI) => zonedYMD(t, c.tz);
export const addDays = ({ y, m, d }, n) => { const t = new Date(Date.UTC(y, m, d + n)); return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate() }; };
// amanta month (0 = Chaitra … 11 = Phalguna) and adhik flag for an instant
export function lunarMonth(t) {
  const prevNew = A.SearchMoonPhase(0, new Date(t.getTime() - 31 * 864e5), 31).date;
  let pn = prevNew; // ensure it's the latest new moon before t
  for (;;) { const n = A.SearchMoonPhase(0, new Date(pn.getTime() + 864e5), 31).date; if (n > t) break; pn = n; }
  const nextNew = A.SearchMoonPhase(0, new Date(pn.getTime() + 864e5), 31).date;
  const s0 = Math.floor(sidSun(pn) / 30), s1 = Math.floor(sidSun(nextNew) / 30);
  if (s0 === s1) return { month: (s1 + 1) % 12, adhik: true, start: pn, end: nextNew }; // no sankranti: adhik, named after next
  // sankranti into sign s1 happens in this month; Mesha (0) -> Chaitra (0)
  return { month: s1 % 12, adhik: false, start: pn, end: nextNew };
}
// minutes of [a,b] in which tithi set T runs
export function minutesOf(T, a, b) {
  const ta = tithiAt(a), tb = tithiAt(b);
  if (T.includes(ta) && T.includes(tb)) return (b - a) / 6e4;
  if (T.includes(ta)) return (tithiEnd(a) - a) / 6e4;
  if (T.includes(tb)) return (b - tithiStart(b)) / 6e4;
  return 0;
}
export { tithiAt, tithiEnd, tithiStart, zonedMidnight };
