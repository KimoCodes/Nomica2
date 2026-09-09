import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLiveSession, getActiveSession } from "@/server/services/live-coaching.service";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await requireAuth();
    const activeSession = getActiveSession(session.user.id);

    if (activeSession) {
      return NextResponse.json({
        sessionId: activeSession.id,
        status: activeSession.status,
        startedAt: activeSession.startedAt,
      });
    }

    return NextResponse.json({ sessionId: null });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "GET /api/coach/live-session error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { clientId } = await request.json();

    if (session.user.role !== "COACH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 },
      );
    }

    const clientExists = await prisma.clientProfile.findFirst({
      where: { userId: clientId, coachId: session.user.id },
    });

    if (!clientExists) {
      return NextResponse.json(
        { error: "Client not found or not assigned to you" },
        { status: 404 },
      );
    }

    const liveSession = createLiveSession(session.user.id, clientId);

    return NextResponse.json({
      sessionId: liveSession.id,
      status: liveSession.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "POST /api/coach/live-session error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
