"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
import {
  notifyProgramAssigned,
  notifyCoachAssigned,
  notifyNewClientAssigned,
} from "@/server/services/notification.service";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

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

    const [program, coach] = await Promise.all([
      prisma.program.findUnique({ where: { id: parsed.data.programId }, select: { title: true } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
    ]);

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: parsed.data.clientProfileId },
      select: { userId: true },
    });

    if (clientProfile?.userId && program?.title && coach?.name) {
      notifyProgramAssigned(clientProfile.userId, program.title, coach.name).catch(() => {});
    }

    revalidatePath("/coach/clients");
    revalidatePath("/client");
    revalidatePath("/client/workouts");
    return createSuccessResponse({ id: assignment.id });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("You cannot assign to this client", "FORBIDDEN");
    }
    logger.error({ err: error, action: "assignProgramAction" }, "Failed to assign program");
    return createErrorResponse("Failed to assign program", "INTERNAL_ERROR");
  }
}

export async function acceptClientAction(
  clientProfileId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const client = await linkClientToCoach(session.user.id, clientProfileId);

    const coach = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    const clientUser = await prisma.user.findUnique({
      where: { id: client.userId },
      select: { name: true },
    });

    if (coach?.name) {
      notifyNewClientAssigned(session.user.id, clientUser?.name || "Client").catch(() => {});
    }
    if (client?.userId && coach?.name) {
      notifyCoachAssigned(client.userId, coach.name).catch(() => {});
    }

    revalidatePath("/coach/clients");
    return createSuccessResponse({ id: client.id });
  } catch (error) {
    if (error instanceof Error && error.message === "CLIENT_HAS_COACH") {
      return createErrorResponse("Client already has a coach", "CLIENT_HAS_COACH");
    }
    logger.error({ err: error, action: "acceptClientAction" }, "Failed to accept client");
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
    logger.error({ err: error, action: "deactivateAssignmentAction" }, "Failed to deactivate assignment");
    return createErrorResponse("Failed to deactivate assignment", "INTERNAL_ERROR");
  }
}
