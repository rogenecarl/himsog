import { NextRequest, NextResponse } from "next/server";
import { genAI, MODEL_NAME } from "@/lib/gemini";
import prisma from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP
const MAX_MESSAGE_LENGTH = 500; // Maximum characters allowed per message
const MAX_CONVERSATION_HISTORY = 20; // Maximum messages in conversation history

// In-memory rate limit store (for production, consider Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

function getRateLimitKey(req: NextRequest): string {
  // Get IP from headers (works with proxies/load balancers)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  return `chat:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Create new window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  // Increment count
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM INSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

// System instruction for the healthcare assistant
const SYSTEM_INSTRUCTION = `You are **Himsog AI**, the official virtual assistant for the **Himsog** healthcare platform. You are professional, courteous, and focused exclusively on assisting users with Himsog-related inquiries.

═══════════════════════════════════════════════════════════════════════════════
STRICT SCOPE POLICY (CRITICAL - MUST FOLLOW)
═══════════════════════════════════════════════════════════════════════════════

You MUST ONLY respond to questions related to:
• **Himsog** platform features, services, and functionality
• Healthcare providers listed on the platform
• Appointment booking process
• Services and categories available on Himsog
• The project creators and development team
• General navigation and usage of the platform

You MUST POLITELY DECLINE to answer questions about:
• General knowledge questions unrelated to Himsog (e.g., history, science, math, geography)
• Medical diagnoses, treatment recommendations, or health advice
• Other websites, apps, or platforms
• Personal opinions or debates
• Coding, programming, or technical assistance
• News, current events, or entertainment
• Any topic not directly related to the Himsog platform

DECLINE RESPONSE TEMPLATE:
"I appreciate your question, but I'm specifically designed to assist with **Himsog**-related inquiries only. I can help you with:

• Finding healthcare providers in Digos City
• Booking appointments
• Exploring available services
• Learning about the Himsog platform

Is there anything related to Himsog I can help you with today?"

═══════════════════════════════════════════════════════════════════════════════
ABOUT HIMSOG
═══════════════════════════════════════════════════════════════════════════════

**HIMSOG** stands for **Healthcare Information and Medical-Services Search with Online-Booking and Geolocation**. It is a comprehensive healthcare provider directory and appointment booking platform serving **Digos City** and **Davao del Sur, Philippines**.

Our mission is to enhance healthcare accessibility by connecting patients with quality healthcare services through modern technology.

═══════════════════════════════════════════════════════════════════════════════
PROJECT CREATORS
═══════════════════════════════════════════════════════════════════════════════

**Himsog** was developed by a dedicated team:

• **Rogene Carl L. Rosalijos** — Full-Stack Developer
• **Rovic Constantino** — Project Manager
• **Dan Jover Peloriana** — Project Manager

Their combined expertise in technology and understanding of local healthcare needs made this platform possible.

═══════════════════════════════════════════════════════════════════════════════
KEY FEATURES
═══════════════════════════════════════════════════════════════════════════════

1. **Healthcare Provider Directory** — Browse verified clinics, hospitals, and healthcare facilities
2. **Online Appointment Booking** — Schedule appointments with your preferred provider
3. **Service Search** — Find specific medical services (consultations, diagnostics, treatments)
4. **Geolocation Search** — Discover healthcare providers near your location
5. **Provider Profiles** — View detailed information including services and operating hours

═══════════════════════════════════════════════════════════════════════════════
APPOINTMENT BOOKING PROCESS
═══════════════════════════════════════════════════════════════════════════════

1. Browse or search for healthcare providers
2. Review provider details, services, and available time slots
3. Select your preferred date and time
4. Complete your contact information and appointment details
5. Submit your booking request
6. Receive confirmation via the platform
7. Await final confirmation from the provider

═══════════════════════════════════════════════════════════════════════════════
SERVICE AREA
═══════════════════════════════════════════════════════════════════════════════

• **Digos City**
• **Davao del Sur, Philippines**

═══════════════════════════════════════════════════════════════════════════════
RESPONSE GUIDELINES
═══════════════════════════════════════════════════════════════════════════════

FORMATTING RULES:
• Use **bold text** for all proper names (providers, clinics, hospitals, team members, platform name)
• Use numbered lists (1., 2., 3.) when listing healthcare providers
• Use bullet points (•) for listing features or services
• Maintain clear line spacing between sections
• Keep responses concise yet comprehensive
• Limit emoji usage to functional icons only (📍 for location, 📞 for phone, 💊 for services)

TONE:
• Professional and formal
• Courteous and helpful
• Clear and direct
• Never condescending

MEDICAL DISCLAIMER:
When users ask for medical advice, respond with:
"I'm not qualified to provide medical advice or diagnoses. For health concerns, I recommend booking an appointment with a qualified healthcare provider through **Himsog**. Would you like me to help you find a provider?"

═══════════════════════════════════════════════════════════════════════════════
DATABASE CONTEXT HANDLING
═══════════════════════════════════════════════════════════════════════════════

When database information is provided (marked with 📋, 💊, or 🏥), incorporate that real data into your response using this format:

PROVIDER FORMAT:
1. **[Provider Name]**
   📍 [Address], [City]
   📞 [Phone Number]
   💊 Services: [Service List]

SERVICE FORMAT:
• **[Service Name]** — [Description]
  💰 Price: ₱[Amount]
  🏥 Available at: **[Provider Name]**

Always present real data professionally and accurately.`;

// Helper function to detect if user is asking about providers or services
async function getRelevantData(message: string) {
  const lowerMessage = message.toLowerCase();
  let contextData = "";

  // Check if user is asking about providers/clinics/hospitals
  if (
    lowerMessage.includes("provider") ||
    lowerMessage.includes("clinic") ||
    lowerMessage.includes("hospital") ||
    lowerMessage.includes("near me") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("where")
  ) {
    try {
      const providers = await prisma.provider.findMany({
        where: {
          status: "VERIFIED",
        },
        include: {
          category: true,
          services: {
            where: { isActive: true },
            take: 3,
          },
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });

      if (providers.length > 0) {
        contextData += "\n\n📋 AVAILABLE HEALTHCARE PROVIDERS:\n";
        providers.forEach((provider, idx) => {
          contextData += `\n${idx + 1}. ${provider.healthcareName}`;
          if (provider.category) {
            contextData += ` (${provider.category.name})`;
          }
          contextData += `\n   📍 ${provider.address}, ${provider.city}`;
          if (provider.phoneNumber) {
            contextData += `\n   📞 ${provider.phoneNumber}`;
          }
          if (provider.services.length > 0) {
            contextData += `\n   💊 Services: ${provider.services.map(s => s.name).join(", ")}`;
          }
        });
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  }

  // Check if user is asking about services
  if (
    lowerMessage.includes("service") ||
    lowerMessage.includes("treatment") ||
    lowerMessage.includes("what can") ||
    lowerMessage.includes("available")
  ) {
    try {
      const services = await prisma.service.findMany({
        where: {
          isActive: true,
        },
        include: {
          provider: {
            select: {
              healthcareName: true,
              city: true,
            },
          },
        },
        take: 15,
        orderBy: {
          name: "asc",
        },
      });

      if (services.length > 0) {
        // Group services by name to avoid duplicates
        const uniqueServices = new Map<string, typeof services[0]>();
        services.forEach(service => {
          if (!uniqueServices.has(service.name)) {
            uniqueServices.set(service.name, service);
          }
        });

        contextData += "\n\n💊 AVAILABLE SERVICES:\n";
        Array.from(uniqueServices.values()).forEach((service, idx) => {
          contextData += `\n${idx + 1}. ${service.name}`;
          if (service.description) {
            contextData += ` - ${service.description}`;
          }
          if (service.priceMin > 0 || service.priceMax > 0) {
            contextData += `\n   💰 Price: ₱${service.priceMin}${service.priceMax > service.priceMin ? ` - ₱${service.priceMax}` : ""}`;
          }
          contextData += `\n   🏥 Available at: ${service.provider.healthcareName}`;
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  // Check if user is asking about categories
  if (
    lowerMessage.includes("category") ||
    lowerMessage.includes("categories") ||
    lowerMessage.includes("type")
  ) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: { providers: true },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

      if (categories.length > 0) {
        contextData += "\n\n🏥 HEALTHCARE CATEGORIES:\n";
        categories.forEach((category, idx) => {
          contextData += `\n${idx + 1}. ${category.name}`;
          if (category.description) {
            contextData += ` - ${category.description}`;
          }
          contextData += ` (${category._count.providers} providers)`;
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  return contextData;
}

export async function POST(req: NextRequest) {
  try {
    // ═══════════════════════════════════════════════════════════════════════════
    // RATE LIMIT CHECK
    // ═══════════════════════════════════════════════════════════════════════════
    const rateLimitKey = getRateLimitKey(req);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      const resetInSeconds = Math.ceil(rateLimit.resetIn / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please wait ${resetInSeconds} seconds before trying again.`,
          resetIn: resetInSeconds,
          success: false,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(rateLimit.resetIn / 1000).toString(),
            "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INPUT VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════
    const { message, conversationHistory } = await req.json();

    // Validate message exists and is a string
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required", success: false },
        { status: 400 }
      );
    }

    // Trim and validate message length
    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty", success: false },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: "Message too long",
          message: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters. Current length: ${trimmedMessage.length}`,
          maxLength: MAX_MESSAGE_LENGTH,
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate and limit conversation history
    const safeConversationHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .slice(-MAX_CONVERSATION_HISTORY)
          .filter(
            (msg): msg is { role: string; text: string } =>
              typeof msg === "object" &&
              msg !== null &&
              typeof msg.role === "string" &&
              typeof msg.text === "string" &&
              msg.text.length <= MAX_MESSAGE_LENGTH
          )
      : [];

    // Get relevant data from database based on user query
    const databaseContext = await getRelevantData(trimmedMessage);

    // Build conversation history for context
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I am ready to assist users in finding healthcare providers and services in Digos City and Davao del Sur with a professional and helpful demeanor." }],
      },
      ...safeConversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [{ text: trimmedMessage + databaseContext }],
      },
    ];

    // Generate response with Gemini
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents,
    });

    let reply = response.text || "I apologize, I could not generate a response at this time. Please try again.";

    // Clean up markdown formatting for better readability
    // REMOVED THE REGEX THAT WAS STRIPPING THE BOLD FORMATTING
    reply = reply
      .replace(/^- /gm, '• ')           // Replace - with bullet •
      .replace(/^   - /gm, '   • ')       // Replace nested - with bullet
      .trim();

    return NextResponse.json({ 
      reply,
      success: true 
    });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}