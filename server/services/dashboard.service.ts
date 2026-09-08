import { Role, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requestCache } from "@/lib/request-cache";
import {
  getClientProfileByUserId,
  requireCoachProfile,
  requireClientProfile,
} from "@/server/services/coach.service";
import { getSubscriptionForClient } from "@/server/services/subscription.service";
import { calculateReadinessScore } from "@/server/services/fitness-engine/readiness";
import { calculateConsistencyScore } from "@/server/services/fitness-engine/consistency";
import { calculatePersonalRecords } from "@/server/services/fitness-engine/personal-records";
import { generateRecoveryInsights } from "@/server/services/fitness-engine/recovery";
import type { WorkoutHistoryEntry, HabitData, CheckInData } from "@/server/services/fitness-engine/types";

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

async function fetchWorkoutHistory(clientProfileId: string): Promise<WorkoutHistoryEntry[]> {
  const completions = await prisma.workoutCompletion.findMany({
    where: { clientProfileId },
    orderBy: { completedAt: "asc" },
    include: {
      programDay: {
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      },
      setLogs: true,
    },
  });

  return completions.map((c) => ({
    completedAt: c.completedAt,
    dayTitle: c.programDay.title ?? `Week ${c.programDay.weekId}, Day ${c.programDay.dayNumber}`,
    exercises: c.programDay.exercises.map((pe) => ({
      exerciseId: pe.exercise.id,
      exerciseName: pe.exercise.name,
      muscleGroup: pe.exercise.muscleGroup,
      sets: c.setLogs
        .filter((sl) => sl.programExerciseId === pe.id)
        .map((sl) => ({
          actualReps: sl.actualReps,
          actualWeight: sl.actualWeight,
          completed: sl.completed,
          setNumber: sl.setNumber,
        })),
      completedAt: c.completedAt,
    })),
  }));
}

async function fetchHabitData(userId: string): Promise<HabitData[]> {
  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: { logs: { orderBy: { date: "desc" }, take: 14 } },
  });

  return habits.flatMap((h) =>
    h.logs.map((log) => ({
      type: h.type,
      value: log.value,
      target: h.target,
      date: log.date,
    })),
  );
}

