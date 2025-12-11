import { AdminAppSidebar } from "@/components/admin-components/admin-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { ClientUserProvider } from "@/context/ClientUserProvider"
import { ClientAppHeader } from "@/components/app-header-client"
import { RoleGuard } from "@/components/auth/role-guard"

// Static layout - auth is handled by proxy.ts middleware (cookie check only)
// Role validation is handled client-side via RoleGuard

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClientUserProvider>
            <RoleGuard allowedRoles={["ADMIN"]}>
                <SidebarProvider>
                    <AdminAppSidebar />
                    <SidebarInset className="bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
                        {/* HEADER */}
                        <ClientAppHeader />

                        {/* PAGE CONTENT */}
                        <main className="flex-1 px-8 py-5">
                            <div className="mx-auto">
                                {children}
                            </div>
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </RoleGuard>
        </ClientUserProvider>
    )
}
