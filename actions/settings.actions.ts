"use server";

import { Role, Difficulty, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";

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

import type { ApiResponse } from "@/types";

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
    await requireRole([Role.ADMIN]);

    const result = await updateProgramSellable(programId, data);

    revalidatePath("/admin/programs");

    return createSuccessResponse({ id: result.id });
  } catch (error) {
    console.error("updateProgramSellableAction error:", error);
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
    await requireRole([Role.ADMIN]);

    const result = await deleteProgram(programId);

    revalidatePath("/admin/programs");

    return createSuccessResponse({ id: result.id });
  } catch (error) {
    console.error("deleteProgramAction error:", error);
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
    console.error("updateLandingContentAction error:", error);
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
    console.error("updateSiteSettingsAction error:", error);
    return createErrorResponse("Failed to update settings", "INTERNAL_ERROR");
  }
}
