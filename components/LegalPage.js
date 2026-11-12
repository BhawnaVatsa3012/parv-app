import Link from "next/link";
import Screen from "@/components/ui/Screen";

// Marks a detail only the owner can supply. Rendered visibly so it can't be missed.
export function TC({ children }) {
  return (
    <mark style={{ background: "color-mix(in srgb, var(--color-accent) 22%, transparent)", color: "inherit", padding: "0 3px", borderRadius: 2 }}>
      [TO CONFIRM{children ? `: ${children}` : ""}]
    </mark>
  );
}

// Operator and contact details, shared by all three legal pages so they cannot drift apart.
export const LEGAL = {
  operator: "Bhawna Mishra",
  operatorDesc: "Bhawna Mishra, an individual operating Parv as a sole proprietor",
  address: "Adarsh Dairy Road, Malad West, Mumbai, Maharashtra 400064",
  email: "vatsa.bhawna@gmail.com",
  grievanceOfficer: "Bhawna Mishra",
  ackTime: "24 hours",
  resolveTime: "7 days",
  court: "Mumbai, Maharashtra",
};

export function A({ href, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent-700)", textDecoration: "underline", textUnderlineOffset: 2 }}>{children}</a>;
}

export const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refunds" },
];

// Small link row for footers (login, pricing, account).
export function LegalLinks({ style }) {
  return (
    <nav aria-label="Legal" style={{ display: "flex", justifyContent: "center", gap: 14, fontSize: 11.5, ...style }}>
      {LEGAL_LINKS.map((l) => (
        <Link key={l.href} href={l.href} style={{ color: "var(--color-neutral-700)", textDecoration: "underline", textUnderlineOffset: 2 }}>{l.label}</Link>
      ))}
    </nav>
  );
}

const p = { margin: "0 0 10px", fontSize: 14, lineHeight: 1.65, color: "var(--color-neutral-800)" };

export function P({ children }) { return <p style={p}>{children}</p>; }
export function UL({ items }) {
  return (
    <ul style={{ ...p, paddingLeft: 20, margin: "0 0 10px", listStyle: "disc" }}>
      {items.map((t, i) => <li key={i} style={{ marginBottom: 4, listStyle: "disc", display: "list-item" }}>{t}</li>)}
    </ul>
  );
}
export function H({ children }) {
  return <h2 style={{ margin: "26px 0 8px", fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{children}</h2>;
}

export default function LegalPage({ title, updated, children }) {
  return (
    <Screen>
      <div style={{ padding: "max(env(safe-area-inset-top), 24px) 22px 36px" }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--color-accent-700)" }}>&larr; Back to Parv</Link>
        <h1 style={{ margin: "14px 0 4px", fontSize: 38, fontWeight: 400, lineHeight: 1.05 }}>{title}</h1>
        <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginBottom: 18 }}>Last updated: {updated}</div>
        {children}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--color-divider)" }}>
          <LegalLinks />
        </div>
      </div>
    </Screen>
  );
}
