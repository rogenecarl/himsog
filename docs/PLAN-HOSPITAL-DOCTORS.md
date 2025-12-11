# Plan: Hospital-Doctor Relationship Feature

## Overview

Enable hospitals to have affiliated doctors. When users click on a hospital card, they see a dedicated hospital page showing:
1. Hospital information
2. Laboratory/diagnostic services (VIEW ONLY - no booking)
3. Affiliated doctors with their services (VIEW + BOOK)

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| **Approach** | Many-to-Many `ProviderAffiliation` join table |
| **Hospital lab services** | View only (no booking) |
| **Doctor services on hospital page** | View + Book |
| **Role system** | Use existing PROVIDER role for both hospitals and doctors |
| **Differentiation** | By Category (hospitals vs doctors) |
| **Affiliation workflow** | Direct add (hospital adds doctors directly) |
| **Doctor independence** | Doctors are independent providers, can be affiliated with multiple hospitals |
| **Loading strategy** | Component-based loading with individual skeletons (not whole page) |
| **Data fetching** | Split queries per section for parallel fetching |
| **Reviews loading** | Lazy load (fetch only when scrolled into view) |

---

## Role & Account System

### Existing Roles (No Changes Needed)

```
USER     → Regular patients who browse and book appointments
PROVIDER → Healthcare providers (differentiated by Category)
ADMIN    → System administrators who manage categories and verify providers
```

### How Roles Work with Categories

```
┌─────────────────────────────────────────────────────────────┐
│                        PROVIDER Role                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Category: "Hospitals"          Category: "Doctors"         │
│  ┌─────────────────────┐        ┌─────────────────────┐    │
│  │ Hospital Owner      │        │ Doctor              │    │
│  │                     │        │                     │    │
│  │ • Manages hospital  │        │ • Manages own       │    │
│  │   profile           │        │   profile           │    │
│  │ • Adds lab services │        │ • Adds services     │    │
│  │ • Affiliates doctors│        │   (consultation,    │    │
│  │ • Views analytics   │        │   procedures, etc.) │    │
│  │                     │        │ • Manages schedule  │    │
│  │ EXTRA FEATURE:      │        │ • Handles bookings  │    │
│  │ /provider/doctors   │        │                     │    │
│  │ (manage affiliations)│       │ Can be affiliated   │    │
│  └─────────────────────┘        │ to multiple hospitals│   │
│                                 └─────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Features by Category

| Feature | Hospital (PROVIDER) | Doctor (PROVIDER) |
|---------|---------------------|-------------------|
| Profile Management | ✅ | ✅ |
| Services | ✅ (lab/diagnostic) | ✅ (consultation, procedures) |
| Operating Hours | ✅ | ✅ |
| Appointments | ❌ (view only services) | ✅ |
| Analytics | ✅ | ✅ |
| Reviews | ✅ | ✅ |
| **Affiliated Doctors** | ✅ (can add/remove) | ❌ |
| **Hospital Affiliations** | ❌ | ✅ (view where affiliated) |

---

## Complete User Flows

### Flow 1: Admin Sets Up Categories

```
Admin Dashboard (/admin/categories)
┌─────────────────────────────────────┐
│ Categories                          │
│ ┌─────────────────────────────────┐ │
│ │ 🏥 Hospitals                    │ │
│ │ 👨‍⚕️ Doctors                      │ │
│ │ 🏪 Clinics                      │ │
│ │ 🔬 Laboratories                 │ │
│ └─────────────────────────────────┘ │
│ [+ Add Category]                    │
└─────────────────────────────────────┘
```

---

### Flow 2: Hospital Owner Creates Hospital Account

```
1. Hospital Admin signs up (creates User account with USER role)
              ↓
2. Goes through Provider Onboarding (/provider/onboarding)
              ↓
   ┌─────────────────────────────────────┐
   │ Step 1: Basic Information           │
   │                                     │
   │ Healthcare Name: [City Hospital   ] │
   │ Category:        [🏥 Hospitals   ▼] │  ← Selects "Hospitals"
   │ Description:     [Modern hospital..] │
   │ Phone:           [09123456789     ] │
   │ Address:         [123 Main St     ] │
   └─────────────────────────────────────┘
              ↓
