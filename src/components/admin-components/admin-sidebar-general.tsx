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

export function AdminNavGeneral({
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
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        {itemsWithActiveState.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton tooltip={item.name} asChild>
              <Link 
                href={item.href} 
                className={`flex items-center gap-2 ${
                  item.isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground"
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
