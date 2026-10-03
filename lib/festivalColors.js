// Per-festival accent colors, from the Classical design system.
// Each festival gets a hue on a shared OKLCH scale, so every festival's
// base/deep/tint/line colors sit at the same lightness/chroma steps.
const HUE = {
  diwali: 65,
  bhaidooj: 300,
  holi: 350,
  teej: 150,
  newyear: 35,
  sankranti: 240,
  ganesh: 45,
  navratri: 330,
  onam: 110,
};

const NEUTRAL = {
  base: "#C28D41",
  deep: "#8A5F26",
  tint: "#EFEAE2",
  line: "#D8D2C8",
};

export function getFestivalColors(id) {
  const h = HUE[id];
  if (h == null) return NEUTRAL;
  return {
    base: `oklch(0.66 0.16 ${h})`,
    deep: `oklch(0.45 0.13 ${h})`,
    tint: `oklch(0.95 0.035 ${h})`,
    line: `oklch(0.83 0.1 ${h})`,
  };
}
