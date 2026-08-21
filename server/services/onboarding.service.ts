import type { ClientProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  ClientEquipmentInput,
  ClientExperienceInput,
  ClientGoalInput,
  ClientPersonalInput,
  CoachOnboardingInput,
  OnboardingStep,
} from "@/server/validators/onboarding.schema";

export async function getClientProfile(userId: string) {
  return prisma.clientProfile.findUnique({
    where: { userId },
  });
}

export async function getCoachProfile(userId: string) {
  return prisma.coachProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });
}

export function getClientOnboardingStep(profile: ClientProfile | null): OnboardingStep {
  if (!profile) return 1;
  if (!profile.age || !profile.gender || !profile.height || !profile.weight) return 1;
  if (!profile.fitnessGoal) return 2;
  if (!profile.activityLevel) return 3;
  return 4;
}

export async function getClientOnboardingState(userId: string) {
  const profile = await getClientProfile(userId);

  return {
    profile,
    currentStep: getClientOnboardingStep(profile),
    isComplete: profile?.onboardingComplete ?? false,
  };
}

export async function saveClientOnboardingStep(
  userId: string,
  step: OnboardingStep,
  data:
    | ClientPersonalInput
    | ClientGoalInput
    | ClientExperienceInput
    | ClientEquipmentInput,
) {
  const profile = await getClientProfile(userId);

  if (!profile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  if (profile.onboardingComplete) {
    throw new Error("ONBOARDING_ALREADY_COMPLETE");
  }

  switch (step) {
    case 1:
      return prisma.clientProfile.update({
        where: { userId },
        data: data as ClientPersonalInput,
      });
    case 2:
      return prisma.clientProfile.update({
        where: { userId },
        data: data as ClientGoalInput,
      });
    case 3:
      return prisma.clientProfile.update({
        where: { userId },
        data: data as ClientExperienceInput,
      });
    case 4:
      return prisma.clientProfile.update({
        where: { userId },
        data: {
          ...(data as ClientEquipmentInput),
          onboardingComplete: true,
        },
      });
  }
}

export async function completeCoachOnboarding(
  userId: string,
  data: CoachOnboardingInput,
) {
  const profile = await getCoachProfile(userId);

  if (!profile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  if (profile.onboardingComplete) {
    throw new Error("ONBOARDING_ALREADY_COMPLETE");
  }

  return prisma.coachProfile.update({
    where: { userId },
    data: {
      bio: data.bio.trim(),
      specialties: data.specialties.filter(Boolean),
      yearsExperience: data.yearsExperience,
      certification: data.certification?.trim() || null,
      onboardingComplete: true,
    },
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function getPostLoginRedirect(userId: string, role: string) {
  if (role === "ADMIN") return "/admin";

  if (role === "COACH") {
    const profile = await getCoachProfile(userId);
    return profile?.onboardingComplete ? "/coach" : "/coach/onboarding";
  }

  if (role === "CLIENT") {
    const profile = await getClientProfile(userId);
    return profile?.onboardingComplete ? "/client" : "/onboarding";
  }

  return "/client";
}
