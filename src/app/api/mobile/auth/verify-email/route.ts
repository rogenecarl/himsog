import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { z } from "zod/v4";

const verifyEmailSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function OPTIONS() {
  return handleCorsPrelight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { success: false, error: z.prettifyError(parsed.error) },
        400
      );
    }

    const { email, otp } = parsed.data;

    // Use Better Auth's verifyEmailOTP to verify the email
    const res = await auth.api.verifyEmailOTP({
      body: { email, otp },
      headers: request.headers,
    });

    if (!res) {
      return jsonResponse(
        { success: false, error: "Invalid or expired verification code" },
        400
      );
    }

    return jsonResponse({
      success: true,
      data: {
        message: "Email verified successfully. You can now sign in.",
      },
    });
  } catch (error) {
    console.error("Mobile verify email error:", error);

    if (error instanceof Error) {
      // Handle expired or invalid OTP
      if (
        error.message.includes("expired") ||
        error.message.includes("invalid") ||
        error.message.includes("otp")
      ) {
        return jsonResponse(
          { success: false, error: "Invalid or expired verification code" },
          400
        );
      }

      // Handle already verified
      if (error.message.includes("already verified")) {
        return jsonResponse(
          { success: false, error: "Email is already verified. You can sign in." },
          400
        );
      }

      // Handle user not found
      if (error.message.includes("user") && error.message.includes("not found")) {
        return jsonResponse(
          { success: false, error: "No account found with this email" },
          404
        );
      }
    }

    return jsonResponse(
      { success: false, error: "Failed to verify email. Please try again." },
      500
    );
  }
}
