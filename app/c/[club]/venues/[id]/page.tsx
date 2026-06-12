import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { fmtDateShort } from "@/lib/format";
import type { Tasting, Venue } from "@/lib/types";
import {
  setVenueStatusAction,
  addTastingAction,
  updateTastingAction,
  deleteVenueAction,
} from "@/app/actions/venues";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBanner } from "@/components/error-banner";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { VenueForm } from "../venue-form";

export const metadata: Metadata = { title: "Venue" };

export default async function VenueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ club: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { club: slug, id } = await params;
  const { error } = await searchParams;
  const ctx = await getClubContext(slug);
  if (!ctx.isCommittee) notFound();

  const supabase = await createClient();
  const [{ data: venueData }, { data: tastingData }, { data: lunchData }] =
    await Promise.all([
      supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .eq("club_id", ctx.club.id)
        .single(),
      supabase
        .from("tastings")
        .select("*")
        .eq("venue_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("lunches")
        .select("id, title, lunch_date, status")
        .eq("venue_id", id)
        .order("lunch_date", { ascending: false }),
    ]);
  if (!venueData) notFound();
  const venue = venueData as Venue;
  const tastings = (tastingData ?? []) as Tasting[];
  const lunches = (lunchData ?? []) as {
    id: string;
    title: string;
    lunch_date: string;
    status: string;
  }[];

  return (
    <div className="space-y-8">
      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            {venue.name}
            <StatusBadge status={venue.status} />
          </h1>
          {venue.address && <p className="text-sm text-stone-500">{venue.address}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {venue.status === "candidate" && (
            <form action={setVenueStatusAction.bind(null, slug, venue.id, "tasting")}>
              <Button type="submit" variant="outline">
                Move to tasting
              </Button>
            </form>
          )}
          {(venue.status === "candidate" || venue.status === "tasting") && (
            <>
              <form action={setVenueStatusAction.bind(null, slug, venue.id, "approved")}>
                <Button type="submit">Approve venue</Button>
              </form>
              <form action={setVenueStatusAction.bind(null, slug, venue.id, "rejected")}>
                <ConfirmSubmit
                  confirmMessage={`Reject ${venue.name}? You can still find it under rejected venues.`}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  Reject
                </ConfirmSubmit>
              </form>
            </>
          )}
          {venue.status === "approved" && (
            <Button render={<Link href={`/c/${slug}/lunches/new`} />}>
              Book a lunch here
            </Button>
          )}
          {(venue.status === "rejected" || venue.status === "archived") && (
            <form action={setVenueStatusAction.bind(null, slug, venue.id, "candidate")}>
              <Button type="submit" variant="outline">
                Back to candidates
              </Button>
            </form>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Details</h2>
        <VenueForm slug={slug} venue={venue} />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Committee tastings</h2>
          <p className="text-sm text-stone-500">
            Record the evaluation visit and the feedback you&apos;d share with
            the restaurant — it informs the go / no-go.
          </p>
        </div>

        {tastings.map((t) => (
          <Card key={t.id}>
            <CardContent className="pt-6">
              <form
                action={updateTastingAction.bind(null, slug, venue.id, t.id)}
                className="space-y-3"
              >
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`date-${t.id}`}>Tasting date</Label>
                    <Input
                      id={`date-${t.id}`}
                      name="tastingDate"
                      type="date"
                      defaultValue={t.tasting_date ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`outcome-${t.id}`}>Outcome</Label>
                    <select
                      id={`outcome-${t.id}`}
                      name="outcome"
                      defaultValue={t.outcome}
                      className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="go">Go</option>
                      <option value="no_go">No-go</option>
                    </select>
                  </div>
                  <StatusBadge status={t.outcome} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feedback-${t.id}`}>Feedback</Label>
                  <Textarea
                    id={`feedback-${t.id}`}
                    name="feedback"
                    rows={3}
                    defaultValue={t.feedback ?? ""}
                    placeholder="Food, room, service, wine list, value…"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm">
                  Save tasting
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a tasting</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={addTastingAction.bind(null, slug, venue.id)}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="space-y-2">
                <Label htmlFor="newTastingDate">Date</Label>
                <Input id="newTastingDate" name="tastingDate" type="date" />
              </div>
              <div className="space-y-2 flex-1 min-w-56">
                <Label htmlFor="newFeedback">Initial notes (optional)</Label>
                <Input id="newFeedback" name="feedback" placeholder="Booked for 6 committee members…" />
              </div>
              <Button type="submit" variant="outline">
                Add tasting
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {lunches.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-lg font-medium">Lunches at this venue</h2>
            <ul className="space-y-2">
              {lunches.map((l) => (
                <li key={l.id} className="text-sm flex items-center gap-2">
                  <span className="text-stone-500">{fmtDateShort(l.lunch_date)}</span>
                  <Link
                    href={`/c/${slug}/lunches/${l.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {l.title}
                  </Link>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <Separator />
      <form action={deleteVenueAction.bind(null, slug, venue.id)}>
        <ConfirmSubmit
          confirmMessage={
            lunches.length > 0
              ? `${venue.name} has lunch history, so it will be archived instead of deleted. Continue?`
              : `Delete ${venue.name} permanently?`
          }
          variant="ghost"
          className="text-red-600 hover:text-red-700"
        >
          {lunches.length > 0 ? "Archive venue" : "Delete venue"}
        </ConfirmSubmit>
      </form>
    </div>
  );
}
