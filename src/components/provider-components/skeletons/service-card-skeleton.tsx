import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-white/10" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-3/4 mb-4 bg-slate-200 dark:bg-white/10" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 bg-slate-200 dark:bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ServiceListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded bg-slate-200 dark:bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-6 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
