import { z } from "zod/v4";

const exerciseItemSchema = z.object({
  name: z.string().min(1).max(200),
  exerciseId: z.string().optional(),
  muscleGroup: z.enum(["CHEST", "BACK", "LEGS", "GLUTES", "SHOULDERS", "ARMS", "CORE", "MOBILITY", "CARDIO"]).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  order: z.number().int().min(0),
  sets: z.number().int().min(1).max(20).optional(),
  reps: z.number().int().min(1).max(100).optional(),
  durationMinutes: z.number().int().min(1).max(120).optional(),
  restSeconds: z.number().int().min(0).max(300).optional(),
  intensity: z.string().max(50).optional(),
  instructions: z.string().max(2000).optional(),
  notes: z.string().max(500).optional(),
});

const mealItemSchema = z.object({
  name: z.string().min(1).max(200),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"]),
  timeOfDay: z.string().max(20).optional(),
  order: z.number().int().min(0),
  foods: z.record(z.string(), z.unknown()).optional(),
  instructions: z.string().max(2000).optional(),
  notes: z.string().max(500).optional(),
});

export const createExercisePlanSchema = z.object({
  clientProfileId: z.string().min(1),
  coachProfileId: z.string().min(1),
  bookingId: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  goal: z.string().max(500).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  weeklySchedule: z.record(z.string(), z.unknown()).optional(),
  coachNotes: z.string().max(5000).optional(),
  exercises: z.array(exerciseItemSchema).min(1, "At least one exercise is required"),
});

export const updateExercisePlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  goal: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  weeklySchedule: z.record(z.string(), z.unknown()).optional(),
  coachNotes: z.string().max(5000).optional(),
  exercises: z.array(exerciseItemSchema).optional(),
});

export const createNutritionPlanSchema = z.object({
  clientProfileId: z.string().min(1),
  coachProfileId: z.string().min(1),
  bookingId: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  goal: z.string().max(500).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  dailyCalories: z.number().int().min(500).max(10000).optional(),
  dailyProtein: z.number().min(0).max(500).optional(),
  dailyCarbs: z.number().min(0).max(1000).optional(),
  dailyFat: z.number().min(0).max(500).optional(),
  dailyWaterMl: z.number().int().min(500).max(10000).optional(),
  coachNotes: z.string().max(5000).optional(),
  meals: z.array(mealItemSchema).min(1, "At least one meal is required"),
});

export const updateNutritionPlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  goal: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  dailyCalories: z.number().int().min(500).max(10000).optional(),
  dailyProtein: z.number().min(0).max(500).optional(),
  dailyCarbs: z.number().min(0).max(1000).optional(),
  dailyFat: z.number().min(0).max(500).optional(),
  dailyWaterMl: z.number().int().min(500).max(10000).optional(),
  coachNotes: z.string().max(5000).optional(),
  meals: z.array(mealItemSchema).optional(),
});

export const logProgressSchema = z.object({
  exercisePlanId: z.string().optional(),
  nutritionPlanId: z.string().optional(),
  completed: z.boolean().optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  setsCompleted: z.number().int().min(0).optional(),
  repsCompleted: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(0).optional(),
  adherenceScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
});
