// Expected first day of Shawwal (Eid al-Fitr) for India: a Hijri-expectation rule.
//
// India keeps the day after the Shawwal crescent is actually sighted (Markazi Ruyat-e-Hilal committees at
// Delhi's Jama Masjid, Mumbai, Lucknow and elsewhere), and has often kept a day after Saudi Arabia, which
// goes by calculation. The rule here estimates that sighting: for each evening from the day of the
// astronomical new moon, it asks whether the crescent is plausibly visible to the naked eye at New Delhi
// sunset (Odeh's 2004 criterion, V >= 5.65); Eid is the day after the first such evening. If the moon is
// out of reach, the month runs to 30 days. This is an EXPECTATION, never a promise: the real day is set by
// sighting, and committees in different places can differ by a day. See README.md for the checks.
import * as A from "astronomy-engine";
import { DELHI, addDays, phaseTime, sunset, ymd } from "./astro.mjs";

const obs = new A.Observer(DELHI.lat, DELHI.lon, 0);

// Odeh V value (naked-eye visibility index) and the age of the moon, at New Delhi sunset on the given civil day.
export function crescentAt(o) {
  const ss = sunset(o.y, o.m, o.d);
  const t = A.MakeTime(ss);
  const eq = A.Equator(A.Body.Moon, t, obs, true, true);
  const hor = A.Horizon(t, obs, eq.ra, eq.dec, "normal");
  const arcl = A.AngleBetween(A.GeoVector(A.Body.Moon, t, true), A.GeoVector(A.Body.Sun, t, true));
  // topocentric moon-sun altitude difference (sun's altitude at sunset is about -0.83 deg on the geometric horizon)
  const sunEq = A.Equator(A.Body.Sun, t, obs, true, true);
  const sunH = A.Horizon(t, obs, sunEq.ra, sunEq.dec, "normal");
  const arcv = hor.altitude - sunH.altitude;
  const distKm = eq.dist * 149597870.7;
  const sdArcmin = (Math.asin(1737.4 / distKm) * 180 / Math.PI) * 60;
  const w = sdArcmin * (1 - Math.cos((arcl * Math.PI) / 180)); // crescent width W, arcmin
  const V = arcv - (-0.1018 * w ** 3 + 0.7319 * w ** 2 - 6.3226 * w + 7.1651);
  return { ss, arcl, arcv, w, V };
}

// Tabular (arithmetical) Islamic calendar, civil epoch: 1 Shawwal of Hijri year hy as a rough civil date. It is only
// used to pick which new moon belongs to the year; the day itself comes from the crescent test above.
export function tabularShawwal(hy) {
  const monthsBefore = 266; // Muharram..Ramadan: 30+29+30+29+30+29+30+29+30 days
  const days = (hy - 1) * 354 + Math.floor((3 + 11 * hy) / 30) + monthsBefore;
  const d = new Date((1948439.5 + days - 2440587.5) * 864e5);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

// Expected Eid al-Fitr (1 Shawwal) in India for the Gregorian year Y; also returns the Hijri year.
export function expectedEidAlFitr(Y) {
  // Eid al-Fitr falls once a Gregorian year in 2026-2030 (Hijri year = 1447 + (Y - 2026)); find the new moon nearest the tabular date.
  const hy = 1447 + (Y - 2026);
  const tab = tabularShawwal(hy);
  const from = new Date(Date.UTC(tab.y, tab.m, tab.d - 10));
  const conj = phaseTime(0, from, 20);
  const cday = ymd(conj);
  let eve = cday;
  const log = [];
  for (let i = 0; i < 3; i++) {
    const c = crescentAt(eve);
    log.push({ eve, ...c, age: (c.ss - conj) / 36e5 });
    if (c.V >= 5.65 && c.ss > conj) break;
    eve = addDays(eve, 1);
  }
  return { hy, tab, conj, eve, eid: addDays(eve, 1), log };
}
