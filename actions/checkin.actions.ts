"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireClientProfile } from "@/server/services/coach.service";
import { createNotification } from "@/server/services/notification.service";
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

    // Notify coach of new check-in
    try {
      const clientWithCoach = await prisma.clientProfile.findUnique({
        where: { id: client.id },
        include: { user: { select: { id: true } } },
      });

      if (clientWithCoach?.coachId) {
        await createNotification({
          userId: clientWithCoach.coachId,
          type: "CHECK_IN_DUE",
          title: "New check-in submitted",
          body: `${session.user.name ?? "Your client"} submitted their weekly check-in`,
          link: "/coach/check-ins",
        });
      }
    } catch {
      // Notification failure should not block submission
    }

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

    // Notify client of coach response
    try {
      const checkInWithClient = await prisma.checkIn.findUnique({
        where: { id: checkInId },
        include: {
          clientProfile: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      });

      if (checkInWithClient) {
        await createNotification({
          userId: checkInWithClient.clientProfile.user.id,
          type: "CHECK_IN_DUE",
          title: "Coach responded to your check-in",
          body: `Your coach left feedback on your weekly check-in`,
          link: "/check-ins",
        });
      }
    } catch {
      // Notification failure should not block response
    }

    revalidatePath("/coach/check-ins");
    return createSuccessResponse({ id: response.id });
  } catch (error) {
    console.error("respondToCheckInAction error:", error);
    return createErrorResponse("Failed to send response", "INTERNAL_ERROR");
  }
}
