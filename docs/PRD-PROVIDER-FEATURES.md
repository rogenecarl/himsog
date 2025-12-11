# Product Requirements Document (PRD)
# Himsog Provider Panel - Performance Optimized

**Version:** 2.0
**Date:** November 27, 2025
**Author:** Development Team
**Status:** Active

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Performance Optimization Goals](#3-performance-optimization-goals)
4. [Feature Specifications](#4-feature-specifications)
5. [Technical Architecture](#5-technical-architecture)
6. [Data Flow & Caching Strategy](#6-data-flow--caching-strategy)
7. [UI/UX Performance Patterns](#7-uiux-performance-patterns)
8. [Implementation Priorities](#8-implementation-priorities)
9. [Success Metrics](#9-success-metrics)

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the optimized Provider Panel architecture for the Himsog healthcare geolocation platform, focusing on **sub-100ms perceived load times**, efficient data fetching, and seamless user experience through intelligent caching and skeleton loading patterns.

### 1.2 Scope

The provider panel optimization covers:
- Performance-first skeleton loading architecture
- React Query caching with optimistic updates
- Parallel data fetching strategies
- Component-level loading isolation
- Prefetching for instant navigation
- Efficient database query patterns

### 1.3 Target Users

| User Type | Primary Needs |
|-----------|---------------|
| Healthcare Providers | Fast access to appointments, quick status updates |
| Practice Managers | Efficient bulk operations, real-time analytics |
| Multi-location Providers | Seamless switching between views |

---

## 2. Current Implementation Status

### 2.1 Implemented Features

| Feature | Location | Status | Performance Notes |
|---------|----------|--------|-------------------|
| Provider Dashboard | `/provider/dashboard` | ✅ Complete | Skeleton loading, parallel queries |
| Appointments | `/provider/appointments` | ✅ Complete | Optimistic updates, bulk actions |
| Services | `/provider/services` | ✅ Complete | CRUD with skeleton loading |
| Calendar | `/provider/calendar` | ✅ Complete | Day/Week/Month views |
| Analytics | `/provider/analytics` | ✅ Complete | Chart skeletons implemented |
| Reviews | `/provider/reviews` | ✅ Complete | Pagination ready |
| Settings | `/provider/settings` | ✅ Complete | Form-based updates |
| Onboarding | `/provider/onboarding/*` | ✅ Complete | 4-step flow with Zustand |

### 2.2 Existing Performance Infrastructure

```
✅ Skeleton Components:
├── dashboard-stats-skeleton.tsx
├── appointment-card-skeleton.tsx
├── service-card-skeleton.tsx
├── calendar-skeleton.tsx
├── chart-skeleton.tsx
├── settings-skeleton.tsx
└── activity-skeleton.tsx

✅ React Query Hooks:
├── use-provider-dashboard.ts (30s stale, 60s refetch)
├── use-provider-calendar.ts
├── use-get-provider-appointment.ts (optimistic updates)
├── use-provider-services-hook.ts
└── use-get-provider-analytics-hook.ts

✅ Server Actions:
├── dashboard-actions.ts (parallel Promise.all)
├── get-provider-appointments-actions.ts
├── bulk-appointment-actions.ts
├── get-calendar-actions.ts
└── provider-services-action.ts
```

### 2.3 Performance Baseline

| Metric | Current | Target |
|--------|---------|--------|
| First Contentful Paint (FCP) | ~800ms | <400ms |
| Time to Interactive (TTI) | ~1.5s | <800ms |
| Skeleton Display | ~100ms | <50ms |
| Data Load Completion | ~2s | <1s |
| Optimistic Update Latency | ~50ms | <30ms |

---

## 3. Performance Optimization Goals

### 3.1 Core Principles

```
┌─────────────────────────────────────────────────────────────┐
│  PERFORMANCE HIERARCHY                                       │
├─────────────────────────────────────────────────────────────┤
│  1. INSTANT SKELETON → User sees structure immediately       │
│  2. PARALLEL FETCH   → All data loads simultaneously        │
│  3. STALE-WHILE-REVALIDATE → Show cached, refresh behind    │
│  4. OPTIMISTIC UPDATE → UI responds before server           │
│  5. PREFETCH ON HOVER → Zero loading on navigation          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Loading State Requirements

Every data-fetching component MUST follow this pattern:

```typescript
// MANDATORY PATTERN
const { data, isLoading, isError, error, refetch } = useQuery();

if (isLoading) return <ComponentSkeleton />;
if (isError) return <ErrorBoundary error={error} onRetry={refetch} />;
if (!data?.length) return <EmptyState />;
return <DataDisplay data={data} />;
```

### 3.3 Query Configuration Standards

| Query Type | staleTime | gcTime | refetchInterval | refetchOnFocus |
|------------|-----------|--------|-----------------|----------------|
| Dashboard Stats | 30s | 5min | 60s | true |
| Today's Appointments | 30s | 5min | 60s | true |
| Activities | 60s | 5min | - | true |
| Appointments List | 30s | 5min | - | true |
| Calendar Data | 60s | 10min | - | true |
| Services | 5min | 10min | - | true |
| Analytics | 2min | 10min | - | true |
| Settings | 5min | 10min | - | false |

---

## 4. Feature Specifications

### 4.1 Dashboard (`/provider/dashboard`)

#### 4.1.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ DashboardPage                                                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DashboardHeader (provider name, date/time)               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ StatCard │ │ StatCard │ │ StatCard │ │ StatCard │       │
│ │ Today    │ │ Pending  │ │ Services │ │ Rating   │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌─────────────────────────────┐ ┌─────────────────────────┐ │
│ │ QuickActions (2 cols)       │ │ TodaySchedule (1 col)  │ │
│ │ • New Service               │ │ • Appointment 1        │ │
│ │ • View Appointments         │ │ • Appointment 2        │ │
│ │ • View Analytics            │ │ • Appointment 3        │ │
│ │ • Settings                  │ │                        │ │
│ └─────────────────────────────┘ └─────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ RecentActivity (full width)                              │ │
│ │ • Booking | Review | Message items                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.2 Data Dependencies

| Component | Server Action | Query Key | Parallel |
|-----------|---------------|-----------|----------|
| DashboardStats | `getDashboardStats()` | `["provider", "dashboard", "stats"]` | ✅ |
| TodaySchedule | `getTodayAppointments()` | `["provider", "dashboard", "today-appointments"]` | ✅ |
| RecentActivity | `getRecentActivities()` | `["provider", "dashboard", "activities"]` | ✅ |

#### 4.1.3 Stats Metrics

```typescript
interface DashboardStats {
  todayAppointments: number;      // Today's scheduled appointments
  pendingAppointments: number;    // Awaiting confirmation
  confirmedAppointments: number;  // Confirmed appointments
  totalServices: number;          // Active services count
  rating: number;                 // Average rating (0-5)
  totalReviews: number;           // Total review count
  todayRevenue: number;           // Completed appointments today
  unreadMessages: number;         // Unread conversation messages
  weeklyTrend: {
    appointments: number;         // This week's bookings
    change: number;               // % change vs last week
  };
}
```

### 4.2 Appointments (`/provider/appointments`)

#### 4.2.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ AppointmentsPage                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Header + DateRangePicker + BulkModeToggle               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Today    │ │ Pending  │ │ Confirmed│ │ Completed│       │
│ │ Count    │ │ Count    │ │ Count    │ │ Count    │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ BulkActionsBar (visible when bulk mode active)          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PENDING Section                                          │ │
│ │ └── AppointmentCard × N (with approve/cancel actions)   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ CONFIRMED Section                                        │ │
│ │ └── AppointmentCard × N (with complete action)          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ COMPLETED Section (date-filtered)                        │ │
│ │ └── AppointmentCard × N (read-only)                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ CANCELLED Section (date-filtered)                        │ │
│ │ └── AppointmentCard × N (read-only)                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.2 Optimistic Update Flow

```
User Action: Click "Approve" on PENDING appointment
│
├─> 1. OPTIMISTIC UPDATE (immediate)
│   └─> Move card from PENDING to CONFIRMED section
│   └─> Show pending indicator on card
│
├─> 2. SERVER REQUEST (background)
│   └─> updateAppointmentStatus(id, "CONFIRMED")
│   └─> Create notification for client
│
├─> 3a. SUCCESS
│   └─> Remove pending indicator
│   └─> Show success toast
│   └─> Invalidate queries to sync
│
└─> 3b. ERROR
    └─> ROLLBACK to previous state
    └─> Show error toast
    └─> Card returns to PENDING section
```

#### 4.2.3 Bulk Operations

| Operation | Endpoint | Optimistic Update |
|-----------|----------|-------------------|
| Bulk Confirm | `bulkUpdateAppointmentStatus(ids, "CONFIRMED")` | ✅ Move all selected |
| Bulk Cancel | `bulkUpdateAppointmentStatus(ids, "CANCELLED", reason)` | ✅ Move all selected |

### 4.3 Services (`/provider/services`)

#### 4.3.1 Service Types

```typescript
type ServiceType = "SINGLE" | "PACKAGE";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: Decimal;
  duration: number;           // minutes
  type: ServiceType;
  isActive: boolean;
  providerId: string;
  acceptedInsurances: Insurance[];
  childServices: Service[];   // For PACKAGE type
  parentPackages: Service[];  // Services this belongs to
}
```

#### 4.3.2 Actions

| Action | Description | Optimistic |
|--------|-------------|------------|
| Create | `createService(data)` | ❌ (new data) |
| Update | `updateService(id, data)` | ✅ |
| Delete | `deleteService(id)` | ✅ |
| Toggle Active | `toggleServiceActive(id)` | ✅ |

### 4.4 Calendar (`/provider/calendar`)

#### 4.4.1 View Types

| View | Grid | Data Granularity |
|------|------|------------------|
| Day | 24 hourly slots | Single day appointments |
| Week | 7 days × hours | Week's appointments |
| Month | 35 day grid | Month overview |

#### 4.4.2 Query Strategy

```typescript
// Single query for all views
useCalendarAppointments({
  startDate: viewStart,  // First day of view
  endDate: viewEnd,      // Last day of view
});

// Day view detail fetch
useDayAppointments(selectedDate);
```

### 4.5 Analytics (`/provider/analytics`)

#### 4.5.1 Chart Components

| Chart | Data Source | Skeleton Type |
|-------|-------------|---------------|
| Revenue Chart | Daily/weekly revenue | Line skeleton |
| Appointment Trends | Booking patterns | Area skeleton |
| Peak Hours | Hourly distribution | Heatmap skeleton |
| Popular Services | Service rankings | Bar skeleton |
| Status Distribution | Status breakdown | Pie skeleton |
| Cancellation Reasons | Cancel analysis | Bar skeleton |
| Review Radar | Multi-axis ratings | Radar skeleton |

#### 4.5.2 KPI Cards

```typescript
interface AnalyticsKPIs {
  totalRevenue: number;
  totalAppointments: number;
  averageRating: number;
  completionRate: number;
  periodComparison: {
    revenue: { current: number; previous: number; change: number };
    appointments: { current: number; previous: number; change: number };
  };
}
```

### 4.6 Settings (`/provider/settings`)

#### 4.6.1 Sections

| Section | Components | Auto-save |
|---------|------------|-----------|
| Basic Information | Name, description, contact, location | ❌ |
| Operating Hours | Day-by-day schedule, breaks | ❌ |
| Shop Media | Cover photo, gallery | ✅ (on upload) |

---

## 5. Technical Architecture

### 5.1 File Structure

```
src/
├── app/provider/
│   ├── layout.tsx                 # Provider layout with sidebar
│   ├── dashboard/page.tsx         # Dashboard with component-level loading
│   ├── appointments/page.tsx      # Appointments with optimistic updates
│   ├── services/page.tsx          # Services CRUD
│   ├── calendar/page.tsx          # Calendar views
│   ├── analytics/page.tsx         # Analytics charts
│   ├── reviews/page.tsx           # Reviews list
│   ├── settings/page.tsx          # Settings forms
│   └── onboarding/
│       ├── step-1/page.tsx        # Basic info
│       ├── step-2/page.tsx        # Services
│       ├── step-3/page.tsx        # Operating hours
│       ├── step-4/page.tsx        # Documents
│       └── summary/page.tsx       # Review & submit
│
├── actions/provider/
│   ├── dashboard-actions.ts       # Dashboard data (parallel queries)
│   ├── get-provider-appointments-actions.ts
│   ├── bulk-appointment-actions.ts
│   ├── get-calendar-actions.ts
│   ├── provider-services-action.ts
│   ├── get-provider-analytics-actions.ts
│   └── update-provider-profile-action.ts
│
├── components/provider-components/
│   ├── dashboard/                 # Dashboard sub-components
│   ├── appointment-components/    # Appointment cards, bulk actions
│   ├── calendar-components/       # Calendar views
│   ├── analytics-component/       # Chart components
│   ├── services-components/       # Service forms, dialogs
│   ├── reviews-component/         # Review list, stats
│   ├── skeletons/                 # All skeleton components
│   └── onboarding/                # Onboarding forms
│
└── hooks/
    ├── use-provider-dashboard.ts  # Dashboard queries
    ├── use-get-provider-appointment.ts  # Appointment CRUD
    ├── use-provider-calendar.ts   # Calendar queries
    ├── use-provider-services-hook.ts  # Services CRUD
    └── use-get-provider-analytics-hook.ts  # Analytics
```

### 5.2 Server Action Response Pattern

```typescript
// Standard ActionResponse type
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Usage in hooks
const result = await serverAction(params);
if (!result.success) throw new Error(result.error);
return result.data;
```

### 5.3 Database Query Optimization

```typescript
// ✅ GOOD: Parallel queries with Promise.all
const [stats, appointments, activities] = await Promise.all([
  prisma.appointment.count({ where: { ... } }),
  prisma.appointment.findMany({ where: { ... } }),
  prisma.review.aggregate({ where: { ... } }),
]);

// ❌ BAD: Sequential queries
const stats = await prisma.appointment.count({ ... });
const appointments = await prisma.appointment.findMany({ ... });
const activities = await prisma.review.aggregate({ ... });
```

---

## 6. Data Flow & Caching Strategy

### 6.1 Query Invalidation Map

```
Action                     → Invalidates
─────────────────────────────────────────────
Update appointment status  → ["provider", "appointments"]
                          → ["provider", "dashboard"]
                          → ["provider", "calendar"]

Create/update service     → ["providerServices"]
                          → ["provider", "dashboard", "stats"]

Complete appointment      → ["provider", "dashboard", "stats"]
                          → ["provider", "analytics"]
```

### 6.2 Prefetching Strategy

```typescript
// Sidebar link hover prefetching
const handleMouseEnter = (route: string) => {
  switch (route) {
    case "/provider/appointments":
      queryClient.prefetchQuery({
        queryKey: ["provider", "appointments"],
        queryFn: getAppointments,
      });
      break;
    case "/provider/analytics":
      queryClient.prefetchQuery({
        queryKey: ["provider", "analytics"],
        queryFn: getAnalytics,
      });
      break;
  }
};
```

---

## 7. UI/UX Performance Patterns

### 7.1 Skeleton Matching

Each skeleton MUST match the exact dimensions of final content to prevent layout shift:

```typescript
// ✅ Skeleton matches card height
<Card className="h-[120px]">
  <Skeleton className="h-[120px]" />
</Card>

// ❌ Causes layout shift
<Skeleton className="h-[100px]" />  // Different from actual
```

### 7.2 Loading State Transitions

```
Page Load Timeline
──────────────────────────────────────────────────────
0ms    50ms   200ms  500ms  1000ms 2000ms
│      │      │      │      │      │
├──────┤      │      │      │      │
│ Layout renders, skeleton visible │      │
│      ├──────┤      │      │      │
│      │ First data arrives (dashboard stats)      │
│      │      ├──────┤      │      │
│      │      │ More data (appointments, activities)
│      │      │      ├──────┤      │
│      │      │      │ Charts render│      │
│      │      │      │      ├──────┤
│      │      │      │      │ Full interactive
```

### 7.3 Error Boundary Pattern

```typescript
function ErrorDisplay({
  error,
  onRetry
}: {
  error: Error;
  onRetry: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error.message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

---

## 8. Implementation Phases

### 8.1 Phase 1: Core Performance Foundation ✅ COMPLETED

**Objective:** Establish performance-first architecture with skeleton loading and parallel data fetching.

| Task | Description | Status | Files |
|------|-------------|--------|-------|
| Skeleton Component Library | Create reusable skeleton components | ✅ Done | `skeletons/*.tsx` |
| Dashboard Stats Skeleton | 4-card grid loading state | ✅ Done | `dashboard-stats-skeleton.tsx` |
| Appointment Card Skeleton | List item loading state | ✅ Done | `appointment-card-skeleton.tsx` |
| Activity Feed Skeleton | Activity list loading | ✅ Done | `activity-skeleton.tsx` |
| Dashboard Server Actions | Parallel Promise.all queries | ✅ Done | `dashboard-actions.ts` |
| React Query Setup | Configure staleTime, gcTime | ✅ Done | `use-provider-dashboard.ts` |
| Dashboard Page | Component-level loading | ✅ Done | `dashboard/page.tsx` |

**Deliverables:**
- [x] 7 skeleton component files
- [x] Dashboard with 3 parallel queries
- [x] 30s stale time, 60s auto-refresh
- [x] Error boundaries with retry

---

### 8.2 Phase 2: Appointment Management ✅ COMPLETED

**Objective:** Implement optimistic updates and bulk operations for appointment management.

| Task | Description | Status | Files |
|------|-------------|--------|-------|
| Appointment List Query | Filtered by date range/status | ✅ Done | `get-provider-appointments-actions.ts` |
| Appointment Statistics | Count by status (parallel queries) | ✅ Done | `get-provider-appointments-actions.ts` |
| Status Update Mutation | Optimistic update with rollback | ✅ Done | `use-get-provider-appointment.ts` |
| Cancel Mutation | With reason, notification, transaction | ✅ Done | `use-get-provider-appointment.ts` |
| Bulk Operations | Multi-select confirm/cancel/complete | ✅ Done | `bulk-appointment-actions.ts` |
| Reschedule Mutation | Conflict detection, notifications | ✅ Done | `bulk-appointment-actions.ts` |
| Bulk Actions Bar | Sticky bar with dialog for cancel reason | ✅ Done | `bulk-actions-bar.tsx` |
| Appointment Card | Status-specific actions, checkbox selection | ✅ Done | `appointment-card.tsx` |
| Status Section | Grouped display with empty states | ✅ Done | `appointment-status-section.tsx` |
| Date Range Picker | Preset ranges + custom selection | ✅ Done | `date-range-picker.tsx` |

**Deliverables:**
- [x] Optimistic updates with rollback on error
- [x] Bulk confirm/cancel/complete operations with notifications
- [x] Status-grouped appointment sections (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- [x] Date range filtering (PENDING/CONFIRMED always shown, COMPLETED/CANCELLED date-filtered)
- [x] Reschedule with conflict detection
- [x] Transaction-based updates with notification creation

---

### 8.3 Phase 3: Calendar & Services ✅ COMPLETED

**Objective:** Implement calendar views and service management with proper loading states.

| Task | Description | Status | Files |
|------|-------------|--------|-------|
| Calendar Server Actions | Date range queries | ✅ Done | `get-calendar-actions.ts` |
| Calendar Hook | Query with date filters | ✅ Done | `use-provider-calendar.ts` |
| Day View | Hourly slots display | ✅ Done | `day-view.tsx` |
| Week View | 7-day grid | ✅ Done | `week-view.tsx` |
| Month View | 35-day calendar | ✅ Done | `month-view.tsx` |
| Calendar Skeletons | View-specific loading | ✅ Done | `calendar-skeleton.tsx` |
| Service CRUD Actions | Create, update, delete | ✅ Done | `provider-services-action.ts` |
| Service Hooks | Mutations with cache invalidation | ✅ Done | `use-provider-services-hook.ts` |
| Service Form | Create/edit dialog | ✅ Done | `services-form-provider.tsx` |
| Service Card Skeleton | Loading state | ✅ Done | `service-card-skeleton.tsx` |

**Deliverables:**
- [x] 3 calendar views with skeletons
- [x] Service CRUD with optimistic toggles
- [x] SINGLE and PACKAGE service types
- [x] Insurance acceptance configuration

---

### 8.4 Phase 4: Analytics & Reviews ✅ COMPLETED

**Objective:** Implement analytics charts and review management with proper loading states.

| Task | Description | Status | Files |
|------|-------------|--------|-------|
| Analytics Server Action | KPIs, chart data | ✅ Done | `get-provider-analytics-actions.ts` |
| Analytics Hook | Date range queries | ✅ Done | `use-get-provider-analytics-hook.ts` |
| Revenue Chart | Line/area chart | ✅ Done | `revenue-chart.tsx` |
| Appointment Trends | Trend visualization | ✅ Done | `appointment-trends-chart.tsx` |
| Peak Hours Chart | Heatmap display | ✅ Done | `peak-hours-chart.tsx` |
| Popular Services | Bar chart | ✅ Done | `popular-services-chart.tsx` |
| Status Distribution | Pie/donut chart | ✅ Done | `status-distribution-chart.tsx` |
| Chart Skeletons | Loading states | ✅ Done | `chart-skeleton.tsx` |
| Review List | Paginated reviews | ✅ Done | `provider-review-list.tsx` |
| Review Stats | Rating summary | ✅ Done | `provider-review-stats.tsx` |

**Deliverables:**
- [x] 7 chart components with skeletons
- [x] KPI cards with period comparison
- [x] Date range filtering
- [x] Review list with pagination

---

### 8.5 Phase 5: Settings & Onboarding ✅ COMPLETED

**Objective:** Implement settings management and provider onboarding flow.

| Task | Description | Status | Files |
|------|-------------|--------|-------|
| Basic Info Settings | Profile editing | ✅ Done | `basic-information-components.tsx` |
| Operating Hours | Day-by-day schedule | ✅ Done | `operating-hours-component.tsx` |
| Shop Media | Image upload | ✅ Done | `shop-media-component.tsx` |
| Settings Skeleton | Form loading states | ✅ Done | `settings-skeleton.tsx` |
| Onboarding Step 1 | Basic info form | ✅ Done | `step-1-form.tsx` |
| Onboarding Step 2 | Services setup | ✅ Done | `step-2-form.tsx` |
| Onboarding Step 3 | Operating hours | ✅ Done | `step-3-form.tsx` |
| Onboarding Step 4 | Documents upload | ✅ Done | `step-4-form.tsx` |
| Onboarding Summary | Review & submit | ✅ Done | `step-5-form.tsx` |
| Zustand Store | Form persistence | ✅ Done | `onboarding-store.ts` |

**Deliverables:**
- [x] Settings with form validation
- [x] 4-step onboarding flow
- [x] Form state persistence with Zustand
- [x] Document upload functionality

---

### 8.6 Phase 6: Performance Enhancements ✅ COMPLETED

**Objective:** Optimize navigation speed and add advanced performance features.

| Task | Description | Status | File |
|------|-------------|--------|------|
| Query Key Factory | Centralized key management | ✅ Done | `src/lib/query-keys.ts` |
| Prefetch on Hover | Pre-load data on sidebar hover | ✅ Done | `sidebar-general.tsx` |
| Stale Data Indicators | Show when data is refreshing | ✅ Done | `query-state-indicator.tsx` |
| Error Retry Logic | Exponential backoff (2 retries) | ✅ Done | All provider hooks |
| Background Sync | Sync on tab focus | ✅ Done | All provider hooks |

**Implementation Highlights:**

```typescript
// Centralized query keys - src/lib/query-keys.ts
export const providerQueryKeys = {
  all: ["provider"] as const,
  dashboard: {
    all: () => [...providerQueryKeys.all, "dashboard"] as const,
    stats: () => [...providerQueryKeys.dashboard.all(), "stats"] as const,
    // ...
  },
  appointments: {
    all: () => [...providerQueryKeys.all, "appointments"] as const,
    list: (filters) => [...providerQueryKeys.appointments.all(), "list", filters] as const,
    // ...
  },
  // ... more keys
};

export const queryConfigDefaults = {
  dashboard: {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
  // ... more configs
};
```

---

### 8.7 Phase 7: Future Enhancements 📋 PLANNED

**Objective:** Add advanced features for improved provider experience.

| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| **Export Functionality** | CSV/PDF appointment export | High | Medium |
| **Notification Preferences** | Email/push settings | High | Medium |
| **Booking Policies** | Advance notice, cancellation rules | Medium | Medium |
| **Vacation Mode** | Out-of-office with auto-response | Medium | Medium |
| **Service Analytics** | Per-service revenue/bookings | Medium | Low |
| **Real-time Updates** | WebSocket for live changes | Low | High |
| **Drag-Drop Calendar** | Reschedule by dragging | Low | High |
| **Virtual Scrolling** | For large appointment lists | Low | Medium |
| **Offline Support** | Service worker caching | Low | High |

**Database Changes Required:**

```prisma
// For notification preferences
model ProviderNotificationPrefs {
  id                     String   @id @default(cuid())
  providerId             String   @unique
  emailNewBooking        Boolean  @default(true)
  emailCancellation      Boolean  @default(true)
  pushAppointmentUpdates Boolean  @default(true)
  // ... more fields
}

// For booking policies
model ProviderBookingPolicy {
  id                 String   @id @default(cuid())
  providerId         String   @unique
  advanceNoticeHours Int      @default(24)
  cancellationHours  Int      @default(24)
  autoConfirm        Boolean  @default(false)
  maxBookingsPerDay  Int?
  bufferMinutes      Int      @default(0)
}

// For vacation mode
model ProviderVacation {
  id        String   @id @default(cuid())
  providerId String
  startDate DateTime
  endDate   DateTime
  message   String?
  isActive  Boolean  @default(true)
}
```

---

### Implementation Timeline Summary

```
Phase 1: Core Performance     ████████████████████ 100% ✅
Phase 2: Appointments         ████████████████████ 100% ✅
Phase 3: Calendar & Services  ████████████████████ 100% ✅
Phase 4: Analytics & Reviews  ████████████████████ 100% ✅
Phase 5: Settings & Onboard   ████████████████████ 100% ✅
Phase 6: Performance Enhance  ████████████████████ 100% ✅
Phase 7: Future Enhancements  ░░░░░░░░░░░░░░░░░░░░   0% 📋

Overall Progress: ~95%
```

### Quick Reference: What's Done vs What's Next

| Category | Completed | Next Up |
|----------|-----------|---------|
| **Pages** | Dashboard, Appointments, Services, Calendar, Analytics, Reviews, Settings, Onboarding | - |
| **Loading** | All skeleton components, stale data indicators | - |
| **Mutations** | Optimistic updates, bulk operations, background sync | - |
| **Navigation** | Basic routing, prefetch on hover | - |
| **Data** | React Query caching, centralized query keys, retry logic | - |
| **Features** | Core CRUD, filters | Export, notifications, vacation mode |

---

## 9. Success Metrics

### 9.1 Performance KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Skeleton visible | <50ms | Performance API |
| FCP | <400ms | Lighthouse |
| TTI | <800ms | Lighthouse |
| CLS | <0.1 | Lighthouse |
| Optimistic response | <30ms | Custom timing |

### 9.2 User Experience KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Loading state coverage | 100% | Code audit |
| Error state coverage | 100% | Code audit |
| Empty state coverage | 100% | Code audit |
| Mobile responsiveness | 100% | Manual testing |

### 9.3 Monitoring Checklist

- [ ] Page load times < 2s at p95
- [ ] Server action latency < 500ms at p95
- [ ] Error rate < 0.1%
- [ ] Cache hit rate > 80%

---

## Appendix

### A. Query Key Reference

```typescript
// Dashboard
["provider", "dashboard", "stats"]
["provider", "dashboard", "today-appointments"]
["provider", "dashboard", "activities", limit]

// Appointments
["provider-appointments", "list", filters]
["provider-appointments", "statistics", filters]

// Calendar
["provider-calendar", "appointments", { startDate, endDate }]
["provider-calendar", "day", date]

// Services
["providerServices"]

// Analytics
["provider", "analytics", { startDate, endDate }]
```

### B. Related Documents

- [CLAUDE.md](/CLAUDE.md) - Project technical guidelines
- [PROVIDER-IMPLEMENTATION-PLAN.md](./PROVIDER-IMPLEMENTATION-PLAN.md) - Implementation details
- [Prisma Schema](/prisma/schema.prisma) - Database models

---

**Document Version History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 27, 2025 | Initial PRD |
| 2.0 | Nov 27, 2025 | Performance-optimized rewrite, reflects current implementation |
