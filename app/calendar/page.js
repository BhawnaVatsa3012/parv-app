import { getUser } from "@/lib/session";
import { getProfile } from "@/lib/store";
import CalendarClient from "./CalendarClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendar — Parv" };

// The month grid with each day's panchang, in the user's saved city.
export default async function CalendarPage() {
  const user = await getUser();
  const profile = await getProfile(user);
  return <CalendarClient homeCityId={profile?.city_id || null} />;
}
