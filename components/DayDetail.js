"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { festivals } from "@/lib/data";
import { col, HI } from "@/lib/design";
import { dayPanchang, rangePanchang, paranaWindow, fmtTime, zonedYMD, tithiName } from "@/lib/panchang";
import { OBSERVANCES } from "@/lib/observances";
import { Hi } from "@/components/ui/Lang";

const DAY_FMT = (y, m, d) => new Date(Date.UTC(y, m, d, 12)).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });

// "10:31 am", "10:31 am tomorrow" or "2:02 am, Sun 15 Nov" — whichever is
// clear for a time seen from the selected day.
function when(date, tz, day) {
  if (!date) return "—";
  const t = fmtTime(date, tz);
  const z = zonedYMD(date, tz);
  const diff = Math.round((Date.UTC(z.y, z.m, z.d) - Date.UTC(day.y, day.m, day.d)) / 864e5);
  if (diff === 0) return t;
  if (diff === 1) return `${t} tomorrow`;
  if (diff === -1) return `${t} yesterday`;
  return `${t}, ${new Date(Date.UTC(z.y, z.m, z.d, 12)).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })}`;
}

// Full panchang for one day in one city: tithi with its end time, sunrise,
// sunset, moonrise, and each observance with its key time.
export default function DayDetail({ y, m, d, city, festivalIds = [] }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    setInfo(null);
    const id = setTimeout(() => {
      const p = dayPanchang(y, m, d, city);
      const parana = p.observances.includes("ekadashi") ? paranaWindow(p, city) : null;
      // The morning after an Ekadashi fast is when it is broken.
      const prev = rangePanchang(y, m, d - 1, 1, city)[0];
      const breakToday = prev.observances.includes("ekadashi") ? paranaWindow({ date: prev.date }, city) : null;
      setInfo({ p, parana, breakToday, hadFast: prev.observances.includes("ekadashi") });
    }, 0);
    return () => clearTimeout(id);
  }, [y, m, d, city]);

  if (!info) return <div className="card" style={{ minHeight: 150, background: "transparent" }} aria-busy="true" />;

  const { p, parana, breakToday, hadFast } = info;
  const tz = city.tz;
  const day = p.date;
  const t = p.tithiInfo;
  const skipped = p.skippedTithi ? tithiName(p.skippedTithi) : null;
  const obsIds = p.observances;
  const hue = obsIds.length ? OBSERVANCES[obsIds[0]].hue : 65;
  const nearEdge = p.skippedTithi || (p.tithiEndsAt && p.tithiEndsAt - p.sunrise < 90 * 60000);

  const keyTime = (o) => {
    if (o === "ekadashi") {
      return parana
        ? `Fast today. Break it tomorrow between ${fmtTime(parana.start, tz)} and ${fmtTime(parana.end, tz)} (parana).`
        : "Fast today. The parana (fast-breaking) time is unusual this time — check a local panchang.";
    }
    if (o === "pradosh") return `Pradosh Kaal: ${fmtTime(p.pradosh.start, tz)} – ${fmtTime(p.pradosh.end, tz)}`;
    if (o === "sankashti") return p.moonrise ? `Moonrise ${fmtTime(p.moonrise, tz)}. The fast is broken after seeing the moon.` : "The fast is broken after seeing the moon tonight.";
    // Purnima, Amavasya: when the tithi runs.
    return `${OBSERVANCES[o].name} tithi until ${when(p.tithiEndsAt, tz, day)}.`;
  };

  return (
    <section aria-label={`Panchang for ${DAY_FMT(day.y, day.m, day.d)}`} className="card" style={{ gap: 10, padding: 16, background: "color-mix(in srgb, var(--color-bg) 70%, transparent)", borderTop: `3px solid oklch(0.66 0.16 ${hue})` }}>
      <div className="kicker" style={{ color: `oklch(0.45 0.13 ${hue})` }}>{DAY_FMT(day.y, day.m, day.d)} · {city.name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 24, lineHeight: 1.1 }}>{t.paksha} {t.name}</span>
        <Hi size={14}>{t.pakshaHi} {t.hi}</Hi>
      </div>
      <div className="tnum" style={{ fontSize: 13, color: "var(--color-neutral-800)", marginTop: -4 }}>
        Until {when(p.tithiEndsAt, tz, day)}
        {skipped && <>, then {skipped.name}, which ends before the next sunrise</>}
      </div>

      {obsIds.map((o) => (
        <div key={o} style={{ padding: "8px 10px", background: `oklch(0.95 0.035 ${OBSERVANCES[o].hue})`, color: `oklch(0.38 0.12 ${OBSERVANCES[o].hue})`, borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            <b style={{ fontWeight: 600, fontSize: 15 }}>{OBSERVANCES[o].name}</b>
            <Hi size={12}>{OBSERVANCES[o].hi}</Hi>
          </div>
          <div className="tnum" style={{ fontSize: 13.5 }}>{keyTime(o)}</div>
          <details style={{ fontSize: 12.5, color: "var(--color-neutral-800)" }}>
            <summary style={{ cursor: "pointer", color: `oklch(0.38 0.12 ${OBSERVANCES[o].hue})` }}>What is {OBSERVANCES[o].name}?</summary>
            <p style={{ margin: "6px 0 4px", lineHeight: 1.5 }}>{OBSERVANCES[o].story}</p>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{OBSERVANCES[o].practice}</p>
          </details>
        </div>
      ))}

      {hadFast && (
        <div className="tnum" style={{ fontSize: 13, padding: "8px 10px", border: `1px dashed oklch(0.7 0.1 ${OBSERVANCES.ekadashi.hue})`, borderRadius: "var(--radius-md)" }}>
          {breakToday
            ? <>Yesterday was Ekadashi: break the fast today between <b style={{ fontWeight: 600 }}>{fmtTime(breakToday.start, tz)}</b> and <b style={{ fontWeight: 600 }}>{fmtTime(breakToday.end, tz)}</b>.</>
            : "Yesterday was Ekadashi. Today's parana time is unusual — check a local panchang."}
        </div>
      )}

      {festivalIds.map((fid) => {
        const f = festivals.find((x) => x.id === fid);
        if (!f) return null;
        const c = col(fid);
        return (
          <Link key={fid} href={`/festival/${fid}`} style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", padding: "8px 10px", borderRadius: "var(--radius-md)", background: c.tint, color: c.deep, textDecoration: "none" }}>
            <b style={{ fontWeight: 600 }}>{f.name}</b>
            <Hi size={12}>{HI[fid]}</Hi>
            <span style={{ marginLeft: "auto", fontSize: 13 }}>Read the story →</span>
          </Link>
        );
      })}

      <div className="tnum" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: 12.5, color: "var(--color-neutral-700)", borderTop: "1px solid var(--color-divider)", paddingTop: 8 }}>
        <span><span style={{ display: "block", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase" }}>Sunrise</span>{fmtTime(p.sunrise, tz)}</span>
        <span><span style={{ display: "block", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase" }}>Sunset</span>{fmtTime(p.sunset, tz)}</span>
        <span><span style={{ display: "block", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase" }}>Moonrise</span>{p.moonrise && zonedYMD(p.moonrise, tz).d === day.d ? fmtTime(p.moonrise, tz) : "None today"}</span>
      </div>

      {nearEdge && (
        <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
          The tithi changes close to sunrise today, so some panchangs list this day differently.
        </div>
      )}
      {city.country !== "India" && (
        <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>
          Calculated for {city.name} in local time. Festival dates in the app are India's.
        </div>
      )}
    </section>
  );
}
