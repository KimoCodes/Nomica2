import { prisma } from "@/lib/prisma";

export async function getCoachProfileByUserId(userId: string) {
  return prisma.coachProfile.findUnique({
    where: { userId },
  });
}

export async function requireCoachProfile(userId: string) {
  const profile = await getCoachProfileByUserId(userId);

  if (!profile) {
    throw new Error("COACH_PROFILE_NOT_FOUND");
  }

  return profile;
}

export async function getClientProfileByUserId(userId: string) {
  return prisma.clientProfile.findUnique({
    where: { userId },
  });
}

export async function requireClientProfile(userId: string) {
  const profile = await getClientProfileByUserId(userId);

  if (!profile) {
    throw new Error("CLIENT_PROFILE_NOT_FOUND");
  }

  return profile;
}
