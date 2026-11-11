"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { festivals } from "@/lib/data";
import { HI, UI, MON, MON_HI, col, orderFestivals } from "@/lib/design";
import { marksForMonth, occurrence, LAST_YEAR } from "@/lib/occurrence";
import { monthPanchang, tithiShort, zonedYMD } from "@/lib/panchang";
import { OBSERVANCES } from "@/lib/observances";
import { cityById, DEFAULT_CITY } from "@/lib/cities";
import { hijriOf, hijriSpan, hijriLabel, HIJRI_NOTE } from "@/lib/hijri";
import { hijriKeyDaysForMonth, HIJRI_KEYDAY_NOTE, HIJRI_KEYDAY_LEGEND } from "@/lib/hijriMarkers";
import { layerLabel } from "@/lib/layers";
import Screen from "@/components/ui/Screen";
import { Hi } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";
import DayDetail from "@/components/DayDetail";
import DaySimple from "@/components/DaySimple";
import CitySwitch from "@/components/CitySwitch";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
// Panchang can be calculated for any date; the grid offers this window.
const FIRST = { y: 2026, m: 0 };
const LAST = { y: LAST_YEAR, m: 11 };
const key = (y, m) => y * 12 + m;
const dot = (id) => `oklch(0.6 0.15 ${OBSERVANCES[id].hue})`;

