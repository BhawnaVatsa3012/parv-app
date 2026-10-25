import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUser, getSubscription } from "@/lib/session";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const subscription = await getSubscription(user.id);
  const country = headers().get("x-vercel-ip-country") || "";
  const detectedRegion = country === "IN" || !country ? "india" : "international";
  return <AccountClient email={user.email} subscription={subscription} detectedRegion={detectedRegion} />;
}
