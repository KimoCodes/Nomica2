import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import logger from "@/lib/logger";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
};

const notificationStore = new Map<string, Notification[]>();

function getNotifications(userId: string): Notification[] {
  return notificationStore.get(userId) ?? [];
}

export async function GET() {
  return traceApiRoute("GET /api/notifications", async () => {
    try {
      const session = await requireAuth();
      const notifications = getNotifications(session.user.id);
      const unreadCount = notifications.filter((n) => !n.read).length;

      return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
      logger.error({ err: error, route: "notifications" }, "GET /api/notifications error");

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
  });
}

export async function POST(request: Request) {
  return traceApiRoute("POST /api/notifications", async () => {
    try {
      const session = await requireAuth();
      const body = await request.json();

      const notification: Notification = {
        id: crypto.randomUUID(),
        title: body.title,
        message: body.message,
        type: body.type ?? "info",
        read: false,
        createdAt: new Date().toISOString(),
      };

      const notifications = getNotifications(session.user.id);
      notifications.unshift(notification);
      notificationStore.set(session.user.id, notifications.slice(0, 50));

      return NextResponse.json({ success: true, notification });
    } catch (error) {
      logger.error({ err: error, route: "notifications" }, "POST /api/notifications error");

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
