import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getClientFitnessIntelligence } from "@/server/services/dashboard.service";
import { traceApiRoute } from "@/lib/sentry-tracing";
import logger from "@/lib/logger";

export async function GET() {
  return traceApiRoute("GET /api/client/fitness", async () => {
    try {
      const session = await requireAuth();
      const data = await getClientFitnessIntelligence(session.user.id);
      return NextResponse.json(data);
    } catch (error) {
      logger.error({ err: error, route: "client/fitness" }, "GET /api/client/fitness error");

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