3. Step 2: Add Services (Laboratory/Diagnostic)
   - X-Ray: ₱500
   - Blood Test: ₱300
   - MRI: ₱3,500
              ↓
4. Step 3: Operating Hours
              ↓
5. Step 4: Upload Documents (business permits, licenses)
              ↓
6. Submit for verification → Status: PENDING
              ↓
7. Admin reviews & verifies → Status: VERIFIED
              ↓
8. User role changes to PROVIDER
              ↓
9. Hospital appears in /browse-services?category=hospitals
```

**Hospital owns:** Profile, lab services, operating hours, documents

---

### Flow 3: Doctor Creates Their Own Account

```
1. Doctor signs up (creates User account with USER role)
              ↓
2. Goes through Provider Onboarding (/provider/onboarding)
              ↓
   ┌─────────────────────────────────────┐
   │ Step 1: Basic Information           │
   │                                     │
   │ Healthcare Name: [Dr. Juan Santos ] │
   │ Category:        [👨‍⚕️ Doctors     ▼] │  ← Selects "Doctors"
   │ Description:     [Cardiologist...  ] │
   │ Phone:           [09198765432     ] │
   │ Address:         [456 Clinic Ave   ] │  ← Private practice address
   └─────────────────────────────────────┘
              ↓
3. Step 2: Add Services
   - Consultation: ₱500
   - ECG: ₱800
   - Stress Test: ₱1,500
              ↓
4. Step 3: Operating Hours
              ↓
5. Step 4: Upload Documents (medical license, certifications)
              ↓
6. Submit for verification → Status: PENDING
              ↓
7. Admin reviews & verifies → Status: VERIFIED
              ↓
8. User role changes to PROVIDER
              ↓
9. Doctor appears in /browse-services?category=doctors
```

**Doctor owns:** Profile, services, schedule, appointments (fully independent)

---

### Flow 4: Hospital Adds Doctor as Affiliate

```
Hospital Admin logs into Provider Dashboard
              ↓
Clicks "Affiliated Doctors" in sidebar → /provider/doctors
              ↓
┌─────────────────────────────────────────────────────────────┐
│ Affiliated Doctors                           [+ Add Doctor] │
├─────────────────────────────────────────────────────────────┤
│ No doctors affiliated yet.                                  │
│                                                             │
│ Click "Add Doctor" to search and add verified doctors       │
│ to your hospital.                                           │
└─────────────────────────────────────────────────────────────┘

         ↓ Clicks "Add Doctor"

┌─────────────────────────────────────────────────────────────┐
│ Add Doctor to Hospital                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search doctors by name...                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Available Doctors (Verified, Category: Doctors)             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👨‍⚕️ Dr. Juan Santos                                      │ │
│ │    Cardiologist • ★★★★★ (42 reviews)                    │ │
│ │    Services: Consultation, ECG, Stress Test             │ │
│ │                                          [+ Add]        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 👩‍⚕️ Dr. Maria Cruz                                       │ │
│ │    Pediatrician • ★★★★☆ (28 reviews)                    │ │
│ │    Services: Checkup, Vaccination                       │ │
│ │                                          [+ Add]        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

         ↓ Hospital clicks "Add" on Dr. Juan Santos

┌─────────────────────────────────────────────────────────────┐
│ Add Doctor Details                                          │
│                                                             │
│ Doctor:     Dr. Juan Santos                                 │
│ Department: [Cardiology          ]  ← Optional metadata     │
│ Title:      [Senior Cardiologist ]  ← Optional              │
│                                                             │
│                              [Cancel]  [Add to Hospital]    │
└─────────────────────────────────────────────────────────────┘

         ↓ Doctor added successfully

┌─────────────────────────────────────────────────────────────┐
│ Affiliated Doctors                           [+ Add Doctor] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👨‍⚕️ Dr. Juan Santos                                      │ │
│ │    Department: Cardiology                               │ │
│ │    Title: Senior Cardiologist                           │ │
│ │    Affiliated since: Nov 28, 2025                       │ │
│ │                                    [Edit] [Remove]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Important:** Hospital can only ADD/REMOVE affiliation. Hospital CANNOT edit doctor's profile, services, or schedule.

