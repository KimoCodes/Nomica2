import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Role, MediaType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as MediaType | null;
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const programId = searchParams.get("programId");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (tag) {
      where.tags = { some: { tag } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (programId) {
      where.programId = programId;
    }

    if (session.user.role === Role.COACH) {
      where.uploadedById = session.user.id;
    } else if (session.user.role === Role.CLIENT) {
      where.OR = [
        { uploadedById: session.user.id },
        { visibility: "PUBLIC" },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          tags: true,
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { progressLogs: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Media list error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}
