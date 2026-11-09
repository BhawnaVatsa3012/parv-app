// Festival date rules (computed for New Delhi, IST). Each rule returns the
// named dates of a festival for one Gregorian year, as {y, m, d}.
import { DELHI as C, KOCHI, nakshatra, sidSun, phaseTime, sankranti, sunrise, sunset, moonrise, addDays, lunarMonth, minutesOf, tithiAt, tithiStart, tithiEnd, ymd } from "./astro.mjs";
import { skippedTithi } from "./panchang.generated.mjs";

const nextRise = (y, m, d) => sunrise(y, m, d + 1);
const pradoshKaal = (o) => { const ss = sunset(o.y, o.m, o.d), nr = nextRise(o.y, o.m, o.d); return [ss, new Date(ss.getTime() + (nr - ss) / 5)]; };
const fifth = (o, k) => { const sr = sunrise(o.y, o.m, o.d), ss = sunset(o.y, o.m, o.d), f = (ss - sr) / 5; return [new Date(sr.getTime() + k * f), new Date(sr.getTime() + (k + 1) * f)]; };
// Lunar month is read at local noon, so a new moon just after sunrise still counts as the new month's day.
const info = (o) => { const sr = sunrise(o.y, o.m, o.d); const t = tithiAt(sr); const noon = new Date(sr.getTime() + 6 * 36e5); return { ...o, sr, t, skipped: skippedTithi(t, tithiAt(nextRise(o.y, o.m, o.d))), L: lunarMonth(noon) }; };
const days = (y, m0, d0, n) => Array.from({ length: n }, (_, i) => addDays({ y, m: m0, d: d0 }, i));
const key = (o) => o.y * 10000 + o.m * 100 + o.d;

// Day a tithi holds at sunrise (or runs without touching one) in a named,
// non-adhik amanta month. Search window: from (y, m0, d0) for n days.
function sunriseTithi(y, m0, d0, n, month, tithi) {
  for (const o of days(y, m0, d0, n)) {
    const i = info(o);
    if (i.L.adhik || i.L.month !== month) continue;
    if (i.t === tithi || i.skipped === tithi) return o;
  }
  return null;
}
// Day whose window (fn) overlaps tithi set T the most, within month; ties -> first.
function bestOverlap(y, m0, d0, n, month, T, fn) {
  let best = null, bm = 0;
  for (const o of days(y, m0, d0, n)) {
    const i = info(o);
    if (i.L.adhik || (i.L.month !== month && lunarMonth(fn(o)[0]).month !== month)) continue;
    const mins = minutesOf(T, ...fn(o));
    if (mins > bm + 0.5) { bm = mins; best = o; }
  }
  return best;
}
// Calendar date (IST) of a sankranti moment, and the regional day-one rules.
function solar(k, from) {
  const M = sankranti(k, from);
  const D = ymd(M);
  const ss = sunset(D.y, D.m, D.d);
  const sr = sunrise(D.y, D.m, D.d);
  return {
    moment: M,
    civil: D, // the date the moment falls on
    drik: M < sr ? D : M <= ss ? D : addDays(D, 1), // Drik / Tamil: before sunset -> same day
    bengal: addDays(D, 1), // Bengali/Assamese: day after the sankranti date
    vishu: M < sr ? D : addDays(D, 1), // Vishukkani is seen at the first sunrise after the sankranti
  };
}

