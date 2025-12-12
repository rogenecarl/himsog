import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Create Prisma client - optionally with Accelerate if using prisma:// URL
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // If using Prisma Accelerate (prisma:// URL), extend with Accelerate
  // Note: For direct PostgreSQL connections, this is skipped
  if (process.env.DATABASE_URL?.startsWith("prisma://")) {
    // Dynamic import to avoid bundling when not needed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require("@prisma/extension-accelerate");
    return client.$extends(withAccelerate()) as unknown as PrismaClient;
  }

  return client;
}

// Use existing global instance or create new one
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;