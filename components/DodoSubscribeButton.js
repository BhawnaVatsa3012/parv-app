"use client";
import { useState } from "react";

// Sends international users to Dodo Payments' hosted checkout page.
export default function DodoSubscribeButton({ label, from = "", disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/dodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary btn-block" onClick={handleClick} disabled={loading || disabled} style={{ minHeight: 50, fontSize: 17, marginTop: 0 }}>
        {loading ? "Starting checkout…" : label}
      </button>
      {error && <p role="alert" style={{ fontSize: 12, color: "var(--color-accent-800)", margin: 0, textAlign: "center" }}>{error}</p>}
    </>
  );
}
