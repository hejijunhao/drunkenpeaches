import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { RuleLabel, SectionHeading } from "@/components/section-heading";
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
    <div className="space-y-12">
      <ErrorBanner message={error} />

      {/* Header + status toolbar */}
      <header className="space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-4">
            <p className="club-kicker">Venue</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-h1 text-balance text-foreground">{venue.name}</h1>
              <StatusBadge status={venue.status} />
            </div>
            <dl className="flex flex-wrap gap-x-12 gap-y-4">
              {venue.address ? (
                <div>
                  <dt className="club-kicker text-[0.625rem]">Address</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-foreground">
                    {venue.address}
                  </dd>
                </div>
              ) : null}
              {venue.contact ? (
                <div>
                  <dt className="club-kicker text-[0.625rem]">Contact</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-foreground">
                    {venue.contact}
                  </dd>
                </div>
              ) : null}
              {venue.default_capacity ? (
                <div>
                  <dt className="club-kicker text-[0.625rem]">Private room</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-foreground">
                    About {venue.default_capacity}
                  </dd>
                </div>
              ) : null}
            </dl>
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
                    confirmTitle="Decline this venue?"
                    confirmMessage={`Decline ${venue.name}? It stays on file under declined venues.`}
                    confirmLabel="Decline"
                    variant="destructive"
                  >
                    Decline
                  </ConfirmSubmit>
                </form>
              </>
            ) : null}
            {venue.status === "approved" ? (
              <Button render={<Link href={`/c/${slug}/lunches/new`} />}>
                Arrange a lunch here
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
        <div className="club-rule-strong" />
      </header>

      {/* Details */}
      <VenueForm slug={slug} venue={venue} />

      {/* Tastings */}
      <section className="space-y-6">
        <SectionHeading
          title="Committee tastings"
          count={tastings.length}
          description="The evaluation visit and the notes you'd share with the house. It informs the go or no-go."
        />

        {tastings.map((t) => (
          <Card key={t.id}>
            <CardContent>
              <form
                action={updateTastingAction.bind(null, slug, venue.id, t.id)}
                className="space-y-5"
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
                  <div className="flex items-center pb-2.5">
                    <StatusBadge status={t.outcome} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feedback-${t.id}`}>Notes</Label>
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
            <CardTitle>Record a tasting</CardTitle>
            <CardDescription>
              Add the visit now and complete the notes afterwards.
            </CardDescription>
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
                  placeholder="Booked for six of the committee…"
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
        <section className="space-y-4">
          <SectionHeading title="Luncheons held here" count={lunches.length} />
          <ul className="divide-y divide-border">
            {lunches.map((l) => (
              <li key={l.id} className="flex items-center gap-4 py-3 text-sm">
                <span className="text-numeral w-28 shrink-0 text-muted-foreground">
                  {fmtDateShort(l.lunch_date)}
                </span>
                <Link
                  href={`/c/${slug}/lunches/${l.id}`}
                  className="club-link min-w-0 flex-1 truncate text-foreground"
                >
                  {l.title}
                </Link>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-6">
        <RuleLabel>Housekeeping</RuleLabel>
        <form action={deleteVenueAction.bind(null, slug, venue.id)}>
          <ConfirmSubmit
            confirmTitle={lunches.length > 0 ? "Archive venue?" : "Delete venue?"}
            confirmMessage={
              lunches.length > 0
                ? `${venue.name} has lunch history, so it will be archived rather than deleted.`
                : `This permanently deletes ${venue.name}.`
            }
            confirmLabel={lunches.length > 0 ? "Archive venue" : "Delete venue"}
            variant="destructive"
          >
            {lunches.length > 0 ? "Archive venue" : "Delete venue"}
          </ConfirmSubmit>
        </form>
      </section>
    </div>
  );
}
