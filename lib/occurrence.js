// When each festival falls, year by year. Dates come from lib/festivalDates.js
// (computed for New Delhi from panchang rules and checked against published
// panchangs); this file turns them into the days to mark, the date range a
// reader sees, and the next occurrence after a given day.
import { FESTIVAL_DATES, FIRST_YEAR, LAST_YEAR } from "@/lib/festivalDates";

export { FIRST_YEAR, LAST_YEAR };
const MS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Which named days each festival marks on the calendar.
// span: every day from the first to the last is part of it (Diwali week).
// range: the reader sees "first – last" rather than a list (New Year cluster).
const SPEC = {
  diwali: { span: true, keys: ["dhanteras", "naraka", "lakshmi", "govardhan", "bhaidooj"] },
  bhaidooj: { keys: ["bhaidooj"] },
  holi: { keys: ["holika", "holi"] },
  teej: { keys: ["hariyali", "hartalikaEve", "hartalika"] },
  newyear: { range: true, keys: ["padwa", "chetichand", "baisakhi", "puthandu", "vishu", "poila"] },
  sankranti: { span: true, keys: ["lohri", "bhogi", "makar", "pongal", "kanuma", "kaanum", "uruka", "meji"] },
  chhath: { span: true, keys: ["nahay", "kharna", "sandhya", "usha"] },
  rakshabandhan: { keys: ["rakhi"] },
  karvachauth: { keys: ["karva"] },
  pongal: { span: true, keys: ["bhogi", "kaanum"] },
  onam: { span: true, keys: ["atham", "thiruvonam"] },
  shivratri: { keys: ["shivratri"] },
  vaisakhi: { keys: ["vaisakhi"] },
  janmashtami: { span: true, keys: ["janmashtami", "dahihandi"] },
  ganesh: { span: true, keys: ["ganesh", "anant"] },
  navratri: { span: true, keys: ["ghatasthapana", "ashtami", "navami", "dashami"] },
};

const parse = (y, md) => { const [m, d] = md.split("-").map(Number); return { y, m: m - 1, d }; };
const ord = (o) => Date.UTC(o.y, o.m, o.d);
const addDays = (o, n) => { const t = new Date(ord(o) + n * 864e5); return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate() }; };
export const fmtDay = (o) => `${MS[o.m]} ${o.d}`;

export const hasDates = (id) => Boolean(FESTIVAL_DATES[id]);
export const years = (id) => Object.keys(FESTIVAL_DATES[id] || {}).map(Number).sort();

// Named days of a festival in a year: { lakshmi: {y, m, d}, ... }
export function named(id, year) {
  const raw = FESTIVAL_DATES[id]?.[year];
  if (!raw) return null;
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, parse(year, v)]));
}

// One year's occurrence: the marked days, first and last day, and a label
// such as "Nov 6–11, 2026" or "Aug 4 & Sep 3, 2027".
export function occurrence(id, year) {
  const n = named(id, year);
  const spec = SPEC[id];
  if (!n || !spec) return null;
  let days = [...new Set(spec.keys.filter((k) => n[k]).map((k) => ord(n[k])))].sort((a, b) => a - b)
    .map((t) => { const x = new Date(t); return { y: x.getUTCFullYear(), m: x.getUTCMonth(), d: x.getUTCDate() }; });
  if (spec.span) {
    const all = [];
    for (let o = days[0]; ord(o) <= ord(days[days.length - 1]); o = addDays(o, 1)) all.push(o);
    days = all;
  }
  const start = days[0], end = days[days.length - 1];
  let label;
  if (spec.range && days.length > 1) label = (start.m === end.m ? `${fmtDay(start)}–${end.d}` : `${fmtDay(start)} – ${fmtDay(end)}`) + `, ${year}`;
  else {
    // Consecutive days read as one run ("Sep 13–14"); runs are joined with "&".
    const runs = [];
    days.forEach((o) => {
      const r = runs[runs.length - 1];
      if (r && ord(o) - ord(r[r.length - 1]) === 864e5) r.push(o); else runs.push([o]);
    });
    label = runs.map((r) => {
      const a = r[0], b = r[r.length - 1];
      if (r.length === 1) return fmtDay(a);
      return a.m === b.m ? `${fmtDay(a)}–${b.d}` : `${fmtDay(a)} – ${fmtDay(b)}`;
    }).join(" & ") + `, ${year}`;
  }
  return { id, year, named: n, days, start, end, label };
}

// The first occurrence that hasn't ended by `today` (a Date, local calendar
// day); after the last year we have, the last occurrence.
export function nextOccurrence(id, today = new Date()) {
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const ys = years(id);
  for (const y of ys) {
    const o = occurrence(id, y);
    if (o && ord(o.end) >= t) return o;
  }
  return ys.length ? occurrence(id, ys[ys.length - 1]) : null;
}

// Days from `today` to an occurrence's first day (negative once it has begun).
export function daysUntil(o, today = new Date()) {
  return Math.round((ord(o.start) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 864e5);
}

// Fills "{lakshmi}" style tokens in story and ritual text with that year's
// dates ("Nov 8"); "{year}" becomes the year. Unknown tokens are left as is.
// "{naraka..bhaidooj}" becomes a range: "Nov 8–11", or "Oct 30 – Nov 2".
export function fillDates(text, id, year) {
  if (!text || !text.includes("{")) return text;
  const n = named(id, year) || {};
  return text
    .replace(/\{(\w+)\.\.(\w+)\}/g, (all, a, b) => {
      if (!n[a] || !n[b]) return all;
      if (ord(n[a]) === ord(n[b])) return fmtDay(n[a]);
      return n[a].m === n[b].m ? `${fmtDay(n[a])}–${n[b].d}` : `${fmtDay(n[a])} – ${fmtDay(n[b])}`;
    })
    .replace(/\{(\w+)\}/g, (all, k) => (k === "year" ? String(year) : n[k] ? fmtDay(n[k]) : all));
}

// Every festival day in a month, for the calendar: { day: [festivalId, ...] }
export function marksForMonth(ids, y, m) {
  const marks = {};
  ids.forEach((id) => (occurrence(id, y)?.days || []).forEach((o) => {
    if (o.m === m) (marks[o.d] = marks[o.d] || []).push(id);
  }));
  // A festival can also run into January from the previous December.
  ids.forEach((id) => (occurrence(id, y - 1)?.days || []).forEach((o) => {
    if (o.y === y && o.m === m) (marks[o.d] = marks[o.d] || []).push(id);
  }));
  return marks;
}
