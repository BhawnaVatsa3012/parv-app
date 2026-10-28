import { requireUser, readJson, json, bad, strList } from "@/lib/api";
import { saveChecklist } from "@/lib/store";
import { checklistItems } from "@/lib/checklists";

export async function POST(request) {
  const { user, res } = await requireUser();
  if (res) return res;
  const b = await readJson(request);
  if (!b) return bad("Invalid request");
  const items = checklistItems(b.festival_id);
  if (!items.length) return bad("Unknown festival");
  const year = Number(b.year);
  if (!Number.isInteger(year) || year < 2024 || year > 2100) return bad("Invalid year");
  const custom = Array.isArray(b.custom)
    ? b.custom.filter((c) => c && typeof c.key === "string" && typeof c.text === "string")
        .slice(0, 30).map((c) => ({ key: c.key.slice(0, 20), text: c.text.trim().slice(0, 160) })).filter((c) => c.text)
    : [];
  const valid = new Set([...items.map((i) => i.key), ...custom.map((c) => c.key)]);
  const done = (strList(b.done, 80, 20) || []).filter((k) => valid.has(k));
  const { error } = await saveChecklist(user, b.festival_id, year, done, custom);
  if (error) { console.error("saveChecklist:", error.message); return bad("Could not save. Please try again.", 500); }
  return json({ ok: true, done, custom });
}
