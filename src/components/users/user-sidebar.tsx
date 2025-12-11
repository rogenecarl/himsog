"use client"

import {
  Clock,
  HelpCircle,
  Home,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Search,
} from "lucide-react"

import { UserNavGeneral } from "./user-sidebar-general"
import { UserNavPublic } from "./user-sidebar-public"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import UserSidebarHeader from "./user-sidebar-header"

// Move static data outside component to prevent recreation on every render
const data = {

  generalItems: [
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Appointments", href: "/appointments", icon: Clock },
    // { name: "My Reviews", href: "/reviews", icon: Star },
    { name: "Messages", href: "/chat", icon: MessageSquare },
  ],
  publicItems: [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse Services", href: "/browse-services", icon: Search },
    { name: "How It Works", href: "/how-it-works", icon: HelpCircle },
    { name: "Map", href: "/map", icon: MapPin },
    // { name: "For Providers", href: "/for-providers", icon: Users },
  ],
}

export function UserAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-white/10">
      <SidebarHeader>
        <UserSidebarHeader />
      </SidebarHeader>

      <SidebarContent>
        <UserNavGeneral items={data.generalItems} />
        <UserNavPublic items={data.publicItems} />
      </SidebarContent>

      <SidebarFooter>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
