"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { festivals, storyData } from "@/lib/data";
import { HI, UI, ROMAN, col, DARK_SKY } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Bunting, Plate } from "@/components/ui/Decor";
import { Hi } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";

const label = { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 3 };
const heading = { fontFamily: "var(--font-heading)" };

export default function FestivalPageClient({ params, entitled, price: detectedPrice = "₹99" }) {
  const router = useRouter();
  const id = params.id;
  const data = storyData[id];
  const meta = festivals.find((f) => f.id === id)?.meta || "";
  const [tab, setTab] = useState("stories");
  const [openR, setOpenR] = useState(0);
  const c = col(id);
  const [price, setPrice] = useState(detectedPrice);
  useEffect(() => {
    try {
      const r = localStorage.getItem("parv-region");
      if (r === "india") setPrice("₹99");
      if (r === "international") setPrice("$3.99");
    } catch (e) {}
  }, []);

  if (!data) {
    return (
      <Screen>
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <p>This festival isn't written up yet.</p>
          <Link href="/" className="btn btn-primary">Back to all festivals</Link>
        </div>
      </Screen>
    );
  }

  const regions = data.regions || [];
  const rituals = data.rituals || [];
  const locked = !entitled;
  const r0 = rituals[0] || { steps: [] };
  const tabStyle = (on) => ({
    all: "unset", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "10px 0", fontSize: 14,
    color: on ? c.deep : "var(--color-neutral-700)", boxShadow: on ? `inset 0 0 0 1px ${c.base}` : "none",
  });
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  return (
    <Screen>
      <div style={{ paddingBottom: 32 }}>
        <div style={{ padding: "max(env(safe-area-inset-top), 12px) 0 22px", color: "var(--color-bg)", background: data.sky || DARK_SKY }}>
          <Bunting light />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 12px" }}>
            <button className="btn btn-icon btn-ghost" onClick={back} aria-label="Back" style={{ color: "var(--color-bg)" }}>
              <Icon name="chevronLeft" size={22} />
            </button>
            <span className="kicker" style={{ color: c.line }}>{meta}</span>
            <span style={{ width: 36 }} />
          </div>
          <div style={{ padding: "0 20px" }}>
            <Plate id={id} height={200} hindi={HI[id]} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <h1 style={{ margin: 0, fontSize: 40, fontWeight: 400, lineHeight: 1.05, color: "var(--color-bg)" }}>{data.title}</h1>
              <Hi size={19} color={c.line}>{HI[id]}</Hi>
            </div>
            <div className="tnum" style={{ fontSize: 13, color: "var(--color-neutral-300)", marginTop: 4 }}>{data.dateRange}</div>
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          <div role="tablist" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", margin: "18px 0 6px", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <button role="tab" aria-selected={tab === "stories"} onClick={() => setTab("stories")} style={tabStyle(tab === "stories")}>
              Stories <Hi size={12} color="inherit">{UI.stories}</Hi>
            </button>
            <button role="tab" aria-selected={tab === "rituals"} onClick={() => setTab("rituals")} style={{ ...tabStyle(tab === "rituals"), borderLeft: "1px solid var(--color-divider)" }}>
              {locked && <Icon name="lock" size={13} width={1.8} />}
              Rituals <Hi size={12} color="inherit">{UI.rituals}</Hi>
            </button>
          </div>

          {tab === "stories" && (
            <>
              <div style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "10px 0 2px" }}>
                {regions.length} regional stories · tap to read
              </div>
              {regions.map((r, i) => {
                const open = openR === i;
                return (
                  <div key={r.name} style={{ borderBottom: "1px solid var(--color-divider)" }}>
                    <button
                      onClick={() => setOpenR(open ? -1 : i)}
                      aria-expanded={open}
                      style={{ all: "unset", boxSizing: "border-box", width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}
                    >
                      <span style={{ flex: "none", width: 30, ...heading, fontSize: 20, color: c.deep }}>{ROMAN[i]}</span>
                      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ ...heading, fontSize: 20, fontWeight: 600, lineHeight: 1.15 }}>{r.name}</span>
                        <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{r.date}</span>
                      </span>
                      <Icon name="chevronDown" size={18} style={{ transition: "transform .2s", transform: `rotate(${open ? 180 : 0}deg)` }} />
                    </button>
                    {open && (
                      <div style={{ padding: "0 0 18px 42px", animation: "fadeIn .25s" }}>
                        {r.feel && <p style={{ margin: "0 0 10px", ...heading, fontSize: 18, fontStyle: "italic", lineHeight: 1.3 }}>{r.feel}</p>}
                        <p style={{ margin: "0 0 10px", fontSize: 14.5, lineHeight: 1.65, textAlign: "justify", hyphens: "auto" }}>{r.text}</p>
                        {r.source && <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>Source — {r.source}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {tab === "rituals" && !locked && rituals.map((rt, k) => (
            <div key={k} style={{ padding: "20px 0 8px", borderBottom: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: 14 }}>
              <h3 style={{ margin: 0, fontSize: 25, lineHeight: 1.15 }}>{rt.heading}</h3>
              {rt.deity && <div><div style={label}>Who's worshipped</div><div style={{ fontSize: 14, lineHeight: 1.5 }}>{rt.deity}</div></div>}
              {rt.when && <div><div style={label}>When</div><div style={{ fontSize: 14, lineHeight: 1.5 }}>{rt.when}</div></div>}
              {rt.samagri?.length > 0 && (
                <div>
                  <div style={{ ...label, marginBottom: 6 }}>What you'll need</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {rt.samagri.map((s) => <span key={s} className="tag" style={{ fontSize: 12, lineHeight: 1.35, background: c.tint, color: c.deep }}>{s}</span>)}
                  </div>
                </div>
              )}
              {rt.steps?.length > 0 && (
                <div>
                  <div style={{ ...label, marginBottom: 6 }}>How it's done</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rt.steps.map((t, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 6, fontSize: 14, lineHeight: 1.5 }}>
                        <span className="tnum" style={{ ...heading, fontSize: 17, color: c.deep }}>{i + 1}</span><span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rt.mantra && (
                <div>
                  <div style={{ ...label, marginBottom: 6 }}>Mantra</div>
                  <div style={{ textAlign: "center", padding: "16px 8px", borderTop: `1px solid ${c.base}`, borderBottom: `1px solid ${c.base}`, background: c.tint, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="font-hi" lang="sa" style={{ fontSize: 20, lineHeight: 1.5 }}>{rt.mantra.sanskrit}</div>
                    <div style={{ fontSize: 14, fontStyle: "italic", color: c.deep }}>{rt.mantra.translit}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--color-neutral-700)" }}>{rt.mantra.meaning}</div>
                  </div>
                </div>
              )}
              {rt.attire && (
                <div>
                  <div style={label}>What to wear</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55 }}><b style={{ fontWeight: 600 }}>{rt.attire.clothing}.</b> Colours: {rt.attire.colors}. {rt.attire.why}</div>
                </div>
              )}
              {rt.significance && (
                <div>
                  <div style={label}>Why it matters</div>
                  <div style={{ ...heading, fontSize: 18, fontStyle: "italic", lineHeight: 1.35 }}>{rt.significance}</div>
                </div>
              )}
            </div>
          ))}

          {tab === "rituals" && locked && (
            <div style={{ padding: "20px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: 25, lineHeight: 1.15 }}>{r0.heading}</h3>
              {r0.when && <div><div style={label}>When</div><div style={{ fontSize: 14, lineHeight: 1.5 }}>{r0.when}</div></div>}
              <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 8, WebkitMaskImage: "linear-gradient(black 10%,transparent 95%)", maskImage: "linear-gradient(black 10%,transparent 95%)", filter: "blur(.6px)", userSelect: "none" }}>
                {(r0.steps || []).slice(0, 3).map((t, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 6, fontSize: 14, lineHeight: 1.5 }}>
                    <span style={{ ...heading, fontSize: 17, color: "var(--color-accent-700)" }}>{i + 1}</span><span>{t}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ borderColor: "var(--color-accent)", gap: 10, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-accent-700)" }}>
                  <Icon name="lock" size={16} /><span className="card-kicker" style={{ color: "inherit" }}>Parv membership</span>
                </div>
                <div className="card-title" style={{ fontSize: 21 }}>
                  {rituals.length === 1 ? "1 ritual" : `${rituals.length} rituals`} for {data.title}, with samagri, steps and mantras
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--color-neutral-800)", textAlign: "justify", hyphens: "auto" }}>
                  Stories stay free, always. Rituals — the samagri, steps and mantras for every festival — are part of Parv's subscription.
                </div>
                <Link href={`/pricing?from=${id}`} className="btn btn-primary btn-block" style={{ minHeight: 46, fontSize: 16 }}>
                  Unlock Rituals · {price}/month
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
