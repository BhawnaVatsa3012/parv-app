"use client";
import { useState } from "react";
import Script from "next/script";

export default function RazorpaySubscribeButton({ planLabel = "Rituals subscription" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/razorpay", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Parv",
        description: planLabel,
        handler: function () {
          window.location.href = "/pricing?status=success";
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: { color: "#F2A93B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3 rounded-xl text-[13px] font-bold bg-transparent border border-marigold text-[#8A5F26] disabled:opacity-60"
      >
        {loading ? "Starting checkout…" : "Subscribe with Razorpay"}
      </button>
      {error && <p className="text-[12px] text-vermillion mt-2">{error}</p>}
    </>
  );
}
