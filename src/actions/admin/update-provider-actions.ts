"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "../auth/auth-check-utils";
import { revalidatePath } from "next/cache";
import { ProviderStatus } from "@/lib/generated/prisma";
import { createAuditLog } from "./audit-actions";
import { AUDIT_ACTIONS } from "./audit-constants";
import { resend, FROM_EMAIL } from "@/lib/resend";
import {
  getProviderStatusEmailHtml,
  type ProviderStatusEmailType,
} from "@/lib/email-template";

// ============================================================================
// TYPES
// ============================================================================

export interface ProviderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProviderStatus | "ALL";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProviderListResponse {
  providers: Array<{
    id: string;
    healthcareName: string;
    status: ProviderStatus;
    phoneNumber: string | null;
    email: string | null;
    city: string;
    province: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    _count: {
      services: number;
      documents: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusCounts: {
    all: number;
    pending: number;
    verified: number;
    suspended: number;
    rejected: number;
  };
}

// ============================================================================
// GET ALL PROVIDERS (with server-side pagination)
// ============================================================================

export async function getAllProviders(params: ProviderQueryParams = {}) {
  try {
    await requireAdmin();

    const {
      page = 1,
      limit = 10,
      search,
      status = "ALL",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build where clause
    const where = {
      ...(search && {
        OR: [
          { healthcareName: { contains: search, mode: "insensitive" as const } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status !== "ALL" && { status }),
    };

    // Fetch providers with pagination and status counts in parallel
    const [providers, total, statusCounts] = await Promise.all([
      prisma.provider.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          healthcareName: true,
          status: true,
          phoneNumber: true,
          email: true,
          city: true,
          province: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              services: true,
              documents: true,
            },
          },
        },
      }),
      prisma.provider.count({ where }),
      // Get status counts (without search filter for accurate totals)
      prisma.provider.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Process status counts
    const counts = {
      all: 0,
      pending: 0,
      verified: 0,
      suspended: 0,
      rejected: 0,
    };

    statusCounts.forEach((item) => {
      counts.all += item._count;
      const statusKey = item.status.toLowerCase() as keyof typeof counts;
      if (statusKey in counts) {
        counts[statusKey] = item._count;
      }
    });

    return {
      success: true,
      data: {
        providers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statusCounts: counts,
      } as ProviderListResponse,
    };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return {
      success: false,
      error: "Failed to fetch providers",
    };
  }
}

// ============================================================================
// GET PROVIDER BY ID (optimized - no appointment data)
// ============================================================================

export async function getProviderById(providerId: string) {
  try {
    await requireAdmin();

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        category: true,
        services: {
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
        documents: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            documentType: true,
            filePath: true,
            verificationStatus: true,
            verifiedAt: true,
            verifiedById: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            services: true,
            documents: true,
          },
        },
      },
    });

    if (!provider) {
      return {
        success: false,
        error: "Provider not found",
      };
    }

    // Serialize Decimal fields
    const serializedProvider = {
      ...provider,
      latitude: provider.latitude ? Number(provider.latitude) : null,
      longitude: provider.longitude ? Number(provider.longitude) : null,
      services: provider.services.map((service) => ({
        ...service,
        priceMin: Number(service.priceMin),
        priceMax: Number(service.priceMax),
      })),
    };

    return {
      success: true,
      data: serializedProvider,
    };
  } catch (error) {
    console.error("Error fetching provider:", error);
    return {
      success: false,
      error: "Failed to fetch provider details",
    };
  }
}

// ============================================================================
// UPDATE PROVIDER STATUS
// ============================================================================

