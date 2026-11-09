// Hijri (Islamic) date for a Gregorian day, by the tabular (arithmetical)
// civil calendar: 30-year cycle, odd months 30 days, even months 29, with
// 11 leap years of 355 days. It is the same arithmetic as tabularShawwal()
// in scripts/festival-dates/hijri.mjs (a test checks the two agree).
//
// It is APPROXIMATE. The real month starts when the crescent is sighted, so
// local committees can differ from this table by a day or two. Always show it
// as approximate.
export const HIJRI_MONTHS = ["Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani", "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
export const HIJRI_SHORT = ["Muh", "Saf", "Rab I", "Rab II", "Jum I", "Jum II", "Raj", "Sha", "Ram", "Shaw", "Dhu Q", "Dhu H"];

// Days from 1 Muharram of year 1 to the given Hijri day (0-based).
const daysBefore = (y, m, d) => (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + Math.ceil(29.5 * (m - 1)) + (d - 1);

// Gregorian y, m (0-11), d -> { y, m (0-11), d, month, monthShort }.
export function hijriOf(y, m, d) {
  const unixDays = Math.round(Date.UTC(y, m, d) / 864e5);
  const k = unixDays + 492148; // Julian day of the Unix epoch 2440587.5 minus that of 1 Muharram 1 (civil epoch) 1948439.5 = 492148 days
  let hy = Math.floor((30 * k + 10646) / 10631);
  while (daysBefore(hy + 1, 1, 1) <= k) hy++;
  while (daysBefore(hy, 1, 1) > k) hy--;
  const r = k - daysBefore(hy, 1, 1);
  let hm = 12;
  while (Math.ceil(29.5 * (hm - 1)) > r) hm--;
  const hd = r - Math.ceil(29.5 * (hm - 1)) + 1;
  return { y: hy, m: hm - 1, d: hd, month: HIJRI_MONTHS[hm - 1], monthShort: HIJRI_SHORT[hm - 1] };
}

export const hijriLabel = (h) => `${h.d} ${h.month} ${h.y} AH`;

// "Rajab 1448" or "Rajab – Sha'ban 1448" / "Dhu al-Hijjah 1447 – Muharram 1448" for a Gregorian month.
export function hijriSpan(y, m) {
  const a = hijriOf(y, m, 1), b = hijriOf(y, m, new Date(Date.UTC(y, m + 1, 0)).getUTCDate());
  if (a.y === b.y && a.m === b.m) return `${a.month} ${a.y}`;
  return a.y === b.y ? `${a.month} – ${b.month} ${a.y}` : `${a.month} ${a.y} – ${b.month} ${b.y}`;
}

export const HIJRI_NOTE = "Hijri dates here are approximate (tabular). The month begins when the crescent is sighted, so your mosque or local committee may differ by a day or two.";
