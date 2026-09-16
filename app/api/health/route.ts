import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Database connectivity check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (error) {
    checks.database = "error";
    healthy = false;
    logger.error({ err: error }, "Health check: database connection failed");
  }

  const status = healthy ? 200 : 503;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status },
  );
}
