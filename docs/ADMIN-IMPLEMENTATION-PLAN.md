# Admin Panel Implementation Plan

**Project:** Himsog Healthcare Platform
**Document Version:** 2.0
**Last Updated:** November 27, 2025
**Status:** Completed

---

## Overview

This document provides a detailed implementation roadmap for the **System Administration Panel** of the Himsog healthcare platform. This admin panel is for **system administrators** who oversee platform operations - NOT for provider business operations.

### Scope Clarification

| Role | Responsibility | What They Manage |
|------|----------------|------------------|
| **ADMIN** | System oversight | Users, Providers, Categories, Platform Health |
| **PROVIDER** | Business operations | Appointments, Revenue, Services, Schedules |
| **USER** | Consumer | Bookings, Reviews |

**This implementation plan covers ADMIN features only.**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Performance & Loading States](#performance--loading-states)
3. [File Structure](#file-structure)
4. [Phase 1: Foundation](#phase-1-foundation)
5. [Phase 2: User & Provider Management](#phase-2-user--provider-management)
6. [Phase 3: Analytics](#phase-3-analytics)
7. [Phase 4: Settings & Polish](#phase-4-settings--polish)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### Tech Stack (Existing)

```
Frontend:        Next.js 16 (App Router)
State:           Zustand + React Query
UI:              shadcn/ui + Tailwind CSS 4
Forms:           React Hook Form + Zod
Database:        PostgreSQL + Prisma Accelerate
Auth:            Better Auth (Role-based)
```

### Required Dependencies

```bash
# Charts for analytics
bun add recharts

# Date utilities
bun add date-fns
```

---

## Performance & Loading States

### Overview

Every admin page MUST implement proper loading states using React Query's `isLoading` state combined with skeleton components.

### Loading State Pattern

```typescript
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useDataHook } from "@/hooks/use-data-hook";

export function DataComponent() {
  const { data, isLoading, isError, error, refetch } = useDataHook();

  // Loading state - show skeleton
  if (isLoading) {
    return <DataComponentSkeleton />;
  }

  // Error state - show error message
  if (isError) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  // Success state - show data
  return <DataDisplay data={data} />;
}
```

### Skeleton Components

Located in `src/components/admin-components/skeletons/`:

| Component | Purpose |
|-----------|---------|
| `stats-card-skeleton.tsx` | Dashboard stat cards |
| `table-skeleton.tsx` | Data tables |
| `chart-skeleton.tsx` | Chart containers |
| `activity-skeleton.tsx` | Activity feeds |
| `form-skeleton.tsx` | Form loading |

---

## File Structure

### Admin-Specific Files

```
src/
├── app/admin/
│   ├── dashboard/
│   │   └── page.tsx                    # System overview dashboard
│   ├── user-management/
│   │   └── page.tsx                    # User management page
│   ├── providers/
│   │   └── page.tsx                    # Provider verification
│   ├── category/
│   │   └── page.tsx                    # Category management
│   ├── analytics/
│   │   └── page.tsx                    # System analytics
│   └── settings/
│       └── page.tsx                    # Settings & audit logs
│
├── actions/admin/
│   ├── dashboard-actions.ts            # Dashboard stats
│   ├── user-actions.ts                 # User management
│   ├── update-provider-actions.ts      # Provider status
│   ├── analytics-actions.ts            # System analytics
│   ├── settings-actions.ts             # Platform settings
│   ├── audit-actions.ts                # Audit log operations
│   └── audit-constants.ts              # Audit action constants
│
├── components/admin-components/
│   ├── skeletons/                      # Loading skeletons
│   │   ├── stats-card-skeleton.tsx
│   │   ├── table-skeleton.tsx
│   │   ├── chart-skeleton.tsx
│   │   └── activity-skeleton.tsx
│   │
│   ├── dashboard/                      # Dashboard widgets
│   │   ├── stats-cards.tsx             # System metrics
│   │   ├── pending-actions.tsx         # Pending items
│   │   ├── recent-activity.tsx         # Activity feed
│   │   ├── growth-chart.tsx            # Registration trends
│   │   └── status-distribution.tsx     # Provider status pie
│   │
│   ├── user-management/                # User management
│   │   ├── user-table.tsx
│   │   ├── user-dialog.tsx
│   │   ├── user-filters.tsx
│   │   └── user-columns.tsx
│   │
│   ├── provider-component/             # Provider management
│   │   ├── provider-table.tsx
│   │   ├── provider-filters.tsx
│   │   └── status-change-dialog.tsx
│   │
│   ├── analytics/                      # Analytics components
│   │   ├── analytics-tabs.tsx
│   │   ├── overview-analytics.tsx
│   │   ├── user-analytics.tsx
│   │   └── provider-analytics.tsx
│   │
│   └── settings/                       # Settings components
│       ├── general-settings.tsx
│       ├── security-settings.tsx
│       └── audit-log-table.tsx
│
├── hooks/
│   ├── use-admin-dashboard.ts          # Dashboard queries
│   ├── use-admin-users.ts              # User management
│   ├── use-admin-get-provider.ts       # Provider management
│   ├── use-admin-analytics.ts          # Analytics queries
│   └── use-admin-settings.ts           # Settings queries
│
└── types/
    └── admin.ts                        # Admin-specific types
```

---

## Phase 1: Foundation (Completed)

### 1.1 Database Schema Updates

**File:** `prisma/schema.prisma`

```prisma
// Audit Log for tracking admin actions
model AuditLog {
  id          String   @id @default(cuid())
  adminId     String
  admin       User     @relation(fields: [adminId], references: [id])
  action      String   // e.g., "PROVIDER_STATUS_CHANGED"
  targetType  String   // e.g., "Provider", "User"
  targetId    String
  oldValue    Json?
  newValue    Json?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([targetType, targetId])
  @@index([createdAt])
  @@index([action])
}

// Provider Status History
model ProviderStatusHistory {
  id           String         @id @default(cuid())
  providerId   String
  provider     Provider       @relation(fields: [providerId], references: [id], onDelete: Cascade)
  fromStatus   ProviderStatus
  toStatus     ProviderStatus
  reason       String?
  changedById  String
  changedBy    User           @relation("StatusChanger", fields: [changedById], references: [id])
  createdAt    DateTime       @default(now())

  @@index([providerId])
  @@index([createdAt])
}

// User Status for suspension
enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

### 1.2 Dashboard Implementation

#### Server Actions

**File:** `src/actions/admin/dashboard-actions.ts`

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/actions/auth/auth-check-utils";
import { startOfDay, subDays } from "date-fns";

export interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  pendingProviders: number;
  verifiedProviders: number;
  totalCategories: number;
  totalServices: number;
  newThisWeek: {
    users: number;
    providers: number;
  };
}

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  await requireAdmin();

  try {
    const weekAgo = subDays(new Date(), 7);

    const [
      totalUsers,
      totalProviders,
      pendingProviders,
      verifiedProviders,
      totalCategories,
      totalServices,
      newUsersThisWeek,
      newProvidersThisWeek,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.provider.count(),
      prisma.provider.count({ where: { status: "PENDING" } }),
      prisma.provider.count({ where: { status: "VERIFIED" } }),
      prisma.category.count(),
      prisma.service.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          role: "USER"
        }
      }),
      prisma.provider.count({
        where: { createdAt: { gte: weekAgo } }
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalProviders,
        pendingProviders,
        verifiedProviders,
        totalCategories,
        totalServices,
        newThisWeek: {
          users: newUsersThisWeek,
          providers: newProvidersThisWeek,
        },
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}
```

#### Dashboard Page

**File:** `src/app/admin/dashboard/page.tsx`

```typescript
import { StatsCards } from "@/components/admin-components/dashboard/stats-cards";
import { PendingActions } from "@/components/admin-components/dashboard/pending-actions";
import { RecentActivity } from "@/components/admin-components/dashboard/recent-activity";
import { GrowthChart } from "@/components/admin-components/dashboard/growth-chart";
import { StatusDistribution } from "@/components/admin-components/dashboard/status-distribution";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
      </div>

      {/* System Metrics */}
      <StatsCards />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <GrowthChart />
        </div>
        <div className="col-span-3">
          <PendingActions />
        </div>
      </div>

      {/* Activity and Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        <StatusDistribution />
      </div>
    </div>
  );
}
```

### 1.3 Audit Logging System

**File:** `src/actions/admin/audit-actions.ts`

```typescript
"use server";

import { prisma, Prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth/auth-check-utils";
import { headers } from "next/headers";

interface CreateAuditLogParams {
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;

  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  await prisma.auditLog.create({
    data: {
      adminId: user.id,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      oldValue: params.oldValue as Prisma.InputJsonValue | undefined,
      newValue: params.newValue as Prisma.InputJsonValue | undefined,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      ipAddress,
      userAgent,
    },
  });
}
```

**File:** `src/actions/admin/audit-constants.ts`

```typescript
export const AUDIT_ACTIONS = {
  // Provider actions
  PROVIDER_STATUS_CHANGED: "PROVIDER_STATUS_CHANGED",
  PROVIDER_DOCUMENT_VERIFIED: "PROVIDER_DOCUMENT_VERIFIED",
  PROVIDER_DOCUMENT_REJECTED: "PROVIDER_DOCUMENT_REJECTED",

  // User actions
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_REACTIVATED: "USER_REACTIVATED",
  USER_DELETED: "USER_DELETED",

  // Category actions
  CATEGORY_CREATED: "CATEGORY_CREATED",
  CATEGORY_UPDATED: "CATEGORY_UPDATED",
  CATEGORY_DELETED: "CATEGORY_DELETED",

  // Settings actions
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
} as const;
```

---

## Phase 2: User & Provider Management (Completed)

### 2.1 User Management

#### Server Actions

**File:** `src/actions/admin/user-actions.ts`

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/actions/auth/auth-check-utils";
import { createAuditLog } from "./audit-actions";
import { AUDIT_ACTIONS } from "./audit-constants";
import { revalidatePath } from "next/cache";

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "USER" | "PROVIDER" | "ADMIN";
  status?: "ACTIVE" | "SUSPENDED";
}

export async function getAllUsers(params: UserQueryParams = {}) {
  await requireAdmin();

  const {
    page = 1,
    limit = 10,
    search,
    role,
    status,
  } = params;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(role && { role }),
    ...(status && { status }),
  };

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, newRole: "USER" | "PROVIDER" | "ADMIN") {
  const admin = await requireAdmin();

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    if (userId === admin.id) {
      return { success: false, error: "Cannot change your own role" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
      targetType: "User",
      targetId: userId,
      oldValue: { role: currentUser.role },
      newValue: { role: newRole },
    });

    revalidatePath("/admin/user-management");
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to update user role" };
  }
}

export async function suspendUser(userId: string, reason: string) {
  const admin = await requireAdmin();

  try {
    if (userId === admin.id) {
      return { success: false, error: "Cannot suspend your own account" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspendReason: reason,
        suspendedById: admin.id,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_SUSPENDED,
      targetType: "User",
      targetId: userId,
      newValue: { reason },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        type: "ACCOUNT_SUSPENDED",
        title: "Account Suspended",
        message: `Your account has been suspended. Reason: ${reason}`,
      },
    });

    revalidatePath("/admin/user-management");
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to suspend user" };
  }
}

export async function reactivateUser(userId: string) {
  await requireAdmin();

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        suspendedAt: null,
        suspendReason: null,
        suspendedById: null,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_REACTIVATED,
      targetType: "User",
      targetId: userId,
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "ACCOUNT_REACTIVATED",
        title: "Account Reactivated",
        message: "Your account has been reactivated. Welcome back!",
      },
    });

    revalidatePath("/admin/user-management");
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to reactivate user" };
  }
}
```

#### User Management Page

**File:** `src/app/admin/user-management/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { UserTable } from "@/components/admin-components/user-management/user-table";
import { UserFilters } from "@/components/admin-components/user-management/user-filters";

