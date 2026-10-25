// Classical design system — shared values for Parv's screens.
// Ported from the Claude Design file "Parv App v3" (festival colours,
// background wash, Hindi labels, festival start dates for the calendar).

export const HI = {
  diwali: "दीपावली", bhaidooj: "भाई दूज", holi: "होली", teej: "तीज", newyear: "नव वर्ष",
  sankranti: "मकर संक्रांति", ganesh: "गणेश चतुर्थी", navratri: "नवरात्रि", onam: "ओणम",
};

export const UI = {
  brand: "पर्व", home: "मुख्य", cal: "पंचांग", map: "मानचित्र", profile: "प्रोफ़ाइल", all: "सभी पर्व",
  world: "विश्व के पर्व", stories: "कथाएँ", rituals: "विधि", contents: "विषय-सूची", days: "दिन",
  year: "इस वर्ष", member: "सदस्यता", unlock: "विधि खोलें", success: "विधि अब उपलब्ध",
  welcome: "स्वागत है",
};

// The festival library is written for 2026.
export const YEAR = 2026;
// [month (0-11), day] of each festival's first day.
export const START = { sankranti: [0, 13], holi: [2, 3], newyear: [2, 19], teej: [7, 15], diwali: [10, 6], bhaidooj: [10, 10] };
// Every marked day, for the calendar.
export const DAYS = {
  sankranti: [[0, 13], [0, 14], [0, 15], [0, 16]], holi: [[2, 3], [2, 4]], newyear: [[2, 19], [3, 14], [3, 15]],
  teej: [[7, 15], [8, 13], [8, 14]], diwali: [[10, 6], [10, 7], [10, 8], [10, 9], [10, 10]], bhaidooj: [[10, 10]],
};
export const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MON_HI = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
export const MS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export const HUE = { diwali: 65, bhaidooj: 300, holi: 350, teej: 150, newyear: 35, sankranti: 240, ganesh: 45, navratri: 330, onam: 110 };
export const HUE_LIST = ["diwali", "holi", "teej", "sankranti", "newyear", "bhaidooj"];

export const ONBOARDING = [
  { num: "I", title: "The stories behind our festivals", hi: "पर्वों के पीछे की कहानियाँ", body: "Every festival told region by region: why Ayodhya lights diyas, why Bengal worships Kali on the same night, why Gujarat's merchants open new ledgers." },
  { num: "II", title: "Rituals, step by step", hi: "विधि, क्रम से", body: "What you'll need, how it's done, the mantra with its meaning, and what to wear. Written for families doing it at home." },
  { num: "III", title: "One festival, many Indias", hi: "एक पर्व, अनेक भारत", body: "Follow a festival across the map, from Lohri's bonfire in Punjab to Pongal's overflowing pot in Tamil Nadu." },
];

export const DOTS = "radial-gradient(color-mix(in srgb, var(--color-bg) 16%, transparent) 1px, transparent 1.5px) 0 0 / 14px 14px";
const wash = (h, a) => `oklch(0.9 0.08 ${h} / ${a})`;

// Page background: kolam dot grid over a soft four-colour wash.
export const SCREEN_BG = [
  "radial-gradient(color-mix(in srgb, var(--color-accent) 20%, transparent) 1px, transparent 1.5px) 0 0 / 16px 16px",
  `radial-gradient(120% 55% at 0% 0%, ${wash(70, 0.6)}, transparent 62%)`,
  `radial-gradient(90% 45% at 100% 32%, ${wash(350, 0.45)}, transparent 62%)`,
  `radial-gradient(100% 45% at 0% 72%, ${wash(150, 0.4)}, transparent 62%)`,
  `radial-gradient(100% 50% at 100% 100%, ${wash(240, 0.45)}, transparent 62%)`,
  "var(--color-bg)",
].join(", ");

export const SPLASH_BG = `${DOTS}, radial-gradient(90% 60% at 50% 42%, oklch(0.84 0.14 80 / .9), transparent 70%), linear-gradient(165deg, oklch(0.76 0.16 70) 0%, oklch(0.6 0.2 35) 55%, oklch(0.4 0.14 20) 100%)`;

export const DARK_SKY = "radial-gradient(circle at 30% 20%, var(--color-neutral-800), color-mix(in srgb, var(--color-neutral-900) 80%, black) 70%)";

// Colours for one festival: base (strokes), deep (text), tint (fills), line, glow (hero gradient).
export function col(id) {
  const h = HUE[id];
  if (h == null) {
    return {
      base: "var(--color-accent)", deep: "var(--color-accent-700)", tint: "var(--color-accent-100)", line: "var(--color-accent-300)",
      glow: `${DOTS}, linear-gradient(20deg, var(--color-accent-800), var(--color-accent-600) 55%, var(--color-accent-400))`,
    };
  }
  return {
    base: `oklch(0.66 0.16 ${h})`, deep: `oklch(0.45 0.13 ${h})`, tint: `oklch(0.95 0.035 ${h})`, line: `oklch(0.83 0.1 ${h})`,
    glow: `${DOTS}, radial-gradient(80% 70% at 100% 0%, oklch(0.8 0.15 ${h + 25} / .9), transparent 70%), linear-gradient(20deg, oklch(0.36 0.12 ${h - 12}) 0%, oklch(0.54 0.19 ${h}) 55%, oklch(0.7 0.17 ${h + 18}) 100%)`,
  };
}

const DAY = 864e5;
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Adds date facts to a festival from lib/data.js.
export function festivalView(f, today = new Date()) {
  const st = START[f.id];
  const d = st ? new Date(YEAR, st[0], st[1]) : null;
  const days = d ? Math.round((d - midnight(today)) / DAY) : null;
  return {
    ...f,
    c: col(f.id),
    ts: d ? +d : Infinity,
    dd: st ? String(st[1]).padStart(2, "0") : "—",
    mon: st ? MS[st[0]] : "Soon",
    monthIdx: st ? st[0] : null,
    days,
    upcoming: days != null && days >= 0,
    soon: !f.active,
  };
}

// Upcoming first (soonest first), then this year's past festivals, then those in production.
export function orderFestivals(festivals, today = new Date()) {
  const fs = festivals.map((f) => festivalView(f, today));
  const active = fs.filter((f) => f.active).sort((a, b) => a.ts - b.ts);
  const upcoming = active.filter((f) => f.upcoming).sort((a, b) => a.days - b.days);
  const past = active.filter((f) => !f.upcoming);
  const prod = fs.filter((f) => !f.active);
  return { all: fs, active, upcoming, past, prod, next: upcoming[0] || active[0] || null };
}

// "ananya.sharma@example.com" -> "Ananya Sharma"
export function nameFromEmail(email = "") {
  const local = email.split("@")[0] || "";
  return local.replace(/[._-]+/g, " ").replace(/\d+/g, "").trim().replace(/\b\w/g, (c) => c.toUpperCase()) || "Friend";
}
