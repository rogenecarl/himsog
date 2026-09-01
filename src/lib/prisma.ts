import net from "node:net";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Neon resolves to both A and AAAA records. On hosts that advertise IPv6 without
// a working route (WSL2, some containers), Node's happy-eyeballs races both and
// aborts the IPv4 attempt after 250ms - long before it completes - so every
// connection fails with ETIMEDOUT. Widening the per-attempt budget costs nothing
// where IPv6 works (it still wins the race immediately).
if (net.getDefaultAutoSelectFamilyAttemptTimeout() < 2000) {
  net.setDefaultAutoSelectFamilyAttemptTimeout(2000);
}

/**
 * ===========================================
 * DATABASE CONFIGURATION (Prisma 7)
 * ===========================================
 *
 * Prisma 7 requires an adapter for direct database connections.
 * This uses @prisma/adapter-pg for PostgreSQL.
 *
 * Works with any PostgreSQL provider:
 * - Neon (use pooled connection string with "-pooler" in hostname)
 * - Supabase (use Transaction mode pooler URL)
 * - Azure, Railway, Render, or any standard PostgreSQL
 */

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  // Create connection pool
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Use existing global instance or create new one
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
