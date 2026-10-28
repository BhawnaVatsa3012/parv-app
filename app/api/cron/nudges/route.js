import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { festivals } from "@/lib/data";
import { START, YEAR } from "@/lib/design";
import { checklistItems, NUDGE_DAYS } from "@/lib/checklists";

// Runs once a day (vercel.json). Emails each user who switched on
// reminders, 10, 3 and 1 day(s) before each festival they follow.
// Each reminder is logged so it is sent only once.
export const dynamic = "force-dynamic";

const APP = process.env.NEXT_PUBLIC_APP_URL || "https://parv-zeta.vercel.app";
const FROM = process.env.NUDGE_FROM || "Parv <reminders@mail.samsmaran.in>";

function indiaToday() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [y, m, d] = p.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ skipped: "Reminder emails aren't configured yet" });
  }

  const today = indiaToday();
  const due = festivals
    .filter((f) => f.active && START[f.id])
    .map((f) => ({ f, days: Math.round((Date.UTC(YEAR, START[f.id][0], START[f.id][1]) - today) / 864e5) }))
    .filter((x) => NUDGE_DAYS.includes(x.days));
  if (!due.length) return NextResponse.json({ sent: 0, note: "No festival at 10, 3 or 1 day(s) today" });

  const sb = createServiceClient();
  const { data: people, error } = await sb.from("parv_profiles").select("user_id, name, followed").eq("nudge_email", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const p of people || []) {
    for (const { f, days } of due) {
      if (p.followed?.length && !p.followed.includes(f.id)) continue;
      const { data: already } = await sb.from("parv_nudges_sent").select("user_id").eq("user_id", p.user_id).eq("festival_id", f.id).eq("year", YEAR).eq("days_before", days).maybeSingle();
      if (already) continue;
      const { data: u } = await sb.auth.admin.getUserById(p.user_id);
      const email = u?.user?.email;
      if (!email) continue;
      const { data: cl } = await sb.from("parv_checklists").select("done").eq("user_id", p.user_id).eq("festival_id", f.id).eq("year", YEAR).maybeSingle();
      const items = checklistItems(f.id).filter((i) => !i.samagri);
      const doneN = (cl?.done || []).length;
      const nextUp = items.filter((i) => i.before >= days && !(cl?.done || []).includes(i.key)).slice(0, 3);
      const when = days === 1 ? "tomorrow" : `in ${days} days`;
      const html = `<div style="font-family:Georgia,serif;color:#201f1d;max-width:480px">
        <p>Namaste${p.name ? " " + p.name.replace(/[<>&]/g, "") : ""},</p>
        <p style="font-size:20px">${f.name} is ${when}.</p>
        ${nextUp.length ? `<p>Next on your list:</p><ul>${nextUp.map((i) => `<li>${i.text}</li>`).join("")}</ul>` : ""}
        <p>${doneN} item${doneN === 1 ? "" : "s"} done so far.</p>
        <p><a href="${APP}/festival/${f.id}#prepare" style="color:#7d5411">Open your ${f.name} checklist</a></p>
        <p style="font-size:12px;color:#605d5d">You get these because you switched on reminders in Parv. Turn them off any time from Profile.</p></div>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: email, subject: `${f.name} is ${when}`, html }),
      });
      if (r.ok) {
        await sb.from("parv_nudges_sent").insert({ user_id: p.user_id, festival_id: f.id, year: YEAR, days_before: days });
        sent++;
      } else {
        console.error("Resend failed:", r.status, await r.text());
      }
    }
  }
  return NextResponse.json({ sent });
}
