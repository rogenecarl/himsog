"use server";

import { UpdateProfileNameSchema, ChangePasswordSchema } from "@/schemas";
import type { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import type { ActionResponse } from "@/types/api";
import { getCurrentUser } from "@/actions/auth/auth-check-utils";

/**
 * Update user's display name
 */
export async function updateProfileName(
  values: z.infer<typeof UpdateProfileNameSchema>
): Promise<ActionResponse<{ name: string }>> {
  const validatedFields = UpdateProfileNameSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid name format",
    };
  }

  const { name } = validatedFields.data;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to update your profile",
      };
    }

    // Update the user's name in the database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: { name: true },
    });

    return {
      success: true,
      data: { name: updatedUser.name },
    };
  } catch (error) {
    console.error("Error updating profile name:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

/**
 * Change user's password
 * Requires current password verification
 */
export async function changePassword(
  values: z.infer<typeof ChangePasswordSchema>
): Promise<ActionResponse<{ message: string }>> {
  const validatedFields = ChangePasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid input",
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to change your password",
      };
    }

    // Use Better Auth's changePassword API
    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to change password",
      };
    }

    return {
      success: true,
      data: { message: "Password changed successfully" },
    };
  } catch (error) {
    console.error("Error changing password:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("invalid") || errorMessage.includes("incorrect") || errorMessage.includes("wrong")) {
        return {
          success: false,
          error: "Current password is incorrect",
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change password",
    };
  }
}
