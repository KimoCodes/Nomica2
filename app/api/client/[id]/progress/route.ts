import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Role, ProgressLogType, MediaVisibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadMedia } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: clientId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const skip = (page - 1) * limit;

    if (session.user.role === Role.CLIENT) {
      const profile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!profile || profile.id !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (session.user.role === Role.COACH) {
      const profile = await prisma.clientProfile.findUnique({
        where: { id: clientId },
      });
      if (!profile || profile.coachId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const [logs, total] = await Promise.all([
      prisma.progressLog.findMany({
        where: { clientProfileId: clientId },
        include: {
          media: true,
          photos: {
            include: { media: true },
          },
          coach: {
            select: { id: true, name: true },
          },
        },
        orderBy: { loggedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.progressLog.count({
        where: { clientProfileId: clientId },
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Progress list error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: clientId } = await params;

    if (session.user.role !== Role.CLIENT) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile || profile.id !== clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const type = (formData.get("type") as string) || "PROGRESS_PHOTO";
    const title = (formData.get("title") as string) || null;
    const description = (formData.get("description") as string) || null;
    const weight = formData.get("weight")
      ? parseFloat(formData.get("weight") as string)
      : null;
    const waist = formData.get("waistCm")
      ? parseFloat(formData.get("waistCm") as string)
      : null;
    const hips = formData.get("hipCm")
      ? parseFloat(formData.get("hipCm") as string)
      : null;
    const notes = (formData.get("notes") as string) || null;
    const photoAngles = (formData.get("photoAngles") as string) || null;

    const log = await prisma.progressLog.create({
      data: {
        clientProfileId: clientId,
        type: type as ProgressLogType,
        title,
        description,
        weight,
        waist,
        hips,
        notes,
        visibility: MediaVisibility.COACH_ONLY,
      },
    });

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        files.push(value);
      }
    }

    const angles = photoAngles?.split(",") ?? [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        continue;
      }

      const isVideo = file.type.startsWith("video/");
      const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_PHOTO_TYPES;

      if (!allowedTypes.includes(file.type)) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const folder = isVideo
        ? "client-progress/videos"
        : "client-progress/photos";

      const uploadResult = await uploadMedia(buffer, file.name, folder);

      const media = await prisma.media.create({
        data: {
          title: `${title ?? "Progress"} - ${file.name}`,
          type: isVideo ? "PROGRESS_VIDEO" : "PROGRESS_PHOTO",
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          fileSize: uploadResult.bytes,
          mimeType: file.type,
          duration: uploadResult.duration,
          width: uploadResult.width,
          height: uploadResult.height,
          uploadedById: session.user.id,
          visibility: MediaVisibility.COACH_ONLY,
        },
      });

      if (!isVideo && angles[i]) {
        await prisma.progressPhoto.create({
          data: {
            logId: log.id,
            mediaId: media.id,
            view: angles[i] as "FRONT" | "SIDE" | "BACK",
          },
        });
      } else {
        await prisma.progressLog.update({
          where: { id: log.id },
          data: { mediaId: media.id },
        });
      }
    }

    const fullLog = await prisma.progressLog.findUnique({
      where: { id: log.id },
      include: {
        media: true,
        photos: { include: { media: true } },
      },
    });

    return NextResponse.json({ log: fullLog }, { status: 201 });
  } catch (error) {
    console.error("Progress upload error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create progress entry" },
      { status: 500 },
    );
  }
}
