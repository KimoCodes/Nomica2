import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import logger from "@/lib/logger";

export async function POST() {
  return traceApiRoute("POST /api/notifications/read-all", async () => {
    try {
      const session = await requireAuth();

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error({ err: error, route: "notifications/read-all" }, "POST error");

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
