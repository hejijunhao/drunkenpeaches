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
import { FormFooter, FormSection } from "@/components/form-section";
import { useSuccessToast } from "@/lib/use-success-toast";

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

  useSuccessToast(pending, state.error, "Particulars saved");

  return (
    <form action={formAction} className="max-w-4xl space-y-8">
      <FormSection
        title="Particulars"
        description="As they appear in the book. Your email is your login."
        className="border-t-0 pt-0 md:pt-0"
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="flex h-11 items-center truncate rounded-sm border border-border bg-muted/50 px-3 text-sm text-muted-foreground md:h-10">
              {membership.email}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telephone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={membership.phone ?? ""}
            className="sm:max-w-xs"
          />
        </div>
      </FormSection>

      <FormSection
        title="At table"
        description="The committee shares these with the restaurant before each lunch."
      >
        <div className="space-y-2">
          <Label htmlFor="dietary">Dietary notes</Label>
          <Textarea
            id="dietary"
            name="dietary"
            rows={3}
            defaultValue={membership.dietary_notes ?? ""}
            placeholder="No shellfish; otherwise omnivorous."
          />
        </div>
      </FormSection>

      <FormFooter>
        <Button type="submit" loading={pending}>
          Save particulars
        </Button>
        <FormError message={state.error} />
      </FormFooter>
    </form>
  );
}
