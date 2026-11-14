import { describe, it, expect, vi, beforeEach } from "vitest";

const getUser = vi.fn();
const inserts = [];
let insertResult;
let insertThrows;
const from = vi.fn((table) => {
  if (table === "subscriptions") {
    const b = { select: () => b, eq: () => b, maybeSingle: async () => ({ data: { provider: "razorpay", provider_subscription_id: "sub_A", status: "active" }, error: null }) };
    return b;
  }
  return { insert: async (row) => { if (insertThrows) throw new Error("boom"); inserts.push({ table, row }); return insertResult; } };
});
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser }, from }) }));
const cancel = vi.fn();
vi.mock("razorpay", () => ({ default: class { constructor() { this.subscriptions = { cancel }; } } }));
vi.mock("dodopayments", () => ({ default: class {} }));

import { POST } from "@/app/api/subscription/cancel/route";

const post = (body, raw) => new Request("http://localhost/api/subscription/cancel", { method: "POST", body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });

beforeEach(() => {
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  cancel.mockResolvedValue({});
  inserts.length = 0;
  insertResult = { error: null };
  insertThrows = false;
  cancel.mockClear();
});

describe("cancel with exit survey", () => {
  it("still cancels at cycle end exactly as before", async () => {
    const res = await POST(post({}));
    expect(res.status).toBe(200);
    expect(cancel).toHaveBeenCalledWith("sub_A", { cancel_at_cycle_end: true });
  });

  it("stores the caller's own answer", async () => {
    await POST(post({ reason: "too_expensive", comment: "  pricey  ", user_id: "user-2" }));
    expect(inserts).toEqual([{ table: "parv_cancel_feedback", row: { user_id: "user-1", reason: "too_expensive", comment: "pricey" } }]);
  });

  it("caps the comment at 300 characters and drops an unknown reason", async () => {
    await POST(post({ reason: "hacked", comment: "x".repeat(500) }));
    expect(inserts[0].row.reason).toBeNull();
    expect(inserts[0].row.comment).toHaveLength(300);
  });

  it("skipping the survey (no body, empty body, empty answer) stores nothing and cancels", async () => {
    for (const r of [post(undefined), post({}), post({ reason: "", comment: "  " }), post(undefined, "not json")]) {
      expect((await POST(r)).status).toBe(200);
    }
    expect(inserts).toHaveLength(0);
    expect(cancel).toHaveBeenCalledTimes(4);
  });

  it("cancellation succeeds even if the feedback table does not exist (error result)", async () => {
    insertResult = { error: { code: "PGRST205", message: "no table" } };
    const res = await POST(post({ reason: "other" }));
    expect(res.status).toBe(200);
    expect((await res.json()).cancelled).toBe(true);
  });

  it("cancellation succeeds even if the insert throws", async () => {
    insertThrows = true;
    expect((await POST(post({ reason: "other" }))).status).toBe(200);
  });

  it("a failed cancel returns 500 and stores no feedback", async () => {
    cancel.mockRejectedValue(new Error("down"));
    const res = await POST(post({ reason: "other" }));
    expect(res.status).toBe(500);
    expect(inserts).toHaveLength(0);
  });

  it("rejects a signed-out caller", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(post({ reason: "other" }))).status).toBe(401);
    expect(cancel).not.toHaveBeenCalled();
  });
});
