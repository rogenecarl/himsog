// src/schemas/user.schema.ts

import { z } from 'zod';

// ============================================================================
// ENUM
// ============================================================================
export const UserRoleSchema = z.enum([
  'USER',
  'ADMIN',
  'PROVIDER'
]);

// ============================================================================
// BASE USER SCHEMA
// ============================================================================
export const UserSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: UserRoleSchema.default('USER'),
  emailVerified: z.boolean().default(false),
  image: z.string().url({ message: "Please enter a valid URL for the image" }).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});


// ============================================================================
// AUTH & FORM VALIDATION SCHEMAS
// ============================================================================

// Schema for user login.
export const SignInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

// Schema for user registration.
export const SignUpUserSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
    role: UserRoleSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Point the error to the confirmPassword field
  });

// Schema for user registration.
export const SignUpProviderSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
    role: UserRoleSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Point the error to the confirmPassword field
  });


// Schema for updating a user's profile.
// .partial() makes all fields optional.
export const UpdateUserProfileSchema = UserSchema.pick({
  name: true,
  image: true,
}).partial();


// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

// The core User type, without any relations.
export type User = z.infer<typeof UserSchema>;

// The type for the login form/API input.
export type LoginInput = z.infer<typeof SignInSchema>;

// The type for the registration form/API input.
export type RegisterProviderInput = z.infer<typeof SignUpProviderSchema>;

// The type for the registration form/API input.
export type RegisterUserInput = z.infer<typeof SignUpUserSchema>;

// The type for updating a user profile.
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

// ============================================================================
// FORGOT/RESET PASSWORD SCHEMAS
// ============================================================================

// Schema for forgot password form (email only)
export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

// Schema for reset password form
export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Types for forgot/reset password
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ============================================================================
// PROFILE UPDATE SCHEMAS
// ============================================================================

// Schema for updating user name
export const UpdateProfileNameSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
});

// Schema for changing password
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters long" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Types for profile updates
export type UpdateProfileNameInput = z.infer<typeof UpdateProfileNameSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// ============================================================================
// RELATIONAL TYPES (for fetching with Prisma include)
// ============================================================================

import type { Provider } from './provider.schema';
import type { Appointment } from './appointment.schema';
import type { Notification } from './notification.schema';

export type UserWithProvider = User & {
  provider: Provider | null;
};

export type UserWithAppointments = User & {
  appointments: Appointment[];
};

export type UserWithNotifications = User & {
  notifications: Notification[];
};

export type UserProfile = User & {
  provider: Provider | null;
  _count: {
    appointments: number;
    notifications: number;
  };
};