export default function UserManagementPage() {
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>

      <UserFilters
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onClear={() => setFilters({ search: "", role: "all", status: "all" })}
      />

      <UserTable filters={filters} />
    </div>
  );
}
```

### 2.2 Provider Management Enhancements

#### Provider Filters

**File:** `src/components/admin-components/provider-component/provider-filters.tsx`

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface ProviderFiltersProps {
  filters: {
    search: string;
    status: string;
    category: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  categories?: { id: string; name: string }[];
}

export function ProviderFilters({
  filters,
  onFilterChange,
  onClear,
  categories = [],
}: ProviderFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange("status", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="VERIFIED">Verified</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

#### Status Change Dialog

**File:** `src/components/admin-components/provider-component/status-change-dialog.tsx`

```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProviderStatus } from "@/hooks/use-admin-get-provider";
import { Loader2 } from "lucide-react";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: {
    id: string;
    businessName: string;
    status: string;
  };
}

const statusOptions = [
  { value: "PENDING", label: "Pending", requiresReason: false },
  { value: "VERIFIED", label: "Verified", requiresReason: false },
  { value: "SUSPENDED", label: "Suspended", requiresReason: true },
  { value: "REJECTED", label: "Rejected", requiresReason: true },
];

export function StatusChangeDialog({
  open,
  onOpenChange,
  provider,
}: StatusChangeDialogProps) {
  const [newStatus, setNewStatus] = useState(provider.status);
  const [reason, setReason] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  const { mutate: updateStatus, isPending } = useUpdateProviderStatus();

  const selectedOption = statusOptions.find((o) => o.value === newStatus);
  const requiresReason = selectedOption?.requiresReason ?? false;

  const handleSubmit = () => {
    updateStatus(
      {
        providerId: provider.id,
        status: newStatus,
        reason: requiresReason ? reason : undefined,
        sendNotification,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Provider Status</DialogTitle>
          <DialogDescription>
            Update status for {provider.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="text-sm text-muted-foreground">
              {provider.status}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for this status change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notification"
              checked={sendNotification}
              onCheckedChange={(checked) =>
                setSendNotification(checked as boolean)
              }
            />
            <Label htmlFor="notification" className="text-sm">
              Send notification to provider
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isPending ||
              newStatus === provider.status ||
              (requiresReason && !reason.trim())
            }
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Phase 3: Analytics (Completed)

### 3.1 Analytics Server Actions

**File:** `src/actions/admin/analytics-actions.ts`

System-level analytics only - NO appointment/revenue data.

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/actions/auth/auth-check-utils";
import { eachDayOfInterval, format, subDays } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

// Overview statistics
export async function getOverviewAnalytics() {
  await requireAdmin();

  try {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const [
      totalUsers,
      totalProviders,
      totalCategories,
      totalServices,
      newUsersThisMonth,
      newProvidersThisMonth,
      pendingProviders,
      verifiedProviders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.provider.count(),
      prisma.category.count(),
      prisma.service.count(),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo }, role: "USER" },
      }),
      prisma.provider.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.provider.count({ where: { status: "PENDING" } }),
      prisma.provider.count({ where: { status: "VERIFIED" } }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalProviders,
        totalCategories,
        totalServices,
        newUsersThisMonth,
        newProvidersThisMonth,
        pendingProviders,
        verifiedProviders,
        growthRate: {
          users: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : "0",
          providers: totalProviders > 0 ? ((newProvidersThisMonth / totalProviders) * 100).toFixed(1) : "0",
        },
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch overview analytics" };
  }
}

// User registration analytics
export async function getUserAnalytics(dateRange: DateRange) {
  await requireAdmin();

  try {
    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    // Role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Status distribution
    const statusDistribution = await prisma.user.groupBy({
      by: ["status"],
      _count: true,
    });

    // Registration trend - get all users in range
    const usersInRange = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
        role: "USER",
      },
      select: { createdAt: true },
    });

    // Group by date
    const registrationTrend = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const count = usersInRange.filter(
        (u) => format(new Date(u.createdAt), "yyyy-MM-dd") === dayStr
      ).length;
      return { date: dayStr, count };
    });

    return {
      success: true,
      data: {
        registrationTrend,
        roleDistribution,
        statusDistribution,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch user analytics" };
  }
}