---

### Flow 5: Doctor Views Hospital Affiliations

```
Doctor logs into Provider Dashboard
              ↓
Clicks "Hospital Affiliations" in sidebar → /provider/hospitals
              ↓
┌─────────────────────────────────────────────────────────────┐
│ Hospital Affiliations                                       │
├─────────────────────────────────────────────────────────────┤
│ You are affiliated with the following hospitals:            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏥 City Hospital                                        │ │
│ │    Department: Cardiology                               │ │
│ │    Title: Senior Cardiologist                           │ │
│ │    Since: Nov 28, 2025                                  │ │
│ │                                         [View Hospital] │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 🏥 Metro Medical Center                                 │ │
│ │    Department: Cardiology                               │ │
│ │    Title: Visiting Consultant                           │ │
│ │    Since: Oct 15, 2025                                  │ │
│ │                                         [View Hospital] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Note:** Doctors can view their affiliations but cannot remove themselves (hospital controls this).

---

### Flow 6: Public User Views Hospital Page

```
User browses /browse-services?category=hospitals
              ↓
Sees hospital cards in grid
              ↓
Clicks on "City Hospital" card
              ↓
Redirects to /hospital/[slug] (e.g., /hospital/city-hospital)
              ↓
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    [Hero Image]                         │ │
│ │                                                         │ │
│ │  🏥 City Hospital                                       │ │
│ │  📍 123 Main St, Digos City, Davao del Sur             │ │
│ │  ⭐ 4.8 (156 reviews)                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ 🕐 Hours     │ │ 📞 Contact   │ │ 🏥 Category  │         │
│ │ Open Now     │ │ 09123456789  │ │ Hospitals    │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
├─────────────────────────────────────────────────────────────┤
│ About                                                       │
│ City Hospital is a modern healthcare facility providing     │
│ comprehensive medical services to the community...          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔬 Laboratory & Diagnostic Services          (VIEW ONLY)   │
│                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ 🩻 X-Ray     │ │ 🩸 Blood Test│ │ 📡 MRI      │         │
│ │              │ │              │ │              │         │
│ │ ₱500        │ │ ₱300        │ │ ₱3,500      │         │
│ │              │ │              │ │              │         │
│ │ [View Only] │ │ [View Only] │ │ [View Only] │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 👨‍⚕️ Our Doctors                              (VIEW + BOOK)  │
│                                                             │
│ ┌────────────────────┐ ┌────────────────────┐              │
│ │ [Photo]            │ │ [Photo]            │              │
│ │                    │ │                    │              │
│ │ Dr. Juan Santos    │ │ Dr. Maria Cruz     │              │
│ │ Cardiology         │ │ Pediatrics         │              │
│ │ ⭐ 4.9 (42 reviews)│ │ ⭐ 4.7 (28 reviews)│              │
│ │                    │ │                    │              │
│ │ Services:          │ │ Services:          │              │
│ │ • Consultation ₱500│ │ • Checkup ₱400    │              │
│ │ • ECG ₱800        │ │ • Vaccination ₱300 │              │
│ │ • Stress Test ₱1.5k│ │                    │              │
│ │                    │ │                    │              │
│ │ [Details] [Book]   │ │ [Details] [Book]   │              │
│ └────────────────────┘ └────────────────────┘              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ⭐ Reviews                                                  │
│ [Review cards...]                                           │
└─────────────────────────────────────────────────────────────┘

    ↓ User clicks "Book" on Dr. Juan Santos

