import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createServiceClient } from "@/lib/supabase/server";

const STATUS_MAP = {
  "subscription.active": "active",
  "subscription.renewed": "active",
  "subscription.on_hold": "on_hold",
  "subscription.cancelled": "cancelled",
  "subscription.expired": "expired",
  "subscription.failed": "cancelled",
};

export async function POST(request) {
  if (!process.env.DODO_PAYMENTS_API_KEY || !process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
    // Monetization not configured yet — don't crash, just reject the
    // webhook. Dodo will retry once the real keys are in place.
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode",
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  });

  const rawBody = await request.text();

  let event;
  try {
    event = client.webhooks.unwrap(rawBody, {
      headers: {
        "webhook-id": request.headers.get("webhook-id"),
        "webhook-signature": request.headers.get("webhook-signature"),
        "webhook-timestamp": request.headers.get("webhook-timestamp"),
      },
    });
  } catch (err) {
    console.error("Dodo webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const newStatus = STATUS_MAP[event.type];
  if (!newStatus || !event.data?.subscription_id) {
    // subscription.updated, subscription.plan_changed, and anything else
    // not in our map is acknowledged and ignored.
    return NextResponse.json({ received: true });
  }

  const userId = event.data.metadata?.supabase_user_id;
  if (!userId) {
    console.error("Dodo webhook missing supabase_user_id in metadata:", event.type);
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      provider: "dodo",
      provider_subscription_id: event.data.subscription_id,
      status: newStatus,
      current_period_end: event.data.next_billing_date
        ? new Date(event.data.next_billing_date).toISOString()
        : null,
    },
    { onConflict: "provider,provider_subscription_id" }
  );

  if (error) {
    console.error("Failed to upsert subscription from Dodo webhook:", error);
    return NextResponse.json({ error: "DB write failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
