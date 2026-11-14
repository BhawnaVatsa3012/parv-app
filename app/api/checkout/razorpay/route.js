import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { resolvePlan, planIdFor } from "@/lib/plans";

// Body: { plan: "monthly" | "yearly" } (no body or no plan means monthly).
// The plan is checked against an allowlist (lib/plans.js) and its Razorpay plan
// ID comes from the server's environment. A plan ID sent by the client is ignored.
export async function POST(request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Subscriptions aren't set up yet — check back soon." },
      { status: 503 }
    );
  }

  let choice;
  try {
    const body = request ? await request.json() : null;
    choice = body && typeof body === "object" && !Array.isArray(body) && "plan" in body ? body.plan : undefined;
  } catch {
    choice = undefined; // empty or non-JSON body: the default plan
  }
  const plan = choice === undefined || choice === null ? resolvePlan("monthly") : resolvePlan(choice);
  if (!plan) {
    return NextResponse.json({ error: "Choose the monthly or yearly plan.", code: "invalid_plan" }, { status: 400 });
  }
  const planId = planIdFor(plan);
  if (!planId) {
    return NextResponse.json(
      { error: plan.key === "monthly" ? "Subscriptions aren't set up yet — check back soon." : "The yearly plan is coming soon.", code: "plan_unavailable", plan: plan.key },
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
      plan_id: planId,
      customer_notify: 1,
      total_count: plan.totalCount, // ~10 years of cycles (120 monthly, 10 yearly); Razorpay requires a cap
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
