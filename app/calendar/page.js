"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { festivals } from "@/lib/data";
import { HI, UI, DAYS, MON, MON_HI, YEAR, col, orderFestivals } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Hi } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarPage() {
  const router = useRouter();
  const today = new Date();
  const thisYear = today.getFullYear() === YEAR;
  const [m, setM] = useState(thisYear ? today.getMonth() : 0);
  const { active, next } = useMemo(() => orderFestivals(festivals, today), []); // eslint-disable-line

  const first = new Date(YEAR, m, 1).getDay();
  const n = new Date(YEAR, m + 1, 0).getDate();
  const marks = {};
  Object.entries(DAYS).forEach(([id, ds]) => ds.forEach(([mm, dd]) => { if (mm === m) (marks[dd] = marks[dd] || []).push(id); }));
  const monthFests = active.filter((f) => (DAYS[f.id] || []).some(([mm]) => mm === m));

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 12px", padding: "8px 0", borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)" }}>
          <button className="btn btn-icon btn-secondary" onClick={() => setM(m - 1)} disabled={m === 0} aria-label="Previous month"><Icon name="chevronLeft" /></button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600 }}>{MON[m]} {YEAR}</span>
            <Hi size={12}>{MON_HI[m]}</Hi>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={() => setM(m + 1)} disabled={m === 11} aria-label="Next month"><Icon name="chevronRight" /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
          {WEEKDAYS.map((w, i) => <div key={i} style={{ fontSize: 11, letterSpacing: ".08em", color: "var(--color-neutral-600)", padding: "4px 0" }}>{w}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={"e" + i} />;
            const ids = marks[d];
            const mc = ids ? col(ids[0]) : null;
            const isToday = thisYear && today.getMonth() === m && today.getDate() === d;
            const inner = (
              <>
                {mc && <span style={{ position: "absolute", width: 34, height: 34, borderRadius: "50%", border: `1.5px solid ${mc.base}`, background: mc.tint }} />}
                <span style={{ position: "relative" }}>{d}</span>
                {isToday && <span style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: "50%", background: "var(--color-accent)" }} />}
              </>
            );
            const cell = { position: "relative", height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: mc ? mc.deep : isToday ? "var(--color-accent-700)" : "var(--color-text)" };
            return ids ? (
              <button key={d} className="tnum" onClick={() => router.push(`/festival/${ids[0]}`)} aria-label={`${d} ${MON[m]}: ${ids.map((x) => festivals.find((f) => f.id === x)?.name).join(", ")}`} style={{ all: "unset", cursor: "pointer", ...cell }}>{inner}</button>
            ) : (
              <div key={d} className="tnum" style={cell} aria-current={isToday ? "date" : undefined}>{inner}</div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--color-neutral-700)", margin: "10px 0 22px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid var(--color-accent)" }} />Festival day</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-accent)" }} />Today</span>
        </div>

        <h6 style={{ margin: "0 0 8px", color: "var(--color-neutral-700)" }}>In {MON[m]}</h6>
        {monthFests.length === 0 && (
          <>
            <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>No festivals from the library fall this month.</p>
            {next && (
              <button className="btn btn-ghost" onClick={() => router.push(`/festival/${next.id}`)} style={{ paddingLeft: 0 }}>
                Next up: {next.name}{next.upcoming ? `, in ${next.days} days` : ""}
              </button>
            )}
          </>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {monthFests.map((f) => (
            <button key={f.id} className="card hover-accent" onClick={() => router.push(`/festival/${f.id}`)} style={{ textAlign: "left", fontFamily: "var(--font-body)", color: "var(--color-text)", cursor: "pointer", borderTop: `3px solid ${f.c.base}`, background: "transparent" }}>
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
