import {
  assignLunchRoleAction,
  clearLunchRoleAction,
} from "@/app/actions/lunches";
import { CritiqueRoleBadge } from "@/components/critique-role-badge";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LUNCH_CRITIQUE_ROLES,
  critiqueRoleBrief,
  critiqueRoleLabel,
} from "@/lib/lunch-roles";
import type { LunchCritiqueRole, LunchRole, Membership } from "@/lib/types";

type Attendee = Pick<Membership, "id" | "full_name" | "email">;

export function CritiqueRolesPanel({
  slug,
  lunchId,
  roles,
  attendees,
  canAssign,
}: {
  slug: string;
  lunchId: string;
  roles: LunchRole[];
  attendees: Attendee[];
  canAssign: boolean;
}) {
  const byRole = new Map(roles.map((r) => [r.role, r]));
  const nameById = new Map(
    attendees.map((a) => [a.id, a.full_name || a.email || "Unknown"])
  );
  const takenElsewhere = (role: LunchCritiqueRole) =>
    new Set(
      roles.filter((r) => r.role !== role).map((r) => r.membership_id)
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speaking roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Four members speak at the table: Food 1 and Wine 1 in the first
          half, Food 2 and Wine 2 after. One role per person.
        </p>
        {canAssign && attendees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Confirm attendees before assigning speaking roles.
          </p>
        ) : null}
        <ul className="space-y-4">
          {LUNCH_CRITIQUE_ROLES.map((role) => {
            const held = byRole.get(role);
            const holderName = held
              ? (nameById.get(held.membership_id) ?? "Unknown")
              : null;
            const taken = takenElsewhere(role);
            const choices = attendees.filter((a) => !taken.has(a.id));

            return (
              <li
                key={role}
                className="space-y-3 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {critiqueRoleLabel(role)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {critiqueRoleBrief(role)}
                    </p>
                  </div>
                  {held ? (
                    <div className="flex items-center gap-2">
                      <CritiqueRoleBadge role={role} />
                      <span className="text-sm">{holderName}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                  )}
                </div>

                {canAssign ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <form
                      action={assignLunchRoleAction.bind(null, slug, lunchId)}
                      className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="role" value={role} />
                      <div className="min-w-48 flex-1 space-y-1.5">
                        <Label htmlFor={`role-${role}`} className="sr-only">
                          Assign {critiqueRoleLabel(role)}
                        </Label>
                        <Select
                          name="membershipId"
                          required
                          defaultValue={held?.membership_id}
                        >
                          <SelectTrigger id={`role-${role}`} className="w-full">
                            <SelectValue placeholder="Pick a confirmed member…" />
                          </SelectTrigger>
                          <SelectContent>
                            {choices.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.full_name || a.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={choices.length === 0}
                      >
                        {held ? "Reassign" : "Assign"}
                      </Button>
                    </form>
                    {held ? (
                      <form
                        action={clearLunchRoleAction.bind(
                          null,
                          slug,
                          lunchId,
                          role
                        )}
                      >
                        <ConfirmSubmit
                          confirmTitle={`Clear ${critiqueRoleLabel(role)}?`}
                          confirmMessage={`${holderName} will no longer hold this role.`}
                          confirmLabel="Clear role"
                          variant="ghost"
                          size="sm"
                        >
                          Clear
                        </ConfirmSubmit>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
