"use client";

import { useActionState, useRef, useEffect } from "react";
import { inviteMemberAction } from "@/app/actions/members";
import type { FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/form-error";

export function InviteForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    inviteMemberAction.bind(null, slug),
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful invite.
  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invite a member</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Name</Label>
            <Input id="fullName" name="fullName" required className="min-w-44" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="min-w-52"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              defaultValue="member"
            >
              <option value="member">Member</option>
              <option value="committee">Committee</option>
            </select>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send invite"}
          </Button>
          <div className="basis-full">
            <FormError message={state.error} />
          </div>
        </form>
        <p className="mt-2 text-xs text-stone-500">
          They&apos;ll get an email to set a password and complete their
          profile. Membership is invitation-only.
        </p>
      </CardContent>
    </Card>
  );
}
