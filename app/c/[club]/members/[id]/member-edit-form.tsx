"use client";

import { useActionState, useState } from "react";
import { updateMemberAction } from "@/app/actions/members";
import type { FormState } from "@/app/actions/auth";
import type { Membership } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/form-error";

export function MemberEditForm({
  slug,
  member,
  isSelf,
}: {
  slug: string;
  member: Membership;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateMemberAction.bind(null, slug, member.id),
    {}
  );
  const [role, setRole] = useState(member.role);

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="fullName">Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={member.full_name}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={member.email} disabled />
        <p className="text-xs text-stone-500">
          Email is the member&apos;s login and can&apos;t be changed here.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={member.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="joinedOn">Joined on</Label>
          <Input
            id="joinedOn"
            name="joinedOn"
            type="date"
            defaultValue={member.joined_on}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dietary">Dietary preferences</Label>
        <Textarea
          id="dietary"
          name="dietary"
          rows={2}
          defaultValue={member.dietary_notes ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Membership["role"])}
            disabled={isSelf}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs disabled:opacity-50"
          >
            <option value="member">Member</option>
            <option value="committee">Committee</option>
          </select>
          {isSelf && (
            <input type="hidden" name="role" value={member.role} />
          )}
          {isSelf && (
            <p className="text-xs text-stone-500">
              You can&apos;t change your own role.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={member.status}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="invited">Invited (pending)</option>
            <option value="active">Active</option>
            <option value="resigned">Resigned</option>
            <option value="lapsed">Lapsed</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>
      {role === "committee" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="wineMaster"
            defaultChecked={member.wine_master}
            className="size-4 rounded border-stone-300"
          />
          🍷 Wine Master — gets the wine-selection screens
        </label>
      )}
      <FormError message={state.error} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save member"}
      </Button>
    </form>
  );
}
