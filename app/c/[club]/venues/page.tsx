import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDownIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBanner } from "@/components/error-banner";
import { AddVenueDialog } from "./add-venue-dialog";

export const metadata: Metadata = { title: "Venues" };

const STAGES: { status: Venue["status"]; title: string; hint: string }[] = [
  { status: "candidate", title: "Candidates", hint: "Restaurants worth a look" },
  {
    status: "tasting",
    title: "Committee tasting",
    hint: "Evaluation visit planned or done",
  },
  { status: "approved", title: "Approved", hint: "Ready to book a lunch" },
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
    <div className="space-y-8">
      <ErrorBanner message={error} />
      <PageHeader
        title="Venue pipeline"
        description="Candidate → committee tasting → approved → booked lunch."
      >
        <AddVenueDialog slug={slug} />
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {STAGES.map((stage) => {
          const inStage = venues.filter((v) => v.status === stage.status);
          return (
            <div key={stage.status} className="space-y-3">
              <div className="flex items-baseline justify-between gap-2 border-b border-border pb-2">
                <div>
                  <h2 className="font-heading text-base font-medium text-foreground">
                    {stage.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">{stage.hint}</p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                  {inStage.length}
                </span>
              </div>
              <div className="space-y-3">
                {inStage.map((v) => (
                  <Link
                    key={v.id}
                    href={`/c/${slug}/venues/${v.id}`}
                    className="block"
                  >
                    <Card hover className="gap-2 p-4">
                      <p className="font-heading font-medium text-foreground">
                        {v.name}
                      </p>
                      {v.address ? (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPinIcon className="size-3.5 shrink-0" />
                          {v.address}
                        </p>
                      ) : null}
                      {v.default_capacity ? (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UsersIcon className="size-3.5 shrink-0" />
                          room for ~{v.default_capacity}
                        </p>
                      ) : null}
                    </Card>
                  </Link>
                ))}
                {inStage.length === 0 ? (
                  <EmptyState title="Empty" className="px-4 py-8" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {retired.length > 0 ? (
        <details className="group rounded-2xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground">
            Rejected &amp; archived ({retired.length})
            <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-wrap gap-2 border-t border-border p-4">
            {retired.map((v) => (
              <Link
                key={v.id}
                href={`/c/${slug}/venues/${v.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
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
