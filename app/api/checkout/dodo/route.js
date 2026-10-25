import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  if (!process.env.DODO_PAYMENTS_API_KEY || !process.env.DODO_PRODUCT_ID) {
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

  // Which festival the user came from, so the success screen can link back to it.
  let from = "";
  try {
    const body = await request.json();
    if (typeof body?.from === "string" && /^[a-z0-9-]{1,40}$/.test(body.from)) from = body.from;
  } catch {}

  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode",
  });

  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: process.env.DODO_PRODUCT_ID, quantity: 1 }],
      customer: { email: user.email },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?status=success&via=dodo${from ? `&from=${from}` : ""}`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ checkoutUrl: session.checkout_url });
  } catch (err) {
    console.error("Dodo checkout session create failed:", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
