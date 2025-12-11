"use client";

import ProviderBasicInformation from "@/components/provider-components/provider-profile-settings-components/basic-information-components";
import ProviderOperatingHours from "@/components/provider-components/provider-profile-settings-components/operating-hours-component";
import BreakTimesComponent from "@/components/provider-components/provider-profile-settings-components/break-times-component";
import ProviderShopMedia from "@/components/provider-components/provider-profile-settings-components/shop-media-component";
import { useProviderProfile } from "@/hooks/use-provider-profile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderProfileSetttingsPage() {
  const { data: provider, isLoading } = useProviderProfile();

  if (isLoading || !provider) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-96 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Basic Information Skeleton */}
        <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-72 bg-slate-200 dark:bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-24 w-full bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-10 w-full bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-64 w-full bg-slate-200 dark:bg-white/10" />
          </CardContent>
        </Card>

        {/* Operating Hours Skeleton */}
        <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-36 mb-2 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-80 bg-slate-200 dark:bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-200 dark:bg-white/10" />
            ))}
          </CardContent>
        </Card>

        {/* Shop Media Skeleton */}
        <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-4 w-64 bg-slate-200 dark:bg-white/10" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full bg-slate-200 dark:bg-white/10" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Provider Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Manage your provider settings and preferences
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <ProviderBasicInformation provider={provider} />

      {/* Operating Hours */}
      <ProviderOperatingHours provider={provider} />

      {/* Break Times */}
      <BreakTimesComponent />

      {/* Banner Media */}
      <ProviderShopMedia provider={provider} />
    </div>
  );
}
