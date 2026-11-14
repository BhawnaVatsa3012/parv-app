"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { festivals } from "@/lib/festivalList";
import { PLANS, YEARLY_PER_MONTH, YEARLY_SAVING_PERCENT } from "@/lib/plans";
import { UI, HUE_LIST, col, nameFromEmail } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Bunting, Plate } from "@/components/ui/Decor";
import { Hi } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";
import RazorpaySubscribeButton from "@/components/RazorpaySubscribeButton";
import DodoSubscribeButton from "@/components/DodoSubscribeButton";
import { LegalLinks } from "@/components/LegalPage";

// India prices come from lib/plans.js (monthly ₹49, yearly ₹399). International pricing is
// UNDECIDED: the international option below keeps the earlier proposed $3.99 monthly, unchanged.
const INTL_PRICE = "$3.99";

const PERKS = [
  "Every festival’s full set of regional stories",
  "Hindu Panchang and Hijri details: tithi, timings, key muhurat",
  "Samagri — what you’ll need, for every ritual",
  "Step-by-step puja, written for home",
  "Mantras in Devanagari, transliterated, with meaning",
  "What to wear, and why",
  "Preparation checklists and reminders",
];

export default function PricingClient({ detectedRegion, email, member, success, paymentId, via, from, paidPlan = "", yearlyAvailable = false }) {
  const router = useRouter();
  const [region, setRegionState] = useState(detectedRegion);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("parv-region");
      if (saved === "india" || saved === "international") setRegionState(saved);
    } catch (e) {}
  }, []);
  const setRegion = (r) => {
    setRegionState(r);
    try { localStorage.setItem("parv-region", r); } catch (e) {}
  };

  const [plan, setPlan] = useState("monthly");
  const fest = festivals.find((f) => f.id === from) ? { id: from, title: festivals.find((f) => f.id === from).name } : null;
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  if (success) {
    const paidRegion = via === "dodo" ? "international" : via === "razorpay" ? "india" : region;
    const receipt = [
      ["Plan", paidRegion === "india" && paidPlan === "yearly" ? "Parv membership, yearly" : "Parv membership, monthly"],
      ["Amount", paidRegion === "india" ? `₹${(PLANS[paidPlan] || PLANS.monthly).rupees}.00` : INTL_PRICE],
      ["Paid via", paidRegion === "india" ? "Razorpay" : "Dodo Payments"],
      ...(paymentId ? [["Payment ID", paymentId]] : []),
    ];
    return (
      <Screen>
        <div style={{ padding: "0 24px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minHeight: "100dvh" }}>
          <div style={{ alignSelf: "stretch", margin: "0 -24px 36px", paddingTop: "env(safe-area-inset-top)" }}><Bunting /></div>
          <div style={{ width: 78, height: 78, borderRadius: "50%", border: "1px solid var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .4s" }}>
            <Icon name="check" size={34} stroke="var(--color-accent)" width={1.5} />
          </div>
          <div className="kicker" style={{ color: "var(--color-accent-700)", marginTop: 20 }}>Payment successful</div>
          <h1 style={{ margin: "6px 0 2px", fontSize: 42, fontWeight: 400, lineHeight: 1 }}>Parv unlocked</h1>
          <Hi size={16}>{UI.success}</Hi>
          <p style={{ margin: "12px 0 22px", fontSize: 14, lineHeight: 1.55, color: "var(--color-neutral-800)", maxWidth: 300 }}>
            Welcome to Parv membership, {nameFromEmail(email)}. Every story, the calendar details and the Rituals are now open.
            {!member && " It can take a minute for your membership to show everywhere."}
          </p>
          <div style={{ width: "100%", textAlign: "left" }}>
            {receipt.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--color-divider)", fontSize: 13.5 }}>
                <span style={{ color: "var(--color-neutral-700)" }}>{k}</span>
                <span className="tnum" style={{ textAlign: "right", wordBreak: "break-all" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "auto", paddingTop: 24, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {fest && (
              <Link href={`/festival/${fest.id}`} className="btn btn-primary btn-block" style={{ minHeight: 48, fontSize: 16 }}>
                Open {fest.title} rituals
              </Link>
            )}
            <Link href="/" className={`btn ${fest ? "btn-secondary" : "btn-primary"} btn-block`} style={{ minHeight: 44 }}>Back to home</Link>
          </div>
        </div>
      </Screen>
    );
  }

  const india = region === "india";
  const yearlyOn = yearlyAvailable && plan === "yearly";
  const chosen = yearlyOn ? PLANS.yearly : PLANS.monthly;
  const label = member
    ? "You're a member"
    : india
    ? `Subscribe · ₹${chosen.rupees}/${chosen.interval}`
    : `Subscribe · ${INTL_PRICE}/month`;

  return (
    <Screen>
      <div style={{ padding: "0 22px 28px", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
        <div style={{ margin: "0 -22px", paddingTop: "env(safe-area-inset-top)" }}><Bunting /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 8px", margin: "0 -10px" }}>
          <button className="btn btn-icon btn-ghost" onClick={back} aria-label="Close"><Icon name="x" size={22} /></button>
          <span className="kicker" style={{ color: "var(--color-accent-700)" }}>Membership <Hi size={12}>{UI.member}</Hi></span>
          <span style={{ width: 36 }} />
        </div>

        <Plate id={fest?.id || "diwali"} height={170} onDark={false} />
        <h1 style={{ margin: "18px 0 2px", fontSize: 42, fontWeight: 400, lineHeight: 1 }}>Unlock with Parv</h1>
        <Hi size={16}>{UI.unlock}</Hi>
        <p style={{ margin: "10px 0 12px", fontSize: 14, lineHeight: 1.6, textAlign: "justify", hyphens: "auto" }}>
          Every festival’s date is free, and so are the stories of seven festivals: Diwali, Eid, Christmas, Vaisakhi, Mahavir Jayanti, Buddha Purnima and Bihu. Membership opens every other story, the calendar details, the Rituals and the preparation checklists.
        </p>
        {PERKS.map((t, i) => (
          <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderTop: "1px solid var(--color-divider)", fontSize: 14 }}>
            <Icon name="check" size={16} stroke={col(HUE_LIST[i]).base} width={2} style={{ marginTop: 3 }} />
            <span>{t}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="seg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <label className="seg-opt" style={{ justifyContent: "center" }}>
              <input type="radio" name="pw-region" checked={region === "india"} onChange={() => setRegion("india")} />India
            </label>
            <label className="seg-opt" style={{ justifyContent: "center" }}>
              <input type="radio" name="pw-region" checked={region === "international"} onChange={() => setRegion("international")} />International
            </label>
          </div>
          {india ? (
            <div role="radiogroup" aria-label="Plan" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label data-testid="plan-monthly" className="card" style={{ cursor: "pointer", gap: 4, padding: 14, borderColor: plan === "monthly" ? "var(--color-accent)" : "var(--color-divider)", boxShadow: plan === "monthly" ? "inset 0 0 0 1px var(--color-accent)" : "none" }}>
                <input type="radio" name="pw-plan" checked={plan === "monthly"} onChange={() => setPlan("monthly")} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                <span className="kicker">Monthly</span>
                <span className="tnum" style={{ fontFamily: "var(--font-heading)", fontSize: 38, lineHeight: 1 }}>₹{PLANS.monthly.rupees}</span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>a month<br />Cancel anytime</span>
              </label>
              <label data-testid="plan-yearly" className="card" aria-disabled={!yearlyAvailable} style={{ cursor: yearlyAvailable ? "pointer" : "not-allowed", opacity: yearlyAvailable ? 1 : 0.75, gap: 4, padding: 14, borderColor: plan === "yearly" && yearlyAvailable ? "var(--color-accent)" : "var(--color-divider)", boxShadow: plan === "yearly" && yearlyAvailable ? "inset 0 0 0 1px var(--color-accent)" : "none" }}>
                <input type="radio" name="pw-plan" checked={plan === "yearly"} disabled={!yearlyAvailable} onChange={() => setPlan("yearly")} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                <span className="kicker" style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  Yearly {yearlyAvailable ? <span className="tag tag-accent" style={{ fontSize: 10 }}>Save about {YEARLY_SAVING_PERCENT}%</span> : <span className="tag tag-neutral" style={{ fontSize: 10 }}>Coming soon</span>}
                </span>
                <span className="tnum" style={{ fontFamily: "var(--font-heading)", fontSize: 38, lineHeight: 1 }}>₹{PLANS.yearly.rupees}</span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>a year<br />about ₹{YEARLY_PER_MONTH} a month</span>
              </label>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)" }}>
              <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="tnum" style={{ fontFamily: "var(--font-heading)", fontSize: 54, lineHeight: 1, fontWeight: 400 }}>{INTL_PRICE}</span>
                <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>/ month</span>
              </span>
              <span style={{ fontSize: 12, color: "var(--color-neutral-700)", textAlign: "right" }}>Cancel anytime<br />Billed monthly</span>
            </div>
          )}
          {region === "india"
            ? <RazorpaySubscribeButton label={label} from={fest?.id} disabled={member} plan={yearlyOn ? "yearly" : "monthly"} />
            : <DodoSubscribeButton label={label} from={fest?.id} disabled={member} />}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11.5, color: "var(--color-neutral-700)", textAlign: "center" }}>
            <Icon name="shield" size={13} />
            {region === "india" ? "Secure checkout via Razorpay · UPI, cards, netbanking" : "Secure checkout via Dodo Payments · international cards"}
          </div>
          <LegalLinks />
        </div>
      </div>
    </Screen>
  );
}
