import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/page-skeleton";

export default function VenuesLoading() {
  return (
    <div className="space-y-12">
      <PageHeaderSkeleton action />
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-4">
            <div className="space-y-2 border-b border-border pb-3">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-7 w-32" />
            </div>
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
