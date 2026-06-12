import Link from "next/link";
import { notFound } from "next/navigation";
import { getClubContext } from "@/lib/club-context";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, fmtTime, fmtDateTime } from "@/lib/format";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBanner } from "@/components/error-banner";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { SignupCard } from "./signup-card";

type SignupRow = Signup & {
  memberships: Pick<
    Membership,
    "id" | "full_name" | "email" | "dietary_notes"
  > | null;
};

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
  const policy = guestPolicy(ctx.club, lunch);
  const cutoffPassed =
    !!lunch.signup_cutoff_at && new Date(lunch.signup_cutoff_at) < new Date();
  const mySignup =
    signups.find(
      (s) => s.membership_id === ctx.membership.id && s.status !== "cancelled"
    ) ?? null;

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

  return (
    <div className="space-y-8">
      <ErrorBanner message={error} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">
              {lunch.title}
            </h1>
            <StatusBadge status={lunch.status} />
          </div>
          <p className="mt-1 text-stone-600">
            {fmtDate(lunch.lunch_date)} at {fmtTime(lunch.start_time)}
          </p>
          {lunch.venues && (
            <p className="text-sm text-stone-500">
              {lunch.venues.name}
              {lunch.venues.address ? ` · ${lunch.venues.address}` : ""}
            </p>
          )}
          {lunch.signup_cutoff_at && lunch.status === "released" && (
            <p className="text-sm text-stone-500 mt-1">
              Sign-ups {cutoffPassed ? "locked since" : "lock at"}{" "}
              {fmtDateTime(lunch.signup_cutoff_at)}
            </p>
          )}
          {lunch.notes && (
            <p className="mt-3 text-sm text-stone-600 whitespace-pre-line">
              {lunch.notes}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold">
            {taken}
            <span className="text-stone-400">/{lunch.capacity}</span>
          </p>
          <p className="text-sm text-stone-500">seats taken</p>
          {taken > lunch.capacity && (
            <p className="text-xs text-red-600 font-medium mt-1">
              over capacity — resolve before the lunch
            </p>
          )}
        </div>
      </div>

      {/* Member sign-up */}
      {lunch.status === "released" && (
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
      )}

      {/* Who's coming */}
      {lunch.status !== "draft" && (
        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Confirmed ({confirmed.length}
                {confirmed.some((s) => s.guest_count > 0) &&
                  ` + ${confirmed.reduce((n, s) => n + s.guest_count, 0)} guests`}
                )
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confirmed.length === 0 ? (
                <p className="text-sm text-stone-500">No one yet — be first!</p>
              ) : (
                <ul className="space-y-2">
                  {confirmed.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        {s.memberships?.full_name ?? "Unknown"}
                        {s.guest_count > 0 && (
                          <span className="text-stone-500">
                            {" "}
                            +{s.guest_count}
                            {s.guest_names ? ` (${s.guest_names})` : ""}
                          </span>
                        )}
                        {s.added_by_committee && (
                          <span className="text-xs text-stone-400 ml-1">
                            (added by committee)
                          </span>
                        )}
                      </span>
                      {ctx.isCommittee && lunch.status === "released" && (
                        <form
                          action={committeeRemoveSignupAction.bind(
                            null,
                            slug,
                            lunch.id,
                            s.id
                          )}
                        >
                          <ConfirmSubmit
                            confirmMessage={`Remove ${s.memberships?.full_name} from this lunch?`}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 h-7"
                          >
                            Remove
                          </ConfirmSubmit>
                        </form>
                      )}
                      {ctx.isCommittee && lunch.status === "completed" && (
                        <span className="flex gap-1">
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
                              className="h-7 px-2 text-xs"
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
                              variant={s.attended === false ? "default" : "outline"}
                              size="sm"
                              className="h-7 px-2 text-xs"
                            >
                              No-show
                            </Button>
                          </form>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Waitlist ({waitlisted.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waitlisted.length === 0 ? (
                <p className="text-sm text-stone-500">Empty — seats available.</p>
              ) : (
                <ol className="space-y-2 list-decimal list-inside">
                  {waitlisted.map((s) => (
                    <li
                      key={s.id}
                      className="text-sm flex items-center justify-between gap-2"
                    >
                      <span>
                        {s.memberships?.full_name ?? "Unknown"}
                        {s.guest_count > 0 && (
                          <span className="text-stone-500"> +{s.guest_count}</span>
                        )}
                      </span>
                      {ctx.isCommittee && (
                        <form
                          action={committeeRemoveSignupAction.bind(
                            null,
                            slug,
                            lunch.id,
                            s.id
                          )}
                        >
                          <ConfirmSubmit
                            confirmMessage={`Remove ${s.memberships?.full_name} from the waitlist?`}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 h-7"
                          >
                            Remove
                          </ConfirmSubmit>
                        </form>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Committee panel */}
      {ctx.isCommittee && (
        <section className="space-y-6">
          <Separator />
          <h2 className="text-lg font-medium">Committee</h2>

          <div className="flex flex-wrap gap-2">
            {lunch.status === "draft" && (
              <form action={releaseLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit confirmMessage="Release this lunch to members? They'll see it next time they log in (no email is sent).">
                  Release to members
                </ConfirmSubmit>
              </form>
            )}
            <Button
              variant="outline"
              render={<Link href={`/c/${slug}/lunches/${lunch.id}/edit`} />}
            >
              Edit details
            </Button>
            {lunch.status === "released" && (
              <form action={completeLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit
                  confirmMessage="Mark this lunch as completed? You can then record attendance."
                  variant="outline"
                >
                  Mark completed
                </ConfirmSubmit>
              </form>
            )}
            {(lunch.status === "draft" || lunch.status === "released") && (
              <form action={cancelLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit
                  confirmMessage="Cancel this lunch? Everyone signed up or waitlisted will be emailed."
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel lunch
                </ConfirmSubmit>
              </form>
            )}
            {lunch.status === "draft" && (
              <form action={deleteDraftLunchAction.bind(null, slug, lunch.id)}>
                <ConfirmSubmit
                  confirmMessage="Delete this draft lunch permanently?"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  Delete draft
                </ConfirmSubmit>
              </form>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Capacity (X)</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  action={setCapacityAction.bind(null, slug, lunch.id)}
                  className="flex items-end gap-2"
                >
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="capacity">
                      Seats booked at the restaurant
                    </Label>
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
                <p className="mt-2 text-xs text-stone-500">
                  Raising it auto-promotes the waitlist (with emails). Lowering
                  it never bumps confirmed attendees — resolve overages by hand.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sign-up cutoff</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  action={setCutoffAction.bind(null, slug, lunch.id)}
                  className="flex items-end gap-2"
                >
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="cutoffAt">
                      {cutoffPassed ? "Locked — move it to reopen" : "Locks at"}
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
                <p className="mt-2 text-xs text-stone-500">
                  Clear it to leave sign-ups open until the lunch.
                </p>
              </CardContent>
            </Card>
          </div>

          {(lunch.status === "draft" || lunch.status === "released") &&
            addable.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Manually add a member
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    action={committeeAddSignupAction.bind(null, slug, lunch.id)}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="membershipId">Member</Label>
                      <select
                        id="membershipId"
                        name="membershipId"
                        className="flex h-9 min-w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                        required
                      >
                        <option value="">Pick a member…</option>
                        {addable.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.full_name || m.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addGuests">Guests</Label>
                      <Input
                        id="addGuests"
                        name="guestCount"
                        type="number"
                        min={0}
                        defaultValue={0}
                        className="w-20"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm pb-2">
                      <Checkbox name="force" />
                      Seat even if full (override)
                    </label>
                    <Button type="submit" variant="outline">
                      Add
                    </Button>
                  </form>
                  <p className="mt-2 text-xs text-stone-500">
                    Ignores the cutoff. Without the override, they join the
                    waitlist when the lunch is full.
                  </p>
                </CardContent>
              </Card>
            )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Restaurant list — dietary notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confirmed.length === 0 ? (
                <p className="text-sm text-stone-500">No confirmed attendees yet.</p>
              ) : (
                <div className="text-sm space-y-1 font-mono bg-stone-50 rounded-md border p-4">
                  <p>
                    {lunch.title} — {fmtDate(lunch.lunch_date)} — final headcount:{" "}
                    {taken}
                  </p>
                  <p>&nbsp;</p>
                  {confirmed.map((s) => (
                    <p key={s.id}>
                      {s.memberships?.full_name}
                      {s.guest_count > 0 &&
                        ` + ${s.guest_count} guest${s.guest_count > 1 ? "s" : ""}${s.guest_names ? ` (${s.guest_names})` : ""}`}
                    </p>
                  ))}
                  {dietary.length > 0 && (
                    <>
                      <p>&nbsp;</p>
                      <p>Dietary:</p>
                      {dietary.map((d, i) => (
                        <p key={i}>- {d}</p>
                      ))}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wine Master corner */}
          {ctx.isWineMaster && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  🍷 Wine selection & pairing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lunchWines.length === 0 ? (
                  <p className="text-sm text-stone-500">
                    No wines selected for this lunch yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {lunchWines.map((lw) => (
                      <li
                        key={lw.id}
                        className="flex items-start justify-between gap-2 text-sm"
                      >
                        <span>
                          <span className="font-medium">
                            {lw.wines?.name}
                            {lw.wines?.vintage ? ` ${lw.wines.vintage}` : ""}
                          </span>
                          <span className="text-stone-500">
                            {" "}
                            ({lw.wines?.source === "cellar" ? "club cellar" : "restaurant list"})
                          </span>
                          {lw.pairing_notes && (
                            <span className="block text-stone-600">
                              {lw.pairing_notes}
                            </span>
                          )}
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
                            className="text-red-600 h-7"
                          >
                            Remove
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                {wines.length === 0 ? (
                  <p className="text-sm text-stone-500">
                    Your cellar is empty —{" "}
                    <Link
                      href={`/c/${slug}/wine`}
                      className="underline underline-offset-4"
                    >
                      add wines to the catalogue
                    </Link>{" "}
                    first.
                  </p>
                ) : (
                  <form
                    action={addLunchWineAction.bind(null, slug, lunch.id)}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="wineId">Wine</Label>
                      <select
                        id="wineId"
                        name="wineId"
                        className="flex h-9 min-w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                        required
                      >
                        <option value="">Pick a wine…</option>
                        {wines.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                            {w.vintage ? ` ${w.vintage}` : ""} ·{" "}
                            {w.source === "cellar" ? "cellar" : "restaurant"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 flex-1 min-w-48">
                      <Label htmlFor="pairingNotes">Pairing</Label>
                      <Input
                        id="pairingNotes"
                        name="pairingNotes"
                        placeholder="With the main — ribeye"
                      />
                    </div>
                    <Button type="submit" variant="outline">
                      Add wine
                    </Button>
                  </form>
                )}
                <p className="text-xs text-stone-500">
                  Members never see this — the blind tasting stays in the room.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
