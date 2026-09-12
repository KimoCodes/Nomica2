"use server";

import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";
import { createErrorResponse, createSuccessResponse } from "@/server/utils/response";
import type { ApiResponse } from "@/types";
import {
  getThemes,
  getPublishedTheme,
  createTheme,
  updateTheme,
  publishTheme,
  deleteTheme,
  getThemeAsCSSVariables,
  getDefaultTheme,
  getThemeVersions,
  type SiteThemeInput,
} from "@/server/services/site-theme.service";

export async function getThemesAction(): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const themes = await getThemes();
    return createSuccessResponse(themes);
  } catch (error) {
    logger.error({ err: error }, "Failed to get themes");
    return createErrorResponse("Failed to get themes");
  }
}

export async function getPublishedThemeAction(): Promise<ApiResponse> {
  try {
    const theme = await getPublishedTheme();
    return createSuccessResponse(theme);
  } catch (error) {
    logger.error({ err: error }, "Failed to get published theme");
    return createErrorResponse("Failed to get published theme");
  }
}

export async function getPublishedThemeCSSAction(): Promise<ApiResponse> {
  try {
    const theme = await getPublishedTheme();
    const cssVars = await getThemeAsCSSVariables(theme);
    return createSuccessResponse(cssVars);
  } catch (error) {
    logger.error({ err: error }, "Failed to get published theme CSS");
    return createErrorResponse("Failed to get theme CSS");
  }
}

export async function getDefaultThemeAction(): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const theme = await getDefaultTheme();
    return createSuccessResponse(theme);
  } catch (error) {
    logger.error({ err: error }, "Failed to get default theme");
    return createErrorResponse("Failed to get default theme");
  }
}

export async function createThemeAction(data: SiteThemeInput): Promise<ApiResponse> {
  try {
    const session = await requireRole([Role.ADMIN]);
    const theme = await createTheme({
      ...data,
      createdById: session.user.id,
    });
    revalidatePath("/admin/content/theme");
    return createSuccessResponse(theme);
  } catch (error) {
    logger.error({ err: error }, "Failed to create theme");
    return createErrorResponse("Failed to create theme");
  }
}

export async function updateThemeAction(id: string, data: Partial<SiteThemeInput>): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const theme = await updateTheme(id, data);
    revalidatePath("/admin/content/theme");
    return createSuccessResponse(theme);
  } catch (error) {
    logger.error({ err: error }, "Failed to update theme");
    return createErrorResponse("Failed to update theme");
  }
}

export async function publishThemeAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const theme = await publishTheme(id);
    revalidatePath("/admin/content/theme");
    revalidatePath("/");
    return createSuccessResponse(theme);
  } catch (error) {
    logger.error({ err: error }, "Failed to publish theme");
    return createErrorResponse("Failed to publish theme");
  }
}

export async function deleteThemeAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    await deleteTheme(id);
    revalidatePath("/admin/content/theme");
    return createSuccessResponse({ deleted: true });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete theme");
    return createErrorResponse("Failed to delete theme");
  }
}

export async function getThemeVersionsAction(themeId: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const versions = await getThemeVersions(themeId);
    return createSuccessResponse(versions);
  } catch (error) {
    logger.error({ err: error }, "Failed to get theme versions");
    return createErrorResponse("Failed to get theme versions");
  }
}
