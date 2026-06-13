"use client";

import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type FormState,
} from "@/app/actions/auth";
import { CircleCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    requestPasswordResetAction,
    {}
  );

  if (state.success) {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
        <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
        <span>
          If an account exists for that email, a reset link is on its way.
          Check your inbox.
        </span>
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <FormError message={state.error} />
      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
