import { fmtDateShort } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";

export interface AttendanceItem {
  id: string;
  date: string;
  title: string;
  status: string;
  attended: boolean | null;
}

/** Attendance timeline — shared by member-detail and the profile screen. */
export function AttendanceHistory({ items }: { items: AttendanceItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance history</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lunch history yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-border pl-3"
              >
                <span className="text-xs tabular-nums text-muted-foreground">
                  {fmtDateShort(h.date)}
                </span>
                <span className="text-sm font-medium">{h.title}</span>
                <StatusBadge status={h.status} />
                {h.attended === true ? (
                  <Badge tone="success" dot>
                    attended
                  </Badge>
                ) : null}
                {h.attended === false ? (
                  <Badge tone="danger" dot>
                    no-show
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
