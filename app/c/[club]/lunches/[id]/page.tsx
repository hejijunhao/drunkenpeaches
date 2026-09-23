import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon, UserPlusIcon } from "lucide-react";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import {
  fmtDate,
  fmtTime,
  fmtDateTime,
  initials,
  relativeDays,
} from "@/lib/format";
import {
  guestPolicy,
  seatsTaken,
  type Lunch,
  type Membership,
  type Signup,
  type Wine,
  type LunchWine,
} from "@/lib/types";
import {
  releaseLunchAction,
  completeLunchAction,
  cancelLunchAction,
  deleteDraftLunchAction,
  setCapacityAction,
  setCutoffAction,
  committeeAddSignupAction,
  committeeRemoveSignupAction,
  markAttendanceAction,
} from "@/app/actions/lunches";
import { addLunchWineAction, removeLunchWineAction } from "@/app/actions/wine";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { SeatMeter } from "@/components/seat-meter";
import { CopyButton } from "@/components/copy-button";
import { RuleLabel, SectionHeading } from "@/components/section-heading";
import { SignupCard } from "./signup-card";

type SignupRow = Signup & {
  memberships: Pick<
    Membership,
    "id" | "full_name" | "email" | "dietary_notes"
  > | null;
};

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="club-kicker text-[0.625rem]">{label}</dt>
      <dd className="mt-1.5 text-[0.95rem] text-foreground">{children}</dd>
    </div>
  );
}

