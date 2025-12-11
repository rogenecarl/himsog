// src/schemas/document.schema.ts

import { z } from 'zod';

// ============================================================================
// BASE DOCUMENT SCHEMA
// ============================================================================
export const DocumentSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  documentType: z.string().min(1, { message: "Document type is required" }),
  filePath: z.string().url({ message: "Please enter a valid URL for the file path" }),
  verifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for uploading a document
export const UploadDocumentSchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  documentType: z.enum([
    'BUSINESS_PERMIT',
    'PROFESSIONAL_LICENSE',
    'MEDICAL_LICENSE',
    'DTI_REGISTRATION',
    'BARANGAY_CLEARANCE',
    'VALID_ID',
    'OTHER'
  ], { message: "Invalid document type" }),
  filePath: z.string()
    .url({ message: "Please enter a valid URL for the file path" })
    .or(z.string().min(1, { message: "File path is required" })),
});

// Schema for verifying a document
export const VerifyDocumentSchema = z.object({
  documentId: z.string().uuid({ message: "Invalid document UUID" }),
});

// Schema for document filtering
export const DocumentFilterSchema = z.object({
  providerId: z.string().uuid().optional(),
  documentType: z.string().optional(),
  isVerified: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'verifiedAt', 'documentType']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Document = z.infer<typeof DocumentSchema>;
export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;
export type VerifyDocumentInput = z.infer<typeof VerifyDocumentSchema>;
export type DocumentFilterInput = z.infer<typeof DocumentFilterSchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { Provider } from './provider.schema';

export type DocumentWithProvider = Document & {
  provider: Pick<Provider, 'id' | 'healthcareName' | 'status'>;
};
