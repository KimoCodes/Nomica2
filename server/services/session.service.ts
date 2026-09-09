import { SessionStatus, SessionType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireClientProfile, requireCoachProfile } from "./coach.service";

type CreateSessionInput = {
  clientProfileId: string;
  coachProfileId: string;
  scheduledAt: Date;
  durationMinutes: number;
  sessionType: SessionType;
  notes?: string;
  meetingUrl?: string;
  location?: string;
};

type UpdateSessionInput = {
  status?: SessionStatus;
  notes?: string;
  cancellationReason?: string;
  rescheduleReason?: string;
  meetingUrl?: string;
  location?: string;
  coachNotes?: string;
  sessionType?: SessionType;
  durationMinutes?: number;
  scheduledAt?: Date;
};

type SessionFilter = {
  clientProfileId?: string;
  coachProfileId?: string;
  status?: SessionStatus;
  sessionType?: SessionType;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
};

// ─── Create Session ───────────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  userRole: Role,
  input: CreateSessionInput,
) {
  const session = await prisma.coachBooking.create({
    data: {
      clientProfileId: input.clientProfileId,
      coachProfileId: input.coachProfileId,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      sessionType: input.sessionType,
      status: "PENDING",
      notes: input.notes,
      meetingUrl: input.meetingUrl,
      location: input.location,
      createdBy: userId,
    },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return session;
}

// ─── Get Session By ID ────────────────────────────────────────────────────────

export async function getSessionById(sessionId: string) {
  return prisma.coachBooking.findUnique({
    where: { id: sessionId },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      rescheduledBookings: {
        select: { id: true, scheduledAt: true, status: true },
      },
      exercisePlans: {
        select: { id: true, name: true, status: true },
      },
      nutritionPlans: {
        select: { id: true, name: true, status: true },
      },
    },
  });
}

// ─── List Sessions ────────────────────────────────────────────────────────────

export async function listSessions(filter: SessionFilter) {
  const where: Record<string, unknown> = {};

  if (filter.clientProfileId) where.clientProfileId = filter.clientProfileId;
  if (filter.coachProfileId) where.coachProfileId = filter.coachProfileId;
  if (filter.status) where.status = filter.status;
  if (filter.sessionType) where.sessionType = filter.sessionType;

  if (filter.from || filter.to) {
    where.scheduledAt = {};
    if (filter.from) (where.scheduledAt as Record<string, Date>).gte = filter.from;
    if (filter.to) (where.scheduledAt as Record<string, Date>).lte = filter.to;
  }

  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.coachBooking.findMany({
      where,
      include: {
        clientProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        coachProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      },
      orderBy: { scheduledAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.coachBooking.count({ where }),
  ]);

  return {
    sessions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Get Upcoming Sessions ────────────────────────────────────────────────────

export async function getUpcomingSessions(
  userId: string,
  userRole: Role,
  limit = 5,
) {
  const now = new Date();
  const where: Record<string, unknown> = {
    scheduledAt: { gte: now },
    status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] as SessionStatus[] },
  };

  if (userRole === Role.CLIENT) {
    const profile = await requireClientProfile(userId);
    where.clientProfileId = profile.id;
  } else if (userRole === Role.COACH) {
    const profile = await requireCoachProfile(userId);
    where.coachProfileId = profile.id;
  }

  return prisma.coachBooking.findMany({
    where,
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });
}

// ─── Get Session Stats ────────────────────────────────────────────────────────

export async function getSessionStats(userId: string, userRole: Role) {
  const now = new Date();
  const profileField = userRole === Role.CLIENT ? "clientProfileId" : "coachProfileId";
  const profile = userRole === Role.CLIENT
    ? await requireClientProfile(userId)
    : await requireCoachProfile(userId);

  const whereBase = { [profileField]: profile.id };

  const [upcoming, completed, cancelled, missed, pending] = await Promise.all([
    prisma.coachBooking.count({
      where: { ...whereBase, scheduledAt: { gte: now }, status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] as SessionStatus[] } },
    }),
    prisma.coachBooking.count({
      where: { ...whereBase, status: "COMPLETED" },
    }),
    prisma.coachBooking.count({
      where: { ...whereBase, status: "CANCELLED" },
    }),
    prisma.coachBooking.count({
      where: { ...whereBase, status: "MISSED" },
    }),
    prisma.coachBooking.count({
      where: { ...whereBase, status: "PENDING" },
    }),
  ]);

  return { upcoming, completed, cancelled, missed, pending };
}

