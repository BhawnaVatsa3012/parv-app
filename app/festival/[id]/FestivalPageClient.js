"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { festivals } from "@/lib/festivalList";
import { HI, UI, ROMAN, col, DARK_SKY } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Bunting, Plate } from "@/components/ui/Decor";
import { Hi } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";
import Timings from "@/components/Timings";
import Checklist from "@/components/Checklist";
import FamilyRitual from "@/components/FamilyRitual";
import UnlockCard from "@/components/UnlockCard";
import { occurrence, years as festYears } from "@/lib/occurrence";
import { systemOf, SYSTEM_LABEL } from "@/lib/layers";

const label = { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 3 };
const heading = { fontFamily: "var(--font-heading)" };

// `data` is already gated by the server (see gateStory in lib/access.js): story text,
// ritual steps and checklist items this reader may not see are simply not in it.
export default function FestivalPageClient({ params, year, entitled, data, intl = false, layersOpen = false, profile, checklist, family, prepItems = [], prepCount = 0 }) {
  const router = useRouter();
  const id = params.id;
  const occ = year ? occurrence(id, year) : null;
  const otherYears = festYears(id).filter((y) => y !== year);
  const meta = festivals.find((f) => f.id === id)?.meta || "";
  const c = col(id);
  const regions = data?.regions || [];
  const [tab, setTab] = useState("stories");
  const [openR, setOpenR] = useState(0); // first in list = the reader's region when there is one

  useEffect(() => {
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
  const locked = !data.ritualsOpen;
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
            <div className="tnum" style={{ fontSize: 13, color: "var(--color-neutral-300)", marginTop: 4 }}>
              {occ ? occ.label : ""}{occ?.hijri ? ` · ${occ.hijri}` : ""}{data.dateNote ? ` (${data.dateNote})` : ""}
            </div>
            {/* The date is shown in the festival's own calendar, whichever calendar layers the reader picked. */}
            <div data-testid="own-calendar" style={{ fontSize: 12, color: "var(--color-neutral-300)", marginTop: 2 }}>
              Date kept by the {SYSTEM_LABEL[systemOf(festivals.find((f) => f.id === id) || {})]}
            </div>
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
              {layersOpen
                ? <Timings festivalId={id} year={year} homeCityId={profile?.city_id} c={c} />
                : (
                  <div style={{ margin: "14px 0 4px" }}>
                    <UnlockCard compact intl={intl} from={id} title="Tithi, sunrise and sunset timings" body="The date above is free for everyone. The panchang details behind it, such as tithi, timings and key muhurat, are part of Parv." />
                  </div>
                )}
              {otherYears.length > 0 && (
                <div className="tnum" style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", fontSize: 12, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
                  <span>Other years:</span>
                  {otherYears.map((y) => (
                    <Link key={y} href={`/festival/${id}?year=${y}`} replace scroll={false}>{occurrence(id, y).label}</Link>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "14px 0 2px" }}>
                {regions.length} regional stories · tap to read{!data.storyOpen && " · first one is free to read"}
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
                    {open && r.locked && (
                      <div style={{ padding: "0 0 18px 42px", animation: "fadeIn .25s" }}>
                        <UnlockCard compact intl={intl} from={id} title={`Read all of ${data.title}`} body="This regional story is part of Parv. The first story on each festival is free to read." />
                      </div>
                    )}
                    {open && !r.locked && (
                      <div style={{ padding: "0 0 18px 42px", animation: "fadeIn .25s" }}>
                        {r.feel && <p style={{ margin: "0 0 10px", ...heading, fontSize: 18, fontStyle: "italic", lineHeight: 1.3 }}>{r.feel}</p>}
                        <p style={{ margin: "0 0 10px", fontSize: 14.5, lineHeight: 1.65, textAlign: "justify", hyphens: "auto" }}>{r.text}</p>
                        {r.source && <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>Source — {r.source}</div>}
                        {r.preview && (
                          <div style={{ marginTop: 14 }}>
                            <UnlockCard compact intl={intl} from={id} title={`Read the other ${regions.length - 1} stories`} body="You have read the free preview. The rest of this festival's stories are part of Parv." />
                          </div>
                        )}
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
              {data.ritualHeading && <h3 style={{ margin: 0, fontSize: 25, lineHeight: 1.15 }}>{data.ritualHeading}</h3>}
              {data.ritualWhen && <div><div style={label}>When</div><div style={{ fontSize: 14, lineHeight: 1.5 }}>{data.ritualWhen}</div></div>}
              <UnlockCard
                intl={intl}
                from={id}
                title={`${data.ritualCount === 1 ? "1 ritual" : `${data.ritualCount} rituals`} for ${data.title}, with samagri, steps and mantras`}
                body="Rituals, with the samagri, steps and mantras for every festival, adapted to your family's way, are part of Parv."
              />
            </div>
          )}

          {tab === "prepare" && (
            <Checklist festivalId={id} year={year} festivalName={data.title} entitled={entitled} initial={checklist} c={c} items={prepItems} count={prepCount} intl={intl} />
          )}
        </div>
      </div>
    </Screen>
  );
}
