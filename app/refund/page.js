import LegalPage, { H, P, UL, TC } from "@/components/LegalPage";

export const metadata = { title: "Refund and Cancellation Policy — Parv" };

export default function Refund() {
  return (
    <LegalPage title="Refunds and Cancellation" updated="10 November 2026">
      <P>This policy explains how to cancel Parv membership and when you can get money back. It is part of our Terms of Service.</P>

      <H>Cancelling</H>
      <UL items={[
        "Open Profile and tap Cancel subscription. You can do this at any time.",
        "Cancelling stops future renewals. You keep member access until the end of the billing period you have already paid for, and are not charged again.",
        "Your Profile then shows the date your access ends. Stories remain free after that.",
        "You can resubscribe from the Membership page whenever you like.",
        "If the Cancel button does not work for you, write to us (details below) and we will cancel it for you.",
      ]} />

      <H>Refunds</H>
      <UL items={[
        <>If you are charged by mistake, charged twice, or charged after you cancelled, tell us within <TC>refund window, e.g. 7 days of the charge</TC> and we will refund the extra charge in full.</>,
        <>For a first payment where you have not used member features, we will refund on request within <TC>refund window for first payment</TC>.</>,
        <>Otherwise, a subscription payment for a period you have already started is <TC>refundable / not refundable / refundable pro rata</TC>.</>,
        "If we end the paid service, we will refund the unused part of any period already paid.",
      ]} />
      <P>Nothing here limits rights you have under Indian consumer law.</P>

      <H>How refunds are paid</H>
      <UL items={[
        "Refunds go back to the original payment method through the same provider that took the payment: Razorpay for India, Dodo Payments for international payments.",
        <>We start an approved refund within <TC>processing time, e.g. 5 business days</TC>. After that, your bank or card issuer usually takes a further 5 to 10 business days to show it. We don’t control that part.</>,
        "Currency conversion and any bank fees on your side are decided by your bank.",
      ]} />

      <H>Payment problems</H>
      <P>If a renewal fails, your membership may go on hold and member features switch off until a payment succeeds. Update the payment method in the app or bank you used to subscribe (for example your UPI or card autopay setup), or contact the payment provider. Your Profile shows the status.</P>

      <H>How to ask</H>
      <UL items={[
        <>Email <TC>contact email</TC> from the address you sign in with, and include the date and amount of the payment (and the payment ID if you have it).</>,
        <>Grievance Officer: <TC>name and email</TC></>,
      ]} />
    </LegalPage>
  );
}
