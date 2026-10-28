// Preparation checklists. `before` = suggested number of days before the
// festival's first day to have it done. Samagri (puja supplies) items are
// added from the festival's rituals for members.
import { storyData } from "@/lib/data";
import { START, YEAR } from "@/lib/design";

const PREP = {
  diwali: [
    ["clean", "Deep-clean the home — Lakshmi is said to enter only clean, well-lit homes", 10],
    ["lights", "Check diyas, wicks and string lights; buy what's missing", 7],
    ["clothes", "Plan new or festive clothes for the family", 7],
    ["rangoli", "Buy rangoli colours and plan the design", 5],
    ["sweets", "Order or make sweets and dry-fruit boxes for gifting", 4],
    ["dhanteras", "Decide what to buy on Dhanteras (metal utensil, coin or jewellery)", 3],
    ["calls", "Make a list of family and friends to visit or call", 2],
  ],
  bhaidooj: [
    ["gift", "Choose a gift for your sister or brother", 5],
    ["thali", "Prepare the tilak thali: roli, rice, a diya and sweets", 1],
    ["meal", "Plan the meal you'll share", 2],
  ],
  holi: [
    ["colours", "Buy natural or herbal colours (gulal) — avoid chemical ones", 5],
    ["clothes", "Keep old white clothes ready", 3],
    ["skin", "Oil hair and skin the night before to make colours wash out easily", 1],
    ["food", "Make gujiya and thandai, or order them", 2],
    ["wood", "Find out where your neighbourhood's Holika Dahan bonfire is", 2],
  ],
  teej: [
    ["mehendi", "Book or plan mehendi", 3],
    ["clothes", "Get green or red festive clothes and bangles ready", 4],
    ["ghewar", "Order ghewar (Rajasthan) or plan the sargi/sindhara gifts", 3],
    ["swing", "Plan the evening — songs, a swing, or a gathering", 2],
  ],
  newyear: [
    ["clean", "Clean the home and the entrance", 5],
    ["regional", "Check your region's custom: gudi, Vishu kani, Ugadi pachadi, or Bihu", 4],
    ["clothes", "Plan new clothes for the day", 4],
    ["food", "Plan the festive meal", 2],
  ],
  sankranti: [
    ["til", "Buy sesame (til) and jaggery for til-gul or ladoos", 4],
    ["kites", "Buy kites and manja if your family flies kites", 5],
    ["bonfire", "Find out about the Lohri or Bhogi bonfire near you", 2],
    ["pongal", "Get new rice, jaggery and a pot if you make Pongal", 3],
  ],
};

// All checklist items for a festival. Samagri ones are flagged.
export function checklistItems(festivalId) {
  const base = (PREP[festivalId] || []).map(([key, text, before]) => ({ key, text, before, samagri: false }));
  const rituals = storyData[festivalId]?.rituals || [];
  const seen = new Set();
  const samagri = [];
  rituals.forEach((r, ri) =>
    (r.samagri || []).forEach((s, si) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      samagri.push({ key: `s${ri}-${si}`, text: `Get: ${s}`, before: 3, samagri: true });
    })
  );
  return [...base, ...samagri].sort((a, b) => b.before - a.before);
}

export function festivalStart(festivalId) {
  const st = START[festivalId];
  return st ? new Date(YEAR, st[0], st[1]) : null;
}

// "do by" date for an item.
export function doBy(festivalId, before) {
  const s = festivalStart(festivalId);
  return s ? new Date(s.getFullYear(), s.getMonth(), s.getDate() - before) : null;
}

export const NUDGE_DAYS = [10, 3, 1];
