import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_PLAN_ID) {
    return NextResponse.json(
      { error: "Subscriptions aren't set up yet — check back soon." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  // Never start a second subscription for someone who already has one that
  // is active (this includes the manual owner grant) or in progress
  // (on_hold = payment pending/retrying). Any provider counts. Fail closed
  // if we cannot check, because a wrong "go ahead" means a double charge.
  const { data: existing, error: existingErr } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .in("status", ["active", "on_hold"])
    .limit(1);

  if (existingErr) {
    console.error("Existing subscription check failed:", existingErr.message);
    return NextResponse.json(
      { error: "Could not check your subscription — please try again." },
      { status: 503 }
    );
  }
  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "You already have an active subscription.", code: "already_subscribed" },
      { status: 409 }
    );
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 120, // ~10 years of monthly cycles; Razorpay requires a cap
      notes: { supabase_user_id: user.id },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay subscription create failed:", err);
    return NextResponse.json(
      { error: "Could not create subscription" },
      { status: 500 }
    );
  }
}
