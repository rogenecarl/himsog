import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileToken, extractBearerToken } from "@/lib/mobile-jwt";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsPrelight();
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);

    if (!token) {
      return jsonResponse(
        { success: false, error: "No authorization token provided" },
        401
      );
    }

    // Verify and decode the token
    const payload = await verifyMobileToken(token);

    if (!payload) {
      return jsonResponse(
        { success: false, error: "Invalid or expired token" },
        401
      );
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
        { success: false, error: "User not found" },
        404
      );
    }

    // Check if user account is still active
    if (user.status !== "ACTIVE") {
      return jsonResponse(
        { success: false, error: "Account is suspended or deleted" },
        403
      );
    }

    // Return user data
    return jsonResponse({
      success: true,
      data: {
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
    console.error("Mobile auth me error:", error);
    return jsonResponse(
      { success: false, error: "Internal server error" },
      500
    );
  }
}