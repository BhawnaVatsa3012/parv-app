import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("provider, status, current_period_end")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AccountClient email={user.email} subscription={subscription} />
  );
}
