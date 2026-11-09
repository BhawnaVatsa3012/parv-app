// Calendar layers: the Calendar is the umbrella (every festival, every
// tradition, always shown). Layers add day-by-day detail from one tradition's
// calendar. A user picks which layers they want; festivals never depend on it.
//
// calendar_layers on the profile: null = no choice yet (keeps today's
// behaviour, Hindu Panchang on); [] = chose none; otherwise a list of ids.

export const LAYERS = [
  { id: "panchang", label: "Hindu Panchang", blurb: "Tithi under each date, Ekadashi, Pradosh, Sankashti, Purnima and Amavasya markers, and a daily panchang panel." },
  { id: "hijri", label: "Hijri date", blurb: "The Islamic date under each day. Approximate: the month starts with the moon sighting." },
];
export const LAYER_IDS = LAYERS.map((l) => l.id);
export const layerLabel = (id) => LAYERS.find((l) => l.id === id)?.label || id;

// On the list of ideas, not built: Christian/Gregorian layer with Easter-based dates (Lent, Easter, Pentecost).
export const FUTURE_LAYERS = ["Christian (Easter-based dates)"];

// The tradition asked about at setup. Used only to pick the starting
// choice of layers; it is not saved.
export const TRADITIONS = [
  { id: "hindu", label: "Hindu" },
  { id: "muslim", label: "Muslim" },
  { id: "christian", label: "Christian" },
  { id: "sikh", label: "Sikh" },
  { id: "jain", label: "Jain" },
  { id: "buddhist", label: "Buddhist" },
  { id: "other", label: "Other / prefer not to say" },
];

const DEFAULTS = {
  hindu: ["panchang"],
  muslim: ["hijri"],
  christian: [],
  sikh: ["panchang"],
  jain: ["panchang"],
  buddhist: ["panchang"],
  other: ["panchang"],
};
// Sikh, Jain and Buddhist festivals here mostly follow the Hindu lunar calendar, so they start with that layer.
export const TRADITION_NOTE = {
  sikh: "Most dates here follow the Hindu lunar calendar, so we start you with Hindu Panchang. Change it any time.",
  jain: "Most dates here follow the Hindu lunar calendar, so we start you with Hindu Panchang. Change it any time.",
  buddhist: "Most dates here follow the Hindu lunar calendar, so we start you with Hindu Panchang. Change it any time.",
  christian: "Christian festivals use the ordinary calendar, so no extra layer is needed. You can add one below.",
};

export function defaultLayersFor(tradition) {
  return [...(DEFAULTS[tradition] || DEFAULTS.other)];
}

// Valid, de-duplicated ids in a fixed order, or null if the input isn't a list.
export function normalizeLayers(v) {
  if (!Array.isArray(v)) return null;
  return LAYER_IDS.filter((id) => v.includes(id));
}

// What to show for a profile's saved value. No choice yet = Hindu Panchang.
export function effectiveLayers(saved) {
  if (saved == null) return ["panchang"];
  return normalizeLayers(saved) || ["panchang"];
}

export const hasLayer = (layers, id) => layers.includes(id);

export function layersSummary(layers) {
  return layers.length ? layers.map(layerLabel).join(" · ") : "None (festival dates only)";
}

// The calendar a festival's own date is kept in. Independent of layers.
const SYSTEM_OVERRIDE = { vaisakhi: "solar" };
export function systemOf(f) {
  if (SYSTEM_OVERRIDE[f.id]) return SYSTEM_OVERRIDE[f.id];
  if (f.community === "Muslim") return "hijri";
  if (f.community === "Christian") return "gregorian";
  return "lunar"; // Hindu, Jain, Buddhist: tithi-based
}
export const SYSTEM_LABEL = {
  lunar: "Hindu lunar calendar (tithi)",
  hijri: "Hijri calendar",
  gregorian: "Gregorian calendar: a fixed date",
  solar: "solar calendar (the sun's entry into Mesha)",
};
