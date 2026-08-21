"use server";

import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/server/utils/response";
import { sendWelcomeEmail } from "@/server/services/email.service";
import {
  completeCoachOnboarding,
  getClientOnboardingState,
  saveClientOnboardingStep,
} from "@/server/services/onboarding.service";
import {
  coachOnboardingSchema,
  getSchemaForStep,
  type OnboardingStep,
  onboardingStepSchema,
} from "@/server/validators/onboarding.schema";
import type { ApiResponse } from "@/types";

function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "specialties") {
      const existing = data.specialties as string[] | undefined;
      data.specialties = existing ? [...existing, String(value)] : [String(value)];
      continue;
    }
    data[key] = value;
  }
  return data;
}

export async function getClientOnboardingProgress(): Promise<
  ApiResponse<{
    currentStep: OnboardingStep;
    isComplete: boolean;
    profile: {
      age: number | null;
      gender: string | null;
      height: number | null;
      weight: number | null;
      fitnessGoal: string | null;
      activityLevel: string | null;
      equipment: string | null;
    } | null;
  }>
> {
  try {
    const session = await requireRole([Role.CLIENT]);
    const state = await getClientOnboardingState(session.user.id);

    return createSuccessResponse({
      currentStep: state.currentStep,
      isComplete: state.isComplete,
      profile: state.profile
        ? {
            age: state.profile.age,
            gender: state.profile.gender,
            height: state.profile.height,
            weight: state.profile.weight,
            fitnessGoal: state.profile.fitnessGoal,
            activityLevel: state.profile.activityLevel,
            equipment: state.profile.equipment,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return createErrorResponse("You must be signed in", "UNAUTHORIZED");
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return createErrorResponse("Access denied", "FORBIDDEN");
    }
    console.error("getClientOnboardingProgress error:", error);
    return createErrorResponse("Failed to load onboarding progress", "INTERNAL_ERROR");
  }
}

export async function saveClientOnboardingStepAction(
  step: OnboardingStep,
  formData: FormData,
): Promise<ApiResponse<{ nextStep: OnboardingStep | null; redirectTo?: string }>> {
  try {
    const session = await requireRole([Role.CLIENT]);
    const stepParsed = onboardingStepSchema.safeParse(step);

    if (!stepParsed.success) {
      return createErrorResponse("Invalid step", "VALIDATION_ERROR");
    }

    const schema = getSchemaForStep(stepParsed.data);
    const parsed = schema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    await saveClientOnboardingStep(session.user.id, stepParsed.data, parsed.data);

    if (stepParsed.data === 4) {
      await sendWelcomeEmail(session.user.email, session.user.name ?? "there", "client");

      return createSuccessResponse({
        nextStep: null,
        redirectTo: "/client",
      });
    }

    return createSuccessResponse({
      nextStep: (stepParsed.data + 1) as OnboardingStep,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ONBOARDING_ALREADY_COMPLETE") {
      return createSuccessResponse({ nextStep: null, redirectTo: "/client" });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return createErrorResponse("You must be signed in", "UNAUTHORIZED");
    }
    console.error("saveClientOnboardingStepAction error:", error);
    return createErrorResponse("Failed to save onboarding step", "INTERNAL_ERROR");
  }
}

export async function submitCoachOnboarding(
  formData: FormData,
): Promise<ApiResponse<{ redirectTo: string }>> {
  try {
    const session = await requireRole([Role.COACH]);
    const raw = parseFormData(formData);

    const parsed = coachOnboardingSchema.safeParse(raw);

    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR",
      );
    }

    const profile = await completeCoachOnboarding(session.user.id, parsed.data);

    await sendWelcomeEmail(profile.user.email, profile.user.name, "coach");

    return createSuccessResponse({ redirectTo: "/coach" });
  } catch (error) {
    if (error instanceof Error && error.message === "ONBOARDING_ALREADY_COMPLETE") {
      return createSuccessResponse({ redirectTo: "/coach" });
    }
    if (error instanceof Error && error.message === "PROFILE_NOT_FOUND") {
      return createErrorResponse(
        "Your coach profile could not be found. Please sign in again.",
        "PROFILE_NOT_FOUND",
      );
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return createErrorResponse("You must be signed in", "UNAUTHORIZED");
    }
    console.error("submitCoachOnboarding error:", error);
    return createErrorResponse("Failed to complete onboarding", "INTERNAL_ERROR");
  }
}
