import LegalPage, { H, P, UL, TC } from "@/components/LegalPage";

export const metadata = { title: "Terms of Service — Parv" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="10 November 2026">
      <P>These terms are the agreement between you and <TC>legal entity name and registered address</TC> (“Parv”, “we”, “us”). By signing in or using Parv you agree to them. If you don’t agree, please don’t use the app.</P>

      <H>1. What Parv is</H>
      <P>Parv is an app of festival stories, with regional variations, and (for members) rituals: samagri lists, step-by-step puja, mantras, attire, preparation checklists and reminders. Stories we mark as free are free. Rituals and other features we mark as members-only need a paid subscription.</P>
      <P>Parv is for learning and general cultural information. Traditions differ from family to family and region to region. What we publish is one respectful account of them, not the only correct one, and not religious, medical, legal or safety advice.</P>

      <H>2. Your account</H>
      <UL items={[
        "You sign in with your email address. We email you a one-time link; there is no password.",
        "You must give a working email address that is yours, and keep access to it. Anyone who can open the sign-in link can use your account.",
        "You must be old enough to form a binding contract where you live. If you are under 18, please use Parv with a parent or guardian, who must make any purchase.",
        "Tell us if you think someone else has used your account.",
      ]} />

      <H>3. Membership and payments</H>
      <UL items={[
        "Membership is a monthly subscription that renews automatically until you cancel. The price and currency are shown on the Membership page before you pay.",
        "Payments from India are processed by Razorpay. Payments from other countries are processed by Dodo Payments. You pay through their checkout, under their terms. Parv does not see or store your card, UPI or bank details.",
        "You can cancel from Profile at any time. Cancelling stops future renewals; you keep member access until the end of the period you have already paid for.",
        "If a renewal payment fails, your membership may be put on hold and member features switch off until payment succeeds. Free stories stay available.",
        "Taxes, where they apply, are shown at checkout or by the payment provider.",
        "Our Refund and Cancellation Policy forms part of these terms.",
      ]} />
      <P>We may change prices or features. We will give notice before a price change affects your next renewal, and you can cancel before it applies.</P>

      <H>4. Family notes and AI adaptation</H>
      <P>Members can add notes about how their own family celebrates and ask Parv to adapt a ritual to match. When you do, the relevant ritual text, your notes, and your city, state or country, community and home languages (if you set them) are sent to an AI service (Anthropic’s Claude) to draft a version for you. We do not send your name or email address.</P>
      <UL items={[
        "The draft is a proposal. Nothing is saved until you approve it, and you can go back to Parv’s original version at any time.",
        "AI can make mistakes. Please read the draft and use your own judgement, and your family’s elders, before relying on it.",
        "Only write what you are comfortable sharing, and don’t put other people’s personal details in your notes.",
      ]} />

      <H>5. Your content</H>
      <P>Your notes and details stay yours. You give us permission to store them and use them only to run Parv for you, including sending them to the AI service when you ask for an adaptation. We don’t publish them or show them to other users.</P>

      <H>6. Our content</H>
      <P>The stories, text, translations, design, illustrations and code in Parv belong to us or our licensors and are protected by law. You may use them for your own personal, non-commercial use. Please don’t copy, scrape, resell or republish them without our written permission.</P>

      <H>7. Using Parv properly</H>
      <UL items={[
        "Don’t try to break, overload or get around the app, its sign-in or its paywall.",
        "Don’t share your member access with others or resell it.",
        "Don’t use Parv to harass anyone or to post unlawful material in your notes.",
      ]} />
      <P>We may suspend or close an account that breaks these rules.</P>

      <H>8. Dates, times and accuracy</H>
      <P>Festival dates and timings are calculated from traditional rules and astronomical data for the city you choose. They can differ by a day or by minutes between regions, calendars and almanacs. Please confirm with your local temple, priest or family calendar for anything important.</P>

      <H>9. Availability and changes</H>
      <P>We try to keep Parv running but cannot promise it will always be available or error-free. We may change, add or remove features and content. If we end the paid service, we will tell members in advance and handle any prepaid period fairly.</P>

      <H>10. Our responsibility</H>
      <P>Parv is provided “as is”. To the extent the law allows, we are not liable for indirect or consequential loss, and our total liability to you for any claim is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits rights you have under Indian consumer law that cannot be limited.</P>

      <H>11. Ending your account</H>
      <P>You can stop using Parv at any time. To have your account and data deleted, contact us (see Contact below). We may close accounts as described in section 7. Sections that by nature continue (for example, content ownership and liability) continue after that.</P>

      <H>12. Changes to these terms</H>
      <P>We may update these terms. We will change the date above and, for material changes, tell you in the app or by email. Using Parv after a change means you accept it.</P>

      <H>13. Governing law and disputes</H>
      <P>These terms are governed by the laws of India. Courts at <TC>city / jurisdiction</TC> have jurisdiction, without affecting any right you have to go to a consumer forum where you live. Please write to us first so we can try to fix the problem.</P>

      <H>14. Contact and grievances</H>
      <UL items={[
        <>Support email: <TC>contact email</TC></>,
        <>Grievance Officer: <TC>name</TC>, <TC>email</TC>, <TC>postal address</TC></>,
        <>We aim to acknowledge complaints within <TC>acknowledgement time, e.g. 48 hours</TC> and resolve them within <TC>resolution time, e.g. 30 days</TC>.</>,
      ]} />
    </LegalPage>
  );
}
