import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CalendarHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-8 w-8 bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-9 w-16 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-9 w-16 bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

export function CalendarDayViewSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardContent className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-white/5"
            >
              <Skeleton className="h-4 w-16 flex-shrink-0 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-10 w-full rounded bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarWeekViewSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Header */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-8 w-full bg-slate-200 dark:bg-white/10" />
          ))}
          {/* Cells */}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={`cell-${i}`} className="h-24 w-full bg-slate-200 dark:bg-white/10" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarMonthViewSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Header */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-6 w-full mb-2 bg-slate-200 dark:bg-white/10" />
          ))}
          {/* Days */}
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={`day-${i}`}
              className="h-24 p-1 border rounded border-slate-100 dark:border-white/5"
            >
              <Skeleton className="h-4 w-6 mb-2 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-3 w-full mb-1 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-3 w-3/4 bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarSkeleton({ view = "month" }: { view?: "day" | "week" | "month" }) {
  return (
    <div className="space-y-4">
      <CalendarHeaderSkeleton />
      {view === "day" && <CalendarDayViewSkeleton />}
      {view === "week" && <CalendarWeekViewSkeleton />}
      {view === "month" && <CalendarMonthViewSkeleton />}
    </div>
  );
}
