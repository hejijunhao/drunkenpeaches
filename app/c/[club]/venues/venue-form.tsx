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

export function VenueForm({ slug, venue }: { slug: string; venue?: Venue }) {
  const action = venue
    ? updateVenueAction.bind(null, slug, venue.id)
    : createVenueAction.bind(null, slug);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!venue && state && !state.error) formRef.current?.reset();
  }, [state, venue]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Restaurant name</Label>
        <Input id="name" name="name" defaultValue={venue?.name ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={venue?.address ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact">Contact (name / phone)</Label>
          <Input id="contact" name="contact" defaultValue={venue?.contact ?? ""} />
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
      <Button type="submit" disabled={pending} variant={venue ? "default" : "outline"}>
        {pending ? "Saving…" : venue ? "Save venue" : "Add candidate venue"}
      </Button>
    </form>
  );
}
