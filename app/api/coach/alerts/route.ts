import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireCoachProfile } from "@/server/services/coach.service";
import { rankClientsByRisk } from "@/server/services/fitness-engine/client-alerts";
import { buildCoachSummary } from "@/server/services/fitness-engine/coach-summary";
import type { ClientData } from "@/server/services/fitness-engine/client-alerts";
import { emitCoachAlert } from "@/server/socket/emitters";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await requireAuth();
    const coach = await requireCoachProfile(session.user.id);

    const clients = await prisma.clientProfile.findMany({
      where: { coachId: coach.userId },
      include: {
        user: { select: { name: true } },
        workoutCompletions: {
          orderBy: { completedAt: "desc" },
          take: 30,
          select: { completedAt: true },
        },
        checkIns: {
          orderBy: { weekStart: "desc" },
          take: 10,
          select: {
            submittedAt: true,
          },
        },
      },
    });

    const clientUserIds = clients.map((c) => c.userId);
    const conversations = await prisma.conversation.findMany({
      where: {
        coachId: coach.userId,
        clientId: { in: clientUserIds },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const lastMessageMap = new Map<string, Date>();
    for (const conv of conversations) {
      if (conv.messages.length > 0) {
        lastMessageMap.set(conv.clientId, conv.messages[0].createdAt);
      }
    }

    const clientDataList: ClientData[] = clients.map((c) => {
      const now = new Date();
      const last7 = new Date(now);
      last7.setDate(last7.getDate() - 7);
      const last30 = new Date(now);
      last30.setDate(last30.getDate() - 30);

      const completionsLast7 = c.workoutCompletions.filter(
        (w) => w.completedAt >= last7,
      ).length;
      const completionsLast30 = c.workoutCompletions.filter(
        (w) => w.completedAt >= last30,
      ).length;

      const lastWorkout = c.workoutCompletions[0];
      const lastWorkoutDaysAgo = lastWorkout
        ? Math.floor(
            (now.getTime() - lastWorkout.completedAt.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

      const checkinsWithResponse = c.checkIns.filter(
        (ci) => ci.submittedAt !== null,
      );
      const checkinResponseRate =
        c.checkIns.length > 0
          ? checkinsWithResponse.length / c.checkIns.length
          : 1;

      const lastMessageDate = lastMessageMap.get(c.userId);
      const lastMessageDaysAgo = lastMessageDate
        ? Math.floor(
            (now.getTime() - lastMessageDate.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

      const daysSinceStart = Math.floor(
        (now.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: c.id,
        name: c.user.name ?? "Client",
        completionsLast7Days: completionsLast7,
        completionsLast30Days: completionsLast30,
        expectedWeeklyWorkouts: 4,
        lastWorkoutDaysAgo,
        checkinResponseRate,
        unreadMessages: 0,
        lastMessageDaysAgo,
        progressTrend: null as "improving" | "stable" | "declining" | null,
        daysSinceStart,
        assignedProgram: true,
      };
    });

    const alerts = rankClientsByRisk(clientDataList);
    const summary = buildCoachSummary(clientDataList);

    const atRiskAlerts = alerts.filter((a) => a.riskLevel === "high" || a.riskLevel === "critical");
    if (atRiskAlerts.length > 0) {
      emitCoachAlert(coach.userId, atRiskAlerts.map((a) => ({
        clientId: a.clientId,
        clientName: a.clientName,
        riskLevel: a.riskLevel,
        riskScore: a.riskScore,
        suggestedActions: a.suggestedActions,
      })));
    }

    return NextResponse.json({ alerts, summary });
  } catch (error) {
    logger.error({ err: error, route: "coach/alerts" }, "GET /api/coach/alerts error");

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
