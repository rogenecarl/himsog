import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileAuth } from "@/lib/mobile-auth-middleware";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { ProviderStatus } from "@/lib/generated/prisma";

export async function OPTIONS() {
  return handleCorsPrelight();
}

// GET /api/mobile/user/categories - Get all categories with provider count
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            providers: {
              where: {
                status: ProviderStatus.VERIFIED,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const serializedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      providerCount: cat._count.providers,
    }));

    return jsonResponse({
      success: true,
      data: serializedCategories,
    });
  } catch (error) {
    console.error("Mobile categories error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch categories" },
      500
    );
  }
}
