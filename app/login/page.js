"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ONBOARDING, UI } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Hi, useLang } from "@/components/ui/Lang";
import Splash from "@/components/Splash";

const hiStyle = { fontSize: 16, color: "var(--color-accent-700)" };

export default function LoginPage() {
  const router = useRouter();
  const { bi } = useLang();
  const [stage, setStage] = useState(null); // null (deciding) | splash | onboard | form
  const [onb, setOnb] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  // Splash once per session, onboarding once per device, then the form.
  useEffect(() => {
    let splashSeen = false, onboarded = false;
    try {
      splashSeen = sessionStorage.getItem("parv-splash-seen") === "1";
      onboarded = localStorage.getItem("parv-onboarded") === "1";
    } catch (e) {}
    const failed = new URLSearchParams(window.location.search).get("error") === "auth_failed";
    if (failed) {
      setStatus("error");
      setErrorMsg("That sign-in link didn't work — it may have expired or already been used. Please request a new one.");
      setStage("form");
      return;
    }
    setStage(!splashSeen ? "splash" : !onboarded ? "onboard" : "form");
  }, []);

  // Already signed in? Go straight into the app.
  useEffect(() => {
    try {
      createClient().auth.getUser().then(({ data }) => { if (data?.user) router.replace("/"); });
    } catch (e) {}
  }, [router]);

  const afterSplash = useCallback(() => {
    try { sessionStorage.setItem("parv-splash-seen", "1"); } catch (e) {}
    let onboarded = false;
    try { onboarded = localStorage.getItem("parv-onboarded") === "1"; } catch (e) {}
    setStage(onboarded ? "form" : "onboard");
  }, []);

  const finishOnboarding = () => {
    try { localStorage.setItem("parv-onboarded", "1"); } catch (e) {}
    setStage("form");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMsg("Enter a valid email address");
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (stage === null) return <Screen>{null}</Screen>;
  if (stage === "splash") return <Splash onDone={afterSplash} />;

  if (stage === "onboard") {
    const o = ONBOARDING[onb];
    return (
      <Screen>
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "max(env(safe-area-inset-top), 20px) 24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }} aria-label={`Step ${onb + 1} of 3`}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 26, height: 2, background: i <= onb ? "var(--color-accent)" : "var(--color-neutral-300)" }} />
              ))}
            </div>
            <button className="btn btn-ghost" onClick={finishOnboarding}>Skip</button>
          </div>
          <div key={onb} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, animation: "fadeIn .3s" }}>
            <div className="tnum" style={{ fontFamily: "var(--font-heading)", fontSize: 150, lineHeight: 0.9, fontWeight: 400, color: "transparent", WebkitTextStroke: "1px var(--color-accent)" }}>{o.num}</div>
            <div style={{ height: 1, background: "var(--color-divider)" }} />
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 400, lineHeight: 1.05, textWrap: "balance" }}>{o.title}</h1>
            <Hi size={17}>{o.hi}</Hi>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, textAlign: "justify", hyphens: "auto", color: "var(--color-neutral-800)" }}>{o.body}</p>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => (onb < 2 ? setOnb(onb + 1) : finishOnboarding())}
            style={{ minHeight: 48, fontSize: 17 }}
          >
            {onb === 2 ? "Get started" : "Next"}
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ display: "flex", flexDirection: "column", padding: "0 24px 28px", minHeight: "100dvh" }}>
        <div style={{ padding: "max(env(safe-area-inset-top), 56px) 0 26px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="kicker" style={{ color: "var(--color-accent-700)" }}>
            Parv <Hi size={12}>{UI.brand}</Hi>
          </div>
          <h1 style={{ margin: 0, fontSize: 44, fontWeight: 400, lineHeight: 1.02 }}>
            {status === "sent" ? "Check your inbox" : "Welcome"}
          </h1>
          {bi && <div className="font-hi" style={hiStyle}>{status === "sent" ? "अपना ईमेल देखें" : UI.welcome}</div>}
          <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--color-neutral-700)" }}>
            Sign in to read the stories behind every festival. We'll email you a one-time link — no password needed.
          </p>
        </div>

        {status === "sent" ? (
          <>
            <div className="card" style={{ borderColor: "var(--color-accent)" }}>
              <div className="card-kicker" style={{ color: "var(--color-accent-700)" }}>Sign-in link sent</div>
              <div className="card-body" style={{ opacity: 1, color: "var(--color-neutral-800)" }}>
                We've sent a link to <b>{email}</b>. Open it on this device or any other to sign in. It can be used once and expires soon.
              </div>
            </div>
            <button className="btn btn-secondary btn-block" onClick={() => setStatus("idle")} style={{ minHeight: 44, marginTop: 16 }}>
              Use a different email
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                placeholder="you@example.com"
                style={{ minHeight: 44, fontSize: 15 }}
              />
              {status === "error" && <div role="alert" style={{ fontSize: 12, color: "var(--color-accent-800)", marginTop: 4 }}>{errorMsg}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={status === "sending"} style={{ minHeight: 48, fontSize: 17 }}>
              {status === "sending" ? "Please wait…" : "Email me a sign-in link"}
            </button>
          </form>
        )}
        <p style={{ margin: "auto 0 0", paddingTop: 24, fontSize: 11, lineHeight: 1.5, textAlign: "center", color: "var(--color-neutral-600)" }}>
          By continuing you agree to Parv's Terms and Privacy Policy.
        </p>
      </div>
    </Screen>
  );
}
