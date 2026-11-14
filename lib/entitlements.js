import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/session";
import { isPaidStatus } from "@/lib/access";

// True only if the signed-in user has a row in `subscriptions` with status
// "active" (a manual owner grant is just such a row). Anything else (no row,
// cancelled, expired, on_hold, not signed in, or an error) is treated as not
// entitled: fail closed. The name is historical; this one check now decides
// every paid feature (stories beyond the free seven, calendar layers, Rituals, Prepare).
export async function isEntitledToRituals() {
  const user = await getUser();
  if (!user) return false;

  // Local design preview (no Supabase): controlled by PREVIEW_SUBSCRIPTION.
  if (user.id === "preview") return isPaidStatus(process.env.PREVIEW_SUBSCRIPTION);

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
    return Boolean(data) && isPaidStatus(data.status);
  } catch (err) {
    console.error("Entitlement check failed:", err?.message);
    return false;
  }
}

export const isEntitled = isEntitledToRituals;
