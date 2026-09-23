import Link from "next/link";

import { cn } from "@/lib/utils";
import { dateParts } from "@/lib/format";
import { StatusBadge, statusLabel } from "@/components/status-badge";

export interface LunchCardProps {
  href: string;
  title: string;
  status: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  venueName?: string | null;
  taken?: number;
  capacity?: number | null;
  waitlisted?: number;
  mySignupStatus?: string | null;
  className?: string;
}

/**
 * A programme entry: a calendar tile on the left, the luncheon on the right.
 * Used on the notice board and the luncheons page.
 */
export function LunchCard({
  href,
  title,
  status,
  date,
  venueName,
  taken = 0,
  capacity,
  waitlisted = 0,
  mySignupStatus,
  className,
}: LunchCardProps) {
  const d = dateParts(date);
  const past = status === "completed" || status === "cancelled";
  const pct =
    capacity && capacity > 0
      ? Math.min(100, Math.round((taken / capacity) * 100))
      : 0;

  return (
    <Link
      href={href}
      className={cn(
        "group/lunch flex h-full gap-4 rounded-lg border border-border bg-card p-4 transition-colors duration-(--duration-default) ease-(--ease-out-quint) hover:border-foreground/40 sm:gap-5 sm:p-5",
        past && "bg-transparent",
        className
      )}
    >
      <div
        className={cn(
          "flex w-12 shrink-0 flex-col items-center border-r border-border pr-4 sm:w-14 sm:pr-5",
          past && "opacity-60"
        )}
      >
        <span className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {d.month}
        </span>
        <span className="text-numeral mt-1 text-[1.9rem] leading-none text-foreground">
          {d.day}
        </span>
        <span className="mt-1.5 text-[0.625rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {d.weekday}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 text-balance leading-snug text-foreground">
            {title}
          </h3>
          <StatusBadge status={status} className="mt-0.5 shrink-0" />
        </div>
        {venueName ? (
          <p className="truncate text-sm text-muted-foreground">{venueName}</p>
        ) : null}

        <div className="mt-auto space-y-2 pt-2">
          {capacity != null ? (
            <>
              <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  <span className="text-numeral text-base leading-none text-foreground">
                    {taken}
                  </span>{" "}
                  of {capacity} places
                  {waitlisted > 0 ? (
                    <span className="text-warning"> · {waitlisted} waiting</span>
                  ) : null}
                </span>
                {mySignupStatus ? (
                  <span className="shrink-0 text-foreground">
                    You: {statusLabel(mySignupStatus)}
                  </span>
                ) : null}
              </div>
              {!past ? (
                <div className="h-px w-full bg-border">
                  <div
                    className={cn(
                      "h-full",
                      taken > capacity ? "bg-destructive" : "bg-primary"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : null}
            </>
          ) : mySignupStatus ? (
            <p className="text-xs text-foreground">
              You: {statusLabel(mySignupStatus)}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
