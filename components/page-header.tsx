import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  kicker?: React.ReactNode;
  /** Actions — below the title on phones, to the right on larger screens. */
  children?: React.ReactNode;
  /** Something to sit beside the title, e.g. a status stamp. */
  aside?: React.ReactNode;
  className?: string;
}

/**
 * A chapter heading: small-cap kicker, serif title, a line of description,
 * and a rule beneath — every in-app page opens this way.
 */
export function PageHeader({
  title,
  description,
  kicker,
  children,
  aside,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          {kicker ? <p className="club-kicker">{kicker}</p> : null}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-h1 text-balance text-foreground">{title}</h1>
            {aside}
          </div>
          {description ? (
            <p className="max-w-prose text-[0.95rem] leading-relaxed text-pretty text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-1">
            {children}
          </div>
        ) : null}
      </div>
      <div className="club-rule-strong" />
    </header>
  );
}
