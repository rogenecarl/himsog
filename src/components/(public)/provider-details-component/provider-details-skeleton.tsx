import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProviderDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] pb-24 md:pb-12">
      {/* Hero Section Skeleton */}
      <div className="relative w-full bg-white dark:bg-[#0B0F19]">
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full overflow-hidden">
          <Skeleton className="w-full h-full bg-slate-200 dark:bg-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6">
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <Skeleton className="h-6 w-24 mb-2 rounded-full bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-8 sm:h-10 w-64 mb-2 bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
                </div>
                <Skeleton className="h-12 w-32 rounded-lg bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 -mt-4 sm:-mt-6 md:-mt-8 relative z-10">
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E293B] p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center"
            >
              <Skeleton className="h-10 w-10 rounded-full mb-2 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-3 w-16 mb-1 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-4 w-12 bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* About Section Skeleton */}
            <Card className="bg-white dark:bg-[#1E293B] border-gray-100 dark:border-white/10 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-full mb-2 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-white/10" />
              </CardContent>
            </Card>

            {/* Services Section Skeleton */}
            <section>
              <Skeleton className="h-6 w-40 mb-4 bg-slate-200 dark:bg-white/10" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-white/10 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2 sm:gap-3 flex-1">
                        <Skeleton className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-white/10" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-1 bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-white/10" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-16 mb-1 bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="h-3 w-12 bg-slate-200 dark:bg-white/10" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section Skeleton */}
            <Card className="bg-white dark:bg-[#1E293B] border-gray-100 dark:border-white/10 shadow-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <Skeleton className="h-6 w-36 bg-slate-200 dark:bg-white/10" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center mb-6 sm:mb-8">
                  <div className="text-center sm:text-left min-w-[100px] sm:min-w-[120px]">
                    <Skeleton className="h-12 w-16 mb-2 mx-auto sm:mx-0 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-4 w-20 mb-1 mx-auto sm:mx-0 bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-3 w-24 mx-auto sm:mx-0 bg-slate-200 dark:bg-white/10" />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map((i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3">
                        <Skeleton className="h-4 w-3 bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="h-3 w-3 bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="h-3 w-6 bg-slate-200 dark:bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Review items skeleton */}
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border-b border-gray-100 dark:border-white/10 pb-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2 bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-3 w-full mb-1 bg-slate-200 dark:bg-white/10" />
                          <Skeleton className="h-3 w-3/4 bg-slate-200 dark:bg-white/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4 sm:space-y-6">
              {/* Book Button Skeleton */}
              <div className="hidden md:block">
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200 dark:bg-white/10" />
              </div>

              {/* Contact Card Skeleton */}
              <Card className="bg-white dark:bg-[#1E293B] border-gray-100 dark:border-white/10 shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-white/10" />
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-5 w-5 shrink-0 bg-slate-200 dark:bg-white/10" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-16 mb-1 bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
                      </div>
                    </div>
                  ))}
                  <Skeleton className="h-10 w-full rounded-xl mt-4 bg-slate-200 dark:bg-white/10" />
                </CardContent>
              </Card>

              {/* Hours Card Skeleton */}
              <Card className="bg-white dark:bg-[#1E293B] border-gray-100 dark:border-white/10 shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <Skeleton className="h-5 w-36 bg-slate-200 dark:bg-white/10" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="flex justify-between p-2">
                        <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
                        <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-white/10" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Nav Skeleton */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-white/10 p-3 sm:p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50">
        <div className="flex gap-2 sm:gap-3 max-w-lg mx-auto">
          <Skeleton className="flex-1 h-11 rounded-xl bg-slate-200 dark:bg-white/10" />
          <Skeleton className="flex-[2] h-11 rounded-xl bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
