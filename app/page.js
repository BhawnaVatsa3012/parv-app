import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { getProfile, getChecklists } from "@/lib/store";
import { YEAR } from "@/lib/design";
import { isEntitledToRituals } from "@/lib/entitlements";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUser();
  const profile = await getProfile(user);
  // First visit after signing in: set city (and name) once.
  if (user && !profile?.city_id) redirect("/setup");
  const [checklists, member] = await Promise.all([getChecklists(user, YEAR), isEntitledToRituals()]);
  return <HomeClient email={user?.email || ""} profile={profile} checklists={checklists} member={member} />;
}
