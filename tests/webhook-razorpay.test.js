import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "node:crypto";

// Mock only the Supabase service client with a small in-memory
// "subscriptions" table that honours select / insert / update with the
// eq + or filters the route uses. Razorpay's own signature check is real
// (pure HMAC, no network), so pass/fail is genuinely exercised.
let rows;
const writes = [];
let failWrites = false;
let failWriteCode;
const from = vi.fn((table) => {
  expect(table).toBe("subscriptions");
  const filters = [];
  let orExpr = null;
  let op = null;
  let payload = null;
  const match = (r) =>
    filters.every(([k, v]) => r[k] === v) &&
    (!orExpr ||
      orExpr.split(",").some((c) => {
        const [col, o, ...rest] = c.split(".");
        const val = rest.join(".");
        if (o === "is") return r[col] == null;
        if (o === "lte") return r[col] != null && new Date(r[col]) <= new Date(val);
        throw new Error("unsupported or(): " + c);
      }));
  const run = () => {
    if (failWrites && op !== "select") return { error: { message: "boom", code: failWriteCode } };
    if (op === "insert") {
      if (rows.some((r) => r.provider === payload.provider && r.provider_subscription_id === payload.provider_subscription_id))
        return { error: { code: "23505", message: "duplicate" } };
      writes.push({ op, payload });
      rows.push({ current_period_end: null, last_event_at: null, ...payload });
      return { error: null };
    }
    if (op === "update") {
      writes.push({ op, payload });
      rows.filter(match).forEach((r) => Object.assign(r, payload));
      return { error: null };
    }
    return { data: rows.find(match) ? { ...rows.find(match) } : null, error: null };
  };
  const b = {
    select: () => { op = "select"; return b; },
    insert: (v) => { op = "insert"; payload = v; return b; },
    update: (v) => { op = "update"; payload = v; return b; },
    eq: (k, v) => { filters.push([k, v]); return b; },
    or: (e) => { orExpr = e; return b; },
    maybeSingle: async () => run(),
    then: (res, rej) => Promise.resolve(run()).then(res, rej),
  };
  return b;
});
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

const T0 = 1893456000 - 86400 * 30; // base event time (epoch s)
const event = (name, entity = {}, created_at = T0) => ({
  event: name,
  created_at,
  payload: { subscription: { entity: { id: "sub_TEST1", current_end: 1893456000, notes: { supabase_user_id: "user-1" }, ...entity } } },
});

beforeEach(() => {
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
  rows = [];
  writes.length = 0;
  failWrites = false;
  failWriteCode = undefined;
  from.mockClear();
});
afterEach(() => { delete process.env.RAZORPAY_WEBHOOK_SECRET; });

describe("signature verification", () => {
  it("accepts a correctly signed body", async () => {
    const res = await POST(req(event("subscription.activated")));
    expect(res.status).toBe(200);
    expect(writes).toHaveLength(1);
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
  it("fails closed with 503 when RAZORPAY_WEBHOOK_SECRET is unset: no throw, nothing written", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const res = await POST(req(event("subscription.activated"), { signature: "abc" }));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/not configured/);
    expect(from).not.toHaveBeenCalled();
  });

  it("with the secret unset and no signature header, still 503 (misconfiguration is reported first)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const res = await POST(req(event("subscription.activated"), { signature: null }));
    expect(res.status).toBe(503);
    expect(from).not.toHaveBeenCalled();
  });

  it("an empty-string secret is treated as unset (503)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.RAZORPAY_WEBHOOK_SECRET = "";
    const res = await POST(req(event("subscription.activated")));
    expect(res.status).toBe(503);
    expect(from).not.toHaveBeenCalled();
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
    expect(rows).toEqual([
      {
        user_id: "user-1",
        provider: "razorpay",
        provider_subscription_id: "sub_TEST1",
        status,
        current_period_end: new Date(1893456000 * 1000).toISOString(),
        last_event_at: new Date(T0 * 1000).toISOString(),
      },
    ]);
  });

  it("only ever writes the four statuses the table's check constraint allows", async () => {
    const allowed = new Set(["active", "on_hold", "cancelled", "expired"]);
    for (const [name] of cases) await POST(req(event(name)));
    for (const w of writes) expect(allowed.has(w.payload.status)).toBe(true);
  });

  it("a first event with no current_end creates the row with a null period end", async () => {
    await POST(req(event("subscription.activated", { current_end: null })));
    expect(rows[0].current_period_end).toBeNull();
    expect(rows[0].status).toBe("active");
  });

  it("converts current_end from epoch seconds", async () => {
    await POST(req(event("subscription.charged", { current_end: 1700000000 })));
    expect(rows[0].current_period_end).toBe("2023-11-14T22:13:20.000Z");
  });
});

