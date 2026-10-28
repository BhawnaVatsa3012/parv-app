import { requireUser, readJson, json, bad, str } from "@/lib/api";
import { addNote, deleteNote, deleteAllFamily } from "@/lib/store";
import { isEntitledToRituals } from "@/lib/entitlements";
import { storyData } from "@/lib/data";

// Add a family note to a ritual (or one of its steps).
export async function POST(request) {
  const { user, res } = await requireUser();
  if (res) return res;
  if (!(await isEntitledToRituals())) return bad("Rituals need a membership", 403);
  const b = await readJson(request);
  const rituals = storyData[b?.festival_id]?.rituals;
  const ri = Number(b?.ritual_index);
  if (!rituals || !Number.isInteger(ri) || !rituals[ri]) return bad("Unknown ritual");
  const si = b.step_index == null ? null : Number(b.step_index);
  if (si != null && (!Number.isInteger(si) || !rituals[ri].steps?.[si])) return bad("Unknown step");
  const note = str(b.note, 1000);
  if (!note) return bad("Write a note first");
  const { data, error } = await addNote(user, { festival_id: b.festival_id, ritual_index: ri, step_index: si, note });
  if (error) { console.error("addNote:", error.message); return bad("Could not save. Please try again.", 500); }
  return json({ note: data });
}

// ?id=<note id> deletes one note; ?all=1 deletes all family data.
export async function DELETE(request) {
  const { user, res } = await requireUser();
  if (res) return res;
  const u = new URL(request.url);
  if (u.searchParams.get("all") === "1") {
    const { error } = await deleteAllFamily(user);
    return error ? bad("Could not delete. Please try again.", 500) : json({ ok: true });
  }
  const id = u.searchParams.get("id");
  if (!id || id.length > 60) return bad("Missing note");
  const { error } = await deleteNote(user, id);
  return error ? bad("Could not delete. Please try again.", 500) : json({ ok: true });
}