Goes to existing booking flow: /provider-details/[doctor-uuid]
or opens booking modal for that doctor
```

---

## Summary: Who Does What

| Role | Person | Actions |
|------|--------|---------|
| **ADMIN** | System Administrator | Creates categories (Hospitals, Doctors), verifies providers |
| **PROVIDER** (Hospital) | Hospital Owner | Creates hospital profile, adds lab services, affiliates doctors |
| **PROVIDER** (Doctor) | Doctor | Creates own profile, adds own services, manages own schedule/appointments |
| **USER** | Patient | Browses hospitals, views lab services, books with doctors |

### Key Points

1. **Both hospitals and doctors are PROVIDER role** - differentiated by Category
2. **Doctors are fully independent** - they own their profile, services, and appointments
3. **Hospital only creates affiliation link** - cannot modify doctor's data
4. **Doctors can work at multiple hospitals** - many-to-many relationship
5. **Doctors also appear in regular browse** - `/browse-services?category=doctors`
6. **Hospital services are view-only** - no booking for lab/diagnostic services
7. **Doctor services are bookable** - both on hospital page and their own profile

---

## Performance Optimization Strategy

### Why Component-Based Loading?

| Aspect | Whole Page Loading | Component-Based Loading |
|--------|-------------------|------------------------|
| **Perceived Speed** | Slow (waits for all data) | Fast (progressive render) |
| **Time to First Content** | Slow | Fast |
| **User Experience** | Blank → Full page | Skeleton → Content fills in |
| **Parallel Fetching** | Single query | Multiple parallel queries |
| **Cache Efficiency** | All or nothing | Components cache independently |
| **Re-render Scope** | Entire page | Only affected component |

### Loading Strategy Per Section

```
┌─────────────────────────────────────────────────────────────┐
│ Hospital Page - Progressive Loading                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Hero Section                    [Query 1: Basic Info]│   │
│  │ - Name, address, rating, cover photo                │   │
│  │ - Loads FIRST (smallest query, critical content)    │   │
│  │ - Shows: HeroSkeleton → HeroContent                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Info Badges                     [Same as Query 1]    │   │
│  │ - Operating hours, contact, category                │   │
│  │ - Bundled with basic info (no extra query)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Services Section                [Query 2: Services]  │   │
│  │ - Laboratory/diagnostic services                    │   │
│  │ - Independent query, loads in parallel              │   │
│  │ - Shows: ServicesSkeleton → ServicesGrid            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Doctors Section                 [Query 3: Doctors]   │   │
│  │ - Affiliated doctors with their services            │   │
│  │ - Independent query, loads in parallel              │   │
│  │ - Shows: DoctorsSkeleton → DoctorsGrid              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Reviews Section                 [Query 4: Reviews]   │   │
│  │ - Hospital reviews                                  │   │
│  │ - LAZY LOADED (fetch when scrolled into view)       │   │
│  │ - Uses: useInView + enabled flag                    │   │
│  │ - Shows: ReviewsSkeleton → ReviewsList              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Split Server Actions

```typescript
// src/actions/hospital/hospital-actions.ts

// Query 1: Basic info (fastest - minimal data)
getHospitalBasicInfo(slug: string)
  → Returns: { id, healthcareName, description, coverPhoto, address,
               city, province, phoneNumber, email, category,
               operatingHours, rating, reviewCount }

// Query 2: Services only
getHospitalServices(hospitalId: string)
  → Returns: { services[] with pricing, insurance }

// Query 3: Affiliated doctors with their services
getHospitalDoctors(hospitalId: string)
  → Returns: { affiliations[] with doctor profile, services, rating }

// Query 4: Reviews (paginated)
getHospitalReviews(hospitalId: string, page: number)
  → Returns: { reviews[], totalCount, hasMore }
```

### Split React Query Hooks

```typescript
// src/hooks/use-hospital.ts

// Hook 1: Basic info
useHospitalBasicInfo(slug: string) {
  queryKey: ["hospital", slug, "basic"]
  staleTime: 5 * 60 * 1000  // 5 minutes
}

// Hook 2: Services
useHospitalServices(hospitalId: string) {
  queryKey: ["hospital", hospitalId, "services"]
  staleTime: 5 * 60 * 1000
  enabled: !!hospitalId  // Wait for basic info
}

// Hook 3: Doctors
useHospitalDoctors(hospitalId: string) {
  queryKey: ["hospital", hospitalId, "doctors"]
  staleTime: 5 * 60 * 1000
  enabled: !!hospitalId
}

// Hook 4: Reviews (lazy)
useHospitalReviews(hospitalId: string, enabled: boolean) {
  queryKey: ["hospital", hospitalId, "reviews"]
  staleTime: 5 * 60 * 1000
  enabled: enabled && !!hospitalId  // Only when visible
}
```

