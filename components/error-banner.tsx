import { TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Page-level error banner — token-driven destructive styling. */
export function ErrorBanner({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "mb-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        className
      )}
    >
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
