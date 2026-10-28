import { NextResponse } from "next/server";
import { getUser } from "@/lib/session";

export const json = (body, status = 200) => NextResponse.json(body, { status });
export const bad = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

export async function requireUser() {
  const user = await getUser();
  return user ? { user } : { res: bad("Sign in first", 401) };
}

export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

export const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const strList = (v, maxItems, maxLen) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string").map((x) => x.trim().slice(0, maxLen)).filter(Boolean).slice(0, maxItems) : null;
