"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { festivals, storyData } from "@/lib/data";
import { HI, UI, ROMAN, col, DARK_SKY } from "@/lib/design";
import { orderRegions } from "@/lib/regions";
import Screen from "@/components/ui/Screen";
import { Bunting, Plate } from "@/components/ui/Decor";
import { Hi } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";
import Timings from "@/components/Timings";
import Checklist from "@/components/Checklist";
import FamilyRitual from "@/components/FamilyRitual";

const label = { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 3 };
const heading = { fontFamily: "var(--font-heading)" };

export default function FestivalPageClient({ params, entitled, price: detectedPrice = "₹99", profile, checklist, family }) {
  const router = useRouter();
  const id = params.id;
  const data = storyData[id];
  const meta = festivals.find((f) => f.id === id)?.meta || "";
  const c = col(id);
  const state = profile?.state || null;
  const regions = useMemo(() => orderRegions(id, data?.regions, state), [id, data, state]);
  const [tab, setTab] = useState("stories");
  const [openR, setOpenR] = useState(0); // first in list = the reader's region when there is one
  const [price, setPrice] = useState(detectedPrice);

  useEffect(() => {
    try {
      const r = localStorage.getItem("parv-region");
      if (r === "india") setPrice("₹99");
      if (r === "international") setPrice("$3.99");
    } catch (e) {}
    if (window.location.hash === "#prepare") setTab("prepare");
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

  const rituals = data.rituals || [];
  const locked = !entitled;
  const r0 = rituals[0] || { steps: [] };
  const tabStyle = (on, first) => ({
    all: "unset", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 5, padding: "10px 0", fontSize: 13.5,
    color: on ? c.deep : "var(--color-neutral-700)", boxShadow: on ? `inset 0 0 0 1px ${c.base}` : "none",
    borderLeft: first ? 0 : "1px solid var(--color-divider)",
  });
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));
  const pick = (t) => {
    setTab(t);
    try { history.replaceState(null, "", t === "prepare" ? "#prepare" : window.location.pathname); } catch (e) {}
  };

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
          <div role="tablist" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", margin: "18px 0 6px", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <button role="tab" aria-selected={tab === "stories"} onClick={() => pick("stories")} style={tabStyle(tab === "stories", true)}>
              Stories <Hi size={11.5} color="inherit">{UI.stories}</Hi>
            </button>
            <button role="tab" aria-selected={tab === "rituals"} onClick={() => pick("rituals")} style={tabStyle(tab === "rituals")}>
              {locked && <Icon name="lock" size={12} width={1.8} />}
              Rituals <Hi size={11.5} color="inherit">{UI.rituals}</Hi>
            </button>
            <button role="tab" aria-selected={tab === "prepare"} onClick={() => pick("prepare")} style={tabStyle(tab === "prepare")}>
              {locked && <Icon name="lock" size={12} width={1.8} />}
              Prepare <Hi size={11.5} color="inherit">तैयारी</Hi>
            </button>
          </div>

          {tab === "stories" && (
            <>
              <Timings festivalId={id} homeCityId={profile?.city_id} c={c} />
              <div style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "14px 0 2px" }}>
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
                        <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ ...heading, fontSize: 20, fontWeight: 600, lineHeight: 1.15 }}>{r.name}</span>
                          {r.mine && <span className="tag" style={{ fontSize: 10.5, background: c.tint, color: c.deep }}>Your region</span>}
                        </span>
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
            <FamilyRitual
              key={k}
              festivalId={id}
              ritualIndex={k}
              rt={rt}
              c={c}
              notes={(family?.notes || []).filter((n) => n.ritual_index === k)}
              saved={family?.rituals?.[k] || null}
            />
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
                  Stories stay free, always. Rituals — the samagri, steps and mantras for every festival, adapted to your family's way — are part of Parv's subscription.
                </div>
                <Link href={`/pricing?from=${id}`} className="btn btn-primary btn-block" style={{ minHeight: 46, fontSize: 16 }}>
                  Unlock Rituals · {price}/month
                </Link>
              </div>
            </div>
          )}

          {tab === "prepare" && (
            <Checklist festivalId={id} festivalName={data.title} entitled={entitled} initial={checklist} c={c} price={price} />
          )}
        </div>
      </div>
    </Screen>
  );
}
