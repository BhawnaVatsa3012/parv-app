"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SCREEN_BG } from "@/lib/design";
import { Hi } from "./Lang";
import { UI } from "@/lib/design";
import Icon from "./Icon";

// The app column: phone-width, on the design's washed, dotted background.
// On a wide screen it sits centred, like the phone in the design file.
export default function Screen({ children, nav = false, background = SCREEN_BG, style }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-surface)" }}>
      <main
        style={{
          position: "relative", maxWidth: 440, margin: "0 auto", minHeight: "100dvh",
          background, color: "var(--color-text)", paddingBottom: nav ? 80 : 0,
          boxShadow: "0 0 0 1px var(--color-divider)", ...style,
        }}
      >
        {children}
      </main>
      {nav && <BottomNav />}
    </div>
  );
}

const TABS = [
  { href: "/", label: "Home", hi: UI.home, icon: "home" },
  { href: "/calendar", label: "Calendar", hi: UI.cal, icon: "calendar" },
  { href: "/map", label: "Map", hi: UI.map, icon: "map" },
  { href: "/account", label: "Profile", hi: UI.profile, icon: "user" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 10, maxWidth: 440, margin: "0 auto", height: 80,
        background: "color-mix(in srgb, var(--color-bg) 78%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--color-divider)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", paddingBottom: 18,
      }}
    >
      {TABS.map((t) => {
        const on = path === t.href;
        const color = on ? "var(--color-accent-700)" : "var(--color-neutral-700)";
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 11,
              color, textDecoration: "none", boxShadow: on ? "inset 0 1px 0 var(--color-accent)" : "none",
            }}
          >
            <Icon name={t.icon} size={21} width={1.5} />
            <span>{t.label}</span>
            <Hi size={10} color={color} style={{ lineHeight: 1 }}>{t.hi}</Hi>
          </Link>
        );
      })}
    </nav>
  );
}
