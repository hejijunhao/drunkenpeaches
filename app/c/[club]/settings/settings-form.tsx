"use client";

import { useActionState, useState } from "react";
import { updateClubSettingsAction } from "@/app/actions/settings";
import type { FormState } from "@/app/actions/auth";
import type { Club } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/form-error";
import { useSuccessToast } from "@/lib/use-success-toast";

export function SettingsForm({ slug, club }: { slug: string; club: Club }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateClubSettingsAction.bind(null, slug),
    {}
  );
  const [guestsAllowed, setGuestsAllowed] = useState(club.guests_allowed);

  useSuccessToast(pending, state.error, "Settings saved");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Club name</Label>
            <Input id="name" name="name" defaultValue={club.name} required />
          </div>
          <div className="space-y-2">
            <Label>Club URL</Label>
            <div className="flex h-9 items-center rounded-lg border border-border bg-muted/50 px-3 font-mono text-sm text-muted-foreground">
              /c/{club.slug}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign-ups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
          <p className="text-xs text-muted-foreground">
            After the cutoff, sign-ups and cancellations lock so you can confirm
            the final headcount with the restaurant. Each lunch can override it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="guestsAllowed">Guests allowed</Label>
              <p className="text-xs text-muted-foreground">
                Members may bring guests — guests consume seats from the same
                fixed capacity.
              </p>
            </div>
            <Switch
              id="guestsAllowed"
              name="guestsAllowed"
              value="on"
              checked={guestsAllowed}
              onCheckedChange={setGuestsAllowed}
            />
          </div>
          {guestsAllowed ? (
            <div className="space-y-2 duration-(--duration-default) ease-(--ease-out-quint) animate-in fade-in-0 slide-in-from-top-1">
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
          ) : (
            <input
              type="hidden"
              name="maxGuests"
              value={club.max_guests_per_member}
            />
          )}
        </CardContent>
      </Card>

      <FormError message={state.error} />
      <Button type="submit" loading={pending}>
        Save settings
      </Button>
    </form>
  );
}
