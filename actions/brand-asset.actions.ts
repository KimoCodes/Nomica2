"use server";

import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";
import { createErrorResponse, createSuccessResponse } from "@/server/utils/response";
import type { ApiResponse } from "@/types";
import {
  getBrandAssets,
  getBrandAssetByType,
  upsertBrandAsset,
  deleteBrandAsset,
  getBrandAssetsMap,
} from "@/server/services/brand-asset.service";
import { uploadMedia, deleteMedia } from "@/lib/cloudinary";

export async function getBrandAssetsAction(): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const assets = await getBrandAssets();
    return createSuccessResponse(assets);
  } catch (error) {
    logger.error({ err: error }, "Failed to get brand assets");
    return createErrorResponse("Failed to get brand assets");
  }
}

export async function getBrandAssetsMapAction(): Promise<ApiResponse> {
  try {
    const map = await getBrandAssetsMap();
    return createSuccessResponse(map);
  } catch (error) {
    logger.error({ err: error }, "Failed to get brand assets map");
    return createErrorResponse("Failed to get brand assets");
  }
}

export async function getBrandAssetByTypeAction(assetType: string): Promise<ApiResponse> {
  try {
    const asset = await getBrandAssetByType(assetType);
    return createSuccessResponse(asset);
  } catch (error) {
    logger.error({ err: error }, "Failed to get brand asset by type");
    return createErrorResponse("Failed to get brand asset");
  }
}

export async function uploadBrandAssetAction(assetType: string, file: File): Promise<ApiResponse> {
  try {
    const session = await requireRole([Role.ADMIN]);
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadMedia(buffer, file.name, "site/brand-assets");
    const asset = await upsertBrandAsset({
      assetType,
      name: file.name,
      url: uploadResult.url,
      mimeType: file.type,
      fileSize: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedById: session.user.id,
    });
    revalidatePath("/admin/content/branding");
    revalidatePath("/");
    return createSuccessResponse(asset);
  } catch (error) {
    logger.error({ err: error }, "Failed to upload brand asset");
    return createErrorResponse("Failed to upload brand asset");
  }
}

export async function deleteBrandAssetAction(assetType: string): Promise<ApiResponse> {
  try {
    await requireRole([Role.ADMIN]);
    const asset = await getBrandAssetByType(assetType);
    if (asset?.url) {
      try {
        await deleteMedia(asset.url);
      } catch (e) {
        logger.warn({ err: e }, "Failed to delete brand asset from Cloudinary");
      }
    }
    await deleteBrandAsset(assetType);
    revalidatePath("/admin/content/branding");
    revalidatePath("/");
    return createSuccessResponse({ deleted: true });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete brand asset");
    return createErrorResponse("Failed to delete brand asset");
  }
}
