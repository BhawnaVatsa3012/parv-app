"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { dayPanchang, rangePanchang, paranaWindow, fmtTime, zonedYMD } from "@/lib/panchang";
import { OBSERVANCES } from "@/lib/observances";
import { cityById, DEFAULT_CITY } from "@/lib/cities";
import { HUE } from "@/lib/design";
import { hijriOf, hijriLabel } from "@/lib/hijri";
import { Hi } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";
import CitySwitch from "@/components/CitySwitch";

const DAY_FMT = (y, m, d, opts) => new Date(Date.UTC(y, m, d, 12)).toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });

// Today for the user's city: festivals on now (always), plus whatever the
// chosen calendar layers add (Hijri date, Hindu Panchang observance). Tithi and
// moon details sit in a collapsed "Lunar details" section.
export default function TodayCard({ homeCityId, next, onNow = [], layers = ["panchang"], layersLocked = false }) {
  const showPanchang = layers.includes("panchang");
  const showHijri = layers.includes("hijri");
  const home = cityById(homeCityId) || DEFAULT_CITY;
  const [cityId, setCityId] = useState(home.id);
  const [info, setInfo] = useState(null);
  const city = cityById(cityId) || home;

  useEffect(() => {
    // Calculated in the browser, for the city's own date.
    const { y, m, d } = zonedYMD(new Date(), city.tz);
    const p = dayPanchang(y, m, d, city);
    let upcoming = null;
    if (showPanchang && !p.observances.length) {
      upcoming = rangePanchang(y, m, d + 1, 20, city).find((q) => q.observances.length) || null;
    }
    const extra = {};
    if (showPanchang && p.observances.includes("ekadashi")) extra.parana = paranaWindow(p, city);
    // Near a tithi boundary, published panchangs can list the day differently.
    const nearEdge = p.skippedTithi || (p.tithiEndsAt && p.tithiEndsAt - p.sunrise < 90 * 60000);
    setInfo({ p, upcoming, extra, nearEdge, hijri: showHijri ? hijriOf(y, m, d) : null });
  }, [city, showPanchang, showHijri]);

  if (!info) {
    return <div className="card" style={{ minHeight: 160, background: "transparent" }} aria-busy="true" />;
  }

  const { p, upcoming, extra, nearEdge, hijri } = info;
  const { y, m, d } = p.date;
  const t = p.tithiInfo;
  const obsId = showPanchang ? p.observances[0] : null;
  const obs = obsId && OBSERVANCES[obsId];
  const fest = onNow[0] || null; // a festival on today, whatever the layers
  const hue = obs?.hue ?? (fest ? HUE[fest.id] ?? 65 : 65);
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
      {onNow.map((f) => (
        <Link key={f.id} href={`/festival/${f.id}`} style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", padding: "8px 10px", borderRadius: "var(--radius-md)", background: f.c.tint, color: f.c.deep, textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, lineHeight: 1.1 }}>{f.name}</span>
          <span style={{ fontSize: 12.5 }}>{f.ongoing ? "is on now" : "is today"}</span>
          <span style={{ marginLeft: "auto", fontSize: 13 }}>Read the story →</span>
        </Link>
      ))}
      {hijri && (
        <div className="tnum" style={{ fontSize: 14 }}>
          Hijri date: <b style={{ fontWeight: 600 }}>{hijriLabel(hijri)}</b>
          <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>Approximate: the month starts with the moon sighting.</div>
        </div>
      )}
      {obs && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.1 }}>{obs.name}</span>
            <Hi size={14}>{obs.hi}</Hi>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, textAlign: "justify", hyphens: "auto" }}>{obs.story}</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-neutral-800)" }}>{obs.practice}</p>
          <div style={{ fontSize: 13.5, padding: "8px 10px", background: `oklch(0.95 0.035 ${hue})`, color: `oklch(0.4 0.12 ${hue})`, borderRadius: "var(--radius-md)" }}>{keyTime}</div>
        </>
      )}
      {!obs && !fest && (
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
      {showPanchang && (
        <details style={{ fontSize: 13 }}>
          <summary style={{ cursor: "pointer", color: "var(--color-neutral-800)" }}>Lunar details</summary>
          <div className="tnum" style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 0 0" }}>
            <div>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>{t.paksha} {t.name}</span> <Hi size={12}>{t.pakshaHi} {t.hi}</Hi>
            </div>
            <div style={{ color: "var(--color-neutral-700)" }}>Tithi at sunrise. Ends at {fmtTime(p.tithiEndsAt, tz)}{p.tithiEndsAt && zonedYMD(p.tithiEndsAt, tz).d !== d ? " (tomorrow)" : ""}.</div>
            {obs && <div style={{ color: "var(--color-neutral-700)" }}>Observance today: {obs.name}.</div>}
            <div style={{ color: "var(--color-neutral-700)" }}>Moonrise {p.moonrise && zonedYMD(p.moonrise, tz).d === d ? fmtTime(p.moonrise, tz) : "none today"}</div>
            {nearEdge && obs && (
              <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
                The tithi changes close to sunrise today, so some panchangs list this on the next or previous day.
              </div>
            )}
          </div>
        </details>
      )}
      {layersLocked && (
        <div data-testid="lunar-locked" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-neutral-800)" }}>
          <Icon name="lock" size={14} />
          <span>Lunar details, tithi and the day's panchang are part of Parv. <Link href="/pricing">Unlock with Parv</Link></span>
        </div>
      )}
      <CitySwitch city={city} homeId={home.id} onChange={setCityId} />
    </section>
  );
}
