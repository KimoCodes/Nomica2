import { PlanStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireClientProfile, requireCoachProfile } from "./coach.service";

type CreateExercisePlanInput = {
  clientProfileId: string;
  coachProfileId: string;
  bookingId?: string;
  name: string;
  description?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  weeklySchedule?: Record<string, unknown>;
  coachNotes?: string;
  exercises: {
    name: string;
    exerciseId?: string;
    muscleGroup?: string;
    dayOfWeek?: number;
    order: number;
    sets?: number;
    reps?: number;
    durationMinutes?: number;
    restSeconds?: number;
    intensity?: string;
    instructions?: string;
    notes?: string;
  }[];
};

type CreateNutritionPlanInput = {
  clientProfileId: string;
  coachProfileId: string;
  bookingId?: string;
  name: string;
  description?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  dailyWaterMl?: number;
  coachNotes?: string;
  meals: {
    name: string;
    mealType: string;
    timeOfDay?: string;
    order: number;
    foods?: Record<string, unknown>;
    instructions?: string;
    notes?: string;
  }[];
};

type UpdateExercisePlanInput = Partial<{ name: string; description: string; goal: string; status: PlanStatus; startDate: Date; endDate: Date; weeklySchedule: Record<string, unknown>; coachNotes: string; exercises: CreateExercisePlanInput["exercises"] }>;
type UpdateNutritionPlanInput = Partial<{ name: string; description: string; goal: string; status: PlanStatus; startDate: Date; endDate: Date; dailyCalories: number; dailyProtein: number; dailyCarbs: number; dailyFat: number; dailyWaterMl: number; coachNotes: string; meals: CreateNutritionPlanInput["meals"] }>;

// ─── Create Exercise Plan ─────────────────────────────────────────────────────

export async function createExercisePlan(input: CreateExercisePlanInput) {
  return prisma.personalizedExercisePlan.create({
    data: {
      clientProfileId: input.clientProfileId,
      coachProfileId: input.coachProfileId,
      bookingId: input.bookingId,
      name: input.name,
      description: input.description,
      goal: input.goal,
      status: "ACTIVE",
      startDate: input.startDate,
      endDate: input.endDate,
      weeklySchedule: input.weeklySchedule ? JSON.parse(JSON.stringify(input.weeklySchedule)) : undefined,
      coachNotes: input.coachNotes,
      exercises: {
        create: input.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          muscleGroup: ex.muscleGroup as any,
          dayOfWeek: ex.dayOfWeek,
          order: ex.order,
          sets: ex.sets,
          reps: ex.reps,
          durationMinutes: ex.durationMinutes,
          restSeconds: ex.restSeconds,
          intensity: ex.intensity,
          instructions: ex.instructions,
          notes: ex.notes,
        })),
      },
    },
    include: {
      exercises: true,
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

// ─── Get Exercise Plan ────────────────────────────────────────────────────────

export async function getExercisePlan(planId: string) {
  return prisma.personalizedExercisePlan.findUnique({
    where: { id: planId },
    include: {
      exercises: { orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }] },
      clientProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
      progress: { orderBy: { date: "desc" }, take: 10 },
    },
  });
}

// ─── Get Client's Active Exercise Plan ────────────────────────────────────────

