"use client";

export function FestivalIcon({ type }) {
  if (type === "diya") {
    return (
      <div className="flex items-end gap-[3px]">
        {[0, 0.15, 0.3].map((d, i) => (
          <div key={i}>
            <div className="diya-flame" style={{ animationDelay: `${d}s` }} />
            <div className="w-3 h-[5px] bg-[#8A5A2B] rounded-b-md -mt-[2px]" />
          </div>
        ))}
      </div>
    );
  }
  if (type === "holi") {
    const colors = ["#D8483B", "#F2A93B", "#4C8C6B", "#7B6BC9"];
    return (
      <div className="flex gap-1">
        {colors.map((c, i) => (
          <div key={i} className="color-dot w-[11px] h-[11px]" style={{ background: c, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    );
  }
  if (type === "tilak") {
    return (
      <div className="relative w-6 h-6 rounded-full" style={{ background: "#E4B389" }}>
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[5px] h-3 rounded" style={{ background: "#D8483B" }} />
      </div>
    );
  }
  if (type === "bangle") {
    return (
      <div className="flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-4 h-4 rounded-full border-[3px] color-dot" style={{ borderColor: "#4C8C6B", background: "transparent", animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    );
  }
  if (type === "sun") {
    return (
      <div className="relative w-6 h-6">
        <div className="absolute inset-[5px] rounded-full color-dot" style={{ background: "#F2A93B" }} />
        {[0, 45, 90, 135].map((a) => (
          <div key={a} className="absolute top-1/2 left-1/2 w-5 h-[2px] opacity-60" style={{ background: "#F2A93B", transform: `translate(-50%, -50%) rotate(${a}deg)` }} />
        ))}
      </div>
    );
  }
  // steam (default / in-production placeholder)
  return (
    <div className="flex items-end gap-[3px]">
      {[0, 0.4, 0.8].map((d, i) => (
        <div key={i} className="steam-bar" style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}
