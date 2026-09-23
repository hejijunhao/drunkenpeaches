import { Skeleton } from "@/components/ui/skeleton";

export default function VenueDetailLoading() {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="club-rule-strong" />
      </div>
      <div className="grid gap-5 md:grid-cols-[13rem_1fr] md:gap-12">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
