import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Both the Supabase session client and the Razorpay SDK are mocked: no network, no keys.
const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser } }) }));

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

  // DOCUMENTED BEHAVIOUR / RISK (see report): the route does not check for an
  // existing active subscription, so a second click or tab creates another one.
  it("KNOWN RISK: two calls create two separate Razorpay subscriptions for the same user", async () => {
    create.mockResolvedValueOnce({ id: "sub_A" }).mockResolvedValueOnce({ id: "sub_B" });
    await POST();
    await POST();
    expect(create).toHaveBeenCalledTimes(2);
  });
});
