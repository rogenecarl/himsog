// ============================================================================
// AUDIT ACTION CONSTANTS
// ============================================================================
// This file contains constants and types for audit logging
// Separated from audit-actions.ts because "use server" files can only export async functions

export const AUDIT_ACTIONS = {
  // Provider actions
  PROVIDER_STATUS_CHANGED: "PROVIDER_STATUS_CHANGED",
  PROVIDER_DOCUMENT_VERIFIED: "PROVIDER_DOCUMENT_VERIFIED",
  PROVIDER_DOCUMENT_REJECTED: "PROVIDER_DOCUMENT_REJECTED",

  // User actions
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_REACTIVATED: "USER_REACTIVATED",
  USER_DELETED: "USER_DELETED",

  // Category actions
  CATEGORY_CREATED: "CATEGORY_CREATED",
  CATEGORY_UPDATED: "CATEGORY_UPDATED",
  CATEGORY_DELETED: "CATEGORY_DELETED",
  CATEGORY_STATUS_TOGGLED: "CATEGORY_STATUS_TOGGLED",

  // Settings actions
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditTargetType = "Provider" | "User" | "Category" | "Document" | "Settings";

export interface CreateAuditLogParams {
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  action?: AuditAction;
  targetType?: string;
  adminId?: string;
  startDate?: Date;
  endDate?: Date;
}
