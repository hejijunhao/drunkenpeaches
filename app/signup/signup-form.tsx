"use client";

import { useActionState } from "react";
import { createClubAction, type FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createClubAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clubName">Club / chapter name</Label>
        <Input
          id="clubName"
          name="clubName"
          placeholder="Beefsteaks & Burgundy — Singapore"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Your name</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
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
      <FormError message={state.error} />
      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Creating your club…" : "Create club"}
      </Button>
    </form>
  );
}
