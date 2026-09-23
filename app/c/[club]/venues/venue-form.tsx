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
import { FormFooter, FormSection } from "@/components/form-section";
import { useSuccessToast } from "@/lib/use-success-toast";

export function VenueForm({
  slug,
  venue,
  onSuccess,
  compact = false,
}: {
  slug: string;
  venue?: Venue;
  /** Called after a successful create/update (e.g. to close a dialog). */
  onSuccess?: () => void;
  /** Single-column layout for dialogs. */
  compact?: boolean;
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

  useSuccessToast(pending, state.error, venue ? "Venue saved" : "Venue proposed");

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      if (!venue) formRef.current?.reset();
      onSuccess?.();
    }
    if (pending) submitted.current = true;
  }, [pending, state, venue, onSuccess]);

  const fields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Restaurant</Label>
        <Input id="name" name="name" defaultValue={venue?.name ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={venue?.address ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact">Contact (name, telephone)</Label>
          <Input
            id="contact"
            name="contact"
            defaultValue={venue?.contact ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultCapacity">Private room, places</Label>
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
          placeholder="Why it's a candidate, price point, the room…"
        />
      </div>
    </>
  );

  if (compact) {
    return (
      <form ref={formRef} action={formAction} className="space-y-4">
        {fields}
        <FormError message={state.error} />
        <div className="flex justify-end pt-1">
          <Button type="submit" loading={pending}>
            {venue ? "Save venue" : "Propose venue"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="max-w-4xl space-y-8">
      <FormSection
        title="Details"
        description="Where it is, whom to call, and how many the private room seats."
        className="border-t-0 pt-0 md:pt-0"
      >
        {fields}
      </FormSection>
      <FormFooter>
        <Button type="submit" loading={pending}>
          {venue ? "Save venue" : "Propose venue"}
        </Button>
        <FormError message={state.error} />
      </FormFooter>
    </form>
  );
}
