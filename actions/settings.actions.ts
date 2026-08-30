"use server";

import { Role, Difficulty, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/server/utils/password";

import {
  updateProgramSellable,
  deleteProgram,
  updateLandingContent,
  updateSiteSettings,
} from "@/server/services/admin.service";

import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";

import { logActivity } from "@/server/services/analytics.service";
import type { ApiResponse } from "@/types";
import logger from "@/lib/logger";

/* ------------------------------------------------
   USER PROFILE
------------------------------------------------ */

export async function updateProfileAction(
  formData: FormData,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await requireAuth();
    const name = formData.get("name") as string;

    if (!name || name.trim().length < 2) {
      return createErrorResponse("Name must be at least 2 characters", "VALIDATION_ERROR");
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });

    revalidatePath("/settings");
    return createSuccessResponse({ message: "Profile updated" });
  } catch (error) {
    logger.error({ err: error, action: "updateProfileAction" }, "Failed to update profile");
    return createErrorResponse("Failed to update profile", "INTERNAL_ERROR");
  }
}

export async function changePasswordAction(
  formData: FormData,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await requireAuth();
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
      return createErrorResponse("Both fields are required", "VALIDATION_ERROR");
    }

    if (newPassword.length < 8) {
      return createErrorResponse("New password must be at least 8 characters", "VALIDATION_ERROR");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return createErrorResponse("User not found", "NOT_FOUND");
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return createErrorResponse("Current password is incorrect", "INVALID_PASSWORD");
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return createSuccessResponse({ message: "Password changed" });
  } catch (error) {
    logger.error({ err: error, action: "changePasswordAction" }, "Failed to change password");
    return createErrorResponse("Failed to change password", "INTERNAL_ERROR");
  }
}

/* ------------------------------------------------
   PROGRAMS MANAGER
------------------------------------------------ */

export async function updateProgramSellableAction(
  programId: string,
  data: {
    isSellable?: boolean;
    price?: number | null;
    imageUrl?: string | null;
    features?: string[];
    difficulty?: Difficulty | null;
    duration?: number | null;
  },
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.ADMIN]);

    const result = await updateProgramSellable(programId, data);

    logActivity({
      userId: session.user.id,
      action: "PROGRAM_UPDATED",
      category: "admin",
      resourceType: "program",
      resourceId: programId,
      description: `Program sellable status updated: ${data.isSellable ? "listed" : "unlisted"}`,
      metadata: { isSellable: data.isSellable, price: data.price },
    }).catch(() => {});

    revalidatePath("/admin/programs");
    revalidatePath("/");
    revalidatePath("/programs");

    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "updateProgramSellableAction" }, "Failed to update program");
    return createErrorResponse("Failed to update program", "INTERNAL_ERROR");
  }
}

/* ------------------------------------------------
   DELETE PROGRAM
------------------------------------------------ */

export async function deleteProgramAction(
  programId: string,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await requireRole([Role.ADMIN]);

    const result = await deleteProgram(programId);

    logActivity({
      userId: session.user.id,
      action: "PROGRAM_DELETED",
      category: "admin",
      resourceType: "program",
      resourceId: programId,
      description: "Program deleted by admin",
    }).catch(() => {});

    revalidatePath("/admin/programs");

    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "deleteProgramAction" }, "Failed to delete program");
    return createErrorResponse("Failed to delete program", "INTERNAL_ERROR");
  }
}

/* ------------------------------------------------
   LANDING CONTENT
------------------------------------------------ */

export async function updateLandingContentAction(
  section: string,
  data: {
    title?: string;
    subtitle?: string;
    content?: Prisma.InputJsonValue;
    isActive?: boolean;
    order?: number;
  },
): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireRole([Role.ADMIN]);

    const result = await updateLandingContent(section, data);

    revalidatePath("/admin/content");
    revalidatePath("/");

    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "updateLandingContentAction" }, "Failed to update content");
    return createErrorResponse("Failed to update content", "INTERNAL_ERROR");
  }
}

/* ------------------------------------------------
   SITE SETTINGS
------------------------------------------------ */

export async function updateSiteSettingsAction(
  data: {
    siteName?: string;
    siteDescription?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    logoUrl?: string;
    faviconUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    heroTagline?: string;
    heroSubtext?: string;
  },
): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireRole([Role.ADMIN]);

    const result = await updateSiteSettings(data);

    revalidatePath("/admin/brand");
    revalidatePath("/");

    return createSuccessResponse({ id: result.id });
  } catch (error) {
    logger.error({ err: error, action: "updateSiteSettingsAction" }, "Failed to update settings");
    return createErrorResponse("Failed to update settings", "INTERNAL_ERROR");
  }
}
