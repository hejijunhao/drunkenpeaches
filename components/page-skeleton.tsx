import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for a `PageHeader` while a route loads. */
export function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        {action ? <Skeleton className="h-10 w-36" /> : null}
      </div>
      <div className="club-rule-strong" />
    </div>
  );
}

/** Placeholder rows for a ruled list or table. */
export function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3.5">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
