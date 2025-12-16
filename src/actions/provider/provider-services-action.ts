"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ServiceType, PricingModel } from "@/lib/generated/prisma";

// Create a new service
export async function createService(data: {
  name: string;
  description?: string;
  type: ServiceType;
  pricingModel: PricingModel;
  fixedPrice?: number;
  priceMin?: number;
  priceMax?: number;
  acceptedInsurances?: string[];
  includedServices?: string[];
  isActive?: boolean;
  sortOrder?: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to create a service",
      };
    }

    // Fetch user with role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PROVIDER") {
      return {
        success: false,
        error: "Only providers can create services",
      };
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Create the service with transaction
    const service = await prisma.$transaction(async (tx) => {
      // Create the service
      const newService = await tx.service.create({
        data: {
          providerId: provider.id,
          name: data.name,
          description: data.description || null,
          type: data.type,
          pricingModel: data.pricingModel,
          fixedPrice: data.fixedPrice || 0,
          priceMin: data.priceMin || 0,
          priceMax: data.priceMax || 0,
          isActive: data.isActive ?? true,
        },
      });

      // Create insurance relationships
      if (data.acceptedInsurances && data.acceptedInsurances.length > 0) {
        await tx.serviceInsurance.createMany({
          data: data.acceptedInsurances.map((insuranceId) => ({
            serviceId: newService.id,
            insuranceProviderId: insuranceId,
          })),
          skipDuplicates: true,
        });
      }

      // Handle package relationships
      if (data.type === 'PACKAGE' && data.includedServices && data.includedServices.length > 0) {
        // Find or create child services
        for (const childServiceName of data.includedServices) {
          // Check if service exists
          let childService = await tx.service.findFirst({
            where: {
              providerId: provider.id,
              name: childServiceName,
            },
          });

          // Create if doesn't exist
          if (!childService) {
            childService = await tx.service.create({
              data: {
                providerId: provider.id,
                name: childServiceName,
                description: `Part of ${data.name} package`,
                type: 'SINGLE',
                pricingModel: 'FIXED',
                fixedPrice: 0,
                priceMin: 0,
                priceMax: 0,
                isActive: true,
              },
            });
          }

          // Create package relationship
          await tx.servicePackage.create({
            data: {
              parentPackageId: newService.id,
              childServiceId: childService.id,
            },
          });
        }
      }

      return newService;
    });

    revalidatePath("/provider/services");
    revalidatePath("/provider/dashboard");

    return {
      success: true,
      data: service,
      message: "Service created successfully",
    };
  } catch (error) {
    console.error("Error creating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create service",
    };
  }
}

// Update an existing service
export async function updateService(
  serviceId: string,
  data: {
    name?: string;
    description?: string;
    type?: ServiceType;
    pricingModel?: PricingModel;
    fixedPrice?: number;
    priceMin?: number;
    priceMax?: number;
    acceptedInsurances?: string[];
    includedServices?: string[];
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to update a service",
      };
    }

    // Fetch user with role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PROVIDER") {
      return {
        success: false,
        error: "Only providers can update services",
      };
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify service belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Service not found",
      };
    }

    if (existingService.providerId !== provider.id) {
      return {
        success: false,
        error: "You don't have permission to update this service",
      };
    }

    // Update the service with transaction
    const service = await prisma.$transaction(async (tx) => {
      // Update the service
      const updatedService = await tx.service.update({
        where: { id: serviceId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.pricingModel !== undefined && { pricingModel: data.pricingModel }),
          ...(data.fixedPrice !== undefined && { fixedPrice: data.fixedPrice }),
          ...(data.priceMin !== undefined && { priceMin: data.priceMin }),
          ...(data.priceMax !== undefined && { priceMax: data.priceMax }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
      });

      // Update insurance relationships if provided
      if (data.acceptedInsurances !== undefined) {
        // Delete existing relationships
        await tx.serviceInsurance.deleteMany({
          where: { serviceId },
        });

        // Create new relationships
        if (data.acceptedInsurances.length > 0) {
          await tx.serviceInsurance.createMany({
            data: data.acceptedInsurances.map((insuranceId) => ({
              serviceId,
              insuranceProviderId: insuranceId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Update package relationships if provided
      if (data.includedServices !== undefined) {
        // Delete existing package relationships
        await tx.servicePackage.deleteMany({
          where: { parentPackageId: serviceId },
        });

        // Create new relationships
        if (data.includedServices.length > 0) {
          for (const childServiceName of data.includedServices) {
            // Find or create child service
            let childService = await tx.service.findFirst({
              where: {
                providerId: provider.id,
                name: childServiceName,
              },
            });

            if (!childService) {
              childService = await tx.service.create({
                data: {
                  providerId: provider.id,
                  name: childServiceName,
                  description: `Part of ${data.name || existingService.name} package`,
                  type: 'SINGLE',
                  pricingModel: 'FIXED',
                  fixedPrice: 0,
                  priceMin: 0,
                  priceMax: 0,
                  isActive: true,
                },
              });
            }

            // Create package relationship
            await tx.servicePackage.create({
              data: {
                parentPackageId: serviceId,
                childServiceId: childService.id,
              },
            });
          }
        }
      }

      return updatedService;
    });

    revalidatePath("/provider/services");
    revalidatePath("/provider/dashboard");

    return {
      success: true,
      data: service,
      message: "Service updated successfully",
    };
  } catch (error) {
    console.error("Error updating service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update service",
    };
  }
}

// Delete a service
export async function deleteService(serviceId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to delete a service",
      };
    }

    // Fetch user with role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PROVIDER") {
      return {
        success: false,
        error: "Only providers can delete services",
      };
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify service belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Service not found",
      };
    }

    if (existingService.providerId !== provider.id) {
      return {
        success: false,
        error: "You don't have permission to delete this service",
      };
    }

    // Check if service is used in any appointments
    const appointmentCount = await prisma.appointmentService.count({
      where: { serviceId },
    });

    if (appointmentCount > 0) {
      return {
        success: false,
        error: "Cannot delete service that has been used in appointments. Consider deactivating it instead.",
      };
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: serviceId },
    });

    revalidatePath("/provider/services");
    revalidatePath("/provider/dashboard");

    return {
      success: true,
      message: "Service deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete service",
    };
  }
}

