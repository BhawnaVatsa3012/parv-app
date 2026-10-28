import { headers } from "next/headers";
import { isEntitledToRituals } from "@/lib/entitlements";
import { getUser } from "@/lib/session";
import { getProfile, getChecklists, getFamily } from "@/lib/store";
import { YEAR } from "@/lib/design";
import FestivalPageClient from "./FestivalPageClient";

export const dynamic = "force-dynamic";

export default async function FestivalPage({ params }) {
  const country = headers().get("x-vercel-ip-country");
  const price = !country || country === "IN" ? "₹99" : "$3.99";
  const user = await getUser();
  const [entitled, profile, checklists] = await Promise.all([isEntitledToRituals(), getProfile(user), getChecklists(user, YEAR)]);
  const family = entitled ? await getFamily(user, params.id) : null;
  return (
    <FestivalPageClient
      params={params}
      entitled={entitled}
      price={price}
      profile={profile ? { city_id: profile.city_id, state: profile.state } : null}
      checklist={checklists[params.id] || null}
      family={family}
    />
  );
}
