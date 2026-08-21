import { FreeTrialStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { invalidateRequestCache } from "@/lib/request-cache";
import { createNotification } from "@/server/services/notification.service";

const MAX_TRIAL_DAYS = 90;

export async function grantFreeTrial({
  grantedById,
  grantedByRole,
  targetUserId,
  durationDays,
  startDate,
  reason,
}: {
  grantedById: string;
  grantedByRole: Role;
  targetUserId: string;
  durationDays: number;
  startDate?: Date;
  reason?: string;
}) {
  if (durationDays < 1 || durationDays > MAX_TRIAL_DAYS) {
    throw new Error(`Duration must be between 1 and ${MAX_TRIAL_DAYS} days`);
  }

  if (grantedByRole === Role.COACH) {
    const clientProfile = await prisma.clientProfile.findFirst({
      where: {
        userId: targetUserId,
        coachId: grantedById,
      },
    });

    if (!clientProfile) {
      throw new Error("You can only grant trials to your own clients");
    }
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true, name: true, email: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (targetUser.role !== Role.CLIENT) {
    throw new Error("Free trials can only be granted to clients");
  }

  const activeTrial = await prisma.freeTrial.findFirst({
    where: {
      userId: targetUserId,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
  });

  if (activeTrial) {
    throw new Error("This client already has an active free trial");
  }

  const now = new Date();
  const start = startDate && startDate > now ? startDate : now;
  const end = new Date(start);
  end.setDate(end.getDate() + durationDays);

  const trial = await prisma.freeTrial.create({
    data: {
      userId: targetUserId,
      grantedById,
      durationDays,
      startDate: start,
      endDate: end,
      status: "ACTIVE",
      reason: reason || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      grantedBy: { select: { id: true, name: true, email: true } },
    },
  });

  try {
    await createNotification({
      userId: targetUserId,
      type: "FREE_TRIAL_GRANTED",
      title: "Free trial granted",
      body: `You've been granted a ${durationDays}-day free trial${reason ? `: ${reason}` : ""}. Your trial expires on ${end.toLocaleDateString()}.`,
      link: "/client/subscription",
    });
  } catch {
    // Notification failure should not block trial grant
  }

  invalidateRequestCache(`sub:${targetUserId}`);
  invalidateRequestCache(`trial:${targetUserId}`);

  return trial;
}

export async function cancelFreeTrial({
  trialId,
  cancelledById,
  cancelledByRole,
}: {
  trialId: string;
  cancelledById: string;
  cancelledByRole: Role;
}) {
  const trial = await prisma.freeTrial.findUnique({
    where: { id: trialId },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!trial) {
    throw new Error("Free trial not found");
  }

  if (trial.status !== "ACTIVE") {
    throw new Error("This trial is no longer active");
  }

  if (cancelledByRole === Role.COACH && trial.grantedById !== cancelledById) {
    throw new Error("You can only cancel trials you granted");
  }

  const updated = await prisma.freeTrial.update({
    where: { id: trialId },
    data: { status: "CANCELLED" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      grantedBy: { select: { id: true, name: true, email: true } },
    },
  });

  try {
    await createNotification({
      userId: trial.userId,
      type: "FREE_TRIAL_CANCELLED",
      title: "Free trial cancelled",
      body: "Your free trial has been cancelled. Please subscribe to continue accessing premium features.",
      link: "/client/subscription",
    });
  } catch {
    // Notification failure should not block cancellation
  }

  invalidateRequestCache(`sub:${trial.userId}`);
  invalidateRequestCache(`trial:${trial.userId}`);

  return updated;
}

export async function getClientFreeTrial(userId: string) {
  return prisma.freeTrial.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
    include: {
      grantedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function hasActiveFreeTrial(userId: string): Promise<boolean> {
  const trial = await prisma.freeTrial.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    },
    select: { id: true },
  });

  return !!trial;
}

export async function getAllFreeTrials() {
  return prisma.freeTrial.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      grantedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getCoachFreeTrials(coachUserId: string) {
  return prisma.freeTrial.findMany({
    where: {
      grantedById: coachUserId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      grantedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function expireOverdueTrials() {
  const now = new Date();

  const expiredTrials = await prisma.freeTrial.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });

  if (expiredTrials.count > 0) {
    const trials = await prisma.freeTrial.findMany({
      where: {
        status: "EXPIRED",
        endDate: {
          gte: new Date(now.getTime() - 60 * 60 * 1000),
          lt: now,
        },
      },
      select: { userId: true },
    });

    for (const trial of trials) {
      invalidateRequestCache(`sub:${trial.userId}`);
      invalidateRequestCache(`trial:${trial.userId}`);

      try {
        await createNotification({
          userId: trial.userId,
          type: "FREE_TRIAL_EXPIRED",
          title: "Free trial expired",
          body: "Your free trial has expired. Subscribe to continue accessing premium features.",
          link: "/client/subscription",
        });
      } catch {
        // Notification failure should not block expiry
      }
    }
  }

  return expiredTrials.count;
}

export async function getFreeTrialForUser(userId: string) {
  return prisma.freeTrial.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      grantedBy: { select: { id: true, name: true, email: true } },
    },
  });
}
