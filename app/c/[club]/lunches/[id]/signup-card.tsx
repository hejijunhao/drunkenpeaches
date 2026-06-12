"use client";

import { useActionState, useState } from "react";
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

interface SignupCardProps {
  slug: string;
  lunchId: string;
  guestsAllowed: boolean;
  maxGuests: number;
  seatsLeft: number;
  cutoffPassed: boolean;
  mySignup: { status: string; guest_count: number; guest_names: string | null } | null;
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

  if (cutoffPassed) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-stone-600">
          The sign-up cutoff has passed —{" "}
          {mySignup
            ? "your spot is locked in. Contact the committee if you can no longer make it."
            : "contact the committee if you'd still like to attend."}
          {mySignup && (
            <span className="ml-2">
              <StatusBadge status={mySignup.status} />
            </span>
          )}
        </CardContent>
      </Card>
    );
  }

  if (mySignup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            You&apos;re {mySignup.status === "confirmed" ? "in" : "on the waitlist"}
            <StatusBadge status={mySignup.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mySignup.guest_count > 0 && (
            <p className="text-sm text-stone-600">
              Bringing {mySignup.guest_count} guest
              {mySignup.guest_count > 1 ? "s" : ""}
              {mySignup.guest_names ? ` — ${mySignup.guest_names}` : ""}.
            </p>
          )}

          {guestsAllowed && !editingGuests && (
            <Button variant="outline" size="sm" onClick={() => setEditingGuests(true)}>
              Change guests
            </Button>
          )}

          {guestsAllowed && editingGuests && (
            <form action={guestForm} className="space-y-3 rounded-md border p-3">
              <div className="space-y-2">
                <Label htmlFor="guestCount">Guests (max {maxGuests})</Label>
                <Input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min={0}
                  max={maxGuests}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
              </div>
              {guestCount > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="guestNames">Guest names</Label>
                  <Input
                    id="guestNames"
                    name="guestNames"
                    defaultValue={mySignup.guest_names ?? ""}
                    placeholder="Jane Doe, John Smith"
                  />
                </div>
              )}
              <FormError message={guestState.error} />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={guestPending}>
                  {guestPending ? "Saving…" : "Save"}
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
          )}

          <form action={cancelForm}>
            <FormError message={cancelState.error} />
            <Button
              type="submit"
              variant="outline"
              disabled={cancelPending}
              onClick={(e) => {
                if (!window.confirm("Cancel your spot for this lunch?"))
                  e.preventDefault();
              }}
              className="text-red-600 hover:text-red-700"
            >
              {cancelPending ? "Cancelling…" : "Cancel my spot"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  const willWaitlist = seatsLeft < 1 + guestCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sign up</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={signupForm} className="space-y-4">
          {guestsAllowed && (
            <>
              <div className="space-y-2">
                <Label htmlFor="guestCount">
                  Guests (max {maxGuests}) — guests use seats from the same
                  booking
                </Label>
                <Input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min={0}
                  max={maxGuests}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 0)}
                />
              </div>
              {guestCount > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="guestNames">Guest names</Label>
                  <Input
                    id="guestNames"
                    name="guestNames"
                    placeholder="Jane Doe, John Smith"
                  />
                </div>
              )}
            </>
          )}
          <FormError message={signupState.error} />
          <Button type="submit" disabled={signupPending} className="w-full sm:w-auto">
            {signupPending
              ? "Signing up…"
              : willWaitlist
                ? "Join the waitlist"
                : "Sign me up"}
          </Button>
          {willWaitlist && (
            <p className="text-xs text-stone-500">
              This lunch is full — you&apos;ll be auto-promoted (and emailed)
              if a spot opens up.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
