"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  grantFreeTrial,
  cancelFreeTrial,
  getClientFreeTrial,
  getAllFreeTrials,
  getCoachFreeTrials,
  expireOverdueTrials,
} from "@/server/services/free-trial.service";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import type { ApiResponse } from "@/types";

export async function grantFreeTrialAction(
  targetUserId: string,
  durationDays: number,
  startDate?: string,
  reason?: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.ADMIN, Role.COACH]);

    const trial = await grantFreeTrial({
      grantedById: session.user.id,
      grantedByRole: session.user.role,
      targetUserId,
      durationDays,
      startDate: startDate ? new Date(startDate) : undefined,
      reason,
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/coach/subscriptions");
    revalidatePath("/client/subscription");

    return createSuccessResponse({ id: trial.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to grant free trial";
    const code = message === "UNAUTHORIZED" ? "UNAUTHORIZED"
      : message === "FORBIDDEN" ? "FORBIDDEN"
      : "INTERNAL_ERROR";
    return createErrorResponse(message, code);
  }
}

export async function cancelFreeTrialAction(
  trialId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.ADMIN, Role.COACH]);

    const trial = await cancelFreeTrial({
      trialId,
      cancelledById: session.user.id,
      cancelledByRole: session.user.role,
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/coach/subscriptions");
    revalidatePath("/client/subscription");

    return createSuccessResponse({ id: trial.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel free trial";
    const code = message === "UNAUTHORIZED" ? "UNAUTHORIZED"
      : message === "FORBIDDEN" ? "FORBIDDEN"
      : "INTERNAL_ERROR";
    return createErrorResponse(message, code);
  }
}

export async function getClientFreeTrialAction(): Promise<
  ApiResponse<{
    id: string;
    durationDays: number;
    startDate: Date;
    endDate: Date;
    status: string;
    reason: string | null;
    grantedBy: { name: string | null; email: string };
    daysRemaining: number;
  } | null>
> {
  try {
    const session = await requireAuth();

    const trial = await getClientFreeTrial(session.user.id);

    if (!trial) {
      return createSuccessResponse(null);
    }

    const now = new Date();
    const msRemaining = trial.endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

    return createSuccessResponse({
      id: trial.id,
      durationDays: trial.durationDays,
      startDate: trial.startDate,
      endDate: trial.endDate,
      status: trial.status,
      reason: trial.reason,
      grantedBy: {
        name: trial.grantedBy.name,
        email: trial.grantedBy.email,
      },
      daysRemaining,
    });
  } catch (error) {
    console.error("getClientFreeTrialAction error:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to get free trial",
      "INTERNAL_ERROR",
    );
  }
}

export async function getAllFreeTrialsAction(): Promise<
  ApiResponse<
    Array<{
      id: string;
      durationDays: number;
      startDate: Date;
      endDate: Date;
      status: string;
      reason: string | null;
      createdAt: Date;
      user: { id: string; name: string | null; email: string };
      grantedBy: { id: string; name: string | null; email: string };
    }>
  >
> {
  try {
    await requireRole([Role.ADMIN]);

    const trials = await getAllFreeTrials();
    return createSuccessResponse(trials);
  } catch (error) {
    console.error("getAllFreeTrialsAction error:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to get free trials",
      "INTERNAL_ERROR",
    );
  }
}

export async function getCoachFreeTrialsAction(): Promise<
  ApiResponse<
    Array<{
      id: string;
      durationDays: number;
      startDate: Date;
      endDate: Date;
      status: string;
      reason: string | null;
      createdAt: Date;
      user: { id: string; name: string | null; email: string };
      grantedBy: { id: string; name: string | null; email: string };
    }>
  >
> {
  try {
    const session = await requireRole([Role.COACH]);

    const trials = await getCoachFreeTrials(session.user.id);
    return createSuccessResponse(trials);
  } catch (error) {
    console.error("getCoachFreeTrialsAction error:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to get free trials",
      "INTERNAL_ERROR",
    );
  }
}

export async function expireOverdueTrialsAction(): Promise<
  ApiResponse<{ expiredCount: number }>
> {
  try {
    await requireRole([Role.ADMIN]);

    const expiredCount = await expireOverdueTrials();
    return createSuccessResponse({ expiredCount });
  } catch (error) {
    console.error("expireOverdueTrialsAction error:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to expire trials",
      "INTERNAL_ERROR",
    );
  }
}
