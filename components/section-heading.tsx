import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: React.ReactNode;
  /** A count set in the serif beside the title. */
  count?: number;
  description?: React.ReactNode;
  kicker?: React.ReactNode;
  /** Actions, right-aligned. */
  children?: React.ReactNode;
  className?: string;
}

/** A ruled section title within a page. */
export function SectionHeading({
  title,
  count,
  description,
  kicker,
  children,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 border-b border-border pb-3",
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? <p className="club-kicker mb-2">{kicker}</p> : null}
        <h2 className="text-h2 flex items-baseline gap-2.5 text-foreground">
          <span>{title}</span>
          {count != null ? (
            <span className="text-numeral text-[1.05rem] text-muted-foreground">
              {count}
            </span>
          ) : null}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}

/** A small-cap label centred on a hairline — divides the committee's part. */
export function RuleLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-4", className)}
      role="separator"
      aria-label={typeof children === "string" ? children : undefined}
    >
      <span className="club-rule flex-1" />
      <span className="club-kicker">{children}</span>
      <span className="club-rule flex-1" />
    </div>
  );
}
