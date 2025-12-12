"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  CreateProviderSchema,
  type CreateProviderServiceInput,
  type CreateProviderOperatingHourInput,
  DocumentType
} from "@/schemas";
import { supabase } from "@/lib/supabase-client";
import { Decimal } from "@prisma/client/runtime/library";

// Helper function to validate file
function validateFile(file: File, allowedTypes: string[], maxSize: number = 6 * 1024 * 1024) {
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  return { valid: true };
}

// Helper function to upload file to Supabase Storage
async function uploadFileToSupabase(
  file: File,
  bucket: string,
  folder: string,
  userId: string,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
): Promise<{ success: boolean; url?: string; error?: string; filePath?: string }> {
  try {
    // Validate file
    const validation = validateFile(file, allowedTypes);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl, filePath };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Helper function to delete file from Supabase Storage
async function deleteFileFromSupabase(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('File delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

// Helper function to serialize Prisma data for client components
function serializeProvider<T extends {
  latitude: Decimal | number | null;
  longitude: Decimal | number | null;
  services?: Array<{
    priceMin: number;
    priceMax: number;
    [key: string]: unknown;
  }>;
  operatingHours?: unknown[];
  documents?: unknown[];
  category?: unknown;
  user?: unknown;
  [key: string]: unknown;
}>(provider: T) {
  return {
    ...provider,
    latitude: provider.latitude ? Number(provider.latitude) : null,
    longitude: provider.longitude ? Number(provider.longitude) : null,
    services:
      provider.services?.map((service) => ({
        ...service,
        priceMin: Number(service.priceMin),
        priceMax: Number(service.priceMax),
      })) || [],
    operatingHours: provider.operatingHours || [],
    documents: provider.documents || [],
    category: provider.category || null,
    user: provider.user || null,
  };
}

export async function createProviderProfile(formData: FormData) {
  // Store uploaded file paths for cleanup if needed
  const uploadedFiles: string[] = [];

  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user already has a provider profile
    const existingProvider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProvider) {
      return { success: false, error: "Provider profile already exists" };
    }

    // Extract and validate form data
    const healthcareName = formData.get("healthcareName") as string;
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const province = formData.get("province") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const slotDuration = parseInt(formData.get("slotDuration") as string) || 30;

    // Parse JSON data with proper typing
    const services: CreateProviderServiceInput[] = JSON.parse(
      (formData.get("services") as string) || "[]"
    );
    const operatingHours: CreateProviderOperatingHourInput[] = JSON.parse(
      (formData.get("operatingHours") as string) || "[]"
    );
    const documentsMetadata: Array<{ document_type: string; index: number }> =
      JSON.parse((formData.get("documents_metadata") as string) || "[]");

    // Get cover photo file
    const coverPhoto = formData.get("coverPhoto") as File;

    // Prepare validation data
    const validationData = {
      healthcareName,
      categoryId: categoryId || null,
      description,
      phoneNumber,
      email,
      coverPhoto: coverPhoto && coverPhoto.size > 0 ? coverPhoto : null,
      address,
      city,
      province,
      latitude,
      longitude,
      slotDuration,
      services,
      operatingHours,
      documents: documentsMetadata
        .map((meta, index) => {
          const file = formData.get(`documents[${index}][filePath]`) as File;
          return {
            documentType: meta.document_type as DocumentType,
            filePath: file,
          };
        })
        .filter((doc) => doc.filePath && doc.filePath.size > 0),
    };

    // Validate using Zod schema
    const validation = CreateProviderSchema.safeParse(validationData);

    if (!validation.success) {
      const errors = validation.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: `Validation failed: ${errors}` };
    }

    const validatedData = validation.data;

    // Check uniqueness of healthcare name, email, and phone number
    const existingProviderByName = await prisma.provider.findFirst({
      where: {
        healthcareName: {
          equals: validatedData.healthcareName,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingProviderByName) {
      return {
        success: false,
        error: "A provider with this healthcare name already exists. Please choose a different name.",
        field: "healthcareName",
        redirectTo: "/provider/onboarding/step-1",
      };
    }

    const existingProviderByEmail = await prisma.provider.findFirst({
      where: {
        email: {
          equals: validatedData.email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingProviderByEmail) {
      return {
        success: false,
        error: "A provider with this email address already exists. Please use a different email.",
        field: "email",
        redirectTo: "/provider/onboarding/step-1",
      };
    }

    const existingProviderByPhone = await prisma.provider.findFirst({
      where: {
        phoneNumber: validatedData.phoneNumber,
      },
      select: { id: true },
    });

    if (existingProviderByPhone) {
      return {
        success: false,
        error: "A provider with this phone number already exists. Please use a different phone number.",
        field: "phoneNumber",
        redirectTo: "/provider/onboarding/step-1",
      };
    }

    // Handle cover photo upload to Supabase Storage BEFORE transaction
    let coverPhotoPath: string | null = null;
    let coverPhotoFilePath: string | null = null;
    if (validatedData.coverPhoto) {
      const uploadResult = await uploadFileToSupabase(
        validatedData.coverPhoto,
        'HimsogStorage',
        'covers',
        session.user.id,
        ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
      );

      if (!uploadResult.success) {
        return {
          success: false,
          error: `Failed to upload cover photo: ${uploadResult.error}`
        };
      }

      coverPhotoPath = uploadResult.url!;
      coverPhotoFilePath = uploadResult.filePath!;
      uploadedFiles.push(coverPhotoFilePath);
    }

    // Handle document uploads to Supabase Storage BEFORE transaction
    const uploadedDocuments: Array<{ documentType: DocumentType; url: string; filePath: string }> = [];
    
    if (validatedData.documents && validatedData.documents.length > 0) {
      for (const doc of validatedData.documents) {
        const uploadResult = await uploadFileToSupabase(
          doc.filePath as File,
          'HimsogStorage',
          'documents',
          session.user.id,
          ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf']
        );

        if (!uploadResult.success) {
          // Clean up previously uploaded files
          for (const uploaded of uploadedFiles) {
            await deleteFileFromSupabase('HimsogStorage', uploaded);
          }
          return {
            success: false,
            error: `Failed to upload document: ${uploadResult.error}`
          };
        }

        uploadedDocuments.push({
          documentType: doc.documentType,
          url: uploadResult.url!,
          filePath: uploadResult.filePath!
        });
        uploadedFiles.push(uploadResult.filePath!);
      }
    }

    // Create provider profile in a transaction (with increased timeout)
    const result = await prisma.$transaction(async (tx) => {
      // Create the provider
      const provider = await tx.provider.create({
        data: {
          userId: session.user.id,
          categoryId: validatedData.categoryId,
          healthcareName: validatedData.healthcareName,
          description: validatedData.description,
          phoneNumber: validatedData.phoneNumber,
          email: validatedData.email,
          coverPhoto: coverPhotoPath,
          address: validatedData.address,
          city: validatedData.city,
          province: validatedData.province,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          slotDuration: validatedData.slotDuration,
          status: "PENDING", // Default status
        },
      });

      // Create services if provided
      if (validatedData.services && validatedData.services.length > 0) {
        // Map to track created services by name
        const serviceMap = new Map<string, { id: string; name: string }>();

        // First pass: Create all SINGLE services and collect package info
        const packagesToProcess: typeof validatedData.services = [];

        for (const service of validatedData.services) {
          if (service.type === 'PACKAGE') {
            // Store package for second pass
            packagesToProcess.push(service);
            
            // Create child services if they don't exist yet
            if (service.includedServices && service.includedServices.length > 0) {
              for (const childServiceName of service.includedServices) {
                // Only create if not already in the batch
                if (!serviceMap.has(childServiceName) &&
                    !validatedData.services.find((s) => s.name === childServiceName && s.type === 'SINGLE')) {
                  // Auto-create the child service
                  const childService = await tx.service.create({
                    data: {
                      providerId: provider.id,
                      name: childServiceName,
                      description: `Part of ${service.name} package`,
                      type: 'SINGLE',
                      pricingModel: 'FIXED',
                      fixedPrice: 0,
                      priceMin: 0,
                      priceMax: 0,
                      isActive: true,
                    },
                  });
                  serviceMap.set(childServiceName, childService);
                }
              }
            }
          } else {
            // Create SINGLE service
            const createdService = await tx.service.create({
              data: {
                providerId: provider.id,
                name: service.name,
                description: service.description || null,
                type: 'SINGLE',
                pricingModel: service.pricingModel || 'FIXED',
                fixedPrice: service.fixedPrice || 0,
                priceMin: service.priceMin || 0,
                priceMax: service.priceMax || 0,
                isActive: service.isActive ?? true,
              },
            });

            // Create insurance relationships for SINGLE services
            if (service.acceptedInsurances && service.acceptedInsurances.length > 0) {
              await tx.serviceInsurance.createMany({
                data: service.acceptedInsurances.map((insuranceId: string) => ({
                  serviceId: createdService.id,
                  insuranceProviderId: insuranceId,
                })),
                skipDuplicates: true,
              });
            }

            serviceMap.set(service.name, createdService);
          }
        }

        // Second pass: Create PACKAGE services and link to children
        for (const packageService of packagesToProcess) {
          // Create the package service
          const createdPackage = await tx.service.create({
            data: {
              providerId: provider.id,
              name: packageService.name,
              description: packageService.description || null,
              type: 'PACKAGE',
              pricingModel: packageService.pricingModel || 'FIXED',
              fixedPrice: packageService.fixedPrice || 0,
              priceMin: packageService.priceMin || 0,
              priceMax: packageService.priceMax || 0,
              isActive: packageService.isActive ?? true,
            },
          });

          // Create insurance relationships for PACKAGE
          if (packageService.acceptedInsurances && packageService.acceptedInsurances.length > 0) {
            await tx.serviceInsurance.createMany({
              data: packageService.acceptedInsurances.map((insuranceId: string) => ({
                serviceId: createdPackage.id,
                insuranceProviderId: insuranceId,
              })),
              skipDuplicates: true,
            });
          }

          // Link package to child services
          if (packageService.includedServices && packageService.includedServices.length > 0) {
            const childServiceIds: string[] = [];

            for (const childName of packageService.includedServices) {
              const childService = serviceMap.get(childName);
              if (childService) {
                childServiceIds.push(childService.id);
              }
            }

            if (childServiceIds.length > 0) {
              await tx.servicePackage.createMany({
                data: childServiceIds.map(childId => ({
                  parentPackageId: createdPackage.id,
                  childServiceId: childId,
                })),
                skipDuplicates: true,
              });
            }
          }

          serviceMap.set(packageService.name, createdPackage);
        }
      }

      // Create operating hours if provided
      if (
        validatedData.operatingHours &&
        validatedData.operatingHours.length > 0
      ) {
        const operatingHoursData = validatedData.operatingHours.map((hours: CreateProviderOperatingHourInput) => {
          // UPDATED: Removed date formatting logic. 
          // We directly save the string (e.g., "09:00") or null.
          return {
            providerId: provider.id,
            dayOfWeek: hours.dayOfWeek,
            startTime: hours.isClosed ? null : hours.startTime,
            endTime: hours.isClosed ? null : hours.endTime,
            isClosed: hours.isClosed ?? false,
          };
        });

        await tx.operatingHour.createMany({
          data: operatingHoursData,
        });
      }

      // Create document records using pre-uploaded files
      if (uploadedDocuments.length > 0) {
        await tx.document.createMany({
          data: uploadedDocuments.map(doc => ({
            providerId: provider.id,
            documentType: doc.documentType,
            filePath: doc.url,
          })),
        });
      }

      return provider;
    }, {
      maxWait: 10000, // Maximum time to wait for transaction to start (10s)
      timeout: 15000, // Maximum time for transaction to complete (15s)
    });

    revalidatePath("/provider/dashboard");
    revalidatePath("/provider/onboarding");

    return {
      success: true,
      data: serializeProvider(result),
      message:
        "Provider profile created successfully! Your profile is pending verification.",
    };
  } catch (error) {
    console.error("Error creating provider profile:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    // Clean up uploaded files if database transaction failed
    if (uploadedFiles.length > 0) {
      console.log("Cleaning up uploaded files due to error...");
      for (const filePath of uploadedFiles) {
        await deleteFileFromSupabase('HimsogStorage', filePath);
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create provider profile. Please try again.",
    };
  }
}

// Get provider profile by user ID
export async function getProviderProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
      include: {
        category: true,
        services: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            priceMin: true,
            priceMax: true,
            isActive: true,
          },
        },
        operatingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        documents: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!provider) {
      return { success: false, error: "Provider profile not found" };
    }

    return { success: true, data: serializeProvider(provider) };
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    return { success: false, error: "Failed to fetch provider profile" };
  }
}

// Get all verified providers with relations
export async function getAllProviders() {
  try {
    const providers = await prisma.provider.findMany({
      where: {
        status: "VERIFIED",
      },
      select: {
        id: true,
        userId: true,
        healthcareName: true,
        description: true,
        coverPhoto: true,
        phoneNumber: true,
        email: true,
        address: true,
        city: true,
        province: true,
        latitude: true,
        longitude: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          }
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
            isActive: true,
            acceptedInsurances: {
              select: {
                insuranceProvider: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            includedServices: {
              select: {
                childService: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
          take: 50, // Increased limit to show more services
        },
        operatingHours: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true, // This will now return the string "HH:mm"
            endTime: true,   // This will now return the string "HH:mm"
            isClosed: true,
          },
          orderBy: {
            dayOfWeek: "asc",
          }
        },
      },
      orderBy: [
        { healthcareName: "asc" }
      ],
    });

    // Serialize the data to handle Decimal types
    const serializedProviders = providers.map(provider => serializeProvider(provider));

    return { success: true, data: serializedProviders };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return { success: false, error: "Failed to fetch providers" };
  }
}

// Get providers with server-side filtering and pagination - OPTIMIZED for browse-services
export async function getFilteredProviders(filters?: {
  search?: string;
  categorySlug?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: {
      status: "VERIFIED";
      AND?: Array<{
        OR?: Array<{
          healthcareName?: { contains: string; mode: "insensitive" };
          address?: { contains: string; mode: "insensitive" };
          services?: { some: { name: { contains: string; mode: "insensitive" } } };
        }>;
        category?: { slug: string };
      }>;
      category?: { slug: string };
    } = {
      status: "VERIFIED",
    };

    const conditions: Array<{
      OR?: Array<{
        healthcareName?: { contains: string; mode: "insensitive" };
        address?: { contains: string; mode: "insensitive" };
        services?: { some: { name: { contains: string; mode: "insensitive" } } };
      }>;
      category?: { slug: string };
    }> = [];

    // Add search filter (server-side)
    if (filters?.search && filters.search.length >= 2) {
      conditions.push({
        OR: [
          { healthcareName: { contains: filters.search, mode: "insensitive" } },
          { address: { contains: filters.search, mode: "insensitive" } },
          { services: { some: { name: { contains: filters.search, mode: "insensitive" } } } },
        ],
      });
    }

    // Add category filter (server-side)
    if (filters?.categorySlug) {
      conditions.push({
        category: { slug: filters.categorySlug },
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Fetch providers and count in parallel
    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        select: {
          id: true,
          userId: true,
          healthcareName: true,
          description: true,
          coverPhoto: true,
          phoneNumber: true,
          email: true,
          address: true,
          city: true,
          province: true,
          latitude: true,
          longitude: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              icon: true,
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
              isActive: true,
              acceptedInsurances: {
                select: {
                  insuranceProvider: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              includedServices: {
                select: {
                  childService: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
            },
            take: 10, // Limit services per provider for list view
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
        },
        orderBy: [{ healthcareName: "asc" }],
        skip,
        take: limit,
      }),
      prisma.provider.count({ where }),
    ]);

    // Serialize the data
    const serializedProviders = providers.map((provider) => serializeProvider(provider));

    return {
      success: true,
      data: serializedProviders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + providers.length < total,
      },
    };
  } catch (error) {
    console.error("Error fetching filtered providers:", error);
    return {
      success: false,
      error: "Failed to fetch providers",
      data: [],
      pagination: null,
    };
  }
}

// Get a single provider by ID (optimized for provider details page)
export async function getProviderById(providerId: string) {
  try {
    const provider = await prisma.provider.findFirst({
      where: {
        id: providerId,
        status: "VERIFIED",
      },
      select: {
        id: true,
        userId: true,
        healthcareName: true,
        description: true,
        coverPhoto: true,
        phoneNumber: true,
        email: true,
        address: true,
        city: true,
        province: true,
        latitude: true,
        longitude: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          }
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
            isActive: true,
            acceptedInsurances: {
              select: {
                insuranceProvider: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            includedServices: {
              select: {
                childService: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
          take: 50,
        },
        operatingHours: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isClosed: true,
          },
          orderBy: {
            dayOfWeek: "asc",
          }
        },
      },
    });

    if (!provider) {
      return { success: false, error: "Provider not found" };
    }

    return { success: true, data: serializeProvider(provider) };
  } catch (error) {
    console.error("Error fetching provider by ID:", error);
    return { success: false, error: "Failed to fetch provider" };
  }
}