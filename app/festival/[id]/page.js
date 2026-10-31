import { headers } from "next/headers";
import { isEntitledToRituals } from "@/lib/entitlements";
import { getUser } from "@/lib/session";
import { getProfile, getChecklists, getFamily } from "@/lib/store";
import { nextOccurrence, years } from "@/lib/occurrence";
import { indiaToday } from "@/lib/today";
import FestivalPageClient from "./FestivalPageClient";

export const dynamic = "force-dynamic";

export default async function FestivalPage({ params, searchParams }) {
  // The next time this festival comes round, or a year asked for (?year=2028).
  const asked = Number(searchParams?.year);
  const year = years(params.id).includes(asked) ? asked : nextOccurrence(params.id, indiaToday())?.year || null;
  const country = headers().get("x-vercel-ip-country");
  const price = !country || country === "IN" ? "₹99" : "$3.99";
  const user = await getUser();
  const [entitled, profile, checklists] = await Promise.all([isEntitledToRituals(), getProfile(user), year ? getChecklists(user, year) : {}]);
  const family = entitled ? await getFamily(user, params.id) : null;
  return (
    <FestivalPageClient
      params={params}
      year={year}
      entitled={entitled}
      price={price}
      profile={profile ? { city_id: profile.city_id, state: profile.state } : null}
      checklist={checklists[params.id] || null}
      family={family}
    />
  );
}
