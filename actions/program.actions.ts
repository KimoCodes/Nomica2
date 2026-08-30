"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import {
  addExerciseToDay,
  addProgramDay,
  addProgramWeek,
  createProgram,
  deleteProgramDay,
  deleteProgram,
  deleteProgramWeek,
  duplicateProgram,
  removeProgramExercise,
  updateProgramDay,
  updateProgramExercise,
  updateProgramWeek,
} from "@/server/services/program.service";
import {
  addDaySchema,
  addProgramExerciseSchema,
  addWeekSchema,
  createProgramSchema,
  updateDaySchema,
  updateProgramExerciseSchema,
  updateWeekSchema,
} from "@/server/validators/program.schema";
import { logActivity } from "@/server/services/analytics.service";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

export async function createProgramAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = createProgramSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const program = await createProgram(session.user.id, parsed.data);

    logActivity({
      userId: session.user.id,
      action: "PROGRAM_CREATED",
      category: "program",
      resourceType: "program",
      resourceId: program.id,
      description: `Program created: ${parsed.data.title}`,
    }).catch(() => {});

    revalidatePath("/coach/programs");
    return createSuccessResponse({ id: program.id });
  } catch (error) {
    logger.error({ err: error, action: "createProgramAction" }, "Failed to create program");
    return createErrorResponse("Failed to create program", "INTERNAL_ERROR");
  }
}

export async function duplicateProgramAction(
  programId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const program = await duplicateProgram(session.user.id, programId);

    logActivity({
      userId: session.user.id,
      action: "PROGRAM_DUPLICATED",
      category: "program",
      resourceType: "program",
      resourceId: program.id,
      description: "Program duplicated",
    }).catch(() => {});

    revalidatePath("/coach/programs");
    return createSuccessResponse({ id: program.id });
  } catch (error) {
    logger.error({ err: error, action: "duplicateProgramAction" }, "Failed to duplicate program");
    return createErrorResponse("Failed to duplicate program", "INTERNAL_ERROR");
  }
}

export async function deleteProgramAction(
  programId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    await deleteProgram(session.user.id, programId);

    logActivity({
      userId: session.user.id,
      action: "PROGRAM_DELETED",
      category: "program",
      resourceType: "program",
      resourceId: programId,
      description: "Program deleted by coach",
    }).catch(() => {});

    revalidatePath("/coach/programs");
    return createSuccessResponse({ id: programId });
  } catch (error) {
    if (error instanceof Error && error.message === "PROGRAM_HAS_ACTIVE_ASSIGNMENTS") {
      return createErrorResponse(
        "Cannot delete a program with active client assignments",
        "PROGRAM_HAS_ACTIVE_ASSIGNMENTS",
      );
    }
    logger.error({ err: error, action: "deleteProgramAction" }, "Failed to delete program");
    return createErrorResponse("Failed to delete program", "INTERNAL_ERROR");
  }
}

export async function addWeekAction(
  programId: string,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = addWeekSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const week = await addProgramWeek(
      session.user.id,
      programId,
      parsed.data.title || undefined,
    );
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: week.id });
  } catch (error) {
    logger.error({ err: error, action: "addWeekAction" }, "Failed to add week");
    return createErrorResponse("Failed to add week", "INTERNAL_ERROR");
  }
}

export async function addDayAction(
  weekId: string,
  programId: string,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = addDaySchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const day = await addProgramDay(
      session.user.id,
      weekId,
      parsed.data.title || undefined,
    );
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: day.id });
  } catch (error) {
    logger.error({ err: error, action: "addDayAction" }, "Failed to add day");
    return createErrorResponse("Failed to add day", "INTERNAL_ERROR");
  }
}

export async function updateWeekAction(
  weekId: string,
  programId: string,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = updateWeekSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const week = await updateProgramWeek(
      session.user.id,
      weekId,
      parsed.data.title || undefined,
    );
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: week.id });
  } catch (error) {
    logger.error({ err: error, action: "updateWeekAction" }, "Failed to update week");
    return createErrorResponse("Failed to update week", "INTERNAL_ERROR");
  }
}

export async function deleteWeekAction(
  weekId: string,
  programId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    await deleteProgramWeek(session.user.id, weekId);
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: weekId });
  } catch (error) {
    logger.error({ err: error, action: "deleteWeekAction" }, "Failed to delete week");
    return createErrorResponse("Failed to delete week", "INTERNAL_ERROR");
  }
}

export async function updateDayAction(
  dayId: string,
  programId: string,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = updateDaySchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const day = await updateProgramDay(
      session.user.id,
      dayId,
      parsed.data.title || undefined,
    );
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: day.id });
  } catch (error) {
    logger.error({ err: error, action: "updateDayAction" }, "Failed to update day");
    return createErrorResponse("Failed to update day", "INTERNAL_ERROR");
  }
}

export async function deleteDayAction(
  dayId: string,
  programId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    await deleteProgramDay(session.user.id, dayId);
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: dayId });
  } catch (error) {
    logger.error({ err: error, action: "deleteDayAction" }, "Failed to delete day");
    return createErrorResponse("Failed to delete day", "INTERNAL_ERROR");
  }
}

export async function addExerciseToDayAction(
  dayId: string,
  programId: string,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = addProgramExerciseSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const programExercise = await addExerciseToDay(
      session.user.id,
      dayId,
      parsed.data,
    );
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: programExercise.id });
  } catch (error) {
    logger.error({ err: error, action: "addExerciseToDayAction" }, "Failed to add exercise");
    return createErrorResponse("Failed to add exercise", "INTERNAL_ERROR");
  }
}

export async function updateProgramExerciseAction(
  programExerciseId: string,
  programId: string,
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = updateProgramExerciseSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const programExercise = await updateProgramExercise(
      session.user.id,
      programExerciseId,
      parsed.data,
    );
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: programExercise.id });
  } catch (error) {
    logger.error({ err: error, action: "updateProgramExerciseAction" }, "Failed to update exercise");
    return createErrorResponse("Failed to update exercise", "INTERNAL_ERROR");
  }
}

export async function removeExerciseFromDayAction(
  programExerciseId: string,
  programId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    await removeProgramExercise(session.user.id, programExerciseId);
    revalidatePath(`/coach/programs/${programId}`);
    return createSuccessResponse({ id: programExerciseId });
  } catch (error) {
    logger.error({ err: error, action: "removeExerciseFromDayAction" }, "Failed to remove exercise");
    return createErrorResponse("Failed to remove exercise", "INTERNAL_ERROR");
  }
}
