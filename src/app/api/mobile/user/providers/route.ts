import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileAuth } from "@/lib/mobile-auth-middleware";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { ProviderStatus } from "@/lib/generated/prisma";

export async function OPTIONS() {
  return handleCorsPrelight();
}

// GET /api/mobile/user/providers - Get all verified providers for map/list
// Query params:
//   ?category=slug - Filter by category
//   ?search=query - Search providers
//   ?lat=&lng=&distance= - Get nearby providers
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const distance = searchParams.get("distance");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status: ProviderStatus.VERIFIED,
      latitude: { not: null },
      longitude: { not: null },
    };

    // Filter by category
    if (category) {
      whereClause.category = { slug: category };
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { healthcareName: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        {
          services: {
            some: {
              name: { contains: search, mode: "insensitive" },
              isActive: true,
            },
          },
        },
      ];
    }

    const providers = await prisma.provider.findMany({
      where: whereClause,
      select: {
        id: true,
        healthcareName: true,
        description: true,
        address: true,
        city: true,
        province: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
        email: true,
        coverPhoto: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            pricingModel: true,
            fixedPrice: true,
            priceMin: true,
            priceMax: true,
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        healthcareName: "asc",
      },
    });

    // Transform and optionally calculate distance
    let serializedProviders = providers.map((provider) => ({
      id: provider.id,
      healthcareName: provider.healthcareName,
      description: provider.description,
      address: provider.address,
      city: provider.city,
      province: provider.province,
      latitude: provider.latitude ? Number(provider.latitude) : null,
      longitude: provider.longitude ? Number(provider.longitude) : null,
      phoneNumber: provider.phoneNumber,
      email: provider.email,
      coverPhoto: provider.coverPhoto,
      category: provider.category,
      reviewCount: provider._count.reviews,
      services: provider.services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        type: s.type,
        pricingModel: s.pricingModel,
        fixedPrice: s.fixedPrice ? Number(s.fixedPrice) : 0,
        priceMin: s.priceMin ? Number(s.priceMin) : 0,
        priceMax: s.priceMax ? Number(s.priceMax) : 0,
      })),
      distance: null as number | null,
    }));

    // Calculate distance if user location provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistance = distance ? parseFloat(distance) : Infinity;

      serializedProviders = serializedProviders
        .map((provider) => {
          if (!provider.latitude || !provider.longitude) return provider;

          // Haversine formula for distance calculation
          const R = 6371; // Earth's radius in km
          const dLat = ((provider.latitude - userLat) * Math.PI) / 180;
          const dLon = ((provider.longitude - userLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((provider.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;

          return {
            ...provider,
            distance: Math.round(dist * 100) / 100, // Round to 2 decimal places
          };
        })
        .filter((p) => !maxDistance || !p.distance || p.distance <= maxDistance)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return jsonResponse({
      success: true,
      data: serializedProviders,
    });
  } catch (error) {
    console.error("Mobile providers error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch providers" },
      500
    );
  }
}
