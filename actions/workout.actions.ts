"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { completeWorkout } from "@/server/services/workout.service";
import { completeWorkoutSchema } from "@/server/validators/program.schema";
import type { ApiResponse } from "@/types";

function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

export async function completeWorkoutAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.CLIENT]);
    const parsed = completeWorkoutSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const completion = await completeWorkout(session.user.id, parsed.data);
    revalidatePath("/client");
    revalidatePath("/client/workouts");
    return createSuccessResponse({ id: completion.id });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACTIVE_PROGRAM") {
      return createErrorResponse("No active program assigned", "NO_ACTIVE_PROGRAM");
    }
    if (error instanceof Error && error.message === "ALREADY_COMPLETED") {
      return createErrorResponse(
        "You already completed this workout today",
        "ALREADY_COMPLETED",
      );
    }
    console.error("completeWorkoutAction error:", error);
    return createErrorResponse("Failed to complete workout", "INTERNAL_ERROR");
  }
}
