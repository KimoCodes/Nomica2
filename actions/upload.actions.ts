"use server";

import { requireAuth } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { uploadChatImage } from "@/server/services/upload.service";
import type { ApiResponse } from "@/types";

export async function uploadChatImageAction(
  formData: FormData,
): Promise<ApiResponse<{ url: string }>> {
  try {
    await requireAuth();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return createErrorResponse("No file provided", "VALIDATION_ERROR");
    }

    const result = await uploadChatImage(file);
    return createSuccessResponse({ url: result.url });
  } catch (error) {
    if (error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return createErrorResponse(
        "Image uploads are not configured yet",
        "CLOUDINARY_NOT_CONFIGURED",
      );
    }
    if (error instanceof Error && error.message === "INVALID_FILE_TYPE") {
      return createErrorResponse(
        "Only JPEG, PNG, and WebP images are allowed",
        "INVALID_FILE_TYPE",
      );
    }
    if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
      return createErrorResponse("Image must be 5MB or smaller", "FILE_TOO_LARGE");
    }
    console.error("uploadChatImageAction error:", error);
    return createErrorResponse("Failed to upload image", "INTERNAL_ERROR");
  }
}
