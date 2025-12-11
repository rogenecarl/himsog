import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware, emailOTP } from "better-auth/plugins";
import prisma from "./prisma";
import { getResetPasswordEmailHtml, getOTPVerificationEmailHtml } from "./email-template";
import { FROM_EMAIL, resend } from "./resend";
import { VALID_EMAIL_DOMAINS } from "./utils";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string", // Maps your Prisma Enum to a string in the session
        required: false,
        input: false, // Prevents users from passing 'role' during API calls like signUp
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {

        const eamilHtml = getResetPasswordEmailHtml(user.email, url);
        //send the email using resend
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Reset your password",
          html: eamilHtml,
        })

        if (error) {
          console.error("Error sending reset password email:", error);
          throw new Error("Failed to send reset password email");
        }

        console.log("Reset password email sent successfully to:", user.email);
        console.log("email id", data?.id);


        //In development, also log the url for easy testing
        if (process.env.NODE_ENV === "development") {
          console.log(`Reset Password URL (development only):`, url);
        }

      } catch (error) {
        console.error("Error in sendResetPassword:", error);
        throw error;
      }
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  rateLimit: {
    enabled: true, // Enable rate limiting (disabled by default in development)
    window: 60, // time window in seconds
    max: 100, // Increased default for general API calls
    customRules: {
      // Allow frequent session checks (needed for client-side auth)
      "/get-session": {
        window: 60,
        max: 20, // Allow 20 session checks per minute (for navigation)
      },
      // Rate limit for sign-in to prevent brute force and credential stuffing attacks
      "/sign-in/email": {
        window: 300, // 5 minutes
        max: 5, // max 5 login attempts per 5 minutes
      },
      // Rate limit for user and provider signup to prevent spam and abuse
      "/sign-up/email": {
        window: 300, // 5 minutes
        max: 5, // max 5 signup attempts per 5 minutes
      },
      // Stricter rate limit for forgot password to prevent email enumeration and spam
      "/forget-password": {
        window: 300, // 5 minutes
        max: 3, // max 3 requests per 5 minutes
      },
      // Also limit reset password attempts
      "/reset-password": {
        window: 300, // 5 minutes
        max: 5, // max 5 attempts per 5 minutes
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // use the valid email domains from when registering users
      if (ctx.path === "/sign-up/email") {
        const email = String(ctx.body?.email)
        const domain = email.split("@")[1];

        if (!VALID_EMAIL_DOMAINS().includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid email address. Please use a valid email address.",
          })
        }
      }
    }),
  },
  plugins: [
    nextCookies(),
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      sendVerificationOnSignUp: true, // Automatically send OTP after signup
      async sendVerificationOTP({ email, otp, type }) {
        try {
          const emailHtml = getOTPVerificationEmailHtml(email, otp, type);
          const subject = type === "email-verification"
            ? "Verify your email address"
            : type === "sign-in"
              ? "Your sign-in code"
              : "Your password reset code";

          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject,
            html: emailHtml,
          });

          if (error) {
            console.error("Error sending OTP email:", error);
            throw new Error("Failed to send verification email");
          }

          console.log(`OTP email sent successfully to: ${email} (type: ${type})`);

          // In development, log the OTP for testing
          if (process.env.NODE_ENV === "development") {
            console.log(`OTP Code (development only): ${otp}`);
          }
        } catch (error) {
          console.error("Error in sendVerificationOTP:", error);
          throw error;
        }
      },
    }),
  ],
});
