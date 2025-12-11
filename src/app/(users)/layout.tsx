import { UserAppSidebar } from "@/components/users/user-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClientUserProvider } from "@/context/ClientUserProvider";
import { ClientAppHeader } from "@/components/app-header-client";
import { RoleGuard } from "@/components/auth/role-guard";
import { FeedbackPopup } from "@/components/feedback/feedback-popup";

// Static layout - auth is handled by proxy.ts middleware (cookie check only)
// Role validation is handled client-side via RoleGuard

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientUserProvider>
      <RoleGuard allowedRoles={["USER"]}>
        <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-300">
          <SidebarProvider>
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
              <UserAppSidebar />
            </div>
            <SidebarInset className="bg-gray-50 dark:bg-[#0B0F19]">
              {/* HEADER - Hidden on mobile */}
              <div className="hidden md:block">
                <ClientAppHeader />
              </div>

              {/* PAGE CONTENT */}
              <main className="flex flex-1 flex-col gap-4 md:p-4 md:pt-0">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>

          {/* Feedback Popup - Random survey prompt */}
          <FeedbackPopup />
        </div>
      </RoleGuard>
    </ClientUserProvider>
  );
}
