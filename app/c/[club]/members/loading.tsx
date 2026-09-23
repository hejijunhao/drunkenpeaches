import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, RowsSkeleton } from "@/components/page-skeleton";

export default function MembersLoading() {
  return (
    <div className="space-y-12">
      <PageHeaderSkeleton />
      <Skeleton className="h-40 w-full" />
      <div className="space-y-5">
        <Skeleton className="h-7 w-32" />
        <RowsSkeleton rows={5} />
      </div>
    </div>
  );
}
