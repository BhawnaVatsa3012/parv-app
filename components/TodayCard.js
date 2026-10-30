"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { dayPanchang, rangePanchang, paranaWindow, fmtTime, zonedYMD } from "@/lib/panchang";
import { OBSERVANCES } from "@/lib/observances";
import { cityById, DEFAULT_CITY } from "@/lib/cities";
import { Hi } from "@/components/ui/Lang";
import CitySwitch from "@/components/CitySwitch";

const DAY_FMT = (y, m, d, opts) => new Date(Date.UTC(y, m, d, 12)).toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });

// Today's panchang for the user's city, with the day's observance if any.
export default function TodayCard({ homeCityId, next }) {
  const home = cityById(homeCityId) || DEFAULT_CITY;
  const [cityId, setCityId] = useState(home.id);
  const [info, setInfo] = useState(null);
  const city = cityById(cityId) || home;

  useEffect(() => {
    // Calculated in the browser, for the city's own date.
    const { y, m, d } = zonedYMD(new Date(), city.tz);
    const p = dayPanchang(y, m, d, city);
    let upcoming = null;
    if (!p.observances.length) {
      upcoming = rangePanchang(y, m, d + 1, 20, city).find((q) => q.observances.length) || null;
    }
    const extra = {};
    if (p.observances.includes("ekadashi")) extra.parana = paranaWindow(p, city);
    // Near a tithi boundary, published panchangs can list the day differently.
    const nearEdge = p.skippedTithi || (p.tithiEndsAt && p.tithiEndsAt - p.sunrise < 90 * 60000);
    setInfo({ p, upcoming, extra, nearEdge });
  }, [city]);

  if (!info) {
    return <div className="card" style={{ minHeight: 160, background: "transparent" }} aria-busy="true" />;
  }

  const { p, upcoming, extra, nearEdge } = info;
  const { y, m, d } = p.date;
  const t = p.tithiInfo;
  const obsId = p.observances[0];
  const obs = obsId && OBSERVANCES[obsId];
  const hue = obs?.hue ?? 65;
  const tz = city.tz;

  const keyTime = !obs ? null
    : obsId === "ekadashi" ? (extra.parana
        ? `Fast today. Break it tomorrow between ${fmtTime(extra.parana.start, tz)} and ${fmtTime(extra.parana.end, tz)}.`
        : "Fast today. Check a local panchang for tomorrow's parana (fast-breaking) time — it's unusual this time.")
    : obsId === "pradosh" ? `Pradosh Kaal: ${fmtTime(p.pradosh.start, tz)} – ${fmtTime(p.pradosh.end, tz)}`
    : obsId === "sankashti" ? `Moonrise: ${fmtTime(p.moonrise, tz)} — the fast is broken after seeing the moon.`
    : `${t.name} tithi ends at ${fmtTime(p.tithiEndsAt, tz)}${p.tithiEndsAt && zonedYMD(p.tithiEndsAt, tz).d !== d ? " (tomorrow)" : ""}.`;

  return (
    <section aria-label="Today" className="card" style={{ gap: 10, padding: 16, background: "color-mix(in srgb, var(--color-bg) 70%, transparent)", borderTop: `3px solid oklch(0.66 0.16 ${hue})` }}>
      <div className="kicker" style={{ color: `oklch(0.45 0.13 ${hue})` }}>
        Today · {DAY_FMT(y, m, d, { weekday: "long", day: "numeric", month: "long" })}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.1 }}>{obs ? obs.name : `${t.paksha} ${t.name}`}</span>
        <Hi size={14}>{obs ? obs.hi : `${t.pakshaHi} ${t.hi}`}</Hi>
      </div>
      {obs && <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: -6 }}>{t.paksha} {t.name}</div>}
      {obs ? (
        <>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, textAlign: "justify", hyphens: "auto" }}>{obs.story}</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-neutral-800)" }}>{obs.practice}</p>
          <div style={{ fontSize: 13.5, padding: "8px 10px", background: `oklch(0.95 0.035 ${hue})`, color: `oklch(0.4 0.12 ${hue})`, borderRadius: "var(--radius-md)" }}>{keyTime}</div>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--color-neutral-800)" }}>
          A quiet day in the calendar.
          {upcoming && <> Next: <b style={{ fontWeight: 600 }}>{OBSERVANCES[upcoming.observances[0]].name}</b> on {DAY_FMT(upcoming.date.y, upcoming.date.m, upcoming.date.d, { weekday: "short", day: "numeric", month: "short" })}.</>}
          {next?.upcoming && <> <Link href={`/festival/${next.id}`}>{next.name}</Link> is {next.days === 0 ? "today" : `${next.days} days away`}.</>}
        </p>
      )}
      <div className="tnum" style={{ display: "flex", gap: 16, fontSize: 12.5, color: "var(--color-neutral-700)", borderTop: "1px solid var(--color-divider)", paddingTop: 8 }}>
        <span>Sunrise {fmtTime(p.sunrise, tz)}</span>
        <span>Sunset {fmtTime(p.sunset, tz)}</span>
      </div>
      {nearEdge && obs && (
        <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
          The tithi changes close to sunrise today, so some panchangs list this on the next or previous day.
        </div>
      )}
      <CitySwitch city={city} homeId={home.id} onChange={setCityId} />
    </section>
  );
}
