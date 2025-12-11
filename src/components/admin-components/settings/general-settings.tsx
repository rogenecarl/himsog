"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw, Save } from "lucide-react";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
  useSystemStats,
} from "@/hooks/use-admin-settings";
import { useEffect } from "react";

// ============================================================================
// SCHEMA
// ============================================================================

const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// ============================================================================
// SKELETON
// ============================================================================

function GeneralSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-64 bg-slate-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-10 w-full bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-6 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SYSTEM STATS CARD
// ============================================================================

function SystemStatsCard() {
  const { data, isLoading, isError, refetch } = useSystemStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-6 w-12 bg-slate-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load system stats</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: "Total Users", value: data?.totalUsers ?? 0 },
    { label: "Total Providers", value: data?.totalProviders ?? 0 },
    { label: "Total Services", value: data?.totalServices ?? 0 },
    { label: "Categories", value: data?.totalCategories ?? 0 },
    { label: "Pending Providers", value: data?.pendingProviders ?? 0 },
    { label: "Audit Logs Today", value: data?.auditLogsToday ?? 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
        <CardDescription>Current platform statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GeneralSettings() {
  const { data: settings, isLoading, isError, error, refetch } = usePlatformSettings();
  const { mutate: updateSettings, isPending } = useUpdatePlatformSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      maintenanceMode: false,
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    updateSettings(values);
  };

  if (isLoading) {
    return <GeneralSettingsSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load settings: {error?.message}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <SystemStatsCard />

      {/* Settings Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 border-destructive/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-destructive">
                        Maintenance Mode
                      </FormLabel>
                      <FormDescription>
                        When enabled, only admins can access the platform
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
