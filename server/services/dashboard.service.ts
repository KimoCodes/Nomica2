import { Role, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getClientProfileByUserId,
  requireCoachProfile,
  requireClientProfile,
} from "@/server/services/coach.service";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function getAdminDashboardSummary() {
  const [
    totalUsers,
    activeSubscriptions,
    activeCoaches,
    pendingCoaches,
    totalRevenue,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: { status: { in: [SubscriptionStatus.active, SubscriptionStatus.trialing] } },
    }),
    prisma.coachProfile.count({ where: { approved: true } }),
    prisma.coachProfile.count({ where: { approved: false } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalUsers,
    activeSubscriptions,
    activeCoaches,
    pendingCoaches,
    revenueCents: totalRevenue._sum.amount ?? 0,
    recentUsers,
  };
}

export async function getCoachDashboardSummary(coachUserId: string) {
  const coach = await requireCoachProfile(coachUserId);

  const [
    activeClients,
    pendingClients,
    pendingReviews,
    programTemplates,
    recentMessages,
  ] = await Promise.all([
    prisma.clientProfile.count({ where: { coachId: coachUserId } }),
    prisma.clientProfile.count({
      where: { coachId: null, onboardingComplete: true },
    }),
    prisma.checkIn.count({
      where: {
        submittedAt: { not: null },
        response: null,
        clientProfile: { coachId: coachUserId },
      },
    }),
    prisma.program.count({ where: { coachId: coach.id, isTemplate: true } }),
    prisma.message.findMany({
      where: {
        conversation: { coachId: coachUserId },
        senderId: { not: coachUserId },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        content: true,
        createdAt: true,
        readAt: true,
        sender: { select: { name: true } },
      },
    }),
  ]);

  return {
    activeClients,
    pendingClients,
    pendingReviews,
    programTemplates,
    recentMessages,
  };
}

export async function getClientDashboardSummary(clientUserId: string) {
  const client = await requireClientProfile(clientUserId);
  const weekStart = startOfWeek();
  const nextWeekStart = addDays(weekStart, 7);

  const [
    latestProgress,
    previousProgress,
    weeklyCompletions,
    currentCheckIn,
    subscription,
  ] = await Promise.all([
    prisma.progressLog.findFirst({
      where: { clientProfileId: client.id },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.progressLog.findMany({
      where: { clientProfileId: client.id },
      orderBy: { loggedAt: "desc" },
      skip: 1,
      take: 1,
    }),
    prisma.workoutCompletion.count({
      where: {
        clientProfileId: client.id,
        completedAt: { gte: weekStart, lt: nextWeekStart },
      },
    }),
    prisma.checkIn.findFirst({
      where: { clientProfileId: client.id, weekStart },
      include: { response: true },
    }),
    prisma.subscription.findUnique({
      where: { userId: clientUserId },
      select: {
        plan: true,
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    }),
  ]);

  return {
    latestProgress,
    previousProgress: previousProgress[0] ?? null,
    weeklyCompletions,
    currentCheckIn,
    subscription,
  };
}

export async function getUserRoleCounts() {
  const counts = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });

  return {
    admins: counts.find((count) => count.role === Role.ADMIN)?._count.role ?? 0,
    coaches: counts.find((count) => count.role === Role.COACH)?._count.role ?? 0,
    clients: counts.find((count) => count.role === Role.CLIENT)?._count.role ?? 0,
  };
}

export async function getClientOnboardingState(userId: string) {
  const profile = await getClientProfileByUserId(userId);

  return {
    complete: profile?.onboardingComplete ?? false,
    hasCoach: Boolean(profile?.coachId),
  };
}
