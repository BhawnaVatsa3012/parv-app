// Membership plans. The ONLY place plan choices are defined. The client sends a
// plan key ("monthly" | "yearly"); the server looks it up here. A plan ID is
// never accepted from the client: it is read from the server's environment.
// India (Razorpay) only. International pricing is undecided and not handled here.

export const PLANS = {
  monthly: { key: "monthly", label: "Monthly", rupees: 49, interval: "month", planEnv: "RAZORPAY_PLAN_ID", totalCount: 120 },
  yearly: { key: "yearly", label: "Yearly", rupees: 399, interval: "year", planEnv: "RAZORPAY_PLAN_ID_YEARLY", totalCount: 10 },
};
export const PLAN_KEYS = Object.keys(PLANS);

// Allowlist lookup. Anything that is not exactly an own key of PLANS is null
// ("constructor", "__proto__", numbers, arrays, objects, "Monthly" all fail).
export function resolvePlan(choice) {
  if (typeof choice !== "string") return null;
  return Object.prototype.hasOwnProperty.call(PLANS, choice) ? PLANS[choice] : null;
}

// Server-side plan ID for a plan, or "" when its env var is not set.
export function planIdFor(plan, env = process.env) {
  const v = plan ? env[plan.planEnv] : "";
  return typeof v === "string" ? v.trim() : "";
}

// Derived display numbers, so the page can never drift from the prices.
const monthlyYearCost = PLANS.monthly.rupees * 12; // 588
export const YEARLY_PER_MONTH = Math.round(PLANS.yearly.rupees / 12); // 33 (33.25)
export const YEARLY_SAVING_PERCENT = Math.round((1 - PLANS.yearly.rupees / monthlyYearCost) * 100); // 32 (32.1)
