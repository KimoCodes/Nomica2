import { prisma } from "@/lib/prisma";
import { Prisma, Difficulty, ProductKind, ProductStatus, WebsiteAccessMode } from "@prisma/client";
import { isIP } from "node:net";
import { notifyCoachApproved } from "@/server/services/notification.service";

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
    await notifyCoachApproved(profile.user.id);
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
  const program = await prisma.program.update({
    where: { id },
    data: {
      ...data,
      difficulty: data.difficulty ?? undefined,
    },
  });

  if (data.isSellable === true) {
    const slug = program.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingProduct = await prisma.product.findUnique({
      where: { programId: id },
    });

    const durationLabel = program.duration
      ? `${program.duration} week${program.duration > 1 ? "s" : ""}`
      : "Custom";

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: program.title,
          tagline: program.description,
          description: program.description,
          priceCents: program.price ?? 0,
          imageUrl: program.imageUrl,
          features: program.features,
          durationLabel,
          durationWeeks: program.duration,
          status: ProductStatus.PUBLISHED,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          slug,
          kind: ProductKind.PROGRAM,
          name: program.title,
          tagline: program.description,
          description: program.description,
          priceCents: program.price ?? 0,
          imageUrl: program.imageUrl,
          features: program.features,
          durationLabel,
          durationWeeks: program.duration,
          programId: id,
          status: ProductStatus.PUBLISHED,
        },
      });
    }
  }

  return program;
}

export async function deleteProgram(id: string) {
  // T4 orphan guard: a published Product must never lose its content source.
  const publishedProduct = await prisma.product.findFirst({
    where: { programId: id, status: ProductStatus.PUBLISHED },
    select: { slug: true },
  });

  if (publishedProduct) {
    throw new Error("PROGRAM_HAS_LINKED_PRODUCT");
  }

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

/**
 * Video-guided workouts are an optional convenience, never a requirement.
 * When the admin toggle is off, all video affordances are hidden from
 * clients; workout completion never depends on videos either way.
 */
export async function isVideoGuidedWorkoutsEnabled() {
  const settings = await prisma.siteSettings.findFirst({
    select: { videoGuidedWorkouts: true },
  });
  return settings?.videoGuidedWorkouts ?? true;
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
  videoGuidedWorkouts?: boolean;
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
      siteName: data.siteName ?? "NomiTips",
    },
  });
}

export type WebsiteAccessModeValue = "NORMAL" | "COMING_SOON" | "MAINTENANCE";

/**
 * Read-only copy for the public coming-soon / maintenance pages.
 * Never creates a row and never throws, so a database problem degrades the
 * page to its built-in fallback text instead of a 500. Results are cached
 * briefly so these high-traffic pages do not add a query per view.
 */
const PUBLIC_COPY_TTL_MS = 30_000;
let publicCopyCache: { value: PublicAccessCopy | null; expiresAt: number } | null = null;

export type PublicAccessCopy = {
  comingSoonHeadline: string | null;
  comingSoonMessage: string | null;
  maintenanceHeadline: string | null;
  maintenanceMessage: string | null;
  maintenanceReturnAt: Date | null;
};

export function invalidatePublicAccessCopy() {
  publicCopyCache = null;
}

export async function getPublicAccessCopy(): Promise<PublicAccessCopy | null> {
  if (publicCopyCache && Date.now() < publicCopyCache.expiresAt) {
    return publicCopyCache.value;
  }

  try {
    const value = await prisma.siteSettings.findFirst({
      select: {
        comingSoonHeadline: true,
        comingSoonMessage: true,
        maintenanceHeadline: true,
        maintenanceMessage: true,
        maintenanceReturnAt: true,
      },
    });
    publicCopyCache = { value, expiresAt: Date.now() + PUBLIC_COPY_TTL_MS };
    return value;
  } catch {
    publicCopyCache = { value: null, expiresAt: Date.now() + 5_000 };
    return null;
  }
}

export function parseWebsiteAccessMode(value?: string | null): WebsiteAccessModeValue {
  switch (value?.toUpperCase()) {
    case "COMING_SOON":
      return "COMING_SOON";
    case "MAINTENANCE":
      return "MAINTENANCE";
    case "NORMAL":
    default:
      return "NORMAL";
  }
}

