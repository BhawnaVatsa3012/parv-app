"use client";
import Link from "next/link";
import { FestivalIcon } from "./Icons";

export default function FestivalCard({ festival }) {
  const inner = (
    <div className={`relative flex items-center gap-3 rounded-2xl p-3 bg-night2 border border-white/5 ${festival.active ? "cursor-pointer hover:brightness-110" : "opacity-50"}`}>
      {!festival.active && (
        <div className="absolute top-2 right-2.5 text-[8.5px] bg-white/10 text-cream px-2 py-0.5 rounded-lg font-semibold">soon</div>
      )}
      <div className="w-[52px] h-[52px] rounded-xl bg-night3 flex items-center justify-center shrink-0">
        <FestivalIcon type={festival.icon} />
      </div>
      <div>
        <h4 className="font-display text-base text-cream mb-0.5">{festival.name}</h4>
        <p className="text-[11px] text-muted mb-1 leading-snug">{festival.hook}</p>
        <div className="text-[9.5px] text-muted mb-0.5">📅 {festival.date}</div>
        <div className="text-[9.5px] text-marigold font-semibold">{festival.meta}</div>
      </div>
    </div>
  );

  return festival.active ? <Link href={`/festival/${festival.id}`}>{inner}</Link> : inner;
}
