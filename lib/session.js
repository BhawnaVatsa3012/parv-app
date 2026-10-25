import { createClient } from "@/lib/supabase/server";

const configured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Local design previews run without Supabase; they get a stand-in user so
// every screen can be rendered. Never active on Vercel (env vars are set).
const PREVIEW_USER = { id: "preview", email: "ananya.sharma@example.com" };
const isPreview = () => !configured() && process.env.NODE_ENV === "development";

export async function getUser() {
  if (isPreview()) return PREVIEW_USER;
  if (!configured()) return null;
  try {
    const { data } = await createClient().auth.getUser();
    return data?.user ?? null;
  } catch (e) {
    console.error("getUser failed:", e);
    return null;
  }
}

// Latest subscription row for the signed-in user, or null.
export async function getSubscription(userId) {
  if (isPreview()) {
    const s = process.env.PREVIEW_SUBSCRIPTION; // "active" | "cancelled" | unset
    return s ? { provider: "razorpay", status: s, current_period_end: "2026-11-26T00:00:00Z" } : null;
  }
  if (!configured() || !userId) return null;
  const { data } = await createClient()
    .from("subscriptions")
    .select("provider, status, current_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