export async function getClientActiveExercisePlan(clientProfileId: string) {
  return prisma.personalizedExercisePlan.findFirst({
    where: {
      clientProfileId,
      status: "ACTIVE",
    },
    include: {
      exercises: { orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }] },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
      progress: { orderBy: { date: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── List Coach Exercise Plans ────────────────────────────────────────────────

export async function listCoachExercisePlans(
  coachProfileId: string,
  filter?: { clientProfileId?: string; status?: PlanStatus; page?: number; limit?: number },
) {
  const where: Record<string, unknown> = { coachProfileId };
  if (filter?.clientProfileId) where.clientProfileId = filter.clientProfileId;
  if (filter?.status) where.status = filter.status;

  const page = filter?.page ?? 1;
  const limit = filter?.limit ?? 20;

  const [plans, total] = await Promise.all([
    prisma.personalizedExercisePlan.findMany({
      where,
      include: {
        exercises: { select: { id: true } },
        clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.personalizedExercisePlan.count({ where }),
  ]);

  return { plans, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ─── Update Exercise Plan ─────────────────────────────────────────────────────

export async function updateExercisePlan(planId: string, input: UpdateExercisePlanInput) {
  const data: Record<string, unknown> = {};
  if (input.name) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.goal !== undefined) data.goal = input.goal;
  if (input.status) data.status = input.status;
  if (input.startDate !== undefined) data.startDate = input.startDate;
  if (input.endDate !== undefined) data.endDate = input.endDate;
  if (input.weeklySchedule !== undefined) data.weeklySchedule = input.weeklySchedule;
  if (input.coachNotes !== undefined) data.coachNotes = input.coachNotes;

  if (input.exercises) {
    await prisma.personalizedExerciseItem.deleteMany({ where: { personalizedPlanId: planId } });
    await prisma.personalizedExerciseItem.createMany({
      data: input.exercises.map((ex) => ({
        personalizedPlanId: planId,
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup as any,
        dayOfWeek: ex.dayOfWeek,
        order: ex.order,
        sets: ex.sets,
        reps: ex.reps,
        durationMinutes: ex.durationMinutes,
        restSeconds: ex.restSeconds,
        intensity: ex.intensity,
        instructions: ex.instructions,
        notes: ex.notes,
      })),
    });
  }

  return prisma.personalizedExercisePlan.update({
    where: { id: planId },
    data,
    include: {
      exercises: { orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }] },
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

// ─── Create Nutrition Plan ────────────────────────────────────────────────────

export async function createNutritionPlan(input: CreateNutritionPlanInput) {
  return prisma.personalizedNutritionPlan.create({
    data: {
      clientProfileId: input.clientProfileId,
      coachProfileId: input.coachProfileId,
      bookingId: input.bookingId,
      name: input.name,
      description: input.description,
      goal: input.goal,
      status: "ACTIVE",
      startDate: input.startDate,
      endDate: input.endDate,
      dailyCalories: input.dailyCalories,
      dailyProtein: input.dailyProtein,
      dailyCarbs: input.dailyCarbs,
      dailyFat: input.dailyFat,
      dailyWaterMl: input.dailyWaterMl,
      coachNotes: input.coachNotes,
      meals: {
        create: input.meals.map((meal) => ({
          name: meal.name,
          mealType: meal.mealType as any,
          timeOfDay: meal.timeOfDay,
          order: meal.order,
          foods: meal.foods ? JSON.parse(JSON.stringify(meal.foods)) : undefined,
          instructions: meal.instructions,
          notes: meal.notes,
        })),
      },
    },
    include: {
      meals: { orderBy: { order: "asc" } },
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

// ─── Get Nutrition Plan ───────────────────────────────────────────────────────

export async function getNutritionPlan(planId: string) {
  return prisma.personalizedNutritionPlan.findUnique({
    where: { id: planId },
    include: {
      meals: { orderBy: { order: "asc" } },
      clientProfile: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
      progress: { orderBy: { date: "desc" }, take: 10 },
    },
  });
}

// ─── Get Client's Active Nutrition Plan ───────────────────────────────────────

export async function getClientActiveNutritionPlan(clientProfileId: string) {
  return prisma.personalizedNutritionPlan.findFirst({
    where: {
      clientProfileId,
      status: "ACTIVE",
    },
    include: {
      meals: { orderBy: { order: "asc" } },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
      progress: { orderBy: { date: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── List Coach Nutrition Plans ───────────────────────────────────────────────

export async function listCoachNutritionPlans(
  coachProfileId: string,
  filter?: { clientProfileId?: string; status?: PlanStatus; page?: number; limit?: number },
) {
  const where: Record<string, unknown> = { coachProfileId };
  if (filter?.clientProfileId) where.clientProfileId = filter.clientProfileId;
  if (filter?.status) where.status = filter.status;

  const page = filter?.page ?? 1;
  const limit = filter?.limit ?? 20;

  const [plans, total] = await Promise.all([
    prisma.personalizedNutritionPlan.findMany({
      where,
      include: {
        meals: { select: { id: true } },
        clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.personalizedNutritionPlan.count({ where }),
  ]);

  return { plans, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ─── Update Nutrition Plan ────────────────────────────────────────────────────

export async function updateNutritionPlan(planId: string, input: UpdateNutritionPlanInput) {
  const data: Record<string, unknown> = {};
  if (input.name) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.goal !== undefined) data.goal = input.goal;
  if (input.status) data.status = input.status;
  if (input.startDate !== undefined) data.startDate = input.startDate;
  if (input.endDate !== undefined) data.endDate = input.endDate;
  if (input.dailyCalories !== undefined) data.dailyCalories = input.dailyCalories;
  if (input.dailyProtein !== undefined) data.dailyProtein = input.dailyProtein;
  if (input.dailyCarbs !== undefined) data.dailyCarbs = input.dailyCarbs;
  if (input.dailyFat !== undefined) data.dailyFat = input.dailyFat;
  if (input.dailyWaterMl !== undefined) data.dailyWaterMl = input.dailyWaterMl;
  if (input.coachNotes !== undefined) data.coachNotes = input.coachNotes;

  if (input.meals) {
    await prisma.personalizedMeal.deleteMany({ where: { personalizedPlanId: planId } });
    await prisma.personalizedMeal.createMany({
      data: input.meals.map((meal) => ({
        personalizedPlanId: planId,
        name: meal.name,
        mealType: meal.mealType as any,
        timeOfDay: meal.timeOfDay,
        order: meal.order,
        foods: meal.foods ? JSON.parse(JSON.stringify(meal.foods)) : undefined,
        instructions: meal.instructions,
        notes: meal.notes,
      })),
    });
  }

  return prisma.personalizedNutritionPlan.update({
    where: { id: planId },
    data,
    include: {
      meals: { orderBy: { order: "asc" } },
      clientProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      coachProfile: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

// ─── Log Plan Progress ────────────────────────────────────────────────────────

export async function logPlanProgress(input: {
  exercisePlanId?: string;
  nutritionPlanId?: string;
  clientProfileId: string;
  completed?: boolean;
  completionPercentage?: number;
  setsCompleted?: number;
  repsCompleted?: number;
  durationMinutes?: number;
  adherenceScore?: number;
  notes?: string;
}) {
  return prisma.planProgress.create({
    data: {
      exercisePlanId: input.exercisePlanId,
      nutritionPlanId: input.nutritionPlanId,
      clientProfileId: input.clientProfileId,
      completed: input.completed ?? false,
      completionPercentage: input.completionPercentage,
      setsCompleted: input.setsCompleted,
      repsCompleted: input.repsCompleted,
      durationMinutes: input.durationMinutes,
      adherenceScore: input.adherenceScore,
      notes: input.notes,
    },
  });
}

// ─── Validate Plan Access ─────────────────────────────────────────────────────

export async function validatePlanAccess(
  userId: string,
  userRole: Role,
  planId: string,
  planType: "exercise" | "nutrition",
) {
  if (planType === "exercise") {
    const plan = await prisma.personalizedExercisePlan.findUnique({
      where: { id: planId },
      include: {
        clientProfile: { select: { userId: true } },
        coachProfile: { select: { userId: true } },
      },
    });

    if (!plan) throw new Error("PLAN_NOT_FOUND");
    if (userRole === Role.CLIENT && plan.clientProfile.userId !== userId) throw new Error("FORBIDDEN");
    if (userRole === Role.COACH && plan.coachProfile.userId !== userId) throw new Error("FORBIDDEN");
    return plan;
  } else {
    const plan = await prisma.personalizedNutritionPlan.findUnique({
      where: { id: planId },
      include: {
        clientProfile: { select: { userId: true } },
        coachProfile: { select: { userId: true } },
      },
    });

    if (!plan) throw new Error("PLAN_NOT_FOUND");
    if (userRole === Role.CLIENT && plan.clientProfile.userId !== userId) throw new Error("FORBIDDEN");
    if (userRole === Role.COACH && plan.coachProfile.userId !== userId) throw new Error("FORBIDDEN");
    return plan;
  }
}
