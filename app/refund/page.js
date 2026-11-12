import LegalPage, { H, P, UL, LEGAL } from "@/components/LegalPage";

export const metadata = { title: "Refund and Cancellation Policy — Parv" };

export default function Refund() {
  return (
    <LegalPage title="Refunds and Cancellation" updated="13 November 2026">
      <P>This policy explains how to cancel Parv membership and when you can get money back. It is part of our Terms of Service. Prices are as shown at checkout.</P>

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
        "Monthly plan: no refund for the current billing month. You can cancel at any time to stop future renewals.",
        "Yearly plan (where offered): you can ask for a refund within 7 days of the first purchase or of a renewal. We do not refund part of a year (no pro-rata refunds), so after those 7 days there is no refund.",
        "If you are charged twice, or charged after you cancelled, tell us and we will correct it and refund the extra charge.",
        "If we end the paid service, we will refund the unused part of any period already paid.",
      ]} />
      <P>Nothing here limits rights you have under Indian consumer law.</P>

      <H>How refunds are paid</H>
      <UL items={[
        "Refunds go back to the original payment method through the same provider that took the payment: Razorpay for India, Dodo Payments for international payments.",
        "Approved refunds are processed within 5 to 7 working days after approval. How soon the money shows in your account after that depends on your bank or card issuer, which we don’t control.",
        "Currency conversion and any bank fees on your side are decided by your bank.",
      ]} />

      <H>Payment problems</H>
      <P>If a renewal fails, your membership may go on hold and member features switch off until a payment succeeds. Update the payment method in the app or bank you used to subscribe (for example your UPI or card autopay setup), or contact the payment provider. Your Profile shows the status.</P>

      <H>How to ask</H>
      <UL items={[
        <>Email {LEGAL.email} from the address you sign in with, and include the date and amount of the payment (and the payment ID if you have it).</>,
        <>Grievance Officer: {LEGAL.grievanceOfficer}, {LEGAL.email}, {LEGAL.address}. We acknowledge complaints within {LEGAL.ackTime} and resolve them within {LEGAL.resolveTime} of receiving them.</>,
      ]} />
    </LegalPage>
  );
}
