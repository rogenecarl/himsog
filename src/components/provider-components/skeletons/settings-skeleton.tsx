import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsFormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
      <Skeleton className="h-10 w-full bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

export function SettingsSectionSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader>
        <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-64 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <SettingsFormFieldSkeleton key={i} />
        ))}
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

export function OperatingHoursTableSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardHeader>
        <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-white/10" />
              <span className="text-slate-400">-</span>
              <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-6 w-12 bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-64 bg-slate-200 dark:bg-white/10" />
      </div>

      {/* Basic Information Section */}
      <SettingsSectionSkeleton fields={5} />

      {/* Operating Hours Section */}
      <OperatingHoursTableSkeleton />

      {/* Media Section */}
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-56 bg-slate-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-lg bg-slate-200 dark:bg-white/10" />
          <div className="flex justify-end gap-2 mt-4">
            <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-white/10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
