"use server";

import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createExercisePlan,
  getExercisePlan,
  getClientActiveExercisePlan,
  listCoachExercisePlans,
  updateExercisePlan,
  createNutritionPlan,
  getNutritionPlan,
  getClientActiveNutritionPlan,
  listCoachNutritionPlans,
  updateNutritionPlan,
  logPlanProgress,
  validatePlanAccess,
} from "@/server/services/plan.service";
import { requireClientProfile, requireCoachProfile } from "@/server/services/coach.service";
import {
  notifyExercisePlanAssigned,
  notifyNutritionPlanAssigned,
  notifyPlanUpdated,
  notifyPlanProgressUpdate,
} from "@/server/services/notification.service";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/server/utils/response";
import {
  createExercisePlanSchema,
  updateExercisePlanSchema,
  createNutritionPlanSchema,
  updateNutritionPlanSchema,
  logProgressSchema,
} from "@/server/validators/plan.schema";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

// ─── Create Exercise Plan ─────────────────────────────────────────────────────

export async function createExercisePlanAction(input: {
  clientProfileId: string;
  name: string;
  description?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
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
}): Promise<ApiResponse<{ message: string; planId: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can create exercise plans", "FORBIDDEN");
    }

    const coachProfile = await requireCoachProfile(session.user.id);

    const parsed = createExercisePlanSchema.safeParse({
      ...input,
      coachProfileId: coachProfile.id,
      startDate: input.startDate ? new Date(input.startDate).toISOString() : undefined,
      endDate: input.endDate ? new Date(input.endDate).toISOString() : undefined,
    });

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const plan = await createExercisePlan({
      ...parsed.data,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });

    const clientUser = await prisma.user.findUnique({
      where: { id: (await requireClientProfile(input.clientProfileId)).userId },
      select: { id: true },
    }).catch(() => null);

    if (clientUser) {
      await notifyExercisePlanAssigned(clientUser.id, session.user.name ?? "Coach", input.name);
    }

    return createSuccessResponse({
      message: "Exercise plan created",
      planId: plan.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "COACH_PROFILE_NOT_FOUND") {
      return createErrorResponse("Coach profile not found", "COACH_PROFILE_NOT_FOUND");
    }
    logger.error({ err: error, action: "createExercisePlanAction" }, "Failed to create exercise plan");
    return createErrorResponse("Failed to create exercise plan", "INTERNAL_ERROR");
  }
}

// ─── Get Exercise Plan ────────────────────────────────────────────────────────

export async function getExercisePlanAction(planId: string): Promise<ApiResponse<Awaited<ReturnType<typeof getExercisePlan>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    await validatePlanAccess(session.user.id, session.user.role, planId, "exercise");

    const plan = await getExercisePlan(planId);
    if (!plan) {
      return createErrorResponse("Plan not found", "PLAN_NOT_FOUND");
    }

    return createSuccessResponse(plan);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "getExercisePlanAction" }, "Failed to get exercise plan");
    return createErrorResponse("Failed to load exercise plan", "INTERNAL_ERROR");
  }
}

// ─── Get My Active Exercise Plan ──────────────────────────────────────────────

export async function getMyActiveExercisePlanAction(): Promise<ApiResponse<Awaited<ReturnType<typeof getClientActiveExercisePlan>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const profile = await requireClientProfile(session.user.id);
    const plan = await getClientActiveExercisePlan(profile.id);
    return createSuccessResponse(plan);
  } catch (error) {
    if (error instanceof Error && error.message === "CLIENT_PROFILE_NOT_FOUND") {
      return createErrorResponse("Client profile not found", "CLIENT_PROFILE_NOT_FOUND");
    }
    logger.error({ err: error, action: "getMyActiveExercisePlanAction" }, "Failed to get active exercise plan");
    return createErrorResponse("Failed to load active exercise plan", "INTERNAL_ERROR");
  }
}

// ─── List Coach Exercise Plans ────────────────────────────────────────────────

