"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  approveCoach,
  revokeCoach,
  updateUserRole,
  deleteUser,
} from "@/server/services/admin.service";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

export async function approveCoachAction(
  coachProfileId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireRole([Role.ADMIN]);
    const result = await approveCoach(coachProfileId);
    revalidatePath("/admin/coaches");
    revalidatePath("/admin");
    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "approveCoachAction" }, "Failed to approve coach");
    return createErrorResponse("Failed to approve coach", "INTERNAL_ERROR");
  }
}

export async function revokeCoachAction(
  coachProfileId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireRole([Role.ADMIN]);
    const result = await revokeCoach(coachProfileId);
    revalidatePath("/admin/coaches");
    revalidatePath("/admin");
    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "revokeCoachAction" }, "Failed to revoke coach");
    return createErrorResponse("Failed to revoke coach", "INTERNAL_ERROR");
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: "ADMIN" | "COACH" | "CLIENT",
): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireRole([Role.ADMIN]);
    const result = await updateUserRole(userId, role);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "updateUserRoleAction" }, "Failed to update user role");
    return createErrorResponse("Failed to update user role", "INTERNAL_ERROR");
  }
}

export async function deleteUserAction(
  userId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireRole([Role.ADMIN]);
    const result = await deleteUser(userId);
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "deleteUserAction" }, "Failed to delete user");
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to delete user",
      "INTERNAL_ERROR",
    );
  }
}
