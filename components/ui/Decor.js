"use client";
import { col, HUE, HUE_LIST, DOTS } from "@/lib/design";

// A strip of festival-coloured pennants.
export function Bunting({ light = false }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex", height: 13, overflow: "hidden",
        borderTop: `1px solid ${light ? "color-mix(in srgb, var(--color-bg) 28%, transparent)" : "var(--color-divider)"}`,
      }}
    >
      {Array.from({ length: 40 }, (_, i) => (
        <span key={i} style={{ flex: "1 0 14px", height: 12, clipPath: "polygon(0 0,100% 0,50% 100%)", background: col(HUE_LIST[i % 6]).base }} />
      ))}
    </div>
  );
}

// The Rangoli mascot: eight petals in festival colours, slowly turning.
export function Rangoli({ size = 140, spin = true, colors }) {
  const pc = (i) => (colors ? colors[i % colors.length] : col(HUE_LIST[i % 6]).base);
  const petals = [];
  for (let i = 0; i < 8; i++)
    petals.push(<ellipse key={"a" + i} cx={70} cy={36} rx={10} ry={24} transform={`rotate(${i * 45} 70 70)`} fill={pc(i)} fillOpacity={0.55} stroke="var(--color-bg)" strokeWidth={1.3} />);
  for (let i = 0; i < 8; i++)
    petals.push(<ellipse key={"b" + i} cx={70} cy={50} rx={5} ry={12} transform={`rotate(${i * 45 + 22.5} 70 70)`} fill="none" stroke={pc(i + 3)} strokeWidth={1.1} />);
  for (let i = 0; i < 16; i++)
    petals.push(<circle key={"c" + i} cx={70} cy={4} r={1.6} transform={`rotate(${i * 22.5} 70 70)`} fill={pc(i)} />);
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" aria-hidden="true" style={{ display: "block", animation: spin ? "spin 40s linear infinite" : "none" }}>
      {petals}
      <circle cx={70} cy={70} r={60} fill="none" stroke="var(--color-bg)" strokeWidth={0.8} strokeDasharray="2 4" />
      <circle cx={70} cy={70} r={7} fill="none" stroke="var(--color-bg)" strokeWidth={1.2} />
    </svg>
  );
}

// A "tipped-in plate": the matted image frame from the Classical system.
// Until real photographs are added, it holds the festival's rangoli and its
// Hindi name, drawn in the festival's colours.
export function Plate({ id, height = 180, hindi, onDark = true }) {
  const h = HUE[id] ?? 65;
  return (
    <div
      className="plate"
      style={{
        height, position: "relative", overflow: "hidden",
        borderColor: onDark ? "color-mix(in srgb, var(--color-bg) 10%, transparent)" : undefined,
        outline: onDark ? 0 : undefined,
        background: `${DOTS}, radial-gradient(circle at 50% 52%, oklch(0.78 0.14 ${h + 15} / .55), transparent 62%), linear-gradient(160deg, oklch(0.44 0.13 ${h}), oklch(0.28 0.08 ${h - 10}))`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {hindi && (
        <span className="font-hi" lang="hi" aria-hidden="true" style={{ position: "absolute", fontSize: Math.round(height * 0.6), lineHeight: 1, color: "transparent", WebkitTextStroke: "1px color-mix(in srgb, var(--color-bg) 28%, transparent)", whiteSpace: "nowrap" }}>
          {hindi}
        </span>
      )}
      <div style={{ position: "relative" }}><Rangoli size={Math.round(height * 0.62)} /></div>
    </div>
  );
}
