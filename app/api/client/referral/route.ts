import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import { generateReferralCode, getReferralStats } from "@/server/services/referral.service";
import logger from "@/lib/logger";

export async function GET() {
  return traceApiRoute("GET /api/client/referral", async () => {
    try {
      const session = await requireAuth();

      const result = generateReferralCode(session.user.id);
      const stats = getReferralStats(session.user.id);

      return NextResponse.json({ ...result, stats });
    } catch (error) {
      logger.error({ err: error, route: "client/referral" }, "GET /api/client/referral error");

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
