import {
  PrismaClient,
  AppointmentStatus,
  ServiceType,
} from "../src/lib/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// ============================================================================
// CONFIGURATION
// ============================================================================

const TARGET_PROVIDER_ID = "c2a65340-a86b-4166-9feb-80756e74a40b";
const TARGET_COMPLETED = 250;
const TARGET_CANCELLED = 50;

// Date range: October 1, 2025 to January 21, 2026
const START_DATE = { year: 2025, month: 10, day: 1 };
const END_DATE = { year: 2026, month: 1, day: 21 };

// ============================================================================
// TIMEZONE UTILITIES (Philippine Time - UTC+8)
// ============================================================================

function createPHDate(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Date {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+08:00`;
  return new Date(dateStr);
}

function getDayOfWeek(date: Date): number {
  const phDateStr = date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const phDate = new Date(phDateStr + "T00:00:00+08:00");
  return phDate.getDay();
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function isValidTimeSlot(
  hour: number,
  minute: number,
  operatingHour: { startTime: string | null; endTime: string | null; isClosed: boolean },
  breakTimes: Array<{ startTime: string; endTime: string }>
): boolean {
  if (operatingHour.isClosed || !operatingHour.startTime || !operatingHour.endTime) {
    return false;
  }

  const slotMinutes = hour * 60 + minute;
  const openMinutes = parseTimeToMinutes(operatingHour.startTime);
  const closeMinutes = parseTimeToMinutes(operatingHour.endTime);

  if (slotMinutes < openMinutes || slotMinutes >= closeMinutes - 30) {
    return false;
  }

  for (const breakTime of breakTimes) {
    const breakStart = parseTimeToMinutes(breakTime.startTime);
    const breakEnd = parseTimeToMinutes(breakTime.endTime);
    if (slotMinutes >= breakStart && slotMinutes < breakEnd) {
      return false;
    }
  }

  return true;
}

function getAvailableSlots(
  operatingHour: { startTime: string | null; endTime: string | null; isClosed: boolean },
  breakTimes: Array<{ startTime: string; endTime: string }>,
  slotDuration: number = 30
): Array<{ hour: number; minute: number }> {
  const slots: Array<{ hour: number; minute: number }> = [];

  if (operatingHour.isClosed || !operatingHour.startTime || !operatingHour.endTime) {
    return slots;
  }

  const openMinutes = parseTimeToMinutes(operatingHour.startTime);
  const closeMinutes = parseTimeToMinutes(operatingHour.endTime);

  for (let minutes = openMinutes; minutes < closeMinutes - slotDuration; minutes += slotDuration) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    if (isValidTimeSlot(hour, minute, operatingHour, breakTimes)) {
      slots.push({ hour, minute });
    }
  }

  return slots;
}

// ============================================================================
// DATA POOLS
// ============================================================================

const cancellationReasons = [
  "Schedule conflict - had an emergency at work",
  "Found a provider closer to my location",
  "Financial constraints - will reschedule when possible",
  "Family emergency came up",
  "Feeling better, symptoms resolved",
  "Transportation issues - vehicle breakdown",
  "Weather conditions made travel unsafe",
  "Work meeting was scheduled at the same time",
  "Need to accompany a family member to their appointment",
  "Personal reasons - prefer not to disclose",
  "Double-booked by mistake",
  "Insurance coverage issues need to be resolved first",
  "Need more time to prepare required documents",
  "Relocating to a different city",
  "Changed mind about the treatment approach",
];

const patientFirstNames = [
  "Juan", "Maria", "Pedro", "Ana", "Jose", "Carmen", "Miguel", "Sofia",
  "Carlos", "Isabel", "Antonio", "Rosa", "Francisco", "Elena", "Rafael",
  "Lucia", "Manuel", "Teresa", "Fernando", "Patricia", "Roberto", "Angela",
  "Ricardo", "Diana", "Eduardo", "Cristina", "Luis", "Beatriz", "Javier", "Monica",
  "Gabriel", "Valentina", "Andres", "Camila", "Sebastian", "Daniela", "Nicolas", "Paula",
];

const patientLastNames = [
  "Dela Cruz", "Santos", "Reyes", "Garcia", "Mendoza", "Lopez", "Torres",
  "Ramos", "Fernandez", "Morales", "Gonzales", "Aquino", "Bautista", "Castro",
  "Cruz", "Rivera", "Diaz", "Flores", "Perez", "Rodriguez", "Martinez", "Hernandez",
  "Villanueva", "De Leon", "Navarro", "Soriano", "Tan", "Lim", "Go", "Sy",
];

const reviewComments = {
  excellent: [
    "Outstanding service! The staff was incredibly professional and caring. Highly recommend!",
    "Best healthcare experience I've had. Clean facility, friendly staff, and excellent care.",
    "The doctor was thorough, explained everything clearly, and made me feel at ease.",
    "Exceptional service from start to finish. Will definitely return and recommend to others.",
    "Very impressed with the quality of care. The staff went above and beyond.",
    "Clean, modern facility with a very professional team. Five stars well deserved!",
    "Amazing experience! Short wait time and excellent treatment.",
    "The healthcare provider was knowledgeable and took time to address all my concerns.",
    "Top-notch service! Felt very comfortable throughout the entire visit.",
    "Couldn't ask for better care. Professional, efficient, and genuinely caring staff.",
  ],
  good: [
    "Good experience overall. Professional staff and reasonable wait time.",
    "Satisfied with the service. The doctor was helpful and attentive.",
    "Nice facility and friendly staff. Would recommend to family and friends.",
    "Had a positive experience. Minor wait time but quality care.",
    "Good service, clean environment, and helpful staff members.",
    "Professional treatment and decent facilities. Will come back again.",
    "The consultation was helpful and informative. Staff was courteous.",
    "Solid healthcare service. Met my expectations and then some.",
  ],
  average: [
    "Service was okay. Got the job done but nothing exceptional.",
    "Average experience. Could improve on waiting time.",
    "Decent service but had to wait longer than expected.",
    "Met basic expectations. Room for improvement in some areas.",
    "Standard service. Not bad but not outstanding either.",
  ],
  belowAverage: [
    "Waited quite a while. Staff seemed busy and somewhat rushed.",
    "Expected better service given the price. Had some issues with scheduling.",
    "Could improve on customer service. Treatment was okay though.",
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generatePatientName(): string {
  const firstName = patientFirstNames[Math.floor(Math.random() * patientFirstNames.length)];
  const lastName = patientLastNames[Math.floor(Math.random() * patientLastNames.length)];
  return `${firstName} ${lastName}`;
}

function generatePhoneNumber(): string {
  return `+639${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function generateEmail(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
}

function getRandomReviewComment(rating: number): string {
  if (rating === 5) {
    return reviewComments.excellent[Math.floor(Math.random() * reviewComments.excellent.length)];
  } else if (rating === 4) {
    return reviewComments.good[Math.floor(Math.random() * reviewComments.good.length)];
  } else if (rating === 3) {
    return reviewComments.average[Math.floor(Math.random() * reviewComments.average.length)];
  } else {
    return reviewComments.belowAverage[Math.floor(Math.random() * reviewComments.belowAverage.length)];
  }
}

function generateAppointmentTime(
  date: Date,
  hour: number,
  minute: number,
  slotDuration: number = 30
): { start: Date; end: Date } {
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const start = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+08:00`);
  const end = new Date(start.getTime() + slotDuration * 60 * 1000);
  return { start, end };
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }

  return items[items.length - 1];
}

function getRandomDateInRange(): Date {
  const start = createPHDate(START_DATE.year, START_DATE.month, START_DATE.day);
  const end = createPHDate(END_DATE.year, END_DATE.month, END_DATE.day);
  const diff = end.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * diff);
}

// ============================================================================
// SERVICE SELECTION TYPES
// ============================================================================

interface BookableService {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  includedServiceIds?: string[];
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function main() {
  console.log("🌱 Starting provider-specific bookings seeder...\n");
  console.log(`📋 Target Provider ID: ${TARGET_PROVIDER_ID}`);
  console.log(`📋 Target Completed: ${TARGET_COMPLETED}`);
  console.log(`📋 Target Cancelled: ${TARGET_CANCELLED}`);
  console.log(`📆 Date Range: ${START_DATE.month}/${START_DATE.day}/${START_DATE.year} - ${END_DATE.month}/${END_DATE.day}/${END_DATE.year}\n`);

  try {
    // ========================================================================
    // STEP 1: Find the target provider
    // ========================================================================

    const provider = await prisma.provider.findUnique({
      where: { id: TARGET_PROVIDER_ID },
      include: {
        user: true,
        category: true,
        operatingHours: true,
        breakTimes: true,
        services: {
          where: { isActive: true },
          include: {
            partOfPackages: true,
            includedServices: {
              include: {
                childService: true,
              },
            },
          },
        },
      },
    });

    if (!provider) {
      console.error(`❌ Provider not found with ID: ${TARGET_PROVIDER_ID}`);
      return;
    }

    console.log(`✅ Found provider: ${provider.healthcareName}`);
    console.log(`   Category: ${provider.category?.name || "N/A"}`);
    console.log(`   Status: ${provider.status}\n`);

    // ========================================================================
    // STEP 2: Create test users for booking
    // ========================================================================

    console.log("👥 Creating test users...");

    const testUsers: Array<{ id: string; name: string }> = [];
    const numUsers = 50;

    for (let i = 0; i < numUsers; i++) {
      const name = generatePatientName();
      const email = `providertest${i + 1}@himsog.test`;

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: "USER",
            emailVerified: true,
          },
        });
      }

      testUsers.push({ id: user.id, name: user.name });
    }

    console.log(`✅ Created/verified ${testUsers.length} test users\n`);

    // ========================================================================
    // STEP 3: Clean existing appointments for this provider
    // ========================================================================

    console.log("🧹 Cleaning existing appointments for this provider...");

    await prisma.review.deleteMany({ where: { providerId: provider.id } });
    await prisma.appointmentService.deleteMany({
      where: { appointment: { providerId: provider.id } },
    });
    await prisma.appointment.deleteMany({ where: { providerId: provider.id } });

    console.log("✅ Cleaned existing data\n");

    // ========================================================================
    // STEP 4: Determine bookable services
    // ========================================================================

    const servicesInPackages = new Set<string>();
    for (const service of provider.services) {
      if (service.type === ServiceType.PACKAGE) {
        for (const included of service.includedServices) {
          servicesInPackages.add(included.childServiceId);
        }
      }
    }

    const bookableSingleServices: BookableService[] = [];
    const bookablePackageServices: BookableService[] = [];

    for (const service of provider.services) {
      const price = service.fixedPrice || service.priceMin || 500;

      if (service.type === ServiceType.SINGLE) {
        if (!servicesInPackages.has(service.id)) {
          bookableSingleServices.push({
            id: service.id,
            name: service.name,
            type: service.type,
            price: Number(price),
          });
        }
      } else if (service.type === ServiceType.PACKAGE) {
        bookablePackageServices.push({
          id: service.id,
          name: service.name,
          type: service.type,
          price: Number(price),
          includedServiceIds: service.includedServices.map((inc) => inc.childServiceId),
        });
      }
    }

    const allBookableServices = [...bookableSingleServices, ...bookablePackageServices];

    if (allBookableServices.length === 0) {
      console.log("⚠️ No bookable services found for this provider!");
      return;
    }

    console.log(`📋 Bookable single services (standalone): ${bookableSingleServices.length}`);
    console.log(`📦 Bookable package services: ${bookablePackageServices.length}\n`);

    // ========================================================================
    // STEP 5: Build operating hours and break times maps
    // ========================================================================

    const operatingHoursMap = new Map<number, typeof provider.operatingHours[0]>();
    for (const oh of provider.operatingHours) {
      operatingHoursMap.set(oh.dayOfWeek, oh);
    }

    const breakTimesMap = new Map<number, Array<{ startTime: string; endTime: string }>>();
    for (const bt of provider.breakTimes) {
      if (!breakTimesMap.has(bt.dayOfWeek)) {
        breakTimesMap.set(bt.dayOfWeek, []);
      }
      breakTimesMap.get(bt.dayOfWeek)!.push({
        startTime: bt.startTime,
        endTime: bt.endTime,
      });
    }

    // ========================================================================
    // STEP 6: Create appointments
    // ========================================================================

    console.log("📅 Creating appointments...");

    const providerAppointments: Array<{
      id: string;
      status: AppointmentStatus;
      startTime: Date;
      totalPrice: Decimal;
      userId: string;
    }> = [];

    const usedSlots = new Map<string, Set<string>>();
    let globalAppointmentNumber = 50000 + Math.floor(Math.random() * 10000);

    let completedCount = 0;
    let cancelledCount = 0;
    let attempts = 0;
    const totalTarget = TARGET_COMPLETED + TARGET_CANCELLED;
    const maxAttempts = totalTarget * 20;

    while ((completedCount + cancelledCount) < totalTarget && attempts < maxAttempts) {
      attempts++;

      const appointmentDate = getRandomDateInRange();
      const dayOfWeek = getDayOfWeek(appointmentDate);
      const dateStr = appointmentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

      const operatingHour = operatingHoursMap.get(dayOfWeek);
      if (!operatingHour || operatingHour.isClosed) {
        continue;
      }

      const breakTimes = breakTimesMap.get(dayOfWeek) || [];
      const availableSlots = getAvailableSlots(operatingHour, breakTimes, provider.slotDuration);

      if (availableSlots.length === 0) {
        continue;
      }

      if (!usedSlots.has(dateStr)) {
        usedSlots.set(dateStr, new Set());
      }

      const usedSlotsForDate = usedSlots.get(dateStr)!;
      const unusedSlots = availableSlots.filter((slot) => {
        const slotKey = `${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`;
        return !usedSlotsForDate.has(slotKey);
      });

      if (unusedSlots.length === 0) {
        continue;
      }

      const selectedSlot = unusedSlots[Math.floor(Math.random() * unusedSlots.length)];
      const slotKey = `${String(selectedSlot.hour).padStart(2, "0")}:${String(selectedSlot.minute).padStart(2, "0")}`;
      usedSlotsForDate.add(slotKey);

      // Determine status based on remaining targets
      let status: AppointmentStatus;
      if (completedCount < TARGET_COMPLETED) {
        status = "COMPLETED";
        completedCount++;
      } else if (cancelledCount < TARGET_CANCELLED) {
        status = "CANCELLED";
        cancelledCount++;
      } else {
        break;
      }

      // Select services
      const selectedServices: Array<{ serviceId: string; price: number }> = [];
      const bookPackage = Math.random() < 0.4 && bookablePackageServices.length > 0;

      if (bookPackage) {
        const selectedPackage = bookablePackageServices[Math.floor(Math.random() * bookablePackageServices.length)];
        selectedServices.push({
          serviceId: selectedPackage.id,
          price: selectedPackage.price,
        });
      } else if (bookableSingleServices.length > 0) {
        const numServices = weightedRandom([1, 2, 3], [0.5, 0.35, 0.15]);
        const availableSingles = [...bookableSingleServices];

        for (let j = 0; j < numServices && availableSingles.length > 0; j++) {
          const idx = Math.floor(Math.random() * availableSingles.length);
          const selected = availableSingles.splice(idx, 1)[0];
          selectedServices.push({
            serviceId: selected.id,
            price: selected.price,
          });
        }
      } else if (bookablePackageServices.length > 0) {
        const selectedPackage = bookablePackageServices[Math.floor(Math.random() * bookablePackageServices.length)];
        selectedServices.push({
          serviceId: selectedPackage.id,
          price: selectedPackage.price,
        });
      } else {
        continue;
      }

      const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
      const user = testUsers[Math.floor(Math.random() * testUsers.length)];
      const patientName = generatePatientName();
      const { start, end } = generateAppointmentTime(
        appointmentDate,
        selectedSlot.hour,
        selectedSlot.minute,
        provider.slotDuration
      );

      const appointment = await prisma.appointment.create({
        data: {
          appointmentNumber: `APT-${globalAppointmentNumber++}`,
          userId: user.id,
          providerId: provider.id,
          startTime: start,
          endTime: end,
          status,
          totalPrice: new Decimal(totalPrice),
          patientName,
          patientEmail: generateEmail(patientName),
          patientPhone: generatePhoneNumber(),
          notes: status === "COMPLETED" ? "Appointment completed successfully." : undefined,
          activityNotes: status === "COMPLETED"
            ? "Patient attended the appointment. Services rendered as scheduled. Follow-up recommended if symptoms persist."
            : undefined,
          cancelledAt: status === "CANCELLED" ? start : undefined,
          cancellationReason: status === "CANCELLED"
            ? cancellationReasons[Math.floor(Math.random() * cancellationReasons.length)]
            : undefined,
          cancelledBy: status === "CANCELLED" ? user.id : undefined,
          createdAt: new Date(appointmentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });

      for (const { serviceId, price } of selectedServices) {
        await prisma.appointmentService.create({
          data: {
            appointmentId: appointment.id,
            serviceId,
            priceAtBooking: new Decimal(price),
          },
        });
      }

      providerAppointments.push({
        id: appointment.id,
        status: appointment.status,
        startTime: appointment.startTime,
        totalPrice: appointment.totalPrice,
        userId: user.id,
      });
    }

    console.log(`✅ Created ${completedCount + cancelledCount} appointments`);
    console.log(`   • Completed: ${completedCount}`);
    console.log(`   • Cancelled: ${cancelledCount}\n`);

    // ========================================================================
    // STEP 7: Generate reviews for completed appointments
    // ========================================================================

    console.log("⭐ Generating reviews for completed appointments...");

    const completedAppointments = providerAppointments.filter((apt) => apt.status === "COMPLETED");
    let reviewsCreated = 0;

    for (const appointment of completedAppointments) {
      const rating = weightedRandom([5, 4, 3, 2, 1], [0.5, 0.3, 0.15, 0.03, 0.02]);

      const variance = (): number => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.max(1, Math.min(5, rating + (Math.random() < 0.3 ? delta : 0)));
      };

      const professionalismRating = variance();
      const cleanlinessRating = variance();
      const waitTimeRating = Math.max(1, rating - Math.floor(Math.random() * 2));
      const valueRating = variance();

      const reviewDate = new Date(
        appointment.startTime.getTime() + (1 + Math.random() * 4) * 24 * 60 * 60 * 1000
      );

      await prisma.review.create({
        data: {
          appointmentId: appointment.id,
          userId: appointment.userId,
          providerId: provider.id,
          rating,
          comment: getRandomReviewComment(rating),
          isAnonymous: Math.random() < 0.1,
          professionalismRating,
          cleanlinessRating,
          waitTimeRating,
          valueRating,
          createdAt: reviewDate,
        },
      });

      reviewsCreated++;
    }

    console.log(`✅ Created ${reviewsCreated} reviews\n`);

    // ========================================================================
    // STEP 8: Print summary
    // ========================================================================

    console.log("=".repeat(70));
    console.log("🎉 PROVIDER BOOKINGS SEEDER COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   • Provider: ${provider.healthcareName}`);
    console.log(`   • Provider ID: ${provider.id}`);
    console.log(`   • Total Appointments: ${completedCount + cancelledCount}`);
    console.log(`   • Completed: ${completedCount}`);
    console.log(`   • Cancelled: ${cancelledCount}`);
    console.log(`   • Reviews Created: ${reviewsCreated}`);
    console.log(`\n📆 Date Range: October 1, 2025 - January 10, 2026`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
