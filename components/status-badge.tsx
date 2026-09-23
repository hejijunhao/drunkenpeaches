import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral" | "info";

/**
 * Single source of truth: domain status → semantic tone + the word the club
 * would actually use for it. Colour is never the only signal (dot + text).
 */
const STATUS: Record<string, { tone: Tone; label: string }> = {
  // lunches
  draft: { tone: "neutral", label: "Draft" },
  released: { tone: "success", label: "Open" },
  completed: { tone: "info", label: "Held" },
  cancelled: { tone: "danger", label: "Cancelled" },
  // signups
  confirmed: { tone: "success", label: "Confirmed" },
  waitlisted: { tone: "warning", label: "Waiting" },
  // memberships
  invited: { tone: "warning", label: "Invited" },
  active: { tone: "success", label: "Active" },
  resigned: { tone: "neutral", label: "Resigned" },
  lapsed: { tone: "neutral", label: "Lapsed" },
  removed: { tone: "danger", label: "Removed" },
  // venues
  candidate: { tone: "neutral", label: "Candidate" },
  tasting: { tone: "warning", label: "Tasting" },
  approved: { tone: "success", label: "Approved" },
  rejected: { tone: "danger", label: "Declined" },
  archived: { tone: "neutral", label: "Archived" },
  // tastings
  pending: { tone: "neutral", label: "Pending" },
  go: { tone: "success", label: "Go" },
  no_go: { tone: "danger", label: "No-go" },
};

export function statusLabel(status: string) {
  return STATUS[status]?.label ?? status.replace("_", "-");
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const entry = STATUS[status] ?? { tone: "neutral" as Tone, label: status };
  return (
    <Badge tone={entry.tone} dot className={cn(className)}>
      {entry.label}
    </Badge>
  );
}
