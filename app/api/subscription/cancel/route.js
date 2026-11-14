import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelProviderSubscription } from "@/lib/subscriptionCancel";
import { cancelReasonKeys, CANCEL_COMMENT_MAX } from "@/lib/cancelFeedback";

// Body (optional): { reason?: one of CANCEL_REASONS keys, comment?: string up to 300 chars }.
// The exit survey is best effort: it never blocks or fails the cancellation.
export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const { data: sub, error } = await supabase
    .from("subscriptions")
    .select("provider, provider_subscription_id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !sub) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  try {
    // Cancels at the end of the current billing cycle: the user keeps access
    // they already paid for, then it lapses.
    await cancelProviderSubscription(sub);
  } catch (err) {
    console.error("Subscription cancel failed:", err);
    return NextResponse.json(
      { error: "Could not cancel — please try again or contact support" },
      { status: 500 }
    );
  }

  await saveFeedback(supabase, user.id, request);

  return NextResponse.json({
    cancelled: true,
    note: "Access continues until the end of the current billing period.",
  });
}

async function saveFeedback(supabase, userId, request) {
  try {
    let body = null;
    try { body = await request.json(); } catch { body = null; }
    if (!body || typeof body !== "object" || Array.isArray(body)) return;
    const reason = typeof body.reason === "string" && cancelReasonKeys.includes(body.reason) ? body.reason : null;
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, CANCEL_COMMENT_MAX) || null : null;
    if (!reason && !comment) return;
    // Runs as the signed-in user (RLS: insert own row only). If the table does
    // not exist yet this returns an error, which is deliberately ignored.
    await supabase.from("parv_cancel_feedback").insert({ user_id: userId, reason, comment });
  } catch (err) {
    // Never let the survey affect the cancellation.
  }
}
