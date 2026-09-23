import { Skeleton } from "@/components/ui/skeleton";
import { RowsSkeleton } from "@/components/page-skeleton";

export default function LunchDetailLoading() {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-72" />
            <div className="flex gap-12">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <Skeleton className="h-28 w-full md:w-72" />
        </div>
        <div className="club-rule-strong" />
      </div>
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-7 w-32" />
            <RowsSkeleton rows={3} />
          </div>
        ))}
      </div>
    </div>
  );
}
