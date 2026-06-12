"use client";

import { useActionState, useState } from "react";
import { updateClubSettingsAction } from "@/app/actions/settings";
import type { FormState } from "@/app/actions/auth";
import type { Club } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/form-error";

export function SettingsForm({ slug, club }: { slug: string; club: Club }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateClubSettingsAction.bind(null, slug),
    {}
  );
  const [guestsAllowed, setGuestsAllowed] = useState(club.guests_allowed);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Club name</Label>
        <Input id="name" name="name" defaultValue={club.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cutoffDays">Default sign-up cutoff (days before)</Label>
        <Input
          id="cutoffDays"
          name="cutoffDays"
          type="number"
          min={0}
          max={30}
          defaultValue={club.signup_cutoff_days}
          className="w-24"
        />
        <p className="text-xs text-stone-500">
          After the cutoff, sign-ups and cancellations lock so you can confirm
          the final headcount with the restaurant. Each lunch can override it.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="guestsAllowed">Guests allowed</Label>
            <p className="text-xs text-stone-500">
              Members may bring guests — guests consume seats from the same
              fixed capacity.
            </p>
          </div>
          <Switch
            id="guestsAllowed"
            name="guestsAllowed"
            checked={guestsAllowed}
            onCheckedChange={setGuestsAllowed}
          />
        </div>
        {guestsAllowed && (
          <div className="space-y-2">
            <Label htmlFor="maxGuests">Max guests per member</Label>
            <Input
              id="maxGuests"
              name="maxGuests"
              type="number"
              min={0}
              max={10}
              defaultValue={club.max_guests_per_member}
              className="w-24"
            />
          </div>
        )}
        {!guestsAllowed && (
          <input type="hidden" name="maxGuests" value={club.max_guests_per_member} />
        )}
      </div>

      <FormError message={state.error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