describe("idempotent replays and ordering", () => {
  const at = (n) => new Date(n * 1000).toISOString();

  it("replaying the same event leaves exactly one row with identical contents", async () => {
    const e = event("subscription.charged");
    expect((await POST(req(e))).status).toBe(200);
    const after1 = JSON.parse(JSON.stringify(rows));
    expect((await POST(req(e))).status).toBe(200);
    expect(rows).toHaveLength(1);
    expect(rows).toEqual(after1);
  });

  it("a stale 'charged' replay after 'cancelled' does NOT flip the row back to active", async () => {
    await POST(req(event("subscription.charged", {}, T0)));
    await POST(req(event("subscription.cancelled", {}, T0 + 100)));
    const res = await POST(req(event("subscription.charged", {}, T0 + 50)));
    expect(res.status).toBe(200); // acknowledged so Razorpay stops retrying
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("cancelled");
    expect(rows[0].last_event_at).toBe(at(T0 + 100));
  });

  it("a stale event after 'completed' (expired) does not reactivate", async () => {
    await POST(req(event("subscription.completed", {}, T0 + 100)));
    await POST(req(event("subscription.activated", {}, T0)));
    expect(rows[0].status).toBe("expired");
  });

  it("any earlier non-active event (halted) cannot overwrite a newer active state", async () => {
    await POST(req(event("subscription.charged", {}, T0 + 100)));
    await POST(req(event("subscription.halted", {}, T0)));
    expect(rows[0].status).toBe("active");
  });

  it("in-order events apply in sequence and advance last_event_at", async () => {
    await POST(req(event("subscription.activated", {}, T0)));
    await POST(req(event("subscription.charged", {}, T0 + 10)));
    await POST(req(event("subscription.cancelled", {}, T0 + 20)));
    expect(rows[0].status).toBe("cancelled");
    expect(rows[0].last_event_at).toBe(at(T0 + 20));
  });

  it("a replay of the cancelled event itself (same timestamp) is idempotent", async () => {
    const e = event("subscription.cancelled", {}, T0 + 20);
    await POST(req(e));
    const after1 = JSON.parse(JSON.stringify(rows));
    await POST(req(e));
    expect(rows).toEqual(after1);
  });

  it("same-second tie: a non-terminal event cannot undo a terminal state", async () => {
    await POST(req(event("subscription.cancelled", {}, T0 + 20)));
    await POST(req(event("subscription.charged", {}, T0 + 20)));
    expect(rows[0].status).toBe("cancelled");
  });

  it("a genuine re-subscription (new Razorpay subscription id) activates even after an older one was cancelled", async () => {
    await POST(req(event("subscription.cancelled", { id: "sub_OLD" }, T0 + 100)));
    // The new subscription's events may carry earlier-or-later timestamps; its row is separate.
    const res = await POST(req(event("subscription.activated", { id: "sub_NEW" }, T0 + 5)));
    expect(res.status).toBe(200);
    expect(rows.map((r) => [r.provider_subscription_id, r.status])).toEqual([
      ["sub_OLD", "cancelled"],
      ["sub_NEW", "active"],
    ]);
  });

  it("legacy rows with a null last_event_at (e.g. before the column existed) accept the first timestamped event", async () => {
    rows.push({ user_id: "user-1", provider: "razorpay", provider_subscription_id: "sub_TEST1", status: "cancelled", current_period_end: null, last_event_at: null });
    await POST(req(event("subscription.charged", {}, T0)));
    expect(rows[0].status).toBe("active");
    expect(rows[0].last_event_at).toBe(at(T0));
  });

  it("never touches a row it was not asked about (e.g. the manual owner grant)", async () => {
    const grant = { user_id: "owner", provider: "razorpay", provider_subscription_id: "manual-owner-grant", status: "active", current_period_end: "2036-12-31T00:00:00.000Z", last_event_at: null };
    rows.push({ ...grant });
    await POST(req(event("subscription.cancelled", {}, T0)));
    expect(rows[0]).toEqual(grant);
  });

  it("an event with no created_at is applied but does not move last_event_at", async () => {
    const e = event("subscription.activated");
    delete e.created_at;
    await POST(req(e));
    expect(rows[0].status).toBe("active");
    expect(rows[0].last_event_at).toBeNull();
  });

  it("the DB write carries its own ordering guard, so a concurrent newer event cannot be overwritten", async () => {
    // Simulate a newer event landing between the route's read and its write.
    rows.push({ user_id: "user-1", provider: "razorpay", provider_subscription_id: "sub_TEST1", status: "active", current_period_end: null, last_event_at: at(T0) });
    const realFrom = from.getMockImplementation();
    let first = true;
    from.mockImplementation((t) => {
      const b = realFrom(t);
      const origSelect = b.select;
      b.select = (...a) => {
        const r = origSelect(...a);
        if (first) { first = false; const row = rows[0]; const m = r.maybeSingle; r.maybeSingle = async () => { const out = await m(); row.status = "cancelled"; row.last_event_at = at(T0 + 100); return out; }; }
        return r;
      };
      return b;
    });
    await POST(req(event("subscription.charged", {}, T0 + 50)));
    expect(rows[0].status).toBe("cancelled");
    expect(rows[0].last_event_at).toBe(at(T0 + 100));
  });

  it("two concurrent first deliveries: the loser of the insert race falls back to a guarded update", async () => {
    await Promise.all([
      POST(req(event("subscription.activated", {}, T0))),
      POST(req(event("subscription.charged", {}, T0 + 5))),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].last_event_at).toBe(at(T0 + 5));
  });
});