export async function updateProviderStatus(
  providerId: string,
  status: ProviderStatus,
  reason?: string,
  sendNotification: boolean = true
) {
  try {
    const admin = await requireAdmin();

    const currentProvider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        status: true,
        userId: true,
        healthcareName: true,
      },
    });

    if (!currentProvider) {
      return { success: false, error: "Provider not found" };
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        status,
        verifiedBy: status === "VERIFIED" ? admin.id : null,
        verifiedAt: status === "VERIFIED" ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create status history record
    await prisma.providerStatusHistory.create({
      data: {
        providerId,
        fromStatus: currentProvider.status,
        toStatus: status,
        reason: reason || null,
        changedById: admin.id,
      },
    });

    // Create audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.PROVIDER_STATUS_CHANGED,
      targetType: "Provider",
      targetId: providerId,
      oldValue: { status: currentProvider.status },
      newValue: { status, reason },
      metadata: { providerName: currentProvider.healthcareName },
    });

    // Send notification to provider if enabled
    if (sendNotification) {
      // Create in-app notification
      await createProviderNotification(
        currentProvider.userId,
        status,
        reason,
        providerId
      );

      // Send email notification
      await sendProviderStatusEmail({
        email: updatedProvider.user.email,
        providerName: updatedProvider.user.name || "Provider",
        healthcareName: updatedProvider.healthcareName,
        status,
        reason,
      });
    }

    revalidatePath("/admin/providers");
    revalidatePath(`/admin/providers/${providerId}`);
    revalidatePath("/admin/dashboard");

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
      message: `Provider status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating provider status:", error);
    return {
      success: false,
      error: "Failed to update provider status",
    };
  }
}

// ============================================================================
// UPDATE DOCUMENT VERIFICATION STATUS
// ============================================================================

export async function updateDocumentStatus(
  documentId: string,
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED",
  reason?: string
) {
  try {
    const admin = await requireAdmin();

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        provider: {
          select: {
            id: true,
            healthcareName: true,
            userId: true,
          },
        },
      },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        verificationStatus,
        verifiedAt: verificationStatus === "VERIFIED" ? new Date() : null,
        verifiedById: verificationStatus === "VERIFIED" ? admin.id : null,
      },
    });

    // Create audit log
    await createAuditLog({
      action: verificationStatus === "VERIFIED"
        ? AUDIT_ACTIONS.PROVIDER_DOCUMENT_VERIFIED
        : AUDIT_ACTIONS.PROVIDER_DOCUMENT_REJECTED,
      targetType: "Document",
      targetId: documentId,
      oldValue: { status: document.verificationStatus },
      newValue: { status: verificationStatus, reason },
      metadata: {
        documentType: document.documentType,
        providerName: document.provider?.healthcareName,
      },
    });

    revalidatePath("/admin/providers");

    return {
      success: true,
      data: updatedDocument,
      message: `Document ${verificationStatus.toLowerCase()}`,
    };
  } catch (error) {
    console.error("Error updating document status:", error);
    return {
      success: false,
      error: "Failed to update document status",
    };
  }
}

// ============================================================================
// HELPER: CREATE PROVIDER NOTIFICATION
// ============================================================================

async function createProviderNotification(
  userId: string,
  status: ProviderStatus,
  reason?: string,
  providerId?: string
) {
  const notificationMap: Record<
    ProviderStatus,
    {
      type:
        | "PROVIDER_VERIFIED"
        | "PROVIDER_REJECTED"
        | "PROVIDER_SUSPENDED"
        | "PROVIDER_REACTIVATED";
      title: string;
      message: string;
    }
  > = {
    VERIFIED: {
      type: "PROVIDER_VERIFIED",
      title: "Account Verified",
      message:
        "Congratulations! Your provider account has been verified. You can now receive appointments.",
    },
    REJECTED: {
      type: "PROVIDER_REJECTED",
      title: "Application Rejected",
      message: `Your provider application has been rejected.${reason ? ` Reason: ${reason}` : " Please contact support for more information."}`,
    },
    SUSPENDED: {
      type: "PROVIDER_SUSPENDED",
      title: "Account Suspended",
      message: `Your provider account has been suspended.${reason ? ` Reason: ${reason}` : " Please contact support for more information."}`,
    },
    PENDING: {
      type: "PROVIDER_REACTIVATED",
      title: "Status Updated",
      message:
        "Your provider account status has been updated to pending review.",
    },
  };

  const notification = notificationMap[status];

  try {
    await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        providerId: providerId || null,
        metadata: reason ? { reason } : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create provider notification:", error);
  }
}

// ============================================================================
// HELPER: SEND PROVIDER STATUS EMAIL
// ============================================================================

interface SendProviderStatusEmailParams {
  email: string;
  providerName: string;
  healthcareName: string;
  status: ProviderStatus;
  reason?: string;
}

async function sendProviderStatusEmail(params: SendProviderStatusEmailParams) {
  const { email, providerName, healthcareName, status, reason } = params;

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/provider/dashboard`;

  const subjectMap: Record<ProviderStatus, string> = {
    VERIFIED: "Your Provider Account Has Been Verified!",
    REJECTED: "Update on Your Provider Application",
    SUSPENDED: "Important: Your Provider Account Has Been Suspended",
    PENDING: "Your Provider Account Status Has Been Updated",
  };

  const emailHtml = getProviderStatusEmailHtml({
    providerName,
    healthcareName,
    status: status as ProviderStatusEmailType,
    reason,
    dashboardUrl,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: subjectMap[status],
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending provider status email:", error);
      return { success: false, error };
    }

    console.log(`Provider status email sent successfully to ${email}`, data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send provider status email:", error);
    return { success: false, error };
  }
}

// ============================================================================
// GET PROVIDER STATUS HISTORY
// ============================================================================

export async function getProviderStatusHistory(providerId: string) {
  try {
    await requireAdmin();

    const history = await prisma.providerStatusHistory.findMany({
      where: { providerId },
      orderBy: { createdAt: "desc" },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching provider status history:", error);
    return { success: false, error: "Failed to fetch status history" };
  }
}
