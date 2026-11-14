"use client";
import { useRef, useState } from "react";
import { doBy } from "@/lib/checklistDates";
import UnlockCard from "@/components/UnlockCard";
import Icon from "@/components/ui/Icon";

const fmt = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

// A festival's preparation checklist, grouped by "do by" date, saved to the
// user's account. Part of the membership. The server sends `items` only to
// members (non-members get an empty list and just the `count`), and the save
// API refuses non-members too.
export default function Checklist({ festivalId, year, festivalName, entitled, initial, c, items = [], count = 0, intl = false }) {
  if (!entitled) return <LockedChecklist festivalId={festivalId} festivalName={festivalName} count={count} intl={intl} />;
  return <OpenChecklist festivalId={festivalId} year={year} festivalName={festivalName} initial={initial} c={c} items={items} />;
}

function LockedChecklist({ festivalId, festivalName, count, intl }) {
  return (
    <div id="prepare" style={{ padding: "16px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: 25 }}>Get ready for {festivalName}</h3>
      <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
        {count} things to do, each with a &ldquo;do by&rdquo; date counting down to the day.
      </div>
      <UnlockCard
        intl={intl}
        from={festivalId}
        title={`Your ${festivalName} checklist, with reminders`}
        body="Tick things off as you go, add your own, and get an email 10, 3 and 1 day before, with what's still left. Preparation tools are part of Parv."
      />
    </div>
  );
}

function OpenChecklist({ festivalId, year, festivalName, initial, c, items }) {
  const [done, setDone] = useState(new Set(initial?.done || []));
  const [custom, setCustom] = useState(initial?.custom || []);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const timer = useRef(null);

  function persist(nextDone, nextCustom) {
    clearTimeout(timer.current);
    setStatus("Saving…");
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch("/api/checklist", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ festival_id: festivalId, year, done: [...nextDone], custom: nextCustom }),
        });
        setStatus(r.ok ? "Saved" : "Couldn't save — check your connection");
      } catch { setStatus("Couldn't save — check your connection"); }
    }, 500);
  }
  const toggle = (key) => {
    const n = new Set(done); n.has(key) ? n.delete(key) : n.add(key);
    setDone(n); persist(n, custom);
  };
  const add = (e) => {
    e.preventDefault();
    const text = draft.trim().slice(0, 160);
    if (!text) return;
    const n = [...custom, { key: "c" + Date.now().toString(36), text }];
    setCustom(n); setDraft(""); persist(done, n);
  };
  const remove = (key) => {
    const n = custom.filter((x) => x.key !== key);
    const d = new Set(done); d.delete(key);
    setCustom(n); setDone(d); persist(d, n);
  };

  const groups = [];
  items.forEach((i) => {
    const label = `By ${fmt(doBy(festivalId, i.before, year))}`;
    let g = groups.find((x) => x.label === label);
    if (!g) groups.push((g = { label, items: [] }));
    g.items.push(i);
  });
  if (custom.length) groups.push({ label: "Your own", items: custom.map((x) => ({ ...x, own: true })) });

  const total = items.length + custom.length;
  const doneN = [...done].filter((k) => items.some((i) => i.key === k) || custom.some((x) => x.key === k)).length;

  const row = (i) => {
    const on = done.has(i.key);
    return (
      <div key={i.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderTop: "1px solid var(--color-divider)" }}>
        <label style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 14, lineHeight: 1.45 }}>
          <input type="checkbox" checked={on} onChange={() => toggle(i.key)} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
          <span aria-hidden="true" style={{ flex: "none", width: 18, height: 18, marginTop: 2, borderRadius: 3, border: `1.5px solid ${on ? c.base : "var(--color-neutral-400)"}`, background: on ? c.base : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-bg)" }}>
            {on && <Icon name="check" size={13} width={2.4} />}
          </span>
          <span style={{ textDecoration: on ? "line-through" : "none", color: on ? "var(--color-neutral-600)" : "var(--color-text)" }}>{i.text}</span>
        </label>
        {i.own && <button className="btn btn-ghost" onClick={() => remove(i.key)} aria-label={`Remove ${i.text}`} style={{ fontSize: 12, padding: "0 4px" }}>Remove</button>}
      </div>
    );
  };

  return (
    <div id="prepare" style={{ padding: "16px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: 25 }}>Get ready for {festivalName}</h3>
        <span className="tnum" style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: c.deep }}>{doneN}/{total}</span>
      </div>
      <div aria-hidden="true" style={{ height: 3, background: "var(--color-neutral-200)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${total ? (doneN / total) * 100 : 0}%`, height: "100%", background: c.base, transition: "width .3s" }} />
      </div>
      {groups.map((g) => (
        <div key={g.label}>
          <div className="kicker" style={{ color: "var(--color-neutral-700)", letterSpacing: ".1em", margin: "8px 0 2px" }}>{g.label}</div>
          {g.items.map((i) => row(i))}
        </div>
      ))}
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add your own item" maxLength={160} aria-label="Add your own item" style={{ minHeight: 40 }} />
        <button className="btn btn-secondary" type="submit" style={{ flex: "none" }}>Add</button>
      </form>
      <div role="status" style={{ fontSize: 11.5, color: "var(--color-neutral-600)", minHeight: 16 }}>{status}</div>
    </div>
  );
}
