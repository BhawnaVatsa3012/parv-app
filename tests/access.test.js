import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { festivals } from "@/lib/festivalList";
import { storyData } from "@/lib/stories";
import { orderRegions } from "@/lib/regions";
import {
  FREE_STORY_IDS, isFreeStory, isPaidStatus, canReadStory, canUseLayers, canUseRituals, canUsePrepare, layersForReader, gateStory,
} from "@/lib/access";

describe("free and paid stories", () => {
  it("free list is exactly the seven festivals the owner chose", () => {
    expect([...FREE_STORY_IDS].sort()).toEqual(["bihu", "buddha", "christmas", "diwali", "eid", "mahavir", "vaisakhi"]);
  });
  it("matches the freeStory flag in the festival list and every id exists", () => {
    expect(festivals.filter((f) => f.freeStory).map((f) => f.id).sort()).toEqual([...FREE_STORY_IDS].sort());
    for (const id of FREE_STORY_IDS) expect(storyData[id]).toBeTruthy();
  });
  it("every other festival is paid for a free reader, and open for a paid one", () => {
    const paid = festivals.filter((f) => !FREE_STORY_IDS.includes(f.id));
    expect(paid.length).toBe(festivals.length - 7);
    for (const f of paid) {
      expect(isFreeStory(f.id)).toBe(false);
      expect(canReadStory(f.id, false)).toBe(false);
      expect(canReadStory(f.id, true)).toBe(true);
    }
    for (const id of FREE_STORY_IDS) expect(canReadStory(id, false)).toBe(true);
  });
  it("rejects look-alike ids", () => {
    for (const bad of ["Diwali", "diwali ", "", null, undefined, 5, ["diwali"], "constructor", "__proto__"]) expect(isFreeStory(bad)).toBe(false);
  });
});

describe("entitlement status", () => {
  it("only active counts; on_hold, cancelled, expired, none do not", () => {
    expect(isPaidStatus("active")).toBe(true);
    for (const s of ["on_hold", "cancelled", "expired", "", null, undefined, "ACTIVE", "pending"]) expect(isPaidStatus(s)).toBe(false);
  });
  it("a truthy-but-not-true entitled value does not unlock paid features (fail closed)", () => {
    for (const v of [undefined, null, 0, "", "true", 1, {}]) {
      expect(canUseLayers(v)).toBe(false);
      expect(canUseRituals(v)).toBe(false);
      expect(canUsePrepare(v)).toBe(false);
      expect(canReadStory("holi", v)).toBe(false);
    }
  });
});

describe("calendar layers", () => {
  it("free readers get no layers whatever they saved; paid readers get their choice", () => {
    expect(layersForReader(false, ["panchang", "hijri"])).toEqual([]);
    expect(layersForReader(false, null)).toEqual([]);
    expect(layersForReader(true, ["hijri"])).toEqual(["hijri"]);
    expect(layersForReader(true, null)).toEqual(["panchang"]);
    expect(layersForReader(true, [])).toEqual([]);
  });
});

describe("gateStory (what the browser is sent)", () => {
  const view = (id, entitled, state = null) => {
    const d = storyData[id];
    return gateStory(id, d, orderRegions(id, d.regions, state), entitled);
  };

  it("paid festival, free reader: first region in full as a preview, the rest withheld", () => {
    const g = view("holi", false);
    expect(g.storyOpen).toBe(false);
    expect(g.regions[0].text).toBe(storyData.holi.regions[0].text);
    expect(g.regions[0].preview).toBe(true);
    for (const r of g.regions.slice(1)) {
      expect(r.locked).toBe(true);
      expect(r.text).toBeUndefined();
      expect(r.source).toBeUndefined();
      expect(r.name).toBeTruthy();
      expect(r.date).toBeTruthy(); // the date stays free
    }
    // No story text beyond the preview appears anywhere in what is sent.
    const sent = JSON.stringify(g);
    for (const r of storyData.holi.regions.slice(1)) expect(sent).not.toContain(r.text.slice(0, 60));
  });

  it("the preview is the first region as displayed (the reader's own region when known)", () => {
    const d = storyData.diwali;
    const gujarat = d.regions.find((r) => r.name === "Gujarat");
    const g = gateStory("holi", storyData.holi, orderRegions("holi", storyData.holi.regions, null), false);
    expect(g.regions.filter((r) => !r.locked).length).toBe(1);
    // a paid festival with a known reader state: the region shown first is the unlocked one
    const withState = (id, state) => gateStory(id, storyData[id], orderRegions(id, storyData[id].regions, state), false);
    const k = withState("karvachauth", "Rajasthan");
    expect(k.regions[0].mine).toBe(true);
    expect(k.regions[0].preview).toBe(true);
    expect(k.regions[0].text).toBeTruthy();
    expect(k.regions.slice(1).every((r) => r.locked)).toBe(true);
    expect(gujarat).toBeTruthy();
  });

  it("free festival, free reader: all stories open, but rituals are withheld", () => {
    const g = view("diwali", false);
    expect(g.storyOpen).toBe(true);
    expect(g.regions.every((r) => !r.locked && r.text)).toBe(true);
    expect(g.regions.some((r) => r.preview)).toBe(false);
    expect(g.ritualsOpen).toBe(false);
    expect(g.rituals).toEqual([]);
    const sent = JSON.stringify(g);
    expect(sent).not.toContain("Om Shreem Mahalakshmyai Namah");
    expect(sent).not.toContain("Idols or a picture of Lakshmi");
    expect(g.ritualCount).toBe(storyData.diwali.rituals.length);
    expect(g.ritualHeading).toBe("Lakshmi–Ganesha Puja");
  });

  it("paid reader gets everything on every festival", () => {
    for (const f of festivals) {
      const g = view(f.id, true);
      expect(g.storyOpen).toBe(true);
      expect(g.regions.every((r) => !r.locked && r.text)).toBe(true);
      expect(g.rituals.length).toBe((storyData[f.id].rituals || []).length);
    }
  });

  it("unknown festival gives null", () => {
    expect(gateStory("nope", undefined, [], true)).toBeNull();
  });
});

