import Link from "next/link";
import { HIJRI_KEYDAY_NOTE } from "@/lib/hijriMarkers";

// The tapped-day note for a Hijri key day. When the day's festival card is
// already shown (festivalIds), no second link is added.
export default function HijriKeyDay({ y, marker, festivalIds = [] }) {
  if (!marker) return null;
  const showLink = marker.festivalId && !festivalIds.includes(marker.festivalId);
  return (
    <div role="note" style={{ padding: "8px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-accent)", fontSize: 13.5 }}>
      <span aria-hidden="true" style={{ color: "var(--color-accent-700)", marginRight: 6 }}>☾</span>
      <b style={{ fontWeight: 600 }}>{marker.title}</b> <span style={{ color: "var(--color-neutral-700)" }}>({marker.sub})</span>
      <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 2 }}>{HIJRI_KEYDAY_NOTE}</div>
      {showLink && <Link href={`/festival/${marker.festivalId}?year=${y}`} style={{ display: "inline-block", marginTop: 4, fontSize: 13 }}>Read the {marker.title} story →</Link>}
    </div>
  );
}
