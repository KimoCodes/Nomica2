import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();

    if (session.user.role !== Role.COACH && session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submissions = await prisma.transformationSubmission.findMany({
      where: { status: "SUBMITTED" },
      include: {
        beforePhoto: true,
        afterPhoto: true,
        clientProfile: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Coach transformations list error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
