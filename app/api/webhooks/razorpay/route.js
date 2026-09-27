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

export async function POST(request) {
  // IMPORTANT: signature is computed over the raw body — must read as
  // text, not request.json(), or verification will fail/be bypassable.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  const isValid =
    signature &&
    Razorpay.validateWebhookSignature(
      rawBody,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
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

  const supabase = createServiceClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      provider: "razorpay",
      provider_subscription_id: subscriptionEntity.id,
      status: newStatus,
      current_period_end: subscriptionEntity.current_end
        ? new Date(subscriptionEntity.current_end * 1000).toISOString()
        : null,
    },
    { onConflict: "provider,provider_subscription_id" }
  );

  if (error) {
    console.error("Failed to upsert subscription from Razorpay webhook:", error);
    // Return 500 so Razorpay retries — we want the entitlement update to
    // land eventually rather than silently drop it.
    return NextResponse.json({ error: "DB write failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
