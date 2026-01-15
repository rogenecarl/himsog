"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser, useUserPending } from "@/context/UserContext";

type Role = "USER" | "PROVIDER" | "ADMIN";

const CANONICAL_DASHBOARDS: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  PROVIDER: "/provider/dashboard",
  USER: "/dashboard",
};

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Default loading fallback
function DefaultLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0B0F19]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-300" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const user = useUser();
  const isPending = useUserPending();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for session to load
    if (isPending) return;

    // No user - redirect to sign in with return URL
    if (!user) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/auth/sign-in?returnUrl=${returnUrl}`);
      return;
    }

    // Check role access
    const userRole = user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to user's canonical dashboard
      router.replace(CANONICAL_DASHBOARDS[userRole] || "/");
    }
  }, [user, isPending, allowedRoles, router, pathname]);

  // Show fallback while loading or redirecting
  if (isPending || !user) {
    return fallback ?? <DefaultLoadingFallback />;
  }

  // Wrong role - show loading while redirecting
  if (!allowedRoles.includes(user.role as Role)) {
    return fallback ?? <DefaultLoadingFallback />;
  }

  return <>{children}</>;
}
