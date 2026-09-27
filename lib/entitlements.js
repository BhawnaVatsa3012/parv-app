import { createClient } from "@/lib/supabase/server";

// Returns true only if the signed-in user has a row in `subscriptions`
// with status "active". Anything else (no row, cancelled, expired,
// on_hold, or not signed in) is treated as not entitled.
export async function isEntitledToRituals() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    // Fail closed: an entitlement check that errors should never
    // accidentally unlock paid content.
    console.error("Entitlement check failed:", error.message);
    return false;
  }

  return Boolean(data);
}
