"use client";
import { LAYERS, FUTURE_LAYERS } from "@/lib/layers";

// "Which calendars do you want to see?" Checkboxes for each layer. Festival
// dates are always shown; the layers add day-by-day detail.
export default function CalendarChoice({ value, onChange, idPrefix = "cal" }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : LAYERS.map((l) => l.id).filter((x) => x === id || value.includes(x)));
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      <legend style={{ fontSize: 14, padding: 0, marginBottom: 6 }}>Which calendars do you want to see?</legend>
      {LAYERS.map((l) => (
        <label key={l.id} htmlFor={`${idPrefix}-${l.id}`} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", border: `1px solid ${value.includes(l.id) ? "var(--color-accent)" : "var(--color-divider)"}`, borderRadius: "var(--radius-md)", cursor: "pointer" }}>
          <input id={`${idPrefix}-${l.id}`} type="checkbox" checked={value.includes(l.id)} onChange={() => toggle(l.id)} style={{ marginTop: 3 }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>{l.label}</span>
            <span style={{ fontSize: 12, lineHeight: 1.45, color: "var(--color-neutral-700)" }}>{l.blurb}</span>
          </span>
        </label>
      ))}
      <p style={{ margin: "2px 0 0", fontSize: 11.5, lineHeight: 1.5, color: "var(--color-neutral-700)" }}>
        Every festival's date stays in the Calendar whichever you pick. Coming later: {FUTURE_LAYERS.join(", ")}.
      </p>
    </fieldset>
  );
}