// Provider registration analytics
export async function getProviderAnalytics(dateRange: DateRange) {
  await requireAdmin();

  try {
    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    // Status distribution
    const statusDistribution = await prisma.provider.groupBy({
      by: ["status"],
      _count: true,
    });

    // Category distribution
    const categoryDistribution = await prisma.provider.groupBy({
      by: ["categoryId"],
      _count: true,
    });

    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });

    const categoryData = categoryDistribution.map((item) => ({
      category: categories.find((c) => c.id === item.categoryId)?.name ?? "Unknown",
      count: item._count,
    }));

    // Registration trend
    const providersInRange = await prisma.provider.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
      select: { createdAt: true },
    });

    const registrationTrend = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const count = providersInRange.filter(
        (p) => format(new Date(p.createdAt), "yyyy-MM-dd") === dayStr
      ).length;
      return { date: dayStr, count };
    });

    // Verification metrics
    const verificationCount = await prisma.providerStatusHistory.count({
      where: {
        toStatus: "VERIFIED",
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    });

    return {
      success: true,
      data: {
        registrationTrend,
        statusDistribution,
        categoryDistribution: categoryData,
        verificationsInPeriod: verificationCount,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch provider analytics" };
  }
}
```

### 3.2 Analytics Page

**File:** `src/app/admin/analytics/page.tsx`

```typescript
"use client";

import { AnalyticsTabs } from "@/components/admin-components/analytics/analytics-tabs";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
      <AnalyticsTabs />
    </div>
  );
}
```

---

## Phase 4: Settings & Polish (Completed)

### 4.1 Settings Server Actions

**File:** `src/actions/admin/settings-actions.ts`

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/actions/auth/auth-check-utils";

export async function getSystemStats() {
  await requireAdmin();

  try {
    const [
      totalUsers,
      totalProviders,
      totalCategories,
      totalServices,
      totalAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.category.count(),
      prisma.service.count(),
      prisma.auditLog.count(),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalProviders,
        totalCategories,
        totalServices,
        totalAuditLogs,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch system stats" };
  }
}

export async function getAdminUsers() {
  await requireAdmin();

  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: admins };
  } catch (error) {
    return { success: false, error: "Failed to fetch admin users" };
  }
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
}) {
  await requireAdmin();

  const { page = 1, limit = 20, action, targetType } = params;

  try {
    const where = {
      ...(action && action !== "all" && { action }),
      ...(targetType && targetType !== "all" && { targetType }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: { name: true, email: true, image: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch audit logs" };
  }
}

export async function getAuditLogStats() {
  await requireAdmin();

  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [actionsLast24Hours, actionsLast7Days, totalActions] = await Promise.all([
      prisma.auditLog.count({ where: { createdAt: { gte: last24Hours } } }),
      prisma.auditLog.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.auditLog.count(),
    ]);

    return {
      success: true,
      data: {
        actionsLast24Hours,
        actionsLast7Days,
        totalActions,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch audit stats" };
  }
}
```

