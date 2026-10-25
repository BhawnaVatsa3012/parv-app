"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Bilingual labels (English + हिंदी) are on by default; the user can switch
// to English only from Profile. Saved on this device.
const LangContext = createContext({ bi: true, setBi: () => {} });

export function LangProvider({ children }) {
  const [bi, setBiState] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem("parv-lang") === "en") setBiState(false);
    } catch (e) {}
  }, []);
  const setBi = (v) => {
    setBiState(v);
    try { localStorage.setItem("parv-lang", v ? "bi" : "en"); } catch (e) {}
  };
  return <LangContext.Provider value={{ bi, setBi }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

// A Hindi label, hidden when the user has chosen English only.
export function Hi({ children, size = 14, color = "var(--color-accent-700)", style }) {
  const { bi } = useLang();
  if (!bi || !children) return null;
  return (
    <span className="font-hi" lang="hi" style={{ fontSize: size, color, letterSpacing: 0, textTransform: "none", ...style }}>
      {children}
    </span>
  );
}
