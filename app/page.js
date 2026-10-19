"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Splash from "@/components/Splash";
import FestivalCard from "@/components/FestivalCard";
import { festivals } from "@/lib/data";

export default function HomePage() {
  // null = deciding, true = show splash, false = show list.
  // Splash plays once per browser session so "All festivals" returns to the list.
  const [showSplash, setShowSplash] = useState(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    try {
      createClient().auth.getUser().then(({ data }) => setSignedIn(!!data?.user));
    } catch (e) {}
  }, []);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("parv-splash-seen") === "1"; } catch (e) {}
    setShowSplash(!seen);
  }, []);

  if (showSplash === null) {
    return <main className="min-h-[100dvh] bg-night" />;
  }

  if (showSplash) {
    return (
      <Splash
        onDone={() => {
          try { sessionStorage.setItem("parv-splash-seen", "1"); } catch (e) {}
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <main className="min-h-[100dvh] bg-night text-cream">
      <div className="px-5 pt-11 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-2xl text-marigold leading-none">Parv</div>
            <div className="text-[11.5px] text-muted mt-1">the stories behind our festivals</div>
          </div>
          <Link href={signedIn ? "/account" : "/login"} className="h-[30px] px-3.5 rounded-full border border-marigold text-[12px] font-semibold text-[#8A5F26] flex items-center">
            {signedIn ? "Account" : "Sign in"}
          </Link>
        </div>
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
