import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.redirect(new URL("/auth/sign-in", process.env.NEXT_PUBLIC_APP_URL));
        }

        // Get current user with role and createdAt
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, createdAt: true },
        });

        if (!user) {
            return NextResponse.redirect(new URL("/auth/sign-in", process.env.NEXT_PUBLIC_APP_URL));
        }

        // Check if this is a NEW user (created within the last 2 minutes)
        const now = new Date();
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
        const isNewUser = user.createdAt > twoMinutesAgo;

        // Only update role to PROVIDER if:
        // 1. User is NEW (just created via this signup flow)
        // 2. Current role is USER (don't demote ADMIN)
        if (isNewUser && user.role === "USER") {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { role: "PROVIDER" },
            });
            return NextResponse.redirect(new URL("/provider/dashboard", process.env.NEXT_PUBLIC_APP_URL));
        }

        // For existing users, redirect based on their CURRENT role
        const redirectMap = {
            ADMIN: "/admin/dashboard",
            PROVIDER: "/provider/dashboard",
            USER: "/browse-services",
        } as const;

        const redirectPath = redirectMap[user.role as keyof typeof redirectMap] || "/browse-services";
        return NextResponse.redirect(new URL(redirectPath, process.env.NEXT_PUBLIC_APP_URL));
    } catch (error) {
        console.error("Provider Google callback error:", error);
        return NextResponse.redirect(new URL("/auth/sign-in?error=callback_failed", process.env.NEXT_PUBLIC_APP_URL));
    }
}
