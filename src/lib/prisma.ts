import { PrismaClient } from "@/lib/generated/prisma/client";

// Check if using Prisma Accelerate (connection string starts with prisma://)
const isAccelerate = process.env.DATABASE_URL?.startsWith("prisma://");

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Create Prisma client with or without Accelerate
const createPrismaClient = async () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Only use Accelerate extension if using Accelerate connection string
  if (isAccelerate) {
    const { withAccelerate } = await import("@prisma/extension-accelerate");
    return client.$extends(withAccelerate());
  }

  return client;
};

// For synchronous initialization (needed for module exports)
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;