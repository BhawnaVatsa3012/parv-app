"use client";
import { CITIES } from "@/lib/cities";

// "Times for Mumbai · check another city" — changes only what's shown
// here, never the city saved in the profile.
export default function CitySwitch({ city, homeId, onChange, color = "var(--color-neutral-700)" }) {
  const india = CITIES.filter((c) => c.country === "India");
  const abroad = CITIES.filter((c) => c.country !== "India");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12, color }}>
      <span>Times for</span>
      <label style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Check another city</span>
        <select
          value={city.id}
          onChange={(e) => onChange(e.target.value)}
          style={{ font: "inherit", fontSize: 12, color: "var(--color-accent-700)", background: "transparent", border: 0, borderBottom: "1px solid var(--color-accent)", padding: "1px 16px 1px 0", appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
        >
          <optgroup label="India">{india.map((c) => <option key={c.id} value={c.id}>{c.name}{c.id === homeId ? " (your city)" : ""}</option>)}</optgroup>
          <optgroup label="Abroad">{abroad.map((c) => <option key={c.id} value={c.id}>{c.name}, {c.country}{c.id === homeId ? " (your city)" : ""}</option>)}</optgroup>
        </select>
        <span aria-hidden="true" style={{ position: "absolute", right: 2, pointerEvents: "none", color: "var(--color-accent-700)", fontSize: 10 }}>▾</span>
      </label>
      {city.id !== homeId && homeId && (
        <button type="button" className="btn btn-ghost" onClick={() => onChange(homeId)} style={{ fontSize: 12, padding: "0 4px" }}>back to your city</button>
      )}
    </div>
  );
}
