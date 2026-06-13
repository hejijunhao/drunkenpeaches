import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function VenuesLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-3">
            <Skeleton className="h-6 w-32" />
            {[0, 1].map((i) => (
              <Card key={i} className="gap-2 p-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
