"use client";

import { useActionState } from "react";
import { updateMyProfileAction } from "@/app/actions/members";
import type { FormState } from "@/app/actions/auth";
import type { Membership } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";

export function ProfileForm({
  slug,
  membership,
}: {
  slug: string;
  membership: Membership;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateMyProfileAction.bind(null, slug),
    {}
  );
  const saved = !!state.success;

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="fullName">Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={membership.full_name}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={membership.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={membership.phone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dietary">Dietary preferences</Label>
        <Textarea
          id="dietary"
          name="dietary"
          rows={3}
          defaultValue={membership.dietary_notes ?? ""}
          placeholder="e.g. no shellfish, vegetarian…"
        />
        <p className="text-xs text-stone-500">
          The committee shares these with the restaurant before each lunch.
        </p>
      </div>
      <FormError message={state.error} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        {saved && <span className="text-sm text-emerald-700">Saved ✓</span>}
      </div>
    </form>
  );
}
