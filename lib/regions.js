// Which states each regional story belongs to, so a reader's own region
// can be shown first. Keys are the region names exactly as in lib/data.js.
const SOUTH = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"];

export const REGION_STATES = {
  diwali: {
    "Uttar Pradesh": ["Uttar Pradesh"],
    "Bengal": ["West Bengal"],
    "Tamil Nadu": ["Tamil Nadu"],
    "Gujarat": ["Gujarat"],
    "Maharashtra": ["Maharashtra"],
  },
  holi: {
    "Braj (Mathura)": ["Uttar Pradesh"],
    "West Bengal": ["West Bengal"],
    "Punjab": ["Punjab"],
    "Manipur": ["Manipur"],
    "Konkan (Maharashtra)": ["Maharashtra", "Goa"],
  },
  bhaidooj: {
    "Maharashtra": ["Maharashtra"],
    "West Bengal": ["West Bengal"],
    "Uttar Pradesh & Bihar": ["Uttar Pradesh", "Bihar"],
    "South India": SOUTH,
  },
  teej: {
    "Rajasthan (Jaipur)": ["Rajasthan"],
    "Uttar Pradesh & Bihar": ["Uttar Pradesh", "Bihar"],
  },
  newyear: {
    "Maharashtra (Gudi Padwa)": ["Maharashtra", "Goa"],
    "Karnataka, Andhra Pradesh & Telangana (Ugadi)": ["Karnataka", "Andhra Pradesh", "Telangana"],
    "Kerala (Vishu)": ["Kerala"],
    "Tamil Nadu (Puthandu)": ["Tamil Nadu"],
    "Assam (Bohag/Rongali Bihu)": ["Assam"],
    "West Bengal (Poila Boishakh)": ["West Bengal"],
    "Punjab (Baisakhi)": ["Punjab", "Haryana"],
  },
  sankranti: {
    "Punjab (Lohri)": ["Punjab", "Haryana", "Himachal Pradesh", "Delhi", "Chandigarh", "Jammu & Kashmir"],
    "Gujarat (Uttarayan)": ["Gujarat"],
    "Tamil Nadu (Pongal)": ["Tamil Nadu"],
    "Andhra Pradesh & Telangana (Sankranti, Bhogi & Kanuma)": ["Andhra Pradesh", "Telangana"],
    "Maharashtra & Karnataka (Til-gul & Ellu-Bella)": ["Maharashtra", "Karnataka", "Goa"],
    "Assam (Magh Bihu / Bhogali Bihu)": ["Assam"],
    "West Bengal & Odisha (Poush Sankranti & Gangasagar Mela)": ["West Bengal", "Odisha"],
  },
};

export const isMyRegion = (festivalId, regionName, state) =>
  Boolean(state && REGION_STATES[festivalId]?.[regionName]?.includes(state));

// Regions with the reader's own first (original order otherwise kept).
// Returns [{ ...region, origIndex, mine }].
export function orderRegions(festivalId, regions, state) {
  const list = (regions || []).map((r, i) => ({ ...r, origIndex: i, mine: isMyRegion(festivalId, r.name, state) }));
  return [...list.filter((r) => r.mine), ...list.filter((r) => !r.mine)];
}
