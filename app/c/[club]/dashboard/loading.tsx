import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <Card className="gap-0 p-6 sm:p-8">
        <Skeleton className="h-3 w-20" />
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-4 md:w-64">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="gap-3 p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-2 w-full rounded-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
