import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { requireAuth } from "@/lib/auth";
import { Role, ProgressLogType, MediaVisibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadMedia } from "@/lib/cloudinary";
import { createNotification } from "@/server/services/notification.service";

const postBodySchema = z.object({
  type: z.nativeEnum(ProgressLogType).default("PROGRESS_PHOTO"),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  weight: z.coerce.number().positive().max(500).optional().nullable(),
  waistCm: z.coerce.number().positive().max(300).optional().nullable(),
  hipCm: z.coerce.number().positive().max(300).optional().nullable(),
  gluteCm: z.coerce.number().positive().max(300).optional().nullable(),
  thighCm: z.coerce.number().positive().max(300).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  photoAngles: z.string().optional().nullable(),
});

const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5GB
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
    const parsed = postBodySchema.parse({
      type: formData.get("type"),
      title: formData.get("title"),
      description: formData.get("description"),
      weight: formData.get("weight"),
      waistCm: formData.get("waistCm"),
      hipCm: formData.get("hipCm"),
      gluteCm: formData.get("gluteCm"),
      thighCm: formData.get("thighCm"),
      notes: formData.get("notes"),
      photoAngles: formData.get("photoAngles"),
    });

    const log = await prisma.progressLog.create({
      data: {
        clientProfileId: clientId,
        type: parsed.type,
        title: parsed.title,
        description: parsed.description,
        weight: parsed.weight,
        waist: parsed.waistCm,
        hipCm: parsed.hipCm,
        gluteCm: parsed.gluteCm,
        thighCm: parsed.thighCm,
        notes: parsed.notes,
        visibility: MediaVisibility.COACH_ONLY,
      },
    });

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        files.push(value);
      }
    }

    const angles = parsed.photoAngles?.split(",") ?? [];

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
          title: `${parsed.title ?? "Progress"} - ${file.name}`,
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

    // Notify coach of progress upload
    try {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { id: clientId },
        include: { user: { select: { id: true, name: true } } },
      });

      if (clientProfile?.coachId) {
        await createNotification({
          userId: clientProfile.coachId,
          type: "CHECK_IN_DUE",
          title: "New progress uploaded",
          body: `${clientProfile.user.name ?? "Your client"} uploaded progress ${parsed.type === "PROGRESS_PHOTO" ? "photos" : "video"}`,
          link: "/coach/clients",
        });
      }
    } catch {
      // Notification failure should not block upload
    }

    return NextResponse.json({ log: fullLog }, { status: 201 });
  } catch (error) {
    console.error("Progress upload error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Media uploads are not configured. Please set CLOUDINARY environment variables." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create progress entry" },
      { status: 500 },
    );
  }
}
