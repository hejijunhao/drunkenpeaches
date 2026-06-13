import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Card className="p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-9 w-full" />
      </Card>
      <Card className="gap-0 p-0">
        <Skeleton className="h-11 w-full rounded-none" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </Card>
    </div>
  );
}
