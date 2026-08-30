import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAvailableCoaches, bookCoach, getClientBookings } from "@/server/services/coach-marketplace.service";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");

    const coaches = await getAvailableCoaches(specialty ?? undefined);
    return NextResponse.json({ coaches });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "GET /api/client/coaches error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { coachId, scheduledAt, durationMinutes, notes } = await request.json();

    if (!coachId || !scheduledAt) {
      return NextResponse.json({ error: "Coach ID and scheduled time are required" }, { status: 400 });
    }

    const booking = await bookCoach(
      session.user.id,
      coachId,
      new Date(scheduledAt),
      durationMinutes ?? 60,
      notes,
    );

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "POST /api/client/coaches error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
