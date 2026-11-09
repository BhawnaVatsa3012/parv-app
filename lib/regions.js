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
  rakshabandhan: {
    "Rajasthan (Lumba & Karnavati)": ["Rajasthan", "Gujarat", "Madhya Pradesh"],
    "West Bengal (Tagore's rakhi)": ["West Bengal"],
    "Maharashtra (Narali Purnima)": ["Maharashtra", "Goa"],
    "Odisha (Gamha Purnima)": ["Odisha"],
    "Tamil Nadu & Karnataka (Avani Avittam)": ["Tamil Nadu", "Karnataka", "Kerala", "Puducherry"],
  },
  karvachauth: {
    "Punjab & Haryana (Sargi)": ["Punjab", "Haryana", "Chandigarh", "Delhi"],
    "Uttar Pradesh (Chauth Mata & the karwa)": ["Uttar Pradesh", "Uttarakhand", "Madhya Pradesh", "Bihar", "Jharkhand", "Chhattisgarh"],
    "Rajasthan (Baya & mud karvas)": ["Rajasthan"],
    "Andhra Pradesh & Telangana (Atla Tadde)": ["Andhra Pradesh", "Telangana"],
    "Gujarat & Maharashtra (a newer custom)": ["Gujarat", "Maharashtra", "Goa"],
  },
  onam: {
    "Ernakulam (Thrikkakara)": ["Kerala"],
    "Thrissur (Pulikali)": ["Kerala"],
    "Pathanamthitta (Aranmula)": ["Kerala"],
    "North Malabar (Onapottan)": ["Kerala", "Lakshadweep"],
    "Kerala homes (Pookkalam & Onasadya)": ["Kerala", "Karnataka", "Tamil Nadu", "Puducherry"],
  },
  pongal: {
    "Tamil Nadu (Thai Pongal)": ["Tamil Nadu", "Puducherry"],
    "Madurai (Jallikattu)": ["Tamil Nadu"],
    "Villages & Mattu Pongal": ["Tamil Nadu", "Puducherry"],
    "Kaanum Pongal & family": ["Tamil Nadu", "Puducherry"],
    "Sri Lanka & Singapore": ["Singapore", "Sri Lanka"],
  },
  shivratri: {
    "Uttar Pradesh (Varanasi)": ["Uttar Pradesh"],
    "Madhya Pradesh (Ujjain)": ["Madhya Pradesh"],
    "Jammu & Kashmir (Herath)": ["Jammu & Kashmir"],
    "Gujarat (Junagadh)": ["Gujarat"],
    "Tamil Nadu (Tiruvannamalai & Chidambaram)": ["Tamil Nadu", "Puducherry"],
  },
  janmashtami: {
    "Uttar Pradesh (Mathura & Vrindavan)": ["Uttar Pradesh"],
    "Gujarat (Dwarka)": ["Gujarat"],
    "Maharashtra (Dahi Handi)": ["Maharashtra"],
    "Karnataka (Udupi)": ["Karnataka"],
    "Tamil Nadu (Gokulashtami)": ["Tamil Nadu", "Puducherry"],
  },
  ganesh: {
    "Maharashtra (Pune)": ["Maharashtra"],
    "Maharashtra (Mumbai)": ["Maharashtra"],
    "Goa (Chavath)": ["Goa"],
    "Tamil Nadu (Pillaiyarpatti)": ["Tamil Nadu", "Puducherry"],
    "Telangana (Khairatabad, Hyderabad)": ["Telangana"],
  },
  navratri: {
    "Gujarat (Garba)": ["Gujarat"],
    "West Bengal (Durga Puja)": ["West Bengal", "Tripura", "Assam"],
    "Tamil Nadu (Golu)": ["Tamil Nadu", "Andhra Pradesh", "Puducherry"],
    "Telangana (Bathukamma)": ["Telangana"],
    "Karnataka (Mysuru Dasara)": ["Karnataka"],
    "Himachal Pradesh (Kullu Dussehra)": ["Himachal Pradesh"],
    "Uttar Pradesh (Ramlila & Ravan Dahan)": ["Uttar Pradesh", "Delhi", "Bihar", "Madhya Pradesh", "Uttarakhand"],
  },
  chhath: {
    "Bihar (Deo, Aurangabad)": ["Bihar"],
    "Munger, Bihar": ["Bihar"],
    "Jharkhand": ["Jharkhand"],
    "Mithila & Nepal (Janakpur)": [],
    "Delhi & Mumbai": ["Delhi", "Maharashtra"],
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
