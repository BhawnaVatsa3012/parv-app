"use client";
import { useState } from "react";

const label = { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 3 };
const heading = { fontFamily: "var(--font-heading)" };

// One ritual, for members: Parv's version or the family's approved one,
// family notes on any step, and "adapt to my family" (AI proposal the
// user must approve before anything is saved).
export default function FamilyRitual({ festivalId, ritualIndex, rt, c, notes: initialNotes = [], saved: initialSaved = null }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(initialSaved);
  const [view, setView] = useState(initialSaved ? "family" : "parv");
  const [noteFor, setNoteFor] = useState(undefined); // undefined = closed, null = whole ritual, n = step
  const [draft, setDraft] = useState("");
  const [proposal, setProposal] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const showFamily = view === "family" && saved;
  const steps = showFamily ? saved.steps : rt.steps || [];
  const samagri = showFamily ? saved.samagri : rt.samagri || [];
  const stepNotes = (i) => notes.filter((n) => n.step_index === i);
  const wholeNotes = notes.filter((n) => n.step_index == null);

  async function call(url, opts) {
    const r = await fetch(url, opts);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "Something went wrong");
    return d;
  }
  async function addNote(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setBusy("note"); setErr("");
    try {
      const d = await call("/api/family/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ festival_id: festivalId, ritual_index: ritualIndex, step_index: noteFor, note: draft }) });
      setNotes([...notes, d.note]); setDraft(""); setNoteFor(undefined);
    } catch (e2) { setErr(e2.message); } finally { setBusy(""); }
  }
  async function removeNote(id) {
    setErr("");
    try { await call(`/api/family/notes?id=${encodeURIComponent(id)}`, { method: "DELETE" }); setNotes(notes.filter((n) => n.id !== id)); }
    catch (e2) { setErr(e2.message); }
  }
  async function adapt() {
    setBusy("adapt"); setErr(""); setProposal(null);
    try {
      const d = await call("/api/family/adapt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ festival_id: festivalId, ritual_index: ritualIndex }) });
      setProposal(d);
    } catch (e2) { setErr(e2.message); } finally { setBusy(""); }
  }
  async function approve() {
    setBusy("approve"); setErr("");
    try {
      await call("/api/family/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ festival_id: festivalId, ritual_index: ritualIndex, steps: proposal.steps, samagri: proposal.samagri }) });
      setSaved({ steps: proposal.steps, samagri: proposal.samagri }); setProposal(null); setView("family");
    } catch (e2) { setErr(e2.message); } finally { setBusy(""); }
  }
  async function reset() {
    setErr("");
    try { await call(`/api/family/approve?festival_id=${festivalId}&ritual_index=${ritualIndex}`, { method: "DELETE" }); setSaved(null); setView("parv"); }
    catch (e2) { setErr(e2.message); }
  }

  const noteForm = (
    <form onSubmit={addNote} style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0 4px" }}>
      <textarea className="input" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} autoFocus placeholder="e.g. We do this before sunset and add coconut to the prasad" aria-label="Family note" style={{ minHeight: 64, fontSize: 14 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={busy === "note"}>{busy === "note" ? "Saving…" : "Save note"}</button>
        <button className="btn btn-ghost" type="button" onClick={() => { setNoteFor(undefined); setDraft(""); }}>Cancel</button>
      </div>
    </form>
  );
  const noteChip = (n) => (
    <div key={n.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, lineHeight: 1.45, padding: "6px 8px", background: c.tint, borderLeft: `2px solid ${c.base}`, margin: "4px 0" }}>
      <span style={{ flex: 1 }}><span style={{ fontStyle: "italic", color: c.deep }}>Our family: </span>{n.note}</span>
      <button className="btn btn-ghost" onClick={() => removeNote(n.id)} aria-label="Delete note" style={{ fontSize: 11.5, padding: "0 4px" }}>Delete</button>
    </div>
  );

  return (
    <div style={{ padding: "20px 0 8px", borderBottom: "1px solid var(--color-divider)", display: "flex", flexDirection: "column", gap: 14 }}>
      <h3 style={{ margin: 0, fontSize: 25, lineHeight: 1.15 }}>{rt.heading}</h3>

      {saved && (
        <div className="seg" role="group" aria-label="Which version" style={{ alignSelf: "flex-start" }}>
          <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name={`v-${ritualIndex}`} checked={view === "family"} onChange={() => setView("family")} />Our family's way</label>
          <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name={`v-${ritualIndex}`} checked={view === "parv"} onChange={() => setView("parv")} />Parv's original</label>
        </div>
      )}

      {rt.deity && <div><div style={label}>Who's worshipped</div><div style={{ fontSize: 14, lineHeight: 1.5 }}>{rt.deity}</div></div>}
      {rt.when && <div><div style={label}>When</div><div style={{ fontSize: 14, lineHeight: 1.5 }}>{rt.when}</div></div>}
      {samagri.length > 0 && (
        <div>
          <div style={{ ...label, marginBottom: 6 }}>What you'll need</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {samagri.map((s) => <span key={s} className="tag" style={{ fontSize: 12, lineHeight: 1.35, background: c.tint, color: c.deep }}>{s}</span>)}
          </div>
        </div>
      )}
      {steps.length > 0 && (
        <div>
          <div style={{ ...label, marginBottom: 6 }}>How it's done{showFamily ? " · your family's way" : ""}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {steps.map((t, i) => (
              <div key={i}>
                <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 6, fontSize: 14, lineHeight: 1.5 }}>
                  <span className="tnum" style={{ ...heading, fontSize: 17, color: c.deep }}>{i + 1}</span>
                  <span>
                    {t}
                    {!showFamily && noteFor !== i && (
                      <button className="btn btn-ghost" onClick={() => { setNoteFor(i); setDraft(""); }} style={{ fontSize: 11.5, padding: "0 4px", marginLeft: 4 }}>+ family note</button>
                    )}
                  </span>
                </div>
                {!showFamily && (
                  <div style={{ marginLeft: 32 }}>
                    {stepNotes(i).map(noteChip)}
                    {noteFor === i && noteForm}
                  </div>
                )}
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

      {/* Family traditions */}
      <div className="card" style={{ gap: 8, padding: 14, background: "transparent" }}>
        <div className="card-kicker" style={{ color: c.deep }}>Your family's way</div>
        {wholeNotes.map(noteChip)}
        {noteFor === null ? noteForm : (
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-neutral-800)" }}>
            {notes.length
              ? `${notes.length} family note${notes.length === 1 ? "" : "s"} on this ritual.`
              : "Does your family do this differently? Add a note to any step, or to the whole ritual."}
            {" "}<button className="btn btn-ghost" onClick={() => { setNoteFor(null); setDraft(""); }} style={{ fontSize: 13, padding: "0 4px" }}>+ note for the whole ritual</button>
          </div>
        )}
        {notes.length > 0 && !proposal && (
          <button className="btn btn-primary btn-block" onClick={adapt} disabled={busy === "adapt"} style={{ minHeight: 42 }}>
            {busy === "adapt" ? "Adapting…" : saved ? "Update our family's version" : "Adapt this ritual to our family"}
          </button>
        )}
        {saved && !proposal && <button className="btn btn-ghost" onClick={reset} style={{ alignSelf: "flex-start", fontSize: 12.5, paddingLeft: 0 }}>Go back to Parv's original</button>}
        {proposal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn .25s" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Suggested changes — nothing is saved until you approve</div>
            {proposal.changes?.length > 0 && <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>{proposal.changes.map((x, i) => <li key={i}>{x}</li>)}</ul>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5, lineHeight: 1.45 }}>
              <div><div style={label}>Parv's original</div><ol style={{ margin: 0, paddingLeft: 16, color: "var(--color-neutral-700)" }}>{(rt.steps || []).map((s, i) => <li key={i}>{s}</li>)}</ol></div>
              <div><div style={{ ...label, color: c.deep }}>Your family's way</div><ol style={{ margin: 0, paddingLeft: 16 }}>{proposal.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
            </div>
            <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--color-neutral-700)" }}>Written by AI from your notes. Check it reads right for your family before approving.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={approve} disabled={busy === "approve"}>{busy === "approve" ? "Saving…" : "Approve"}</button>
              <button className="btn btn-secondary" onClick={() => setProposal(null)}>Discard</button>
            </div>
          </div>
        )}
        {err && <div role="alert" style={{ fontSize: 12.5, color: "var(--color-accent-800)" }}>{err}</div>}
      </div>
    </div>
  );
}
