"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireClientProfile } from "@/server/services/coach.service";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import type { ApiResponse } from "@/types";

function startOfWeek() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

export async function submitCheckInAction(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.CLIENT]);
    const client = await requireClientProfile(session.user.id);
    const weekStart = startOfWeek();

    const workoutsCompleted = formData.get("workoutsCompleted") as string;
    const energyLevel = formData.get("energyLevel") as string;
    const sleepQuality = formData.get("sleepQuality") as string;
    const currentWeight = formData.get("currentWeight") as string;

    const existing = await prisma.checkIn.findFirst({
      where: { clientProfileId: client.id, weekStart },
    });

    if (existing?.submittedAt) {
      return createErrorResponse("You have already submitted a check-in for this week", "VALIDATION_ERROR");
    }

    const checkIn = existing
      ? await prisma.checkIn.update({
          where: { id: existing.id },
          data: {
            workoutsCompleted: workoutsCompleted ? parseInt(workoutsCompleted) : null,
            energyLevel: energyLevel ? parseInt(energyLevel) : null,
            sleepQuality: sleepQuality ? parseInt(sleepQuality) : null,
            currentWeight: currentWeight ? parseFloat(currentWeight) : null,
            submittedAt: new Date(),
          },
        })
      : await prisma.checkIn.create({
          data: {
            clientProfileId: client.id,
            weekStart,
            workoutsCompleted: workoutsCompleted ? parseInt(workoutsCompleted) : null,
            energyLevel: energyLevel ? parseInt(energyLevel) : null,
            sleepQuality: sleepQuality ? parseInt(sleepQuality) : null,
            currentWeight: currentWeight ? parseFloat(currentWeight) : null,
            submittedAt: new Date(),
          },
        });

    revalidatePath("/client/check-ins");
    return createSuccessResponse({ id: checkIn.id });
  } catch (error) {
    console.error("submitCheckInAction error:", error);
    return createErrorResponse("Failed to submit check-in", "INTERNAL_ERROR");
  }
}

export async function respondToCheckInAction(
  checkInId: string,
  feedback: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.COACH]);

    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: { clientProfile: true },
    });

    if (!checkIn) {
      return createErrorResponse("Check-in not found", "NOT_FOUND");
    }

    if (checkIn.clientProfile.coachId !== session.user.id) {
      return createErrorResponse("Unauthorized", "UNAUTHORIZED");
    }

    const response = await prisma.checkInResponse.create({
      data: {
        checkInId,
        coachId: session.user.id,
        feedback,
      },
    });

    revalidatePath("/coach/check-ins");
    return createSuccessResponse({ id: response.id });
  } catch (error) {
    console.error("respondToCheckInAction error:", error);
    return createErrorResponse("Failed to send response", "INTERNAL_ERROR");
  }
}
