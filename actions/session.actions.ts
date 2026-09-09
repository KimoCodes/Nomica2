"use server";

import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  getSessionById,
  listSessions,
  getUpcomingSessions,
  getSessionStats,
  confirmSession,
  cancelSession,
  completeSession,
  markSessionMissed,
  requestReschedule,
  rescheduleSession,
  validateSessionAccess,
  hasConflictingSession,
} from "@/server/services/session.service";
import { requireClientProfile, requireCoachProfile } from "@/server/services/coach.service";
import {
  notifyBookingCreated,
  notifyBookingRequest,
  notifySessionConfirmed,
  notifySessionCancelled,
  notifySessionRescheduled,
  notifySessionCompleted,
} from "@/server/services/notification.service";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/server/utils/response";
import {
  createSessionSchema,
  cancelSessionSchema,
  rescheduleSessionSchema,
  sessionFilterSchema,
} from "@/server/validators/session.schema";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

// ─── Create Session ───────────────────────────────────────────────────────────

export async function createSessionAction(input: {
  coachProfileId: string;
  scheduledAt: string;
  durationMinutes?: number;
  sessionType?: string;
  notes?: string;
  meetingUrl?: string;
  location?: string;
}): Promise<ApiResponse<{ message: string; sessionId: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const clientProfile = await requireClientProfile(session.user.id);

    const parsed = createSessionSchema.safeParse({
      ...input,
      clientProfileId: clientProfile.id,
      sessionType: input.sessionType ?? "CONSULTATION",
    });

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const conflict = await hasConflictingSession(
      parsed.data.coachProfileId,
      new Date(parsed.data.scheduledAt),
      parsed.data.durationMinutes,
    );

    if (conflict) {
      return createErrorResponse(
        "This time slot conflicts with an existing session",
        "TIME_CONFLICT",
      );
    }

    const newSession = await createSession(
      session.user.id,
      Role.CLIENT,
      {
        ...parsed.data,
        scheduledAt: new Date(parsed.data.scheduledAt),
      },
    );

    const coachUser = await requireCoachProfile(parsed.data.coachProfileId)
      .then(p => prisma.user.findUnique({ where: { id: p.userId }, select: { id: true, name: true } }))
      .catch(() => null);

    if (coachUser) {
      await notifyBookingRequest(coachUser.id, session.user.name ?? "Client", new Date(parsed.data.scheduledAt));
    }

    await notifyBookingCreated(session.user.id, coachUser?.name ?? "Coach", new Date(parsed.data.scheduledAt));

    return createSuccessResponse({
      message: "Session booked successfully",
      sessionId: newSession.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CLIENT_PROFILE_NOT_FOUND") {
      return createErrorResponse("Client profile not found", "CLIENT_PROFILE_NOT_FOUND");
    }
    logger.error({ err: error, action: "createSessionAction" }, "Failed to create session");
    return createErrorResponse("Failed to book session", "INTERNAL_ERROR");
  }
}

// ─── Get Session ──────────────────────────────────────────────────────────────

export async function getSessionAction(sessionId: string): Promise<ApiResponse<Awaited<ReturnType<typeof getSessionById>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    await validateSessionAccess(session.user.id, session.user.role, sessionId);

    const sessionData = await getSessionById(sessionId);
    if (!sessionData) {
      return createErrorResponse("Session not found", "SESSION_NOT_FOUND");
    }

    return createSuccessResponse(sessionData);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    if (error instanceof Error && error.message === "SESSION_NOT_FOUND") {
      return createErrorResponse("Session not found", "SESSION_NOT_FOUND");
    }
    logger.error({ err: error, action: "getSessionAction" }, "Failed to get session");
    return createErrorResponse("Failed to load session", "INTERNAL_ERROR");
  }
}

// ─── List Sessions ────────────────────────────────────────────────────────────

export async function listSessionsAction(filter?: {
  status?: string;
  sessionType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Awaited<ReturnType<typeof listSessions>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const profileField = session.user.role === Role.CLIENT ? "clientProfileId" : "coachProfileId";
    const profile = session.user.role === Role.CLIENT
      ? await requireClientProfile(session.user.id)
      : await requireCoachProfile(session.user.id);

    const parsed = sessionFilterSchema.safeParse(filter ?? {});
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid filters",
        "VALIDATION_ERROR",
      );
    }

    const result = await listSessions({
      ...parsed.data,
      [profileField]: profile.id,
      from: parsed.data.from ? new Date(parsed.data.from) : undefined,
      to: parsed.data.to ? new Date(parsed.data.to) : undefined,
    });

    return createSuccessResponse(result);
  } catch (error) {
    logger.error({ err: error, action: "listSessionsAction" }, "Failed to list sessions");
    return createErrorResponse("Failed to load sessions", "INTERNAL_ERROR");
  }
}

// ─── Get Upcoming Sessions ────────────────────────────────────────────────────

export async function getUpcomingSessionsAction(limit?: number): Promise<ApiResponse<Awaited<ReturnType<typeof getUpcomingSessions>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const upcoming = await getUpcomingSessions(
      session.user.id,
      session.user.role,
      limit,
    );

    return createSuccessResponse(upcoming);
  } catch (error) {
    logger.error({ err: error, action: "getUpcomingSessionsAction" }, "Failed to get upcoming sessions");
    return createErrorResponse("Failed to load upcoming sessions", "INTERNAL_ERROR");
  }
}

// ─── Get Session Stats ────────────────────────────────────────────────────────

