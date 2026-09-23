import { TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Inline form error. */
export function FormError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-sm border border-destructive/30 bg-destructive/6 px-3 py-2.5 text-sm text-destructive",
        className
      )}
    >
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
