import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPinIcon, PhoneIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

      {/* Header + status toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h1 text-foreground">{venue.name}</h1>
            <StatusBadge status={venue.status} />
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            {venue.address ? (
              <p className="flex items-center gap-2">
                <MapPinIcon className="size-4 shrink-0" />
                {venue.address}
              </p>
            ) : null}
            {venue.contact ? (
              <p className="flex items-center gap-2">
                <PhoneIcon className="size-4 shrink-0" />
                {venue.contact}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {venue.status === "candidate" ? (
            <form
              action={setVenueStatusAction.bind(null, slug, venue.id, "tasting")}
            >
              <Button type="submit" variant="outline">
                Move to tasting
              </Button>
            </form>
          ) : null}
          {venue.status === "candidate" || venue.status === "tasting" ? (
            <>
              <form
                action={setVenueStatusAction.bind(
                  null,
                  slug,
                  venue.id,
                  "approved"
                )}
              >
                <Button type="submit">Approve venue</Button>
              </form>
              <form
                action={setVenueStatusAction.bind(
                  null,
                  slug,
                  venue.id,
                  "rejected"
                )}
              >
                <ConfirmSubmit
                  confirmTitle="Reject venue?"
                  confirmMessage={`Reject ${venue.name}? You can still find it under rejected venues.`}
                  confirmLabel="Reject"
                  variant="destructive"
                >
                  Reject
                </ConfirmSubmit>
              </form>
            </>
          ) : null}
          {venue.status === "approved" ? (
            <Button render={<Link href={`/c/${slug}/lunches/new`} />}>
              Book a lunch here
            </Button>
          ) : null}
          {venue.status === "rejected" || venue.status === "archived" ? (
            <form
              action={setVenueStatusAction.bind(
                null,
                slug,
                venue.id,
                "candidate"
              )}
            >
              <Button type="submit" variant="outline">
                Back to candidates
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      {/* Details */}
      <section className="space-y-3">
        <h2 className="text-h2 text-foreground">Details</h2>
        <VenueForm slug={slug} venue={venue} />
      </section>

      <Separator />

      {/* Tastings */}
      <section className="space-y-4">
        <div>
          <h2 className="text-h2 text-foreground">Committee tastings</h2>
          <p className="text-sm text-muted-foreground">
            Record the evaluation visit and the feedback you&apos;d share with
            the restaurant — it informs the go / no-go.
          </p>
        </div>

        {tastings.map((t) => (
          <Card key={t.id}>
            <CardContent className="pt-(--card-spacing)">
              <form
                action={updateTastingAction.bind(null, slug, venue.id, t.id)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-end">
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
                    <Select name="outcome" defaultValue={t.outcome}>
                      <SelectTrigger
                        id={`outcome-${t.id}`}
                        className="w-full sm:w-40"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="no_go">No-go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center pb-1">
                    <StatusBadge status={t.outcome} />
                  </div>
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
            <CardTitle>Add a tasting</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={addTastingAction.bind(null, slug, venue.id)}
              className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="newTastingDate">Date</Label>
                <Input id="newTastingDate" name="tastingDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newFeedback">Initial notes (optional)</Label>
                <Input
                  id="newFeedback"
                  name="feedback"
                  placeholder="Booked for 6 committee members…"
                />
              </div>
              <Button type="submit" variant="outline">
                <PlusIcon />
                Add tasting
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Lunches at this venue */}
      {lunches.length > 0 ? (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-h2 text-foreground">Lunches at this venue</h2>
            <ul className="space-y-2">
              {lunches.map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground tabular-nums">
                    {fmtDateShort(l.lunch_date)}
                  </span>
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
      ) : null}

      <Separator />
      <form action={deleteVenueAction.bind(null, slug, venue.id)}>
        <ConfirmSubmit
          confirmTitle={lunches.length > 0 ? "Archive venue?" : "Delete venue?"}
          confirmMessage={
            lunches.length > 0
              ? `${venue.name} has lunch history, so it will be archived instead of deleted.`
              : `This permanently deletes ${venue.name}.`
          }
          confirmLabel={lunches.length > 0 ? "Archive venue" : "Delete venue"}
          variant="destructive"
        >
          <Trash2Icon />
          {lunches.length > 0 ? "Archive venue" : "Delete venue"}
        </ConfirmSubmit>
      </form>
    </div>
  );
}
