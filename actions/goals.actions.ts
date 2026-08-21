"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { GoalStatus } from "@prisma/client";

export async function getGoals() {
  const session = await requireAuth();
  const userId = session.user.id;

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    category: g.category,
    targetValue: g.targetValue,
    currentValue: g.currentValue,
    unit: g.unit,
    status: g.status,
    deadline: g.deadline,
    progress: g.targetValue
      ? Math.min(100, Math.round(((g.currentValue ?? 0) / g.targetValue) * 100))
      : null,
  }));
}

export async function createGoal(data: {
  title: string;
  description?: string;
  category: string;
  targetValue?: number;
  unit?: string;
  deadline?: string;
}) {
  const session = await requireAuth();
  const userId = session.user.id;

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      targetValue: data.targetValue,
      unit: data.unit,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  return { success: true, goalId: goal.id };
}

export async function updateGoalProgress(goalId: string, currentValue: number) {
  const session = await requireAuth();
  const userId = session.user.id;

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) {
    throw new Error("Goal not found");
  }

  const isCompleted = goal.targetValue !== null && currentValue >= goal.targetValue;

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      currentValue,
      status: isCompleted ? "COMPLETED" : "ACTIVE",
    },
  });

  return { success: true, completed: isCompleted };
}

export async function completeGoal(goalId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) {
    throw new Error("Goal not found");
  }

  await prisma.goal.update({
    where: { id: goalId },
    data: { status: "COMPLETED" },
  });

  return { success: true };
}

export async function deleteGoal(goalId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) {
    throw new Error("Goal not found");
  }

  await prisma.goal.delete({ where: { id: goalId } });

  return { success: true };
}
