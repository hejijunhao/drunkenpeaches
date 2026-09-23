import * as React from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** lucide icon component, e.g. `CalendarOff`. */
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: React.ReactNode;
  /** A line of italic serif — the cheeky bit. */
  aside?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** A quiet notice in a hairline frame. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  aside,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-border bg-card/60 px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <Icon
          className="mb-4 size-5 text-muted-foreground"
          strokeWidth={1.25}
        />
      ) : null}
      <h3 className="text-h3 text-balance text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
          {description}
        </p>
      ) : null}
      {aside ? (
        <p className="text-aside mt-3 text-[0.95rem] text-muted-foreground">
          {aside}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
