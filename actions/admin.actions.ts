"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { approveCoach, revokeCoach } from "@/server/services/admin.service";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import type { ApiResponse } from "@/types";

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
    console.error("approveCoachAction error:", error);
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
    console.error("revokeCoachAction error:", error);
    return createErrorResponse("Failed to revoke coach", "INTERNAL_ERROR");
  }
}
