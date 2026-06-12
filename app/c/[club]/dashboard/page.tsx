import Link from "next/link";
import type { Metadata } from "next";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, fmtTime } from "@/lib/format";
import { seatsTaken, type Lunch, type Signup } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Dashboard" };

type LunchRow = Lunch & { venues: { name: string } | null };

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  const { club: slug } = await params;
  const ctx = await getClubContext(slug);
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: upcoming } = await supabase
    .from("lunches")
    .select("*, venues(name)")
    .eq("club_id", ctx.club.id)
    .gte("lunch_date", today)
    .in("status", ctx.isCommittee ? ["draft", "released"] : ["released"])
    .order("lunch_date")
    .limit(6);

  const lunches = (upcoming ?? []) as LunchRow[];
  const next = lunches.find((l) => l.status === "released");

  let nextSignups: Signup[] = [];
  let mySignup: Signup | undefined;
  if (next) {
    const { data: signups } = await supabase
      .from("signups")
      .select("*")
      .eq("lunch_id", next.id);
    nextSignups = (signups ?? []) as Signup[];
    mySignup = nextSignups.find(
      (s) => s.membership_id === ctx.membership.id && s.status !== "cancelled"
    );
  }

  // Committee extras
  let pipelineCount = 0;
  let memberCount = 0;
  if (ctx.isCommittee) {
    const [{ count: vc }, { count: mc }] = await Promise.all([
      supabase
        .from("venues")
        .select("id", { count: "exact", head: true })
        .eq("club_id", ctx.club.id)
        .in("status", ["candidate", "tasting"]),
      supabase
        .from("memberships")
        .select("id", { count: "exact", head: true })
        .eq("club_id", ctx.club.id)
        .eq("status", "active"),
    ]);
    pipelineCount = vc ?? 0;
    memberCount = mc ?? 0;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hello, {ctx.membership.full_name.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-stone-500">{ctx.club.name}</p>
        </div>
        {ctx.isCommittee && (
          <Button render={<Link href={`/c/${slug}/lunches/new`} />}>
            New lunch
          </Button>
        )}
      </div>

      {next ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-3">
              Next lunch: {next.title}
              <StatusBadge status={next.status} />
              {mySignup && <StatusBadge status={mySignup.status} />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-stone-600">
              {fmtDate(next.lunch_date)} at {fmtTime(next.start_time)}
              {next.venues ? ` — ${next.venues.name}` : ""}
            </p>
            <p className="text-sm text-stone-500">
              {seatsTaken(nextSignups)} of {next.capacity} seats taken
              {nextSignups.filter((s) => s.status === "waitlisted").length > 0 &&
                ` · ${nextSignups.filter((s) => s.status === "waitlisted").length} waitlisted`}
            </p>
            <Button
              variant={mySignup ? "outline" : "default"}
              render={<Link href={`/c/${slug}/lunches/${next.id}`} />}
            >
              {mySignup ? "View / manage my sign-up" : "View & sign up"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-stone-500">
            No upcoming lunches yet.
            {ctx.isCommittee && (
              <>
                {" "}
                <Link
                  href={`/c/${slug}/lunches/new`}
                  className="underline underline-offset-4"
                >
                  Create one
                </Link>
                .
              </>
            )}
          </CardContent>
        </Card>
      )}

      {lunches.length > (next ? 1 : 0) && (
        <section>
          <h2 className="text-lg font-medium mb-3">Coming up</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lunches
              .filter((l) => l.id !== next?.id)
              .map((l) => (
                <Link key={l.id} href={`/c/${slug}/lunches/${l.id}`}>
                  <Card className="hover:shadow-sm transition-shadow h-full">
                    <CardContent className="pt-6 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{l.title}</span>
                        <StatusBadge status={l.status} />
                      </div>
                      <p className="text-sm text-stone-500">
                        {fmtDate(l.lunch_date)}
                        {l.venues ? ` · ${l.venues.name}` : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      )}

      {ctx.isCommittee && (
        <section className="grid gap-3 sm:grid-cols-2">
          <Link href={`/c/${slug}/venues`}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-6">
                <p className="text-2xl font-semibold">{pipelineCount}</p>
                <p className="text-sm text-stone-500">
                  venues in the pipeline (candidate / tasting)
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/c/${slug}/members`}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-6">
                <p className="text-2xl font-semibold">{memberCount}</p>
                <p className="text-sm text-stone-500">active members</p>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}
    </div>
  );
}
