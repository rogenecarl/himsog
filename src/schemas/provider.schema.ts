// src/schemas/provider.schema.ts

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================
export const ProviderStatusSchema = z.enum([
  'PENDING',
  'VERIFIED',
  'SUSPENDED',
  'REJECTED'
]);

export enum DocumentType {
  TAX_DOCUMENT = 'TAX_DOCUMENT',
  BIR_DOCUMENT = 'BIR_DOCUMENT',
  BUSINESS_PERMIT = 'BUSINESS_PERMIT',
  PROFESSIONAL_LICENSE = 'PROFESSIONAL_LICENSE',
  MEDICAL_LICENSE = 'MEDICAL_LICENSE',
  DTI_REGISTRATION = 'DTI_REGISTRATION',
  BARANGAY_CLEARANCE = 'BARANGAY_CLEARANCE',
  VALID_ID = 'VALID_ID',
  OTHER = 'OTHER'
}

export const DocumentTypeSchema = z.nativeEnum(DocumentType);

// ============================================================================
// BASE PROVIDER SCHEMA
// ============================================================================
export const ProviderSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  userId: z.string().uuid({ message: "Invalid user UUID" }),
  categoryId: z.string().uuid({ message: "Invalid category UUID" }).nullable(),
  verifiedBy: z.string().uuid({ message: "Invalid verifier UUID" }).nullable(),
  healthcareName: z.string().min(2, { message: "Healthcare name must be at least 2 characters long" }),
  description: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  email: z.string().email({ message: "Please enter a valid email address" }).nullable(),
  coverPhoto: z.string().url({ message: "Please enter a valid URL for cover photo" }).nullable(),
  status: ProviderStatusSchema.default('PENDING'),
  
  // Location
  address: z.string().min(5, { message: "Address must be at least 5 characters long" }),
  city: z.string().default("Digos"),
  province: z.string().default("Davao del Sur"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  
  // Scheduling
  slotDuration: z.number().int().positive().default(30),
  
  // Verification
  verifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Nested schemas for creating provider with relations
const CreateProviderServiceSchema = z.object({
  name: z.string().min(1, { message: "Service name is required" }).max(255),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['SINGLE', 'PACKAGE']).default('SINGLE'),
  pricingModel: z.enum(['FIXED', 'RANGE', 'INQUIRE']).default('FIXED'),
  fixedPrice: z.number().int().min(0, { message: "Fixed price must be 0 or greater" }).default(0),
  priceMin: z.number().int().min(0, { message: "Minimum price must be 0 or greater" }).default(0),
  priceMax: z.number().int().min(0, { message: "Maximum price must be 0 or greater" }).default(0),
  acceptedInsurances: z.array(z.string().uuid()).default([]),
  includedServices: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

const CreateProviderOperatingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, { message: "Day of week must be between 0 (Sunday) and 6 (Saturday)" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Start time must be in HH:MM format" }).nullable(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "End time must be in HH:MM format" }).nullable(),
  isClosed: z.boolean().default(false),
});

const CreateProviderDocumentSchema = z.object({
  documentType: DocumentTypeSchema,
  filePath: z.any()
    .refine((file) => file?.size <= 3 * 1024 * 1024, `Max file size is 3MB.`)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/svg+xml", "image/webp", "application/pdf"].includes(file?.type),
      "Only .jpg, .jpeg, .png, .gif, .svg, .webp and .pdf formats are supported."
    ),
});

