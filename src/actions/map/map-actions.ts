"use server";

import prisma from "@/lib/prisma";
import { calculateDistance } from "@/lib/distance-utils";
import { ProviderStatus } from "@/lib/generated/prisma";
import type { Provider } from "@/schemas/provider.schema";
import type { Decimal } from "@prisma/client/runtime/library";

// Type for Prisma select result (matches database structure with Decimal types)
type PrismaProviderWithLocation = {
  id: string;
  healthcareName: string;
  description: string | null;
  address: string;
  city: string;
  province: string;
  latitude: Decimal | null;
  longitude: Decimal | null;
  phoneNumber: string | null;
  email: string | null;
  coverPhoto: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
  services: {
    id: string;
    name: string;
    description: string | null;
    type: 'SINGLE' | 'PACKAGE';
    pricingModel: 'FIXED' | 'RANGE';
    fixedPrice: number;
    priceMin: number;
    priceMax: number;
  }[];
};

// Map-specific provider type extending schema types
export interface MapProvider extends Pick<Provider, 'id' | 'healthcareName' | 'description' | 'address' | 'city' | 'province' | 'latitude' | 'longitude' | 'phoneNumber' | 'email' | 'coverPhoto'> {
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
  services: {
    id: string;
    name: string;
    description?: string | null;
    type: 'SINGLE' | 'PACKAGE';
    pricingModel: 'FIXED' | 'RANGE';
    fixedPrice: number;
    priceMin?: number;
    priceMax?: number;
  }[];
}

export async function getAllProvidersForMap(): Promise<MapProvider[]> {
  try {
    const providers = await prisma.provider.findMany({
      where: {
        status: ProviderStatus.VERIFIED,
        // Only include providers with coordinates
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
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
          where: {
            isActive: true,
          },
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
          take: 5, // Limit services for map performance
        },
      },
      orderBy: {
        healthcareName: "asc",
      },
    });

    // Transform the data to ensure proper typing
    return providers.map((provider: PrismaProviderWithLocation) => ({
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
      services: provider.services,
    }));
  } catch (error) {
    console.error("Error fetching providers for map:", error);
    throw new Error("Failed to fetch providers for map");
  }
}

export async function getProvidersByCategory(categorySlug: string): Promise<MapProvider[]> {
  try {
    const providers = await prisma.provider.findMany({
      where: {
        status: ProviderStatus.VERIFIED,
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        category: {
          slug: categorySlug,
        },
      },
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
          where: {
            isActive: true,
          },
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
          take: 5,
        },
      },
      orderBy: {
        healthcareName: "asc",
      },
    });

    return providers.map((provider: PrismaProviderWithLocation) => ({
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
      services: provider.services,
    }));
  } catch (error) {
    console.error("Error fetching providers by category for map:", error);
    throw new Error("Failed to fetch providers by category for map");
  }
}

export async function searchProvidersForMap(query: string): Promise<MapProvider[]> {
  try {
    const providers = await prisma.provider.findMany({
      where: {
        status: ProviderStatus.VERIFIED,
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
        OR: [
          {
            healthcareName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            services: {
              some: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
                isActive: true,
              },
            },
          },
        ],
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
        services: {
          where: {
            isActive: true,
          },
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
        },
      },
      orderBy: {
        healthcareName: "asc",
      },
    });

    return providers.map((provider: PrismaProviderWithLocation) => ({
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
      services: provider.services,
    }));
  } catch (error) {
    console.error("Error searching providers for map:", error);
    throw new Error("Failed to search providers for map");
  }
}



// Get providers within a specific distance from user location
export async function getProvidersWithinDistance(
  userLat: number,
  userLon: number,
  maxDistance: number
): Promise<(MapProvider & { distance: number })[]> {
  try {
    const allProviders = await getAllProvidersForMap();
    
    const providersWithDistance = allProviders
      .map((provider) => {
        if (!provider.latitude || !provider.longitude) return null;
        
        const distance = calculateDistance(
          userLat,
          userLon,
          provider.latitude,
          provider.longitude
        );
        
        return {
          ...provider,
          distance,
        };
      })
      .filter((provider): provider is MapProvider & { distance: number } => 
        provider !== null && provider.distance <= maxDistance
      )
      .sort((a, b) => a.distance - b.distance);

    return providersWithDistance;
  } catch (error) {
    console.error("Error fetching providers within distance:", error);
    throw new Error("Failed to fetch providers within distance");
  }
}

// Get the nearest provider to user location
export async function getNearestProvider(
  userLat: number,
  userLon: number
): Promise<(MapProvider & { distance: number }) | null> {
  try {
    const allProviders = await getAllProvidersForMap();
    
    let nearestProvider: (MapProvider & { distance: number }) | null = null;
    let minDistance = Infinity;

    for (const provider of allProviders) {
      if (!provider.latitude || !provider.longitude) continue;
      
      const distance = calculateDistance(
        userLat,
        userLon,
        provider.latitude,
        provider.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestProvider = {
          ...provider,
          distance,
        };
      }
    }

    return nearestProvider;
  } catch (error) {
    console.error("Error fetching nearest provider:", error);
    throw new Error("Failed to fetch nearest provider");
  }
}