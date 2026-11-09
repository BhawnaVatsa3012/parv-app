import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "node:crypto";

// Mock only the Supabase service client. Razorpay's own signature check is
// real (pure HMAC, no network), so pass/fail is genuinely exercised.
const upsert = vi.fn();
const from = vi.fn(() => ({ upsert }));
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: () => ({ from }) }));

import { POST } from "@/app/api/webhooks/razorpay/route";

const SECRET = "test_webhook_secret_not_real";
const sign = (body, secret = SECRET) => crypto.createHmac("sha256", secret).update(body).digest("hex");

function req(bodyObj, { signature, raw } = {}) {
  const body = raw ?? JSON.stringify(bodyObj);
  const headers = {};
  const sig = signature === undefined ? sign(body) : signature;
  if (sig !== null) headers["x-razorpay-signature"] = sig;
  return new Request("http://localhost/api/webhooks/razorpay", { method: "POST", body, headers });
}

const event = (name, entity = {}) => ({
  event: name,
  payload: { subscription: { entity: { id: "sub_TEST1", current_end: 1893456000, notes: { supabase_user_id: "user-1" }, ...entity } } },
});

beforeEach(() => {
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
  upsert.mockResolvedValue({ error: null });
  from.mockClear();
});
afterEach(() => { delete process.env.RAZORPAY_WEBHOOK_SECRET; });

describe("signature verification", () => {
  it("accepts a correctly signed body", async () => {
    const res = await POST(req(event("subscription.activated")));
    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("rejects a wrong signature with 401 and writes nothing", async () => {
    const res = await POST(req(event("subscription.activated"), { signature: "0".repeat(64) }));
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects a body signed with a different secret", async () => {
    const body = JSON.stringify(event("subscription.activated"));
    const res = await POST(req(null, { raw: body, signature: sign(body, "other_secret") }));
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects a body that was changed after signing", async () => {
    const original = JSON.stringify(event("subscription.cancelled"));
    const tampered = JSON.stringify(event("subscription.activated"));
    const res = await POST(req(null, { raw: tampered, signature: sign(original) }));
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects a missing signature header with 401", async () => {
    const res = await POST(req(event("subscription.activated"), { signature: null }));
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an empty signature header with 401", async () => {
    const res = await POST(req(event("subscription.activated"), { signature: "" }));
    expect(res.status).toBe(401);
  });
});

describe("missing environment", () => {
  it("fails closed when RAZORPAY_WEBHOOK_SECRET is unset: never writes (currently throws, i.e. a 500 in Next)", async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    await expect(POST(req(event("subscription.activated"), { signature: "abc" }))).rejects.toThrow(/Invalid Parameters/);
    expect(from).not.toHaveBeenCalled();
  });

  it("with the secret unset but no signature header, answers 401 (short-circuits before the SDK)", async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const res = await POST(req(event("subscription.activated"), { signature: null }));
    expect(res.status).toBe(401);
  });
});

describe("status mapping and the subscription row", () => {
  const cases = [
    ["subscription.activated", "active"],
    ["subscription.charged", "active"],
    ["subscription.cancelled", "cancelled"],
    ["subscription.completed", "expired"],
    ["subscription.halted", "on_hold"],
    ["subscription.pending", "on_hold"],
  ];
  it.each(cases)("%s writes status %s", async (name, status) => {
    const res = await POST(req(event(name)));
    expect(res.status).toBe(200);
    expect(from).toHaveBeenCalledWith("subscriptions");
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        provider: "razorpay",
        provider_subscription_id: "sub_TEST1",
        status,
        current_period_end: new Date(1893456000 * 1000).toISOString(),
      },
      { onConflict: "provider,provider_subscription_id" }
    );
  });

  it("only ever writes the four statuses the table's check constraint allows", async () => {
    const allowed = new Set(["active", "on_hold", "cancelled", "expired"]);
    for (const [name] of cases) await POST(req(event(name)));
    for (const [row] of upsert.mock.calls) expect(allowed.has(row.status)).toBe(true);
  });

  it("stores a null period end when Razorpay sends no current_end", async () => {
    await POST(req(event("subscription.activated", { current_end: null })));
    expect(upsert.mock.calls[0][0].current_period_end).toBeNull();
  });

  it("converts current_end from epoch seconds", async () => {
    await POST(req(event("subscription.charged", { current_end: 1700000000 })));
    expect(upsert.mock.calls[0][0].current_period_end).toBe("2023-11-14T22:13:20.000Z");
  });
});

describe("idempotent replays", () => {
  it("replaying the same event re-sends an identical upsert keyed on provider+subscription id (no duplicate rows)", async () => {
    const e = event("subscription.charged");
    expect((await POST(req(e))).status).toBe(200);
    expect((await POST(req(e))).status).toBe(200);
    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert.mock.calls[0]).toEqual(upsert.mock.calls[1]);
    expect(upsert.mock.calls[0][1]).toEqual({ onConflict: "provider,provider_subscription_id" });
  });

  // DOCUMENTED BEHAVIOUR / RISK (see report): no ordering guard. A late replay
  // of an older event overwrites a newer status. Not changed here.
  it("KNOWN RISK: a stale 'charged' replay after 'cancelled' writes 'active' again", async () => {
    await POST(req(event("subscription.cancelled")));
    await POST(req(event("subscription.charged")));
    expect(upsert.mock.calls.map(([r]) => r.status)).toEqual(["cancelled", "active"]);
  });
});

describe("events that are ignored", () => {
  it.each(["subscription.authenticated", "subscription.paused", "subscription.resumed", "subscription.updated", "subscription.made.up"])(
    "unknown subscription event %s is acknowledged (200) and writes nothing",
    async (name) => {
      const res = await POST(req(event(name)));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ received: true });
      expect(from).not.toHaveBeenCalled();
    }
  );

  it("a payment event with no subscription entity is acknowledged and ignored", async () => {
    const res = await POST(req({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } }));
    expect(res.status).toBe(200);
    expect(from).not.toHaveBeenCalled();
  });

  it("a mapped event with no supabase_user_id note is acknowledged, logged, and writes nothing", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(req(event("subscription.activated", { notes: {} })));
    expect(res.status).toBe(200);
    expect(from).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it("a mapped event with notes missing entirely is also ignored safely", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(req(event("subscription.activated", { notes: undefined })));
    expect(res.status).toBe(200);
    expect(from).not.toHaveBeenCalled();
  });
});

describe("database failure", () => {
  it("returns 500 so Razorpay retries when the upsert fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    upsert.mockResolvedValue({ error: { message: "boom" } });
    const res = await POST(req(event("subscription.activated")));
    expect(res.status).toBe(500);
  });
});

describe("malformed input", () => {
  it("a validly signed but non-JSON body currently throws (a 500 in Next); nothing is written", async () => {
    const raw = "not json";
    await expect(POST(req(null, { raw }))).rejects.toThrow();
    expect(from).not.toHaveBeenCalled();
  });
});
