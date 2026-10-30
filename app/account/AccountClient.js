"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UI, nameFromEmail } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Hi, useLang } from "@/components/ui/Lang";
import Icon from "@/components/ui/Icon";
import ProfileSettings from "@/components/ProfileSettings";

const PRICE = { razorpay: "₹99", dodo: "$3.99" };
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function AccountClient({ email, subscription, detectedRegion, profile }) {
  const { bi, setBi } = useLang();
  const [status, setStatus] = useState(subscription?.status || null);
  const [dialog, setDialog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
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

  const [name, setName] = useState(profile?.name || nameFromEmail(email));
  const provider = subscription?.provider;
  const until = fmt(subscription?.current_period_end);
  const myPrice = region === "india" ? "₹99" : "$3.99";

  const sub =
    status === "active"
      ? { title: "Active", tag: provider === "dodo" ? "Dodo" : "Razorpay", tagClass: "tag-accent", meta: `${PRICE[provider] || myPrice}/month${until ? ` · renews ${until}` : ""}`, canCancel: true }
      : status === "cancelled"
      ? { title: "Cancelled", tag: "Ends soon", tagClass: "tag-neutral", meta: until ? `Access until ${until}` : "Your access ends at the close of the billing period.", buy: "Resubscribe" }
      : status === "on_hold"
      ? { title: "On hold", tag: "Payment issue", tagClass: "tag-neutral", meta: "Your last payment didn't go through. Update it in the payment app you used.", buy: "See membership" }
      : status === "expired"
      ? { title: "Expired", tag: "Free", tagClass: "tag-neutral", meta: "Stories are free. Rituals need a membership.", buy: `See membership · ${myPrice}/month` }
      : { title: "Not subscribed", tag: "Free", tagClass: "tag-neutral", meta: "Stories are free. Rituals need a membership.", buy: `See membership · ${myPrice}/month` };

  async function confirmCancel() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not cancel");
      setStatus("cancelled");
      setMessage(data.note || "");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
      setDialog(false);
    }
  }

  async function signOut() {
    try { await createClient().auth.signOut(); } catch (e) {}
    window.location.href = "/login";
  }

  const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 0", borderBottom: "1px solid var(--color-divider)" };

  return (
    <Screen nav>
      <div style={{ padding: "max(env(safe-area-inset-top), 24px) 20px 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 34, fontWeight: 400 }}>Profile</h2>
          <Hi size={16}>{UI.profile}</Hi>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "18px 0 20px" }}>
          <span style={{ flex: "none", width: 58, height: 58, borderRadius: "50%", border: "1px solid var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontSize: 26, color: "var(--color-accent-700)" }}>
            {name[0]?.toUpperCase()}
          </span>
          <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600 }}>{name}</span>
            <span style={{ fontSize: 13, color: "var(--color-neutral-700)", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</span>
          </span>
        </div>

        <div className="card" style={{ gap: 6, padding: 16 }}>
          <div className="card-kicker" style={{ color: "var(--color-accent-700)" }}>Rituals subscription</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600 }}>{sub.title}</span>
            <span className={`tag ${sub.tagClass}`}>{sub.tag}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>{sub.meta}</div>
          {sub.canCancel && (
            <button className="btn btn-secondary btn-block" onClick={() => setDialog(true)} style={{ minHeight: 42 }}>Cancel subscription</button>
          )}
          {sub.buy && (
            <Link href="/pricing" className="btn btn-primary btn-block" style={{ minHeight: 42 }}>{sub.buy}</Link>
          )}
          {message && <div role="status" style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 4 }}>{message}</div>}
        </div>

        <h6 style={{ margin: "24px 0 4px", color: "var(--color-neutral-700)" }}>You</h6>
        <ProfileSettings profile={profile} member={status === "active"} onName={(n) => setName(n || nameFromEmail(email))} />

        <h6 style={{ margin: "18px 0 4px", color: "var(--color-neutral-700)" }}>Settings</h6>
        <div style={row}>
          <span style={{ fontSize: 14 }}>Language</span>
          <div className="seg">
            <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name="pf-lang" checked={!bi} onChange={() => setBi(false)} />English</label>
            <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name="pf-lang" checked={bi} onChange={() => setBi(true)} />English + हिंदी</label>
          </div>
        </div>
        <div style={row}>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14 }}>Billing region</span>
            <span style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>{region === "india" ? "₹99/month via Razorpay" : "$3.99/month via Dodo Payments"}</span>
          </span>
          <div className="seg">
            <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name="pf-region" checked={region === "india"} onChange={() => setRegion("india")} />India</label>
            <label className="seg-opt" style={{ fontSize: 12 }}><input type="radio" name="pf-region" checked={region === "international"} onChange={() => setRegion("international")} />Intl</label>
          </div>
        </div>

        <button className="btn btn-secondary btn-block" onClick={signOut} style={{ minHeight: 44, marginTop: 24 }}>
          <Icon name="logOut" size={16} />Sign out
        </button>
        <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 11, color: "var(--color-neutral-600)" }}>Parv · the stories behind our festivals</p>
      </div>

      {dialog && (
        <div role="dialog" aria-modal="true" aria-labelledby="cancel-title" style={{ position: "fixed", inset: 0, zIndex: 25, display: "grid", placeItems: "center", padding: 24, background: "color-mix(in srgb, var(--color-neutral-900) 50%, transparent)", animation: "fadeIn .2s" }}>
          <div className="dialog">
            <div id="cancel-title" className="dialog-title">Cancel your Rituals subscription?</div>
            <div className="dialog-body">You'll keep access until the end of the current billing period{until ? `, ${until}` : ""}.</div>
            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => setDialog(false)} disabled={busy}>Keep it</button>
              <button className="btn btn-secondary" onClick={confirmCancel} disabled={busy}>{busy ? "Cancelling…" : "Cancel subscription"}</button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
