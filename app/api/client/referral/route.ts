import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import { getOrCreateReferralCode, getReferralStats } from "@/server/services/referral.service";
import logger from "@/lib/logger";

export async function GET() {
  return traceApiRoute("GET /api/client/referral", async () => {
    try {
      const session = await requireAuth();

      const result = await getOrCreateReferralCode(session.user.id);
      const stats = await getReferralStats(session.user.id);

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
