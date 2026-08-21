import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Role, MediaType, MediaVisibility } from "@prisma/client";
import { uploadMedia } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VALID_VISIBILITY = new Set<MediaVisibility>([
  "PUBLIC",
  "COACH_ONLY",
  "CLIENT_ONLY",
  "TEAM_ONLY",
]);

function getMediaType(
  mimeType: string,
  purpose?: string,
): MediaType {
  if (mimeType.startsWith("video/")) {
    if (purpose === "exercise") return "EXERCISE_DEMO";
    if (purpose === "progress") return "PROGRESS_VIDEO";
    return "WORKOUT_VIDEO";
  }
  if (purpose === "progress") return "PROGRESS_PHOTO";
  if (purpose === "hero") return "HERO_REEL";
  if (purpose === "product") return "PRODUCT_IMAGE";
  return "TRAINING_IMAGE";
}

function getUploadFolder(
  role: Role,
  purpose?: string,
): "coach-uploads/videos" | "coach-uploads/images" | "client-progress/photos" | "client-progress/videos" | "site/hero" | "site/products" {
  if (purpose === "hero") return "site/hero";
  if (purpose === "product") return "site/products";

  if (role === Role.CLIENT) {
    return purpose === "progress-video"
      ? "client-progress/videos"
      : "client-progress/photos";
  }

  return purpose === "video" ? "coach-uploads/videos" : "coach-uploads/images";
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Untitled";
    const description = (formData.get("description") as string) || null;
    const purpose = (formData.get("purpose") as string) || null;
    const tagsRaw = (formData.get("tags") as string) || null;
    const visibility = (formData.get("visibility") as string) || "COACH_ONLY";
    const programId = (formData.get("programId") as string) || null;
    const weekId = (formData.get("weekId") as string) || null;
    const programDayId = (formData.get("programDayId") as string) || null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 },
      );
    }

    const isVideo = file.type.startsWith("video/");
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = getUploadFolder(session.user.role, purpose ?? undefined);
    const mediaType = getMediaType(file.type, purpose ?? undefined);

    const visibilityValue = VALID_VISIBILITY.has(visibility as MediaVisibility)
      ? (visibility as MediaVisibility)
      : "COACH_ONLY";

    const uploadResult = await uploadMedia(buffer, file.name, folder);

    const media = await prisma.media.create({
      data: {
        title,
        description,
        type: mediaType,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        fileSize: uploadResult.bytes,
        mimeType: file.type,
        duration: uploadResult.duration,
        width: uploadResult.width,
        height: uploadResult.height,
        uploadedById: session.user.id,
        visibility: visibilityValue,
        programId: programId || undefined,
        weekId: weekId || undefined,
        programDayId: programDayId || undefined,
        tags: tagsRaw
          ? {
              create: tagsRaw
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag) => ({ tag })),
            }
          : undefined,
      },
      include: {
        tags: true,
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Media upload error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Media uploads are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 },
    );
  }
}
