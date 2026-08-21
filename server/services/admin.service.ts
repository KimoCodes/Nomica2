import { prisma } from "@/lib/prisma";
import { Prisma, Difficulty } from "@prisma/client";
import { createNotification } from "@/server/services/notification.service";

/* -----------------------------
   TYPES
------------------------------*/

export type LandingContentInput = {
  title?: string;
  subtitle?: string;
  content?: Prisma.InputJsonValue;
  isActive?: boolean;
  order?: number;
};

/* -----------------------------
   USERS
------------------------------*/

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      coachProfile: {
        select: { approved: true, onboardingComplete: true },
      },
      clientProfile: {
        select: { onboardingComplete: true },
      },
      subscription: {
        select: { plan: true, status: true },
      },
    },
  });
}

export async function updateUserRole(userId: string, role: "ADMIN" | "COACH" | "CLIENT") {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") {
    throw new Error("Cannot delete admin users");
  }

  return prisma.user.delete({ where: { id: userId } });
}

/* -----------------------------
   COACHES
------------------------------*/

export async function getAdminCoaches() {
  return prisma.coachProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
      programs: {
        select: { id: true },
      },
    },
  });
}

/* -----------------------------
   SUBSCRIPTIONS
------------------------------*/

export async function getAdminSubscriptions() {
  return prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      approvedBy: { select: { name: true, email: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { amount: true, createdAt: true },
      },
    },
  });
}

export async function getCoachClientSubscriptions(coachUserId: string) {
  const clients = await prisma.clientProfile.findMany({
    where: { coachId: coachUserId },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          subscription: {
            select: {
              id: true,
              status: true,
              plan: true,
              approvedAt: true,
              approvedBy: { select: { name: true } },
              currentPeriodEnd: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return clients.map((client) => ({
    id: client.id,
    userId: client.userId,
    name: client.user.name,
    email: client.user.email,
    subscription: client.user.subscription,
  }));
}

/* -----------------------------
   COACH APPROVAL
------------------------------*/

export async function approveCoach(coachProfileId: string) {
  const profile = await prisma.coachProfile.update({
    where: { id: coachProfileId },
    data: { approved: true },
    include: { user: { select: { id: true, name: true } } },
  });

  try {
    await createNotification({
      userId: profile.user.id,
      type: "COACH_ASSIGNED",
      title: "Coach account approved",
      body: "Your coach account has been approved. You can now access all coach features.",
      link: "/coach",
    });
  } catch {
    // Notification failure should not block approval
  }

  return profile;
}

export async function revokeCoach(coachProfileId: string) {
  return prisma.coachProfile.update({
    where: { id: coachProfileId },
    data: { approved: false },
  });
}

/* -----------------------------
   PROGRAMS
------------------------------*/

export async function getAdminPrograms() {
  return prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      coach: {
        select: {
          user: { select: { name: true } },
        },
      },
      weeks: {
        select: {
          id: true,
          days: { select: { id: true } },
        },
      },
      assignments: {
        select: { id: true, isActive: true },
      },
    },
  });
}

export async function getProgramById(id: string) {
  return prisma.program.findUnique({
    where: { id },
    include: {
      coach: {
        select: { user: { select: { name: true } } },
      },
      weeks: {
        include: {
          days: {
            include: {
              exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { dayNumber: "asc" },
          },
        },
        orderBy: { weekNumber: "asc" },
      },
    },
  });
}

export async function updateProgramSellable(
  id: string,
  data: {
    isSellable?: boolean;
    price?: number | null;
    imageUrl?: string | null;
    features?: string[];
    difficulty?: Difficulty | null;
    duration?: number | null;
  }
) {
  return prisma.program.update({
    where: { id },
    data: {
      ...data,
      difficulty: data.difficulty ?? undefined,
    },
  });
}

export async function deleteProgram(id: string) {
  return prisma.program.delete({
    where: { id },
  });
}

/* -----------------------------
   CLIENTS
------------------------------*/

export async function getAdminClients() {
  return prisma.clientProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
      coach: {
        select: { name: true },
      },
      programs: {
        select: {
          id: true,
          program: { select: { title: true } },
          isActive: true,
        },
      },
      progressLogs: {
        orderBy: { loggedAt: "desc" },
        take: 1,
        select: { loggedAt: true, weight: true },
      },
      checkIns: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, currentWeight: true },
      },
    },
  });
}

export async function getClientProfileById(userId: string) {
  return prisma.clientProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          avatar: true,
        },
      },
      coach: { select: { name: true } },
      programs: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          isActive: true,
          program: { select: { title: true } },
          completions: { select: { id: true, completedAt: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      progressLogs: {
        orderBy: { loggedAt: "desc" },
        select: {
          id: true,
          type: true,
          title: true,
          weight: true,
          bodyFat: true,
          waist: true,
          chest: true,
          hips: true,
          notes: true,
          coachComment: true,
          loggedAt: true,
        },
      },
      checkIns: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          weekStart: true,
          workoutsCompleted: true,
          energyLevel: true,
          sleepQuality: true,
          currentWeight: true,
          submittedAt: true,
        },
      },
    },
  });
}

/* -----------------------------
   LANDING CONTENT (FIXED)
------------------------------*/

export async function getLandingContent() {
  return prisma.landingContent.findMany({
    orderBy: { order: "asc" },
  });
}

export async function updateLandingContent(
  section: string,
  data: {
    title?: string;
    subtitle?: string;
    content?: Prisma.InputJsonValue;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.landingContent.upsert({
    where: { section },
    update: data,
    create: { section, ...data },
  });
}

/* -----------------------------
   SITE SETTINGS
------------------------------*/

export async function getSiteSettings() {
  return prisma.siteSettings.findFirst();
}

export async function updateSiteSettings(data: {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
  faviconUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  heroTagline?: string;
  heroSubtext?: string;
}) {
  const existing = await prisma.siteSettings.findFirst();

  if (existing) {
    return prisma.siteSettings.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.siteSettings.create({
    data: {
      ...data,
      siteName: data.siteName ?? "NOMICA",
    },
  });
}
