"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { nameFromEmail } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Bunting } from "@/components/ui/Decor";
import { Hi } from "@/components/ui/Lang";
import CityPicker from "@/components/CityPicker";

// One-time setup after first sign-in: name and city (step I),
// then optional family details (step II).
export default function SetupClient({ email, profile }) {
  const router = useRouter();
  const [step, setStep] = useState(profile?.city_id ? 1 : 0);
  const [name, setName] = useState(profile?.name || nameFromEmail(email));
  const [city, setCity] = useState(profile?.city_id || "");
  const [community, setCommunity] = useState(profile?.community || "");
  const [languages, setLanguages] = useState(profile?.languages || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(fields, next) {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save");
      next();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  const steps = [
    {
      num: "I", title: "Where do you celebrate?", hi: "आप कहाँ मनाते हैं?",
      body: "Parv works out sunrise, tithi and festival timings for your city, and shows your region's story first. You can check other cities any time.",
      form: (
        <>
          <div className="field">
            <label htmlFor="name">What should we call you?</label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" style={{ minHeight: 44, fontSize: 15 }} />
          </div>
          <CityPicker value={city} onChange={setCity} />
        </>
      ),
      cta: "Continue",
      go: () => (!city ? setErr("Pick your city to continue") : save({ name, city_id: city }, () => setStep(1))),
    },
    {
      num: "II", title: "Your family's way", hi: "आपके परिवार की परंपरा",
      body: "Optional. Every family celebrates a little differently. Tell us your tradition and Parv can adapt rituals to match — you approve every change. You can delete this any time from Profile.",
      form: (
        <>
          <div className="field">
            <label htmlFor="community">Community or tradition</label>
            <input id="community" className="input" value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="e.g. Maithil Brahmin, Gujarati Vaishnav, Tamil Iyer" style={{ minHeight: 44, fontSize: 15 }} />
          </div>
          <div className="field">
            <label htmlFor="languages">Languages spoken at home</label>
            <input id="languages" className="input" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. Hindi, Bhojpuri" style={{ minHeight: 44, fontSize: 15 }} />
          </div>
        </>
      ),
      cta: "Finish",
      go: () => save({ community, languages }, () => router.replace("/")),
      skip: () => router.replace("/"),
    },
  ];
  const s = steps[step];

  return (
    <Screen>
      <div style={{ paddingTop: "env(safe-area-inset-top)" }}><Bunting /></div>
      <div style={{ minHeight: "calc(100dvh - 14px)", display: "flex", flexDirection: "column", padding: "18px 24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }} aria-label={`Step ${step + 1} of 2`}>
            {[0, 1].map((i) => <span key={i} style={{ width: 26, height: 2, background: i <= step ? "var(--color-accent)" : "var(--color-neutral-300)" }} />)}
          </div>
          {s.skip && <button className="btn btn-ghost" onClick={s.skip}>Skip</button>}
        </div>
        <div key={step} style={{ display: "flex", flexDirection: "column", gap: 12, margin: "28px 0 20px", animation: "fadeIn .3s" }}>
          <div className="tnum" style={{ fontFamily: "var(--font-heading)", fontSize: 96, lineHeight: 0.9, color: "transparent", WebkitTextStroke: "1px var(--color-accent)" }}>{s.num}</div>
          <div style={{ height: 1, background: "var(--color-divider)" }} />
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 400, lineHeight: 1.05 }}>{s.title}</h1>
          <Hi size={16}>{s.hi}</Hi>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--color-neutral-800)" }}>{s.body}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{s.form}</div>
        {err && <div role="alert" style={{ fontSize: 12.5, color: "var(--color-accent-800)", marginTop: 10 }}>{err}</div>}
        <button className="btn btn-primary btn-block" onClick={s.go} disabled={busy} style={{ minHeight: 48, fontSize: 17, marginTop: "auto" }}>
          {busy ? "Saving…" : s.cta}
        </button>
      </div>
    </Screen>
  );
}
