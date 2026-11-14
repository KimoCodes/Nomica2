import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

function isNeonHost(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

/**
 * Returns the driver that matches the connection string.
 *
 * Neon hosts keep using the serverless (HTTP/WebSocket) driver they always
 * used; any other Postgres — CI service containers, docker-compose, a plain
 * local server — needs the TCP driver, because the Neon driver cannot speak
 * to it at all.
 */
export function createPrismaAdapter(connectionString: string | undefined) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  return isNeonHost(connectionString)
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });
}
