"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createProgressLog } from "@/server/services/progress.service";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { createProgressLogSchema } from "@/server/validators/progress.schema";
import type { ApiResponse } from "@/types";

function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

export async function createProgressLogAction(
  formData: FormData,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.CLIENT]);
    const parsed = createProgressLogSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const log = await createProgressLog(session.user.id, parsed.data);
    revalidatePath("/client");
    revalidatePath("/client/progress");
    return createSuccessResponse({ id: log.id });
  } catch (error) {
    console.error("createProgressLogAction error:", error);
    return createErrorResponse("Failed to save progress log", "INTERNAL_ERROR");
  }
}
