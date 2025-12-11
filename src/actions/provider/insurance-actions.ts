"use server";

import prisma from "@/lib/prisma";

// Get all active insurance providers
export async function getActiveInsuranceProviders() {
  try {
    const insuranceProviders = await prisma.insuranceProvider.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, data: insuranceProviders };
  } catch (error) {
    console.error("Error fetching insurance providers:", error);
    return { success: false, error: "Failed to fetch insurance providers" };
  }
}

// Create a new insurance provider or return existing one
// Set requireApproval = true for moderation workflow
export async function createInsuranceProvider(name: string, requireApproval: boolean = false) {
  try {
    // Check if insurance provider already exists (case-insensitive)
    const existing = await prisma.insuranceProvider.findFirst({
      where: { 
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      },
    });

    if (existing) {
      return { success: true, data: existing, isNew: false };
    }

    // Create new insurance provider
    // If requireApproval is true, set isActive to false (pending admin approval)
    const insuranceProvider = await prisma.insuranceProvider.create({
      data: {
        name: name.trim(),
        isActive: !requireApproval, // false if requires approval, true otherwise
      },
    });

    return { 
      success: true, 
      data: insuranceProvider, 
      isNew: true,
      requiresApproval: requireApproval 
    };
  } catch (error) {
    console.error("Error creating insurance provider:", error);
    return { success: false, error: "Failed to create insurance provider" };
  }
}

// Admin approves pending insurance provider
export async function approveInsuranceProvider(id: string) {
  try {
    const insuranceProvider = await prisma.insuranceProvider.update({
      where: { id },
      data: { isActive: true },
    });

    return { success: true, data: insuranceProvider };
  } catch (error) {
    console.error("Error approving insurance provider:", error);
    return { success: false, error: "Failed to approve insurance provider" };
  }
}

// Get pending insurance providers (admin only)
export async function getPendingInsuranceProviders() {
  try {
    const providers = await prisma.insuranceProvider.findMany({
      where: { isActive: false },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: providers };
  } catch (error) {
    console.error("Error fetching pending insurance providers:", error);
    return { success: false, error: "Failed to fetch pending providers" };
  }
}

// Delete an insurance provider (admin only - checks for usage)
export async function deleteInsuranceProvider(id: string) {
  try {
    // Check if insurance provider is being used by any services
    const usageCount = await prisma.serviceInsurance.count({
      where: { insuranceProviderId: id },
    });

    if (usageCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete. This insurance is used by ${usageCount} service(s)`,
        usageCount 
      };
    }

    // Delete the insurance provider
    await prisma.insuranceProvider.delete({
      where: { id },
    });

    return { success: true, message: "Insurance provider deleted successfully" };
  } catch (error) {
    console.error("Error deleting insurance provider:", error);
    return { success: false, error: "Failed to delete insurance provider" };
  }
}

// Soft delete - deactivate instead of deleting
export async function deactivateInsuranceProvider(id: string) {
  try {
    const insuranceProvider = await prisma.insuranceProvider.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, data: insuranceProvider };
  } catch (error) {
    console.error("Error deactivating insurance provider:", error);
    return { success: false, error: "Failed to deactivate insurance provider" };
  }
}
