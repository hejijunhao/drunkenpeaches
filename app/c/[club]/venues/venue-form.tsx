"use client";

import { useActionState, useRef, useEffect } from "react";
import { createVenueAction, updateVenueAction } from "@/app/actions/venues";
import type { FormState } from "@/app/actions/auth";
import type { Venue } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";
import { useSuccessToast } from "@/lib/use-success-toast";

export function VenueForm({
  slug,
  venue,
  onSuccess,
}: {
  slug: string;
  venue?: Venue;
  /** Called after a successful create/update (e.g. to close a dialog). */
  onSuccess?: () => void;
}) {
  const action = venue
    ? updateVenueAction.bind(null, slug, venue.id)
    : createVenueAction.bind(null, slug);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useSuccessToast(pending, state.error, venue ? "Venue saved" : "Venue added");

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      if (!venue) formRef.current?.reset();
      onSuccess?.();
    }
    if (pending) submitted.current = true;
  }, [pending, state, venue, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Restaurant name</Label>
        <Input id="name" name="name" defaultValue={venue?.name ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={venue?.address ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact">Contact (name / phone)</Label>
          <Input
            id="contact"
            name="contact"
            defaultValue={venue?.contact ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultCapacity">Private room capacity</Label>
          <Input
            id="defaultCapacity"
            name="defaultCapacity"
            type="number"
            min={1}
            defaultValue={venue?.default_capacity ?? ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={venue?.notes ?? ""}
          placeholder="Why it's a candidate, price point, private room details…"
        />
      </div>
      <FormError message={state.error} />
      <Button
        type="submit"
        loading={pending}
        variant={venue ? "default" : "outline"}
      >
        {venue ? "Save venue" : "Add candidate venue"}
      </Button>
    </form>
  );
}
