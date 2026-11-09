"use client";
import Link from "next/link";
import { festivals } from "@/lib/data";
import { col, HI } from "@/lib/design";
import { Hi } from "@/components/ui/Lang";
import { hijriLabel } from "@/lib/hijri";

const DAY_FMT = (y, m, d) => new Date(Date.UTC(y, m, d, 12)).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });

// A day with no panchang layer: the date, its Hijri date if that layer is on,
// and whichever festivals fall on it.
export default function DaySimple({ y, m, d, festivalIds = [], hijri = null }) {
  return (
    <section aria-label={DAY_FMT(y, m, d)} className="card" style={{ gap: 10, padding: 16, background: "color-mix(in srgb, var(--color-bg) 70%, transparent)", borderTop: "3px solid var(--color-accent)" }}>
      <div className="kicker" style={{ color: "var(--color-accent-700)" }}>{DAY_FMT(y, m, d)}</div>
      {hijri && <div className="tnum" style={{ fontSize: 13.5 }}>Hijri: {hijriLabel(hijri)} <span style={{ color: "var(--color-neutral-700)" }}>· approximate, depends on moon sighting</span></div>}
      {festivalIds.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: "var(--color-neutral-700)" }}>No festival from the library falls on this day.</p>}
      {festivalIds.map((fid) => {
        const f = festivals.find((x) => x.id === fid);
        if (!f) return null;
        const c = col(fid);
        return (
          <Link key={fid} href={`/festival/${fid}?year=${y}`} style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", padding: "8px 10px", borderRadius: "var(--radius-md)", background: c.tint, color: c.deep, textDecoration: "none" }}>
            <b style={{ fontWeight: 600 }}>{f.name}</b>
            <Hi size={12}>{HI[fid]}</Hi>
            <span style={{ marginLeft: "auto", fontSize: 13 }}>Read the story →</span>
          </Link>
        );
      })}
    </section>
  );
}
