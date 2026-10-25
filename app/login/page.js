"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Show a message if a sign-in link failed (expired, already used, etc.)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "auth_failed") {
      setStatus("error");
      setErrorMsg("That sign-in link didn't work — it may have expired or already been used. Please request a new one.");
    }
  }, []);

  // Already signed in? Go straight to the account page.
  useEffect(() => {
    try {
      createClient().auth.getUser().then(({ data }) => {
        if (data?.user) router.replace("/");
      });
    } catch (e) {}
  }, [router]);

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
        <div className="font-display text-3xl text-marigold leading-none mt-8">Parv</div>
        <div className="text-[11.5px] text-muted mt-1 mb-8">the stories behind our festivals</div>
        <h1 className="font-display text-2xl mb-2">Sign in</h1>
        <p className="text-[13px] text-muted mb-1">
          Sign in to read the stories behind every festival. Rituals — the how-to-celebrate guides — come with a subscription.
        </p>
        <p className="text-[13px] text-muted mb-6">
          We'll email you a one-time link — no password needed.
        </p>

        {status === "sent" ? (
          <div className="bg-transparent border border-black/10 rounded-2xl p-4 text-[13px]">
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
              className="w-full py-3 rounded-xl text-[13px] font-bold bg-transparent border border-marigold text-[#8A5F26] disabled:opacity-60"
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
