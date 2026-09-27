"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const STATUS_LABEL = {
  active: "Active",
  on_hold: "Payment issue — on hold",
  cancelled: "Cancelled",
  expired: "Expired",
};

export default function AccountClient({ email, subscription }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [localStatus, setLocalStatus] = useState(subscription?.status);

  async function handleCancel() {
    if (!confirm("Cancel your Rituals subscription? You'll keep access until the end of the current billing period.")) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not cancel");
      setMessage(data.note);
      setLocalStatus("cancelled");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-[100dvh] bg-night text-cream flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">Your account</h1>
        <p className="text-[13px] text-muted mb-5">{email}</p>

        <div className="bg-night2 rounded-2xl p-4 mb-4">
          <div className="text-[11px] text-muted mb-1">Rituals subscription</div>
          {subscription ? (
            <>
              <div className="text-[15px] font-semibold mb-1">
                {STATUS_LABEL[localStatus] || localStatus}
              </div>
              <div className="text-[11px] text-muted">
                via {subscription.provider === "razorpay" ? "Razorpay" : "Dodo Payments"}
                {subscription.current_period_end &&
                  ` · renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
              </div>
            </>
          ) : (
            <div className="text-[13px]">
              No subscription yet.{" "}
              <Link href="/pricing" className="text-marigold underline">
                See pricing
              </Link>
            </div>
          )}
        </div>

        {subscription && localStatus === "active" && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="w-full py-3 rounded-xl text-[13px] font-bold border border-vermillion text-vermillion mb-3 disabled:opacity-60"
          >
            {busy ? "Cancelling…" : "Cancel subscription"}
          </button>
        )}

        {message && <p className="text-[12px] text-muted mb-3">{message}</p>}

        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl text-[13px] font-bold border border-white/15 text-cream"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
