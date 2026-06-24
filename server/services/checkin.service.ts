import { prisma } from "@/lib/prisma";
import { requireClientProfile, requireCoachProfile } from "@/server/services/coach.service";

export async function getClientCheckIns(clientUserId: string) {
  const client = await requireClientProfile(clientUserId);

  return prisma.checkIn.findMany({
    where: { clientProfileId: client.id },
    include: { response: true },
    orderBy: { weekStart: "desc" },
    take: 12,
  });
}

export async function getCurrentWeekCheckIn(clientUserId: string) {
  const client = await requireClientProfile(clientUserId);

  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  return prisma.checkIn.findFirst({
    where: { clientProfileId: client.id, weekStart },
    include: { response: true },
  });
}

export async function getCoachPendingCheckIns(coachUserId: string) {
  await requireCoachProfile(coachUserId);

  return prisma.checkIn.findMany({
    where: {
      submittedAt: { not: null },
      response: null,
      clientProfile: { coachId: coachUserId },
    },
    include: {
      clientProfile: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getCoachCheckInHistory(coachUserId: string) {
  await requireCoachProfile(coachUserId);

  return prisma.checkIn.findMany({
    where: {
      response: { isNot: null },
      clientProfile: { coachId: coachUserId },
    },
    include: {
      response: true,
      clientProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { weekStart: "desc" },
    take: 20,
  });
}
