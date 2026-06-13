import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function VenueDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Card className="p-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="mt-3 h-9 w-full" />
        </Card>
      </div>
      <Card className="p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-20 w-full" />
      </Card>
    </div>
  );
}
