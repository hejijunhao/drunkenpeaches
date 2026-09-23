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
import { FormFooter, FormSection } from "@/components/form-section";
import { useSuccessToast } from "@/lib/use-success-toast";

export function SettingsForm({ slug, club }: { slug: string; club: Club }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateClubSettingsAction.bind(null, slug),
    {}
  );
  const [guestsAllowed, setGuestsAllowed] = useState(club.guests_allowed);

  useSuccessToast(pending, state.error, "Settings saved");

  return (
    <form action={formAction} className="max-w-4xl space-y-8">
      <FormSection
        title="Identity"
        description="How the chapter appears in the book and in members' letters."
        className="border-t-0 pt-0 md:pt-0"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Club name</Label>
          <Input id="name" name="name" defaultValue={club.name} required />
        </div>
        <div className="space-y-2">
          <Label>Club address</Label>
          <div className="flex h-11 items-center rounded-sm border border-border bg-muted/50 px-3 font-mono text-sm text-muted-foreground md:h-10">
            /c/{club.slug}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="The list"
        description="After the cutoff, sign-ups and withdrawals lock so the headcount can be confirmed with the house. Each lunch may override it."
      >
        <div className="space-y-2">
          <Label htmlFor="cutoffDays">The list closes, days before</Label>
          <Input
            id="cutoffDays"
            name="cutoffDays"
            type="number"
            min={0}
            max={30}
            defaultValue={club.signup_cutoff_days}
            className="w-24"
          />
        </div>
      </FormSection>

      <FormSection
        title="Guests"
        description="Whether members may bring guests. Guests occupy places from the same fixed booking."
      >
        <label
          htmlFor="guestsAllowed"
          className="flex items-center justify-between gap-4 rounded-sm border border-border px-4 py-3 text-sm"
        >
          <span>
            <span className="block text-foreground">Guests allowed</span>
            <span className="block text-xs text-muted-foreground">
              Applies to every lunch unless a lunch says otherwise.
            </span>
          </span>
          <Switch
            id="guestsAllowed"
            name="guestsAllowed"
            value="on"
            checked={guestsAllowed}
            onCheckedChange={setGuestsAllowed}
          />
        </label>
        {guestsAllowed ? (
          <div className="space-y-2 duration-(--duration-default) ease-(--ease-out-quint) animate-in fade-in-0 slide-in-from-top-1">
            <Label htmlFor="maxGuests">Guests per member</Label>
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
      </FormSection>

      <FormFooter>
        <Button type="submit" loading={pending}>
          Save settings
        </Button>
        <FormError message={state.error} />
      </FormFooter>
    </form>
  );
}
