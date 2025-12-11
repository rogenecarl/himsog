import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { z } from "zod/v4";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function OPTIONS() {
  return handleCorsPrelight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { success: false, error: z.prettifyError(parsed.error) },
        400
      );
    }

    const { name, email, password } = parsed.data;

    // Use Better Auth's signUpEmail to create the user
    // This handles password hashing and OTP email sending
    const res = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: request.headers,
    });

    if (!res.user) {
      return jsonResponse(
        { success: false, error: "Failed to create account" },
        400
      );
    }

    // Return success - user needs to verify email before logging in
    return jsonResponse({
      success: true,
      data: {
        message:
          "Account created successfully. Please check your email for the verification code.",
        userId: res.user.id,
      },
    });
  } catch (error) {
    console.error("Mobile register error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("duplicate")
      ) {
        return jsonResponse(
          { success: false, error: "An account with this email already exists" },
          409
        );
      }

      // Handle email domain validation error from Better Auth hook
      if (error.message.includes("Invalid email address")) {
        return jsonResponse(
          { success: false, error: error.message },
          400
        );
      }

      // Handle rate limiting
      if (error.message.includes("rate") || error.message.includes("limit")) {
        return jsonResponse(
          {
            success: false,
            error: "Too many requests. Please wait before trying again.",
          },
          429
        );
      }
    }

    return jsonResponse(
      { success: false, error: "Failed to create account. Please try again." },
      500
    );
  }
}
