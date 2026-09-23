import { dateParts } from "@/lib/format";
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

/** The member's record in the book — shared by member detail and the profile. */
export function AttendanceHistory({ items }: { items: AttendanceItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No luncheons recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {items.map((h) => {
              const d = dateParts(h.date);
              return (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3"
                >
                  <span className="text-numeral w-24 shrink-0 text-sm text-muted-foreground">
                    {d.day} {d.month} {d.year}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-foreground">
                    {h.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge status={h.status} />
                    {h.attended === true ? (
                      <Badge tone="success" dot>
                        Present
                      </Badge>
                    ) : null}
                    {h.attended === false ? (
                      <Badge tone="danger" dot>
                        No-show
                      </Badge>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
