// src/schemas/appointment.schema.ts

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================
export const AppointmentStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
]);

// ============================================================================
// BASE APPOINTMENT SCHEMA
// ============================================================================
export const AppointmentSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  appointmentNumber: z.string(),
  userId: z.string().uuid({ message: "Invalid user UUID" }),
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  startTime: z.date(),
  endTime: z.date(),
  status: AppointmentStatusSchema.default('PENDING'),
  notes: z.string().nullable(),
  totalPrice: z.number().min(0, { message: "Total price must be 0 or greater" }),
  
  // Patient information
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters long" }),
  patientEmail: z.string().email({ message: "Please enter a valid email address" }),
  patientPhone: z.string().nullable(),
  
  // Cancellation tracking
  cancelledAt: z.date().nullable(),
  cancellationReason: z.string().nullable(),
  cancelledBy: z.string().uuid().nullable(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for creating a new appointment
export const CreateAppointmentSchema = z.object({
  providerId: z.string().uuid({ message: "Please select a valid provider" }),
  startTime: z.coerce.date({ message: "Start time is required" }),
  endTime: z.coerce.date({ message: "End time is required" }),
  notes: z.string()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional()
    .nullable(),
  
  // Patient information
  patientName: z.string()
    .min(2, { message: "Patient name must be at least 2 characters long" })
    .max(100, { message: "Patient name must be less than 100 characters" }),
  patientEmail: z.string().email({ message: "Please enter a valid email address" }),
  patientPhone: z.string()
    .regex(/^(\+?\d{1,3}[- ]?)?\d{10,}$/, { message: "Please enter a valid phone number" })
    .optional()
    .nullable(),
  
  // Selected services
  serviceIds: z.array(z.string().uuid()).min(1, { message: "At least one service must be selected" }),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Schema for updating an appointment
export const UpdateAppointmentSchema = z.object({
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  status: AppointmentStatusSchema.optional(),
  notes: z.string()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional()
    .nullable(),
  patientName: z.string()
    .min(2, { message: "Patient name must be at least 2 characters long" })
    .max(100, { message: "Patient name must be less than 100 characters" })
    .optional(),
  patientEmail: z.string().email({ message: "Please enter a valid email address" }).optional(),
  patientPhone: z.string()
    .regex(/^(\+?\d{1,3}[- ]?)?\d{10,}$/, { message: "Please enter a valid phone number" })
    .optional()
    .nullable(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Schema for cancelling an appointment
export const CancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid({ message: "Invalid appointment UUID" }),
  cancellationReason: z.string()
    .min(10, { message: "Cancellation reason must be at least 10 characters long" })
    .max(500, { message: "Cancellation reason must be less than 500 characters" }),
});

// Schema for confirming an appointment
export const ConfirmAppointmentSchema = z.object({
  appointmentId: z.string().uuid({ message: "Invalid appointment UUID" }),
});

// Schema for appointment filtering/search
export const AppointmentFilterSchema = z.object({
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  status: AppointmentStatusSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.enum(['startTime', 'createdAt', 'status', 'appointmentNumber']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Schema for checking appointment availability
export const CheckAvailabilitySchema = z.object({
  providerId: z.string().uuid({ message: "Invalid provider UUID" }),
  date: z.coerce.date({ message: "Date is required" }),
  duration: z.number().int().positive().min(5).max(180).optional(),
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type Appointment = z.infer<typeof AppointmentSchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;
export type ConfirmAppointmentInput = z.infer<typeof ConfirmAppointmentSchema>;
export type AppointmentFilterInput = z.infer<typeof AppointmentFilterSchema>;
export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilitySchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { User } from './user.schema';
import type { Provider } from './provider.schema';
import type { Service } from './service.schema';

export type AppointmentService = {
  service: Service;
  priceAtBooking: number;
};

export type AppointmentWithUser = Appointment & {
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
};

export type AppointmentWithProvider = Appointment & {
  provider: Pick<Provider, 'id' | 'healthcareName' | 'address' | 'city' | 'phoneNumber' | 'email'>;
};

export type AppointmentWithServices = Appointment & {
  services: AppointmentService[];
};

// Complete appointment with all relations
export type AppointmentWithRelations = Appointment & {
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  provider: Pick<Provider, 'id' | 'healthcareName' | 'address' | 'city' | 'phoneNumber' | 'email' | 'coverPhoto'>;
  services: AppointmentService[];
  canceller: Pick<User, 'id' | 'name'> | null;
};

// For appointment cards/lists
export type AppointmentListItem = Appointment & {
  provider: Pick<Provider, 'id' | 'healthcareName' | 'city' | 'coverPhoto'>;
  services: Pick<Service, 'id' | 'name'>[];
};
