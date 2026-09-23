import * as React from "react";

import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * A ruled form section: the heading and its note sit in a left column, the
 * fields in the right — a printed form, not a stack of cards.
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "grid gap-5 border-t border-border pt-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12 md:pt-8",
        className
      )}
    >
      <div className="md:pr-4">
        <h2 className="text-h3 text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

/** The submit row at the foot of a sectioned form. */
export function FormFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-6 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12",
        className
      )}
    >
      <div className="hidden md:block" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>
    </div>
  );
}
