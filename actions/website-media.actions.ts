"use server";

import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";
import { createErrorResponse, createSuccessResponse } from "@/server/utils/response";
import type { ApiResponse } from "@/types";
import {
  getWebsiteMedia,
  getWebsiteMediaById,
  updateWebsiteMedia,
  publishWebsiteMedia,
  archiveWebsiteMedia,
  deleteWebsiteMedia,
  getMediaStats,
  createWebsiteMedia,
  type UploadWebsiteMediaInput,
} from "@/server/services/website-media.service";
import { uploadMedia, deleteMedia } from "@/lib/cloudinary";
import { WebsiteMediaStatus, WebsiteMediaCategory } from "@prisma/client";

export async function getWebsiteMediaAction(params?: {
  category?: WebsiteMediaCategory;
  status?: WebsiteMediaStatus;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const result = await getWebsiteMedia(params);
    return createSuccessResponse(result);
  } catch (error) {
    logger.error({ err: error }, "Failed to get website media");
    return createErrorResponse("Failed to get website media");
  }
}

export async function getWebsiteMediaByIdAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const media = await getWebsiteMediaById(id);
    if (!media) return createErrorResponse("Media not found", "NOT_FOUND");
    return createSuccessResponse(media);
  } catch (error) {
    logger.error({ err: error }, "Failed to get website media by id");
    return createErrorResponse("Failed to get website media");
  }
}

export async function uploadWebsiteMediaAction(
  file: File,
  input: UploadWebsiteMediaInput,
): Promise<ApiResponse> {
  try {
    const session = await requireRole([Role.ADMIN]);
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadMedia(buffer, file.name, "site/website-media");
    const media = await createWebsiteMedia({
      ...input,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl || undefined,
      mimeType: file.type,
      fileSize: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
      uploadedById: session.user.id,
    });
    revalidatePath("/admin/content");
    return createSuccessResponse(media);
  } catch (error) {
    logger.error({ err: error }, "Failed to upload website media");
    return createErrorResponse("Failed to upload media");
  }
}

export async function updateWebsiteMediaAction(
  id: string,
  data: Partial<UploadWebsiteMediaInput & { status: WebsiteMediaStatus }>,
): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const media = await updateWebsiteMedia(id, data);
    revalidatePath("/admin/content");
    revalidatePath("/admin/content/media");
    return createSuccessResponse(media);
  } catch (error) {
    logger.error({ err: error }, "Failed to update website media");
    return createErrorResponse("Failed to update media");
  }
}

export async function publishWebsiteMediaAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const media = await publishWebsiteMedia(id);
    revalidatePath("/admin/content");
    revalidatePath("/admin/content/media");
    revalidatePath("/");
    return createSuccessResponse(media);
  } catch (error) {
    logger.error({ err: error }, "Failed to publish website media");
    return createErrorResponse("Failed to publish media");
  }
}

export async function archiveWebsiteMediaAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const media = await archiveWebsiteMedia(id);
    revalidatePath("/admin/content");
    revalidatePath("/admin/content/media");
    return createSuccessResponse(media);
  } catch (error) {
    logger.error({ err: error }, "Failed to archive website media");
    return createErrorResponse("Failed to archive media");
  }
}

export async function deleteWebsiteMediaAction(id: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const media = await getWebsiteMediaById(id);
    if (!media) return createErrorResponse("Media not found", "NOT_FOUND");
    await deleteWebsiteMedia(id);
    try {
      await deleteMedia(media.url);
    } catch (e) {
      logger.warn({ err: e }, "Failed to delete from Cloudinary (continuing)");
    }
    revalidatePath("/admin/content");
    revalidatePath("/admin/content/media");
    return createSuccessResponse({ deleted: true });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete website media");
    return createErrorResponse("Failed to delete media");
  }
}

export async function getMediaStatsAction(): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const stats = await getMediaStats();
    return createSuccessResponse(stats);
  } catch (error) {
    logger.error({ err: error }, "Failed to get media stats");
    return createErrorResponse("Failed to get media stats");
  }
}
