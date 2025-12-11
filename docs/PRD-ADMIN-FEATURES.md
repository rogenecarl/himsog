# Product Requirements Document (PRD)
# Himsog System Administration Panel

**Version:** 2.0
**Date:** November 27, 2025
**Author:** Development Team
**Status:** Final

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope Clarification](#2-scope-clarification)
3. [Current State Analysis](#3-current-state-analysis)
4. [Goals & Objectives](#4-goals--objectives)
5. [User Stories](#5-user-stories)
6. [Feature Specifications](#6-feature-specifications)
7. [Technical Requirements](#7-technical-requirements)
8. [Database Schema](#8-database-schema)
9. [UI/UX Requirements](#9-uiux-requirements)
10. [Security Requirements](#10-security-requirements)
11. [Implementation Phases](#11-implementation-phases)
12. [Success Metrics](#12-success-metrics)

---

## 1. Executive Summary

### 1.1 Purpose

This document outlines the product requirements for the **System Administration Panel** of the Himsog healthcare geolocation platform. The admin panel is designed for **system administrators** who oversee platform operations, manage users, verify providers, and monitor system health.

### 1.2 Scope

The admin panel focuses on **system-level administration**:
- Platform monitoring and health metrics
- User account management (all roles)
- Provider verification and management
- Category management
- System analytics (registrations, platform usage)
- Audit logging and security

### 1.3 What This Is NOT

This admin panel is **NOT** for:
- Managing individual provider appointments
- Viewing provider revenue or earnings
- Managing provider services or schedules
- Handling appointment bookings or cancellations
- Provider-specific analytics (those belong to the Provider Dashboard)

### 1.4 Target Users

- **System Administrators:** Users with `ADMIN` role who manage the platform

---

## 2. Scope Clarification

### 2.1 Multi-Tenancy Architecture

Himsog operates as a multi-tenant platform with three distinct user roles:

| Role | Responsibility | Dashboard |
|------|----------------|-----------|
| **USER** | Book appointments, leave reviews | User Dashboard |
| **PROVIDER** | Manage services, appointments, revenue | Provider Dashboard |
| **ADMIN** | System oversight, user/provider management | Admin Panel |

### 2.2 Admin Responsibilities

The Admin role is responsible for:

1. **System Monitoring**
   - How many users have registered
   - How many providers are on the platform
   - Platform growth trends
   - System health indicators

2. **User Management**
   - View all user accounts
   - Change user roles (USER ↔ PROVIDER ↔ ADMIN)
   - Suspend/reactivate accounts
   - Handle policy violations

3. **Provider Verification**
   - Review pending provider applications
   - Verify or reject providers
   - Manage provider status (PENDING, VERIFIED, SUSPENDED, REJECTED)
   - Document verification

4. **Category Management**
   - Create/edit/delete service categories
   - Manage category visibility

5. **System Settings**
   - Platform configuration
   - Audit log viewing
   - Security settings

### 2.3 Out of Scope for Admin

| Feature | Belongs To |
|---------|------------|
| Appointment management | Provider Dashboard |
| Revenue/earnings reports | Provider Dashboard |
| Service pricing | Provider Dashboard |
| Schedule management | Provider Dashboard |
| Booking analytics | Provider Dashboard |
| Customer messaging | Provider Dashboard |

---

## 3. Current State Analysis

### 3.1 Existing Admin Features

| Feature | Status | Location |
|---------|--------|----------|
| Admin Dashboard | Implemented | `/admin/dashboard` |
| Provider Management | Implemented | `/admin/providers` |
| Category Management | Implemented | `/admin/category` |
| User Management | Implemented | `/admin/user-management` |
| Analytics | Implemented | `/admin/analytics` |
| Settings | Implemented | `/admin/settings` |

### 3.2 Current Tech Stack

- **Framework:** Next.js 16 (App Router + Server Actions)
- **Database:** PostgreSQL with Prisma Accelerate
- **Auth:** Better Auth with role-based access
- **State:** Zustand + React Query
- **UI:** shadcn/ui + Tailwind CSS 4

---

## 4. Goals & Objectives

### 4.1 Primary Goals

1. **Platform Oversight:** Provide visibility into platform health and growth
2. **User Management:** Enable efficient management of all user accounts
3. **Provider Verification:** Streamline the provider verification process
4. **System Security:** Maintain audit trails and security controls

### 4.2 Success Criteria

- 100% visibility into user registrations and provider applications
- Complete audit trail for all admin actions
- Provider verification workflow completion
- Real-time platform health monitoring

---

## 5. User Stories

### 5.1 Dashboard

| ID | User Story | Priority |
|----|------------|----------|
| US-D01 | As an admin, I want to see total registered users so I can track platform adoption | High |
| US-D02 | As an admin, I want to see total providers so I can monitor supply growth | High |
| US-D03 | As an admin, I want to see pending provider count so I can prioritize verifications | High |
| US-D04 | As an admin, I want to see registration trends so I can track platform growth | Medium |
| US-D05 | As an admin, I want to see recent admin activities so I can monitor team actions | Medium |

### 5.2 User Management

| ID | User Story | Priority |
|----|------------|----------|
| US-U01 | As an admin, I want to view all users so I can manage the user base | High |
| US-U02 | As an admin, I want to search/filter users so I can find specific accounts | High |
| US-U03 | As an admin, I want to change user roles so I can grant appropriate permissions | High |
| US-U04 | As an admin, I want to suspend/reactivate users so I can handle policy violations | High |
| US-U05 | As an admin, I want to view user details so I can assist with support requests | Medium |

### 5.3 Provider Management

| ID | User Story | Priority |
|----|------------|----------|
| US-P01 | As an admin, I want to view all providers so I can monitor the provider base | High |
| US-P02 | As an admin, I want to verify pending providers so they can start accepting appointments | High |
| US-P03 | As an admin, I want to reject providers with reasons so they understand issues | High |
| US-P04 | As an admin, I want to suspend providers for policy violations | High |
| US-P05 | As an admin, I want providers notified of status changes | High |
| US-P06 | As an admin, I want to filter providers by status/category | Medium |

### 5.4 Analytics (System-Level)

| ID | User Story | Priority |
|----|------------|----------|
| US-A01 | As an admin, I want to see user registration trends so I can track growth | High |
| US-A02 | As an admin, I want to see provider registration trends so I can track supply | High |
| US-A03 | As an admin, I want to see provider status distribution so I can monitor verification | Medium |
| US-A04 | As an admin, I want to see category distribution so I can identify gaps | Medium |

### 5.5 Settings & Audit

| ID | User Story | Priority |
|----|------------|----------|
| US-S01 | As an admin, I want to view audit logs so I can track all admin actions | High |
| US-S02 | As an admin, I want to see system statistics so I can monitor platform health | Medium |
| US-S03 | As an admin, I want to see other admin users so I know who has access | Medium |

---

## 6. Feature Specifications

### 6.1 Dashboard (`/admin/dashboard`)

#### 6.1.1 System Metrics Cards

| Metric | Description | Data Source |
|--------|-------------|-------------|
| Total Users | Count of users with USER role | `User` where role = USER |
| Total Providers | Count of all providers | `Provider` table |
| Pending Providers | Providers awaiting verification | `Provider` where status = PENDING |
| Verified Providers | Active verified providers | `Provider` where status = VERIFIED |
| Total Categories | Number of service categories | `Category` table |
| Total Services | All listed services | `Service` table |
| New Users This Week | Users registered in last 7 days | `User` createdAt >= 7 days ago |
| New Providers This Week | Providers registered in last 7 days | `Provider` createdAt >= 7 days ago |

#### 6.1.2 Pending Actions Widget

Shows items requiring admin attention:
- Providers awaiting verification
- Documents needing review

#### 6.1.3 Recent Activity Feed

Display last 10 admin activities:
- Provider status changes
- User role changes
- User suspensions/reactivations
- Category changes

#### 6.1.4 Charts

1. **User Growth Chart:** Line chart of user registrations over 30 days
2. **Provider Status Distribution:** Pie chart of provider statuses (PENDING, VERIFIED, SUSPENDED, REJECTED)
3. **Category Distribution:** Bar chart of providers per category

---

### 6.2 User Management (`/admin/user-management`)

#### 6.2.1 User Table

| Column | Type | Sortable | Filterable |
|--------|------|----------|------------|
| Avatar | Image | No | No |
| Name | String | Yes | Yes (search) |
| Email | String | Yes | Yes (search) |
| Role | Enum | Yes | Yes (dropdown) |
| Status | Enum | Yes | Yes (dropdown) |
| Created At | Date | Yes | No |
| Actions | Buttons | No | No |

#### 6.2.2 User Actions

| Action | Description | Confirmation Required |
|--------|-------------|----------------------|
| View | Open user details dialog | No |
| Change Role | Modify user role | Yes |
| Suspend | Suspend user account | Yes + Reason |
| Reactivate | Reactivate suspended account | Yes |

#### 6.2.3 User Details Dialog

Shows:
- User profile information (name, email, avatar)
- Role and status
- Registration date
- Account statistics (appointments count, reviews count)

---

### 6.3 Provider Management (`/admin/providers`)

#### 6.3.1 Provider Table

| Column | Type | Sortable | Filterable |
|--------|------|----------|------------|
| Healthcare Name | String | Yes | Yes (search) |
| Email | String | Yes | Yes (search) |
| Category | String | Yes | Yes (dropdown) |
| Status | Enum | Yes | Yes (dropdown) |
| Created At | Date | Yes | No |
| Actions | Buttons | No | No |

#### 6.3.2 Provider Status Management

Available statuses:
- **PENDING:** Awaiting verification
- **VERIFIED:** Approved to operate
- **SUSPENDED:** Temporarily disabled
- **REJECTED:** Application denied

#### 6.3.3 Status Change with Reason

When rejecting or suspending:
- Reason field (required for REJECTED/SUSPENDED)
- Option to send notification to provider

#### 6.3.4 Provider Notifications

| Status Change | Notification |
|---------------|--------------|
| PENDING → VERIFIED | "Your provider account has been verified." |
| PENDING → REJECTED | "Your application was rejected. Reason: {reason}" |
| VERIFIED → SUSPENDED | "Your account has been suspended. Reason: {reason}" |
| SUSPENDED → VERIFIED | "Your account has been reactivated." |

---

### 6.4 Category Management (`/admin/category`)

#### 6.4.1 Category Table

| Column | Actions |
|--------|---------|
| Name | Edit, Delete |
| Description | Edit |
| Icon | Edit |
| Color | Edit |
| Provider Count | View only |
| Status (Active/Inactive) | Toggle |

#### 6.4.2 Category Actions

- Create new category
- Edit category details
- Toggle active/inactive
- Delete category (if no providers)

---

### 6.5 Analytics (`/admin/analytics`)

**System-level analytics only - NO appointment/revenue data**

#### 6.5.1 Overview Tab

- Total users, providers, categories, services
- Weekly/monthly growth rates
- Platform health indicators

#### 6.5.2 Users Tab

- User registration trend (line chart)
- Users by role distribution (pie chart)
- Active vs suspended users
- Monthly user growth

#### 6.5.3 Providers Tab

- Provider registration trend (line chart)
- Provider status distribution (pie chart)
- Providers by category (bar chart)
- Verification rate metrics

#### 6.5.4 Date Range Selector

- Last 7 days
- Last 14 days
- Last 30 days
- Last 90 days
- This month
- Last month

---

### 6.6 Settings (`/admin/settings`)

#### 6.6.1 General Tab

- System overview statistics
- Platform configuration (placeholder for future)
- Feature toggles (placeholder for future)

#### 6.6.2 Security Tab

- List of admin users
- Audit activity summary
- Security information

#### 6.6.3 Audit Logs Tab

| Column | Description |
|--------|-------------|
| Admin | Who performed the action |
| Action | What was done |
| Target | What was affected |
| IP Address | Request origin |
| Timestamp | When it occurred |

Filters:
- By action type
- By target type
- By admin user
- By date range

---

## 7. Technical Requirements

### 7.1 Server Actions Structure

```
src/actions/admin/
├── dashboard-actions.ts    # Dashboard stats and metrics
├── user-actions.ts         # User management operations
├── update-provider-actions.ts # Provider status management
├── create-category-actions.ts # Category management
├── analytics-actions.ts    # System analytics queries
├── settings-actions.ts     # Settings and system stats
├── audit-actions.ts        # Audit log operations
└── audit-constants.ts      # Audit action constants
```

### 7.2 React Query Hooks

```
src/hooks/
├── use-admin-dashboard.ts  # Dashboard data hooks
├── use-admin-users.ts      # User management hooks
├── use-admin-get-provider.ts # Provider management hooks
├── use-admin-analytics.ts  # Analytics hooks
└── use-admin-settings.ts   # Settings and audit hooks
```

### 7.3 Component Structure

```
src/components/admin-components/
├── dashboard/              # Dashboard widgets
├── user-management/        # User management components
├── provider-component/     # Provider management components
├── analytics/              # Analytics charts and tabs
├── settings/               # Settings components
└── skeletons/              # Loading state skeletons
```

---

## 8. Database Schema

### 8.1 Audit Log Model

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  adminId    String
  action     String   // e.g., "PROVIDER_STATUS_CHANGED"
  targetType String   // e.g., "Provider", "User"
  targetId   String
  oldValue   Json?
  newValue   Json?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  admin User @relation(fields: [adminId], references: [id])
}
```

### 8.2 Provider Status History

```prisma
model ProviderStatusHistory {
  id          String         @id @default(uuid())
  providerId  String
  fromStatus  ProviderStatus
  toStatus    ProviderStatus
  reason      String?
  changedById String
  createdAt   DateTime       @default(now())

  provider  Provider @relation(fields: [providerId], references: [id])
  changedBy User     @relation(fields: [changedById], references: [id])
}
```

### 8.3 User Status Fields

```prisma
model User {
  // ... existing fields
  status        UserStatus @default(ACTIVE)
  suspendedAt   DateTime?
  suspendReason String?
  suspendedById String?
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

---

## 9. UI/UX Requirements

### 9.1 Loading States

Every data-fetching component must implement:
1. Loading state with skeleton
2. Error state with retry option
3. Empty state with helpful message
4. Success state with data

### 9.2 Responsive Design

- Desktop: Full sidebar, multi-column layouts
- Tablet: Collapsible sidebar, 2-column layouts
- Mobile: Bottom navigation, single column

### 9.3 Notifications

- Toast notifications for action feedback
- Confirmation dialogs for destructive actions
- Reason input for suspensions/rejections

---

## 10. Security Requirements

### 10.1 Access Control

- All admin routes protected by `requireAdmin()` check
- Role verification on every server action
- Session validation on every request

### 10.2 Audit Trail

All admin actions logged with:
- Timestamp
- Admin user ID
- Action type
- Target entity
- Before/after values
- IP address
- User agent

### 10.3 Confirmation Requirements

| Action | Requires |
|--------|----------|
| Change user role | Confirmation dialog |
| Suspend user | Confirmation + reason |
| Reject provider | Confirmation + reason |
| Suspend provider | Confirmation + reason |
| Delete category | Confirmation dialog |

---

## 11. Implementation Phases

### Phase 1: Foundation (Completed)

- Dashboard with system metrics
- Audit logging infrastructure
- Provider status notifications

### Phase 2: User & Provider Management (Completed)

- User management (view, role change, suspend)
- Provider filters and search
- Status change with reasons

### Phase 3: Analytics (Completed)

- User registration analytics
- Provider registration analytics
- Status distribution charts
- Date range filtering

### Phase 4: Settings & Polish (Completed)

- Settings page with tabs
- Audit log viewer
- System statistics
- Admin user list

---

## 12. Success Metrics

### 12.1 Functional Metrics

| Metric | Target |
|--------|--------|
| Dashboard load time | < 2 seconds |
| All admin actions audited | 100% |
| Provider verification workflow | Complete |
| User management capabilities | Complete |

### 12.2 Coverage Metrics

- View all registered users
- View all registered providers
- Track platform growth
- Monitor admin activities

---

**Document maintained by:** Development Team
**Last updated:** November 27, 2025
