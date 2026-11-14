import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocked: Supabase session client, Supabase service client (in-memory tables,
// records every filter used), and the Razorpay SDK. No network, no real keys.
const getUser = vi.fn();
const signOut = vi.fn();
let subRows;
const sessionFrom = vi.fn(() => {
  const f = [];
  const b = {
    select: () => b,
    eq: (k, v) => { f.push([k, v]); return b; },
    maybeSingle: async () => ({ data: subRows.find((r) => f.every(([k, v]) => r[k] === v)) ?? null, error: null }),
  };
  return b;
});
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ auth: { getUser, signOut }, from: sessionFrom }),
  createServiceClient: () => ({ from: adminFrom, auth: { admin: { deleteUser } } }),
}));

let tables; // name -> rows
let adminErrors; // name -> error object for delete/select
const adminOps = []; // { table, op, filters }
const deleteUser = vi.fn();
const adminFrom = vi.fn((table) => {
  const filters = [];
  let op = "select";
  let opts;
  const run = () => {
    adminOps.push({ table, op, filters: filters.map((x) => [...x]) });
    if (adminErrors[table]) return { error: adminErrors[table], count: null };
    const rows = tables[table];
    if (!rows) return { error: { code: "42P01", message: "missing" }, count: null };
    const hit = (r) => filters.every(([k, v]) => r[k] === v);
    if (op === "delete") { tables[table] = rows.filter((r) => !hit(r)); return { error: null }; }
    return { error: null, count: rows.filter(hit).length };
  };
  const b = {
    select: (_c, o) => { opts = o; return b; },
    delete: () => { op = "delete"; return b; },
    eq: (k, v) => { filters.push([k, v]); return b; },
    then: (res, rej) => Promise.resolve(run()).then(res, rej),
  };
  return b;
});

const cancel = vi.fn();
vi.mock("razorpay", () => ({ default: class { constructor() { this.subscriptions = { cancel }; } } }));
vi.mock("dodopayments", () => ({ default: class {} }));

import { POST } from "@/app/api/account/delete/route";
import { PARV_USER_TABLES, PARV_OPTIONAL_TABLES } from "@/lib/accountDeletion";

const post = (body) => new Request("http://localhost/api/account/delete", { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
const ALL_PARV = [...PARV_USER_TABLES, ...PARV_OPTIONAL_TABLES];

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-key";
  process.env.RAZORPAY_KEY_ID = "rzp_test_dummy";
  process.env.RAZORPAY_KEY_SECRET = "dummy_secret";
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  signOut.mockResolvedValue({});
  deleteUser.mockResolvedValue({ error: null });
  cancel.mockResolvedValue({});
  subRows = [{ user_id: "user-1", provider: "razorpay", provider_subscription_id: "sub_A", status: "active" }];
  tables = {
    parv_profiles: [{ user_id: "user-1" }, { user_id: "user-2" }],
    parv_checklists: [{ user_id: "user-1" }, { user_id: "user-2" }],
    parv_family_notes: [{ user_id: "user-1" }, { user_id: "user-2" }],
    parv_family_rituals: [{ user_id: "user-1" }, { user_id: "user-2" }],
    parv_nudges_sent: [{ user_id: "user-1" }, { user_id: "user-2" }],
    fithit_days: [], fithit_members: [], fithit_settings: [],
  };
  adminErrors = {};
  adminOps.length = 0;
  for (const m of [deleteUser, cancel, signOut, adminFrom, sessionFrom]) m.mockClear();
});
afterEach(() => {
  for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"]) delete process.env[k];
});

describe("auth and confirmation", () => {
  it("rejects a signed-out caller with 401 and touches nothing", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(401);
    expect(adminFrom).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it.each([[undefined], [{}], [{ confirm: "delete" }], [{ confirm: "yes" }]])("rejects a missing or wrong confirmation (%j)", async (body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(adminFrom).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
  });

  it("returns 503 and changes nothing if the service key is not configured", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(503);
    expect(cancel).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });
});

describe("subscription cancel", () => {
  it("aborts when the cancel fails: no rows deleted, auth user kept", async () => {
    cancel.mockRejectedValue(new Error("razorpay down"));
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/NOT been deleted/);
    expect(adminOps.some((o) => o.op === "delete")).toBe(false);
    expect(deleteUser).not.toHaveBeenCalled();
    expect(tables.parv_profiles).toHaveLength(2);
  });

  it("cancels the caller's active subscription (immediately) before deleting", async () => {
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(200);
    expect(cancel).toHaveBeenCalledWith("sub_A", false);
  });

  it("does not call the provider when there is no active subscription", async () => {
    subRows = [];
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(200);
    expect(cancel).not.toHaveBeenCalled();
  });
});

describe("what gets deleted", () => {
  it("deletes every parv_ table for the caller only, then the auth user, then signs out", async () => {
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: true, signInKept: false });
    for (const t of PARV_USER_TABLES) expect(tables[t]).toEqual([{ user_id: "user-2" }]);
    const deletes = adminOps.filter((o) => o.op === "delete");
    expect(deletes.map((o) => o.table).sort()).toEqual([...ALL_PARV].sort());
    for (const d of deletes) expect(d.filters).toEqual([["user_id", "user-1"]]);
    expect(deleteUser).toHaveBeenCalledWith("user-1");
    expect(signOut).toHaveBeenCalled();
  });

  it("never writes to non-parv tables (FitHit, subscriptions)", async () => {
    await POST(post({ confirm: "DELETE" }));
    const written = adminOps.filter((o) => o.op !== "select").map((o) => o.table);
    expect(written.every((t) => t.startsWith("parv_"))).toBe(true);
  });

  it("the optional feedback table not existing yet is fine", async () => {
    // not in `tables`, so the mock reports 42P01 for it
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(200);
  });

  it("a real delete error aborts before the auth user is removed", async () => {
    adminErrors.parv_checklists = { code: "XX000", message: "boom" };
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(500);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("reports when the auth user could not be deleted", async () => {
    deleteUser.mockResolvedValue({ error: { message: "nope" } });
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(500);
  });
});

describe("shared sign-in with another app", () => {
  it("keeps the auth user (so the other app's data survives) but still deletes Parv data", async () => {
    tables.fithit_days = [{ user_id: "user-1" }];
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: true, signInKept: true });
    expect(deleteUser).not.toHaveBeenCalled();
    expect(tables.fithit_days).toEqual([{ user_id: "user-1" }]);
    expect(tables.parv_profiles).toEqual([{ user_id: "user-2" }]);
  });

  it("aborts before any cancel or delete if the shared-app check itself fails", async () => {
    adminErrors.fithit_days = { code: "XX000", message: "boom" };
    const res = await POST(post({ confirm: "DELETE" }));
    expect(res.status).toBe(500);
    expect(cancel).not.toHaveBeenCalled();
    expect(adminOps.some((o) => o.op === "delete")).toBe(false);
  });
});
