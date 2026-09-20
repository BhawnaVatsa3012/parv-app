"use client";
import { useState } from "react";
import Splash from "@/components/Splash";
import FestivalCard from "@/components/FestivalCard";
import { festivals } from "@/lib/data";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onDone={() => setShowSplash(false)} />;
  }

  return (
    <main className="min-h-[100dvh] bg-night text-cream">
      <div className="px-5 pt-11 pb-3">
        <div className="font-display text-2xl text-marigold leading-none">Parv</div>
        <div className="text-[11.5px] text-muted mt-1">the stories behind our festivals</div>
      </div>
      <div className="px-5 pb-2 text-xs text-muted font-semibold">All festivals</div>
      <div className="flex flex-col gap-2.5 px-5 pb-10">
        {festivals.map((f) => (
          <FestivalCard key={f.id} festival={f} />
        ))}
      </div>
    </main>
  );
}
