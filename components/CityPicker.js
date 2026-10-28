"use client";
import { useMemo, useState } from "react";
import { CITIES, cityById, cityLabel, nearestCity } from "@/lib/cities";

// Search the city list, or use the device's location to pick the nearest.
// Only the chosen city is kept; the device's exact position is never saved.
export default function CityPicker({ value, onChange, autoFocus = false }) {
  const [q, setQ] = useState("");
  const [locating, setLocating] = useState(false);
  const [msg, setMsg] = useState("");
  const selected = cityById(value);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return CITIES.filter((c) => [c.name, c.state, c.country].join(" ").toLowerCase().includes(s)).slice(0, 8);
  }, [q]);

  function useLocation() {
    setMsg("");
    if (!navigator.geolocation) { setMsg("Location isn't available on this device — search instead."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { city, km } = nearestCity(pos.coords.latitude, pos.coords.longitude);
        onChange(city.id);
        setQ("");
        setMsg(km > 150 ? `Nearest city we have is ${cityLabel(city)}, about ${km} km away. Search if there's a closer one.` : "");
      },
      () => { setLocating(false); setMsg("Couldn't get your location — search for your city instead."); },
      { timeout: 10000, maximumAge: 600000 }
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {selected && (
        <div className="card" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderColor: "var(--color-accent)", padding: "10px 12px" }}>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, fontWeight: 600 }}>{selected.name}</span>
            <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{selected.state || selected.country}</span>
          </span>
          <span className="tag tag-accent">Selected</span>
        </div>
      )}
      <div className="field">
        <label htmlFor="city-search">{selected ? "Change city" : "Search your city"}</label>
        <input id="city-search" className="input" autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Pune, Patna, London" autoComplete="off" style={{ minHeight: 44, fontSize: 15 }} />
      </div>
      {matches.length > 0 && (
        <div role="listbox" style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          {matches.map((c, i) => (
            <button
              key={c.id}
              role="option"
              aria-selected={c.id === value}
              onClick={() => { onChange(c.id); setQ(""); setMsg(""); }}
              className="hover-tint"
              style={{ all: "unset", boxSizing: "border-box", width: "100%", cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderTop: i ? "1px solid var(--color-divider)" : 0, fontSize: 14 }}
            >
              <span>{c.name}</span>
              <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{c.state || c.country}</span>
            </button>
          ))}
        </div>
      )}
      {q.trim() && !matches.length && (
        <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No match. Try the nearest big city — times differ by only a few minutes nearby.</div>
      )}
      <button type="button" className="btn btn-ghost" onClick={useLocation} disabled={locating} style={{ alignSelf: "flex-start", paddingLeft: 0 }}>
        {locating ? "Finding you…" : "Use my location"}
      </button>
      {msg && <div role="status" style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>{msg}</div>}
    </div>
  );
}
