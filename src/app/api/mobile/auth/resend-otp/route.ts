import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { z } from "zod/v4";

const resendOtpSchema = z.object({
  email: z.email("Invalid email address"),
  type: z.enum(["email-verification", "sign-in", "forget-password"]).optional(),
});

export async function OPTIONS() {
  return handleCorsPrelight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = resendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { success: false, error: z.prettifyError(parsed.error) },
        400
      );
    }

    const { email, type = "email-verification" } = parsed.data;

    // Use Better Auth's sendVerificationOTP to resend the OTP
    await auth.api.sendVerificationOTP({
      body: { email, type },
      headers: request.headers,
    });

    return jsonResponse({
      success: true,
      data: {
        message: "Verification code sent. Please check your email.",
      },
    });
  } catch (error) {
    console.error("Mobile resend OTP error:", error);

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

      // Handle user not found
      if (error.message.includes("user") && error.message.includes("not found")) {
        return jsonResponse(
          { success: false, error: "No account found with this email" },
          404
        );
      }

      // Handle already verified
      if (error.message.includes("already verified")) {
        return jsonResponse(
          { success: false, error: "Email is already verified" },
          400
        );
      }
    }

    return jsonResponse(
      { success: false, error: "Failed to send verification code. Please try again." },
      500
    );
  }
}
