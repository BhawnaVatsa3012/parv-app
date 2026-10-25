"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { festivals } from "@/lib/data";
import { HI, UI, orderFestivals, nameFromEmail } from "@/lib/design";
import Screen from "@/components/ui/Screen";
import { Bunting, Plate } from "@/components/ui/Decor";
import { Hi } from "@/components/ui/Lang";
import Splash from "@/components/Splash";

const heading = { fontFamily: "var(--font-heading)" };

export default function HomeClient({ email }) {
  const router = useRouter();
  // Splash plays once per browser session.
  const [showSplash, setShowSplash] = useState(null);
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("parv-splash-seen") === "1"; } catch (e) {}
    setShowSplash(!seen);
  }, []);
  const doneSplash = useMemo(() => () => {
    try { sessionStorage.setItem("parv-splash-seen", "1"); } catch (e) {}
    setShowSplash(false);
  }, []);

  const { upcoming, past, prod, next } = useMemo(() => orderFestivals(festivals), []);
  const list = [...upcoming, ...past, ...prod];
  const name = nameFromEmail(email);
  const initial = (name[0] || "P").toUpperCase();

  return (
    <>
      {showSplash && <Splash onDone={doneSplash} />}
      <Screen nav>
        <div style={{ paddingBottom: 28 }}>
          <Bunting />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 2px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ ...heading, fontSize: 30, fontWeight: 600, letterSpacing: "-.01em" }}>Parv</span>
              <Hi size={16}>{UI.brand}</Hi>
            </div>
            <Link
              href="/account"
              aria-label="Profile"
              className="hover-tint"
              style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--color-accent)", color: "var(--color-accent-700)", ...heading, fontWeight: 600, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
            >
              {initial}
            </Link>
          </div>
          <div style={{ padding: "0 20px 16px", fontSize: 13, fontStyle: "italic", color: "var(--color-neutral-700)", borderBottom: "1px solid var(--color-divider)" }}>
            the stories behind our festivals
          </div>

          {next && (
            <div style={{ padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Namaste, {name}</div>
              <div className="kicker" style={{ color: next.c.deep }}>
                {next.upcoming ? (next.days === 0 ? "Next festival · today" : `Next festival · in ${next.days} days`) : "From this year"}
              </div>
              <Link
                href={`/festival/${next.id}`}
                style={{ display: "flex", flexDirection: "column", gap: 10, padding: "10px 10px 18px", borderRadius: "var(--radius-lg)", color: "var(--color-bg)", boxShadow: "var(--shadow-md)", background: next.c.glow, textDecoration: "none" }}
              >
                <Plate id={next.id} height={180} hindi={HI[next.id]} />
                <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: 38, fontWeight: 400, color: "var(--color-bg)" }}>{next.name}</h2>
                    <Hi size={18} color="var(--color-bg)">{HI[next.id]}</Hi>
                  </div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, fontStyle: "italic", color: "var(--color-bg)" }}>{next.hook}</p>
                  <div className="tnum" style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--color-bg)", flexWrap: "wrap" }}>
                    <span>{next.date}</span><span>·</span><span>{next.meta}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          <div style={{ padding: "22px 20px 0" }}>
            <h6 style={{ margin: "0 0 10px", display: "flex", gap: 8, alignItems: "baseline", color: "var(--color-neutral-700)" }}>
              All festivals <Hi size={12}>{UI.all}</Hi>
            </h6>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map((f) => (
                <button
                  key={f.id}
                  className="card hover-accent"
                  disabled={f.soon}
                  onClick={() => router.push(`/festival/${f.id}`)}
                  style={{ flexDirection: "row", alignItems: "stretch", gap: 14, textAlign: "left", fontFamily: "var(--font-body)", color: "var(--color-text)", cursor: f.soon ? "default" : "pointer", opacity: f.soon ? 0.55 : 1, background: "transparent" }}
                >
                  <div style={{ flex: "none", width: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", padding: "8px 0", background: f.c.tint, color: f.c.deep }}>
                    <span className="tnum" style={{ ...heading, fontSize: 28, lineHeight: 1 }}>{f.dd}</span>
                    <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>{f.mon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ ...heading, fontWeight: 600, fontSize: 19, lineHeight: 1.15 }}>{f.name}</span>
                      <Hi size={13}>{HI[f.id]}</Hi>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--color-neutral-800)" }}>{f.hook}</div>
                    <div style={{ fontSize: 11, color: f.c.deep }}>{f.meta}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Screen>
    </>
  );
}
