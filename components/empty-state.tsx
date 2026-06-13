import * as React from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** lucide icon component, e.g. `CalendarOff`. */
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
  /** Optional CTA (button/link). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent empty state — icon + headline + supporting copy + optional action.
 * Replaces the scattered `text-muted-foreground` / `border-dashed` one-offs.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" />
        </div>
      ) : null}
      <h3 className="font-heading text-base font-medium text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
