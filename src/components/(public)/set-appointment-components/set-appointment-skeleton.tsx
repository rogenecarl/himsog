import { Skeleton } from "@/components/ui/skeleton";

export function SetAppointmentSkeleton() {
  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0B0F19]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* Back button */}
          <Skeleton className="mb-4 h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="space-y-2">
            {/* Title */}
            <Skeleton className="h-8 sm:h-10 lg:h-12 w-56 sm:w-72 bg-slate-200 dark:bg-white/10" />
            {/* Provider name */}
            <Skeleton className="h-4 sm:h-5 w-40 sm:w-48 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6 sm:mb-8 rounded-lg p-4 sm:p-6">
          {/* Progress header */}
          <div className="mb-3 flex justify-between items-center">
            <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 sm:h-5 w-24 sm:w-28 bg-slate-200 dark:bg-white/10" />
          </div>
          {/* Progress bar */}
          <Skeleton className="h-2 sm:h-3 w-full rounded-full bg-slate-200 dark:bg-white/10" />

          {/* Step indicators */}
          <div className="mt-4 flex justify-between">
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-3 sm:h-4 w-32 sm:w-36 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-3 sm:h-4 w-28 sm:w-32 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Main Content Area - Step 1 (Services) Skeleton */}
        <div className="mb-6 sm:mb-8">
          {/* Services list skeleton */}
          <div className="space-y-4">
            {/* Section header */}
            <Skeleton className="h-6 w-32 mb-4 bg-slate-200 dark:bg-white/10" />

            {/* Service cards */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Checkbox skeleton */}
                  <Skeleton className="h-5 w-5 rounded mt-1 shrink-0 bg-slate-200 dark:bg-white/10" />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        {/* Service name */}
                        <Skeleton className="h-5 w-40 sm:w-48 mb-2 bg-slate-200 dark:bg-white/10" />
                        {/* Service description */}
                        <Skeleton className="h-4 w-full mb-1 bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-white/10" />
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        {/* Price */}
                        <Skeleton className="h-5 w-16 sm:w-20 bg-slate-200 dark:bg-white/10" />
                        {/* Duration */}
                        <Skeleton className="h-4 w-14 sm:w-16 bg-slate-200 dark:bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="sticky bottom-4 sm:bottom-6 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Skeleton className="flex-1 h-11 sm:h-12 rounded-md bg-slate-200 dark:bg-white/10" />
            <Skeleton className="flex-1 h-11 sm:h-12 rounded-md bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
