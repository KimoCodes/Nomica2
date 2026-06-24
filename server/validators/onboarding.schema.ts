import {
  ActivityLevel,
  Equipment,
  FitnessGoal,
  Gender,
  Role,
} from "@prisma/client";
import { z } from "zod";

export const clientPersonalSchema = z.object({
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(13, "You must be at least 13 years old")
    .max(120, "Please enter a valid age"),
  gender: z.nativeEnum(Gender, { message: "Please select a gender" }),
  height: z.coerce
    .number()
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be at most 250 cm"),
  weight: z.coerce
    .number()
    .min(30, "Weight must be at least 30 kg")
    .max(300, "Weight must be at most 300 kg"),
});

export const clientGoalSchema = z.object({
  fitnessGoal: z.nativeEnum(FitnessGoal, { message: "Please select a goal" }),
});

export const clientExperienceSchema = z.object({
  activityLevel: z.nativeEnum(ActivityLevel, {
    message: "Please select your experience level",
  }),
});

export const clientEquipmentSchema = z.object({
  equipment: z.nativeEnum(Equipment, {
    message: "Please select your equipment access",
  }),
});

export const coachOnboardingSchema = z.object({
  bio: z
    .string()
    .min(20, "Bio must be at least 20 characters")
    .max(1000, "Bio must be at most 1000 characters")
    .trim(),
  specialties: z
    .array(z.string().min(1))
    .min(1, "Select at least one specialty")
    .max(8, "Select at most 8 specialties"),
  yearsExperience: z.coerce
    .number()
    .int("Years must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(50, "Please enter a valid number of years"),
  certification: z
    .string()
    .max(200, "Certification must be at most 200 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ClientPersonalInput = z.infer<typeof clientPersonalSchema>;
export type ClientGoalInput = z.infer<typeof clientGoalSchema>;
export type ClientExperienceInput = z.infer<typeof clientExperienceSchema>;
export type ClientEquipmentInput = z.infer<typeof clientEquipmentSchema>;
export type CoachOnboardingInput = z.infer<typeof coachOnboardingSchema>;

export const onboardingStepSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export type OnboardingStep = z.infer<typeof onboardingStepSchema>;

export function getSchemaForStep(step: OnboardingStep) {
  switch (step) {
    case 1:
      return clientPersonalSchema;
    case 2:
      return clientGoalSchema;
    case 3:
      return clientExperienceSchema;
    case 4:
      return clientEquipmentSchema;
  }
}

export function getPostAuthRedirect(
  role: Role,
  clientOnboardingComplete?: boolean,
  coachOnboardingComplete?: boolean,
): string {
  if (role === Role.ADMIN) return "/admin";
  if (role === Role.COACH) {
    return coachOnboardingComplete ? "/coach" : "/coach/onboarding";
  }
  return clientOnboardingComplete ? "/client" : "/onboarding";
}