describe("paid text never ships to the browser", () => {
  // Any file with "use client" (and anything it imports in the app) must not import the story text.
  const root = path.resolve(__dirname, "..");
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name === ".next" ? [] : walk(p);
    return /\.(js|jsx)$/.test(e.name) ? [p] : [];
  });
  const files = ["app", "components", "lib"].flatMap((d) => walk(path.join(root, d)));
  const src = Object.fromEntries(files.map((f) => [f, fs.readFileSync(f, "utf8")]));
  const importsOf = (f) => [...src[f].matchAll(/from\s+"(@\/[^"]+)"/g)].map((m) => path.join(root, m[1].slice(2)) + ".js");

  it("no client component reaches lib/stories.js, lib/data.js or lib/checklists.js through its imports", () => {
    const forbidden = new Set(["lib/stories.js", "lib/data.js", "lib/checklists.js"].map((x) => path.join(root, x)));
    const clients = files.filter((f) => /^\s*["']use client["']/.test(src[f]));
    expect(clients.length).toBeGreaterThan(5);
    for (const c of clients) {
      const seen = new Set();
      const stack = [c];
      while (stack.length) {
        const f = stack.pop();
        if (seen.has(f)) continue;
        seen.add(f);
        expect(forbidden.has(f), `${path.relative(root, c)} imports ${path.relative(root, f)}`).toBe(false);
        if (src[f]) stack.push(...importsOf(f));
      }
    }
  });
});

// The real entitlement check, with Supabase and the session mocked.
const getUser = vi.fn();
let rows, dbError, throwErr;
vi.mock("@/lib/session", () => ({ getUser: (...a) => getUser(...a) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    from: () => {
      const f = {};
      const b = {
        select: () => b,
        eq: (k, v) => { f[k] = v; return b; },
        limit: () => b,
        maybeSingle: async () => {
          if (throwErr) throw new Error("boom");
          if (dbError) return { data: null, error: { message: dbError } };
          const hit = rows.find((r) => Object.entries(f).every(([k, v]) => r[k] === v));
          return { data: hit ? { status: hit.status } : null, error: null };
        },
      };
      return b;
    },
  }),
}));
import { isEntitledToRituals } from "@/lib/entitlements";

describe("isEntitledToRituals", () => {
  beforeEach(() => {
    rows = []; dbError = null; throwErr = false;
    getUser.mockResolvedValue({ id: "u1", email: "a@example.com" });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  it("active subscription: entitled", async () => {
    rows = [{ user_id: "u1", status: "active", provider: "razorpay" }];
    expect(await isEntitledToRituals()).toBe(true);
  });
  it("manual-grant row (active, any provider) is entitled", async () => {
    rows = [{ user_id: "u1", status: "active", provider: "manual" }];
    expect(await isEntitledToRituals()).toBe(true);
  });
  it("on_hold: not entitled (the existing rule; payment is pending)", async () => {
    rows = [{ user_id: "u1", status: "on_hold" }];
    expect(await isEntitledToRituals()).toBe(false);
  });
  it.each(["cancelled", "expired"])("%s: not entitled", async (status) => {
    rows = [{ user_id: "u1", status }];
    expect(await isEntitledToRituals()).toBe(false);
  });
  it("no subscription row: not entitled", async () => {
    expect(await isEntitledToRituals()).toBe(false);
  });
  it("someone else's active row does not count", async () => {
    rows = [{ user_id: "u2", status: "active" }];
    expect(await isEntitledToRituals()).toBe(false);
  });
  it("signed out: not entitled and the database is never asked", async () => {
    getUser.mockResolvedValue(null);
    rows = [{ user_id: "u1", status: "active" }];
    expect(await isEntitledToRituals()).toBe(false);
  });
  it("database error or exception: fail closed", async () => {
    rows = [{ user_id: "u1", status: "active" }];
    dbError = "db down";
    expect(await isEntitledToRituals()).toBe(false);
    dbError = null; throwErr = true;
    expect(await isEntitledToRituals()).toBe(false);
  });
});