export function rules(Y) {
  const out = {};
  // --- Makar Sankranti cluster ---
  const mk = solar(9, new Date(Date.UTC(Y - 1, 11, 25)));
  out.sankranti = {
    moment: mk.moment,
    lohri: addDays(mk.civil, -1), // eve of Maghi; Punjabi month starts on the sankranti's calendar date
    bhogi: addDays(mk.drik, -1),
    makar: mk.drik,
    pongal: mk.drik,
    kanuma: addDays(mk.drik, 1),
    kaanum: addDays(mk.drik, 2),
    uruka: addDays(mk.bengal, -1),
    meji: mk.bengal,
    poush: mk.civil,
  };
  // --- Pongal (Tamil): the Tamil month Thai begins on the Makar Sankranti day (Drik rule: before sunset,
  // same day, else next). Four days: Bhogi, Thai Pongal, Mattu Pongal, Kaanum Pongal. ---
  out.pongal = { bhogi: addDays(mk.drik, -1), pongal: mk.drik, mattu: addDays(mk.drik, 1), kaanum: addDays(mk.drik, 2) };
  // --- New Year cluster ---
  const padwa = sunriseTithi(Y, 2, 1, 60, 0, 1);
  const ms = solar(0, new Date(Date.UTC(Y, 2, 25)));
  out.newyear = {
    moment: ms.moment, padwa,
    chetichand: sunriseTithi(Y, 2, 1, 60, 0, 2),
    puthandu: ms.drik, vishu: ms.vishu, baisakhi: ms.civil,
    gorubihu: ms.civil, bihu: ms.bengal, poila: ms.bengal,
  };
  // --- Vaisakhi (Sikh; solar): the civil date (IST) on which the Sun enters Mesha, the same
  // Mesha Sankranti used for Baisakhi above. Sikh bodies announce the day; Punjab has sometimes kept
  // the 13th when this gives the 14th (2025: sankranti 3:30 am on 14 April, Punjab holiday 13 April). ---
  out.vaisakhi = { vaisakhi: ms.civil };
  // --- Holi (Phalguna = 11) ---
  // Holika Dahan: the first evening Purnima reaches Pradosh Kaal (in Bhadra
  // Puchha if Bhadra covers the evening). Holi (Dhulandi) is the day after.
  // 2026 was decided differently because of the 3 March lunar eclipse; it is
  // kept as published (see OVERRIDES).
  const purnima = sunriseTithi(Y, 1, 10, 50, 11, 15);
  let holika = null;
  for (const o of days(purnima.y, purnima.m, purnima.d - 1, 2)) {
    if (minutesOf([15], ...pradoshKaal(o)) > 0) { holika = o; break; }
  }
  const holi = addDays(holika, 1);
  // Lathmar Holi: Barsana on Navami, Nandgaon the next day (temples announce the exact days).
  out.holi = {
    lathmar: sunriseTithi(Y, 1, 5, 50, 11, 9),
    holika, holi, dol: purnima, yaosangEnd: addDays(purnima, 5),
    holaStart: holi, holaEnd: addDays(holi, 2),
  };
  out.holi.nandgaon = addDays(out.holi.lathmar, 1);
  // --- Teej (Shravana = 4, Bhadrapada = 5) ---
  // Ganesh Chaturthi: Bhadrapada Shukla Chaturthi in Madhyahna (the middle fifth of daytime).
  const ganesh = bestOverlap(Y, 7, 15, 60, 5, [4], (o) => fifth(o, 2));
  out.teej = {
    hariyali: sunriseTithi(Y, 6, 15, 60, 4, 3),
    hartalika: sunriseTithi(Y, 7, 15, 60, 5, 3),
    ganesh,
  };
  // Anant Chaturdashi (the last day, when the idols are immersed): Chaturdashi at sunrise.
  out.ganesh = { ganesh, anant: sunriseTithi(ganesh.y, ganesh.m, ganesh.d + 5, 10, 5, 14) };
  // --- Sharad Navratri (amanta Ashwin = 6, Shukla paksha) ---
  // Ghatasthapana: Pratipada at sunrise. Ashtami / Navami: at sunrise.
  // Vijayadashami: Dashami in Aparahna (fourth fifth of daytime), the Drik rule.
  // Bengal's Durga Puja runs Shashthi to Dashami by the same sunrise rule.
  const ghat = sunriseTithi(Y, 8, 1, 60, 6, 1);
  const vijaya = bestOverlap(ghat.y, ghat.m, ghat.d + 7, 5, 6, [10], (o) => fifth(o, 3));
  // Maha Navami: Navami at sunrise, unless that is Dussehra itself; then the
  // day before, together with Ashtami (2024: Navami 11 Oct, Dussehra 12 Oct).
  let navami = sunriseTithi(ghat.y, ghat.m, ghat.d, 10, 6, 9);
  if (navami.y === vijaya.y && navami.m === vijaya.m && navami.d === vijaya.d) navami = addDays(navami, -1);
  out.navratri = {
    mahalaya: addDays(ghat, -1),
    ghatasthapana: ghat,
    shashthi: sunriseTithi(ghat.y, ghat.m, ghat.d, 9, 6, 6),
    saptami: sunriseTithi(ghat.y, ghat.m, ghat.d, 9, 6, 7),
    ashtami: sunriseTithi(ghat.y, ghat.m, ghat.d, 10, 6, 8),
    navami,
    dashami: vijaya,
    kulluEnd: addDays(vijaya, 6),
  };

  // --- Diwali (amanta Ashwin = 6 Krishna; Kartika = 7 Shukla) ---
  const lakshmi = bestOverlap(Y, 9, 10, 50, 6, [30], pradoshKaal);
  // Dhanteras: Trayodashi in Pradosh; if it reaches no Pradosh, the day it holds at sunrise.
  const dhanteras = bestOverlap(Y, 9, 8, 50, 6, [28], pradoshKaal) || sunriseTithi(Y, 9, 8, 50, 6, 28);
  let naraka = null;
  for (const o of days(lakshmi.y, lakshmi.m, lakshmi.d - 2, 3)) {
    const mr = moonrise(o.y, o.m, o.d); // pre-dawn moonrise on Chaturdashi
    if (mr && tithiAt(mr) === 29 && mr < sunrise(o.y, o.m, o.d)) { naraka = o; break; }
  }
  if (!naraka) naraka = addDays(lakshmi, -1);
  const kaliMid = (o) => { const ss = sunset(o.y, o.m, o.d), nr = nextRise(o.y, o.m, o.d), mid = new Date((ss.getTime() + nr.getTime()) / 2); return [new Date(mid - 24 * 6e4), new Date(mid.getTime() + 24 * 6e4)]; };
  const kali = bestOverlap(Y, 9, 10, 50, 6, [30], kaliMid);
  // Govardhan: Kartika Shukla Pratipada at sunrise, or the day it runs if it touches no sunrise.
  const govardhan = sunriseTithi(lakshmi.y, lakshmi.m, lakshmi.d + 1, 3, 7, 1);
  const bhaidooj = bestOverlap(govardhan.y, govardhan.m, govardhan.d, 3, 7, [2], (o) => fifth(o, 3)); // aparahna
  out.diwali = { dhanteras, naraka, lakshmi, kali, govardhan, bhaidooj };
  // --- Janmashtami: Krishna Paksha Ashtami of amanta Shravana (4), kept on the day Ashtami
  // overlaps Nishita Kaal (the 8th muhurta of the night) most; the date is the day the
  // vigil starts, so the midnight puja falls just after midnight into the next calendar day.
  // If Ashtami touches no Nishita it is the day it holds at sunrise (2026: Ashtami ends 12:14 am).
  const nishita = (o) => { const ss = sunset(o.y, o.m, o.d), N = nextRise(o.y, o.m, o.d) - ss; return [new Date(ss.getTime() + (N * 7) / 15), new Date(ss.getTime() + (N * 8) / 15)]; };
  const janmashtami = bestOverlap(Y, 7, 1, 45, 4, [23], nishita) || sunriseTithi(Y, 7, 1, 45, 4, 23);
  // Dahi Handi / Gopalkala is the day after.
  out.janmashtami = { janmashtami, dahihandi: addDays(janmashtami, 1) };
  // --- Maha Shivratri: Krishna Chaturdashi of amanta Magha (10) (Phalguna in purnimanta
  // calendars), on the day it overlaps Nishita Kaal most; the vigil begins that evening.
  const shivratri = bestOverlap(Y, 1, 5, 45, 10, [29], nishita) || sunriseTithi(Y, 1, 5, 45, 10, 29);
  out.shivratri = { shivratri };
  // --- Raksha Bandhan: Purnima of amanta Shravana (4), tied in Aparahna (the fourth fifth of
  // daytime) and not in Bhadra (the Vishti karana, the first half of Purnima, ending when the
  // Moon is 174 degrees ahead of the Sun). If Bhadra covers all of that Aparahna, the next
  // day if Purnima is still there at its sunrise (2026: Purnima 27 Aug 9:09 am to 28 Aug 9:49 am).
  const shravanaPurnima = bestOverlap(Y, 6, 15, 60, 4, [15], (o) => fifth(o, 3));
  const [ap0, ap1] = fifth(shravanaPurnima, 3);
  const from = new Date(ap0.getTime() - 40 * 36e5);
  const bhadraEnd = phaseTime(174, from), purnimaEnd = phaseTime(180, from);
  let rakhi = shravanaPurnima;
  if (Math.min(purnimaEnd, ap1) - Math.max(bhadraEnd, ap0) <= 0) {
    const next = addDays(shravanaPurnima, 1);
    if (tithiAt(sunrise(next.y, next.m, next.d)) === 15) rakhi = next;
  }
  out.rakshabandhan = { purnima: shravanaPurnima, rakhi };
  // --- Karva Chauth: Krishna Chaturthi of amanta Ashwin (6, = purnimanta Kartik), on the day
  // Chaturthi (tithi 19) is present at moonrise; the first such night if two. If the moon rises on
  // neither, the day Chaturthi holds at sunrise. ---
  let karva = null;
  for (const o of days(Y, 9, 1, 40)) {
    const i = info(o); if (i.L.adhik || i.L.month !== 6) continue;
    const mr = moonrise(o.y, o.m, o.d);
    if (mr && tithiAt(mr) === 19) { karva = o; break; }
  }
  if (!karva) karva = sunriseTithi(Y, 9, 1, 40, 6, 19);
  out.karvachauth = { karva };
  // --- Onam (Kerala, observed for Kochi): Thiruvonam is the day the Moon is in Shravana (nakshatra 22)
  // at midday (Madhyahna) while the sidereal Sun is in Simha (Chingam, 120-150 degrees). ---
  let thiruvonam = null;
  for (const o of days(Y, 7, 10, 50)) {
    const sr = sunrise(o.y, o.m, o.d, KOCHI), ss = sunset(o.y, o.m, o.d, KOCHI);
    const noon = new Date((sr.getTime() + ss.getTime()) / 2), lon = sidSun(noon);
    if (lon >= 120 && lon < 150 && nakshatra(noon) === 22) { thiruvonam = o; break; }
  }
  // Atham, the first of the ten days: the Hasta (13) sunrise day, 8 to 11 days before; if Hasta is skipped
  // at sunrise, the day before the first Chitra (14) sunrise.
  let atham = null;
  for (let k = 11; k >= 8; k--) { const x = addDays(thiruvonam, -k); if (nakshatra(sunrise(x.y, x.m, x.d, KOCHI)) === 13) { atham = x; break; } }
  if (!atham) for (let k = 11; k >= 8; k--) { const x = addDays(thiruvonam, -k); if (nakshatra(sunrise(x.y, x.m, x.d, KOCHI)) === 14) { atham = addDays(x, -1); break; } }
  out.onam = { atham, uthradom: addDays(thiruvonam, -1), thiruvonam, avittam: addDays(thiruvonam, 1), chathayam: addDays(thiruvonam, 2) };
  // --- Chhath: Sandhya Arghya on Kartika Shukla Shashthi by the sunrise rule
  // (2023: Shashthi began 18 Nov, Sandhya Arghya was 19 Nov). ---
  const sandhya = sunriseTithi(bhaidooj.y, bhaidooj.m, bhaidooj.d + 1, 8, 7, 6);
  out.chhath = { nahay: addDays(sandhya, -2), kharna: addDays(sandhya, -1), sandhya, usha: addDays(sandhya, 1) };
  return out;
}
