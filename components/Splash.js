"use client";
import { useEffect } from "react";
import { SPLASH_BG } from "@/lib/design";
import { Bunting, Rangoli } from "@/components/ui/Decor";

// Opening screen: festival bunting, the ghosted पर्व, the turning Rangoli.
// Moves on by itself after 2.8 s, or on tap.
export default function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      role="button"
      aria-label="Continue"
      style={{
        position: "fixed", inset: 0, zIndex: 50, cursor: "pointer", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 18, color: "var(--color-bg)", background: SPLASH_BG, overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "max(env(safe-area-inset-top), 12px)", left: 0, right: 0 }}>
        <Bunting light />
      </div>
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--color-bg) 30%, transparent), transparent 70%)" }} />
      <div className="font-hi" lang="hi" aria-hidden="true" style={{ position: "absolute", top: "14vh", fontSize: "min(260px, 62vw)", lineHeight: 1, color: "transparent", WebkitTextStroke: "1px color-mix(in srgb, var(--color-bg) 35%, transparent)" }}>
        पर्व
      </div>
      <div style={{ position: "relative" }}><Rangoli /></div>
      <div style={{ position: "relative", fontFamily: "var(--font-heading)", fontSize: 56, fontWeight: 400, letterSpacing: "-.01em", lineHeight: 1 }}>Parv</div>
      <div style={{ position: "relative", fontSize: 14, fontStyle: "italic" }}>the stories behind our festivals</div>
      <div style={{ position: "absolute", bottom: 44, fontSize: 12, opacity: 0.85 }}>tap anywhere to continue</div>
    </div>
  );
}
