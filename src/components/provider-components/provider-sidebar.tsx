"use client"

import {
  BarChart3,
  Calendar,
  Clock,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  Star,
} from "lucide-react"

import { ProviderNavGeneral } from "./sidebar-general"
import { ProviderNavPublic } from "./sidebar-public"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import SidebarHeaderComponent from "./sidebar-header"

// Move static data outside component to prevent recreation on every render
const data = {

  generalItems: [
    { name: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/provider/appointments", icon: Clock },
    { name: "Calendar", href: "/provider/calendar", icon: Calendar },
    { name: "Services", href: "/provider/services", icon: Layers },
    { name: "Reviews", href: "/provider/reviews", icon: Star },
    { name: "Messages", href: "/chat", icon: MessageSquare },
    { name: "Analytics", href: "/provider/analytics", icon: BarChart3 },
    { name: "Settings", href: "/provider/settings", icon: Settings },
  ],
  publicItems: [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse Services", href: "/browse-services", icon: Search },
    { name: "How It Works", href: "/how-it-works", icon: HelpCircle },
    { name: "Map", href: "/map", icon: MapPin },
    // { name: "For Providers", href: "/for-providers", icon: Users },
  ],
}

export function ProviderAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-white/10">
      <SidebarHeader>
        <SidebarHeaderComponent />
      </SidebarHeader>

      <SidebarContent>
        <ProviderNavGeneral items={data.generalItems} />
        <ProviderNavPublic items={data.publicItems} />
      </SidebarContent>

      <SidebarFooter>

      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