// Schema for creating a new provider
export const CreateProviderSchema = z.object({
  categoryId: z.string().uuid({ message: "Please select a valid category" }).optional().nullable(),
  healthcareName: z.string()
    .min(2, { message: "Healthcare name must be at least 2 characters long" })
    .max(200, { message: "Healthcare name must be less than 200 characters" }),
  description: z.string()
    .min(1, { message: "Description is required" })
    .max(1000, { message: "Description must be less than 1000 characters" }),
  phoneNumber: z.string()
    .min(1, { message: "Phone number is required" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^(\+?\d{1,3}[- ]?)?\d{10,}$/, { message: "Please enter a valid phone number" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" })
    .max(255),
  coverPhoto: z.any()
    .refine((file) => !file || file?.size <= 2048 * 1024, `Max image size is 2MB.`)
    .refine(
      (file) => !file || ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/svg+xml", "image/webp"].includes(file?.type),
      "Only .jpg, .jpeg, .png, .gif, .svg and .webp formats are supported."
    )
    .nullable()
    .optional(),
  
  // Location
  address: z.string().min(1, { message: "Address is required" }).max(255),
  city: z.string().min(1, { message: "City is required" }).max(100).default("Digos"),
  province: z.string().min(1, { message: "Province is required" }).max(100).default("Davao del Sur"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  
  // Scheduling
  slotDuration: z.number().int().positive().min(5).max(180).default(30),
  
  // Nested relations
  services: z.array(CreateProviderServiceSchema).min(1, { message: "At least one service is required" }).optional(),
  operatingHours: z.array(CreateProviderOperatingHourSchema).length(7, { message: "Operating hours for all 7 days are required" }).optional(),
  documents: z.array(CreateProviderDocumentSchema).min(1, { message: "At least one document is required" }).optional(),
}).refine((data) => {
  if (data.services) {
    for (const service of data.services) {
      if (service.priceMax < service.priceMin) {
        return false;
      }
    }
  }
  return true;
}, {
  message: "Maximum price must be greater than or equal to minimum price for all services",
  path: ["services"],
}).refine((data) => {
  if (data.operatingHours) {
    for (const hours of data.operatingHours) {
      if (!hours.isClosed && hours.startTime && hours.endTime) {
        const [startHour, startMin] = hours.startTime.split(':').map(Number);
        const [endHour, endMin] = hours.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (endMinutes <= startMinutes) {
          return false;
        }
      }
    }
  }
  return true;
}, {
  message: "End time must be after start time for all operating hours",
  path: ["operatingHours"],
});

// Schema for updating a provider
export const UpdateProviderSchema = CreateProviderSchema.partial();

// Schema for provider verification
export const VerifyProviderSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  status: z.enum(['VERIFIED', 'REJECTED'], { message: "Status must be either VERIFIED or REJECTED" }),
  rejectionReason: z.string().min(10, { message: "Rejection reason must be at least 10 characters long" }).optional(),
});

// Schema for provider filtering/search
export const ProviderFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  status: ProviderStatusSchema.optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  sortBy: z.enum(['healthcareName', 'createdAt', 'verifiedAt', 'city']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Schema for location-based search
export const ProviderLocationSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().positive().max(100).default(10),
  categoryId: z.string().uuid().optional(),
  status: ProviderStatusSchema.optional(),
  limit: z.number().int().positive().max(50).optional(),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Provider = z.infer<typeof ProviderSchema>;
export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
export type CreateProviderInput = z.infer<typeof CreateProviderSchema>;
export type UpdateProviderInput = z.infer<typeof UpdateProviderSchema>;
export type VerifyProviderInput = z.infer<typeof VerifyProviderSchema>;
export type ProviderFilterInput = z.infer<typeof ProviderFilterSchema>;
export type ProviderLocationSearchInput = z.infer<typeof ProviderLocationSearchSchema>;

// Nested input types
export type CreateProviderServiceInput = z.infer<typeof CreateProviderServiceSchema>;
export type CreateProviderOperatingHourInput = z.infer<typeof CreateProviderOperatingHourSchema>;
export type CreateProviderDocumentInput = z.infer<typeof CreateProviderDocumentSchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { User } from './user.schema';
import type { Category } from './category.schema';
import type { Service } from './service.schema';
import type { OperatingHour, BreakTime } from './scheduling.schema';
import type { Document } from './document.schema';

export type ProviderWithUser = Provider & {
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
};

export type ProviderWithCategory = Provider & {
  category: Category | null;
};

export type ProviderWithServices = Provider & {
  services: Service[];
};

export type ProviderWithSchedule = Provider & {
  operatingHours: OperatingHour[];
  breakTimes: BreakTime[];
};

export type ProviderWithDocuments = Provider & {
  documents: Document[];
};

// Complete provider with all relations
export type ProviderWithRelations = Provider & {
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  category: Category | null;
  services: Service[];
  operatingHours: OperatingHour[];
  breakTimes: BreakTime[];
  documents: Document[];
  verifier: Pick<User, 'id' | 'name'> | null;
};

// For listing providers (optimized)
export type ProviderListItem = Provider & {
  user: Pick<User, 'id' | 'name' | 'image'>;
  category: Pick<Category, 'id' | 'name' | 'slug' | 'icon' | 'color'> | null;
  _count: {
    services: number;
    appointments: number;
  };
};
