"use client";
import Link from "next/link";
import { FestivalIcon } from "./Icons";
import { getFestivalColors } from "@/lib/festivalColors";

export default function FestivalCard({ festival }) {
  const colors = festival.active ? getFestivalColors(festival.id) : null;

  const inner = (
    <div
      className={`relative flex items-center gap-3 rounded-2xl p-3 border ${festival.active ? "cursor-pointer hover:brightness-95" : "bg-night2 border-black/5 opacity-60"}`}
      style={festival.active ? { background: colors.tint, borderColor: colors.line } : undefined}
    >
      {!festival.active && (
        <div className="absolute top-2 right-2.5 text-[8.5px] bg-black/10 text-cream px-2 py-0.5 rounded-lg font-semibold">soon</div>
      )}
      <div
        className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0"
        style={festival.active ? { background: colors.base } : { background: "#DCD8D7" }}
      >
        <FestivalIcon type={festival.icon} />
      </div>
      <div>
        <h4 className="font-display text-base text-cream mb-0.5">{festival.name}</h4>
        <p className="text-[11px] text-muted mb-1 leading-snug">{festival.hook}</p>
        <div className="text-[9.5px] text-muted mb-0.5">📅 {festival.date}</div>
        <div
          className="text-[9.5px] font-semibold"
          style={festival.active ? { color: colors.deep } : undefined}
        >
          {festival.meta}
        </div>
      </div>
    </div>
  );

  return festival.active ? <Link href={`/festival/${festival.id}`}>{inner}</Link> : inner;
}
