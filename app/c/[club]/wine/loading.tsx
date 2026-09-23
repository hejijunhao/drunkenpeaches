import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, RowsSkeleton } from "@/components/page-skeleton";

export default function WineLoading() {
  return (
    <div className="space-y-12">
      <PageHeaderSkeleton />
      <Skeleton className="h-44 w-full" />
      <div className="space-y-5">
        <Skeleton className="h-7 w-40" />
        <RowsSkeleton rows={4} />
      </div>
    </div>
  );
}
