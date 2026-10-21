import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const timingEnabled = process.env.PERFORMANCE_TIMING === "1";

  if (timingEnabled) {
    const client = new PrismaClient({
      adapter,
      log: [{ emit: "event", level: "query" }],
    });

    client.$on("query", ({ query, duration }) => {
      const operation = query.match(/^\s*(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i)?.[1]?.toUpperCase() ?? "QUERY";
      const table = query.match(/\b(?:FROM|JOIN|UPDATE|INTO)\s+(?:(?:"[^\"]+"|\w+)\.)?"?([A-Za-z_][\w$]*)"?/i)?.[1] ?? "unknown";

      // Deliberately omit SQL text and parameters: they can contain sensitive data.
      logger.info({ operation, table, durationMs: duration }, "database.query");
    });

    return client;
  }

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
