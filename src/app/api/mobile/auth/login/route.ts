import { NextRequest } from "next/server";
import { verifyPassword } from "better-auth/crypto";
import prisma from "@/lib/prisma";
import { generateMobileToken } from "@/lib/mobile-jwt";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { z } from "zod/v4";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function OPTIONS() {
  return handleCorsPrelight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { success: false, error: z.prettifyError(parsed.error) },
        400
      );
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return jsonResponse(
        { success: false, error: "Invalid email or password" },
        401
      );
    }

    // Check if user account is active
    if (user.status !== "ACTIVE") {
      return jsonResponse(
        { success: false, error: "Account is suspended or deleted" },
        403
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return jsonResponse(
        { success: false, error: "Please verify your email before signing in" },
        403
      );
    }

    // Only allow USER role for mobile app
    if (user.role !== "USER") {
      return jsonResponse(
        {
          success: false,
          error: "Mobile app is only available for regular users",
        },
        403
      );
    }

    // Get the credential account for password verification
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      select: {
        password: true,
      },
    });

    if (!account?.password) {
      return jsonResponse(
        { success: false, error: "Invalid email or password" },
        401
      );
    }

    // Verify password using Better Auth's password verification
    const isValidPassword = await verifyPassword({
      hash: account.password,
      password: password,
    });

    if (!isValidPassword) {
      return jsonResponse(
        { success: false, error: "Invalid email or password" },
        401
      );
    }

    // Generate JWT token for mobile app
    const token = await generateMobileToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return token and user data
    return jsonResponse({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return jsonResponse(
      { success: false, error: "Internal server error" },
      500
    );
  }
}