### 4.2 Settings Page

**File:** `src/app/admin/settings/page.tsx`

```typescript
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/admin-components/settings/general-settings";
import { SecuritySettings } from "@/components/admin-components/settings/security-settings";
import { AuditLogTable } from "@/components/admin-components/settings/audit-log-table";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4.3 Sidebar Navigation

**File:** `src/components/admin-components/admin-sidebar-general.tsx`

Update navigation items:

```typescript
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/user-management", label: "Users", icon: Users },
  { href: "/admin/providers", label: "Providers", icon: Building2 },
  { href: "/admin/category", label: "Categories", icon: FolderTree },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
```

---

## Testing Strategy

### Unit Tests

Test server actions in isolation:

```typescript
describe("getDashboardStats", () => {
  it("returns correct system metrics", async () => {
    const result = await getDashboardStats();
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("totalUsers");
    expect(result.data).toHaveProperty("totalProviders");
  });
});
```

### Integration Tests

- User management flow (view, role change, suspend)
- Provider verification workflow
- Audit log creation on all admin actions

### E2E Tests

- Admin login and dashboard access
- User suspension workflow
- Provider verification workflow
- Analytics date range filtering

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run database migrations
- [ ] Generate Prisma client
- [ ] Run all tests
- [ ] Check for TypeScript errors
- [ ] Review audit log implementation

### Deployment

- [ ] Deploy database changes first
- [ ] Deploy application
- [ ] Verify admin access
- [ ] Test critical flows

### Post-Deployment

- [ ] Monitor error logs
- [ ] Verify audit logs are recording
- [ ] Test notifications are sent
- [ ] Check analytics accuracy

---

## Notes

### What Admin Can See

| Data | Visibility |
|------|------------|
| User count | Yes |
| Provider count | Yes |
| Registration trends | Yes |
| Provider status | Yes |
| Categories | Yes |
| Services count | Yes |
| Audit logs | Yes |

### What Admin CANNOT See

| Data | Reason |
|------|--------|
| Appointment details | Provider-specific |
| Revenue/earnings | Provider-specific |
| Service pricing | Provider-specific |
| Booking history | Provider-specific |
| Messages | User privacy |

### React Query Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| `staleTime` | 60000 (1 min) | How long data is considered fresh |
| `gcTime` | 300000 (5 min) | How long inactive data stays in cache |
| `retry` | 2 | Number of retry attempts on failure |
| `refetchOnWindowFocus` | true | Refresh when user returns to tab |

### Security Notes

- All admin actions must be audited
- Sensitive operations require confirmation
- Validate all inputs with Zod schemas
- Role verification on every server action

---

**Document maintained by:** Development Team
**Last updated:** November 27, 2025
