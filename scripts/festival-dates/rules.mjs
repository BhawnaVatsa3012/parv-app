// Festival date rules (computed for New Delhi, IST). Each rule returns the
// named dates of a festival for one Gregorian year, as {y, m, d}.
import { DELHI as C, sankranti, sunrise, sunset, moonrise, addDays, lunarMonth, minutesOf, tithiAt, tithiStart, tithiEnd, ymd } from "./astro.mjs";
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
  // --- New Year cluster ---
  const padwa = sunriseTithi(Y, 2, 1, 60, 0, 1);
  const ms = solar(0, new Date(Date.UTC(Y, 2, 25)));
  out.newyear = {
    moment: ms.moment, padwa,
    chetichand: sunriseTithi(Y, 2, 1, 60, 0, 2),
    puthandu: ms.drik, vishu: ms.vishu, baisakhi: ms.civil,
    gorubihu: ms.civil, bihu: ms.bengal, poila: ms.bengal,
  };
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
  // --- Chhath: Sandhya Arghya on Kartika Shukla Shashthi by the sunrise rule
  // (2023: Shashthi began 18 Nov, Sandhya Arghya was 19 Nov). ---
  const sandhya = sunriseTithi(bhaidooj.y, bhaidooj.m, bhaidooj.d + 1, 8, 7, 6);
  out.chhath = { nahay: addDays(sandhya, -2), kharna: addDays(sandhya, -1), sandhya, usha: addDays(sandhya, 1) };
  return out;
}