### Component Structure with Skeletons

```tsx
// src/app/(public)/hospital/[slug]/page.tsx
export default function HospitalPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <HospitalHeroSection slug={params.slug} />
      <HospitalServicesSection slug={params.slug} />
      <HospitalDoctorsSection slug={params.slug} />
      <HospitalReviewsSection slug={params.slug} />  {/* Lazy loaded */}
    </div>
  );
}

// Each section manages its own loading state
function HospitalDoctorsSection({ slug }: { slug: string }) {
  const { data: basicInfo } = useHospitalBasicInfo(slug);
  const { data: doctors, isLoading } = useHospitalDoctors(basicInfo?.id);

  if (isLoading) return <DoctorsSectionSkeleton />;
  if (!doctors?.length) return <NoDoctorsMessage />;

  return (
    <section>
      <h2>Our Doctors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((affiliation) => (
          <DoctorCard key={affiliation.id} affiliation={affiliation} />
        ))}
      </div>
    </section>
  );
}
```

### Lazy Loading Reviews (Below Fold)

```tsx
// Uses react-intersection-observer
import { useInView } from "react-intersection-observer";

function HospitalReviewsSection({ slug }: { slug: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { data: basicInfo } = useHospitalBasicInfo(slug);
  const { data: reviews, isLoading } = useHospitalReviews(
    basicInfo?.id,
    inView  // Only fetch when section is visible
  );

  return (
    <section ref={ref}>
      <h2>Reviews</h2>
      {!inView || isLoading ? (
        <ReviewsSkeleton count={3} />
      ) : (
        <ReviewsList reviews={reviews} />
      )}
    </section>
  );
}
```

### Skeleton Components to Create

```
src/components/(public)/hospital-component/skeletons/
├── hero-skeleton.tsx              # Cover image + title placeholder
├── info-badges-skeleton.tsx       # 3-4 badge placeholders
├── services-skeleton.tsx          # Grid of service card placeholders
├── doctors-skeleton.tsx           # Grid of doctor card placeholders
└── reviews-skeleton.tsx           # List of review card placeholders
```

### Cache Strategy

| Data Type | Stale Time | Cache Time | Reason |
|-----------|------------|------------|--------|
| Basic Info | 5 min | 10 min | Rarely changes |
| Services | 5 min | 10 min | Updated occasionally |
| Doctors | 5 min | 10 min | Affiliations change rarely |
| Reviews | 2 min | 5 min | New reviews more frequent |

---

## Database Schema

### New Model: ProviderAffiliation

```prisma
model ProviderAffiliation {
  id            String    @id @default(cuid())

  // Hospital (parent provider)
  hospitalId    String
  hospital      Provider  @relation("HospitalAffiliations", fields: [hospitalId], references: [id], onDelete: Cascade)

  // Doctor (affiliated provider)
  doctorId      String
  doctor        Provider  @relation("DoctorAffiliations", fields: [doctorId], references: [id], onDelete: Cascade)

  // Affiliation metadata
  department    String?   // e.g., "Cardiology", "Pediatrics"
  title         String?   // e.g., "Senior Cardiologist", "Resident"
  isActive      Boolean   @default(true)
  startDate     DateTime  @default(now())
  endDate       DateTime?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([hospitalId, doctorId])
  @@index([hospitalId])
  @@index([doctorId])
}
```

### Updated Provider Model

```prisma
model Provider {
  // ... existing fields ...

  // Hospital: doctors affiliated with this hospital
  affiliatedDoctors     ProviderAffiliation[] @relation("HospitalAffiliations")

  // Doctor: hospitals this doctor is affiliated with
  hospitalAffiliations  ProviderAffiliation[] @relation("DoctorAffiliations")
}
```

---

## Implementation Phases

