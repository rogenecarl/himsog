// src/schemas/category.schema.ts

import { z } from 'zod';

// ============================================================================
// BASE CATEGORY SCHEMA
// ============================================================================
export const CategorySchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  name: z.string().min(2, { message: "Category name must be at least 2 characters long" }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters long" }),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, { message: "Color must be a valid hex color (e.g., #3B82F6)" }).default("#3B82F6"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for creating a new category
export const CreateCategorySchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters long" }).max(100, { message: "Category name must be less than 100 characters" }),
  slug: z.string()
    .min(2, { message: "Slug must be at least 2 characters long" })
    .max(100, { message: "Slug must be less than 100 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be lowercase letters, numbers, and hyphens only" }),
  description: z.string().max(500, { message: "Description must be less than 500 characters" }).optional().nullable(),
  icon: z.string().max(255, { message: "Icon path must be less than 255 characters" }).optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, { message: "Color must be a valid hex color (e.g., #3B82F6)" }).default("#3B82F6"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

// Schema for updating a category
export const UpdateCategorySchema = CreateCategorySchema.partial();

// Schema for category filtering/search
export const CategoryFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'sortOrder', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CategoryFilterInput = z.infer<typeof CategoryFilterSchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { Provider } from './provider.schema';

export type CategoryWithProviders = Category & {
  providers: Provider[];
};

export type CategoryWithProviderCount = Category & {
  _count: {
    providers: number;
  };
};
