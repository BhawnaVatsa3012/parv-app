import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { getProfile } from "@/lib/store";
import { isEntitledToRituals } from "@/lib/entitlements";
import SetupClient from "./SetupClient";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const [profile, member] = await Promise.all([getProfile(user), isEntitledToRituals()]);
  return <SetupClient email={user.email} profile={profile} member={member} />;
}
