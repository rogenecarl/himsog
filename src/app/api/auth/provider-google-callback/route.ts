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

        // Get current user role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        // Only update role to PROVIDER if current role is USER (don't demote ADMIN)
        if (user?.role === "USER") {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { role: "PROVIDER" },
            });
        }

        return NextResponse.redirect(new URL("/provider/dashboard", process.env.NEXT_PUBLIC_APP_URL));
    } catch (error) {
        console.error("Provider Google callback error:", error);
        return NextResponse.redirect(new URL("/auth/sign-in?error=callback_failed", process.env.NEXT_PUBLIC_APP_URL));
    }
}
