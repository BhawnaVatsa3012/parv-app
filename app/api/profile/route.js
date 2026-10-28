import { requireUser, readJson, json, bad, str, strList } from "@/lib/api";
import { getProfile, saveProfile } from "@/lib/store";
import { cityById } from "@/lib/cities";
import { festivals } from "@/lib/data";

const FEST_IDS = festivals.map((f) => f.id);

export async function GET() {
  const { user, res } = await requireUser();
  if (res) return res;
  return json({ profile: await getProfile(user) });
}

// Partial update: only the fields sent are changed.
export async function POST(request) {
  const { user, res } = await requireUser();
  if (res) return res;
  const b = await readJson(request);
  if (!b) return bad("Invalid request");
  const f = {};
  if ("name" in b) f.name = str(b.name, 80) || null;
  if ("city_id" in b) {
    const c = cityById(b.city_id);
    if (!c) return bad("Pick a city from the list");
    Object.assign(f, { city_id: c.id, city_name: c.name, state: c.state || null, country: c.country, lat: c.lat, lon: c.lon, tz: c.tz });
  }
  if ("community" in b) f.community = str(b.community, 120) || null;
  if ("languages" in b) f.languages = str(b.languages, 120) || null;
  if ("followed" in b) {
    const l = strList(b.followed, 20, 40);
    if (!l) return bad("Invalid festivals");
    f.followed = l.filter((id) => FEST_IDS.includes(id));
  }
  if ("nudge_email" in b) f.nudge_email = Boolean(b.nudge_email);
  if ("daily_email" in b) f.daily_email = Boolean(b.daily_email);
  if (!Object.keys(f).length) return bad("Nothing to save");
  const { data, error } = await saveProfile(user, f);
  if (error) { console.error("saveProfile:", error.message); return bad("Could not save. Please try again.", 500); }
  return json({ profile: data });
}
