"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Update provider basic information
export async function updateProviderBasicInfo(data: {
  healthcareName?: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to update provider information",
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
        error: "Only providers can update provider information",
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

    // Update the provider
    const updatedProvider = await prisma.provider.update({
      where: { id: provider.id },
      data: {
        ...(data.healthcareName !== undefined && {
          healthcareName: data.healthcareName,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.phoneNumber !== undefined && {
          phoneNumber: data.phoneNumber,
        }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
      },
    });

    revalidatePath("/provider/settings");
    revalidatePath("/provider/dashboard");
    revalidatePath("/provider/profile");

    // Convert Decimal fields to numbers for client serialization
    const serializedProvider = {
      ...updatedProvider,
      latitude: updatedProvider.latitude
        ? Number(updatedProvider.latitude)
        : null,
      longitude: updatedProvider.longitude
        ? Number(updatedProvider.longitude)
        : null,
    };

    return {
      success: true,
      data: serializedProvider,
      message: "Provider information updated successfully",
    };
  } catch (error) {
    console.error("Error updating provider information:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update provider information",
    };
  }
}

// Update provider operating hours
export async function updateProviderOperatingHours(data: {
  operatingHours: Array<{
    dayOfWeek: number;
    startTime?: string;
    endTime?: string;
    isClosed: boolean;
  }>;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to update operating hours",
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
        error: "Only providers can update operating hours",
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

    // Update or create operating hours for each day
    const updatePromises = data.operatingHours.map(async (hour) => {
      // Use time strings directly (24-hour format: "09:00", "17:00")
      const startTime = hour.startTime && !hour.isClosed ? hour.startTime : null;
      const endTime = hour.endTime && !hour.isClosed ? hour.endTime : null;

      // Check if operating hour exists
      const existing = await prisma.operatingHour.findFirst({
        where: {
          providerId: provider.id,
          dayOfWeek: hour.dayOfWeek,
        },
      });

      if (existing) {
        // Update existing
        return prisma.operatingHour.update({
          where: { id: existing.id },
          data: {
            startTime,
            endTime,
            isClosed: hour.isClosed,
          },
        });
      } else {
        // Create new
        return prisma.operatingHour.create({
          data: {
            providerId: provider.id,
            dayOfWeek: hour.dayOfWeek,
            startTime,
            endTime,
            isClosed: hour.isClosed,
          },
        });
      }
    });

    await Promise.all(updatePromises);

    revalidatePath("/provider/settings");
    revalidatePath("/provider/dashboard");
    revalidatePath("/provider/profile");

    return {
      success: true,
      message: "Operating hours updated successfully",
    };
  } catch (error) {
    console.error("Error updating operating hours:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update operating hours",
    };
  }
}

// ============================================================================
// BREAK TIME ACTIONS
// ============================================================================

// Get provider break times
export async function getProviderBreakTimes() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to view break times",
      };
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    const breakTimes = await prisma.breakTime.findMany({
      where: { providerId: provider.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return {
      success: true,
      data: breakTimes,
    };
  } catch (error) {
    console.error("Error fetching break times:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch break times",
    };
  }
}

// Create a new break time
export async function createBreakTime(data: {
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to create a break time",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "PROVIDER") {
      return {
        success: false,
        error: "Only providers can create break times",
      };
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      return {
        success: false,
        error: "Invalid time format. Use HH:MM format",
      };
    }

    // Validate end time is after start time
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return {
        success: false,
        error: "End time must be after start time",
      };
    }

    const breakTime = await prisma.breakTime.create({
      data: {
        providerId: provider.id,
        name: data.name,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    revalidatePath("/provider/settings");
    revalidatePath("/provider/calendar");

    return {
      success: true,
      data: breakTime,
      message: "Break time created successfully",
    };
  } catch (error) {
    console.error("Error creating break time:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create break time",
    };
  }
}

// Update an existing break time
export async function updateBreakTime(
  breakTimeId: string,
  data: {
    name?: string;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to update a break time",
      };
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify the break time belongs to this provider
    const existingBreakTime = await prisma.breakTime.findFirst({
      where: {
        id: breakTimeId,
        providerId: provider.id,
      },
    });

    if (!existingBreakTime) {
      return {
        success: false,
        error: "Break time not found",
      };
    }

    // Validate times if provided
    if (data.startTime || data.endTime) {
      const startTime = data.startTime || existingBreakTime.startTime;
      const endTime = data.endTime || existingBreakTime.endTime;

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return {
          success: false,
          error: "Invalid time format. Use HH:MM format",
        };
      }

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return {
          success: false,
          error: "End time must be after start time",
        };
      }
    }

    const updatedBreakTime = await prisma.breakTime.update({
      where: { id: breakTimeId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
      },
    });

    revalidatePath("/provider/settings");
    revalidatePath("/provider/calendar");

    return {
      success: true,
      data: updatedBreakTime,
      message: "Break time updated successfully",
    };
  } catch (error) {
    console.error("Error updating break time:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update break time",
    };
  }
}

