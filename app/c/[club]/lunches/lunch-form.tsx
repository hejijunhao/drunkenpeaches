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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/form-error";
import { FormFooter, FormSection } from "@/components/form-section";

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
    <form action={formAction} className="max-w-4xl space-y-8">
      <input
        type="hidden"
        name="venueId"
        value={venueId === NO_VENUE ? "" : venueId}
      />
      <input type="hidden" name="guestsMode" value={guestsMode} />

      <FormSection
        title="The table"
        description="Book the restaurant first. The number of places comes from that booking and never from sign-ups."
        className="border-t-0 pt-0 md:pt-0"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={lunch?.title ?? ""}
            placeholder="June luncheon — last Friday"
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
              <SelectValue placeholder="No venue yet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_VENUE}>No venue yet</SelectItem>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                  {v.status !== "approved" ? ` (${v.status})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            From the venue pipeline. Approved houses are ready for a table.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
          <div className="space-y-2">
            <Label htmlFor="capacity">Places</Label>
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
          </div>
        </div>
        {lunch ? (
          <p className="text-xs text-muted-foreground">
            Places are changed from the lunch page, so the waiting list is
            promoted correctly.
          </p>
        ) : null}
      </FormSection>

      <FormSection
        title="The list"
        description="When sign-ups lock, and whether members may bring guests to this lunch."
      >
        <div className="space-y-2">
          <Label htmlFor="cutoffAt">The list closes (optional)</Label>
          <Input
            id="cutoffAt"
            name="cutoffAt"
            type="datetime-local"
            defaultValue={cutoffDefault}
            className="sm:max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to use the club default when the lunch is released.
            After the cutoff, sign-ups and withdrawals lock.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
                <SelectItem value="inherit">Club setting</SelectItem>
                <SelectItem value="yes">Allowed for this lunch</SelectItem>
                <SelectItem value="no">Not for this lunch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {guestsMode === "yes" ? (
            <div className="space-y-2 duration-(--duration-default) ease-(--ease-out-quint) animate-in fade-in-0 slide-in-from-top-1">
              <Label htmlFor="maxGuests">Guests per member</Label>
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
      </FormSection>

      <FormSection
        title="Notes"
        description="Anything members should know: the menu, dress, parking."
      >
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={lunch?.notes ?? ""}
            placeholder="Set menu with a choice of main. Jackets, please."
          />
        </div>
      </FormSection>

      <FormFooter>
        <Button type="submit" loading={pending}>
          {lunch ? "Save changes" : "Create as draft"}
        </Button>
        <FormError message={state.error} />
        {!lunch && !state.error ? (
          <p className="text-xs text-muted-foreground">
            Drafts are hidden from members until you release them from the
            lunch page.
          </p>
        ) : null}
      </FormFooter>
    </form>
  );
}
