import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cancelProviderSubscription } from "@/lib/subscriptionCancel";
import { PARV_USER_TABLES, PARV_OPTIONAL_TABLES, SHARED_APP_TABLES, isMissingTable } from "@/lib/accountDeletion";

const fail = (error, status) => NextResponse.json({ error }, { status });

// POST { confirm: "DELETE" }. Order matters: every step that can fail safely
// runs before anything is erased.
//  1. signed-in user, typed confirmation, server config present
//  2. check whether the sign-in is shared with another app (read-only)
//  3. cancel the active subscription at the provider; if that fails, STOP
//  4. delete the caller's rows in the parv_ tables (eq user_id = caller only)
//  5. delete the auth user (unless shared with another app), then sign out
//
// Billing record: public.subscriptions holds only provider ids, status and
// dates (no amounts, card or contact data). Its user_id foreign key is ON
// DELETE CASCADE, so it goes with the auth user. Payment and invoice records
// for tax purposes stay with Razorpay / Dodo Payments, which are the
// systems of record. If the sign-in is kept (shared with another app) the
// row simply stays.
export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in first", 401);

  let body = null;
  try { body = await request.json(); } catch { body = null; }
  if (!body || body.confirm !== "DELETE") return fail('Type DELETE to confirm', 400);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Account deletion unavailable: Supabase service configuration missing");
    return fail("Account deletion isn't available right now — please contact support", 503);
  }

  const admin = createServiceClient();

  // 2. Is this sign-in also used by another app in the shared project?
  let sharedSignIn = false;
  for (const table of SHARED_APP_TABLES) {
    const { count, error } = await admin.from(table).select("user_id", { count: "exact", head: true }).eq("user_id", user.id);
    if (error && !isMissingTable(error)) {
      console.error("Account deletion: shared-app check failed:", table, error.message);
      return fail("Could not delete your account — nothing was changed. Please try again", 500);
    }
    if (!error && count > 0) sharedSignIn = true;
  }

  // 3. Cancel any active subscription first.
  const { data: sub, error: subErr } = await supabase
    .from("subscriptions")
    .select("provider, provider_subscription_id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (subErr) {
    console.error("Account deletion: subscription lookup failed:", subErr.message);
    return fail("Could not delete your account — nothing was changed. Please try again", 500);
  }
  if (sub) {
    try {
      await cancelProviderSubscription(sub, { immediate: true });
    } catch (err) {
      console.error("Account deletion: subscription cancel failed:", err?.message || err);
      return fail("We couldn't cancel your subscription, so your account has NOT been deleted. Please try again or contact support", 502);
    }
  }

  // 4. Delete the caller's Parv rows.
  for (const table of [...PARV_USER_TABLES, ...PARV_OPTIONAL_TABLES]) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    if (error && !(PARV_OPTIONAL_TABLES.includes(table) && isMissingTable(error))) {
      console.error("Account deletion: delete failed:", table, error.message);
      return fail("Part of your data could not be deleted. Your subscription is cancelled; please try again or contact support", 500);
    }
  }

  // 5. Delete the sign-in itself, unless another app depends on it.
  if (!sharedSignIn) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("Account deletion: auth user delete failed:", error.message);
      return fail("Your data was deleted but your sign-in could not be removed. Please contact support", 500);
    }
  }

  try { await supabase.auth.signOut(); } catch (e) {}
  return NextResponse.json({ deleted: true, signInKept: sharedSignIn });
}
