import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { z } from "zod/v4";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export async function OPTIONS() {
  return handleCorsPrelight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { success: false, error: z.prettifyError(parsed.error) },
        400
      );
    }

    const { email } = parsed.data;

    // Use Better Auth's forgetPasswordEmailOTP to send OTP
    // This sends an OTP code to the user's email for password reset
    await auth.api.forgetPasswordEmailOTP({
      body: { email },
      headers: request.headers,
    });

    return jsonResponse({
      success: true,
      data: {
        message: "Password reset code sent. Please check your email.",
      },
    });
  } catch (error) {
    console.error("Mobile forgot password error:", error);

    if (error instanceof Error) {
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

    // Return success even if email doesn't exist (security best practice)
    // This prevents email enumeration attacks
    return jsonResponse({
      success: true,
      data: {
        message: "If an account exists with this email, a reset code has been sent.",
      },
    });
  }
}
