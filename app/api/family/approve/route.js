import { requireUser, readJson, json, bad, strList } from "@/lib/api";
import { saveFamilyRitual, deleteFamilyRitual } from "@/lib/store";
import { isEntitledToRituals } from "@/lib/entitlements";
import { storyData } from "@/lib/data";

// Saves the family's version of a ritual once the user approves it.
export async function POST(request) {
  const { user, res } = await requireUser();
  if (res) return res;
  if (!(await isEntitledToRituals())) return bad("Rituals need a membership", 403);
  const b = await readJson(request);
  const ri = Number(b?.ritual_index);
  if (!storyData[b?.festival_id]?.rituals?.[ri]) return bad("Unknown ritual");
  const steps = strList(b.steps, 30, 400);
  const samagri = strList(b.samagri, 40, 160) || [];
  if (!steps?.length) return bad("Nothing to save");
  const { error } = await saveFamilyRitual(user, b.festival_id, ri, steps, samagri);
  if (error) { console.error("saveFamilyRitual:", error.message); return bad("Could not save. Please try again.", 500); }
  return json({ ok: true });
}

// Goes back to Parv's original version.
export async function DELETE(request) {
  const { user, res } = await requireUser();
  if (res) return res;
  const u = new URL(request.url);
  const fid = u.searchParams.get("festival_id"), ri = Number(u.searchParams.get("ritual_index"));
  if (!storyData[fid]?.rituals?.[ri]) return bad("Unknown ritual");
  const { error } = await deleteFamilyRitual(user, fid, ri);
  return error ? bad("Could not reset. Please try again.", 500) : json({ ok: true });
}
