import LegalPage, { H, P, UL, TC } from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy — Parv" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="10 November 2026">
      <P><TC>legal entity name and registered address</TC> (“Parv”, “we”) runs the Parv app. This page explains what we collect, why, who helps us handle it, and the choices you have. We try to collect only what the app needs.</P>

      <H>What we collect</H>
      <UL items={[
        "Email address: to sign you in and to contact you about your account.",
        "Name (optional): to greet you. If you don't set one, the app shows a name made from your email.",
        "City: you pick a city from our list (or let your device suggest the nearest one). We store the city, its state and country, its coordinates and time zone, to show festival dates and timings for that place. We do not save your device's exact position.",
        "Community or tradition and languages spoken at home (optional): to put your region's stories first and to adapt rituals.",
        "Festivals you follow, reminder settings, and the preparation checklists you tick or add.",
        "Family notes you write, and the adapted rituals you approve (members only).",
        "Subscription details: which payment provider you used, the provider's subscription reference, your status (active, cancelled, on hold or expired) and the date your period ends.",
        "Technical data: like most websites, our hosting provider sees your IP address and basic request details. We use your approximate country, read from the request, only to suggest India or international pricing; we don't store it.",
      ]} />
      <P>We do not collect your card, UPI or bank details. You enter those with Razorpay or Dodo Payments. We do not run advertising or analytics trackers in the app.</P>

      <H>What is stored on your device</H>
      <UL items={[
        "A sign-in cookie, so you stay signed in.",
        "Small settings saved in your browser: your language choice (English or English + Hindi), your billing region choice, and whether you have seen the intro. These do not leave your device.",
      ]} />

      <H>Why we use it</H>
      <UL items={[
        "To run the app: sign you in, show your city's dates, remember your checklists and settings.",
        "To provide membership: take payment, switch member features on and off, and let you cancel.",
        "To send emails you ask for: the sign-in link, and festival reminders if you turn them on (members only). Each reminder has a note on how to switch it off in Profile.",
        "To adapt rituals to your family, when you ask for it (see the next section).",
        "To keep the service secure and meet legal duties.",
      ]} />
      <P>We do not sell your data and we do not use it for advertising.</P>

      <H>AI (Anthropic)</H>
      <P>Only when a member taps to adapt a ritual, we send Anthropic (the maker of Claude) the festival and ritual text, the family notes for that ritual, and your city, state or country, community and home languages if set. We do not send your name or email address. Anthropic returns a draft, which you can accept or ignore. Nothing is saved to your account unless you approve it.</P>
      <P>Anthropic processes this data under its own terms and privacy policy. <TC>confirm Anthropic data-retention and training terms that apply to the API account</TC></P>

      <H>Who else handles your data</H>
      <UL items={[
        <>Supabase: our database and sign-in service, where your account and data are stored. Region: <TC>Supabase project region</TC>.</>,
        "Vercel: hosts the app.",
        "Razorpay (India) and Dodo Payments (international): process payments. Razorpay receives a reference to your Parv account with the subscription; Dodo receives your email address and the same reference.",
        "Resend: sends reminder emails to members who turn them on.",
        "Anthropic: AI adaptation, as above.",
      ]} />
      <P>These providers process data for us and under their own terms. Some are based outside India, so your data may be handled in other countries. We may also share data if the law requires it.</P>

      <H>How long we keep it</H>
      <P>We keep your data while your account exists. Family notes, adapted rituals and family details are kept until you delete them. We keep payment and subscription records as long as needed for accounting, tax and dispute purposes. <TC>retention period for subscription records, and for deleted accounts</TC></P>

      <H>Your choices and rights</H>
      <UL items={[
        "Change your name, city, tradition, languages, followed festivals and reminders any time in Profile.",
        "Delete a single family note from the ritual it belongs to, or go back to Parv's original version of a ritual.",
        "Delete everything family-related at once: in Profile, open Our family's tradition and choose Delete all family details and notes. This removes all your family notes, all adapted rituals, and your saved community and languages.",
        "Turn reminder emails off in Profile.",
        "Cancel your subscription in Profile.",
        "Ask us to give you a copy of your data, correct it, or delete your account and the data in it. The app has no account-deletion button yet, so email us and we will do it.",
      ]} />
      <P>If you are in India, you have rights under the Digital Personal Data Protection Act, 2023, including to access, correct and erase your data, to nominate someone to act for you, and to complain to us first and then to the Data Protection Board of India. Other countries’ laws may give you similar rights, and we will honour them where they apply.</P>

      <H>Children</H>
      <P>Parv is not aimed at children under 18. If a parent or guardian learns a child has signed up without permission, tell us and we will delete the account.</P>

      <H>Security</H>
      <P>Your data is stored with access rules that let each signed-in user reach only their own records. Payment keys are kept on the server, never in the app. No system is perfectly secure, so if we find a breach that affects you we will tell you as the law requires.</P>

      <H>Changes</H>
      <P>If we change this policy we will update the date above and tell you about material changes in the app or by email.</P>

      <H>Contact and grievance officer</H>
      <UL items={[
        <>Email: <TC>contact email</TC></>,
        <>Grievance Officer: <TC>name</TC>, <TC>email</TC>, <TC>postal address</TC></>,
      ]} />
    </LegalPage>
  );
}
