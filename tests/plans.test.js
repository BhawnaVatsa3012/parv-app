import { describe, it, expect } from "vitest";
import { PLANS, PLAN_KEYS, resolvePlan, planIdFor, YEARLY_PER_MONTH, YEARLY_SAVING_PERCENT } from "@/lib/plans";

describe("plan allowlist", () => {
  it("has exactly monthly and yearly", () => {
    expect(PLAN_KEYS).toEqual(["monthly", "yearly"]);
    expect(resolvePlan("monthly").rupees).toBe(49);
    expect(resolvePlan("yearly").rupees).toBe(399);
  });
  it.each(["", "Monthly", "YEARLY", "weekly", "plan_ABC123", "constructor", "__proto__", "toString", "hasOwnProperty", 1, null, undefined, {}, [], ["monthly"], { plan: "monthly" }])(
    "rejects %j",
    (v) => expect(resolvePlan(v)).toBeNull()
  );
  it("plan IDs come from the server environment, with distinct, consistently named variables", () => {
    expect(PLANS.monthly.planEnv).toBe("RAZORPAY_PLAN_ID");
    expect(PLANS.yearly.planEnv).toBe("RAZORPAY_PLAN_ID_YEARLY");
    expect(planIdFor(PLANS.monthly, { RAZORPAY_PLAN_ID: "plan_M" })).toBe("plan_M");
    expect(planIdFor(PLANS.yearly, { RAZORPAY_PLAN_ID: "plan_M" })).toBe("");
    expect(planIdFor(PLANS.yearly, { RAZORPAY_PLAN_ID_YEARLY: " plan_Y " })).toBe("plan_Y");
    expect(planIdFor(null, {})).toBe("");
  });
});

describe("pricing arithmetic", () => {
  it("12 months of the monthly plan is 588", () => expect(PLANS.monthly.rupees * 12).toBe(588));
  it("yearly is about Rs 33 a month (33.25) and saves about 32% (32.1%)", () => {
    expect(YEARLY_PER_MONTH).toBe(33);
    expect(YEARLY_SAVING_PERCENT).toBe(32);
    expect(399 / 12).toBeCloseTo(33.25, 2);
    expect(1 - 399 / 588).toBeCloseTo(0.3214, 3);
  });
});
