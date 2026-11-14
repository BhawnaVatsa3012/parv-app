import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Both the Supabase session client and the Razorpay SDK are mocked: no network, no keys.
const getUser = vi.fn();
// In-memory subscriptions table for the "already subscribed?" lookup.
let subRows;
let subQueryError;
const filtersSeen = [];
const from = vi.fn(() => {
  const f = [];
  const b = {
    select: () => b,
    eq: (k, v) => { f.push([k, [v]]); return b; },
    in: (k, vs) => { f.push([k, vs]); return b; },
    limit: () => b,
    then: (res, rej) => {
      filtersSeen.push(f);
      if (subQueryError) return Promise.resolve({ data: null, error: subQueryError }).then(res, rej);
      const data = subRows.filter((r) => f.every(([k, vs]) => vs.includes(r[k])));
      return Promise.resolve({ data, error: null }).then(res, rej);
    },
  };
  return b;
});
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser }, from }) }));

const create = vi.fn();
const ctor = vi.fn();
vi.mock("razorpay", () => ({
  default: class FakeRazorpay {
    constructor(opts) { ctor(opts); this.subscriptions = { create }; }
  },
}));

import { POST } from "@/app/api/checkout/razorpay/route";

const ENV = { RAZORPAY_KEY_ID: "rzp_test_dummy", RAZORPAY_KEY_SECRET: "dummy_secret_value", RAZORPAY_PLAN_ID: "plan_DUMMY" };

beforeEach(() => {
  Object.assign(process.env, ENV);
  getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "a@example.com" } } });
  create.mockResolvedValue({ id: "sub_NEW1" });
  subRows = [];
  subQueryError = null;
  filtersSeen.length = 0;
  from.mockClear();
});
afterEach(() => { for (const k of Object.keys(ENV)) delete process.env[k]; });

describe("missing environment", () => {
  it.each(Object.keys(ENV))("returns 503 and does not touch Razorpay or auth when %s is unset", async (k) => {
    delete process.env[k];
    const res = await POST();
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/aren't set up yet/);
    expect(ctor).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });
});

describe("authentication", () => {
  it("returns 401 when signed out and creates no subscription", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST();
    expect(res.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("creating the subscription", () => {
  it("creates a plan subscription tagged with the signed-in user's id, and returns only the id and public key id", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ subscriptionId: "sub_NEW1", keyId: "rzp_test_dummy" });
    expect(create).toHaveBeenCalledWith({
      plan_id: "plan_DUMMY",
      customer_notify: 1,
      total_count: 120,
      notes: { supabase_user_id: "user-1" },
    });
  });

  it("never returns the key secret", async () => {
    const res = await POST();
    expect(JSON.stringify(await res.json())).not.toContain(ENV.RAZORPAY_KEY_SECRET);
  });

  it("passes the key id and secret to the SDK constructor", async () => {
    await POST();
    expect(ctor).toHaveBeenCalledWith({ key_id: "rzp_test_dummy", key_secret: "dummy_secret_value" });
  });

  it("returns 500 with a generic message (no SDK detail) when Razorpay fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    create.mockRejectedValue(new Error("secret internal detail"));
    const res = await POST();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Could not create subscription" });
  });

});