export async function getWebsiteAccessSettings() {
  const siteSettings = await prisma.siteSettings.findFirst({
    include: {
      approvedIpAddresses: {
        orderBy: { createdAt: "desc" },
      },
      accessAuditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (siteSettings) {
    return siteSettings;
  }

  return prisma.siteSettings.create({
    data: {
      siteName: "NOMICA",
      websiteAccessMode: WebsiteAccessMode.NORMAL,
      publicAccessRestrictionEnabled: false,
      comingSoonHeadline: "NomiTips is launching soon",
      comingSoonMessage: "We’re building a premium experience to help you transform with confidence.",
      comingSoonTimezone: "UTC",
      maintenanceHeadline: "We’re making updates",
      maintenanceMessage: "NomiTips is temporarily unavailable while we improve the experience.",
      maintenanceTimezone: "UTC",
    },
    include: {
      approvedIpAddresses: true,
      accessAuditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function upsertWebsiteAccessSettings(data: {
  websiteAccessMode?: WebsiteAccessModeValue;
  publicAccessRestrictionEnabled?: boolean;
  comingSoonHeadline?: string | null;
  comingSoonMessage?: string | null;
  comingSoonLaunchAt?: Date | string | null;
  comingSoonTimezone?: string | null;
  comingSoonAutoSwitch?: boolean;
  maintenanceHeadline?: string | null;
  maintenanceMessage?: string | null;
  maintenanceReturnAt?: Date | string | null;
  maintenanceTimezone?: string | null;
  lastAccessConfigUpdatedById?: string | null;
}) {
  const existing = await prisma.siteSettings.findFirst();

  const toDate = (value: Date | string | null | undefined) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Date(value);
  };

  const nextData = {
    websiteAccessMode: data.websiteAccessMode ? WebsiteAccessMode[data.websiteAccessMode] : undefined,
    publicAccessRestrictionEnabled: data.publicAccessRestrictionEnabled,
    comingSoonHeadline: data.comingSoonHeadline,
    comingSoonMessage: data.comingSoonMessage,
    comingSoonLaunchAt: toDate(data.comingSoonLaunchAt),
    comingSoonTimezone: data.comingSoonTimezone,
    comingSoonAutoSwitch: data.comingSoonAutoSwitch,
    maintenanceHeadline: data.maintenanceHeadline,
    maintenanceMessage: data.maintenanceMessage,
    maintenanceReturnAt: toDate(data.maintenanceReturnAt),
    maintenanceTimezone: data.maintenanceTimezone,
    lastAccessConfigUpdatedAt: new Date(),
    lastAccessConfigUpdatedById: data.lastAccessConfigUpdatedById ?? null,
  };

  // Only `undefined` means "leave unchanged" — an explicit `null` must reach
  // Prisma so nullable fields (dates, copy) can actually be cleared.
  const cleaned = Object.fromEntries(
    Object.entries(nextData).filter(([, value]) => value !== undefined),
  ) as Record<string, unknown>;

  if (existing) {
    return prisma.siteSettings.update({
      where: { id: existing.id },
      data: cleaned,
      include: {
        approvedIpAddresses: true,
        accessAuditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  }

  return prisma.siteSettings.create({
    data: {
      siteName: "NOMICA",
      websiteAccessMode: WebsiteAccessMode.NORMAL,
      publicAccessRestrictionEnabled: false,
      comingSoonHeadline: "NomiTips is launching soon",
      comingSoonMessage: "We’re building a premium experience to help you transform with confidence.",
      comingSoonTimezone: "UTC",
      maintenanceHeadline: "We’re making updates",
      maintenanceMessage: "NomiTips is temporarily unavailable while we improve the experience.",
      maintenanceTimezone: "UTC",
      ...cleaned,
    },
    include: {
      approvedIpAddresses: true,
      accessAuditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export function isValidIpOrCidr(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.includes("/")) {
    const [network, prefix] = trimmed.split("/");
    if (!network || !prefix) return false;
    if (isIP(network) === 0) return false;
    const cidr = Number(prefix);
    if (!Number.isInteger(cidr)) return false;
    return cidr >= 0 && cidr <= (isIP(network) === 4 ? 32 : 128);
  }

  return isIP(trimmed) !== 0;
}

export async function addApprovedIpAddress(siteSettingsId: string, input: {
  value: string;
  label?: string | null;
  createdById: string;
}) {
  const trimmed = input.value.trim();
  if (!isValidIpOrCidr(trimmed)) {
    throw new Error("Invalid IP address or CIDR range");
  }

  return prisma.approvedIpAddress.create({
    data: {
      siteSettingsId,
      value: trimmed,
      label: input.label?.trim() || null,
      createdById: input.createdById,
    },
  });
}

export async function removeApprovedIpAddress(siteSettingsId: string, id: string) {
  return prisma.approvedIpAddress.deleteMany({
    where: {
      id,
      siteSettingsId,
    },
  });
}

export async function logAccessAudit(siteSettingsId: string, action: string, details: string, performedById?: string | null) {
  return prisma.siteAccessAuditLog.create({
    data: {
      siteSettingsId,
      action,
      details,
      performedById: performedById ?? null,
    },
  });
}
