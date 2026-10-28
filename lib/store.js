// Server-side reads and writes for a user's own Parv data. All queries run
// as the signed-in user, so Supabase row-level security applies.
// Local design previews (no Supabase) use an in-memory store instead.
import { createClient } from "@/lib/supabase/server";

const mem = globalThis.__parvPreviewStore || (globalThis.__parvPreviewStore = { profile: null, checklists: {}, notes: [], rituals: {} });
const isPreview = (user) => user?.id === "preview";

// ---------- profile ----------
export async function getProfile(user) {
  if (!user) return null;
  if (isPreview(user)) return mem.profile;
  const { data, error } = await createClient().from("parv_profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (error) console.error("getProfile:", error.message);
  return data || null;
}

export async function saveProfile(user, fields) {
  if (isPreview(user)) {
    mem.profile = { ...(mem.profile || {}), ...fields, user_id: user.id };
    return { data: mem.profile };
  }
  const { data, error } = await createClient()
    .from("parv_profiles")
    .upsert({ user_id: user.id, ...fields }, { onConflict: "user_id" })
    .select()
    .single();
  return { data, error };
}

// ---------- checklists ----------
export async function getChecklists(user, year) {
  if (!user) return {};
  if (isPreview(user)) return Object.fromEntries(Object.entries(mem.checklists).filter(([k]) => k.endsWith(`:${year}`)).map(([k, v]) => [k.split(":")[0], v]));
  const { data } = await createClient().from("parv_checklists").select("festival_id, done, custom").eq("user_id", user.id).eq("year", year);
  return Object.fromEntries((data || []).map((r) => [r.festival_id, { done: r.done || [], custom: r.custom || [] }]));
}

export async function saveChecklist(user, festivalId, year, done, custom) {
  if (isPreview(user)) {
    mem.checklists[`${festivalId}:${year}`] = { done, custom };
    return {};
  }
  const { error } = await createClient()
    .from("parv_checklists")
    .upsert({ user_id: user.id, festival_id: festivalId, year, done, custom }, { onConflict: "user_id,festival_id,year" });
  return { error };
}

// ---------- family traditions ----------
export async function getFamily(user, festivalId) {
  if (!user) return { notes: [], rituals: {} };
  if (isPreview(user)) {
    return {
      notes: mem.notes.filter((n) => n.festival_id === festivalId),
      rituals: Object.fromEntries(Object.entries(mem.rituals).filter(([k]) => k.startsWith(festivalId + ":")).map(([k, v]) => [k.split(":")[1], v])),
    };
  }
  const sb = createClient();
  const [{ data: notes }, { data: rituals }] = await Promise.all([
    sb.from("parv_family_notes").select("id, ritual_index, step_index, note, created_at").eq("user_id", user.id).eq("festival_id", festivalId).order("created_at"),
    sb.from("parv_family_rituals").select("ritual_index, steps, samagri, approved_at").eq("user_id", user.id).eq("festival_id", festivalId),
  ]);
  return { notes: notes || [], rituals: Object.fromEntries((rituals || []).map((r) => [r.ritual_index, r])) };
}

export async function addNote(user, row) {
  if (isPreview(user)) {
    const n = { id: String(Date.now()), created_at: new Date().toISOString(), ...row };
    mem.notes.push(n);
    return { data: n };
  }
  const { data, error } = await createClient().from("parv_family_notes").insert({ user_id: user.id, ...row }).select().single();
  return { data, error };
}

export async function deleteNote(user, id) {
  if (isPreview(user)) { mem.notes = mem.notes.filter((n) => n.id !== id); return {}; }
  const { error } = await createClient().from("parv_family_notes").delete().eq("user_id", user.id).eq("id", id);
  return { error };
}

export async function saveFamilyRitual(user, festivalId, ritualIndex, steps, samagri) {
  if (isPreview(user)) {
    mem.rituals[`${festivalId}:${ritualIndex}`] = { ritual_index: ritualIndex, steps, samagri, approved_at: new Date().toISOString() };
    return {};
  }
  const { error } = await createClient()
    .from("parv_family_rituals")
    .upsert({ user_id: user.id, festival_id: festivalId, ritual_index: ritualIndex, steps, samagri, approved_at: new Date().toISOString() }, { onConflict: "user_id,festival_id,ritual_index" });
  return { error };
}

export async function deleteFamilyRitual(user, festivalId, ritualIndex) {
  if (isPreview(user)) { delete mem.rituals[`${festivalId}:${ritualIndex}`]; return {}; }
  const { error } = await createClient().from("parv_family_rituals").delete().eq("user_id", user.id).eq("festival_id", festivalId).eq("ritual_index", ritualIndex);
  return { error };
}

// Deletes every family note and adapted ritual, and the family details on the profile.
export async function deleteAllFamily(user) {
  if (isPreview(user)) {
    mem.notes = []; mem.rituals = {};
    if (mem.profile) { mem.profile.community = null; mem.profile.languages = null; }
    return {};
  }
  const sb = createClient();
  const r1 = await sb.from("parv_family_notes").delete().eq("user_id", user.id);
  const r2 = await sb.from("parv_family_rituals").delete().eq("user_id", user.id);
  const r3 = await sb.from("parv_profiles").update({ community: null, languages: null }).eq("user_id", user.id);
  return { error: r1.error || r2.error || r3.error };
}
