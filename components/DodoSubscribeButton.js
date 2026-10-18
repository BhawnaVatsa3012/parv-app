"use client";
import { useState } from "react";

export default function DodoSubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/dodo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");

      // Dodo returns a hosted checkout URL — redirect the whole page,
      // no client SDK/modal needed.
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3 rounded-xl text-[13px] font-bold bg-transparent border border-marigold text-[#8A5F26] disabled:opacity-60"
      >
        {loading ? "Starting checkout…" : "Subscribe (international)"}
      </button>
      {error && <p className="text-[12px] text-vermillion mt-2">{error}</p>}
    </>
  );
}
