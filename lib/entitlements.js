import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/session";

// True only if the signed-in user has a row in `subscriptions` with status
// "active". Anything else (no row, cancelled, expired, on_hold, not signed in,
// or an error) is treated as not entitled: fail closed.
export async function isEntitledToRituals() {
  const user = await getUser();
  if (!user) return false;

  // Local design preview (no Supabase): controlled by PREVIEW_SUBSCRIPTION.
  if (user.id === "preview") return process.env.PREVIEW_SUBSCRIPTION === "active";

  try {
    const { data, error } = await createClient()
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Entitlement check failed:", error.message);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    console.error("Entitlement check failed:", err?.message);
    return false;
  }
}
