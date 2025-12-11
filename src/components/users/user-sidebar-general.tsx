"use client"

import Link from "next/link"
import { useMemo } from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname();
  
  const itemsWithActiveState = useMemo(
    () => items.map((item) => ({
      ...item,
      isActive: pathname === item.href,
    })),
    [pathname, items]
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-gray-600 dark:text-slate-400">General</SidebarGroupLabel>
      <SidebarMenu>
        {itemsWithActiveState.map((item) => (
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
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
