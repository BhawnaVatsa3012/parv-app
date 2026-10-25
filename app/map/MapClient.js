"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { geoMercator, geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import { feature } from "topojson-client";
import { HI, UI, HUE } from "@/lib/design";
import { Hi, useLang } from "@/components/ui/Lang";

const FEST = { diwali: "Diwali", holi: "Holi", teej: "Teej", newyear: "New Year Cluster", sankranti: "Makar Sankranti", bhaidooj: "Bhai Dooj" };

// Where each regional story is set (from lib/data.js regions).
const PLACES = [
  ["Ayodhya, Uttar Pradesh", 26.8, 82.2, [["diwali", "Uttar Pradesh"]]],
  ["Kolkata, West Bengal", 22.57, 88.36, [["diwali", "Bengal"], ["bhaidooj", "West Bengal"], ["newyear", "West Bengal (Poila Boishakh)"]]],
  ["Chennai, Tamil Nadu", 13.08, 80.27, [["diwali", "Tamil Nadu"], ["newyear", "Tamil Nadu (Puthandu)"], ["sankranti", "Tamil Nadu (Pongal)"]]],
  ["Ahmedabad, Gujarat", 23.02, 72.57, [["diwali", "Gujarat"], ["sankranti", "Gujarat (Uttarayan)"]]],
  ["Mumbai, Maharashtra", 19.08, 72.88, [["diwali", "Maharashtra"], ["bhaidooj", "Maharashtra"], ["newyear", "Maharashtra (Gudi Padwa)"], ["newyear", "Sindhi community (Cheti Chand)"], ["sankranti", "Maharashtra & Karnataka"]]],
  ["Barsana, Braj", 27.65, 77.38, [["holi", "Braj (Mathura)"]]],
  ["Shantiniketan, West Bengal", 23.68, 87.68, [["holi", "West Bengal"]]],
  ["Anandpur Sahib, Punjab", 31.24, 76.5, [["holi", "Punjab"]]],
  ["Imphal, Manipur", 24.82, 93.94, [["holi", "Manipur"]]],
  ["Ratnagiri, Konkan", 16.99, 73.3, [["holi", "Konkan (Maharashtra)"]]],
  ["Jaipur, Rajasthan", 26.91, 75.79, [["teej", "Rajasthan (Jaipur)"]]],
  ["Patna, Bihar", 25.59, 85.14, [["teej", "Uttar Pradesh & Bihar"], ["bhaidooj", "Uttar Pradesh & Bihar"]]],
  ["Bengaluru, Karnataka", 12.97, 77.59, [["newyear", "Karnataka, AP & Telangana (Ugadi)"]]],
  ["Hyderabad, Telangana", 17.39, 78.49, [["sankranti", "Andhra Pradesh & Telangana"], ["bhaidooj", "South India"]]],
  ["Thiruvananthapuram, Kerala", 8.52, 76.94, [["newyear", "Kerala (Vishu)"]]],
  ["Guwahati, Assam", 26.14, 91.74, [["newyear", "Assam (Rongali Bihu)"], ["sankranti", "Assam (Magh Bihu)"]]],
  ["Amritsar, Punjab", 31.63, 74.87, [["newyear", "Punjab (Baisakhi)"], ["sankranti", "Punjab (Lohri)"]]],
  ["Sagar Island, West Bengal", 21.65, 88.08, [["sankranti", "West Bengal & Odisha"]]],
].map(([place, lat, lon, items]) => ({ place, lat, lon, items, soon: false }));

// "Around the world" — placeholders, not written yet.
const WORLD = [
  ["Beijing, China", 39.9, 116.4, "Lunar New Year"],
  ["Bangkok, Thailand", 13.75, 100.5, "Songkran"],
  ["Oaxaca, Mexico", 17.07, -96.72, "Día de los Muertos"],
  ["Jerusalem", 31.77, 35.21, "Hanukkah"],
  ["Rio de Janeiro, Brazil", -22.9, -43.2, "Carnival"],
].map(([place, lat, lon, name]) => ({ place, lat, lon, name, soon: true }));

const hueOf = (id) => (HUE[id] != null ? `oklch(0.62 0.16 ${HUE[id]})` : "var(--color-accent)");

