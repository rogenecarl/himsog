# Provider Panel Implementation Plan
# Performance-Optimized Architecture

**Project:** Himsog Healthcare Platform
**Document Version:** 2.0
**Last Updated:** November 27, 2025

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Performance Patterns](#2-performance-patterns)
3. [Implemented Components](#3-implemented-components)
4. [Code Patterns & Examples](#4-code-patterns--examples)
5. [Optimization Techniques](#5-optimization-techniques)
6. [Future Enhancements](#6-future-enhancements)
7. [Deployment & Monitoring](#7-deployment--monitoring)

---

## 1. Architecture Overview

### 1.1 Tech Stack

```
Frontend:        Next.js 16 (App Router + Server Actions)
State:           Zustand (persistent) + React Query (async)
UI:              shadcn/ui + Tailwind CSS 4
Forms:           React Hook Form + Zod
Database:        PostgreSQL + Prisma Accelerate
Auth:            Better Auth (Role-based)
Charts:          Recharts
```

### 1.2 Provider Panel Routes

```
/provider/
├── dashboard           # Main dashboard with stats, schedule, activities
├── appointments        # Appointment management with bulk actions
├── services           # Service CRUD (SINGLE/PACKAGE types)
├── calendar           # Day/Week/Month views
├── analytics          # Charts and KPIs
├── reviews            # Review management
├── settings           # Profile settings
└── onboarding/
    ├── step-1         # Basic information
    ├── step-2         # Services setup
    ├── step-3         # Operating hours
    ├── step-4         # Documents upload
    └── summary        # Review & submit
```

### 1.3 File Organization

```
src/
├── app/provider/              # Page components
├── actions/provider/          # Server Actions
├── components/provider-components/
│   ├── dashboard/             # Dashboard sub-components
│   ├── appointment-components/
│   ├── calendar-components/
│   ├── analytics-component/
│   ├── services-components/
│   ├── reviews-component/
│   ├── skeletons/            # Loading states
│   └── onboarding/
└── hooks/                     # React Query hooks
```

---

## 2. Performance Patterns

### 2.1 Loading State Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  LOADING STATE PRIORITY                                      │
├─────────────────────────────────────────────────────────────┤
│  1. isLoading → ComponentSkeleton (ALWAYS)                   │
│  2. isError   → ErrorBoundary with retry (ALWAYS)           │
│  3. !data     → EmptyState (when applicable)                 │
│  4. data      → DataDisplay (final render)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Query Configuration Matrix

| Data Type | staleTime | gcTime | refetchInterval | Optimistic |
|-----------|-----------|--------|-----------------|------------|
| Dashboard Stats | 30s | 5min | 60s | ❌ |
| Today's Appointments | 30s | 5min | 60s | ❌ |
| Activities | 60s | 5min | - | ❌ |
| Appointments List | 30s | 5min | - | ✅ |
| Calendar | 60s | 10min | - | ❌ |
| Services | 5min | 10min | - | ✅ |
| Analytics | 2min | 10min | - | ❌ |

### 2.3 Mutation Strategy

```typescript
// OPTIMISTIC UPDATE PATTERN
const mutation = useMutation({
  mutationFn: updateData,

  // Step 1: Optimistic update
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, optimisticData);
    return { previous };
  },

  // Step 2: Rollback on error
  onError: (err, variables, context) => {
    queryClient.setQueryData(queryKey, context.previous);
    toast.error("Operation failed");
  },

  // Step 3: Success handling
  onSuccess: () => {
    toast.success("Operation successful");
  },

  // Step 4: Always revalidate
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey });
  },
});
```

---

## 3. Implemented Components

### 3.1 Skeleton Components

**Location:** `src/components/provider-components/skeletons/`

| Component | File | Usage |
|-----------|------|-------|
| `DashboardStatCardSkeleton` | `dashboard-stats-skeleton.tsx` | Dashboard metric cards |
| `DashboardStatsGridSkeleton` | `dashboard-stats-skeleton.tsx` | 4-card grid layout |
| `TodayScheduleSkeleton` | `dashboard-stats-skeleton.tsx` | Today's appointments |
| `AppointmentCardSkeleton` | `appointment-card-skeleton.tsx` | Single appointment card |
| `AppointmentListSkeleton` | `appointment-card-skeleton.tsx` | List of appointments |
| `ServiceCardSkeleton` | `service-card-skeleton.tsx` | Single service card |
| `ServiceGridSkeleton` | `service-card-skeleton.tsx` | Services grid |
| `CalendarHeaderSkeleton` | `calendar-skeleton.tsx` | Calendar navigation |
| `CalendarDayViewSkeleton` | `calendar-skeleton.tsx` | Day view |
| `CalendarWeekViewSkeleton` | `calendar-skeleton.tsx` | Week view |
| `CalendarMonthViewSkeleton` | `calendar-skeleton.tsx` | Month view |
| `ChartSkeleton` | `chart-skeleton.tsx` | Generic chart |
| `KPICardSkeleton` | `chart-skeleton.tsx` | Analytics KPI cards |
| `SettingsSectionSkeleton` | `settings-skeleton.tsx` | Settings forms |
| `ActivityItemSkeleton` | `activity-skeleton.tsx` | Activity feed items |
| `ActivityFeedSkeleton` | `activity-skeleton.tsx` | Activity feed |

### 3.2 Dashboard Components

**Location:** `src/components/provider-components/dashboard/`

```typescript
// Exports from index.ts
export { DashboardHeader, DashboardHeaderSkeleton } from "./dashboard-header";
export { DashboardStats } from "./dashboard-stats";
export { TodaySchedule } from "./today-schedule";
export { RecentActivity } from "./recent-activity";
export { QuickActions } from "./quick-actions";
```

#### DashboardStats Component Pattern

```typescript
// src/components/provider-components/dashboard/dashboard-stats.tsx
"use client";

import { useDashboardStats } from "@/hooks/use-provider-dashboard";
import { DashboardStatsGridSkeleton } from "../skeletons";

export function DashboardStats() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();

  if (isLoading) return <DashboardStatsGridSkeleton count={4} />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load stats: {error?.message}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map(({ key, label, icon: Icon, color, borderColor }) => (
        <Card key={key} className={`border-l-4 ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 3.3 Server Actions

**Location:** `src/actions/provider/`

| File | Actions |
|------|---------|
| `dashboard-actions.ts` | `getDashboardStats`, `getTodayAppointments`, `getRecentActivities` |
| `get-provider-appointments-actions.ts` | `getProviderAppointments`, `getAppointmentStatistics`, `updateAppointmentStatus`, `cancelAppointment` |
| `bulk-appointment-actions.ts` | `bulkUpdateAppointmentStatus`, `rescheduleAppointment` |
| `get-calendar-actions.ts` | `getCalendarAppointments`, `getDayAppointments` |
| `provider-services-action.ts` | `getProviderServices`, `createService`, `updateService`, `deleteService`, `toggleServiceActive` |
| `get-provider-analytics-actions.ts` | `getProviderAnalytics` |
| `update-provider-profile-action.ts` | `updateProviderProfile`, `updateOperatingHours` |

### 3.4 React Query Hooks

**Location:** `src/hooks/`

| Hook | File | Purpose |
|------|------|---------|
| `useDashboardStats` | `use-provider-dashboard.ts` | Dashboard statistics |
| `useTodayAppointments` | `use-provider-dashboard.ts` | Today's schedule |
| `useRecentActivities` | `use-provider-dashboard.ts` | Activity feed |
| `useProviderAppointments` | `use-get-provider-appointment.ts` | Appointment list |
| `useAppointmentStatistics` | `use-get-provider-appointment.ts` | Status counts |
| `useUpdateAppointmentStatus` | `use-get-provider-appointment.ts` | Status mutation (optimistic) |
| `useCancelAppointment` | `use-get-provider-appointment.ts` | Cancel mutation (optimistic) |
| `useBulkUpdateAppointmentStatus` | `use-get-provider-appointment.ts` | Bulk operations (optimistic) |
| `useCalendarAppointments` | `use-provider-calendar.ts` | Calendar data |
| `useDayAppointments` | `use-provider-calendar.ts` | Day view data |
| `useProviderServices` | `use-provider-services-hook.ts` | Services list |
| `useCreateService` | `use-provider-services-hook.ts` | Create service |
| `useUpdateService` | `use-provider-services-hook.ts` | Update service |
| `useDeleteService` | `use-provider-services-hook.ts` | Delete service |
| `useToggleServiceActive` | `use-provider-services-hook.ts` | Toggle active |
| `useProviderAnalytics` | `use-get-provider-analytics-hook.ts` | Analytics data |

---

## 4. Code Patterns & Examples

### 4.1 Page Component Pattern

```typescript
// src/app/provider/[page]/page.tsx
"use client";

import { useProviderProfile } from "@/hooks/use-provider-profile";
import { PageSkeleton } from "@/components/provider-components/skeletons";

export default function ProviderPage() {
  const { data: provider, isLoading } = useProviderProfile();

  // Full page skeleton during initial load
  if (isLoading) return <PageSkeleton />;

  // Auth/profile checks
  if (!provider) return <NoProfileState />;
  if (provider.status === "PENDING") return <PendingState />;

  // Main content - sub-components handle their own loading
  return (
    <div className="space-y-8">
      <PageHeader />
      <DataComponent1 />  {/* Has own skeleton */}
      <DataComponent2 />  {/* Has own skeleton */}
    </div>
  );
}
```

### 4.2 Data Component Pattern

```typescript
// Component with data fetching
"use client";

import { useDataHook } from "@/hooks/use-data-hook";
import { ComponentSkeleton } from "./skeletons";
import { ErrorDisplay } from "@/components/shared/error-display";
import { EmptyState } from "@/components/shared/empty-state";

export function DataComponent() {
  const { data, isLoading, isError, error, refetch } = useDataHook();

  // Loading state
  if (isLoading) return <ComponentSkeleton />;

  // Error state
  if (isError) return <ErrorDisplay error={error} onRetry={refetch} />;

  // Empty state
  if (!data?.length) return <EmptyState message="No data found" />;

  // Success state
  return <DataDisplay data={data} />;
}
```

### 4.3 Server Action Pattern

```typescript
// src/actions/provider/[action]-actions.ts
"use server";

import prisma from "@/lib/prisma";
import { requireProvider } from "@/actions/auth/auth-check-utils";

export async function getData(): Promise<{
  success: boolean;
  data?: DataType;
  error?: string;
}> {
  const user = await requireProvider();

  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!provider) {
      return { success: false, error: "Provider not found" };
    }

    // Parallel queries for performance
    const [result1, result2, result3] = await Promise.all([
      prisma.model1.findMany({ where: { providerId: provider.id } }),
      prisma.model2.aggregate({ where: { providerId: provider.id } }),
      prisma.model3.count({ where: { providerId: provider.id } }),
    ]);

    return {
      success: true,
      data: { result1, result2, result3 },
    };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { success: false, error: "Failed to fetch data" };
  }
}
```

### 4.4 React Query Hook Pattern

```typescript
// src/hooks/use-[feature].ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, updateData } from "@/actions/provider/[feature]-actions";
import { toast } from "sonner";

// Query hook
export function useData() {
  return useQuery({
    queryKey: ["provider", "feature", "data"],
    queryFn: async () => {
      const result = await getData();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30000,
  });
}

// Mutation hook with optimistic update
export function useUpdateData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: UpdateParams) => {
      const result = await updateData(variables);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["provider", "feature"] });
      const previous = queryClient.getQueryData(["provider", "feature"]);

      queryClient.setQueryData(["provider", "feature"], (old: DataType[]) =>
        old.map((item) =>
          item.id === variables.id ? { ...item, ...variables } : item
        )
      );

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["provider", "feature"], context?.previous);
      toast.error(`Failed: ${err.message}`);
    },

    onSuccess: () => {
      toast.success("Updated successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "feature"] });
    },
  });
}
```

### 4.5 Skeleton Component Pattern

```typescript
// src/components/provider-components/skeletons/[component]-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ItemSkeleton() {
  return (
    <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

## 5. Optimization Techniques

### 5.1 Database Query Optimization

```typescript
// ✅ Parallel queries with Promise.all
const [appointments, stats, activities] = await Promise.all([
  prisma.appointment.findMany({ where: { providerId } }),
  prisma.appointment.aggregate({ where: { providerId } }),
  prisma.review.findMany({ where: { providerId }, take: 10 }),
]);

// ✅ Select only needed fields
const provider = await prisma.provider.findUnique({
  where: { userId },
  select: { id: true, healthcareName: true, status: true },
});

// ✅ Use indexes for common queries
// In schema.prisma:
// @@index([providerId])
// @@index([status])
// @@index([createdAt])
```

### 5.2 Query Key Strategy

```typescript
// Hierarchical query keys for granular invalidation
const queryKeys = {
  dashboard: {
    all: ["provider", "dashboard"],
    stats: ["provider", "dashboard", "stats"],
    today: ["provider", "dashboard", "today-appointments"],
    activities: (limit: number) => ["provider", "dashboard", "activities", limit],
  },
  appointments: {
    all: ["provider-appointments"],
    list: (filters: Filters) => ["provider-appointments", "list", filters],
    statistics: (filters: Filters) => ["provider-appointments", "statistics", filters],
  },
  calendar: {
    all: ["provider-calendar"],
    appointments: (range: DateRange) => ["provider-calendar", "appointments", range],
    day: (date: Date) => ["provider-calendar", "day", date],
  },
  services: ["providerServices"],
  analytics: (range: DateRange) => ["provider", "analytics", range],
};

// Invalidation examples
queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
```

### 5.3 Prefetching Strategy

```typescript
// Prefetch on hover for instant navigation
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function SidebarLink({ href, children }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleMouseEnter = () => {
    // Prefetch based on destination
    switch (href) {
      case "/provider/appointments":
        queryClient.prefetchQuery({
          queryKey: ["provider-appointments", "list"],
          queryFn: () => getProviderAppointments({}),
          staleTime: 30000,
        });
        break;
      case "/provider/analytics":
        queryClient.prefetchQuery({
          queryKey: ["provider", "analytics"],
          queryFn: () => getProviderAnalytics({ last30Days: true }),
          staleTime: 120000,
        });
        break;
      case "/provider/services":
        queryClient.prefetchQuery({
          queryKey: ["providerServices"],
          queryFn: getProviderServices,
          staleTime: 300000,
        });
        break;
    }
  };

  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

### 5.4 Optimistic Updates

```typescript
// Full optimistic update implementation
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, reason }: UpdateParams) => {
      const result = await updateAppointmentStatus(id, status, reason);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    onMutate: async ({ id, status }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ["provider-appointments"] });
      await queryClient.cancelQueries({ queryKey: ["provider", "dashboard"] });

      // Snapshot previous state
      const previousAppointments = queryClient.getQueryData(["provider-appointments"]);
      const previousDashboard = queryClient.getQueryData(["provider", "dashboard", "stats"]);

      // Optimistically update appointment list
      queryClient.setQueriesData(
        { queryKey: ["provider-appointments"] },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            appointments: old.appointments?.map((apt: Appointment) =>
              apt.id === id ? { ...apt, status, _optimistic: true } : apt
            ),
          };
        }
      );

      // Optimistically update dashboard counts
      queryClient.setQueryData(
        ["provider", "dashboard", "stats"],
        (old: DashboardStats | undefined) => {
          if (!old) return old;
          // Adjust counts based on status change
          return updateDashboardCounts(old, status);
        }
      );

      return { previousAppointments, previousDashboard };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(["provider-appointments"], context.previousAppointments);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(["provider", "dashboard", "stats"], context.previousDashboard);
      }
      toast.error(`Failed to update: ${err.message}`);
    },

    onSuccess: (data, { status }) => {
      const messages: Record<string, string> = {
        CONFIRMED: "Appointment confirmed",
        COMPLETED: "Appointment completed",
        CANCELLED: "Appointment cancelled",
      };
      toast.success(messages[status] || "Status updated");
    },

    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["provider-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["provider", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["provider-calendar"] });
    },
  });
}
```

---

## 6. Implementation Phases

### 6.1 Phase 1: Core Performance Foundation ✅ COMPLETED

**Goal:** Establish skeleton loading and parallel data fetching infrastructure.

#### Tasks Completed

| Task | File(s) Created | Description |
|------|-----------------|-------------|
| Skeleton Library | `skeletons/index.ts` | Central export for all skeletons |
| Dashboard Stats Skeleton | `dashboard-stats-skeleton.tsx` | 4-card grid with shimmer |
| Appointment Skeleton | `appointment-card-skeleton.tsx` | Card with avatar, content, actions |
| Activity Skeleton | `activity-skeleton.tsx` | Feed items with timestamp |
| Dashboard Actions | `dashboard-actions.ts` | 9 parallel Prisma queries |
| Dashboard Hook | `use-provider-dashboard.ts` | React Query with 30s stale |
| Dashboard Page | `dashboard/page.tsx` | Component-level loading |

#### Code Examples

```typescript
// Parallel queries in dashboard-actions.ts
const [
  todayAppointments,
  pendingAppointments,
  confirmedAppointments,
  totalServices,
  reviewStats,
  todayRevenue,
  unreadMessages,
  thisWeekAppointments,
  lastWeekAppointments,
] = await Promise.all([
  prisma.appointment.count({ ... }),
  prisma.appointment.count({ ... }),
  // ... 7 more queries
]);
```

---

### 6.2 Phase 2: Appointment Management ✅ COMPLETED

**Goal:** Implement optimistic updates, bulk operations, and comprehensive appointment management.

#### Tasks Completed

| Task | File(s) | Description |
|------|---------|-------------|
| Appointment Actions | `get-provider-appointments-actions.ts` | List, statistics, update, cancel with transactions |
| Bulk Actions | `bulk-appointment-actions.ts` | Bulk update + reschedule with conflict detection |
| Appointment Hook | `use-get-provider-appointment.ts` | 6 hooks with optimistic updates |
| Appointment Card | `appointment-card.tsx` | Status-specific actions, checkbox selection |
| Bulk Actions Bar | `bulk-actions-bar.tsx` | Sticky bar, select all, cancel dialog |
| Status Section | `appointment-status-section.tsx` | Grouped display with empty states |
| Date Range Picker | `date-range-picker.tsx` | Preset ranges + custom selection |

#### Server Actions Implemented

```typescript
// get-provider-appointments-actions.ts
getProviderAppointments(filters)     // PENDING/CONFIRMED always, others date-filtered
getAppointmentStatistics(filters)    // Parallel count queries
updateAppointmentStatus(id, status)  // Transaction with notification
cancelAppointment(id, reason)        // Transaction with notification

// bulk-appointment-actions.ts
bulkUpdateAppointmentStatus(ids, status, reason)  // Batch update + notifications
rescheduleAppointment(id, newStart, newEnd)       // Conflict detection
```

#### React Query Hooks Implemented

```typescript
// use-get-provider-appointment.ts
useProviderAppointments(filters)       // List query
useAppointmentStatistics(filters)      // Stats query
useUpdateAppointmentStatus()           // Optimistic mutation
useCancelAppointment()                 // Optimistic mutation
useBulkUpdateAppointmentStatus()       // Optimistic bulk mutation
useRescheduleAppointment()             // Reschedule mutation
```

#### Optimistic Update Pattern

```typescript
// All mutations follow this pattern
return useMutation({
  mutationFn: async (variables) => { /* server call */ },

  onMutate: async (variables) => {
    // 1. Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: appointmentKeys.all });

    // 2. Snapshot all list queries
    const previousData = queryClient.getQueriesData({
      queryKey: appointmentKeys.lists(),
    });

    // 3. Optimistically update all matching queries
    queryClient.setQueriesData({ queryKey: appointmentKeys.lists() }, (old) =>
      old?.map((apt) => apt.id === id ? { ...apt, status } : apt)
    );

    return { previousData };
  },

  onError: (err, variables, context) => {
    // Rollback all queries on error
    context?.previousData.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
    toast.error(err.message);
  },

  onSettled: () => {
    // Invalidate appointments + dashboard
    queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    queryClient.invalidateQueries({ queryKey: ["provider", "dashboard"] });
  },
});
```

#### Query Keys Structure

```typescript
export const appointmentKeys = {
  all: ["provider-appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (filters: string) => [...appointmentKeys.lists(), { filters }] as const,
  statistics: () => [...appointmentKeys.all, "statistics"] as const,
  stats: (filters: string) => [...appointmentKeys.statistics(), { filters }] as const,
};
```

---

### 6.3 Phase 3: Calendar & Services ✅ COMPLETED

**Goal:** Multi-view calendar and service management.

#### Tasks Completed

| Task | File(s) | Description |
|------|---------|-------------|
| Calendar Actions | `get-calendar-actions.ts` | Date range queries |
| Calendar Hook | `use-provider-calendar.ts` | View-based fetching |
| Day View | `day-view.tsx` | Hourly time slots |
| Week View | `week-view.tsx` | 7-day grid |
| Month View | `month-view.tsx` | 35-day calendar |
| Calendar Skeletons | `calendar-skeleton.tsx` | View-specific loading |
| Service Actions | `provider-services-action.ts` | Full CRUD |
| Service Hook | `use-provider-services-hook.ts` | With mutations |
| Service Form | `services-form-provider.tsx` | Create/edit |

#### Calendar Architecture

```
Calendar Page
├── CalendarHeader (view toggle, navigation)
├── View Switch
│   ├── DayView → useDayAppointments(date)
│   ├── WeekView → useCalendarAppointments(weekRange)
│   └── MonthView → useCalendarAppointments(monthRange)
└── Each view has matching skeleton
```

---

### 6.4 Phase 4: Analytics & Reviews ✅ COMPLETED

**Goal:** Chart components with loading states.

#### Tasks Completed

| Task | File(s) | Description |
|------|---------|-------------|
| Analytics Actions | `get-provider-analytics-actions.ts` | KPIs, chart data |
| Analytics Hook | `use-get-provider-analytics-hook.ts` | Date filtering |
| Revenue Chart | `revenue-chart.tsx` | Line/area |
| Trends Chart | `appointment-trends-chart.tsx` | Trend lines |
| Peak Hours | `peak-hours-chart.tsx` | Heatmap |
| Popular Services | `popular-services-chart.tsx` | Bar chart |
| Status Distribution | `status-distribution-chart.tsx` | Pie/donut |
| Chart Skeleton | `chart-skeleton.tsx` | Generic chart loading |
| Review List | `provider-review-list.tsx` | Paginated |
| Review Stats | `provider-review-stats.tsx` | Summary cards |

---

### 6.5 Phase 5: Settings & Onboarding ✅ COMPLETED

**Goal:** Provider configuration and onboarding flow.

#### Tasks Completed

| Task | File(s) | Description |
|------|---------|-------------|
| Basic Info | `basic-information-components.tsx` | Profile editing |
| Operating Hours | `operating-hours-component.tsx` | Schedule config |
| Shop Media | `shop-media-component.tsx` | Image upload |
| Settings Skeleton | `settings-skeleton.tsx` | Form loading |
| Step 1 Form | `step-1-form.tsx` | Basic info |
| Step 2 Form | `step-2-form.tsx` | Services |
| Step 3 Form | `step-3-form.tsx` | Hours |
| Step 4 Form | `step-4-form.tsx` | Documents |
| Summary | `step-5-form.tsx` | Review |
| Store | `onboarding-store.ts` | Zustand persistence |

#### Onboarding Flow

```
Step 1: Basic Info (name, category, contact, location)
    ↓
Step 2: Services (create services, set prices)
    ↓
Step 3: Operating Hours (day-by-day schedule)
    ↓
Step 4: Documents (upload verification docs)
    ↓
Summary: Review all → Submit for verification
```

---

### 6.6 Phase 6: Performance Enhancements ✅ COMPLETED

**Goal:** Navigation optimization and advanced caching.

#### Tasks Completed

| Task | File(s) | Description |
|------|---------|-------------|
| Query Key Factory | `src/lib/query-keys.ts` | Centralized keys for all provider queries |
| Prefetch on Hover | `sidebar-general.tsx` | Instant navigation with data pre-loading |
| Stale Indicators | `query-state-indicator.tsx` | Visual feedback for data freshness |
| Error Retry | All hooks | Exponential backoff with 2 retries |
| Background Sync | All hooks | refetchOnWindowFocus enabled |

#### Centralized Query Key Factory

```typescript
// src/lib/query-keys.ts
export const providerQueryKeys = {
  all: ["provider"] as const,

  dashboard: {
    all: () => [...providerQueryKeys.all, "dashboard"] as const,
    stats: () => [...providerQueryKeys.dashboard.all(), "stats"] as const,
    todayAppointments: () => [...providerQueryKeys.dashboard.all(), "today-appointments"] as const,
    activities: (limit: number) => [...providerQueryKeys.dashboard.all(), "activities", limit] as const,
  },

  appointments: {
    all: () => [...providerQueryKeys.all, "appointments"] as const,
    list: (filters: Record<string, unknown>) => [...providerQueryKeys.appointments.all(), "list", filters] as const,
    stats: (filters: Record<string, unknown>) => [...providerQueryKeys.appointments.all(), "stats", filters] as const,
  },

  calendar: {
    all: () => [...providerQueryKeys.all, "calendar"] as const,
    appointments: (filters: Record<string, unknown>) => [...providerQueryKeys.calendar.all(), "appointments", filters] as const,
    day: (date: string) => [...providerQueryKeys.calendar.all(), "day", date] as const,
  },

  services: {
    all: () => [...providerQueryKeys.all, "services"] as const,
  },

  analytics: {
    all: () => [...providerQueryKeys.all, "analytics"] as const,
    data: (filters: Record<string, unknown>) => [...providerQueryKeys.analytics.all(), "data", filters] as const,
  },

  profile: {
    all: () => [...providerQueryKeys.all, "profile"] as const,
  },
} as const;

export const queryConfigDefaults = {
  dashboard: {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
  appointments: {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
  // ... more configs
} as const;
```

#### Prefetch on Hover Implementation

```typescript
// src/components/provider-components/sidebar-general.tsx
const handleMouseEnter = useCallback((href: string) => {
  switch (href) {
    case "/provider/dashboard":
      queryClient.prefetchQuery({
        queryKey: providerQueryKeys.dashboard.stats(),
        queryFn: async () => {
          const result = await getDashboardStats();
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        staleTime: queryConfigDefaults.dashboard.staleTime,
      });
      break;
    case "/provider/appointments":
      queryClient.prefetchQuery({
        queryKey: providerQueryKeys.appointments.list({ startDate, endDate }),
        queryFn: async () => {
          const result = await getProviderAppointments({ startDate, endDate });
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        staleTime: queryConfigDefaults.appointments.staleTime,
      });
      break;
    // ... more routes
  }
}, [queryClient]);
```

#### Query State Indicator Component

```typescript
// src/components/shared/query-state-indicator.tsx
export function QueryStateIndicator({
  isFetching,
  isStale,
  isError,
  errorMessage,
  onRefresh,
}: QueryStateIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {isFetching && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
      {isStale && !isFetching && (
        <button onClick={onRefresh} className="text-amber-500">
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
      {isError && (
        <button onClick={onRefresh} className="text-red-500">
          <AlertCircle className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
```

#### Hook Updates with Retry Logic

All provider hooks now include:
- `staleTime` - Appropriate cache duration
- `gcTime` - Garbage collection time
- `refetchOnWindowFocus` - Background sync
- `retry: 2` - Retry failed requests twice
- `retryDelay` - Exponential backoff

---

### 6.7 Phase 7: Future Enhancements 📋 PLANNED

**Goal:** Advanced features for complete provider experience.

#### Feature Backlog

| Feature | Priority | Complexity | Dependencies |
|---------|----------|------------|--------------|
| **Export (CSV/PDF)** | High | Medium | jspdf, papaparse |
| **Notification Prefs** | High | Medium | New DB models |
| **Booking Policies** | Medium | Medium | New DB models |
| **Vacation Mode** | Medium | Medium | New DB models |
| **Service Analytics** | Medium | Low | Existing data |
| **Real-time Updates** | Low | High | WebSocket/SSE |
| **Drag-Drop Calendar** | Low | High | @dnd-kit |
| **Virtual Scrolling** | Low | Medium | @tanstack/react-virtual |
| **Offline Support** | Low | High | Service Worker |

#### Export Implementation (Ready to Build)

```typescript
// src/actions/provider/export-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/actions/auth/auth-check-utils";
import { format } from "date-fns";

export async function exportAppointmentsCSV(
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: string; error?: string }> {
  const user = await requireProvider();

  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });

    if (!provider) {
      return { success: false, error: "Provider not found" };
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        user: { select: { name: true, email: true } },
        services: { include: { service: { select: { name: true } } } },
      },
      orderBy: { startTime: "asc" },
    });

    const headers = ["Date", "Time", "Patient", "Email", "Services", "Status", "Total"];
    const rows = appointments.map((apt) => [
      format(apt.startTime, "yyyy-MM-dd"),
      format(apt.startTime, "HH:mm"),
      apt.patientName,
      apt.patientEmail,
      apt.services.map((s) => s.service.name).join("; "),
      apt.status,
      apt.totalPrice.toString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return { success: true, data: csv };
  } catch (error) {
    return { success: false, error: "Export failed" };
  }
}
```

#### Database Models (Ready to Add)

```prisma
// Add to prisma/schema.prisma

model ProviderNotificationPrefs {
  id                     String   @id @default(cuid())
  providerId             String   @unique
  provider               Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)

  // Email notifications
  emailNewBooking        Boolean  @default(true)
  emailCancellation      Boolean  @default(true)
  emailNewReview         Boolean  @default(true)
  emailDailySummary      Boolean  @default(false)

  // Push notifications
  pushAppointmentUpdates Boolean  @default(true)
  pushNewMessages        Boolean  @default(true)

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}

model ProviderBookingPolicy {
  id                 String   @id @default(cuid())
  providerId         String   @unique
  provider           Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)

  advanceNoticeHours Int      @default(24)    // Minimum hours before booking
  cancellationHours  Int      @default(24)    // Free cancellation window
  autoConfirm        Boolean  @default(false) // Auto-confirm bookings
  maxBookingsPerDay  Int?                     // null = unlimited
  bufferMinutes      Int      @default(0)     // Time between appointments

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model ProviderVacation {
  id         String   @id @default(cuid())
  providerId String
  provider   Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)

  startDate  DateTime
  endDate    DateTime
  message    String?  // Auto-response message
  isActive   Boolean  @default(true)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([providerId])
  @@index([startDate, endDate])
}
```

---

### Implementation Progress Summary

```
┌────────────────────────────────────────────────────────────────┐
│ PROVIDER PANEL IMPLEMENTATION STATUS                            │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Phase 1: Core Performance     [████████████████████] 100% ✅    │
│ Phase 2: Appointments         [████████████████████] 100% ✅    │
│ Phase 3: Calendar & Services  [████████████████████] 100% ✅    │
│ Phase 4: Analytics & Reviews  [████████████████████] 100% ✅    │
│ Phase 5: Settings & Onboard   [████████████████████] 100% ✅    │
│ Phase 6: Performance Enhance  [████████████████████] 100% ✅    │
│ Phase 7: Future Enhancements  [░░░░░░░░░░░░░░░░░░░░]   0% 📋    │
│                                                                  │
│ Overall Progress: ~95%                                           │
└────────────────────────────────────────────────────────────────┘
```

### Files Created Per Phase

| Phase | Files | Components | Actions | Hooks |
|-------|-------|------------|---------|-------|
| 1 | 8 | 7 skeletons | 1 | 1 |
| 2 | 6 | 4 UI | 2 | 1 |
| 3 | 10 | 6 views | 2 | 2 |
| 4 | 9 | 7 charts | 1 | 1 |
| 5 | 10 | 8 forms | 2 | 1 |
| 6 | 2 | 1 indicator | 0 | 6 updated |
| **Total** | **45** | **33** | **8** | **6** |

---

## 7. Advanced Implementation Guides

### 7.1 Virtual Scrolling (For Large Lists)

```typescript
// Using @tanstack/react-virtual
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualAppointmentList({ appointments }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: appointments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <AppointmentCard appointment={appointments[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Deployment & Monitoring

### 8.1 Pre-Deployment Checklist

- [ ] All components have skeleton loading states
- [ ] All mutations have optimistic updates where applicable
- [ ] Error boundaries implemented on all data-fetching components
- [ ] Empty states implemented for lists
- [ ] Mobile responsiveness tested
- [ ] Dark mode styling verified
- [ ] TypeScript has no errors (`bun lint`)
- [ ] Build succeeds (`bun build`)

### 8.2 Performance Monitoring

```typescript
// Add to layout.tsx for performance tracking
import { useReportWebVitals } from "next/web-vitals";

export function PerformanceMonitor() {
  useReportWebVitals((metric) => {
    // Log or send to analytics
    console.log({
      name: metric.name,      // FCP, LCP, CLS, FID, TTFB
      value: metric.value,
      rating: metric.rating,  // good, needs-improvement, poor
    });
  });
}
```

### 8.3 Query Performance Tracking

```typescript
// Add to QueryProvider for mutation timing
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onMutate: () => {
        console.time("mutation");
      },
      onSettled: () => {
        console.timeEnd("mutation");
      },
    },
  },
});
```

### 8.4 Error Tracking

```typescript
// Global error boundary for provider routes
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Provider panel error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

---

## Summary

The Provider Panel implementation follows a **performance-first architecture** with:

1. **Skeleton Loading** - Every data component has a matching skeleton
2. **Parallel Queries** - Dashboard uses Promise.all for 9 concurrent queries
3. **Optimistic Updates** - Appointment status changes update UI immediately
4. **Smart Caching** - React Query with appropriate stale/gc times
5. **Error Handling** - Every component handles loading, error, and empty states

**Current Status:** Core implementation complete with all major features working.

**Next Steps:** Implement prefetch on hover, add virtual scrolling for large lists, and set up performance monitoring.

---

**Document maintained by:** Development Team
**Last updated:** November 27, 2025
