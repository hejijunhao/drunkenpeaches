import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBanner } from "@/components/error-banner";
import { AddVenueDialog } from "./add-venue-dialog";

export const metadata: Metadata = { title: "Venues" };

const STAGES: {
  status: Venue["status"];
  numeral: string;
  title: string;
  hint: string;
}[] = [
  {
    status: "candidate",
    numeral: "I",
    title: "Candidates",
    hint: "Houses under consideration",
  },
  {
    status: "tasting",
    numeral: "II",
    title: "Tasting",
    hint: "A committee visit arranged or recorded",
  },
  {
    status: "approved",
    numeral: "III",
    title: "Approved",
    hint: "Ready for a luncheon",
  },
];

export default async function VenuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ club: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { club: slug } = await params;
  const { error } = await searchParams;
  const ctx = await getClubContext(slug);
  if (!ctx.isCommittee) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("club_id", ctx.club.id)
    .order("created_at", { ascending: false });
  const venues = (data ?? []) as Venue[];
  const retired = venues.filter(
    (v) => v.status === "rejected" || v.status === "archived"
  );

  return (
    <div className="space-y-12">
      <ErrorBanner message={error} />
      <PageHeader
        kicker="Back of house"
        title="Venues"
        description="Candidate, tasting, approved — then a booked table."
      >
        <AddVenueDialog slug={slug} />
      </PageHeader>

      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {STAGES.map((stage) => {
          const inStage = venues.filter((v) => v.status === stage.status);
          return (
            <section key={stage.status} className="space-y-4">
              <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
                <div>
                  <p className="text-numeral text-[1.25rem] leading-none text-primary">
                    {stage.numeral}
                  </p>
                  <h2 className="text-h2 mt-2 text-foreground">{stage.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stage.hint}
                  </p>
                </div>
                <span className="text-numeral text-[1.25rem] text-muted-foreground">
                  {inStage.length}
                </span>
              </div>
              <div className="space-y-3">
                {inStage.map((v) => (
                  <Link
                    key={v.id}
                    href={`/c/${slug}/venues/${v.id}`}
                    className="block rounded-lg border border-border bg-card p-4 transition-colors duration-(--duration-default) hover:border-foreground/40"
                  >
                    <p className="text-h3 text-foreground">{v.name}</p>
                    {v.address ? (
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {v.address}
                      </p>
                    ) : null}
                    {v.default_capacity ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Private room for about{" "}
                        <span className="text-numeral text-sm text-foreground">
                          {v.default_capacity}
                        </span>
                      </p>
                    ) : null}
                  </Link>
                ))}
                {inStage.length === 0 ? (
                  <p className="text-aside py-3 text-[0.95rem] text-muted-foreground">
                    None at present.
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {retired.length > 0 ? (
        <details className="group border-y border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm text-muted-foreground">
            <span>
              Declined &amp; archived{" "}
              <span className="text-numeral ml-1 text-base">{retired.length}</span>
            </span>
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-wrap gap-2 border-t border-border py-4">
            {retired.map((v) => (
              <Link
                key={v.id}
                href={`/c/${slug}/venues/${v.id}`}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:border-foreground/40"
              >
                {v.name}
                <StatusBadge status={v.status} />
              </Link>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
