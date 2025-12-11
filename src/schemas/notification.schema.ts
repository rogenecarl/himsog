// src/schemas/notification.schema.ts

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================
export const NotificationTypeSchema = z.enum([
  'APPOINTMENT_CREATED',
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_CANCELLED',
  'APPOINTMENT_REMINDER',
  'PROVIDER_VERIFIED',
  'PROVIDER_REJECTED'
]);

// ============================================================================
// BASE NOTIFICATION SCHEMA
// ============================================================================
export const NotificationSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  userId: z.string().uuid({ message: "Invalid user UUID" }),
  type: NotificationTypeSchema,
  title: z.string().min(1, { message: "Title is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  isRead: z.boolean().default(false),
  appointmentId: z.string().uuid().nullable(),
  providerId: z.string().uuid().nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for creating a notification
export const CreateNotificationSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user UUID" }),
  type: NotificationTypeSchema,
  title: z.string()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be less than 200 characters" }),
  message: z.string()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
  appointmentId: z.string().uuid().optional().nullable(),
  providerId: z.string().uuid().optional().nullable(),
});

// Schema for marking notification as read
export const MarkNotificationReadSchema = z.object({
  notificationId: z.string().uuid({ message: "Invalid notification UUID" }),
});

// Schema for bulk marking notifications as read
export const BulkMarkNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, { message: "At least one notification ID is required" }),
});

// Schema for notification filtering
export const NotificationFilterSchema = z.object({
  userId: z.string().uuid().optional(),
  type: NotificationTypeSchema.optional(),
  isRead: z.boolean().optional(),
  appointmentId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.enum(['createdAt', 'readAt', 'type']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadSchema>;
export type BulkMarkNotificationsReadInput = z.infer<typeof BulkMarkNotificationsReadSchema>;
export type NotificationFilterInput = z.infer<typeof NotificationFilterSchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { Appointment } from './appointment.schema';
import type { Provider } from './provider.schema';

export type NotificationWithAppointment = Notification & {
  appointment: Pick<Appointment, 'id' | 'appointmentNumber' | 'startTime' | 'status'> | null;
};

export type NotificationWithProvider = Notification & {
  provider: Pick<Provider, 'id' | 'healthcareName' | 'coverPhoto'> | null;
};

export type NotificationWithRelations = Notification & {
  appointment: Pick<Appointment, 'id' | 'appointmentNumber' | 'startTime' | 'status'> | null;
  provider: Pick<Provider, 'id' | 'healthcareName' | 'coverPhoto'> | null;
};
