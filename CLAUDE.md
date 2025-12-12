# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Healthcare geolocation platform (Himsog) built with Next.js 16, Prisma, and Better Auth. Enables users to find healthcare providers, book appointments, and communicate via messaging. Providers can manage services, schedules, and view analytics. Admins verify providers and manage categories.

**Deployment:** Azure App Service + Azure PostgreSQL Flexible Server + Supabase (storage/realtime only)

## Commands

```bash
# Development
bun dev                    # Start dev server (localhost:3000)
bun build                  # Production build
bun lint                   # Run ESLint

# Database
bunx prisma studio         # Database GUI
bunx prisma migrate dev    # Run migrations
bunx prisma generate       # Generate Prisma client (output: src/lib/generated/prisma)

# Seeding
bun run seed:providers-v2  # Seed provider data
bun run seed:bookings      # Seed booking data
bun run seed:insurance     # Seed insurance providers
bun run seed:analytics     # Seed analytics data
```

## Tech Stack

- **Framework:** Next.js 16 (App Router + Server Actions)
- **Database:** PostgreSQL (Azure) with Prisma
- **Auth:** Better Auth (email/password + Google OAuth)
- **State:** Zustand (persistent stores) + React Query (async data)
- **UI:** shadcn/ui + Tailwind CSS 4 + Framer Motion
- **Forms:** React Hook Form + Zod 4
- **Maps:** Mapbox GL
- **AI Chat:** Google Generative AI (Gemini)
- **File Storage:** Supabase Storage
- **Realtime:** Supabase Realtime (broadcast channels for messaging)
- **Email:** Resend
- **Mobile:** Capacitor (Android)

## Architecture

### Directory Structure

```
src/
├── actions/           # Server Actions ("use server") - all data mutations
├── app/               # Next.js App Router pages
├── components/        # React components (ui/ for shadcn)
├── hooks/             # Custom React hooks (use-*.ts)
├── store/             # Zustand stores (*-store.ts)
├── schemas/           # Zod validation schemas (*.schema.ts)
├── context/           # React Context (QueryProvider, UserContext)
├── lib/               # Core utilities (auth.ts, prisma.ts, gemini.ts)
│   └── generated/prisma/  # Prisma generated client
└── types/             # TypeScript types
```

### Server Actions Pattern

All mutations use Server Actions in `/src/actions/`. Return type: `ActionResponse<T>` with `{success, data/error}`.

```typescript
const result = await createAppointment(data);
if (result.success) {
  // handle result.data
} else {
  // handle result.error
}
```

### Supabase Usage (Storage + Realtime Only)

Supabase is NOT used for database or auth. Only for:
- **Storage:** `src/lib/supabase-client.ts` - File uploads (cover photos, documents) to `HimsogStorage` bucket
- **Realtime:** `src/lib/supabase/client.ts` - Broadcast channels for chat messaging

### Zustand Stores (Persistent)

- `useOnboardingCreateProviderProfileStore` - Provider onboarding form (localStorage: `onboarding-create-provider-profile`)
- `useCreateUserAppointmentStore` - Appointment booking form (localStorage: `create-user-appointment-storage`)

### Auth & Roles

Three roles: `USER`, `PROVIDER`, `ADMIN`. Role-based redirects:
- ADMIN → `/admin/dashboard`
- PROVIDER → `/provider/dashboard`
- USER → `/browse-services`

Auth utilities in `/src/actions/auth/auth-check-utils.ts`: `getCurrentUser()`, `checkAuth()`.

### Key Route Groups

- `(landingpage)/` - Landing page
- `(public)/` - Public routes (browse-services, about-us)
- `(map)/` - Map feature
- `(message)/` - Messaging
- `provider/` - Provider dashboard (onboarding, services, appointments, analytics)
- `admin/` - Admin dashboard (providers, categories)
- `auth/` - Sign in/up pages

### Database Models

Core: User, Session, Account, Verification
Provider: Provider (status: PENDING/VERIFIED/SUSPENDED/REJECTED), Category, Service, OperatingHour, BreakTime
Features: Appointment, AppointmentService, Review, Conversation, Message, Notification, Document

### API Routes

- `/api/auth/[...all]` - Better Auth handler
- `/api/chat` - Gemini AI chatbot endpoint

## Naming Conventions

- Server Actions: `*-actions.ts`
- Hooks: `use-*.ts`
- Stores: `*-store.ts`
- Schemas: `*.schema.ts`
- Components: PascalCase

## Environment Variables

Required:
- `DATABASE_URL`, `DIRECT_URL` - PostgreSQL connection strings
- `BETTER_AUTH_SECRET` - Min 32 chars
- `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` - App URLs
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox maps
- `GEMINI_API_KEY` - AI chatbot
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - File storage & Realtime
- `RESEND_API_KEY` - Email service

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