export default function MapClient() {
  const router = useRouter();
  const { bi } = useLang();
  const wrap = useRef(null);
  const svgRef = useRef(null);
  const [world, setWorld] = useState(null);
  const [view, setView] = useState("india");
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [k, setK] = useState(1);
  const [t, setT] = useState(zoomIdentity);

  useEffect(() => {
    import("world-atlas/countries-110m.json").then((m) => {
      const topo = m.default || m;
      setWorld(feature(topo, topo.objects.countries));
    });
  }, []);

  useEffect(() => {
    const el = wrap.current;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const proj = useMemo(() => {
    if (!world || !size.w) return null;
    const india = world.features.find((f) => f.id === "356");
    return view === "india"
      ? geoMercator().fitExtent([[24, 120], [size.w - 24, size.h - 24]], india)
      : geoNaturalEarth1().fitExtent([[8, 130], [size.w - 8, size.h - 60]], { type: "Sphere" });
  }, [world, size, view]);

  const zoomer = useMemo(() => d3zoom().scaleExtent([1, 10]).on("zoom", (e) => { setT(e.transform); setK(e.transform.k); }), []);
  useEffect(() => {
    if (!svgRef.current) return;
    const s = select(svgRef.current);
    s.call(zoomer);
    s.call(zoomer.transform, zoomIdentity);
  }, [zoomer, proj]);

  const path = proj ? geoPath(proj) : null;
  let pins = PLACES.filter((p) => filter === "all" || p.items.some((i) => i[0] === filter));
  if (view === "world" && filter === "all") pins = pins.concat(WORLD);

  return (
    <div ref={wrap} style={{ position: "relative", height: "calc(100dvh - 80px)", overflow: "hidden" }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ display: "block", touchAction: "none" }} onClick={() => setSel(null)} role="img" aria-label="Map of festival regions">
        <g transform={t.toString()}>
          {path && world.features.map((f) => (
            <path
              key={f.id || f.properties?.name}
              d={path(f)}
              fill={f.id === "356" ? "var(--color-accent-100)" : "var(--color-neutral-200)"}
              stroke={f.id === "356" ? "var(--color-accent)" : "var(--color-neutral-400)"}
              strokeWidth={f.id === "356" ? 1 : 0.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {proj && pins.map((d) => {
            const [x, y] = proj([d.lon, d.lat]);
            const hue = d.soon ? "var(--color-neutral-600)" : hueOf(filter !== "all" ? filter : d.items[0][0]);
            const r = (d === sel ? 8 : view === "world" ? 4 : 6) / k;
            return (
              <circle
                key={d.place}
                cx={x} cy={y} r={r}
                fill={d === sel ? hue : "var(--color-bg)"}
                stroke={hue}
                strokeWidth={1.6 / k}
                strokeDasharray={d.soon ? `${2 / k} ${1.5 / k}` : undefined}
                style={{ cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); setSel(d); }}
              >
                <title>{d.place}</title>
              </circle>
            );
          })}
        </g>
      </svg>

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "max(env(safe-area-inset-top), 18px) 16px 10px", background: "linear-gradient(var(--color-bg) 70%, transparent)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 400 }}>Map</h2>
            <Hi size={12}>{UI.map}</Hi>
          </div>
          <div className="seg" role="group" aria-label="View">
            {[["india", "India"], ["world", "World"]].map(([v, l]) => (
              <label key={v} className="seg-opt" style={{ background: "var(--color-bg)" }}>
                <input type="radio" name="mapview" checked={view === v} onChange={() => { setView(v); setSel(null); }} />{l}
              </label>
            ))}
          </div>
        </div>
        <div className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {[["all", "All"], ...Object.entries(FEST)].map(([id, l]) => {
            const on = filter === id;
            return (
              <button
                key={id}
                aria-pressed={on}
                onClick={() => { setFilter(id); setSel(null); }}
                style={{ flex: "none", font: "12px var(--font-body)", padding: "5px 11px", borderRadius: 999, border: `1px solid ${on ? "var(--color-accent)" : "var(--color-divider)"}`, background: "var(--color-bg)", color: on ? "var(--color-accent-700)" : "var(--color-text)", boxShadow: on ? "inset 0 0 0 1px var(--color-accent)" : "none", cursor: "pointer" }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {!sel && (
        <div style={{ position: "absolute", right: 14, bottom: 14, fontSize: 11, color: "var(--color-neutral-700)", display: "flex", flexDirection: "column", gap: 4, background: "color-mix(in srgb, var(--color-bg) 85%, transparent)", padding: "6px 8px", borderRadius: "var(--radius-md)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid var(--color-accent)" }} />Regional story</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px dashed var(--color-neutral-600)" }} />Coming soon</span>
        </div>
      )}

      {sel && (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, maxHeight: "48%", overflow: "auto", animation: "fadeIn .2s" }}>
          {sel.soon ? (
            <>
              <div className="kicker" style={{ color: "var(--color-accent-700)", letterSpacing: ".1em" }}>Around the world</div>
              <h4 style={{ margin: 0 }}>{sel.name}</h4>
              <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{sel.place}</div>
              <span className="tag tag-neutral" style={{ alignSelf: "flex-start" }}>In production</span>
            </>
          ) : (
            <>
              <div className="kicker" style={{ color: "var(--color-accent-700)", letterSpacing: ".1em" }}>{sel.place}</div>
              {sel.items.filter((i) => filter === "all" || i[0] === filter).map(([id, region], i) => (
                <div key={id + region} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i ? "1px solid var(--color-divider)" : 0 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, lineHeight: 1.15 }}>
                      {FEST[id]} {bi && <Hi size={12}>{HI[id]}</Hi>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{region}</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => router.push(`/festival/${id}`)}>Read</button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
