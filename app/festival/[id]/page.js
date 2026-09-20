"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { storyData } from "@/lib/data";
import RitualBlock from "@/components/RitualBlock";

export default function FestivalPage({ params }) {
  const data = storyData[params.id];
  const [mode, setMode] = useState("stories");
  const [regionIdx, setRegionIdx] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);

  const stars = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => ({
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 100}%`,
        delay: `${(Math.random() * 2).toFixed(2)}s`,
      })),
    [params.id]
  );

  if (!data) {
    return (
      <main className="min-h-[100dvh] bg-night text-cream flex items-center justify-center p-8 text-center">
        <div>
          <p className="mb-4">This festival isn't written up yet.</p>
          <Link href="/" className="text-marigold underline">Back to all festivals</Link>
        </div>
      </main>
    );
  }

  const region = data.regions[regionIdx];

  return (
    <main className="min-h-[100dvh] bg-night text-cream">
      <div className="relative h-[270px] overflow-hidden" style={{ background: data.sky }}>
        {stars.map((s, i) => (
          <div key={i} className="star-dot" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
        ))}
        <Link href="/" className="absolute top-3.5 left-3.5 z-10 w-[30px] h-[30px] rounded-full bg-white/15 flex items-center justify-center text-cream">
          ←
        </Link>
      </div>

      <div className="px-5 pt-4">
        <h2 className="font-display text-2xl text-cream mb-1">{data.title}</h2>
        <div className="text-[10.5px] text-muted mb-3">📅 {data.dateRange}</div>

        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => setMode("stories")}
            className={`flex-1 text-center py-2 rounded-xl text-xs font-bold border ${mode === "stories" ? "bg-marigold text-[#3A2405] border-marigold" : "text-muted border-white/15"}`}
          >
            Stories
          </button>
          <button
            onClick={() => setMode("rituals")}
            className={`flex-1 text-center py-2 rounded-xl text-xs font-bold border ${mode === "rituals" ? "bg-marigold text-[#3A2405] border-marigold" : "text-muted border-white/15"}`}
          >
            Rituals
          </button>
        </div>

        {mode === "stories" ? (
          <div>
            <div className="flex gap-1.5 overflow-x-auto pb-3">
              {data.regions.map((r, i) => (
                <button
                  key={r.name}
                  onClick={() => { setRegionIdx(i); setSourceOpen(false); }}
                  className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-2xl border ${i === regionIdx ? "bg-vermillion border-vermillion text-white" : "border-white/15 text-cream"}`}
                >
                  {r.name}
                </button>
              ))}
            </div>
            <div className="bg-night2 rounded-2xl p-4">
              {region.date && <div className="text-[10.5px] text-marigold font-semibold mb-1.5">📅 {region.date}</div>}
              <div className="text-[13px] leading-relaxed">{region.text}</div>
              <div className="flex justify-end mt-2.5">
                <button onClick={() => setSourceOpen((o) => !o)} className="text-[10.5px] text-muted bg-white/5 px-2 py-1 rounded-lg">
                  ⓘ source
                </button>
              </div>
              {sourceOpen && (
                <div className="mt-2 pt-2 border-t border-dashed border-white/15 text-[10.5px] text-muted">
                  As told in <b className="text-cream">{region.name}</b> — illustrative source: <b className="text-cream">{region.source}</b>. Real entries would link to a verified regional reference.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pb-8">
            {data.rituals && data.rituals.length ? (
              data.rituals.map((block, i) => <RitualBlock key={i} block={block} />)
            ) : (
              <div className="bg-night2 rounded-2xl p-4 text-[12px] text-cream">Rituals for this festival aren't written up yet.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
