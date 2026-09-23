import { Badge } from "@/components/ui/badge";
import { critiqueRoleLabel } from "@/lib/lunch-roles";
import type { LunchCritiqueRole } from "@/lib/types";

export function CritiqueRoleBadge({
  role,
  className,
}: {
  role: LunchCritiqueRole;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={className}>
      {critiqueRoleLabel(role)}
    </Badge>
  );
}