export async function getSessionStatsAction(): Promise<ApiResponse<Awaited<ReturnType<typeof getSessionStats>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const stats = await getSessionStats(session.user.id, session.user.role);
    return createSuccessResponse(stats);
  } catch (error) {
    logger.error({ err: error, action: "getSessionStatsAction" }, "Failed to get session stats");
    return createErrorResponse("Failed to load session stats", "INTERNAL_ERROR");
  }
}

// ─── Confirm Session ──────────────────────────────────────────────────────────

export async function confirmSessionAction(sessionId: string): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const access = await validateSessionAccess(session.user.id, session.user.role, sessionId);
    if (access.status !== "PENDING") {
      return createErrorResponse("Session is not in pending status", "INVALID_STATUS");
    }

    await confirmSession(sessionId);

    const otherUserId = access.clientProfile.userId;
    const coachUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
    await notifySessionConfirmed(otherUserId, "client", coachUser?.name ?? "Coach", access.scheduledAt);

    return createSuccessResponse({ message: "Session confirmed" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "confirmSessionAction" }, "Failed to confirm session");
    return createErrorResponse("Failed to confirm session", "INTERNAL_ERROR");
  }
}

// ─── Cancel Session ───────────────────────────────────────────────────────────

export async function cancelSessionAction(
  sessionId: string,
  reason?: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const access = await validateSessionAccess(session.user.id, session.user.role, sessionId);

    const parsed = cancelSessionSchema.safeParse({ reason });
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    await cancelSession(sessionId, parsed.data.reason);

    const otherUserId = session.user.role === Role.CLIENT ? access.coachProfile.userId : access.clientProfile.userId;
    const otherRole = session.user.role === Role.CLIENT ? "coach" as const : "client" as const;
    const cancellerName = session.user.name ?? (session.user.role === Role.CLIENT ? "Client" : "Coach");
    await notifySessionCancelled(otherUserId, otherRole, cancellerName, parsed.data.reason);

    return createSuccessResponse({ message: "Session cancelled" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "cancelSessionAction" }, "Failed to cancel session");
    return createErrorResponse("Failed to cancel session", "INTERNAL_ERROR");
  }
}

// ─── Complete Session ─────────────────────────────────────────────────────────

export async function completeSessionAction(
  sessionId: string,
  coachNotes?: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can complete sessions", "FORBIDDEN");
    }

    const access = await validateSessionAccess(session.user.id, session.user.role, sessionId);
    if (!["PENDING", "CONFIRMED", "RESCHEDULED"].includes(access.status)) {
      return createErrorResponse("Session cannot be completed in its current status", "INVALID_STATUS");
    }

    await completeSession(sessionId, coachNotes);

    await notifySessionCompleted(access.clientProfile.userId, session.user.name ?? "Coach");

    return createSuccessResponse({ message: "Session marked as completed" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "completeSessionAction" }, "Failed to complete session");
    return createErrorResponse("Failed to complete session", "INTERNAL_ERROR");
  }
}

// ─── Mark Session Missed ──────────────────────────────────────────────────────

export async function markSessionMissedAction(sessionId: string): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can mark sessions as missed", "FORBIDDEN");
    }

    const access = await validateSessionAccess(session.user.id, session.user.role, sessionId);
    if (!["PENDING", "CONFIRMED", "RESCHEDULED"].includes(access.status)) {
      return createErrorResponse("Session cannot be marked as missed in its current status", "INVALID_STATUS");
    }

    await markSessionMissed(sessionId);
    return createSuccessResponse({ message: "Session marked as missed" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "markSessionMissedAction" }, "Failed to mark session missed");
    return createErrorResponse("Failed to mark session as missed", "INTERNAL_ERROR");
  }
}

// ─── Request Reschedule ───────────────────────────────────────────────────────

export async function requestRescheduleAction(
  sessionId: string,
  reason?: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const access = await validateSessionAccess(session.user.id, session.user.role, sessionId);
    if (!["PENDING", "CONFIRMED"].includes(access.status)) {
      return createErrorResponse("Session cannot be rescheduled in its current status", "INVALID_STATUS");
    }

    await requestReschedule(sessionId, reason);
    return createSuccessResponse({ message: "Reschedule request sent" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "requestRescheduleAction" }, "Failed to request reschedule");
    return createErrorResponse("Failed to request reschedule", "INTERNAL_ERROR");
  }
}

// ─── Reschedule Session ───────────────────────────────────────────────────────

export async function rescheduleSessionAction(
  sessionId: string,
  newScheduledAt: string,
  reason?: string,
): Promise<ApiResponse<{ message: string; sessionId: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can reschedule sessions", "FORBIDDEN");
    }

    await validateSessionAccess(session.user.id, session.user.role, sessionId);

    const parsed = rescheduleSessionSchema.safeParse({ newScheduledAt, reason });
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const access = await validateSessionAccess(session.user.id, session.user.role, sessionId);
    const conflict = await hasConflictingSession(
      access.coachProfileId,
      new Date(parsed.data.newScheduledAt),
      access.durationMinutes,
      sessionId,
    );

    if (conflict) {
      return createErrorResponse(
        "The new time slot conflicts with an existing session",
        "TIME_CONFLICT",
      );
    }

    const newSession = await rescheduleSession(
      sessionId,
      new Date(parsed.data.newScheduledAt),
      parsed.data.reason,
    );

    const otherUserId = access.clientProfile.userId;
    const reschedulerName = session.user.name ?? "Coach";
    await notifySessionRescheduled(otherUserId, "client", reschedulerName, new Date(parsed.data.newScheduledAt));

    return createSuccessResponse({
      message: "Session rescheduled successfully",
      sessionId: newSession.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "rescheduleSessionAction" }, "Failed to reschedule session");
    return createErrorResponse("Failed to reschedule session", "INTERNAL_ERROR");
  }
}
