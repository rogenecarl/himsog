import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-slate-200 dark:border-l-slate-700 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-4 rounded bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-white/10" />
      </CardContent>
    </Card>
  );
}

export function DashboardStatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <DashboardStatCardSkeleton key={i} />
      ))}
    </div>
  );
}
