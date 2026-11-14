import Razorpay from "razorpay";
import DodoPayments from "dodopayments";

// The one place that cancels a subscription at the payment provider. Used by
// the cancel route and by account deletion. Throws if the provider call fails.
//
// Default: cancel at the end of the current billing cycle (the member keeps the
// access they paid for). `immediate: true` is used by account deletion, where
// the account is going away: Razorpay is cancelled right now. Dodo's call is
// the same either way (cancel at next billing date), since that is the only
// behaviour already wired up and verified for Dodo here.
export async function cancelProviderSubscription(sub, { immediate = false } = {}) {
  if (sub.provider === "razorpay") {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    // The webhook flips our stored status to "cancelled" once Razorpay confirms it.
    if (immediate) await razorpay.subscriptions.cancel(sub.provider_subscription_id, false);
    else await razorpay.subscriptions.cancel(sub.provider_subscription_id, { cancel_at_cycle_end: true });
  } else if (sub.provider === "dodo") {
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode",
    });
    await client.subscriptions.update(sub.provider_subscription_id, { cancel_at_next_billing_date: true });
  } else {
    throw new Error("Unknown subscription provider");
  }
}
