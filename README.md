# Himsog - Healthcare Information and Medical-Services Search with Online-Booking and Geolocation

A comprehensive healthcare geolocation platform built with **Next.js 16**, **Prisma ORM**, and **Better Auth**. Enables users to find healthcare providers, book appointments, and communicate via real-time messaging. Providers can manage services, schedules, and view analytics. Admins verify providers and manage categories.

**Live:** [https://himsog.tech](https://himsog.tech)

## Features

### For Users (Patients)
- Browse healthcare providers by category and location
- Interactive map-based provider discovery with Mapbox
- Advanced search with filters (category, location, rating)
- View provider details (services, hours, reviews, location)
- Book appointments with multi-service selection and date/time picker
- View appointment history and status tracking
- Real-time private messaging with providers
- Submit reviews and ratings (with anonymous option)
- Personal dashboard with appointment calendar
- AI-powered chatbot for healthcare assistance

### For Healthcare Providers
- 4-step onboarding process (profile, services, hours, verification)
- Service management with flexible pricing models (Fixed, Range, Inquire)
- Appointment management (view, confirm, cancel, complete)
- Calendar view with availability management
- Analytics dashboard:
  - Appointment trends and revenue tracking
  - Popular services analysis
  - Peak hours and cancellation insights
- Review management with response capability
- Document verification tracking
- Real-time messaging with patients

### For Administrators
- Dashboard with key system metrics
- Provider verification workflow (review documents, approve/reject)
- Category management (CRUD operations)
- User management (suspend/reactivate, view activity)
- System-wide analytics and reports
- Audit log for all admin actions
- Feedback management system

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.0.7 (App Router + Server Actions) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL (Azure Flexible Server) + Prisma ORM 6.19.0 |
| **Authentication** | Better Auth 1.3.34 (Email/Password + Google OAuth) |
| **State Management** | Zustand 5.0.8 (persistent) + TanStack Query 5.90.8 (async) |
| **UI Components** | shadcn/ui + Radix UI primitives |
| **Styling** | Tailwind CSS 4 + Framer Motion 12.23.24 |
| **Forms** | React Hook Form 7.66.0 + Zod 4.1.12 |
| **Maps** | Mapbox GL 3.16.0 |
| **AI Chat** | Google Generative AI (Gemini 2.5 Flash) |
| **File Storage** | Supabase Storage |
| **Realtime** | Supabase Realtime (broadcast channels) |
| **Email** | Resend 6.5.2 |
| **Charts** | Recharts 2.15.4 |
| **Mobile** | Capacitor 7.4.4 (Android) |
| **Package Manager** | Bun (recommended) |

## Prerequisites

- **Node.js** 20.x or later
- **Bun** (recommended) or npm/pnpm/yarn
- **PostgreSQL** database (local or cloud)
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd himsog
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file based on `example.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/himsog"
DIRECT_URL="postgresql://user:password@localhost:5432/himsog"

# Authentication
BETTER_AUTH_SECRET="your-super-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Maps
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"

# AI Chatbot
GEMINI_API_KEY="your-gemini-api-key"

# File Storage & Realtime (Supabase)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-supabase-key"

# Email
RESEND_API_KEY="your-resend-api-key"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Set Up the Database

Run Prisma migrations:

```bash
bunx prisma migrate dev
```

Generate Prisma Client:

```bash
bunx prisma generate
```

### 5. Seed Sample Data (Optional)

```bash
bun run seed:providers-v2   # Seed provider data
bun run seed:bookings       # Seed booking data
bun run seed:insurance      # Seed insurance providers
bun run seed:analytics      # Seed analytics data
```

### 6. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
himsog/
├── .github/workflows/          # CI/CD pipeline (Azure deployment)
├── android/                    # Capacitor Android project
├── docs/                       # Project documentation
├── prisma/
│   ├── schema.prisma           # Database schema (23 models)
│   ├── migrations/             # Database migrations
│   └── seed-*.ts               # Seeding scripts
├── public/                     # Static assets
├── src/
│   ├── actions/                # Server Actions ("use server")
│   │   ├── admin/              # Admin operations
│   │   ├── appointment/        # Appointment management
│   │   ├── auth/               # Authentication
│   │   ├── messages/           # Messaging
│   │   ├── notifications/      # Notifications
│   │   ├── provider/           # Provider operations
│   │   └── review/             # Reviews
│   ├── app/                    # Next.js App Router
│   │   ├── (landingpage)/      # Landing page
│   │   ├── (map)/              # Map feature
│   │   ├── (message)/          # Messaging
│   │   ├── (public)/           # Public routes (browse, provider details)
│   │   ├── (users)/            # User dashboard
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Better Auth handler
│   │   │   ├── chat/           # AI chatbot endpoint
│   │   │   └── mobile/         # Mobile API endpoints
│   │   ├── auth/               # Authentication pages
│   │   └── provider/           # Provider dashboard & onboarding
│   ├── components/
│   │   ├── admin-components/   # Admin UI
│   │   ├── auth/               # Auth forms
│   │   ├── landingpage/        # Landing page components
│   │   ├── map/                # Map components
│   │   ├── messages/           # Messaging UI
│   │   ├── provider-components/# Provider UI
│   │   ├── ui/                 # shadcn/ui components
│   │   └── users/              # User components
│   ├── context/                # React Context (Query, User)
│   ├── hooks/                  # Custom React hooks (use-*.ts)
│   ├── lib/
│   │   ├── auth.ts             # Better Auth configuration
│   │   ├── prisma.ts           # Prisma client
│   │   ├── gemini.ts           # Gemini AI configuration
│   │   ├── supabase-client.ts  # Supabase storage client
│   │   └── generated/prisma/   # Prisma generated client
│   ├── schemas/                # Zod validation schemas
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript types
├── capacitor.config.ts         # Mobile app configuration
├── CLAUDE.md                   # Development guide
└── package.json
```

## User Roles

| Role | Description | Default Route |
|------|-------------|---------------|
| **USER** | Patients seeking healthcare services | `/browse-services` |
| **PROVIDER** | Healthcare service providers | `/provider/dashboard` |
| **ADMIN** | Platform administrators | `/admin/dashboard` |

Users are automatically redirected to their role-specific dashboard after login.

## Database Models

**Core Models:**
- `User`, `Session`, `Account`, `Verification`

**Provider Models:**
- `Provider`, `Category`, `Service`, `ServicePackage`, `OperatingHour`, `BreakTime`

**Insurance:**
- `InsuranceProvider`, `ServiceInsurance`

**Appointments:**
- `Appointment`, `AppointmentService`

**Communication:**
- `Notification`, `Conversation`, `Message`

**Reviews:**
- `Review`, `ReviewLike`

**Documents:**
- `Document` (verification documents)

**Admin:**
- `AuditLog`, `ProviderStatusHistory`, `SystemFeedback`

## API Routes

| Route | Description |
|-------|-------------|
| `/api/auth/[...all]` | Better Auth handler (all authentication) |
| `/api/chat` | AI chatbot endpoint (Gemini) |
| `/api/mobile/auth/*` | Mobile authentication endpoints |
| `/api/mobile/user/*` | Mobile user data endpoints |

## Available Scripts

```bash
# Development
bun dev                       # Start development server
bun build                     # Build for production
bun start                     # Start production server
bun lint                      # Run ESLint

# Database
bunx prisma studio            # Open Prisma Studio (database GUI)
bunx prisma migrate dev       # Run migrations (development)
bunx prisma migrate deploy    # Deploy migrations (production)
bunx prisma generate          # Generate Prisma client

# Seeding
bun run seed:providers-v2     # Seed provider data
bun run seed:bookings         # Seed booking data
bun run seed:insurance        # Seed insurance providers
bun run seed:analytics        # Seed analytics data
```

## Deployment

### Platform
- **Hosting:** Azure App Service (Linux, Node.js 20)
- **Database:** Azure PostgreSQL Flexible Server
- **Storage:** Supabase Storage
- **CI/CD:** GitHub Actions

### Environment Variables for Production

All environment variables from the `.env` section are required, with production URLs:

```env
BETTER_AUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Build Configuration

The project uses Next.js standalone output for Azure App Service deployment:

```typescript
// next.config.ts
output: "standalone"
```

## Architecture Patterns

### Server Actions

All mutations use Server Actions in `/src/actions/`. Return type: `ActionResponse<T>`

```typescript
const result = await createAppointment(data);
if (result.success) {
  // handle result.data
} else {
  // handle result.error
}
```

### Supabase Usage

Supabase is used **only** for:
- **Storage:** File uploads (cover photos, documents) to `HimsogStorage` bucket
- **Realtime:** Broadcast channels for chat messaging

**Not used for:** Database or authentication (handled by Prisma and Better Auth)

### Zustand Stores

Persistent stores with localStorage:
- `useOnboardingCreateProviderProfileStore` - Provider onboarding form
- `useCreateUserAppointmentStore` - Appointment booking form

## Mobile App

The project includes a Capacitor-based Android app:

```typescript
// capacitor.config.ts
appId: "tech.himsog.app"
appName: "Himsog"
```

Mobile API endpoints are available at `/api/mobile/*` with JWT authentication.

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Server Actions | `*-actions.ts` | `appointment-actions.ts` |
| Hooks | `use-*.ts` | `use-appointment.ts` |
| Stores | `*-store.ts` | `appointment-store.ts` |
| Schemas | `*.schema.ts` | `appointment.schema.ts` |
| Components | PascalCase | `AppointmentCard.tsx` |

## Documentation

Additional documentation available in `/docs/`:
- `AZURE-DEPLOYMENT-GUIDE.md` - Deployment instructions
- `PRD-ADMIN-FEATURES.md` - Admin feature specifications
- `PRD-PROVIDER-FEATURES.md` - Provider feature specifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**Built with Next.js 16, Prisma, Better Auth, and Supabase**
