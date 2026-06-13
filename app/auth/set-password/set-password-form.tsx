"use client";

import { useActionState } from "react";
import { completeProfileAction, type FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";

export function SetPasswordForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    completeProfileAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Choose a password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={defaultName}
          autoComplete="name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dietary">Dietary preferences (optional)</Label>
        <Textarea
          id="dietary"
          name="dietary"
          placeholder="e.g. no shellfish, vegetarian…"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          It&apos;s a dining club — the committee shares these with the
          restaurant.
        </p>
      </div>
      <FormError message={state.error} />
      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Saving…" : "Complete my profile"}
      </Button>
    </form>
  );
}
