/**
 * Centralized Query Key Factory
 *
 * This file provides a single source of truth for all React Query keys.
 * Using a factory pattern allows for:
 * - Type-safe query keys
 * - Granular cache invalidation
 * - Consistent key structure across the app
 * - Easy prefetching with known keys
 */

// ============================================
// PROVIDER QUERY KEYS
// ============================================

export const providerQueryKeys = {
  all: ["provider"] as const,

  // Dashboard
  dashboard: {
    all: () => [...providerQueryKeys.all, "dashboard"] as const,
    stats: () => [...providerQueryKeys.dashboard.all(), "stats"] as const,
    todayAppointments: () => [...providerQueryKeys.dashboard.all(), "today-appointments"] as const,
    activities: (limit: number) => [...providerQueryKeys.dashboard.all(), "activities", limit] as const,
  },

  // Appointments
  appointments: {
    all: () => ["provider-appointments"] as const,
    lists: () => [...providerQueryKeys.appointments.all(), "list"] as const,
    list: (filters: Record<string, unknown>) => [...providerQueryKeys.appointments.lists(), filters] as const,
    statistics: () => [...providerQueryKeys.appointments.all(), "statistics"] as const,
    stats: (filters: Record<string, unknown>) => [...providerQueryKeys.appointments.statistics(), filters] as const,
  },

  // Calendar
  calendar: {
    all: () => ["provider-calendar"] as const,
    appointments: (filters: Record<string, unknown>) => [...providerQueryKeys.calendar.all(), "appointments", filters] as const,
    day: (date: string) => [...providerQueryKeys.calendar.all(), "day", date] as const,
  },

  // Services
  services: {
    all: () => ["providerServices"] as const,
    list: () => [...providerQueryKeys.services.all(), "list"] as const,
    detail: (id: string) => [...providerQueryKeys.services.all(), "detail", id] as const,
  },

  // Analytics
  analytics: {
    all: () => ["provider-analytics"] as const,
    data: (filters: Record<string, unknown>) => [...providerQueryKeys.analytics.all(), "data", filters] as const,
  },

  // Reviews
  reviews: {
    all: () => ["provider-reviews"] as const,
    list: (filters: Record<string, unknown>) => [...providerQueryKeys.reviews.all(), "list", filters] as const,
    stats: () => [...providerQueryKeys.reviews.all(), "stats"] as const,
  },

  // Profile
  profile: {
    all: () => ["providerProfile"] as const,
    current: () => [...providerQueryKeys.profile.all(), "current"] as const,
    hasProfile: () => [...providerQueryKeys.profile.all(), "hasProfile"] as const,
  },
} as const;

// ============================================
// USER QUERY KEYS
// ============================================

export const userQueryKeys = {
  all: ["user"] as const,

  // Appointments
  appointments: {
    all: () => ["user-appointments"] as const,
    list: (filters: Record<string, unknown>) => [...userQueryKeys.appointments.all(), "list", filters] as const,
    detail: (id: string) => [...userQueryKeys.appointments.all(), "detail", id] as const,
  },

  // Reviews
  reviews: {
    all: () => ["user-reviews"] as const,
    list: () => [...userQueryKeys.reviews.all(), "list"] as const,
  },

  // Notifications
  notifications: {
    all: () => ["notifications"] as const,
    list: () => [...userQueryKeys.notifications.all(), "list"] as const,
    unreadCount: () => [...userQueryKeys.notifications.all(), "unread-count"] as const,
  },
} as const;

// ============================================
// ADMIN QUERY KEYS
// ============================================

export const adminQueryKeys = {
  all: ["admin"] as const,

  // Dashboard
  dashboard: {
    all: () => [...adminQueryKeys.all, "dashboard"] as const,
    stats: () => [...adminQueryKeys.dashboard.all(), "stats"] as const,
  },

  // Providers
  providers: {
    all: () => [...adminQueryKeys.all, "providers"] as const,
    list: (filters: Record<string, unknown>) => [...adminQueryKeys.providers.all(), "list", filters] as const,
    detail: (id: string) => [...adminQueryKeys.providers.all(), "detail", id] as const,
  },

  // Users
  users: {
    all: () => [...adminQueryKeys.all, "users"] as const,
    list: (filters: Record<string, unknown>) => [...adminQueryKeys.users.all(), "list", filters] as const,
  },

  // Analytics
  analytics: {
    all: () => [...adminQueryKeys.all, "analytics"] as const,
    data: (filters: Record<string, unknown>) => [...adminQueryKeys.analytics.all(), "data", filters] as const,
  },

  // Settings
  settings: {
    all: () => [...adminQueryKeys.all, "settings"] as const,
  },
} as const;

// ============================================
// SHARED QUERY KEYS
// ============================================

export const sharedQueryKeys = {
  // Categories
  categories: {
    all: () => ["categories"] as const,
    list: () => [...sharedQueryKeys.categories.all(), "list"] as const,
  },

  // Insurance
  insurance: {
    all: () => ["insurance"] as const,
    providers: () => [...sharedQueryKeys.insurance.all(), "providers"] as const,
  },

  // Date/Time Slots
  dateTimeSlots: {
    all: () => ["dateTimeSlots"] as const,
    available: (providerId: string, date: string) =>
      [...sharedQueryKeys.dateTimeSlots.all(), "available", providerId, date] as const,
  },
} as const;

// ============================================
// QUERY CONFIG DEFAULTS
// ============================================

export const queryConfigDefaults = {
  // Dashboard - frequently changing data (optimized: reduced refetch frequency)
  dashboard: {
    staleTime: 2 * 60 * 1000, // 2 minutes before stale
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 5 * 60 * 1000, // 5 minutes (was 1 minute - 80% reduction in API calls)
    refetchOnWindowFocus: false, // Only refetch manually or on interval
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // Appointments - important, should be fresh (optimized: less aggressive)
  appointments: {
    staleTime: 60 * 1000, // 1 minute before stale
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 3 * 60 * 1000, // 3 minutes (was none - prevents stale data)
    refetchOnWindowFocus: false, // Prevent refetch on every tab switch
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // Calendar - moderate refresh needs (optimized)
  calendar: {
    staleTime: 2 * 60 * 1000, // 2 minutes before stale
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchInterval: false, // No auto-refetch - user triggers refresh
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // Services - less frequently changing (good as is)
  services: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // Analytics - can be slightly stale (optimized)
  analytics: {
    staleTime: 5 * 60 * 1000, // 5 minutes before stale
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchInterval: 10 * 60 * 1000, // 10 minutes auto-refresh
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // Static data - rarely changes (categories, insurance providers)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes before stale
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
} as const;