describe("cancelled without current_end", () => {
  it("keeps the stored current_period_end (does not overwrite with null) and still marks cancelled", async () => {
    await POST(req(event("subscription.charged", { current_end: 1900000000 }, T0)));
    const res = await POST(req(event("subscription.cancelled", { current_end: null }, T0 + 10)));
    expect(res.status).toBe(200);
    expect(rows[0].status).toBe("cancelled");
    expect(rows[0].current_period_end).toBe(new Date(1900000000 * 1000).toISOString());
    const upd = writes.filter((w) => w.op === "update").pop().payload;
    expect("current_period_end" in upd).toBe(false);
  });

  it("also keeps it when current_end is absent entirely", async () => {
    await POST(req(event("subscription.charged", { current_end: 1900000000 }, T0)));
    const e = event("subscription.cancelled", {}, T0 + 10);
    delete e.payload.subscription.entity.current_end;
    await POST(req(e));
    expect(rows[0].current_period_end).toBe(new Date(1900000000 * 1000).toISOString());
  });

  it("a cancelled event that does carry current_end still updates it", async () => {
    await POST(req(event("subscription.charged", { current_end: 1900000000 }, T0)));
    await POST(req(event("subscription.cancelled", { current_end: 1950000000 }, T0 + 10)));
    expect(rows[0].current_period_end).toBe(new Date(1950000000 * 1000).toISOString());
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
  it("returns 500 so Razorpay retries when the write fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    failWrites = true;
    const res = await POST(req(event("subscription.activated")));
    expect(res.status).toBe(500);
  });
});

describe("malformed input", () => {
  it("a validly signed but non-JSON body returns 400 and writes nothing", async () => {
    const res = await POST(req(null, { raw: "not json" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Invalid JSON/);
    expect(from).not.toHaveBeenCalled();
  });

  it.each(["null", "123", "[]", '"str"'])("a validly signed JSON body of %s (not an object) returns 400", async (raw) => {
    const res = await POST(req(null, { raw }));
    expect(res.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("an invalid body with a BAD signature is still 401 (signature checked first)", async () => {
    const res = await POST(req(null, { raw: "not json", signature: "0".repeat(64) }));
    expect(res.status).toBe(401);
  });
});

describe("deleted account", () => {
  it("acknowledges (200) an event for a user whose account was deleted, instead of retrying forever", async () => {
    failWrites = true;
    failWriteCode = "23503"; // foreign key violation: auth user no longer exists
    const res = await POST(req(event("subscription.cancelled")));
    expect(res.status).toBe(200);
  });
});
