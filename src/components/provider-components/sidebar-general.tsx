"use client"

import Link from "next/link"
import { useMemo, useCallback } from "react"
import { type LucideIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useDashboardStats } from "@/hooks/use-provider-dashboard"
import { useUnreadMessageCount } from "@/hooks/use-unread-message-count"

// Import server actions for prefetching
import { getProviderAppointments, getAppointmentStatistics } from "@/actions/provider/get-provider-appointments-actions"
import { getCalendarAppointments } from "@/actions/provider/get-calendar-actions"
import { getProviderServices } from "@/actions/provider/provider-services-action"
import { getProviderAnalytics } from "@/actions/provider/get-provider-analytics-actions"
import { getDashboardStats, getTodayAppointments } from "@/actions/provider/dashboard-actions"

// Import query keys
import { providerQueryKeys, queryConfigDefaults } from "@/lib/query-keys"

export function ProviderNavGeneral({
  items,
}: {
  items: {
    name: string
    href: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { data: stats } = useDashboardStats()
  const { unreadCount } = useUnreadMessageCount()

  const itemsWithActiveState = useMemo(
    () => items.map((item) => ({
      ...item,
      isActive: pathname === item.href,
    })),
    [pathname, items]
  )

  // Get badge count for items
  const getBadgeCount = useCallback((href: string): number => {
    switch (href) {
      case "/provider/appointments":
        return stats?.pendingAppointments || 0
      case "/chat":
        return unreadCount
      default:
        return 0
    }
  }, [stats?.pendingAppointments, unreadCount])

  // Prefetch data on hover for faster navigation
  const handleMouseEnter = useCallback((href: string) => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    switch (href) {
      case "/provider/dashboard":
        // Prefetch dashboard stats
        queryClient.prefetchQuery({
          queryKey: providerQueryKeys.dashboard.stats(),
          queryFn: async () => {
            const result = await getDashboardStats()
            if (!result.success) throw new Error(result.error)
            return result.data
          },
          staleTime: queryConfigDefaults.dashboard.staleTime,
        })
        // Prefetch today's appointments
        queryClient.prefetchQuery({
          queryKey: providerQueryKeys.dashboard.todayAppointments(),
          queryFn: async () => {
            const result = await getTodayAppointments()
            if (!result.success) throw new Error(result.error)
            return result.data
          },
          staleTime: queryConfigDefaults.dashboard.staleTime,
        })
        break

      case "/provider/appointments":
        // Prefetch appointments list
        queryClient.prefetchQuery({
          queryKey: providerQueryKeys.appointments.list({ startDate: startOfDay, endDate: endOfDay }),
          queryFn: async () => {
            const result = await getProviderAppointments({ startDate: startOfDay, endDate: endOfDay })
            if (!result.success) throw new Error(result.error)
            return result.data
          },
          staleTime: queryConfigDefaults.appointments.staleTime,
        })
        // Prefetch statistics
        queryClient.prefetchQuery({
          queryKey: providerQueryKeys.appointments.stats({ startDate: startOfDay, endDate: endOfDay }),
          queryFn: async () => {
            const result = await getAppointmentStatistics({ startDate: startOfDay, endDate: endOfDay })
            if (!result.success) throw new Error(result.error)
            return result.data
          },
          staleTime: queryConfigDefaults.appointments.staleTime,
        })
        break

      case "/provider/calendar":
        // Prefetch calendar appointments for current week
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        queryClient.prefetchQuery({
          queryKey: providerQueryKeys.calendar.appointments({ startDate: weekStart, endDate: weekEnd }),
          queryFn: async () => {
            const result = await getCalendarAppointments({ startDate: weekStart, endDate: weekEnd })
            if (!result.success) throw new Error(result.error)
            return result.data
          },
          staleTime: queryConfigDefaults.calendar.staleTime,
        })
        break

      case "/provider/services":
        // Prefetch services list
        queryClient.prefetchQuery({
          queryKey: providerQueryKeys.services.all(),
          queryFn: async () => {
            const result = await getProviderServices()
            if (!result.success) throw new Error(result.error)
            return result.data
          },
          staleTime: queryConfigDefaults.services.staleTime,
        })
        break

      case "/provider/analytics":
        // Prefetch analytics data for last 30 days
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(now.getDate() - 30)

        queryClient.prefetchQuery({
          queryKey: providerQueryKeys.analytics.data({ startDate: thirtyDaysAgo, endDate: now }),
          queryFn: async () => {
            const result = await getProviderAnalytics({ startDate: thirtyDaysAgo, endDate: now })
            if (!result.success) throw new Error(result.error)
            return result.data
          },
          staleTime: queryConfigDefaults.analytics.staleTime,
        })
        break
    }
  }, [queryClient])

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-slate-600 dark:text-slate-400">General</SidebarGroupLabel>
      <SidebarMenu>
        {itemsWithActiveState.map((item) => {
          const badgeCount = getBadgeCount(item.href)
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton tooltip={item.name} asChild>
                <Link
                  href={item.href}
                  onMouseEnter={() => handleMouseEnter(item.href)}
                  className={`flex items-center gap-2 ${
                    item.isActive
                      ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {item.icon && <item.icon />}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              {badgeCount > 0 && (
                <SidebarMenuBadge className="bg-cyan-500 text-white text-[10px] font-semibold">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