describe("duplicate subscriptions", () => {
  const row = (over) => ({ user_id: "user-1", provider: "razorpay", provider_subscription_id: "sub_X", status: "active", ...over });

  it.each([
    ["active", "active"],
    ["on_hold (payment pending / retrying)", "on_hold"],
  ])("returns 409 with a clear message and creates nothing when the user already has a %s subscription", async (_l, status) => {
    subRows = [row({ status })];
    const res = await POST();
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("You already have an active subscription.");
    expect(body.code).toBe("already_subscribed");
    expect(create).not.toHaveBeenCalled();
    expect(ctor).not.toHaveBeenCalled();
  });

  it("counts the manual owner grant as active, so a test click never creates a charge", async () => {
    subRows = [row({ provider_subscription_id: "manual-owner-grant", status: "active" })];
    const res = await POST();
    expect(res.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });

  it("counts an active subscription from any provider", async () => {
    subRows = [row({ provider: "dodo", provider_subscription_id: "sub_dodo" })];
    expect((await POST()).status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(["cancelled", "expired"])("a %s subscription does not block a new one (genuine re-subscribe)", async (status) => {
    subRows = [row({ status })];
    const res = await POST();
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("another user's active subscription does not block this user", async () => {
    subRows = [row({ user_id: "someone-else" })];
    expect((await POST()).status).toBe(200);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("looks up only the signed-in user's rows", async () => {
    await POST();
    const f = Object.fromEntries(filtersSeen[0]);
    expect(f.user_id).toEqual(["user-1"]);
    expect(f.status.sort()).toEqual(["active", "on_hold"]);
  });

  it("fails closed with 503 (no subscription created) if the existing-subscription check errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    subQueryError = { message: "db down" };
    const res = await POST();
    expect(res.status).toBe(503);
    expect(create).not.toHaveBeenCalled();
  });

  it("a signed-out user gets 401 before any lookup", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST()).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("two sequential clicks: the second is refused once the first has activated", async () => {
    expect((await POST()).status).toBe(200);
    subRows = [row({ provider_subscription_id: "sub_NEW1" })]; // webhook has recorded the first
    expect((await POST()).status).toBe(409);
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe("plan choice (monthly | yearly)", () => {
  const req = (body, raw) => new Request("http://localhost/api/checkout/razorpay", { method: "POST", headers: { "Content-Type": "application/json" }, body: raw ?? JSON.stringify(body) });
  const YEARLY = "RAZORPAY_PLAN_ID_YEARLY";
  afterEach(() => { delete process.env[YEARLY]; });

  it("monthly uses RAZORPAY_PLAN_ID with 120 cycles", async () => {
    process.env[YEARLY] = "plan_YEAR";
    expect((await POST(req({ plan: "monthly" }))).status).toBe(200);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ plan_id: "plan_DUMMY", total_count: 120 }));
  });

  it("yearly uses RAZORPAY_PLAN_ID_YEARLY with 10 cycles", async () => {
    process.env[YEARLY] = "plan_YEAR";
    const res = await POST(req({ plan: "yearly" }));
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledWith({ plan_id: "plan_YEAR", customer_notify: 1, total_count: 10, notes: { supabase_user_id: "user-1" } });
  });

  it("yearly with the env var missing: clear 503 'coming soon', no crash, nothing created, auth untouched", async () => {
    const res = await POST(req({ plan: "yearly" }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe("plan_unavailable");
    expect(body.error).toMatch(/coming soon/i);
    expect(create).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("no body, empty body or no plan field means monthly", async () => {
    expect((await POST()).status).toBe(200);
    expect((await POST(req(null, ""))).status).toBe(200);
    expect((await POST(req({}))).status).toBe(200);
    expect(create).toHaveBeenCalledTimes(3);
    for (const c of create.mock.calls) expect(c[0].plan_id).toBe("plan_DUMMY");
  });

  it.each([["weekly"], ["Yearly"], [""], ["constructor"], [7], [["yearly"]], [{ x: 1 }], [false]])(
    "rejects plan %j with 400 and creates nothing",
    async (plan) => {
      const res = await POST(req({ plan }));
      expect(res.status).toBe(400);
      expect((await res.json()).code).toBe("invalid_plan");
      expect(create).not.toHaveBeenCalled();
    }
  );

  it("a plan ID sent by the client is never used", async () => {
    await POST(req({ plan: "monthly", plan_id: "plan_EVIL", planId: "plan_EVIL" }));
    expect(create.mock.calls[0][0].plan_id).toBe("plan_DUMMY");
    expect((await POST(req({ plan: "plan_EVIL" }))).status).toBe(400);
    expect((await POST(req({ plan_id: "plan_EVIL" }))).status).toBe(200); // ignored, defaults to monthly
    expect(create.mock.calls[1][0].plan_id).toBe("plan_DUMMY");
  });

  it("the duplicate-subscription guard applies to both plans", async () => {
    process.env[YEARLY] = "plan_YEAR";
    subRows = [{ user_id: "user-1", provider: "razorpay", provider_subscription_id: "s", status: "active" }];
    expect((await POST(req({ plan: "yearly" }))).status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });
});
