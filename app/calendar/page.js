import { getUser } from "@/lib/session";
import { getProfile } from "@/lib/store";
import { isEntitledToRituals } from "@/lib/entitlements";
import { layersForReader } from "@/lib/access";
import CalendarClient from "./CalendarClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendar — Parv" };

// The month grid: every festival, plus the calendar layers the user chose
// (Hindu Panchang, Hijri date), in the user's saved city.
export default async function CalendarPage() {
  const user = await getUser();
  const [profile, member] = await Promise.all([getProfile(user), isEntitledToRituals()]);
  // Every festival date stays free. Hindu Panchang and Hijri layers are paid.
  return <CalendarClient homeCityId={profile?.city_id || null} layers={layersForReader(member, profile?.calendar_layers)} layersLocked={!member} />;
}
