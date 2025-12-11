import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
// Use Resend's test email for development, or set RESEND_FROM_EMAIL to your verified domain email
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";