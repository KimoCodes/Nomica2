import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { traceApiRoute } from "@/lib/sentry-tracing";
import logger from "@/lib/logger";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return traceApiRoute("POST /api/notifications/[id]/read", async () => {
    try {
      const session = await requireAuth();
      const { id } = await params;

      // Verify the notification belongs to the authenticated user
      const notification = await prisma.notification.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      if (notification.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

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
      const session = await requireAuth();
      const { id } = await params;

      // Verify the notification belongs to the authenticated user
      const notification = await prisma.notification.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      if (notification.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.notification.delete({
        where: { id },
      });

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
