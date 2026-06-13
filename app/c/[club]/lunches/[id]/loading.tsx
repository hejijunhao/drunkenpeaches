import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LunchDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card className="shrink-0 gap-3 p-5 md:w-72">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
        </Card>
      </div>
      <Card className="p-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-3 h-9 w-40" />
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-32" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
