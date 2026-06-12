import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLunchReminder } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Daily Vercel Cron (see vercel.json): emails confirmed attendees a reminder
 * for released lunches happening within the next 2 days. Each lunch is
 * reminded once (reminder_sent_at). Runs cross-tenant with the service role.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date();
  const horizon = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const { data: lunches, error } = await admin
    .from("lunches")
    .select("*, clubs(name), venues(name)")
    .eq("status", "released")
    .is("reminder_sent_at", null)
    .gte("lunch_date", fmt(today))
    .lte("lunch_date", fmt(horizon));
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const lunch of lunches ?? []) {
    const { data: attendees } = await admin
      .from("signups")
      .select("memberships(email, full_name)")
      .eq("lunch_id", lunch.id)
      .eq("status", "confirmed");

    for (const a of attendees ?? []) {
      const m = a.memberships as unknown as {
        email: string;
        full_name: string;
      } | null;
      if (!m) continue;
      await sendLunchReminder({
        to: m.email,
        name: m.full_name,
        clubName: (lunch.clubs as unknown as { name: string })?.name ?? "Your club",
        lunchTitle: lunch.title,
        lunchDate: lunch.lunch_date,
        startTime: lunch.start_time,
        venueName: (lunch.venues as unknown as { name: string } | null)?.name,
      });
      sent++;
    }

    await admin
      .from("lunches")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", lunch.id);
  }

  return NextResponse.json({ lunches: lunches?.length ?? 0, emails: sent });
}
