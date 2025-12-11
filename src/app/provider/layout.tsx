import { ProviderAppSidebar } from "@/components/provider-components/provider-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { ClientUserProvider } from "@/context/ClientUserProvider"
import { ClientAppHeader } from "@/components/app-header-client"
import { RoleGuard } from "@/components/auth/role-guard"
import { FeedbackPopup } from "@/components/feedback/feedback-popup"
import { ProviderMobileNav } from "@/components/provider-components/provider-mobile-nav"

// Static layout - auth is handled by proxy.ts middleware (cookie check only)
// Role validation is handled client-side via RoleGuard

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClientUserProvider>
            <RoleGuard allowedRoles={["PROVIDER"]}>
                <SidebarProvider>
                    <ProviderAppSidebar />
                    <SidebarInset className="bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
                        {/* HEADER */}
                        <ClientAppHeader />

                        {/* PAGE CONTENT */}
                        <main className="flex-1 px-3 sm:px-6 lg:px-10 py-3 sm:py-4 pb-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] md:pb-4">
                            <div className="mx-auto">
                                {children}
                            </div>
                        </main>

                        {/* MOBILE BOTTOM NAVIGATION */}
                        <ProviderMobileNav />
                    </SidebarInset>

                    {/* Feedback Popup - Random survey prompt */}
                    <FeedbackPopup />
                </SidebarProvider>
            </RoleGuard>
        </ClientUserProvider>
    )
}
