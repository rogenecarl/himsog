"use client"

import {
    BarChart3,
    HelpCircle,
    History,
    Home,
    Layers,
    LayoutDashboard,
    MapPin,
    MessageSquareHeart,
    Search,
    Settings,
    User,
    UserCheck2,
} from "lucide-react"

import { AdminNavPublic } from "./admin-sidebar-public"
import { AdminNavGeneral } from "./admin-sidebar-general"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import AdminSidebarHeader from "./admin-sidebar-header"

// Move static data outside component to prevent recreation on every render
const data = {
    generalItems: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "User Management", href: "/admin/user-management", icon: User },
        { name: "Category", href: "/admin/category", icon: Layers },
        { name: "Providers", href: "/admin/providers", icon: UserCheck2 },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Feedback", href: "/admin/feedback", icon: MessageSquareHeart },
        { name: "Audit Log", href: "/admin/audit-log", icon: History },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    publicItems: [
        { name: "Home", href: "/", icon: Home },
        { name: "Browse Services", href: "/browse-services", icon: Search },
        { name: "How It Works", href: "/how-it-works", icon: HelpCircle },
        { name: "Map", href: "/map", icon: MapPin },
        // { name: "For Providers", href: "/for-providers", icon: Users },
    ],
}

export function AdminAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <AdminSidebarHeader />
            </SidebarHeader>

            <SidebarContent>
                <AdminNavGeneral items={data.generalItems} />
                <AdminNavPublic items={data.publicItems} />
            </SidebarContent>

            <SidebarFooter>
           
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
