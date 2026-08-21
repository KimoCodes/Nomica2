"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getUnreadNotificationCount() {
  const session = await requireAuth();
  const userId = session.user.id;

  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function getNotifications(limit = 20) {
  const session = await requireAuth();
  const userId = session.user.id;

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(notificationId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await requireAuth();
  const userId = session.user.id;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return { success: true };
}
