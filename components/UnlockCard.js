import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { PLANS, YEARLY_PER_MONTH, YEARLY_SAVING_PERCENT } from "@/lib/plans";

// The friendly "locked" state used everywhere something is paid. Never an error:
// it says what is behind the lock, what membership costs, and links to /pricing.
// International readers are not shown prices (international pricing is undecided).
export default function UnlockCard({ title, body, from = "", intl = false, cta = "Unlock with Parv", compact = false }) {
  const href = from ? `/pricing?from=${from}` : "/pricing";
  return (
    <div className="card" data-testid="unlock-card" style={{ borderColor: "var(--color-accent)", gap: compact ? 8 : 10, padding: compact ? 14 : 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-accent-700)" }}>
        <Icon name="lock" size={16} /><span className="card-kicker" style={{ color: "inherit" }}>Parv membership</span>
      </div>
      <div className="card-title" style={{ fontSize: compact ? 18 : 21 }}>{title}</div>
      {body && <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--color-neutral-800)" }}>{body}</div>}
      {!intl && (
        <div className="tnum" style={{ fontSize: 13, color: "var(--color-neutral-800)" }}>
          ₹{PLANS.monthly.rupees} a month, or ₹{PLANS.yearly.rupees} a year (about ₹{YEARLY_PER_MONTH} a month, save about {YEARLY_SAVING_PERCENT}%).
        </div>
      )}
      <Link href={href} className="btn btn-primary btn-block" style={{ minHeight: compact ? 42 : 46, fontSize: 16 }}>{cta}</Link>
    </div>
  );
}
