"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { HabitType } from "@prisma/client";

export async function getHabits() {
  const session = await requireAuth();
  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: {
      logs: {
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return habits.map((h) => ({
    id: h.id,
    type: h.type,
    target: h.target,
    completedToday: h.logs.length > 0 ? h.logs[0].value : 0,
    loggedToday: h.logs.length > 0,
  }));
}

export async function getHabitStats() {
  const session = await requireAuth();
  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: {
      logs: {
        where: { date: { gte: sevenDaysAgo } },
        orderBy: { date: "desc" },
      },
    },
  });

  const stats = habits.map((h) => {
    const uniqueDays = new Set(h.logs.map((l) => l.date.toISOString().split("T")[0]));
    const streak = calculateStreak(h.logs.map((l) => l.date));
    return {
      type: h.type,
      target: h.target,
      streak,
      completionRate: Math.round((uniqueDays.size / 7) * 100),
    };
  });

  return stats;
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates]
    .map((d) => new Date(d).toISOString().split("T")[0])
    .sort()
    .reverse();

  const today = new Date().toISOString().split("T")[0];
  if (sorted[0] !== today) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function toggleHabit(
  habitId: string,
  value?: number,
) {
  const session = await requireAuth();
  const userId = session.user.id;

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== userId) {
    throw new Error("Habit not found");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date: today } },
  });

  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } });
    return { completed: false };
  } else {
    await prisma.habitLog.create({
      data: {
        habitId,
        date: today,
        value: value ?? 1,
      },
    });
    return { completed: true };
  }
}

export async function createHabit(type: HabitType, target?: number) {
  const session = await requireAuth();
  const userId = session.user.id;

  const existing = await prisma.habit.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (existing) {
    if (!existing.isActive) {
      await prisma.habit.update({ where: { id: existing.id }, data: { isActive: true, target: target ?? existing.target } });
      return { success: true };
    }
    throw new Error("Habit already exists");
  }

  await prisma.habit.create({
    data: { userId, type, target: target ?? 1 },
  });

  return { success: true };
}

export async function deleteHabit(habitId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== userId) {
    throw new Error("Habit not found");
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: { isActive: false },
  });

  return { success: true };
}

export async function updateWaterIntake(glasses: number) {
  const session = await requireAuth();
  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let habit = await prisma.habit.findUnique({
    where: { userId_type: { userId, type: "WATER" } },
  });

  if (!habit) {
    habit = await prisma.habit.create({
      data: { userId, type: "WATER", target: 8 },
    });
  }

  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId: habit.id, date: today } },
  });

  if (existing) {
    await prisma.habitLog.update({
      where: { id: existing.id },
      data: { value: glasses },
    });
  } else {
    await prisma.habitLog.create({
      data: { habitId: habit.id, date: today, value: glasses },
    });
  }

  return { success: true, glasses };
}
