import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { z } from "zod/v4";

const resetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
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
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { success: false, error: z.prettifyError(parsed.error) },
        400
      );
    }

    const { email, otp, password } = parsed.data;

    // Use Better Auth's resetPasswordEmailOTP to reset password with OTP
    await auth.api.resetPasswordEmailOTP({
      body: { email, otp, password },
      headers: request.headers,
    });

    return jsonResponse({
      success: true,
      data: {
        message: "Password reset successfully. You can now sign in with your new password.",
      },
    });
  } catch (error) {
    console.error("Mobile reset password error:", error);

    if (error instanceof Error) {
      // Handle expired or invalid OTP
      if (
        error.message.includes("expired") ||
        error.message.includes("invalid") ||
        error.message.includes("otp")
      ) {
        return jsonResponse(
          { success: false, error: "Invalid or expired reset code" },
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
      { success: false, error: "Failed to reset password. Please try again." },
      500
    );
  }
}
