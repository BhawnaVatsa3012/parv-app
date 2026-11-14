import { headers } from "next/headers";
import { isEntitledToRituals } from "@/lib/entitlements";
import { getUser } from "@/lib/session";
import { getProfile, getChecklists, getFamily } from "@/lib/store";
import { nextOccurrence, years, fillDates } from "@/lib/occurrence";
import { storyData } from "@/lib/stories";
import { orderRegions } from "@/lib/regions";
import { gateStory, canUseLayers } from "@/lib/access";
import { checklistItems } from "@/lib/checklists";
import { indiaToday } from "@/lib/today";
import FestivalPageClient from "./FestivalPageClient";

export const dynamic = "force-dynamic";

export default async function FestivalPage({ params, searchParams }) {
  // The next time this festival comes round, or a year asked for (?year=2028).
  const asked = Number(searchParams?.year);
  const year = years(params.id).includes(asked) ? asked : nextOccurrence(params.id, indiaToday())?.year || null;
  const country = headers().get("x-vercel-ip-country");
  const intl = Boolean(country) && country !== "IN"; // international pricing is undecided: no prices shown to them
  const user = await getUser();
  const [entitled, profile, checklists] = await Promise.all([isEntitledToRituals(), getProfile(user), year ? getChecklists(user, year) : {}]);
  const family = entitled ? await getFamily(user, params.id) : null;

  // Paywall, enforced here on the server: the browser is only ever sent the text
  // this reader may see (see gateStory in lib/access.js). Date tokens are filled
  // and regions ordered (reader's own first) before gating, so "first" means first shown.
  const raw = storyData[params.id];
  const filled = raw && year
    ? {
        ...raw,
        regions: raw.regions.map((r) => ({ ...r, date: fillDates(r.date, params.id, year) })),
        rituals: (raw.rituals || []).map((rt) => ({ ...rt, when: fillDates(rt.when, params.id, year) })),
      }
    : raw;
  const regions = filled ? orderRegions(params.id, filled.regions, profile?.state || null) : [];
  const data = gateStory(params.id, filled, regions, entitled);
  // Preparation checklist items (incl. samagri from the rituals) only for members.
  const prepItems = entitled ? checklistItems(params.id) : [];
  const prepCount = checklistItems(params.id).length;
  return (
    <FestivalPageClient
      params={params}
      year={year}
      entitled={entitled}
      data={data}
      intl={intl}
      layersOpen={canUseLayers(entitled)}
      prepItems={prepItems}
      prepCount={prepCount}
      profile={profile ? { city_id: profile.city_id, state: profile.state } : null}
      checklist={checklists[params.id] || null}
      family={family}
    />
  );
}
