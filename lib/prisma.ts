import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 5 reads DATABASE_URL from schema.prisma automatically
// If you need to override it, set DATABASE_URL environment variable
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Check if database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safe database operation wrapper
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check if it's a connection error
    if (
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes("connect ECONNREFUSED") ||
      error?.code === "P1001"
    ) {
      console.warn("Database not available, using fallback value");
      return fallback;
    }
    // Re-throw other errors
    throw error;
  }
}

