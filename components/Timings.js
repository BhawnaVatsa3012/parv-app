"use client";
import { useEffect, useState } from "react";
import { DAYS, YEAR } from "@/lib/design";
import { dayPanchang, fmtTime } from "@/lib/panchang";
import { cityById, DEFAULT_CITY } from "@/lib/cities";
import CitySwitch from "@/components/CitySwitch";

// Extra timings worth showing for a festival day: [month, day, label, kind].
const KEY = {
  diwali: [[10, 8, "Lakshmi Puja — Pradosh Kaal", "pradosh"]],
};

// Sunrise, sunset and tithi for each festival day, in the user's city.
export default function Timings({ festivalId, homeCityId, c }) {
  const home = cityById(homeCityId) || DEFAULT_CITY;
  const [cityId, setCityId] = useState(home.id);
  const [rows, setRows] = useState(null);
  const city = cityById(cityId) || home;
  const days = DAYS[festivalId] || [];

  useEffect(() => {
    setRows(days.map(([m, d]) => {
      const p = dayPanchang(YEAR, m, d, city);
      const key = (KEY[festivalId] || []).find(([km, kd]) => km === m && kd === d);
      return { m, d, p, key };
    }));
  }, [city, festivalId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!days.length) return null;
  const tz = city.tz;
  return (
    <section aria-label="Timings" style={{ margin: "14px 0 4px", padding: "12px 14px", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="kicker" style={{ color: c.deep }}>Timings · {city.name}</div>
      {!rows ? <div style={{ height: 40 }} aria-busy="true" /> : rows.map(({ m, d, p, key }) => (
        <div key={`${m}-${d}`} className="tnum" style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, fontSize: 13, paddingTop: 6, borderTop: "1px solid var(--color-divider)" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: c.deep }}>
            {new Date(Date.UTC(YEAR, m, d, 12)).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span>{p.tithiInfo.paksha} {p.tithiInfo.name} <span style={{ color: "var(--color-neutral-700)" }}>· until {fmtTime(p.tithiEndsAt, tz)}</span></span>
            <span style={{ color: "var(--color-neutral-700)" }}>Sunrise {fmtTime(p.sunrise, tz)} · Sunset {fmtTime(p.sunset, tz)}</span>
            {key && key[3] === "pradosh" && (
              <span style={{ color: c.deep }}>{key[2]}: {fmtTime(p.pradosh.start, tz)} – {fmtTime(p.pradosh.end, tz)}</span>
            )}
          </span>
        </div>
      ))}
      <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
        {city.country === "India"
          ? "Calculated for your city. Family and temple traditions may set a different muhurat."
          : "Dates are India's. Abroad, a festival tied to a tithi can fall a day earlier or later — check with your local temple."}
      </div>
      <CitySwitch city={city} homeId={home.id} onChange={setCityId} />
    </section>
  );
}