### Phase 1: Database & Core (Priority: High)
- [ ] Add `ProviderAffiliation` model to Prisma schema
- [ ] Update `Provider` model with affiliation relations
- [ ] Run database migration (`bunx prisma migrate dev`)
- [ ] Generate Prisma client (`bunx prisma generate`)
- [ ] Create Zod validation schemas (`src/schemas/affiliation.schema.ts`)
- [ ] Create TypeScript types (`src/types/hospital.ts`)

### Phase 2: Server Actions & Hooks (Priority: High)
- [ ] Create hospital actions (`src/actions/hospital/hospital-actions.ts`)
  - [ ] `getHospitalBasicInfo(slug)` - Basic info query
  - [ ] `getHospitalServices(hospitalId)` - Services query
  - [ ] `getHospitalDoctors(hospitalId)` - Affiliated doctors query
  - [ ] `getHospitalReviews(hospitalId, page)` - Reviews query (paginated)
- [ ] Create affiliation actions (`src/actions/provider/affiliation-actions.ts`)
  - [ ] `createAffiliation(data)` - Add doctor to hospital
  - [ ] `updateAffiliation(id, data)` - Update affiliation
  - [ ] `removeAffiliation(id)` - Remove doctor from hospital
  - [ ] `getAvailableDoctors(search)` - Search doctors
- [ ] Create React Query hooks (`src/hooks/use-hospital.ts`)
  - [ ] `useHospitalBasicInfo(slug)` - Hook for basic info
  - [ ] `useHospitalServices(hospitalId)` - Hook for services
  - [ ] `useHospitalDoctors(hospitalId)` - Hook for doctors
  - [ ] `useHospitalReviews(hospitalId, enabled)` - Hook for reviews (lazy)
- [ ] Create affiliation hooks (`src/hooks/use-affiliation.ts`)
  - [ ] `useCreateAffiliation()` - Mutation hook
  - [ ] `useUpdateAffiliation()` - Mutation hook
  - [ ] `useRemoveAffiliation()` - Mutation hook
  - [ ] `useAvailableDoctors(search)` - Search hook

### Phase 3: Skeleton Components (Priority: High)
- [ ] Create skeleton directory (`src/components/(public)/hospital-component/skeletons/`)
- [ ] Create `hero-skeleton.tsx` - Cover image + title placeholder
- [ ] Create `info-badges-skeleton.tsx` - Badge placeholders
- [ ] Create `services-skeleton.tsx` - Service cards grid skeleton
- [ ] Create `doctors-skeleton.tsx` - Doctor cards grid skeleton
- [ ] Create `reviews-skeleton.tsx` - Review cards list skeleton

### Phase 4: Public Hospital Page (Priority: High)
- [ ] Create `/hospital/[slug]/page.tsx` - Main page component
- [ ] Create `hospital-hero-section.tsx` - Hero with basic info + skeleton
- [ ] Create `hospital-info-badges.tsx` - Status badges + skeleton
- [ ] Create `hospital-about-section.tsx` - Description section
- [ ] Create `hospital-services-section.tsx` - Lab services (view only) + skeleton
- [ ] Create `hospital-doctors-section.tsx` - Doctors grid (view + book) + skeleton
- [ ] Create `hospital-reviews-section.tsx` - Reviews (lazy loaded) + skeleton
- [ ] Create `doctor-card.tsx` - Doctor card with Details + Book buttons
- [ ] Update `provider-card.tsx` - Redirect hospital clicks to `/hospital/[slug]`

### Phase 5: Hospital Provider Dashboard (Priority: Medium)
- [ ] Create `/provider/doctors/page.tsx` - Manage affiliated doctors page
- [ ] Create `affiliated-doctors-list.tsx` - List component with loading state
- [ ] Create `affiliated-doctor-card.tsx` - Card with Edit/Remove actions
- [ ] Create `add-doctor-dialog.tsx` - Modal to search & add doctors
- [ ] Create `doctor-search.tsx` - Debounced search input
- [ ] Update provider sidebar - Show "Affiliated Doctors" for hospitals only

### Phase 6: Doctor Provider Dashboard (Priority: Low)
- [ ] Create `/provider/hospitals/page.tsx` - View hospital affiliations
- [ ] Create `hospital-affiliations-list.tsx` - List of hospitals
- [ ] Create `hospital-affiliation-card.tsx` - Hospital card (view only)
- [ ] Update provider sidebar - Show "Hospital Affiliations" for doctors only