export async function listCoachExercisePlansAction(filter?: {
  clientProfileId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Awaited<ReturnType<typeof listCoachExercisePlans>>>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can list exercise plans", "FORBIDDEN");
    }

    const coachProfile = await requireCoachProfile(session.user.id);
    const result = await listCoachExercisePlans(coachProfile.id, {
      ...filter,
      status: filter?.status as any,
    });

    return createSuccessResponse(result);
  } catch (error) {
    logger.error({ err: error, action: "listCoachExercisePlansAction" }, "Failed to list exercise plans");
    return createErrorResponse("Failed to load exercise plans", "INTERNAL_ERROR");
  }
}

// ─── Update Exercise Plan ─────────────────────────────────────────────────────

export async function updateExercisePlanAction(
  planId: string,
  input: {
    name?: string;
    description?: string;
    goal?: string;
    status?: string;
    coachNotes?: string;
    exercises?: {
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
  },
): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can update exercise plans", "FORBIDDEN");
    }

    await validatePlanAccess(session.user.id, session.user.role, planId, "exercise");

    const parsed = updateExercisePlanSchema.safeParse(input);
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    await updateExercisePlan(planId, {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    });
    return createSuccessResponse({ message: "Exercise plan updated" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "updateExercisePlanAction" }, "Failed to update exercise plan");
    return createErrorResponse("Failed to update exercise plan", "INTERNAL_ERROR");
  }
}

// ─── Create Nutrition Plan ────────────────────────────────────────────────────

export async function createNutritionPlanAction(input: {
  clientProfileId: string;
  name: string;
  description?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
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
}): Promise<ApiResponse<{ message: string; planId: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can create nutrition plans", "FORBIDDEN");
    }

    const coachProfile = await requireCoachProfile(session.user.id);

    const parsed = createNutritionPlanSchema.safeParse({
      ...input,
      coachProfileId: coachProfile.id,
      startDate: input.startDate ? new Date(input.startDate).toISOString() : undefined,
      endDate: input.endDate ? new Date(input.endDate).toISOString() : undefined,
    });

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const plan = await createNutritionPlan({
      ...parsed.data,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });

    const clientUser = await prisma.user.findUnique({
      where: { id: (await requireClientProfile(input.clientProfileId)).userId },
      select: { id: true },
    }).catch(() => null);

    if (clientUser) {
      await notifyNutritionPlanAssigned(clientUser.id, session.user.name ?? "Coach", input.name);
    }

    return createSuccessResponse({
      message: "Nutrition plan created",
      planId: plan.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "COACH_PROFILE_NOT_FOUND") {
      return createErrorResponse("Coach profile not found", "COACH_PROFILE_NOT_FOUND");
    }
    logger.error({ err: error, action: "createNutritionPlanAction" }, "Failed to create nutrition plan");
    return createErrorResponse("Failed to create nutrition plan", "INTERNAL_ERROR");
  }
}

// ─── Get Nutrition Plan ───────────────────────────────────────────────────────

export async function getNutritionPlanAction(planId: string): Promise<ApiResponse<Awaited<ReturnType<typeof getNutritionPlan>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    await validatePlanAccess(session.user.id, session.user.role, planId, "nutrition");

    const plan = await getNutritionPlan(planId);
    if (!plan) {
      return createErrorResponse("Plan not found", "PLAN_NOT_FOUND");
    }

    return createSuccessResponse(plan);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "getNutritionPlanAction" }, "Failed to get nutrition plan");
    return createErrorResponse("Failed to load nutrition plan", "INTERNAL_ERROR");
  }
}

// ─── Get My Active Nutrition Plan ─────────────────────────────────────────────

export async function getMyActiveNutritionPlanAction(): Promise<ApiResponse<Awaited<ReturnType<typeof getClientActiveNutritionPlan>>>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const profile = await requireClientProfile(session.user.id);
    const plan = await getClientActiveNutritionPlan(profile.id);
    return createSuccessResponse(plan);
  } catch (error) {
    if (error instanceof Error && error.message === "CLIENT_PROFILE_NOT_FOUND") {
      return createErrorResponse("Client profile not found", "CLIENT_PROFILE_NOT_FOUND");
    }
    logger.error({ err: error, action: "getMyActiveNutritionPlanAction" }, "Failed to get active nutrition plan");
    return createErrorResponse("Failed to load active nutrition plan", "INTERNAL_ERROR");
  }
}

