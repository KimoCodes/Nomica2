"use server";

import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";
import { createErrorResponse, createSuccessResponse } from "@/server/utils/response";
import type { ApiResponse } from "@/types";
import {
  getPageContentBySlug,
  getAllPageContentBySlug,
  getPublishedPageContent,
  getPageContentById,
  upsertPageContent,
  publishPageContent,
  unpublishPageContent,
  deletePageContent,
  getPageContentVersions,
  rollbackPageContent,
  getAllPageSlugs,
  type PageContentInput,
} from "@/server/services/page-content.service";

export async function getPublishedPageContentAction(pageSlug: string): Promise<ApiResponse> {
  try {
    const content = await getPublishedPageContent(pageSlug);
    return createSuccessResponse(content);
  } catch (error) {
    logger.error({ err: error }, "Failed to get published page content");
    return createErrorResponse("Failed to get page content");
  }
}

export async function getAdminPageContentAction(pageSlug: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const content = await getAllPageContentBySlug(pageSlug);
    return createSuccessResponse(content);
  } catch (error) {
    logger.error({ err: error }, "Failed to get admin page content");
    return createErrorResponse("Failed to get page content");
  }
}

export async function getPageContentByIdAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const content = await getPageContentById(id);
    if (!content) return createErrorResponse("Content not found", "NOT_FOUND");
    return createSuccessResponse(content);
  } catch (error) {
    logger.error({ err: error }, "Failed to get page content by id");
    return createErrorResponse("Failed to get page content");
  }
}

export async function upsertPageContentAction(data: PageContentInput): Promise<ApiResponse> {
  try {
    const session = await requireRole([Role.ADMIN]);
    const content = await upsertPageContent({
      ...data,
      createdById: session.user.id,
    });
    revalidatePath("/admin/content");
    revalidatePath(`/admin/content/pages/${data.pageSlug}`);
    revalidatePath(`/${data.pageSlug === "home" ? "" : data.pageSlug}`);
    return createSuccessResponse(content);
  } catch (error) {
    logger.error({ err: error }, "Failed to upsert page content");
    return createErrorResponse("Failed to save page content");
  }
}

export async function publishPageContentAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const content = await publishPageContent(id);
    revalidatePath("/admin/content");
    revalidatePath(`/${content.pageSlug === "home" ? "" : content.pageSlug}`);
    return createSuccessResponse(content);
  } catch (error) {
    logger.error({ err: error }, "Failed to publish page content");
    return createErrorResponse("Failed to publish content");
  }
}

export async function unpublishPageContentAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const content = await unpublishPageContent(id);
    revalidatePath("/admin/content");
    revalidatePath(`/${content.pageSlug === "home" ? "" : content.pageSlug}`);
    return createSuccessResponse(content);
  } catch (error) {
    logger.error({ err: error }, "Failed to unpublish page content");
    return createErrorResponse("Failed to unpublish content");
  }
}

export async function deletePageContentAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const content = await getPageContentById(id);
    if (!content) return createErrorResponse("Content not found", "NOT_FOUND");
    await deletePageContent(id);
    revalidatePath("/admin/content");
    revalidatePath(`/admin/content/pages/${content.pageSlug}`);
    return createSuccessResponse({ deleted: true });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete page content");
    return createErrorResponse("Failed to delete content");
  }
}

export async function getPageContentVersionsAction(pageContentId: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const versions = await getPageContentVersions(pageContentId);
    return createSuccessResponse(versions);
  } catch (error) {
    logger.error({ err: error }, "Failed to get page content versions");
    return createErrorResponse("Failed to get versions");
  }
}

export async function rollbackPageContentAction(id: string, versionId: string): Promise<ApiResponse> {
  try {
    const session = await requireRole([Role.ADMIN]);
    const content = await rollbackPageContent(id, versionId, session.user.id);
    revalidatePath("/admin/content");
    revalidatePath(`/admin/content/pages/${content.pageSlug}`);
    revalidatePath(`/${content.pageSlug === "home" ? "" : content.pageSlug}`);
    return createSuccessResponse(content);
  } catch (error) {
    logger.error({ err: error }, "Failed to rollback page content");
    return createErrorResponse("Failed to rollback content");
  }
}

export async function getAllPageSlugsAction(): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const slugs = await getAllPageSlugs();
    return createSuccessResponse(slugs);
  } catch (error) {
    logger.error({ err: error }, "Failed to get page slugs");
    return createErrorResponse("Failed to get page slugs");
  }
}
