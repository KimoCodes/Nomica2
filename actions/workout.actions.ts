"use server";

import {
  completeWorkout as completeWorkoutService,
} from "@/server/services/workout.service";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";
import { completeWorkoutSchema } from "@/server/validators/program.schema";
import { emitPrAchieved } from "@/server/socket/emitters";

export async function completeWorkout(input: {
  programDayId: string;
  notes?: string;
  setLogs?: {
    programExerciseId: string;
    setNumber: number;
    actualReps?: number;
    actualWeight?: number;
    completed: boolean;
  }[];
}): Promise<ApiResponse<{ message: string; personalRecords?: { exerciseName: string; detail: string }[] }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse("You must be logged in", "UNAUTHORIZED");
    }

    const parsed = completeWorkoutSchema.safeParse(input);
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const result = await completeWorkoutService(session.user.id, parsed.data);

    if (result.personalRecords.length > 0) {
      emitPrAchieved(session.user.id, result.personalRecords);
    }

    return createSuccessResponse({
      message: "Workout completed!",
      personalRecords: result.personalRecords.length > 0 ? result.personalRecords : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACTIVE_PROGRAM") {
      return createErrorResponse(
        "No active program assigned",
        "NO_ACTIVE_PROGRAM",
      );
    }

    if (error instanceof Error && error.message === "ALREADY_COMPLETED") {
      return createErrorResponse(
        "Workout already completed today",
        "ALREADY_COMPLETED",
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Invalid workout", "FORBIDDEN");
    }

    logger.error({ err: error, action: "completeWorkout" }, "Failed to complete workout");
    return createErrorResponse("Failed to complete workout", "INTERNAL_ERROR");
  }
}
