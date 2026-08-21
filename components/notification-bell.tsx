"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "@/actions/notifications.actions";

type NotificationData = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

const NOTIFICATION_ICONS: Record<string, string> = {
  NEW_MESSAGE: "💬",
  WORKOUT_ASSIGNED: "🏋️",
  SUBSCRIPTION_EXPIRING: "⚠️",
  SUBSCRIPTION_APPROVED: "✅",
  SUBSCRIPTION_REVOKED: "❌",
  CHECK_IN_DUE: "📋",
  COACH_ASSIGNED: "👩‍🏫",
  PAYMENT_SUBMITTED: "💰",
  PAYMENT_APPROVED: "✅",
  PAYMENT_REJECTED: "❌",
  PAYMENT_PROOF_REQUESTED: "📎",
};

export function NotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getUnreadNotificationCount().then(setCount);
  }, []);

  function fetchNotifications() {
    getNotifications(20).then((data) => {
      setNotifications(data as NotificationData[]);
      setOpen(true);
    });
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setCount((prev) => Math.max(0, prev - 1));
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setCount(0);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) fetchNotifications(); }}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="size-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count > 9 ? "9+" : count}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-3">
          <DialogTitle className="text-base">Notifications</DialogTitle>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="text-xs text-muted-foreground"
            >
              <CheckCheck className="mr-1 size-3.5" />
              Mark all read
            </Button>
          )}
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 border-b border-border/30 px-4 py-3 transition-colors hover:bg-muted/50",
                  !n.read && "bg-primary/5"
                )}
              >
                <span className="mt-0.5 text-lg">{NOTIFICATION_ICONS[n.type] ?? "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => handleMarkRead(n.id)}
                    disabled={isPending}
                  >
                    <Check className="size-3.5" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
