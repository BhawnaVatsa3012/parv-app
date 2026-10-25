"use client";
import { useState } from "react";
import Script from "next/script";

// Opens Razorpay's own checkout (UPI, cards, netbanking). Card and UPI
// details are entered on Razorpay's secure form, never in Parv.
export default function RazorpaySubscribeButton({ label, from = "", disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/razorpay", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Parv",
        description: "Rituals membership · monthly",
        handler: function (resp) {
          const q = new URLSearchParams({ status: "success", via: "razorpay" });
          if (resp?.razorpay_payment_id) q.set("pid", resp.razorpay_payment_id);
          if (from) q.set("from", from);
          window.location.href = `/pricing?${q}`;
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#b68235" },
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button className="btn btn-primary btn-block" onClick={handleClick} disabled={loading || disabled} style={{ minHeight: 50, fontSize: 17, marginTop: 0 }}>
        {loading ? "Starting checkout…" : label}
      </button>
      {error && <p role="alert" style={{ fontSize: 12, color: "var(--color-accent-800)", margin: 0, textAlign: "center" }}>{error}</p>}
    </>
  );
}
