import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0 bg-slate-200 dark:bg-white/10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-white/10" />
      </div>
      <Skeleton className="h-3 w-16 flex-shrink-0 bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

export function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}
