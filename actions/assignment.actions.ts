"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import {
  assignProgramToClient,
  deactivateClientProgram,
  linkClientToCoach,
} from "@/server/services/assignment.service";
import {
  assignProgramSchema,
  deactivateAssignmentSchema,
} from "@/server/validators/program.schema";
import type { ApiResponse } from "@/types";

function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

export async function assignProgramAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = assignProgramSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const assignment = await assignProgramToClient(session.user.id, parsed.data);
    revalidatePath("/coach/clients");
    revalidatePath("/client");
    revalidatePath("/client/workouts");
    return createSuccessResponse({ id: assignment.id });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("You cannot assign to this client", "FORBIDDEN");
    }
    console.error("assignProgramAction error:", error);
    return createErrorResponse("Failed to assign program", "INTERNAL_ERROR");
  }
}

export async function acceptClientAction(
  clientProfileId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const client = await linkClientToCoach(session.user.id, clientProfileId);
    revalidatePath("/coach/clients");
    return createSuccessResponse({ id: client.id });
  } catch (error) {
    if (error instanceof Error && error.message === "CLIENT_HAS_COACH") {
      return createErrorResponse("Client already has a coach", "CLIENT_HAS_COACH");
    }
    console.error("acceptClientAction error:", error);
    return createErrorResponse("Failed to accept client", "INTERNAL_ERROR");
  }
}

export async function deactivateAssignmentAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const parsed = deactivateAssignmentSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const assignment = await deactivateClientProgram(
      session.user.id,
      parsed.data.clientProgramId,
    );
    revalidatePath("/coach/clients");
    revalidatePath("/client");
    revalidatePath("/client/workouts");
    return createSuccessResponse({ id: assignment.id });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("You cannot update this assignment", "FORBIDDEN");
    }
    console.error("deactivateAssignmentAction error:", error);
    return createErrorResponse("Failed to deactivate assignment", "INTERNAL_ERROR");
  }
}
