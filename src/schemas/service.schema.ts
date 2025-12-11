// src/schemas/service.schema.ts

import { z } from 'zod';

// ============================================================================
// BASE SERVICE SCHEMA
// ============================================================================
export const ServiceSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  name: z.string().min(2, { message: "Service name must be at least 2 characters long" }),
  description: z.string().nullable(),
  priceMin: z.number().int().min(0, { message: "Minimum price must be 0 or greater" }).default(0),
  priceMax: z.number().int().min(0, { message: "Maximum price must be 0 or greater" }).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for creating a new service
export const CreateServiceSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  name: z.string()
    .min(2, { message: "Service name must be at least 2 characters long" })
    .max(200, { message: "Service name must be less than 200 characters" }),
  description: z.string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional()
    .nullable(),
  priceMin: z.number().int().min(0, { message: "Minimum price must be 0 or greater" }).default(0),
  priceMax: z.number().int().min(0, { message: "Maximum price must be 0 or greater" }).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
}).refine((data) => data.priceMax >= data.priceMin, {
  message: "Maximum price must be greater than or equal to minimum price",
  path: ["priceMax"],
});

// Schema for updating a service
export const UpdateServiceSchema = z.object({
  name: z.string()
    .min(2, { message: "Service name must be at least 2 characters long" })
    .max(200, { message: "Service name must be less than 200 characters" })
    .optional(),
  description: z.string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional()
    .nullable(),
  priceMin: z.number().int().min(0, { message: "Minimum price must be 0 or greater" }).optional(),
  priceMax: z.number().int().min(0, { message: "Maximum price must be 0 or greater" }).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.priceMin !== undefined && data.priceMax !== undefined) {
    return data.priceMax >= data.priceMin;
  }
  return true;
}, {
  message: "Maximum price must be greater than or equal to minimum price",
  path: ["priceMax"],
});

// Schema for service filtering/search
export const ServiceFilterSchema = z.object({
  search: z.string().optional(),
  providerId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  priceMin: z.number().int().min(0).optional(),
  priceMax: z.number().int().min(0).optional(),
  sortBy: z.enum(['name', 'priceMin', 'priceMax', 'createdAt', 'sortOrder']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Schema for bulk service operations
export const BulkServiceUpdateSchema = z.object({
  serviceIds: z.array(z.string().uuid()).min(1, { message: "At least one service ID is required" }),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Service = z.infer<typeof ServiceSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
export type ServiceFilterInput = z.infer<typeof ServiceFilterSchema>;
export type BulkServiceUpdateInput = z.infer<typeof BulkServiceUpdateSchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { Provider } from './provider.schema';

export type ServiceWithProvider = Service & {
  provider: Pick<Provider, 'id' | 'healthcareName' | 'status' | 'city'>;
};

export type ServiceWithAppointmentCount = Service & {
  _count: {
    appointments: number;
  };
};
