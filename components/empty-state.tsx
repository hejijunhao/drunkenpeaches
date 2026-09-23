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
 * Quiet empty state — club notice, not a dashed startup illustration.
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
        "flex flex-col items-start rounded-lg border border-border bg-card px-5 py-8 club-notice",
        className
      )}
    >
      {Icon ? (
        <Icon className="mb-3 size-5 text-muted-foreground" />
      ) : null}
      <h3 className="font-heading text-lg font-medium text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
