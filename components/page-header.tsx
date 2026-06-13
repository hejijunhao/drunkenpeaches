import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Actions slot, rendered top-right (wraps below the title on mobile). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Standard in-app page header: Fraunces title + muted description + actions.
 * Used by every screen for consistent vertical rhythm.
 */
export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-h1 text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
