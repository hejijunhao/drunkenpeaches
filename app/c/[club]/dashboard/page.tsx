import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRightIcon, CalendarOffIcon, PlusIcon } from "lucide-react";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { firstName, fmtDate, fmtTime, relativeDays } from "@/lib/format";
import { seatsTaken, type Lunch, type Signup } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { RuleLabel, SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";
import { SeatMeter } from "@/components/seat-meter";
import { StatusBadge } from "@/components/status-badge";
import { LunchCard } from "@/components/lunch-card";

export const metadata: Metadata = { title: "Notice board" };

type LunchRow = Lunch & { venues: { name: string } | null };

const waitlistedCount = (signups: Signup[]) =>
  signups.filter((s) => s.status === "waitlisted").length;

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

  // One query for sign-ups across every visible upcoming lunch → seat meters.
  const signupsByLunch = new Map<string, Signup[]>();
  if (lunches.length) {
    const { data: allSignups } = await supabase
      .from("signups")
      .select("*")
      .in(
        "lunch_id",
        lunches.map((l) => l.id)
      );
    for (const s of (allSignups ?? []) as Signup[]) {
      const arr = signupsByLunch.get(s.lunch_id) ?? [];
      arr.push(s);
      signupsByLunch.set(s.lunch_id, arr);
    }
  }

  const nextSignups = next ? (signupsByLunch.get(next.id) ?? []) : [];
  const mySignup = next
    ? nextSignups.find(
        (s) =>
          s.membership_id === ctx.membership.id && s.status !== "cancelled"
      )
    : undefined;

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

  const comingUp = lunches.filter((l) => l.id !== next?.id);
  const first = firstName(ctx.membership.full_name);

  return (
    <div className="space-y-12">
      <PageHeader
        kicker={ctx.club.name}
        title={first ? `Good day, ${first}.` : "The notice board"}
        description={
          next ? (
            <>
              The next luncheon is{" "}
              <span className="text-foreground">{fmtDate(next.lunch_date)}</span>
              , {relativeDays(next.lunch_date)}.
            </>
          ) : (
            "Nothing is on the calendar at present."
          )
        }
      >
        {ctx.isCommittee ? (
          <Button render={<Link href={`/c/${slug}/lunches/new`} />}>
            <PlusIcon />
            Arrange a lunch
          </Button>
        ) : null}
      </PageHeader>

      {/* Next luncheon */}
      {next ? (
        <section
          aria-labelledby="next-luncheon"
          className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-[1fr_20rem]"
        >
          <div className="club-notice bg-card p-6 sm:p-8">
            <p className="club-kicker">Next luncheon</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 id="next-luncheon" className="text-h1 text-balance text-foreground">
                {next.title}
              </h2>
              <StatusBadge status={next.status} />
            </div>
            <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-3">
              <div>
                <dt className="club-kicker text-[0.625rem]">Date</dt>
                <dd className="mt-1.5 text-[0.95rem] text-foreground">
                  {fmtDate(next.lunch_date)}
                </dd>
              </div>
              <div>
                <dt className="club-kicker text-[0.625rem]">Time</dt>
                <dd className="mt-1.5 text-[0.95rem] text-foreground">
                  {fmtTime(next.start_time)}
                </dd>
              </div>
              {next.venues ? (
                <div>
                  <dt className="club-kicker text-[0.625rem]">Table</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-foreground">
                    {next.venues.name}
                  </dd>
                </div>
              ) : null}
            </dl>
            {next.notes ? (
              <p className="mt-6 max-w-prose text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {next.notes}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col justify-between gap-8 bg-card p-6 sm:p-8">
            <SeatMeter
              taken={seatsTaken(nextSignups)}
              capacity={next.capacity}
              waitlisted={waitlistedCount(nextSignups)}
            />
            <div className="space-y-3">
              {mySignup ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  Your place <StatusBadge status={mySignup.status} />
                </p>
              ) : null}
              <Button
                className="w-full"
                variant={mySignup ? "outline" : "default"}
                render={<Link href={`/c/${slug}/lunches/${next.id}`} />}
              >
                {mySignup ? "View the list" : "Add your name"}
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          icon={CalendarOffIcon}
          title="Nothing on the calendar"
          description={
            ctx.isCommittee
              ? "Arrange the first lunch and release it once the restaurant is booked."
              : "The next luncheon will appear here when the committee releases it."
          }
          aside={ctx.isCommittee ? undefined : "Patience is a club virtue."}
          action={
            ctx.isCommittee ? (
              <Button render={<Link href={`/c/${slug}/lunches/new`} />}>
                <PlusIcon />
                Arrange a lunch
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Also forthcoming */}
      {comingUp.length > 0 ? (
        <section className="space-y-5">
          <SectionHeading title="Also forthcoming" count={comingUp.length} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comingUp.map((l) => {
              const s = signupsByLunch.get(l.id) ?? [];
              return (
                <LunchCard
                  key={l.id}
                  href={`/c/${slug}/lunches/${l.id}`}
                  title={l.title}
                  status={l.status}
                  date={l.lunch_date}
                  venueName={l.venues?.name}
                  taken={seatsTaken(s)}
                  capacity={l.capacity}
                  waitlisted={waitlistedCount(s)}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Committee figures */}
      {ctx.isCommittee ? (
        <section className="space-y-5">
          <RuleLabel>Committee</RuleLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/c/${slug}/venues`}
              className="group flex items-end justify-between rounded-lg border border-border bg-card p-6 transition-colors duration-(--duration-default) hover:border-foreground/40"
            >
              <div>
                <p className="club-kicker">Venues under consideration</p>
                <p className="text-numeral mt-3 text-[2.75rem] leading-none text-foreground">
                  {pipelineCount}
                </p>
              </div>
              <ArrowUpRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </Link>
            <Link
              href={`/c/${slug}/members`}
              className="group flex items-end justify-between rounded-lg border border-border bg-card p-6 transition-colors duration-(--duration-default) hover:border-foreground/40"
            >
              <div>
                <p className="club-kicker">Members in good standing</p>
                <p className="text-numeral mt-3 text-[2.75rem] leading-none text-foreground">
                  {memberCount}
                </p>
              </div>
              <ArrowUpRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