// Get all services for the current provider
export async function getProviderServices() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to view services",
      };
    }

    // Fetch user with role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PROVIDER") {
      return {
        success: false,
        error: "Only providers can view services",
      };
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Get all services for this provider with insurance and package relationships
    const services = await prisma.service.findMany({
      where: { providerId: provider.id },
      include: {
        acceptedInsurances: {
          include: {
            insuranceProvider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        includedServices: {
          include: {
            childService: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch services",
    };
  }
}

// Remove a child service from a package
export async function removeChildServiceFromPackage(
  packageId: string,
  childServiceName: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to update a package",
      };
    }

    // Fetch user with role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PROVIDER") {
      return {
        success: false,
        error: "Only providers can update packages",
      };
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify package belongs to provider
    const existingPackage = await prisma.service.findUnique({
      where: { id: packageId },
    });

    if (!existingPackage) {
      return {
        success: false,
        error: "Package not found",
      };
    }

    if (existingPackage.providerId !== provider.id) {
      return {
        success: false,
        error: "You don't have permission to update this package",
      };
    }

    // Find the child service by name
    const childService = await prisma.service.findFirst({
      where: {
        providerId: provider.id,
        name: childServiceName,
      },
    });

    if (!childService) {
      return {
        success: false,
        error: "Child service not found",
      };
    }

    // Delete the package relationship
    await prisma.servicePackage.deleteMany({
      where: {
        parentPackageId: packageId,
        childServiceId: childService.id,
      },
    });

    // Check if this child service is used in any other packages
    const otherPackageUsage = await prisma.servicePackage.count({
      where: {
        childServiceId: childService.id,
      },
    });

    // If not used in any other packages and was auto-created (description contains "Part of"), delete it
    if (otherPackageUsage === 0 && childService.description?.includes("Part of")) {
      await prisma.service.delete({
        where: { id: childService.id },
      });
    }

    revalidatePath("/provider/services");
    revalidatePath("/provider/dashboard");

    return {
      success: true,
      message: "Service removed from package successfully",
    };
  } catch (error) {
    console.error("Error removing child service from package:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove service from package",
    };
  }
}

// Toggle service active status
export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to update a service",
      };
    }

    // Fetch user with role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PROVIDER") {
      return {
        success: false,
        error: "Only providers can update services",
      };
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify service belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return {
        success: false,
        error: "Service not found",
      };
    }

    if (existingService.providerId !== provider.id) {
      return {
        success: false,
        error: "You don't have permission to update this service",
      };
    }

    // Update the service
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: { isActive },
    });

    revalidatePath("/provider/services");
    revalidatePath("/provider/dashboard");

    return {
      success: true,
      data: service,
      message: `Service ${isActive ? "activated" : "deactivated"} successfully`,
    };
  } catch (error) {
    console.error("Error toggling service status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update service status",
    };
  }
}
