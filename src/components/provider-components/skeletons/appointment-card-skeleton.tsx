import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0 bg-slate-200 dark:bg-white/10" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AppointmentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <AppointmentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AppointmentStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-16 mb-2 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-8 w-12 bg-slate-200 dark:bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AppointmentSectionSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-6 w-6 rounded bg-slate-200 dark:bg-white/10" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-3 w-48 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AppointmentCardSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
