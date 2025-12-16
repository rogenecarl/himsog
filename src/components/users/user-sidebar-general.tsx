"use client"

import Link from "next/link"
import { useMemo, useCallback } from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useUnreadMessageCount } from "@/hooks/use-unread-message-count"
import { useUpcomingAppointmentCount } from "@/hooks/use-upcoming-appointment-count"

export function UserNavGeneral({
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
  const { unreadCount } = useUnreadMessageCount()
  const { upcomingCount } = useUpcomingAppointmentCount()

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
      case "/appointments":
        return upcomingCount
      case "/chat":
        return unreadCount
      default:
        return 0
    }
  }, [upcomingCount, unreadCount])

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-gray-600 dark:text-slate-400">General</SidebarGroupLabel>
      <SidebarMenu>
        {itemsWithActiveState.map((item) => {
          const badgeCount = getBadgeCount(item.href)
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton tooltip={item.name} asChild>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 ${
                    item.isActive
                      ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 font-medium"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5"
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
