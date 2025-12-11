import { z } from "zod";

export const CreateUserAppointmentFormSchema = z.object({
  // Provider and appointment details
  providerId: z.string().min(1, "Provider ID is required"),
  
  // Selected services
  selectedServices: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().min(0),
  })).min(1, "At least one service must be selected"),
  
  // Date and time
  selectedDate: z.date({
    message: "Appointment date is required",
  }).nullable(),
  selectedTime: z.string().min(1, "Appointment time is required"),
  
  // Patient information
  patientName: z.string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  
  patientEmail: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(100, "Email cannot exceed 100 characters"),
  
  patientPhone: z.string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Phone number must be at least 10 characters if provided",
    }),
  
  // Calculated fields
  totalPrice: z.number().min(0, "Total price must be positive"),
  
  // Optional notes
  notes: z.string().optional(),
});

export type CreateUserAppointmentFormType = z.infer<typeof CreateUserAppointmentFormSchema>;

// Schema for step 1 (service selection)
export const AppointmentStep1Schema = CreateUserAppointmentFormSchema.pick({
  providerId: true,
  selectedServices: true,
  totalPrice: true,
});

export type AppointmentStep1Type = z.infer<typeof AppointmentStep1Schema>;

// Schema for step 2 (date and time selection)
export const AppointmentStep2Schema = CreateUserAppointmentFormSchema.pick({
  selectedDate: true,
  selectedTime: true,
});

export type AppointmentStep2Type = z.infer<typeof AppointmentStep2Schema>;

// Schema for step 3 (patient information and confirmation)
export const AppointmentStep3Schema = CreateUserAppointmentFormSchema.pick({
  patientName: true,
  patientEmail: true,
  patientPhone: true,
  notes: true,
});

export type AppointmentStep3Type = z.infer<typeof AppointmentStep3Schema>;

// Schema for final appointment creation (all fields required)
export const CreateAppointmentSchema = CreateUserAppointmentFormSchema.extend({
  selectedDate: z.date({
    message: "Appointment date is required",
  }), // Remove nullable for final creation
});

export type CreateAppointmentType = z.infer<typeof CreateAppointmentSchema>;