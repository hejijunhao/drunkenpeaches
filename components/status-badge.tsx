import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  // lunches
  draft: "bg-stone-100 text-stone-700 border-stone-200",
  released: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  // signups
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  waitlisted: "bg-amber-50 text-amber-700 border-amber-200",
  // memberships
  invited: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  resigned: "bg-stone-100 text-stone-600 border-stone-200",
  lapsed: "bg-stone-100 text-stone-600 border-stone-200",
  removed: "bg-red-50 text-red-700 border-red-200",
  // venues
  candidate: "bg-stone-100 text-stone-700 border-stone-200",
  tasting: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-stone-100 text-stone-500 border-stone-200",
  // tastings
  pending: "bg-stone-100 text-stone-700 border-stone-200",
  go: "bg-emerald-50 text-emerald-700 border-emerald-200",
  no_go: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", STYLES[status] ?? STYLES.draft)}
    >
      {status.replace("_", "-")}
    </Badge>
  );
}
