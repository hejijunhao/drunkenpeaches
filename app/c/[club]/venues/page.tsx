import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBanner } from "@/components/error-banner";
import { VenueForm } from "./venue-form";

export const metadata: Metadata = { title: "Venues" };

const STAGES: { status: Venue["status"]; title: string; hint: string }[] = [
  {
    status: "candidate",
    title: "Candidates",
    hint: "Restaurants worth a look",
  },
  {
    status: "tasting",
    title: "Committee tasting",
    hint: "Evaluation visit planned or done",
  },
  {
    status: "approved",
    title: "Approved",
    hint: "Ready to book a lunch",
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
    <div className="space-y-8">
      <ErrorBanner message={error} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Venue pipeline</h1>
        <p className="text-sm text-stone-500">
          Candidate → committee tasting → approved → booked lunch.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {STAGES.map((stage) => {
          const inStage = venues.filter((v) => v.status === stage.status);
          return (
            <div key={stage.status} className="space-y-3">
              <div>
                <h2 className="font-medium">
                  {stage.title}{" "}
                  <span className="text-stone-400">({inStage.length})</span>
                </h2>
                <p className="text-xs text-stone-500">{stage.hint}</p>
              </div>
              {inStage.map((v) => (
                <Link key={v.id} href={`/c/${slug}/venues/${v.id}`} className="block">
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-4">
                      <p className="font-medium">{v.name}</p>
                      {v.address && (
                        <p className="text-sm text-stone-500">{v.address}</p>
                      )}
                      {v.default_capacity && (
                        <p className="text-xs text-stone-500 mt-1">
                          room for ~{v.default_capacity}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {inStage.length === 0 && (
                <p className="text-sm text-stone-400 border border-dashed rounded-lg p-4 text-center">
                  empty
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a candidate venue</CardTitle>
        </CardHeader>
        <CardContent>
          <VenueForm slug={slug} />
        </CardContent>
      </Card>

      {retired.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-stone-500">Rejected & archived</h2>
          <div className="flex flex-wrap gap-2">
            {retired.map((v) => (
              <Link
                key={v.id}
                href={`/c/${slug}/venues/${v.id}`}
                className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-stone-50"
              >
                {v.name} <StatusBadge status={v.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