export default function CalendarClient({ homeCityId, layers = ["panchang"] }) {
  const showPanchang = layers.includes("panchang");
  const showHijri = layers.includes("hijri");
  const router = useRouter();
  const home = cityById(homeCityId) || DEFAULT_CITY;
  const [cityId, setCityId] = useState(home.id);
  const city = cityById(cityId) || home;

  // "Today" is the city's own date, worked out in the browser.
  const [today, setToday] = useState(null);
  const [view, setView] = useState(null); // { y, m }
  const [sel, setSel] = useState(null); // day of month, or null
  useEffect(() => {
    const t = zonedYMD(new Date(), city.tz);
    setToday(t);
    const inRange = key(t.y, t.m) >= key(FIRST.y, FIRST.m) && key(t.y, t.m) <= key(LAST.y, LAST.m);
    setView((v) => v || (inRange ? { y: t.y, m: t.m } : FIRST));
    setSel((s) => (s == null && inRange ? t.d : s));
  }, [city.tz]);

  // Month panchang (tithi + observances per day), cached per month and city.
  const cache = useRef(new Map());
  const [rows, setRows] = useState(null);
  useEffect(() => {
    if (!view || !showPanchang) { setRows(null); return; }
    const k = `${city.id}:${view.y}-${view.m}`;
    if (cache.current.has(k)) { setRows(cache.current.get(k)); return; }
    setRows(null);
    // Let the empty grid paint first; the calculation takes a moment on phones.
    const id = setTimeout(() => {
      const r = monthPanchang(view.y, view.m, city);
      cache.current.set(k, r);
      setRows(r);
    }, 0);
    return () => clearTimeout(id);
  }, [view, city, showPanchang]);

  const { active, next } = useMemo(() => orderFestivals(festivals), []);
  const activeIds = useMemo(() => active.map((f) => f.id), [active]);
  if (!view) return <Screen nav><div style={{ minHeight: "60vh" }} aria-busy="true" /></Screen>;

  const { y, m } = view;
  const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const marks = marksForMonth(activeIds, y, m);
  const keyDays = showHijri ? hijriKeyDaysForMonth(y, m) : {};
  // Festivals with a day in this month, with that occurrence's date label.
  const inMonth = new Set(Object.values(marks).flat());
  const monthFests = active.filter((f) => inMonth.has(f.id)).map((f) => {
    const o = occurrence(f.id, y)?.days.some((dd) => dd.m === m && dd.y === y) ? occurrence(f.id, y) : occurrence(f.id, y - 1);
    return { ...f, date: o ? o.label : f.date, year: o ? o.year : y };
  });
  const go = (delta) => {
    const k2 = key(y, m) + delta;
    setView({ y: Math.floor(k2 / 12), m: k2 % 12 });
    setSel(null);
  };
  const atStart = key(y, m) <= key(FIRST.y, FIRST.m);
  const atEnd = key(y, m) >= key(LAST.y, LAST.m);

  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= n; d++) cells.push(d);

  return (
    <Screen nav>
      <div style={{ padding: "max(env(safe-area-inset-top), 24px) 20px 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 34, fontWeight: 400 }}>Calendar</h2>
          <Hi size={16}>{UI.cal}</Hi>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 8px", padding: "8px 0", borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)" }}>
          <button className="btn btn-icon btn-secondary" onClick={() => go(-1)} disabled={atStart} aria-label="Previous month"><Icon name="chevronLeft" /></button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600 }}>{MON[m]} {y}</span>
            <Hi size={12}>{MON_HI[m]}</Hi>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={() => go(1)} disabled={atEnd} aria-label="Next month"><Icon name="chevronRight" /></button>
        </div>
        {showHijri && <div className="tnum" style={{ textAlign: "center", fontSize: 12, color: "var(--color-neutral-700)", margin: "0 0 8px" }}>{hijriSpan(y, m)} AH (approximate)</div>}
        <div style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "0 0 8px" }}>
          Showing: {layers.length ? layers.map(layerLabel).join(" · ") : "festival dates only"} · <Link href="/account">Change calendars</Link>
        </div>
        {showPanchang && <div style={{ margin: "0 0 10px" }}>
          <CitySwitch city={city} homeId={home.id} onChange={setCityId} />
        </div>}

        <div role="grid" aria-label={`${MON[m]} ${y}`} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
          {WEEKDAYS.map((w, i) => <div key={i} role="columnheader" style={{ fontSize: 11, letterSpacing: ".08em", color: "var(--color-neutral-600)", padding: "4px 0" }}>{w}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={"e" + i} />;
            const ids = marks[d];
            const mc = ids ? col(ids[0]) : null;
            const r = showPanchang && rows ? rows[d - 1] : null;
            const hj = showHijri ? hijriOf(y, m, d) : null;
            const kd = keyDays[d] || null;
            const isToday = today && today.y === y && today.m === m && today.d === d;
            const isSel = sel === d;
            const fNames = ids ? ids.map((x) => festivals.find((f) => f.id === x)?.name).filter(Boolean) : [];
            const label = [
              `${d} ${MON[m]}`,
              r && `${r.info.paksha} ${r.info.name}`,
              hj && `${hijriLabel(hj)}, approximate`,
              kd && `${kd.title}, approximate, depends on moon sighting`,
              ...(r ? r.observances.map((o) => OBSERVANCES[o].name) : []),
              ...fNames,
              isToday && "today",
            ].filter(Boolean).join(", ");
            return (
              <button
                key={d}
                type="button"
                className="tnum"
                onClick={() => setSel(d)}
                aria-label={label}
                aria-pressed={isSel}
                style={{
                  all: "unset", cursor: "pointer", position: "relative", height: showPanchang && showHijri ? 70 : 58, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 5, boxSizing: "border-box",
                  borderRadius: "var(--radius-md)",
                  background: isSel ? "color-mix(in srgb, var(--color-accent) 14%, transparent)" : "transparent",
                  outline: isSel ? "1.5px solid var(--color-accent)" : "none", outlineOffset: -1,
                }}
              >
                <span style={{ position: "relative", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: mc ? mc.deep : isToday ? "var(--color-accent-700)" : "var(--color-text)", fontWeight: isToday ? 700 : 400 }}>
                  {mc && <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${mc.base}`, background: mc.tint }} />}
                  <span style={{ position: "relative" }}>{d}</span>
                </span>
                {showPanchang && <span aria-hidden="true" style={{ fontSize: 9.5, lineHeight: "12px", height: 12, color: "var(--color-neutral-700)", letterSpacing: ".02em" }}>
                  {r ? (r.tithi === 15 ? "◯" : r.tithi === 30 ? "●" : tithiShort(r.tithi)) : ""}
                </span>}
                {hj && <span aria-hidden="true" style={{ fontSize: 9.5, lineHeight: "12px", height: 12, whiteSpace: "nowrap", color: "var(--color-neutral-700)", letterSpacing: ".02em", marginTop: showPanchang ? 1 : 0 }}>
                  {kd ? <b style={{ fontWeight: 700, color: "var(--color-accent-700)" }}>☾ {kd.short}</b> : hj.d === 1 ? hj.monthShort : hj.d}
                </span>}
                <span aria-hidden="true" style={{ display: "flex", gap: 2, height: 5, marginTop: 1 }}>
                  {r && r.observances.slice(0, 3).map((o) => <span key={o} style={{ width: 5, height: 5, borderRadius: "50%", background: dot(o) }} />)}
                  {isToday && !(r && r.observances.length) && <span style={{ width: 5, height: 5, borderRadius: "50%", border: "1px solid var(--color-accent)" }} />}
                </span>
              </button>
            );
          })}
        </div>

        {showHijri && (
          <div style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: "10px 0 6px", lineHeight: 1.5 }}>
            {showPanchang ? "The smaller number below that is" : "Under each date is"} the Hijri day of the month (the month's name on its first day). {HIJRI_NOTE}
          </div>
        )}
        {showPanchang && <div style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: "10px 0 6px", lineHeight: 1.5 }}>
          Under each date is the tithi at sunrise: <b style={{ fontWeight: 600 }}>S</b> = Shukla (waxing moon), <b style={{ fontWeight: 600 }}>K</b> = Krishna (waning moon). So <span className="tnum">K14</span> is the 14th day of the waning moon; ◯ is Purnima, ● is Amavasya. A dot marks the day an observance is kept, which can be the day before the tithi holds at sunrise (a Purnima fast often is).
        </div>}
        <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: "var(--color-neutral-700)", margin: "10px 0 18px" }}>
          {showPanchang && Object.keys(OBSERVANCES).map((o) => (
            <span key={o} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: dot(o) }} />{OBSERVANCES[o].name}</span>
          ))}
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 11, borderRadius: "50%", border: "1px solid var(--color-accent)" }} />Festival day</span>
          {showHijri && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><b aria-hidden="true" style={{ color: "var(--color-accent-700)" }}>☾</b>{HIJRI_KEYDAY_LEGEND}: Ramadan begins, Eid al-Fitr, Eid al-Adha, Islamic New Year. {HIJRI_KEYDAY_NOTE}</span>}
        </div>

        <div style={{ marginBottom: 22 }}>
          {sel ? (
            showPanchang
              ? <DayDetail y={y} m={m} d={sel} city={city} festivalIds={marks[sel] || []} hijri={showHijri ? hijriOf(y, m, sel) : null} keyDay={keyDays[sel] || null} />
              : <DaySimple y={y} m={m} d={sel} festivalIds={marks[sel] || []} hijri={showHijri ? hijriOf(y, m, sel) : null} keyDay={keyDays[sel] || null} />
          ) : (
            <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: 0 }}>{showPanchang ? "Tap any day to see its panchang." : "Tap any day to see what falls on it."}</p>
          )}
        </div>

        <h6 style={{ margin: "0 0 8px", color: "var(--color-neutral-700)" }}>Festivals in {MON[m]}</h6>
        {monthFests.length === 0 && (
          <>
            <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
              No festivals from the library fall this month.
            </p>
            {next && next.upcoming && (
              <button className="btn btn-ghost" onClick={() => router.push(`/festival/${next.id}`)} style={{ paddingLeft: 0 }}>
                Next up: {next.name}{next.days === 0 ? ", today" : `, in ${next.days} days`}
              </button>
            )}
          </>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {monthFests.map((f) => (
            <button key={f.id} className="card hover-accent" onClick={() => router.push(`/festival/${f.id}?year=${f.year}`)} style={{ textAlign: "left", fontFamily: "var(--font-body)", color: "var(--color-text)", cursor: "pointer", borderTop: `3px solid ${f.c.base}`, background: "transparent" }}>
              <div className="card-kicker" style={{ color: f.c.deep }}>{f.date}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span className="card-title" style={{ fontSize: 20 }}>{f.name}</span>
                <Hi size={13}>{HI[f.id]}</Hi>
              </div>
              <div style={{ fontSize: 13, color: "var(--color-neutral-800)" }}>{f.hook}</div>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
