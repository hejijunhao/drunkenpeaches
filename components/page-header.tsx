import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  kicker?: React.ReactNode;
  /** Actions slot, rendered below the title on mobile, right on larger screens. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * In-app page header: kicker + Newsreader title + muted description + actions.
 */
export function PageHeader({
  title,
  description,
  kicker,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {kicker ? <p className="club-kicker">{kicker}</p> : null}
        <h1 className="text-h1 text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-prose text-[0.9375rem] leading-relaxed text-muted-foreground">
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
