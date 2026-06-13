"use client";

import { useActionState, useRef, useEffect } from "react";
import { UserPlusIcon } from "lucide-react";
import { inviteMemberAction } from "@/app/actions/members";
import type { FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/form-error";
import { useSuccessToast } from "@/lib/use-success-toast";

export function InviteForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    inviteMemberAction.bind(null, slug),
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useSuccessToast(pending, state.error, "Invite sent");

  // Clear the form only after a real, successful submit.
  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    if (pending) submitted.current = true;
  }, [pending, state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a member</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue="member">
              <SelectTrigger id="role" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="committee">Committee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" loading={pending}>
            <UserPlusIcon />
            Send invite
          </Button>
          <div className="sm:col-span-4">
            <FormError message={state.error} />
          </div>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          They&apos;ll get an email to set a password and complete their
          profile. Membership is invitation-only.
        </p>
      </CardContent>
    </Card>
  );
}
