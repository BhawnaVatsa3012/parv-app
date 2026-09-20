"use client";

export default function RitualBlock({ block }) {
  return (
    <div className="bg-night2 rounded-2xl p-4 mb-2.5">
      {block.heading && <h4 className="font-display text-marigold text-[15px] mb-2">{block.heading}</h4>}
      {block.deity && (
        <Row label="Who's worshipped"><span className="text-cream">{block.deity}</span></Row>
      )}
      {block.when && (
        <Row label="When"><span className="text-cream">{block.when}</span></Row>
      )}
      {block.samagri && (
        <Row label="What you'll need">
          <div className="flex flex-wrap gap-1.5">
            {block.samagri.map((s, i) => (
              <span key={i} className="text-[10px] bg-white/10 text-cream px-2 py-1 rounded-md">{s}</span>
            ))}
          </div>
        </Row>
      )}
      {block.steps && (
        <Row label="How it's done">
          <ol className="list-decimal pl-4 text-[12px] leading-relaxed text-cream space-y-0.5">
            {block.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </Row>
      )}
      {block.mantra && (
        <Row label="Mantra">
          <div className="bg-black/25 border-l-[3px] border-marigold rounded-r-lg px-2.5 py-2">
            <div className="text-cream text-[13px] mb-0.5">{block.mantra.sanskrit}</div>
            <div className="text-muted text-[11.5px] italic mb-1">{block.mantra.translit}</div>
            <div className="text-muted text-[11px]">{block.mantra.meaning}</div>
          </div>
        </Row>
      )}
      {block.attire && (
        <Row label="What to wear">
          <span className="text-cream text-[12px] leading-relaxed">
            <b>{block.attire.clothing}.</b> Colours: {block.attire.colors}. {block.attire.why}
          </span>
        </Row>
      )}
      {block.significance && (
        <Row label="Why it matters"><span className="text-cream text-[12px] leading-relaxed">{block.significance}</span></Row>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="mb-2">
      <div className="text-[9.5px] text-muted font-bold uppercase tracking-wide mb-1">{label}</div>
      {children}
    </div>
  );
}
