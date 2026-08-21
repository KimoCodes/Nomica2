import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { requireAuth } from "@/lib/auth";
import { Role, MediaType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const getQuerySchema = z.object({
  type: z.nativeEnum(MediaType).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  programId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const query = getQuerySchema.parse({
      type: searchParams.get("type"),
      tag: searchParams.get("tag"),
      search: searchParams.get("search"),
      programId: searchParams.get("programId"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const { type, tag, search, programId, page, limit } = query;
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
      const visibilityFilter = {
        OR: [
          { uploadedById: session.user.id },
          { visibility: "PUBLIC" },
          { visibility: "CLIENT_ONLY" },
        ],
      };

      if (where.OR) {
        where.AND = [visibilityFilter, { OR: where.OR }];
        delete where.OR;
      } else {
        where.OR = visibilityFilter.OR;
      }
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

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}
