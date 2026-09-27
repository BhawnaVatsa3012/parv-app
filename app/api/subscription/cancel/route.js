import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import DodoPayments from "dodopayments";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
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
    if (sub.provider === "razorpay") {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      // Cancels at the end of the current billing cycle — the user keeps
      // access they already paid for, then it lapses. The webhook will
      // flip our stored status to "cancelled" once Razorpay confirms it.
      await razorpay.subscriptions.cancel(sub.provider_subscription_id, {
        cancel_at_cycle_end: true,
      });
    } else if (sub.provider === "dodo") {
      const client = new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode",
      });
      await client.subscriptions.update(sub.provider_subscription_id, {
        cancel_at_next_billing_date: true,
      });
    }

    return NextResponse.json({
      cancelled: true,
      note: "Access continues until the end of the current billing period.",
    });
  } catch (err) {
    console.error("Subscription cancel failed:", err);
    return NextResponse.json(
      { error: "Could not cancel — please try again or contact support" },
      { status: 500 }
    );
  }
}