export default async function LunchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ club: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { club: slug, id } = await params;
  const { error } = await searchParams;
  const ctx = await getClubContext(slug);
  const supabase = await createClient();

  const { data: lunchData } = await supabase
    .from("lunches")
    .select("*, venues(id, name, address)")
    .eq("id", id)
    .eq("club_id", ctx.club.id)
    .single();
  if (!lunchData) notFound();
  const lunch = lunchData as Lunch & {
    venues: { id: string; name: string; address: string | null } | null;
  };

  const { data: signupData } = await supabase
    .from("signups")
    .select("*, memberships(id, full_name, email, dietary_notes)")
    .eq("lunch_id", id)
    .order("created_at");
  const signups = (signupData ?? []) as SignupRow[];

  const confirmed = signups.filter((s) => s.status === "confirmed");
  const waitlisted = signups.filter((s) => s.status === "waitlisted");
  const taken = seatsTaken(signups);
  const seatsLeft = Math.max(0, lunch.capacity - taken);
  const overCapacity = taken > lunch.capacity;
  const policy = guestPolicy(ctx.club, lunch);
  const cutoffPassed =
    !!lunch.signup_cutoff_at && new Date(lunch.signup_cutoff_at) < new Date();
  const mySignup =
    signups.find(
      (s) => s.membership_id === ctx.membership.id && s.status !== "cancelled"
    ) ?? null;
  const guestTotal = confirmed.reduce((n, s) => n + s.guest_count, 0);

  // Committee extras
  let roster: Pick<Membership, "id" | "full_name" | "email">[] = [];
  let wines: Wine[] = [];
  let lunchWines: (LunchWine & { wines: Wine | null })[] = [];
  if (ctx.isCommittee) {
    const [{ data: r }, { data: w }, { data: lw }] = await Promise.all([
      supabase
        .from("memberships")
        .select("id, full_name, email")
        .eq("club_id", ctx.club.id)
        .eq("status", "active")
        .order("full_name"),
      supabase
        .from("wines")
        .select("*")
        .eq("club_id", ctx.club.id)
        .order("name"),
      supabase
        .from("lunch_wines")
        .select("*, wines(*)")
        .eq("lunch_id", id)
        .order("created_at"),
    ]);
    roster = (r ?? []) as Pick<Membership, "id" | "full_name" | "email">[];
    wines = (w ?? []) as Wine[];
    lunchWines = (lw ?? []) as (LunchWine & { wines: Wine | null })[];
  }
  const signedUpIds = new Set(
    signups.filter((s) => s.status !== "cancelled").map((s) => s.membership_id)
  );
  const addable = roster.filter((m) => !signedUpIds.has(m.id));

  const dietary = confirmed
    .filter((s) => s.memberships?.dietary_notes)
    .map((s) => `${s.memberships!.full_name}: ${s.memberships!.dietary_notes}`);

  const restaurantList = [
    `${lunch.title} — ${fmtDate(lunch.lunch_date)} — final headcount: ${taken}`,
    "",
    ...confirmed.map(
      (s) =>
        `${s.memberships?.full_name}${
          s.guest_count > 0
            ? ` + ${s.guest_count} guest${s.guest_count > 1 ? "s" : ""}${
                s.guest_names ? ` (${s.guest_names})` : ""
              }`
            : ""
        }`
    ),
    ...(dietary.length ? ["", "Dietary:", ...dietary.map((d) => `- ${d}`)] : []),
  ].join("\n");

  const past = lunch.status === "completed" || lunch.status === "cancelled";

  return (
    <div className="space-y-12">
      <ErrorBanner message={error} />

      {/* Header */}
      <header className="space-y-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-5">
            <p className="club-kicker">
              Luncheon{!past ? ` · ${relativeDays(lunch.lunch_date)}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-h1 text-balance text-foreground">{lunch.title}</h1>
              <StatusBadge status={lunch.status} />
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-12">
              <Meta label="Date">{fmtDate(lunch.lunch_date)}</Meta>
              <Meta label="Time">{fmtTime(lunch.start_time)}</Meta>
              {lunch.venues ? (
                <Meta label="Table">
                  {lunch.venues.name}
                  {lunch.venues.address ? (
                    <span className="block text-sm text-muted-foreground">
                      {lunch.venues.address}
                    </span>
                  ) : null}
                </Meta>
              ) : null}
              {lunch.signup_cutoff_at && lunch.status === "released" ? (
                <Meta label={cutoffPassed ? "The list closed" : "The list closes"}>
                  {fmtDateTime(lunch.signup_cutoff_at)}
                </Meta>
              ) : null}
            </dl>
            {lunch.notes ? (
              <p className="max-w-prose text-[0.95rem] leading-relaxed whitespace-pre-line text-muted-foreground">
                {lunch.notes}
              </p>
            ) : null}
          </div>

          {lunch.status !== "draft" ? (
            <div className="w-full shrink-0 rounded-lg border border-border bg-card p-5 md:w-72">
              <p className="club-kicker mb-4">The table</p>
              <SeatMeter
                taken={taken}
                capacity={lunch.capacity}
                waitlisted={waitlisted.length}
              />
              {overCapacity ? (
                <p className="mt-3 text-xs text-destructive">
                  Over capacity — resolve before the lunch.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="club-rule-strong" />
      </header>

      {/* Member sign-up */}
      {lunch.status === "released" ? (
        <SignupCard
          slug={slug}
          lunchId={lunch.id}
          guestsAllowed={policy.allowed}
          maxGuests={policy.maxPerMember}
          seatsLeft={seatsLeft}
          cutoffPassed={cutoffPassed}
          mySignup={
            mySignup
              ? {
                  status: mySignup.status,
                  guest_count: mySignup.guest_count,
                  guest_names: mySignup.guest_names,
                }
              : null
          }
        />
      ) : null}

      {/* The list */}
      {lunch.status !== "draft" ? (
        <section className="grid gap-10 md:grid-cols-2 md:gap-12">
          <div className="space-y-1">
            <SectionHeading
              title="The list"
              count={confirmed.length}
              description={
                guestTotal > 0
                  ? `Plus ${guestTotal} guest${guestTotal === 1 ? "" : "s"} — ${taken} at table.`
                  : undefined
              }
            />
            {confirmed.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                No names yet. The list is open.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {confirmed.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-numeral w-5 shrink-0 text-right text-sm text-muted-foreground">
                        {i + 1}
                      </span>
                      <Avatar size="sm">
                        <AvatarFallback>
                          {initials(s.memberships?.full_name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">
                          {s.memberships?.full_name ?? "Unknown"}
                        </p>
                        {s.guest_count > 0 || s.added_by_committee ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {s.guest_count > 0
                              ? `+${s.guest_count} guest${s.guest_count > 1 ? "s" : ""}${
                                  s.guest_names ? ` · ${s.guest_names}` : ""
                                }`
                              : null}
                            {s.guest_count > 0 && s.added_by_committee
                              ? " · "
                              : null}
                            {s.added_by_committee ? "added by committee" : null}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {ctx.isCommittee && lunch.status === "released" ? (
                      <form
                        action={committeeRemoveSignupAction.bind(
                          null,
                          slug,
                          lunch.id,
                          s.id
                        )}
                      >
                        <ConfirmSubmit
                          confirmTitle="Remove from the list?"
                          confirmMessage={`Remove ${s.memberships?.full_name} from this lunch? If the table is full, the first name waiting is offered the place.`}
                          confirmLabel="Remove"
                          destructive
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </ConfirmSubmit>
                      </form>
                    ) : null}
                    {ctx.isCommittee && lunch.status === "completed" ? (
                      <div className="flex shrink-0 gap-1">
                        <form
                          action={markAttendanceAction.bind(
                            null,
                            slug,
                            lunch.id,
                            s.id,
                            true
                          )}
                        >
                          <Button
                            type="submit"
                            variant={s.attended === true ? "default" : "outline"}
                            size="sm"
                          >
                            Present
                          </Button>
                        </form>
                        <form
                          action={markAttendanceAction.bind(
                            null,
                            slug,
                            lunch.id,
                            s.id,
                            false
                          )}
                        >
                          <Button
                            type="submit"
                            variant={
                              s.attended === false ? "destructive" : "outline"
                            }
                            size="sm"
                          >
                            No-show
                          </Button>
                        </form>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1">
            <SectionHeading title="Waiting" count={waitlisted.length} />
            {waitlisted.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                No one waiting.{seatsLeft > 0 ? " Places remain." : ""}
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {waitlisted.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-numeral w-5 shrink-0 text-right text-sm text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm text-foreground">
                        {s.memberships?.full_name ?? "Unknown"}
                        {s.guest_count > 0 ? (
                          <span className="text-muted-foreground">
                            {" "}
                            +{s.guest_count}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    {ctx.isCommittee ? (
                      <form
                        action={committeeRemoveSignupAction.bind(
                          null,
                          slug,
                          lunch.id,
                          s.id
                        )}
                      >
                        <ConfirmSubmit
                          confirmTitle="Remove from the waiting list?"
                          confirmMessage={`Remove ${s.memberships?.full_name} from the waiting list?`}
                          confirmLabel="Remove"
                          destructive
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </ConfirmSubmit>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      ) : null}

      {/* Committee */}
      {ctx.isCommittee ? (
        <section className="space-y-8">
          <RuleLabel>Committee</RuleLabel>

          {/* Lifecycle */}
          <div className="flex flex-wrap gap-2">
            {lunch.status === "draft" ? (
              <form action={releaseLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit
                  confirmTitle="Release to members?"
                  confirmMessage="Members will see this lunch the next time they open the book. No email is sent."
                  confirmLabel="Release"
                >
                  Release to members
                </ConfirmSubmit>
              </form>
            ) : null}
            <Button
              variant="outline"
              render={<Link href={`/c/${slug}/lunches/${lunch.id}/edit`} />}
            >
              <PencilIcon />
              Amend details
            </Button>
            {lunch.status === "released" ? (
              <form action={completeLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit
                  confirmTitle="Mark as held?"
                  confirmMessage="The lunch is recorded as held and you can then mark attendance."
                  confirmLabel="Mark as held"
                  variant="outline"
                >
                  Mark as held
                </ConfirmSubmit>
              </form>
            ) : null}
            {lunch.status === "draft" || lunch.status === "released" ? (
              <form action={cancelLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit
                  confirmTitle="Cancel this lunch?"
                  confirmMessage="Everyone on the list and waiting will be written to."
                  confirmLabel="Cancel lunch"
                  variant="destructive"
                >
                  Cancel lunch
                </ConfirmSubmit>
              </form>
            ) : null}
            {lunch.status === "draft" ? (
              <form action={deleteDraftLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit
                  confirmTitle="Delete draft?"
                  confirmMessage="This permanently deletes the draft lunch."
                  confirmLabel="Delete draft"
                  variant="destructive"
                >
                  Delete draft
                </ConfirmSubmit>
              </form>
            ) : null}
          </div>

          {/* Capacity & cutoff */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Capacity</CardTitle>
                <CardDescription>
                  Raising it promotes the waiting list (with emails). Lowering it
                  never bumps confirmed names — resolve overages by hand.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={setCapacityAction.bind(null, slug, lunch.id)}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="capacity">Places booked</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min={0}
                      defaultValue={lunch.capacity}
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Update
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The list closes</CardTitle>
                <CardDescription>
                  After this, sign-ups and withdrawals lock so the headcount can
                  be confirmed with the house. Clear it to leave the list open.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={setCutoffAction.bind(null, slug, lunch.id)}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="cutoffAt">
                      {cutoffPassed ? "Closed — move it to reopen" : "Closes at"}
                    </Label>
                    <Input
                      id="cutoffAt"
                      name="cutoffAt"
                      type="datetime-local"
                      defaultValue={
                        lunch.signup_cutoff_at
                          ? new Date(lunch.signup_cutoff_at)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Save
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Manually add a member */}
          {(lunch.status === "draft" || lunch.status === "released") &&
          addable.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Add a name by hand</CardTitle>
                <CardDescription>
                  For the member who telephones. Ignores the cutoff; without the
                  override they join the waiting list when the table is full.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={committeeAddSignupAction.bind(null, slug, lunch.id)}
                  className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end"
                >
                  <div className="space-y-2">
                    <Label htmlFor="membershipId">Member</Label>
                    <Select name="membershipId" required>
                      <SelectTrigger id="membershipId" className="w-full">
                        <SelectValue placeholder="Choose a member…" />
                      </SelectTrigger>
                      <SelectContent>
                        {addable.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.full_name || m.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addGuests">Guests</Label>
                    <Input
                      id="addGuests"
                      name="guestCount"
                      type="number"
                      min={0}
                      defaultValue={0}
                      className="w-24"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    <UserPlusIcon />
                    Add
                  </Button>
                  <label className="flex items-center gap-2.5 text-sm sm:col-span-3">
                    <Checkbox name="force" />
                    Seat them even if the table is full
                  </label>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {/* Restaurant list */}
          <Card>
            <CardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
              <CardTitle>For the restaurant</CardTitle>
              <CardDescription>
                Final names, guests and dietary notes, ready to send.
              </CardDescription>
              {confirmed.length > 0 ? (
                <div data-slot="card-action" className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <CopyButton text={restaurantList} label="Copy" />
                </div>
              ) : null}
            </CardHeader>
            <CardContent>
              {confirmed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No confirmed names yet.
                </p>
              ) : (
                <pre className="overflow-x-auto rounded-sm border border-border bg-background p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {restaurantList}
                </pre>
              )}
            </CardContent>
          </Card>

          {/* Wine Master */}
          {ctx.isWineMaster ? (
            <Card className="border-gold/50">
              <CardHeader>
                <CardTitle className="text-gold-foreground dark:text-gold">
                  Wine &amp; pairing
                </CardTitle>
                <CardDescription>
                  Members never see this. The blind tasting stays in the room.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {lunchWines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nothing chosen for this lunch yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border border-y border-border">
                    {lunchWines.map((lw) => (
                      <li
                        key={lw.id}
                        className="flex items-start justify-between gap-3 py-3 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-heading text-[1.05rem] text-foreground">
                              {lw.wines?.name}
                              {lw.wines?.vintage ? ` ${lw.wines.vintage}` : ""}
                            </span>
                            <Badge
                              tone={lw.wines?.source === "cellar" ? "info" : "neutral"}
                            >
                              {lw.wines?.source === "cellar"
                                ? "Club cellar"
                                : "House list"}
                            </Badge>
                          </span>
                          {lw.pairing_notes ? (
                            <span className="mt-1 block text-muted-foreground">
                              {lw.pairing_notes}
                            </span>
                          ) : null}
                        </span>
                        <form
                          action={removeLunchWineAction.bind(
                            null,
                            slug,
                            lunch.id,
                            lw.id
                          )}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                {wines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    The cellar is empty —{" "}
                    <Link href={`/c/${slug}/wine`} className="club-link text-foreground">
                      record a few bottles
                    </Link>{" "}
                    first.
                  </p>
                ) : (
                  <form
                    action={addLunchWineAction.bind(null, slug, lunch.id)}
                    className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="wineId">Wine</Label>
                      <Select name="wineId" required>
                        <SelectTrigger id="wineId" className="w-full">
                          <SelectValue placeholder="Choose a wine…" />
                        </SelectTrigger>
                        <SelectContent>
                          {wines.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}
                              {w.vintage ? ` ${w.vintage}` : ""} ·{" "}
                              {w.source === "cellar" ? "cellar" : "house list"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pairingNotes">Pairing</Label>
                      <Input
                        id="pairingNotes"
                        name="pairingNotes"
                        placeholder="With the main — the ribeye"
                      />
                    </div>
                    <Button type="submit" variant="gold">
                      Add wine
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
