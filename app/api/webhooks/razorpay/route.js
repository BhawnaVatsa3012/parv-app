import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServiceClient } from "@/lib/supabase/server";

// Razorpay subscription -> our normalized status
const STATUS_MAP = {
  "subscription.activated": "active",
  "subscription.charged": "active",
  "subscription.completed": "expired",
  "subscription.cancelled": "cancelled",
  "subscription.halted": "on_hold",
  "subscription.pending": "on_hold",
};

const TERMINAL = new Set(["cancelled", "expired"]);
const TABLE_KEY = { provider: "razorpay" };

export async function POST(request) {
  // Fail closed and loudly if the secret is not configured: without it no
  // signature can be verified, so nothing may be trusted or written.
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set; refusing webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // IMPORTANT: signature is computed over the raw body — must read as
  // text, not request.json(), or verification will fail/be bypassable.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  let isValid = false;
  try {
    isValid = Boolean(
      signature && Razorpay.validateWebhookSignature(rawBody, signature, secret)
    );
  } catch {
    isValid = false;
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const event = body.event;
  const subscriptionEntity = body.payload?.subscription?.entity;

  if (!subscriptionEntity) {
    // Not a subscription event (e.g. a plain payment event) — acknowledge
    // and ignore, per Razorpay's "always return 2xx for events you don't handle".
    return NextResponse.json({ received: true });
  }

  const newStatus = STATUS_MAP[event];
  if (!newStatus) {
    return NextResponse.json({ received: true });
  }

  const userId = subscriptionEntity.notes?.supabase_user_id;
  if (!userId) {
    console.error("Razorpay webhook missing supabase_user_id in notes:", event);
    return NextResponse.json({ received: true });
  }

  // The event's own time (epoch seconds), used to ignore stale/out-of-order
  // deliveries. Razorpay retries and reorders webhooks, so arrival order is
  // not event order.
  const eventAt =
    typeof body.created_at === "number" && Number.isFinite(body.created_at) && body.created_at > 0
      ? new Date(body.created_at * 1000).toISOString()
      : null;

  // Only fields we actually know are written. In particular a missing
  // current_end (e.g. on `cancelled`) must not blank the stored period end.
  const fields = { status: newStatus };
  if (subscriptionEntity.current_end) {
    fields.current_period_end = new Date(subscriptionEntity.current_end * 1000).toISOString();
  }
  if (eventAt) fields.last_event_at = eventAt;

  const subId = subscriptionEntity.id;
  const supabase = createServiceClient();

  async function updateExisting() {
    const { data: existing, error: readErr } = await supabase
      .from("subscriptions")
      .select("status, last_event_at")
      .eq("provider", TABLE_KEY.provider)
      .eq("provider_subscription_id", subId)
      .maybeSingle();
    if (readErr) return { error: readErr };
    if (!existing) return { missing: true };

    if (eventAt && existing.last_event_at) {
      const last = new Date(existing.last_event_at).getTime();
      const at = new Date(eventAt).getTime();
      const staleByTime = at < last;
      // Same-second tie: never let a non-terminal event undo a terminal state.
      const tieAgainstTerminal =
        at === last && TERMINAL.has(existing.status) && !TERMINAL.has(newStatus);
      if (staleByTime || tieAgainstTerminal) return { ignored: true };
    }

    // The WHERE clause repeats the ordering guard so a concurrent newer
    // event cannot be overwritten between the read above and this write.
    let q = supabase
      .from("subscriptions")
      .update(fields)
      .eq("provider", TABLE_KEY.provider)
      .eq("provider_subscription_id", subId);
    if (eventAt) q = q.or(`last_event_at.is.null,last_event_at.lte.${eventAt}`);
    const { error } = await q;
    return { error };
  }

  let result = await updateExisting();

  if (result.missing) {
    const { error: insertErr } = await supabase.from("subscriptions").insert({
      user_id: userId,
      provider: TABLE_KEY.provider,
      provider_subscription_id: subId,
      ...fields,
    });
    if (insertErr && insertErr.code === "23505") {
      // Lost a race with a concurrent delivery that created the row first.
      result = await updateExisting();
    } else if (insertErr && insertErr.code === "23503") {
      // The user deleted their account (their auth user no longer exists), so
      // there is nothing to record. Acknowledge so Razorpay stops retrying.
      console.warn("Razorpay webhook for a deleted user; ignoring:", event);
      return NextResponse.json({ received: true });
    } else {
      result = { error: insertErr };
    }
  }

  if (result.error) {
    console.error("Failed to write subscription from Razorpay webhook:", result.error);
    // Return 500 so Razorpay retries — we want the entitlement update to
    // land eventually rather than silently drop it.
    return NextResponse.json({ error: "DB write failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
