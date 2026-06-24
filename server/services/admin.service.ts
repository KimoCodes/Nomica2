import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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

export async function getAdminCoaches() {
  return prisma.coachProfile.findMany({
    orderBy: { createdAt: "desc" },
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

export async function getAdminSubscriptions() {
  return prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { amount: true, createdAt: true },
      },
    },
  });
}

export async function approveCoach(coachProfileId: string) {
  return prisma.coachProfile.update({
    where: { id: coachProfileId },
    data: { approved: true },
  });
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
    difficulty?: Difficulty | null; // ✅ FIXED
    duration?: number | null;
  }
) {
  return prisma.program.update({
    where: { id },
    data: {
      ...data,
      // safety: ensures no accidental string slips in
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
   LANDING CONTENT
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
    content?: unknown;
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
