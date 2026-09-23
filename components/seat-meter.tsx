import * as React from "react";

import { cn } from "@/lib/utils";

interface SeatMeterProps {
  taken: number;
  capacity: number;
  /** Number waiting for a place. */
  waitlisted?: number;
  /** Show the headcount line above the rule. */
  showLabel?: boolean;
  size?: "default" | "sm";
  className?: string;
}

/**
 * The headcount against the booking — a serif numeral, a hairline track, and
 * a note of anyone waiting. Turns to ink-red when the committee has seated
 * more than the table holds.
 */
export function SeatMeter({
  taken,
  capacity,
  waitlisted = 0,
  showLabel = true,
  size = "default",
  className,
}: SeatMeterProps) {
  const over = capacity > 0 && taken > capacity;
  const pct =
    capacity > 0 ? Math.min(100, Math.round((taken / capacity) * 100)) : 0;
  const left = Math.max(0, capacity - taken);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <div className="flex items-baseline justify-between gap-3">
          <span className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-numeral leading-none",
                size === "sm" ? "text-[1.25rem]" : "text-[1.75rem]",
                over ? "text-destructive" : "text-foreground"
              )}
            >
              {taken}
            </span>
            <span
              className={cn(
                "text-muted-foreground",
                size === "sm" ? "text-xs" : "text-sm"
              )}
            >
              of {capacity} places
            </span>
          </span>
          <span
            className={cn(
              "text-right",
              size === "sm" ? "text-[0.6875rem]" : "text-xs",
              waitlisted > 0 ? "text-warning" : "text-muted-foreground"
            )}
          >
            {over
              ? `${taken - capacity} over`
              : waitlisted > 0
                ? `${waitlisted} waiting`
                : left === 0
                  ? "Full"
                  : `${left} remaining`}
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={taken}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-label={`${taken} of ${capacity} places taken`}
        className={cn(
          "relative w-full overflow-hidden bg-border",
          size === "sm" ? "h-px" : "h-[3px]"
        )}
      >
        <div
          className={cn(
            "h-full transition-[width] duration-(--duration-default) ease-(--ease-out-quint)",
            over ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
