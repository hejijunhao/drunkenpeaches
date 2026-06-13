"use client";

import { useActionState, useRef, useState } from "react";
import { LockIcon } from "lucide-react";
import {
  signUpAction,
  cancelMySignupAction,
  updateMyGuestsAction,
  type FormState,
} from "@/app/actions/lunches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/form-error";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSuccessToast } from "@/lib/use-success-toast";

interface SignupCardProps {
  slug: string;
  lunchId: string;
  guestsAllowed: boolean;
  maxGuests: number;
  seatsLeft: number;
  cutoffPassed: boolean;
  mySignup: {
    status: string;
    guest_count: number;
    guest_names: string | null;
  } | null;
}

export function SignupCard({
  slug,
  lunchId,
  guestsAllowed,
  maxGuests,
  seatsLeft,
  cutoffPassed,
  mySignup,
}: SignupCardProps) {
  const [signupState, signupForm, signupPending] = useActionState<
    FormState,
    FormData
  >(signUpAction.bind(null, slug, lunchId), {});
  const [cancelState, cancelForm, cancelPending] = useActionState<
    FormState,
    FormData
  >(cancelMySignupAction.bind(null, slug, lunchId), {});
  const [guestState, guestForm, guestPending] = useActionState<
    FormState,
    FormData
  >(updateMyGuestsAction.bind(null, slug, lunchId), {});
  const [editingGuests, setEditingGuests] = useState(false);
  const [guestCount, setGuestCount] = useState(mySignup?.guest_count ?? 0);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelFormRef = useRef<HTMLFormElement>(null);

  useSuccessToast(signupPending, signupState.error, "You're signed up!");
  useSuccessToast(guestPending, guestState.error, "Guests updated");
  useSuccessToast(cancelPending, cancelState.error, "Your spot was cancelled");

  if (cutoffPassed) {
    return (
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex items-start gap-3 py-5 text-sm text-muted-foreground">
          <LockIcon className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            The sign-up cutoff has passed —{" "}
            {mySignup
              ? "your spot is locked in. Contact the committee if you can no longer make it."
              : "contact the committee if you'd still like to attend."}
            {mySignup ? (
              <span className="ml-2 inline-flex align-middle">
                <StatusBadge status={mySignup.status} />
              </span>
            ) : null}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (mySignup) {
    const confirmed = mySignup.status === "confirmed";
    return (
      <Card className={confirmed ? "border-success/30" : "border-warning/30"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            You&apos;re {confirmed ? "in" : "on the waitlist"}
            <StatusBadge status={mySignup.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mySignup.guest_count > 0 ? (
            <p className="text-sm text-muted-foreground">
              Bringing {mySignup.guest_count} guest
              {mySignup.guest_count > 1 ? "s" : ""}
              {mySignup.guest_names ? ` — ${mySignup.guest_names}` : ""}.
            </p>
          ) : null}

          {guestsAllowed && !editingGuests ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingGuests(true)}
            >
              Change guests
            </Button>
          ) : null}

          {guestsAllowed && editingGuests ? (
            <form
              action={guestForm}
              className="space-y-3 rounded-xl border border-border bg-muted/40 p-4"
            >
              <div className="space-y-2">
                <Label htmlFor="guestCount">Guests (max {maxGuests})</Label>
                <Input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min={0}
                  max={maxGuests}
                  className="w-24"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
              </div>
              {guestCount > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="guestNames">Guest names</Label>
                  <Input
                    id="guestNames"
                    name="guestNames"
                    defaultValue={mySignup.guest_names ?? ""}
                    placeholder="Jane Doe, John Smith"
                  />
                </div>
              ) : null}
              <FormError message={guestState.error} />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={guestPending}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingGuests(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          <form ref={cancelFormRef} action={cancelForm}>
            <FormError message={cancelState.error} />
          </form>
          <Button
            variant="destructive"
            loading={cancelPending}
            onClick={() => setConfirmCancel(true)}
          >
            Cancel my spot
          </Button>
          <ConfirmDialog
            open={confirmCancel}
            onOpenChange={setConfirmCancel}
            destructive
            title="Cancel your spot?"
            description="If this lunch is full, the next person on the waitlist is promoted and emailed."
            confirmLabel="Cancel my spot"
            cancelLabel="Keep my spot"
            onConfirm={() => {
              setConfirmCancel(false);
              cancelFormRef.current?.requestSubmit();
            }}
          />
        </CardContent>
      </Card>
    );
  }

  const willWaitlist = seatsLeft < 1 + guestCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={signupForm} className="space-y-4">
          {guestsAllowed ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="guestCount">
                  Guests (max {maxGuests})
                </Label>
                <Input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min={0}
                  max={maxGuests}
                  className="w-24"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Guests use seats from the same booking.
                </p>
              </div>
              {guestCount > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="guestNames">Guest names</Label>
                  <Input
                    id="guestNames"
                    name="guestNames"
                    placeholder="Jane Doe, John Smith"
                  />
                </div>
              ) : null}
            </>
          ) : null}
          <FormError message={signupState.error} />
          <Button
            type="submit"
            loading={signupPending}
            variant={willWaitlist ? "outline" : "default"}
            className="w-full sm:w-auto"
          >
            {willWaitlist ? "Join the waitlist" : "Sign me up"}
          </Button>
          {willWaitlist ? (
            <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              This lunch is full — you&apos;ll be auto-promoted (and emailed) if
              a spot opens up.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
