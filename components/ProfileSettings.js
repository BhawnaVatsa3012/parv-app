"use client";
import Link from "next/link";
import { useState } from "react";
import { festivals } from "@/lib/data";
import { HI } from "@/lib/design";
import { cityById, cityLabel } from "@/lib/cities";
import CityPicker from "@/components/CityPicker";
import { Hi } from "@/components/ui/Lang";

const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 0", borderBottom: "1px solid var(--color-divider)" };
const sub = { fontSize: 11.5, color: "var(--color-neutral-700)" };

async function save(fields) {
  const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Could not save");
  return d.profile;
}

// Name, city, reminders, followed festivals and family details.
export default function ProfileSettings({ profile: initial, onName, member = false }) {
  const [p, setP] = useState(initial || {});
  const [open, setOpen] = useState(""); // "name" | "city" | "family" | ""
  const [name, setName] = useState(initial?.name || "");
  const [community, setCommunity] = useState(initial?.community || "");
  const [languages, setLanguages] = useState(initial?.languages || "");
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const active = festivals.filter((f) => f.active);
  const followed = p.followed?.length ? p.followed : active.map((f) => f.id);

  async function update(fields, done) {
    setMsg("");
    try { const np = await save(fields); setP(np || { ...p, ...fields }); done?.(); setMsg("Saved"); setTimeout(() => setMsg(""), 1500); }
    catch (e) { setMsg(e.message); }
  }
  const toggleFollow = (id) => {
    const next = followed.includes(id) ? followed.filter((x) => x !== id) : [...followed, id];
    update({ followed: next.length === active.length ? [] : next });
  };
  async function deleteFamily() {
    setMsg("");
    const r = await fetch("/api/family/notes?all=1", { method: "DELETE" });
    if (r.ok) { setP({ ...p, community: null, languages: null }); setCommunity(""); setLanguages(""); setConfirmDelete(false); setMsg("Family details and notes deleted"); }
    else setMsg("Could not delete. Please try again.");
  }

  return (
    <>
      <div style={row}>
        <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 14 }}>Name</span><span style={sub}>{p.name || "Not set"}</span></span>
        <button className="btn btn-ghost" onClick={() => setOpen(open === "name" ? "" : "name")}>{open === "name" ? "Close" : "Change"}</button>
      </div>
      {open === "name" && (
        <form onSubmit={(e) => { e.preventDefault(); update({ name }, () => { setOpen(""); onName?.(name); }); }} style={{ display: "flex", gap: 8, padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label="Your name" autoFocus />
          <button className="btn btn-primary" type="submit" style={{ flex: "none" }}>Save</button>
        </form>
      )}

      <div style={row}>
        <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 14 }}>My city</span><span style={sub}>{cityLabel(cityById(p.city_id)) || "Not set"} · used for all timings</span></span>
        <button className="btn btn-ghost" onClick={() => setOpen(open === "city" ? "" : "city")}>{open === "city" ? "Close" : "Change"}</button>
      </div>
      {open === "city" && (
        <div style={{ padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}>
          <CityPicker value={p.city_id} onChange={(id) => update({ city_id: id }, () => setOpen(""))} autoFocus />
        </div>
      )}

      <div style={row}>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14 }}>Festival reminders by email</span>
          <span style={sub}>{member ? "10, 3 and 1 day before, with what's left on your checklist" : "Part of the membership, with the preparation checklists"}</span>
        </span>
        {member ? (
          <div className="seg">
            <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name="pf-nudge" checked={!p.nudge_email} onChange={() => update({ nudge_email: false })} />Off</label>
            <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name="pf-nudge" checked={!!p.nudge_email} onChange={() => update({ nudge_email: true })} />On</label>
          </div>
        ) : (
          <Link href="/pricing" className="btn btn-ghost" style={{ fontSize: 13 }}>See membership</Link>
        )}
      </div>
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--color-divider)" }}>
        <div style={{ fontSize: 14 }}>Festivals I follow</div>
        <div style={{ ...sub, marginBottom: 8 }}>Reminders and home-screen nudges come only for these.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {active.map((f) => {
            const on = followed.includes(f.id);
            return (
              <button key={f.id} aria-pressed={on} onClick={() => toggleFollow(f.id)}
                style={{ font: "12.5px var(--font-body)", padding: "5px 11px", borderRadius: 999, cursor: "pointer", background: "transparent", border: `1px solid ${on ? "var(--color-accent)" : "var(--color-divider)"}`, color: on ? "var(--color-accent-700)" : "var(--color-neutral-700)", boxShadow: on ? "inset 0 0 0 1px var(--color-accent)" : "none" }}>
                {f.name.replace(/^The /, "").replace(/ Cluster$/, "")} <Hi size={11} color="inherit">{HI[f.id]}</Hi>
              </button>
            );
          })}
        </div>
      </div>

      <div style={row}>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14 }}>Our family's tradition</span>
          <span style={sub}>{[p.community, p.languages].filter(Boolean).join(" · ") || "Not set"}</span>
        </span>
        <button className="btn btn-ghost" onClick={() => setOpen(open === "family" ? "" : "family")}>{open === "family" ? "Close" : "Change"}</button>
      </div>
      {open === "family" && (
        <form onSubmit={(e) => { e.preventDefault(); update({ community, languages }, () => setOpen("")); }} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}>
          <div className="field"><label htmlFor="pf-community">Community or tradition</label><input id="pf-community" className="input" value={community} onChange={(e) => setCommunity(e.target.value)} maxLength={120} /></div>
          <div className="field"><label htmlFor="pf-languages">Languages spoken at home</label><input id="pf-languages" className="input" value={languages} onChange={(e) => setLanguages(e.target.value)} maxLength={120} /></div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>Save</button>
          <p style={{ ...sub, margin: 0 }}>Stored only in your account, used only to adapt rituals for you, never shared.</p>
          {!confirmDelete ? (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(true)} style={{ alignSelf: "flex-start", paddingLeft: 0 }}>Delete all family details and notes</button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
              <span>This deletes your family notes and adapted rituals for every festival.</span>
              <button type="button" className="btn btn-secondary" onClick={deleteFamily}>Delete</button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
            </div>
          )}
        </form>
      )}
      <div role="status" style={{ fontSize: 12, color: "var(--color-neutral-700)", minHeight: 18, paddingTop: 4 }}>{msg}</div>
    </>
  );
}
