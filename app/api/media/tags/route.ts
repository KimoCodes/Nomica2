import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (search) {
      where.tag = { contains: search, mode: "insensitive" };
    }

    const tags = await prisma.mediaTag.groupBy({
      by: ["tag"],
      where,
      _count: { tag: true },
      orderBy: { _count: { tag: "desc" } },
      take: 50,
    });

    return NextResponse.json({
      tags: tags.map((t) => ({
        tag: t.tag,
        count: t._count.tag,
      })),
    });
  } catch (error) {
    console.error("Tags fetch error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}
