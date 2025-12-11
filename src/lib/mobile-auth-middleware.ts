import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileToken, extractBearerToken } from "@/lib/mobile-jwt";
import { jsonResponse } from "@/lib/cors";

export interface MobileUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: string;
}

export type MobileAuthResult =
  | { success: true; user: MobileUser }
  | { success: false; response: Response };

/**
 * Verify mobile authentication and return user data
 * Use this in protected mobile API routes
 */
export async function verifyMobileAuth(
  request: NextRequest
): Promise<MobileAuthResult> {
  const authHeader = request.headers.get("authorization");
  const token = extractBearerToken(authHeader);

  if (!token) {
    return {
      success: false,
      response: jsonResponse(
        { success: false, error: "No authorization token provided" },
        401
      ),
    };
  }

  const payload = await verifyMobileToken(token);

  if (!payload) {
    return {
      success: false,
      response: jsonResponse(
        { success: false, error: "Invalid or expired token" },
        401
      ),
    };
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
    },
  });

  if (!user) {
    return {
      success: false,
      response: jsonResponse({ success: false, error: "User not found" }, 404),
    };
  }

  if (user.status !== "ACTIVE") {
    return {
      success: false,
      response: jsonResponse(
        { success: false, error: "Account is suspended or deleted" },
        403
      ),
    };
  }

  // Only allow USER role for mobile app
  if (user.role !== "USER") {
    return {
      success: false,
      response: jsonResponse(
        { success: false, error: "Mobile app is only available for regular users" },
        403
      ),
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    },
  };
}
