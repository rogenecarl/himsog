"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import type { User } from "@/schemas";
import { cache } from "react";

/**
 * Get the current authenticated user with full data from database
 * Returns null if not authenticated
 * 
 * OPTIMIZED: Uses React cache() to prevent duplicate DB queries within the same request
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as User | null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
});

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Returns the authenticated user
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

/**
 * Require specific role(s) - redirects to unauthorized if user doesn't have required role
 * Returns the authenticated user with verified role
 */
export async function requireRole(allowedRoles: User["role"][]): Promise<User> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if user has specific role (doesn't redirect, just returns boolean)
 */
export async function hasRole(allowedRoles: User["role"][]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}

/**
 * Require ADMIN role - shorthand for requireRole(["ADMIN"])
 */
export async function requireAdmin(): Promise<User> {
  return requireRole(["ADMIN"]);
}

/**
 * Require PROVIDER role - shorthand for requireRole(["PROVIDER", "ADMIN"])
 * Note: Admins can also access provider routes
 */
export async function requireProvider(): Promise<User> {
  return requireRole(["PROVIDER", "ADMIN"]);
}
