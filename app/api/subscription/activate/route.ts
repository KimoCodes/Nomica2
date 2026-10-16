import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ACTIVE_STATUSES } from "@/constants/subscriptions";

export const runtime = "nodejs";

/**
 * Compatibility status check for old checkout return URLs. A browser redirect
 * can no longer create or activate a subscription; only verified webhooks can
 * update legacy subscription records.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });

  return NextResponse.json({
    activated: Boolean(subscription && ACTIVE_STATUSES.includes(subscription.status)),
    source: "verified_record",
  }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
