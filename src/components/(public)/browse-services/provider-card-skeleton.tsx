import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderCardSkeleton() {
  return (
    <Card className="p-0 overflow-hidden bg-white dark:bg-[#1E293B] border-gray-200 dark:border-white/10">
      {/* Cover Image Skeleton */}
      <Skeleton className="h-40 w-full bg-slate-200 dark:bg-white/10" />

      {/* Content */}
      <div className="px-4 py-6">
        {/* Header with Name and Rating */}
        <div className="flex gap-2 justify-between py-2">
          <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-8 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Category */}
        <div className="mb-3">
          <Skeleton className="h-6 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Address */}
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-4 w-4 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-40 bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Services */}
        <div className="mt-3 flex flex-wrap gap-1">
          <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-6 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-6 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 w-full justify-center">
          <Skeleton className="h-8 flex-1 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-8 flex-1 bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    </Card>
  );
}
