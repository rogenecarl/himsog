"use client";

import { useState, useEffect } from "react";
import { useProviderProfile } from "@/hooks/use-provider-profile";
import { useAuthUser } from "@/hooks/use-auth";
import { AlertCircle, Clock, Plus, Calendar, Users, Star, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

// Import dashboard components
import {
  DashboardHeader,
  DashboardHeaderSkeleton,
  DashboardStats,
  TodaySchedule,
  RecentActivity,
  QuickActions,
} from "@/components/provider-components/dashboard";

// Import skeletons
import {
  DashboardStatsGridSkeleton,
  TodayScheduleSkeleton,
  ActivityFeedSkeleton,
} from "@/components/provider-components/skeletons";

export default function ProviderDashboardPage() {
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useAuthUser();
  const { data: provider, isLoading: profileLoading } = useProviderProfile();

  // Combined loading state - show full page skeleton
  if (userLoading || profileLoading) {
    return <DashboardPageSkeleton />;
  }

  // Handle authentication errors
  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {userError.message || "Please sign in to access the dashboard."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Alert className="max-w-md border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B]">
          <AlertCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <AlertTitle className="text-slate-900 dark:text-white">
            Authentication Required
          </AlertTitle>
          <AlertDescription className="text-slate-600 dark:text-slate-400">
            Please sign in to access the provider dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user has provider role
  if (user.role !== "PROVIDER") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need a provider account to access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No provider profile - show create profile prompt
  if (!provider) {
    return <NoProfileState userName={user.name} />;
  }

  // Pending verification - show waiting state
  if (provider.status === "PENDING") {
    return <PendingVerificationState provider={provider} />;
  }

  // Verified profile - show full dashboard with component-level loading
  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardHeader provider={provider} />
      <DashboardStats />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <QuickActions />
        </div>
        <div className="order-1 lg:order-2">
          <TodaySchedule />
        </div>
      </div>
      <RecentActivity />
    </div>
  );
}

// Full page skeleton for initial load
function DashboardPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <DashboardHeaderSkeleton />

      {/* Stats skeleton */}
      <DashboardStatsGridSkeleton count={4} />

      {/* Quick actions + Schedule skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full bg-slate-200 dark:bg-white/10" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <TodayScheduleSkeleton count={3} />
      </div>

      {/* Activity skeleton */}
      <ActivityFeedSkeleton count={5} />
    </div>
  );
}

// No Profile State Component
function NoProfileState({ userName }: { userName: string }) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome to Provider Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Hi{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {userName}
            </span>
            ! Complete your provider profile to start accepting appointments.
          </p>
        </div>
        <DateTimeDisplay />
      </div>

      {/* Alert - No Profile */}
      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-300">
          Complete Your Profile
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-400">
          You haven&apos;t created your provider profile yet. Create your
          profile to start offering services and accepting appointments from
          clients.
        </AlertDescription>
      </Alert>

      {/* Create Profile Card */}
      <Card className="border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B]">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-cyan-900/30">
            <Plus className="h-8 w-8 text-primary dark:text-cyan-400" />
          </div>
          <CardTitle className="text-xl text-slate-900 dark:text-white">
            Create Your Provider Profile
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Set up your business profile with services, operating hours, and
            location information
          </p>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <Button
            size="lg"
            onClick={() => router.push("/provider/onboarding/step-1")}
            className="w-full sm:w-auto bg-blue-600 dark:bg-cyan-500 hover:bg-blue-700 dark:hover:bg-cyan-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Provider Profile
          </Button>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
              <Users className="h-5 w-5 text-primary dark:text-cyan-400" />
              Build Your Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Create a professional profile to showcase your services and
              attract clients.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
              <Calendar className="h-5 w-5 text-primary dark:text-cyan-400" />
              Manage Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Set your availability and let clients book appointments online
              seamlessly.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
              <Star className="h-5 w-5 text-primary dark:text-cyan-400" />
              Grow Your Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Receive reviews and ratings to build trust and expand your
              customer base.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Pending Verification State Component
function PendingVerificationState({
  provider,
}: {
  provider: {
    healthcareName: string;
    category?: { name: string } | null;
    services?: { id: string }[];
    user?: { name?: string };
  };
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Profile Under Review
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back,{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {provider.user?.name || "Provider"}
            </span>
            !
          </p>
        </div>
        <DateTimeDisplay />
      </div>

      {/* Alert - Pending Verification */}
      <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-300">
          Verification In Progress
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-400">
          Your provider profile is currently under review by our admin team.
          You&apos;ll be notified once your profile is verified and approved.
          This usually takes 1-2 business days.
        </AlertDescription>
      </Alert>

      {/* Profile Summary Card */}
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            Profile Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Business Name:
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {provider.healthcareName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Category:
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {provider.category?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Services:
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {provider.services?.length || 0} services
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Status:
              </span>
              <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                Pending Verification
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              While waiting, you can still view and update your profile
              information.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-sm text-slate-600 dark:text-slate-400">
            <li>Our admin team reviews your profile and submitted documents</li>
            <li>We verify your credentials and business information</li>
            <li>You&apos;ll receive an email notification once approved</li>
            <li>After approval, your profile will be visible to clients</li>
            <li>You can start accepting appointments immediately</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// Date Time Display Component (extracted for reuse)
function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
          <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Date
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {currentTime.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Time
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
