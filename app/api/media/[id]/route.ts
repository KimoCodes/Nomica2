import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteMedia } from "@/lib/cloudinary";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        tags: true,
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        progressLogs: {
          select: { id: true, type: true, title: true, createdAt: true },
          take: 5,
        },
        _count: {
          select: { progressLogs: true },
        },
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (
      session.user.role === Role.CLIENT &&
      media.uploadedById !== session.user.id &&
      media.visibility === "COACH_ONLY"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media fetch error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (
      session.user.role === Role.CLIENT ||
      (session.user.role === Role.COACH && media.uploadedById !== session.user.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, visibility, tags } = body;

    const updated = await prisma.media.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(visibility !== undefined && { visibility }),
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            create: tags.map((tag: string) => ({ tag })),
          },
        }),
      },
      include: {
        tags: true,
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ media: updated });
  } catch (error) {
    console.error("Media update error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (
      session.user.role === Role.CLIENT ||
      (session.user.role === Role.COACH && media.uploadedById !== session.user.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteMedia(media.url);

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 },
    );
  }
}