// ─── List Coach Nutrition Plans ───────────────────────────────────────────────

export async function listCoachNutritionPlansAction(filter?: {
  clientProfileId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Awaited<ReturnType<typeof listCoachNutritionPlans>>>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can list nutrition plans", "FORBIDDEN");
    }

    const coachProfile = await requireCoachProfile(session.user.id);
    const result = await listCoachNutritionPlans(coachProfile.id, {
      ...filter,
      status: filter?.status as any,
    });

    return createSuccessResponse(result);
  } catch (error) {
    logger.error({ err: error, action: "listCoachNutritionPlansAction" }, "Failed to list nutrition plans");
    return createErrorResponse("Failed to load nutrition plans", "INTERNAL_ERROR");
  }
}

// ─── Update Nutrition Plan ────────────────────────────────────────────────────

export async function updateNutritionPlanAction(
  planId: string,
  input: {
    name?: string;
    description?: string;
    goal?: string;
    status?: string;
    dailyCalories?: number;
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
    dailyWaterMl?: number;
    coachNotes?: string;
    meals?: {
      name: string;
      mealType: string;
      timeOfDay?: string;
      order: number;
      foods?: Record<string, unknown>;
      instructions?: string;
      notes?: string;
    }[];
  },
): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.COACH) {
      return createErrorResponse("Only coaches can update nutrition plans", "FORBIDDEN");
    }

    await validatePlanAccess(session.user.id, session.user.role, planId, "nutrition");

    const parsed = updateNutritionPlanSchema.safeParse(input);
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    await updateNutritionPlan(planId, {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    });
    return createSuccessResponse({ message: "Nutrition plan updated" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    logger.error({ err: error, action: "updateNutritionPlanAction" }, "Failed to update nutrition plan");
    return createErrorResponse("Failed to update nutrition plan", "INTERNAL_ERROR");
  }
}

// ─── Log Plan Progress ────────────────────────────────────────────────────────

export async function logPlanProgressAction(input: {
  exercisePlanId?: string;
  nutritionPlanId?: string;
  completed?: boolean;
  completionPercentage?: number;
  setsCompleted?: number;
  repsCompleted?: number;
  durationMinutes?: number;
  adherenceScore?: number;
  notes?: string;
}): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const profile = await requireClientProfile(session.user.id);

    if (input.exercisePlanId) {
      await validatePlanAccess(session.user.id, session.user.role, input.exercisePlanId, "exercise");
    }
    if (input.nutritionPlanId) {
      await validatePlanAccess(session.user.id, session.user.role, input.nutritionPlanId, "nutrition");
    }

    const parsed = logProgressSchema.safeParse(input);
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    await logPlanProgress({
      ...parsed.data,
      clientProfileId: profile.id,
    });

    if (input.exercisePlanId) {
      const plan = await prisma.personalizedExercisePlan.findUnique({
        where: { id: input.exercisePlanId },
        include: { coachProfile: { include: { user: { select: { id: true } } } } },
      });
      if (plan) {
        await notifyPlanProgressUpdate(plan.coachProfile.user.id, session.user.name ?? "Client", plan.name, "exercise");
      }
    }
    if (input.nutritionPlanId) {
      const plan = await prisma.personalizedNutritionPlan.findUnique({
        where: { id: input.nutritionPlanId },
        include: { coachProfile: { include: { user: { select: { id: true } } } } },
      });
      if (plan) {
        await notifyPlanProgressUpdate(plan.coachProfile.user.id, session.user.name ?? "Client", plan.name, "nutrition");
      }
    }

    return createSuccessResponse({ message: "Progress logged" });
  } catch (error) {
    if (error instanceof Error && error.message === "CLIENT_PROFILE_NOT_FOUND") {
      return createErrorResponse("Client profile not found", "CLIENT_PROFILE_NOT_FOUND");
    }
    logger.error({ err: error, action: "logPlanProgressAction" }, "Failed to log progress");
    return createErrorResponse("Failed to log progress", "INTERNAL_ERROR");
  }
}
