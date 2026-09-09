import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCoachClients } from "@/server/services/assignment.service";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await requireAuth();

    if (session.user.role !== "COACH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await getCoachClients(session.user.id);

    return NextResponse.json({
      clients: clients.map((c) => ({
        id: c.user.id,
        name: c.user.name,
        email: c.user.email,
        avatar: c.user.avatar,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "GET /api/coach/clients error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
