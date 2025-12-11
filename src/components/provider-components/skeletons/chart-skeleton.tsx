import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader>
        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full bg-slate-200 dark:bg-white/10" style={{ height }} />
      </CardContent>
    </Card>
  );
}

export function KPICardSkeleton() {
  return (
    <Card className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-white/10" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-white/10" />
      </div>
    </Card>
  );
}

export function KPICardsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-64 bg-slate-200 dark:bg-white/10" />
        </div>
      </div>

      {/* Date range filter skeleton */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 bg-slate-200 dark:bg-white/10" />
        ))}
      </div>

      {/* KPI cards */}
      <KPICardsGridSkeleton count={4} />

      {/* Revenue chart */}
      <ChartSkeleton height={300} />

      {/* Two column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton height={300} />
        </div>
        <ChartSkeleton height={300} />
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartSkeleton height={250} />
        <ChartSkeleton height={250} />
        <ChartSkeleton height={250} />
      </div>
    </div>
  );
}
