"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import {
  createExercise,
  deleteExercise,
  getExercisesForCoach,
  updateExercise,
} from "@/server/services/exercise.service";
import {
  createExerciseSchema,
  updateExerciseSchema,
} from "@/server/validators/program.schema";
import type { ApiResponse } from "@/types";

function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

export async function getExercises(): Promise<ApiResponse<{ exercises: Awaited<ReturnType<typeof getExercisesForCoach>> }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const exercises = await getExercisesForCoach(session.user.id);
    return createSuccessResponse({ exercises });
  } catch (error) {
    console.error("getExercises error:", error);
    return createErrorResponse("Failed to load exercises", "INTERNAL_ERROR");
  }
}

export async function createExerciseAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = createExerciseSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const exercise = await createExercise(session.user.id, parsed.data);
    revalidatePath("/coach/exercises");
    return createSuccessResponse({ id: exercise.id });
  } catch (error) {
    console.error("createExerciseAction error:", error);
    return createErrorResponse("Failed to create exercise", "INTERNAL_ERROR");
  }
}

export async function updateExerciseAction(
  exerciseId: string,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = updateExerciseSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const exercise = await updateExercise(
      session.user.id,
      exerciseId,
      parsed.data,
    );
    revalidatePath("/coach/exercises");
    return createSuccessResponse({ id: exercise.id });
  } catch (error) {
    if (error instanceof Error && error.message === "SYSTEM_EXERCISE_READONLY") {
      return createErrorResponse("System exercises cannot be edited", "FORBIDDEN");
    }
    console.error("updateExerciseAction error:", error);
    return createErrorResponse("Failed to update exercise", "INTERNAL_ERROR");
  }
}

export async function deleteExerciseAction(
  exerciseId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    await deleteExercise(session.user.id, exerciseId);
    revalidatePath("/coach/exercises");
    return createSuccessResponse({ id: exerciseId });
  } catch (error) {
    if (error instanceof Error && error.message === "SYSTEM_EXERCISE_READONLY") {
      return createErrorResponse("System exercises cannot be deleted", "FORBIDDEN");
    }
    if (error instanceof Error && error.message === "EXERCISE_IN_USE") {
      return createErrorResponse(
        "Exercise is used in a program and cannot be deleted",
        "EXERCISE_IN_USE",
      );
    }
    console.error("deleteExerciseAction error:", error);
    return createErrorResponse("Failed to delete exercise", "INTERNAL_ERROR");
  }
}
