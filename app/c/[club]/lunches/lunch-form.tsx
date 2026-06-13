"use client";

import { useActionState, useState } from "react";
import { InfoIcon } from "lucide-react";
import {
  createLunchAction,
  updateLunchAction,
  type FormState,
} from "@/app/actions/lunches";
import type { Lunch, Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { FormError } from "@/components/form-error";

interface LunchFormProps {
  slug: string;
  venues: Pick<Venue, "id" | "name" | "status" | "default_capacity">[];
  lunch?: Lunch;
}

const NO_VENUE = "__none__";

export function LunchForm({ slug, venues, lunch }: LunchFormProps) {
  const action = lunch
    ? updateLunchAction.bind(null, slug, lunch.id)
    : createLunchAction.bind(null, slug);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {}
  );

  const [guestsMode, setGuestsMode] = useState(
    lunch
      ? lunch.guests_allowed === null
        ? "inherit"
        : lunch.guests_allowed
          ? "yes"
          : "no"
      : "inherit"
  );
  const [venueId, setVenueId] = useState(lunch?.venue_id ?? NO_VENUE);
  const selectedVenue = venues.find((v) => v.id === venueId);

  const cutoffDefault = lunch?.signup_cutoff_at
    ? new Date(lunch.signup_cutoff_at).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input
        type="hidden"
        name="venueId"
        value={venueId === NO_VENUE ? "" : venueId}
      />
      <input type="hidden" name="guestsMode" value={guestsMode} />

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={lunch?.title ?? ""}
          placeholder="June lunch — last Friday"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Select
          value={venueId}
          onValueChange={(v) => setVenueId(v ?? NO_VENUE)}
        >
          <SelectTrigger id="venue" className="w-full">
            <SelectValue placeholder="— no venue yet —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_VENUE}>— no venue yet —</SelectItem>
            {venues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
                {v.status !== "approved" ? ` (${v.status})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Approved venues come from your venue pipeline.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lunchDate">Date</Label>
          <Input
            id="lunchDate"
            name="lunchDate"
            type="date"
            defaultValue={lunch?.lunch_date ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={lunch?.start_time?.slice(0, 5) ?? "12:30"}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={0}
          defaultValue={lunch?.capacity ?? selectedVenue?.default_capacity ?? ""}
          disabled={!!lunch}
          required={!lunch}
        />
        {lunch ? (
          <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            Capacity is changed from the lunch page so the waitlist promotes
            correctly.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            The fixed number of seats from your restaurant booking — sign-ups
            never change it.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cutoffAt">Sign-up cutoff (optional)</Label>
        <Input
          id="cutoffAt"
          name="cutoffAt"
          type="datetime-local"
          defaultValue={cutoffDefault}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to use the club default (set in Settings) when the lunch
          is released. After the cutoff, sign-ups and cancellations lock.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestsMode">Guests</Label>
        <Select
          value={guestsMode}
          onValueChange={(v) => setGuestsMode(v ?? "inherit")}
        >
          <SelectTrigger id="guestsMode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inherit">Use club setting</SelectItem>
            <SelectItem value="yes">Allowed for this lunch</SelectItem>
            <SelectItem value="no">Not allowed for this lunch</SelectItem>
          </SelectContent>
        </Select>
        {guestsMode === "yes" ? (
          <div className="space-y-2 pt-2 duration-(--duration-default) ease-(--ease-out-quint) animate-in fade-in-0 slide-in-from-top-1">
            <Label htmlFor="maxGuests">Max guests per member</Label>
            <Input
              id="maxGuests"
              name="maxGuests"
              type="number"
              min={0}
              max={10}
              className="w-24"
              defaultValue={lunch?.max_guests_per_member ?? 1}
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={lunch?.notes ?? ""}
          placeholder="Menu, dress code, parking…"
        />
      </div>

      <FormError message={state.error} />
      <div className="flex flex-col gap-2">
        <Button type="submit" loading={pending} className="w-fit">
          {lunch ? "Save changes" : "Create lunch (as draft)"}
        </Button>
        {!lunch ? (
          <p className="text-xs text-muted-foreground">
            Lunches start as hidden drafts — release it to members from the
            lunch page when you&apos;re ready.
          </p>
        ) : null}
      </div>
    </form>
  );
}
