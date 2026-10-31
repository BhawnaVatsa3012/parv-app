import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { getProfile, getChecklists } from "@/lib/store";
import { isEntitledToRituals } from "@/lib/entitlements";
import { festivals } from "@/lib/data";
import { nextOccurrence } from "@/lib/occurrence";
import { indiaToday } from "@/lib/today";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUser();
  const profile = await getProfile(user);
  // First visit after signing in: set city (and name) once.
  if (user && !profile?.city_id) redirect("/setup");
  // Checklists are saved per year; each festival's progress is read for the
  // year of its next occurrence (Diwali 2026 and Sankranti 2027 can both be next).
  const today = indiaToday();
  const yearOf = Object.fromEntries(festivals.filter((f) => f.active).map((f) => [f.id, nextOccurrence(f.id, today)?.year]).filter(([, y]) => y));
  const ys = [...new Set(Object.values(yearOf))];
  const [lists, member] = await Promise.all([Promise.all(ys.map((y) => getChecklists(user, y))), isEntitledToRituals()]);
  const byYear = Object.fromEntries(ys.map((y, i) => [y, lists[i]]));
  const checklists = Object.fromEntries(Object.entries(yearOf).map(([id, y]) => [id, byYear[y]?.[id]]).filter(([, v]) => v));
  return <HomeClient email={user?.email || ""} profile={profile} checklists={checklists} member={member} />;
}