export async function getAdminDashboardSummary() {
  const [
    totalUsers,
    activeSubscriptions,
    activeCoaches,
    pendingCoaches,
    totalRevenue,
    recentUsers,
    roleCounts,
    subscriptionStatusCounts,
    totalClients,
    totalPrograms,
    recentWorkoutCompletions,
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
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.clientProfile.count(),
    prisma.program.count({ where: { isTemplate: false } }),
    prisma.workoutCompletion.count({
      where: {
        completedAt: { gte: startOfToday() },
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
    roleCounts: {
      admins: roleCounts.find((c) => c.role === Role.ADMIN)?._count.role ?? 0,
      coaches: roleCounts.find((c) => c.role === Role.COACH)?._count.role ?? 0,
      clients: roleCounts.find((c) => c.role === Role.CLIENT)?._count.role ?? 0,
    },
    subscriptionStatusCounts: {
      active: subscriptionStatusCounts.find((c) => c.status === SubscriptionStatus.active)?._count.status ?? 0,
      trialing: subscriptionStatusCounts.find((c) => c.status === SubscriptionStatus.trialing)?._count.status ?? 0,
      canceled: subscriptionStatusCounts.find((c) => c.status === SubscriptionStatus.canceled)?._count.status ?? 0,
      pastDue: subscriptionStatusCounts.find((c) => c.status === SubscriptionStatus.past_due)?._count.status ?? 0,
    },
    totalClients,
    totalPrograms,
    recentWorkoutCompletions,
  };
}

export async function getCoachDashboardSummary(coachUserId: string) {
  return requestCache(`coach-dashboard:${coachUserId}`, async () => {
    const coach = await requireCoachProfile(coachUserId);

  const [
    activeClients,
    pendingClients,
    pendingReviews,
    programTemplates,
    recentMessages,
    recentClientWorkouts,
    pendingCheckIns,
    programUtilization,
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
    prisma.workoutCompletion.findMany({
      where: { clientProfile: { coachId: coachUserId } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        completedAt: true,
        clientProfile: {
          select: { user: { select: { name: true } } },
        },
        programDay: {
          select: {
            title: true,
            dayNumber: true,
            week: { select: { weekNumber: true } },
          },
        },
      },
    }),
    prisma.checkIn.findMany({
      where: {
        clientProfile: { coachId: coachUserId },
        submittedAt: null,
        response: null,
      },
      orderBy: { weekStart: "asc" },
      take: 5,
      select: {
        id: true,
        weekStart: true,
        clientProfile: {
          select: { user: { select: { name: true } } },
        },
      },
    }),
    prisma.clientProgram.findMany({
      where: {
        isActive: true,
        program: { coachId: coach.id },
      },
      select: {
        program: { select: { title: true } },
      },
    }),
  ]);

  // Count clients per program
  const programCounts: Record<string, number> = {};
  for (const cp of programUtilization) {
    const title = cp.program.title;
    programCounts[title] = (programCounts[title] ?? 0) + 1;
  }

  return {
    activeClients,
    pendingClients,
    pendingReviews,
    programTemplates,
    recentMessages,
    recentClientWorkouts,
    pendingCheckIns,
    programUtilization: Object.entries(programCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count),
  };
  }, 30_000);
}

export async function getClientDashboardSummary(clientUserId: string) {
  return requestCache(`client-dashboard:${clientUserId}`, async () => {
    const client = await requireClientProfile(clientUserId);
  const weekStart = startOfWeek();
  const nextWeekStart = addDays(weekStart, 7);

  const [
    latestProgress,
    previousProgress,
    weeklyCompletions,
    currentCheckIn,
    subscription,
    weightTrend,
    totalCompletions,
    lastCompletion,
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
    getSubscriptionForClient(clientUserId),
    prisma.progressLog.findMany({
      where: { clientProfileId: client.id, weight: { not: null } },
      orderBy: { loggedAt: "asc" },
      take: 30,
      select: { id: true, weight: true, loggedAt: true },
    }),
    prisma.workoutCompletion.count({
      where: { clientProfileId: client.id },
    }),
    prisma.workoutCompletion.findFirst({
      where: { clientProfileId: client.id },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    }),
  ]);

  // Calculate workout streak (consecutive days with completions, counting back from today)
  let streak = 0;
  if (totalCompletions > 0 && lastCompletion) {
    const today = startOfToday();
    const dayAfterLast = new Date(lastCompletion.completedAt);
    dayAfterLast.setHours(0, 0, 0, 0);
    const daysSinceLast = Math.floor(
      (today.getTime() - dayAfterLast.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceLast <= 1) {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCompletions = await prisma.workoutCompletion.findMany({
        where: {
          clientProfileId: client.id,
          completedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true },
      });

      const completionDays = new Set(
        recentCompletions.map((c) => {
          const d = new Date(c.completedAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        }),
      );

      const checkDate = new Date(today);
      checkDate.setHours(0, 0, 0, 0);

      while (completionDays.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  return {
    latestProgress,
    previousProgress: previousProgress[0] ?? null,
    weeklyCompletions,
    currentCheckIn,
    subscription,
    weightTrend: weightTrend
      .filter((p) => p.weight !== null)
      .map((p) => ({
        id: p.id,
        label: p.loggedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: p.weight!,
      })),
    streak,
    totalCompletions,
  };
  }, 30_000);
}

export async function getClientFitnessIntelligence(clientUserId: string) {
  return requestCache(`client-fitness:${clientUserId}`, async () => {
    const client = await requireClientProfile(clientUserId);

  const [workoutHistory, habits, latestCheckIn] = await Promise.all([
    fetchWorkoutHistory(client.id),
    fetchHabitData(client.userId),
    prisma.checkIn.findFirst({
      where: { clientProfileId: client.id },
      orderBy: { weekStart: "desc" },
    }),
  ]);

  const checkInData: CheckInData | null = latestCheckIn
    ? {
        energyLevel: latestCheckIn.energyLevel,
        sleepQuality: latestCheckIn.sleepQuality,
        workoutsCompleted: latestCheckIn.workoutsCompleted,
        submittedAt: latestCheckIn.submittedAt,
        weekStart: latestCheckIn.weekStart,
      }
    : null;

  const readiness = calculateReadinessScore(workoutHistory, habits, checkInData);
  const consistency = calculateConsistencyScore(workoutHistory, habits);
  const personalRecords = calculatePersonalRecords(workoutHistory);

  return {
    readiness,
    consistency,
    personalRecords: personalRecords.slice(0, 10),
  };
  }, 30_000);
}

export async function getClientRecoveryData(clientUserId: string) {
  return requestCache(`client-recovery:${clientUserId}`, async () => {
    const client = await requireClientProfile(clientUserId);

    const [workoutHistory, habits, latestCheckIn] = await Promise.all([
      fetchWorkoutHistory(client.id),
      fetchHabitData(client.userId),
      prisma.checkIn.findFirst({
        where: { clientProfileId: client.id },
        orderBy: { weekStart: "desc" },
      }),
    ]);

    const checkInData: CheckInData | null = latestCheckIn
      ? {
          energyLevel: latestCheckIn.energyLevel,
          sleepQuality: latestCheckIn.sleepQuality,
          workoutsCompleted: latestCheckIn.workoutsCompleted,
          submittedAt: latestCheckIn.submittedAt,
          weekStart: latestCheckIn.weekStart,
        }
      : null;

    const readiness = calculateReadinessScore(workoutHistory, habits, checkInData);
    const insights = generateRecoveryInsights(workoutHistory, habits, checkInData);

    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentWorkouts = workoutHistory
      .filter((w) => w.completedAt >= twoWeeksAgo)
      .map((w) => ({
        date: w.completedAt,
        title: w.dayTitle,
        exerciseCount: w.exercises.length,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const recentCheckIns = await prisma.checkIn.findMany({
      where: { clientProfileId: client.id, submittedAt: { not: null } },
      orderBy: { weekStart: "desc" },
      take: 8,
      select: {
        weekStart: true,
        sleepQuality: true,
        energyLevel: true,
        workoutsCompleted: true,
      },
    });

    return {
      readiness,
      insights,
      recentWorkouts,
      recentCheckIns: recentCheckIns.map((ci) => ({
        weekStart: ci.weekStart,
        sleepQuality: ci.sleepQuality ?? 0,
        energyLevel: ci.energyLevel ?? 0,
        workoutsCompleted: ci.workoutsCompleted ?? 0,
      })),
      daysSinceLastWorkout: workoutHistory.length > 0
        ? Math.floor(
            (Date.now() - workoutHistory[workoutHistory.length - 1].completedAt.getTime()) /
            (1000 * 60 * 60 * 24)
          )
        : 0,
    };
  }, 30_000);
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