// Delete a break time
export async function deleteBreakTime(breakTimeId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to delete a break time",
      };
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider profile not found",
      };
    }

    // Verify the break time belongs to this provider
    const existingBreakTime = await prisma.breakTime.findFirst({
      where: {
        id: breakTimeId,
        providerId: provider.id,
      },
    });

    if (!existingBreakTime) {
      return {
        success: false,
        error: "Break time not found",
      };
    }

    await prisma.breakTime.delete({
      where: { id: breakTimeId },
    });

    revalidatePath("/provider/settings");
    revalidatePath("/provider/calendar");

    return {
      success: true,
      message: "Break time deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting break time:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete break time",
    };
  }
}

// Update provider cover photo
export async function updateProviderCoverPhoto(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to update cover photo",
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
        error: "Only providers can update cover photo",
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

    const coverPhoto = formData.get("cover_photo") as File;

    if (!coverPhoto || coverPhoto.size === 0) {
      return {
        success: false,
        error: "No cover photo provided",
      };
    }

    // Validate file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (coverPhoto.size > maxSize) {
      return {
        success: false,
        error: "File size exceeds 5MB limit",
      };
    }

    if (!allowedTypes.includes(coverPhoto.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed",
      };
    }

    // Upload to Supabase Storage
    const { supabase } = await import("@/lib/supabase-client");

    // Generate unique filename
    const fileExt = coverPhoto.name.split(".").pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("HimsogStorage")
      .upload(filePath, coverPhoto, {
        cacheControl: "3600",
        upsert: false,
        contentType: coverPhoto.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return {
        success: false,
        error: "Failed to upload cover photo",
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("HimsogStorage").getPublicUrl(filePath);

    // Delete old cover photo if exists
    if (provider.coverPhoto) {
      try {
        // Extract file path from URL
        const oldFilePath = provider.coverPhoto.split("/").slice(-2).join("/");
        await supabase.storage.from("HimsogStorage").remove([oldFilePath]);
      } catch (error) {
        console.error("Error deleting old cover photo:", error);
        // Continue even if deletion fails
      }
    }

    // Update provider with new cover photo URL
    const updatedProvider = await prisma.provider.update({
      where: { id: provider.id },
      data: {
        coverPhoto: publicUrl,
      },
    });

    revalidatePath("/provider/settings");
    revalidatePath("/provider/dashboard");
    revalidatePath("/provider/profile");

    // Convert Decimal fields to numbers for client serialization
    const serializedProvider = {
      ...updatedProvider,
      latitude: updatedProvider.latitude
        ? Number(updatedProvider.latitude)
        : null,
      longitude: updatedProvider.longitude
        ? Number(updatedProvider.longitude)
        : null,
    };

    return {
      success: true,
      data: serializedProvider,
      message: "Cover photo updated successfully",
    };
  } catch (error) {
    console.error("Error updating cover photo:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update cover photo",
    };
  }
}
