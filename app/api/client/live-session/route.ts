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
    logger.error({ err: error }, "GET /api/client/live-session error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const { clientId, coachId } = body;

    let actualCoachId: string;
    let actualClientId: string;

    if (session.user.role === "COACH") {
      actualCoachId = session.user.id;

      // Verify the client is assigned to this coach
      if (clientId) {
        const clientProfile = await prisma.clientProfile.findFirst({
          where: {
            userId: clientId,
            coachId: session.user.id,
          },
          select: { id: true },
        });

        if (!clientProfile) {
          return NextResponse.json(
            { error: "This client is not assigned to you" },
            { status: 403 },
          );
        }
      }

      actualClientId = clientId;
    } else {
      actualClientId = session.user.id;

      if (coachId) {
        actualCoachId = coachId;
      } else {
        const profile = await prisma.clientProfile.findUnique({
          where: { userId: session.user.id },
          select: { coachId: true },
        });

        if (!profile?.coachId) {
          return NextResponse.json(
            { error: "No coach assigned. Please contact support." },
            { status: 400 },
          );
        }

        actualCoachId = profile.coachId;
      }
    }

    if (!actualCoachId || !actualClientId) {
      return NextResponse.json(
        { error: "Coach ID and Client ID are required" },
        { status: 400 },
      );
    }

    const liveSession = createLiveSession(actualCoachId, actualClientId);

    return NextResponse.json({
      sessionId: liveSession.id,
      status: liveSession.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "POST /api/client/live-session error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
