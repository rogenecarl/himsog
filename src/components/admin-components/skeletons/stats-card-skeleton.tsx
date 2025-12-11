import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-4 rounded bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-white/10" />
      </CardContent>
    </Card>
  );
}

export function StatsCardsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
