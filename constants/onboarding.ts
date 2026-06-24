import type { ActivityLevel, Equipment, FitnessGoal, Gender } from "@prisma/client";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export const FITNESS_GOAL_OPTIONS: { value: FitnessGoal; label: string; description: string }[] = [
  { value: "LOSE_FAT", label: "Lose fat", description: "Reduce body fat and improve definition" },
  { value: "GAIN_MUSCLE", label: "Gain muscle", description: "Build lean mass and strength" },
  { value: "GENERAL_FITNESS", label: "General fitness", description: "Stay active and healthy" },
  { value: "STRENGTH", label: "Strength", description: "Maximize power and performance" },
];

export const ACTIVITY_LEVEL_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "BEGINNER", label: "Beginner", description: "New to structured training" },
  { value: "INTERMEDIATE", label: "Intermediate", description: "6+ months of consistent training" },
  { value: "ADVANCED", label: "Advanced", description: "2+ years of structured programming" },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; description: string }[] = [
  { value: "NONE", label: "No equipment", description: "Bodyweight only" },
  { value: "DUMBBELLS", label: "Dumbbells", description: "Basic home setup" },
  { value: "HOME_GYM", label: "Home gym", description: "Rack, barbell, and accessories" },
  { value: "COMMERCIAL_GYM", label: "Commercial gym", description: "Full gym access" },
];

export const COACH_SPECIALTY_OPTIONS = [
  "Weight loss",
  "Muscle building",
  "Strength training",
  "Endurance",
  "Mobility",
  "Nutrition",
  "Sports performance",
  "Rehabilitation",
] as const;

export const CLIENT_ONBOARDING_STEPS = [
  { step: 1, title: "Personal info", description: "Tell us about yourself" },
  { step: 2, title: "Your goal", description: "What do you want to achieve?" },
  { step: 3, title: "Experience", description: "How experienced are you?" },
  { step: 4, title: "Equipment", description: "What do you have access to?" },
] as const;

export const TOTAL_CLIENT_STEPS = CLIENT_ONBOARDING_STEPS.length;
