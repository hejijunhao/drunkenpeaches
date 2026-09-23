import * as React from "react"

import { cn } from "@/lib/utils"

/** Loading placeholder. Pulse respects `prefers-reduced-motion` (globals). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-sm bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
