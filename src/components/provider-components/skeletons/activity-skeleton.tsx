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
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader>
        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: count }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

export function TodayScheduleSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-white/5"
          >
            <Skeleton className="h-10 w-16 rounded flex-shrink-0 bg-slate-200 dark:bg-white/10" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-white/10" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
