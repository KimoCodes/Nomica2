import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import logger from "@/lib/logger";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return traceApiRoute("POST /api/notifications/[id]/read", async () => {
    try {
      await requireAuth();
      const { id } = await params;
      void id;

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error({ err: error, route: "notifications/[id]/read" }, "POST error");

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return traceApiRoute("DELETE /api/notifications/[id]", async () => {
    try {
      await requireAuth();
      const { id } = await params;
      void id;

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error({ err: error, route: "notifications/[id]" }, "DELETE error");

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
