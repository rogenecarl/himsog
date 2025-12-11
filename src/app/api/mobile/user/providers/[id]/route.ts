import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMobileAuth } from "@/lib/mobile-auth-middleware";
import { handleCorsPrelight, jsonResponse } from "@/lib/cors";
import { ProviderStatus } from "@/lib/generated/prisma";

export async function OPTIONS() {
  return handleCorsPrelight();
}

// GET /api/mobile/user/providers/[id] - Get provider details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: {
        id,
        status: ProviderStatus.VERIFIED,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
          orderBy: { name: "asc" },
        },
        operatingHours: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isClosed: true,
          },
          orderBy: { dayOfWeek: "asc" },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            isAnonymous: true,
            createdAt: true,
            professionalismRating: true,
            cleanlinessRating: true,
            waitTimeRating: true,
            valueRating: true,
            providerResponse: true,
            respondedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            appointments: true,
          },
        },
      },
    });

    if (!provider) {
      return jsonResponse(
        { success: false, error: "Provider not found" },
        404
      );
    }

    // Calculate average rating
    const avgRating =
      provider.reviews.length > 0
        ? provider.reviews.reduce((sum, r) => sum + r.rating, 0) /
          provider.reviews.length
        : 0;

    // Serialize provider
    const serializedProvider = {
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
      owner: provider.user,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: provider._count.reviews,
      totalAppointments: provider._count.appointments,
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
      operatingHours: provider.operatingHours.map((oh) => ({
        id: oh.id,
        dayOfWeek: oh.dayOfWeek,
        startTime: oh.startTime,
        endTime: oh.endTime,
        isClosed: oh.isClosed,
      })),
      reviews: provider.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt.toISOString(),
        professionalismRating: r.professionalismRating,
        cleanlinessRating: r.cleanlinessRating,
        waitTimeRating: r.waitTimeRating,
        valueRating: r.valueRating,
        providerResponse: r.providerResponse,
        respondedAt: r.respondedAt?.toISOString() || null,
        likesCount: r._count.likes,
        user: r.isAnonymous
          ? { id: null, name: "Anonymous", image: null }
          : r.user,
      })),
    };

    return jsonResponse({
      success: true,
      data: serializedProvider,
    });
  } catch (error) {
    console.error("Mobile provider detail error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch provider details" },
      500
    );
  }
}