// ─── Update Session ───────────────────────────────────────────────────────────

export async function updateSession(
  sessionId: string,
  input: UpdateSessionInput,
) {
  return prisma.coachBooking.update({
    where: { id: sessionId },
    data: {
      ...input,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

// ─── Cancel Session ───────────────────────────────────────────────────────────

export async function cancelSession(
  sessionId: string,
  reason?: string,
) {
  return prisma.coachBooking.update({
    where: { id: sessionId },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
    },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

// ─── Confirm Session ──────────────────────────────────────────────────────────

export async function confirmSession(sessionId: string) {
  return prisma.coachBooking.update({
    where: { id: sessionId },
    data: { status: "CONFIRMED", clientConfirmed: true },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

// ─── Complete Session ─────────────────────────────────────────────────────────

export async function completeSession(
  sessionId: string,
  coachNotes?: string,
) {
  return prisma.coachBooking.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      coachNotes,
    },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

// ─── Mark Session Missed ──────────────────────────────────────────────────────

export async function markSessionMissed(sessionId: string) {
  return prisma.coachBooking.update({
    where: { id: sessionId },
    data: { status: "MISSED" },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

// ─── Request Reschedule ───────────────────────────────────────────────────────

export async function requestReschedule(
  sessionId: string,
  reason?: string,
) {
  return prisma.coachBooking.update({
    where: { id: sessionId },
    data: {
      status: "RESCHEDULE_REQUESTED",
      rescheduleReason: reason,
    },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

// ─── Reschedule Session ───────────────────────────────────────────────────────

export async function rescheduleSession(
  sessionId: string,
  newScheduledAt: Date,
  reason?: string,
) {
  const original = await prisma.coachBooking.update({
    where: { id: sessionId },
    data: { status: "RESCHEDULED" },
  });

  const newSession = await prisma.coachBooking.create({
    data: {
      clientProfileId: original.clientProfileId,
      coachProfileId: original.coachProfileId,
      scheduledAt: newScheduledAt,
      durationMinutes: original.durationMinutes,
      sessionType: original.sessionType,
      status: "CONFIRMED",
      notes: original.notes,
      meetingUrl: original.meetingUrl,
      location: original.location,
      createdBy: original.createdBy,
      rescheduleOfId: sessionId,
      rescheduleReason: reason,
    },
    include: {
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return newSession;
}

// ─── Validate Session Access ──────────────────────────────────────────────────

export async function validateSessionAccess(
  userId: string,
  userRole: Role,
  sessionId: string,
) {
  const session = await prisma.coachBooking.findUnique({
    where: { id: sessionId },
    include: {
      clientProfile: { select: { userId: true } },
      coachProfile: { select: { userId: true } },
    },
  });

  if (!session) throw new Error("SESSION_NOT_FOUND");

  if (userRole === Role.CLIENT && session.clientProfile.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  if (userRole === Role.COACH && session.coachProfile.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  if (userRole === Role.ADMIN) return session;

  return session;
}

// ─── Check for Conflicting Sessions ──────────────────────────────────────────

export async function hasConflictingSession(
  coachProfileId: string,
  scheduledAt: Date,
  durationMinutes: number,
  excludeSessionId?: string,
) {
  const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

  const conflict = await prisma.coachBooking.findFirst({
    where: {
      coachProfileId,
      id: excludeSessionId ? { not: excludeSessionId } : undefined,
      status: { notIn: ["CANCELLED", "MISSED"] as SessionStatus[] },
      scheduledAt: { lt: endTime },
    },
  });

  if (conflict) {
    const conflictEnd = new Date(
      conflict.scheduledAt.getTime() + conflict.durationMinutes * 60 * 1000,
    );
    if (conflictEnd > scheduledAt) return conflict;
  }

  return null;
}
