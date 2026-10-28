import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { getProfile } from "@/lib/store";
import SetupClient from "./SetupClient";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user);
  return <SetupClient email={user.email} profile={profile} />;
}
