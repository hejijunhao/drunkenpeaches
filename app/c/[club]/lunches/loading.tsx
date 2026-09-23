import { Skeleton } from "@/components/ui/skeleton";

export default function LunchesLoading() {
  return (
    <div className="space-y-12">
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="club-rule-strong" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-7 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
