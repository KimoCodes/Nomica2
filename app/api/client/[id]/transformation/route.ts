import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAuth } from "@/lib/auth";
import { Role, MediaVisibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadMedia } from "@/lib/cloudinary";
import { createTransformationSchema } from "@/server/validators/transformation.schema";
import {
  createTransformationSubmission,
  getClientTransformations,
} from "@/server/services/transformation.service";
import { createNotification } from "@/server/services/notification.service";

const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5GB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: clientId } = await params;

    if (session.user.role === Role.CLIENT) {
      const profile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!profile || profile.id !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const transformations = await getClientTransformations(
      session.user.role === Role.CLIENT ? session.user.id : "",
    );

    return NextResponse.json({ transformations });
  } catch (error) {
    console.error("Transformation list error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch transformations" },
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
      include: { user: { select: { name: true } } },
    });

    if (!profile || profile.id !== clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const parsed = createTransformationSchema.parse({
      name: formData.get("name"),
      quote: formData.get("quote"),
      story: formData.get("story"),
      beforeWeight: formData.get("beforeWeight"),
      afterWeight: formData.get("afterWeight"),
      duration: formData.get("duration"),
      programName: formData.get("programName"),
    });

    let beforePhotoId: string | undefined;
    let afterPhotoId: string | undefined;

    const beforeFile = formData.get("beforePhoto");
    const afterFile = formData.get("afterPhoto");

    if (beforeFile instanceof File && beforeFile.size > 0) {
      if (beforeFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Before photo must be under 1.5GB" },
          { status: 400 },
        );
      }
      if (!ALLOWED_TYPES.includes(beforeFile.type)) {
        return NextResponse.json(
          { error: "Before photo must be JPEG, PNG, or WebP" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await beforeFile.arrayBuffer());
      const uploadResult = await uploadMedia(
        buffer,
        beforeFile.name,
        "client-progress/photos",
      );

      const media = await prisma.media.create({
        data: {
          title: `Transformation Before - ${parsed.name}`,
          type: "TRANSFORMATION",
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          fileSize: uploadResult.bytes,
          mimeType: beforeFile.type,
          width: uploadResult.width,
          height: uploadResult.height,
          uploadedById: session.user.id,
          visibility: MediaVisibility.PUBLIC,
        },
      });
      beforePhotoId = media.id;
    }

    if (afterFile instanceof File && afterFile.size > 0) {
      if (afterFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "After photo must be under 1.5GB" },
          { status: 400 },
        );
      }
      if (!ALLOWED_TYPES.includes(afterFile.type)) {
        return NextResponse.json(
          { error: "After photo must be JPEG, PNG, or WebP" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await afterFile.arrayBuffer());
      const uploadResult = await uploadMedia(
        buffer,
        afterFile.name,
        "client-progress/photos",
      );

      const media = await prisma.media.create({
        data: {
          title: `Transformation After - ${parsed.name}`,
          type: "TRANSFORMATION",
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          fileSize: uploadResult.bytes,
          mimeType: afterFile.type,
          width: uploadResult.width,
          height: uploadResult.height,
          uploadedById: session.user.id,
          visibility: MediaVisibility.PUBLIC,
        },
      });
      afterPhotoId = media.id;
    }

    const submission = await createTransformationSubmission(
      session.user.id,
      parsed,
      beforePhotoId,
      afterPhotoId,
    );

    try {
      if (profile.coachId) {
        await createNotification({
          userId: profile.coachId,
          type: "CHECK_IN_DUE",
          title: "New transformation submitted",
          body: `${profile.user?.name ?? "Your client"} submitted a transformation story for review`,
          link: "/coach/transformations",
        });
      }
    } catch {
      // Notification failure should not block submission
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("Transformation submission error:", error);

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
        { error: "Media uploads are not configured." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to submit transformation" },
      { status: 500 },
    );
  }
}
