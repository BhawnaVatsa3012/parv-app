"use client";
import { useEffect, useRef } from "react";
import RangoliSpirit from "./RangoliSpirit";

const CONFETTI_COLORS = ["#F2A93B", "#D8483B", "#7B6BC9", "#4C8C6B", "#E85D9E"];

export default function Splash({ onDone }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDone, 3200);
    return () => clearTimeout(timerRef.current);
  }, [onDone]);

  const confetti = Array.from({ length: 16 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    duration: `${(2.2 + Math.random() * 1.6).toFixed(2)}s`,
    delay: `${(Math.random() * 2).toFixed(2)}s`,
  }));

  return (
    <div
      onClick={() => { clearTimeout(timerRef.current); onDone(); }}
      className="relative w-full h-[100dvh] flex flex-col items-center justify-center cursor-pointer overflow-hidden text-cream"
      style={{ background: "linear-gradient(160deg,#F2A93B 0%,#D8483B 55%,#5A1418 100%)" }}
    >
      {confetti.map((c, i) => (
        <div
          key={i}
          className="absolute -top-3 w-[6px] h-3 rounded-sm"
          style={{ left: c.left, background: c.background, animation: `confetti-fall ${c.duration} linear infinite`, animationDelay: c.delay }}
        />
      ))}
      <div className="absolute w-[220px] h-[220px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)" }} />
      <RangoliSpirit />
      <div
        className="font-display text-4xl mt-5"
        style={{ color: "#F7F1E6", textShadow: "0 2px 14px rgba(50,10,8,0.55)", animation: "word-in 0.7s ease forwards 0.35s", opacity: 0 }}
      >
        Parv
      </div>
      <div
        className="text-sm mt-1"
        style={{ color: "#F7F1E6", textShadow: "0 1px 8px rgba(50,10,8,0.5)", animation: "word-in 0.7s ease forwards 0.6s", opacity: 0 }}
      >
        the stories behind our festivals
      </div>
      <div className="absolute bottom-9 text-xs opacity-75" style={{ color: "#F7F1E6", textShadow: "0 1px 6px rgba(50,10,8,0.5)" }}>
        tap anywhere to continue
      </div>
    </div>
  );
}
