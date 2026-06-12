"use client";

import { useActionState, useState } from "react";
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
import { FormError } from "@/components/form-error";

interface LunchFormProps {
  slug: string;
  venues: Pick<Venue, "id" | "name" | "status" | "default_capacity">[];
  lunch?: Lunch;
}

export function LunchForm({ slug, venues, lunch }: LunchFormProps) {
  const action = lunch
    ? updateLunchAction.bind(null, slug, lunch.id)
    : createLunchAction.bind(null, slug);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {}
  );

  const [guestsMode, setGuestsMode] = useState(
    lunch ? (lunch.guests_allowed === null ? "inherit" : lunch.guests_allowed ? "yes" : "no") : "inherit"
  );
  const [venueId, setVenueId] = useState(lunch?.venue_id ?? "");
  const selectedVenue = venues.find((v) => v.id === venueId);

  const cutoffDefault = lunch?.signup_cutoff_at
    ? new Date(lunch.signup_cutoff_at).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
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
        <Label htmlFor="venueId">Venue</Label>
        <select
          id="venueId"
          name="venueId"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          <option value="">— no venue yet —</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
              {v.status !== "approved" ? ` (${v.status})` : ""}
            </option>
          ))}
        </select>
        <p className="text-xs text-stone-500">
          Approved venues come from your venue pipeline.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <Label htmlFor="capacity">
          Capacity (X){lunch ? " — change it on the lunch page" : ""}
        </Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={0}
          defaultValue={
            lunch?.capacity ?? selectedVenue?.default_capacity ?? ""
          }
          disabled={!!lunch}
          required={!lunch}
        />
        <p className="text-xs text-stone-500">
          The fixed number of seats from your restaurant booking — sign-ups
          never change it.
          {lunch &&
            " Capacity changes are made from the lunch page so the waitlist is promoted correctly."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cutoffAt">Sign-up cutoff (optional)</Label>
        <Input
          id="cutoffAt"
          name="cutoffAt"
          type="datetime-local"
          defaultValue={cutoffDefault}
        />
        <p className="text-xs text-stone-500">
          Leave blank to use the club default (set in Settings) when the lunch
          is released. After the cutoff, sign-ups and cancellations lock.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestsMode">Guests</Label>
        <select
          id="guestsMode"
          name="guestsMode"
          value={guestsMode}
          onChange={(e) => setGuestsMode(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          <option value="inherit">Use club setting</option>
          <option value="yes">Allowed for this lunch</option>
          <option value="no">Not allowed for this lunch</option>
        </select>
        {guestsMode === "yes" && (
          <div className="pt-2 space-y-2">
            <Label htmlFor="maxGuests">Max guests per member</Label>
            <Input
              id="maxGuests"
              name="maxGuests"
              type="number"
              min={0}
              max={10}
              defaultValue={lunch?.max_guests_per_member ?? 1}
            />
          </div>
        )}
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
      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving…"
          : lunch
            ? "Save changes"
            : "Create lunch (as draft)"}
      </Button>
      {!lunch && (
        <p className="text-xs text-stone-500">
          Lunches start as hidden drafts — release it to members from the lunch
          page when you&apos;re ready.
        </p>
      )}
    </form>
  );
}
