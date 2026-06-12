import Link from "next/link";
import type { Metadata } from "next";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { fmtDateShort, fmtTime } from "@/lib/format";
import { seatsTaken, type Lunch, type Signup } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBanner } from "@/components/error-banner";

export const metadata: Metadata = { title: "Lunches" };

type LunchRow = Lunch & { venues: { name: string } | null };

export default async function LunchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ club: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { club: slug } = await params;
  const { error } = await searchParams;
  const ctx = await getClubContext(slug);
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: lunchData }, { data: signupData }] = await Promise.all([
    supabase
      .from("lunches")
      .select("*, venues(name)")
      .eq("club_id", ctx.club.id)
      .order("lunch_date", { ascending: false }),
    supabase
      .from("signups")
      .select("id, lunch_id, membership_id, status, guest_count")
      .eq("club_id", ctx.club.id),
  ]);

  const lunches = (lunchData ?? []) as LunchRow[];
  const signups = (signupData ?? []) as Pick<
    Signup,
    "id" | "lunch_id" | "membership_id" | "status" | "guest_count"
  >[];

  const upcoming = lunches
    .filter((l) => l.lunch_date >= today && l.status !== "cancelled")
    .sort((a, b) => a.lunch_date.localeCompare(b.lunch_date));
  const past = lunches.filter(
    (l) => l.lunch_date < today || l.status === "cancelled"
  );

  function row(l: LunchRow) {
    const ls = signups.filter((s) => s.lunch_id === l.id);
    const mine = ls.find(
      (s) => s.membership_id === ctx.membership.id && s.status !== "cancelled"
    );
    return (
      <Link key={l.id} href={`/c/${slug}/lunches/${l.id}`}>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{l.title}</span>
                <StatusBadge status={l.status} />
                {mine && <StatusBadge status={mine.status} />}
              </div>
              <p className="text-sm text-stone-500 mt-1">
                {fmtDateShort(l.lunch_date)} at {fmtTime(l.start_time)}
                {l.venues ? ` · ${l.venues.name}` : ""}
              </p>
            </div>
            <div className="text-sm text-stone-500">
              {seatsTaken(ls)}/{l.capacity} seats
              {ls.filter((s) => s.status === "waitlisted").length > 0 &&
                ` · ${ls.filter((s) => s.status === "waitlisted").length} waitlisted`}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <div className="space-y-8">
      <ErrorBanner message={error} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Lunches</h1>
        {ctx.isCommittee && (
          <Button render={<Link href={`/c/${slug}/lunches/new`} />}>
            New lunch
          </Button>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Upcoming</h2>
        {upcoming.length === 0 && (
          <p className="text-sm text-stone-500">Nothing on the calendar yet.</p>
        )}
        <div className="space-y-3">{upcoming.map(row)}</div>
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Past & cancelled</h2>
          <div className="space-y-3">{past.map(row)}</div>
        </section>
      )}
    </div>
  );
}