### Phase 7: Admin Dashboard (Priority: Low)
- [ ] (Optional) Create `/admin/affiliations/page.tsx`
- [ ] (Optional) View/manage all affiliations

---

## Files to Create

```
prisma/schema.prisma                              # Update with ProviderAffiliation

src/schemas/affiliation.schema.ts                 # Zod validation schemas

# Server Actions (Split for performance)
src/actions/hospital/hospital-actions.ts          # Hospital-specific actions
├── getHospitalBasicInfo(slug)                    # Query 1: Basic info
├── getHospitalServices(hospitalId)               # Query 2: Services
├── getHospitalDoctors(hospitalId)                # Query 3: Affiliated doctors
└── getHospitalReviews(hospitalId, page)          # Query 4: Reviews (paginated)

src/actions/provider/affiliation-actions.ts       # Affiliation CRUD actions
├── createAffiliation(data)                       # Hospital adds doctor
├── updateAffiliation(id, data)                   # Update department/title
├── removeAffiliation(id)                         # Hospital removes doctor
└── getAvailableDoctors(search)                   # Search doctors to add

# React Query Hooks (Split for component-based loading)
src/hooks/use-hospital.ts                         # Hospital page hooks
├── useHospitalBasicInfo(slug)                    # Query 1
├── useHospitalServices(hospitalId)               # Query 2
├── useHospitalDoctors(hospitalId)                # Query 3
└── useHospitalReviews(hospitalId, enabled)       # Query 4 (lazy)

src/hooks/use-affiliation.ts                      # Affiliation management hooks
├── useCreateAffiliation()                        # Mutation
├── useUpdateAffiliation()                        # Mutation
├── useRemoveAffiliation()                        # Mutation
└── useAvailableDoctors(search)                   # Search query

# Hospital Public Page
src/app/(public)/hospital/[slug]/page.tsx         # Hospital detail page

src/components/(public)/hospital-component/
├── hospital-hero-section.tsx                     # Hero with basic info
├── hospital-info-badges.tsx                      # Hours, contact, category
├── hospital-about-section.tsx                    # Description
├── hospital-services-section.tsx                 # Lab services (view only)
├── hospital-doctors-section.tsx                  # Doctors grid (view + book)
├── hospital-reviews-section.tsx                  # Reviews (lazy loaded)
└── doctor-card.tsx                               # Doctor card with book button

# Skeleton Components (for progressive loading)
src/components/(public)/hospital-component/skeletons/
├── hero-skeleton.tsx                             # Cover image + title
├── info-badges-skeleton.tsx                      # Badge placeholders
├── services-skeleton.tsx                         # Service cards grid
├── doctors-skeleton.tsx                          # Doctor cards grid
└── reviews-skeleton.tsx                          # Review cards list

# Hospital Provider Dashboard (manage doctors)
src/app/provider/doctors/page.tsx                 # Affiliated doctors page

src/components/provider-components/doctor-management/
├── affiliated-doctors-list.tsx                   # List with edit/remove
├── add-doctor-dialog.tsx                         # Search & add modal
├── doctor-search.tsx                             # Search input component
└── affiliated-doctor-card.tsx                    # Card with actions

# Doctor Provider Dashboard (view affiliations)
src/app/provider/hospitals/page.tsx               # Hospital affiliations page

src/components/provider-components/hospital-affiliations/
├── hospital-affiliations-list.tsx                # List of hospitals
└── hospital-affiliation-card.tsx                 # Hospital card (view only)
```

## Files to Modify

```
src/components/(public)/browse-services/provider-card.tsx  # Handle hospital click → /hospital/[slug]
src/app/(public)/browse-services/page.tsx                  # (Optional) Different card for hospitals
src/components/layout/provider-sidebar.tsx                 # Category-based menu items
```

---

## Next Steps

1. ✅ Plan reviewed and approved
2. → Begin Phase 1: Database schema migration
3. → Create server actions and hooks
4. → Build public hospital page
5. → Build provider dashboards
