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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  useSuccessToast(signupPending, signupState.error, "Your name is on the list");
  useSuccessToast(guestPending, guestState.error, "Guests updated");
  useSuccessToast(cancelPending, cancelState.error, "Your name has been withdrawn");

  if (cutoffPassed) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        <LockIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          The list is closed.{" "}
          {mySignup
            ? "Your place stands. Write to the committee if you can no longer attend."
            : "Write to the committee if you still wish to attend."}
          {mySignup ? (
            <span className="ml-2 inline-flex align-middle">
              <StatusBadge status={mySignup.status} />
            </span>
          ) : null}
        </p>
      </div>
    );
  }

  if (mySignup) {
    const confirmed = mySignup.status === "confirmed";
    return (
      <Card className="club-notice">
        <CardHeader>
          <CardTitle serif className="flex flex-wrap items-center gap-3">
            {confirmed ? "Your name is on the list." : "You are waiting for a place."}
            <StatusBadge status={mySignup.status} />
          </CardTitle>
          <CardDescription>
            {confirmed
              ? "We look forward to seeing you."
              : "Should a place come free, it is offered to the first name waiting, and you will be written to."}
            {mySignup.guest_count > 0
              ? ` Bringing ${mySignup.guest_count} guest${
                  mySignup.guest_count > 1 ? "s" : ""
                }${mySignup.guest_names ? ` — ${mySignup.guest_names}` : ""}.`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {guestsAllowed && editingGuests ? (
            <form
              action={guestForm}
              className="space-y-4 rounded-sm border border-border bg-background p-4"
            >
              <div className="space-y-2">
                <Label htmlFor="guestCount">Guests (up to {maxGuests})</Label>
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

          <div className="flex flex-wrap gap-2">
            {guestsAllowed && !editingGuests ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingGuests(true)}
              >
                Change guests
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              loading={cancelPending}
              onClick={() => setConfirmCancel(true)}
            >
              Withdraw my name
            </Button>
          </div>
          <ConfirmDialog
            open={confirmCancel}
            onOpenChange={setConfirmCancel}
            destructive
            title="Withdraw your name?"
            description="If the table is full, the first name waiting is offered your place and written to."
            confirmLabel="Withdraw"
            cancelLabel="Keep my place"
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
    <Card className="club-notice">
      <CardHeader>
        <CardTitle serif>Add your name</CardTitle>
        <CardDescription>
          Places are given in order of name.
          {guestsAllowed
            ? " Guests occupy places from the same booking."
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signupForm} className="space-y-5">
          {guestsAllowed ? (
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
              <div className="space-y-2">
                <Label htmlFor="guestCount">Guests (up to {maxGuests})</Label>
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
              </div>
              {guestCount > 0 ? (
                <div className="space-y-2 duration-(--duration-default) ease-(--ease-out-quint) animate-in fade-in-0">
                  <Label htmlFor="guestNames">Guest names</Label>
                  <Input
                    id="guestNames"
                    name="guestNames"
                    placeholder="Jane Doe, John Smith"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <FormError message={signupState.error} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              loading={signupPending}
              variant={willWaitlist ? "outline" : "default"}
              className="w-full sm:w-auto"
            >
              {willWaitlist ? "Join the waiting list" : "Add my name"}
            </Button>
            {willWaitlist ? (
              <p className="text-sm text-muted-foreground">
                The table is full. You will be offered a place, and written to,
                should one come free.
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
