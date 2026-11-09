// Preparation checklists. `before` = suggested number of days before the
// festival's first day to have it done. Samagri (puja supplies) items are
// added from the festival's rituals for members.
import { storyData } from "@/lib/data";
import { occurrence } from "@/lib/occurrence";

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
  chhath: [
    ["clean", "Clean the home and the kitchen where the prasad will be cooked", 4],
    ["ghat", "Decide your ghat — river, pond or a tank at home — and check the arrangements there", 5],
    ["baskets", "Buy bamboo baskets (daura) and soop, or take out last year's", 4],
    ["wheat", "Wash and dry the wheat for thekua (many families grind it fresh)", 3],
    ["clothes", "Get new clothes for the family, and a yellow saree for Kharna if you wear one", 4],
    ["fruit", "Buy sugarcane, fruit, ginger and the rest of the offerings", 1],
    ["songs", "Learn or note down a few Chhath songs to sing at the ghat", 2],
  ],
  rakshabandhan: [
    ["post", "If a brother or sister lives far away, post the rakhi and gift now so it arrives in time", 10],
    ["rakhi", "Buy or make the rakhis: one for each brother or cousin, and a lumba if your family keeps it", 7],
    ["visit", "Plan how you will be together at the tying time, in person or on a video call", 5],
    ["gift", "Choose the gift to give", 5],
    ["time", "Check the Purnima and Bhadra timing for your city and decide when to tie the rakhi", 3],
    ["sweets", "Order or plan the sweets for the thali", 3],
    ["clothes", "Plan festive clothes for the day", 2],
    ["thali", "Set up the thali: roli, rice, a diya, sweets and the rakhi", 1],
  ],
  shivratri: [
    ["fast", "Decide how you will fast (water only, fruit and milk, or one simple meal) and tell the family", 3],
    ["food", "Stock fruit, milk, sabudana, makhana and rock salt (sendha namak) for the fast", 3],
    ["bilva", "Get fresh bilva (bel) leaves for the offering", 2],
    ["abhisheka", "Keep water, milk, curd, honey and ghee ready for the abhisheka", 2],
    ["temple", "If you will go to a temple, check its darshan timings and arrive early: queues are long on Shivratri", 4],
    ["night", "Plan the night vigil: the four praharas, bhajans and who stays up", 2],
    ["clean", "Clean the puja corner and set out the lingam or picture", 1],
    ["parana", "Plan how you will break the fast the next morning after sunrise", 1],
  ],
  janmashtami: [
    ["fast", "Decide how you will fast (a full day, fruit only, or one simple meal) and tell the family", 3],
    ["jhula", "Clean Laddu Gopal's cradle (jhula) and get his outfit ready: poshak, crown, flute and peacock feather", 4],
    ["decor", "Plan the decoration for the cradle and puja corner: flowers and lights", 3],
    ["prasad", "Buy for the prasad: butter and mishri, panjiri, and seedai or murukku if your family makes them", 3],
    ["night", "Plan the midnight: who stays up, the bhajans, and when you will break the fast", 2],
    ["tulsi", "Get fresh tulsi leaves and flowers", 1],
    ["handi", "Find out where your neighbourhood's Dahi Handi or Krishna Leela is, and the safe viewing spot", 2],
    ["feet", "Keep rice flour ready for the little footprints from the door to the prayer room", 1],
  ],
  ganesh: [
    ["murti", "Book or choose your Ganesha idol — a clay (shadu) one dissolves cleanly in water", 14],
    ["days", "Decide how many days the idol will stay (1.5, 3, 5, 7 or 10) and where the visarjan will be", 10],
    ["tub", "Keep a bucket or tub ready for home immersion, or find your neighbourhood's artificial pond", 7],
    ["decor", "Plan the decoration: the mantap or backdrop, flowers and lights (in Goa, the matoli)", 7],
    ["aarti", "Print or save the aarti and puja booklet, and tell neighbours when darshan is open", 5],
    ["clothes", "Plan festive clothes for the day the idol arrives", 4],
    ["modak", "Plan the modak and other prasad: rice flour, coconut and jaggery, or pre-order", 3],
    ["clean", "Clean the house and the puja corner, and set up the platform", 2],
  ],
  navratri: [
    ["corner", "Clean the puja corner and choose where the kalash will stand", 3],
    ["sow", "Buy a wide clay pot, soil and barley (or seven grains) for sowing", 2],
    ["kalash", "Get a kalash, a coconut, red cloth, mango leaves and mauli", 2],
    ["plan", "Plan the nine days: fasts, Garba nights, Golu or pandal visits", 5],
    ["garba", "Book Garba passes or check your society's schedule", 7],
    ["kanya", "Invite nine girls (and one boy) for Kanya Pujan on Ashtami or Navami", 1],
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

// First day of a festival in a given year.
export function festivalStart(festivalId, year) {
  const o = year ? occurrence(festivalId, year) : null;
  return o ? new Date(o.start.y, o.start.m, o.start.d) : null;
}

// "do by" date for an item, counted back from that year's first day.
export function doBy(festivalId, before, year) {
  const s = festivalStart(festivalId, year);
  return s ? new Date(s.getFullYear(), s.getMonth(), s.getDate() - before) : null;
}

export const NUDGE_DAYS = [10, 3, 1];
