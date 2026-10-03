"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="min-h-[100dvh] bg-night text-cream flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-2">Sign in to Parv</h1>
        <p className="text-[13px] text-muted mb-6">
          We'll email you a one-time link — no password needed.
        </p>

        {status === "sent" ? (
          <div className="bg-night2 rounded-2xl p-4 text-[13px]">
            Check <b>{email}</b> for a sign-in link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-night2 border border-black/15 px-4 py-3 text-[14px] text-cream placeholder:text-muted outline-none focus:border-marigold"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 rounded-xl text-[13px] font-bold bg-marigold text-[#3A2405] disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {status === "error" && (
              <p className="text-[12px] text-vermillion">{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
