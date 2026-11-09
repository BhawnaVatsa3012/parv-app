"use client";
import { useEffect, useState } from "react";
import { occurrence } from "@/lib/occurrence";
import { dayPanchang, fmtTime, zonedYMD } from "@/lib/panchang";
import { cityById, DEFAULT_CITY } from "@/lib/cities";
import CitySwitch from "@/components/CitySwitch";

// Extra timings worth showing on a festival's named days: [day, label, kind].
const KEY = {
  diwali: [["lakshmi", "Lakshmi Puja — Pradosh Kaal", "pradosh"]],
  chhath: [["sandhya", "Sandhya Arghya — sunset", "sunset"], ["usha", "Usha Arghya — sunrise", "sunrise"]],
  shivratri: [["shivratri", "Nishita puja (just after midnight)", "nishita"]],
  janmashtami: [["janmashtami", "Nishita puja (just after midnight)", "nishita"]],
  pongal: [["pongal", "Sankranti day: cook the pot after sunrise", "sunrise"]],
  onam: [["thiruvonam", "Thiruvonam puja: Madhyahna", "madhyahna"]],
  karvachauth: [["karva", "Moonrise (break the fast after the moon is seen)", "moonrise"]],
  ganesh: [["ganesh", "Ganesh puja — Madhyahna", "madhyahna"]],
  navratri: [["ghatasthapana", "Ghatasthapana — first third of the day", "pratah"], ["dashami", "Vijayadashami puja — Aparahna", "aparahna"]],
};

// Festivals that follow the sun, a fixed date or the Hijri moon, not a tithi: no Hindu tithi line.
const NO_TITHI = new Set(["vaisakhi"]);

// A short note under a festival's timings, where the date needs explaining.
const NOTE = {
  buddha: "Buddha Purnima is the day Vaishakha Purnima holds at sunrise. Sri Lanka and South-East Asia keep Vesak by their own reckoning, and Tibetan Buddhists keep Saga Dawa Düchen on the full moon of their fourth month, which can be a month later: confirm with your monastery or vihara.",
  mahavir: "Jains keep the day on which Chaitra Shukla Trayodashi holds at sunrise. Calendars can differ by a day in a year when the tithi begins and ends close to sunrise; your temple or sangh will announce the day.",
  vaisakhi: "Vaisakhi follows the sun's entry into Mesha (Aries), not the moon. Sikh institutions announce the day: it is 13 or 14 April, and in some years Punjab has kept the 13th when the Delhi calculation gives the 14th.",
};

// Nakshatra-based festivals: the ten days are not tithi days, so only the key day is shown.
const KEY_ONLY = new Set(["onam"]);

// "2:02 am" on the same day, or "2:02 am next day" when it runs past midnight.
function until(date, tz, d) {
  if (!date) return "—";
  return zonedYMD(date, tz).d === d ? fmtTime(date, tz) : `${fmtTime(date, tz)} next day`;
}

// Sunrise, sunset and tithi for each festival day, in the user's city.
export default function Timings({ festivalId, year, homeCityId, c }) {
  const home = cityById(homeCityId) || DEFAULT_CITY;
  const [cityId, setCityId] = useState(home.id);
  const [rows, setRows] = useState(null);
  const city = cityById(cityId) || home;
  const occ = year ? occurrence(festivalId, year) : null;
  const days = occ ? occ.days : [];

  useEffect(() => {
    setRows(days.map(({ y, m, d }) => {
      const p = dayPanchang(y, m, d, city);
      const k = (KEY[festivalId] || []).find(([name]) => { const n = occ.named[name]; return n && n.y === y && n.m === m && n.d === d; });
      return { y, m, d, p, key: k ? [null, k[1], k[2]] : null };
    }).filter((r) => !KEY_ONLY.has(festivalId) || r.key));
  }, [city, festivalId, year]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!days.length) return null;
  const tz = city.tz;
  return (
    <section aria-label="Timings" style={{ margin: "14px 0 4px", padding: "12px 14px", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="kicker" style={{ color: c.deep }}>Timings · {city.name}</div>
      {!rows ? <div style={{ height: 40 }} aria-busy="true" /> : rows.map(({ y, m, d, p, key }) => (
        <div key={`${y}-${m}-${d}`} className="tnum" style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, fontSize: 13, paddingTop: 6, borderTop: "1px solid var(--color-divider)" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: c.deep }}>
            {new Date(Date.UTC(y, m, d, 12)).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {!KEY_ONLY.has(festivalId) && !NO_TITHI.has(festivalId) && <span>{p.tithiInfo.paksha} {p.tithiInfo.name} <span style={{ color: "var(--color-neutral-700)" }}>· until {until(p.tithiEndsAt, tz, d)}</span></span>}
            <span style={{ color: "var(--color-neutral-700)" }}>Sunrise {fmtTime(p.sunrise, tz)} · Sunset {fmtTime(p.sunset, tz)}</span>
            {key && key[2] === "pradosh" && (
              <span style={{ color: c.deep }}>{key[1]}: {fmtTime(p.pradosh.start, tz)} – {fmtTime(p.pradosh.end, tz)}</span>
            )}
            {key && key[2] === "sunset" && <span style={{ color: c.deep }}>{key[1]}: {fmtTime(p.sunset, tz)}</span>}
            {key && key[2] === "sunrise" && <span style={{ color: c.deep }}>{key[1]}: {fmtTime(p.sunrise, tz)}</span>}
            {key && key[2] === "pratah" && (
              // From sunrise, or from when Pratipada begins if it starts later that morning.
              <span style={{ color: c.deep }}>{key[1]}: {fmtTime(p.tithi === 1 ? p.sunrise : p.tithiEndsAt, tz)} – {fmtTime(new Date(p.sunrise.getTime() + (p.sunset - p.sunrise) / 3), tz)}</span>
            )}
            {key && key[2] === "nishita" && <span style={{ color: c.deep }}>{key[1]}: {fmtTime(new Date(p.sunset.getTime() + 7 * (p.nextSunrise - p.sunset) / 15), tz)} – {fmtTime(new Date(p.sunset.getTime() + 8 * (p.nextSunrise - p.sunset) / 15), tz)}</span>}
            {key && key[2] === "madhyahna" && <span style={{ color: c.deep }}>{key[1]}: {fmtTime(new Date(p.sunrise.getTime() + 2 * (p.sunset - p.sunrise) / 5), tz)} – {fmtTime(new Date(p.sunrise.getTime() + 3 * (p.sunset - p.sunrise) / 5), tz)}</span>}
            {key && key[2] === "moonrise" && p.moonrise && <span style={{ color: c.deep }}>{key[1]}: {fmtTime(p.moonrise, tz)}</span>}
            {key && key[2] === "aparahna" && <span style={{ color: c.deep }}>{key[1]}: {fmtTime(new Date(p.sunrise.getTime() + 3 * (p.sunset - p.sunrise) / 5), tz)} – {fmtTime(new Date(p.sunrise.getTime() + 4 * (p.sunset - p.sunrise) / 5), tz)}</span>}
          </span>
        </div>
      ))}
      {NOTE[festivalId] && <div style={{ fontSize: 12, lineHeight: 1.45, color: c.deep }}>{NOTE[festivalId]}</div>}
      <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
        {city.country === "India"
          ? "Calculated for your city. Family and temple traditions may set a different muhurat."
          : "Dates are India's. Abroad, a festival tied to a tithi can fall a day earlier or later — check with your local temple."}
      </div>
      <CitySwitch city={city} homeId={home.id} onChange={setCityId} />
    </section>
  );
}
