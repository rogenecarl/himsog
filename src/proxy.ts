import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

// Constants for better maintainability
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up", "/auth/sign-up-provider", "/auth/choose-role", "/auth/verify-email", "/auth/forgot-password", "/auth/reset-password"];

// Public routes that don't need session validation at all
const PUBLIC_ROUTES = [
    "/",
    "/about-us",
    "/browse-services",
    "/how-it-works",
    "/map",
    "/provider-details",
    "/set-appointment",
    "/unauthorized",
];

// Protected routes - only need cookie check, not DB validation
// Role validation is handled client-side for better performance
const PROTECTED_ROUTES = [
    "/admin",
    "/provider",
    "/dashboard",
    "/appointments",
    "/chat",
];

// Canonical dashboard paths based on role
const CANONICAL_DASHBOARDS = {
    ADMIN: "/admin/dashboard",
    PROVIDER: "/provider/dashboard",
    USER: "/dashboard",
} as const;

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = getSessionCookie(request);

    // Helper: Strict route matching (e.g., /admin and /admin/settings but not /admin-page)
    const isRoute = (route: string) =>
        pathname === route || pathname.startsWith(`${route}/`);

    // Check if it's a public route - skip session validation entirely
    const isPublicRoute = PUBLIC_ROUTES.some(route => isRoute(route));

    // Early return for public routes - NO session/DB check needed
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Check if it's a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some(route => isRoute(route));

    // Protected routes: Only check cookie existence, NO DB call
    // Role validation happens client-side via ClientUserProvider
    if (isProtectedRoute) {
        if (!sessionCookie) {
            // No session = redirect to sign-in
            return NextResponse.redirect(new URL("/auth/sign-in", request.url));
        }
        // Has session cookie = allow access, client handles role check
        return NextResponse.next();
    }

    // Auth routes: Need DB call to redirect logged-in users to their dashboard
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (isAuthRoute && sessionCookie) {
        try {
            const session = await auth.api.getSession({ headers: request.headers });
            const userRole = session?.user?.role;

            if (session?.user && userRole) {
                // Redirect to canonical dashboard based on role
                const canonicalPath =
                    userRole === "ADMIN" ? CANONICAL_DASHBOARDS.ADMIN :
                    userRole === "PROVIDER" ? CANONICAL_DASHBOARDS.PROVIDER :
                    CANONICAL_DASHBOARDS.USER;

                return NextResponse.redirect(new URL(canonicalPath, request.url));
            }
        } catch (error) {
            console.error("Proxy Session Fetch Error:", error);
            // On error, let them proceed to auth page
        }
    }

    return NextResponse.next();
}

export const config = {
    // Match all routes except static files and API routes
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};