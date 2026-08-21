import type { Difficulty, MuscleGroup } from "@prisma/client";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: "Chest",
  BACK: "Back",
  LEGS: "Legs",
  GLUTES: "Glutes",
  SHOULDERS: "Shoulders",
  ARMS: "Arms",
  CORE: "Core",
  MOBILITY: "Mobility",
  CARDIO: "Cardio",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const MUSCLE_GROUP_OPTIONS = Object.entries(MUSCLE_GROUP_LABELS).map(
  ([value, label]) => ({ value: value as MuscleGroup, label }),
);

export const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABELS).map(
  ([value, label]) => ({ value: value as Difficulty, label }),
);
