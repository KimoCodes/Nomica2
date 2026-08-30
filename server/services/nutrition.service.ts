import { prisma } from "@/lib/prisma";
import { requireClientProfile } from "@/server/services/coach.service";
import {
  getAllFoods,
  getFoodsByRegion,
  searchFoods,
  getFoodById,
} from "@/server/services/fitness-engine/nutrition-data";
import {
  logMeal,
  suggestPortion,
  calculateDailyTotals,
  assessNutritionStatus,
} from "@/server/services/fitness-engine/meal-logging";
import type { NutritionTarget } from "@/server/services/fitness-engine/meal-logging";
import type { MealEntry } from "@/server/services/fitness-engine/nutrition-data";
import { findFoodSubstitutes, calculatePortionSwap } from "@/server/services/fitness-engine/food-substitution";

export type MealLogInput = {
  foodId: string;
  portionGrams: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "OTHER";
  notes?: string;
};

export async function logMealEntry(
  clientUserId: string,
  input: MealLogInput,
) {
  const client = await requireClientProfile(clientUserId);
  const entry = logMeal(input.foodId, input.portionGrams);
  if (!entry) throw new Error("INVALID_FOOD");

  return prisma.mealLog.create({
    data: {
      clientProfileId: client.id,
      mealType: input.mealType,
      notes: input.notes ?? null,
      items: {
        create: {
          foodId: entry.foodId,
          foodName: entry.foodName,
          portionGrams: entry.portionGrams,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
        },
      },
    },
    include: { items: true },
  });
}

export async function getTodayMeals(clientUserId: string) {
  const client = await requireClientProfile(clientUserId);
  const today = startOfDay();

  const meals = await prisma.mealLog.findMany({
    where: {
      clientProfileId: client.id,
      loggedAt: { gte: today },
    },
    include: { items: true },
    orderBy: { loggedAt: "asc" },
  });

  const allEntries: MealEntry[] = meals.flatMap((m) =>
    m.items.map((item) => ({
      foodId: item.foodId,
      foodName: item.foodName,
      portionGrams: item.portionGrams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })),
  );

  return { meals, totals: calculateDailyTotals(allEntries) };
}

export async function getNutritionDashboard(clientUserId: string) {
  const client = await requireClientProfile(clientUserId);
  const today = startOfDay();

  const [proteinHabit, waterHabit, todayMeals] = await Promise.all([
    prisma.habit.findUnique({
      where: { userId_type: { userId: client.userId, type: "PROTEIN" } },
      include: { logs: { where: { date: { gte: today } }, take: 1 } },
    }),
    prisma.habit.findUnique({
      where: { userId_type: { userId: client.userId, type: "WATER" } },
      include: { logs: { where: { date: { gte: today } }, take: 1 } },
    }),
    prisma.mealLog.findMany({
      where: {
        clientProfileId: client.id,
        loggedAt: { gte: today },
      },
      include: { items: true },
    }),
  ]);

  const allEntries: MealEntry[] = todayMeals.flatMap((m) =>
    m.items.map((item) => ({
      foodId: item.foodId,
      foodName: item.foodName,
      portionGrams: item.portionGrams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })),
  );

  const profile = await prisma.clientProfile.findUnique({
    where: { id: client.id },
    select: { fitnessGoal: true },
  });

  const targets = getMacroTargets(profile?.fitnessGoal ?? "general_fitness");
  const status = assessNutritionStatus(allEntries, targets);

  return {
    proteinTarget: proteinHabit?.target ?? 0,
    proteinLogged: proteinHabit?.logs[0]?.value ?? 0,
    waterTarget: waterHabit?.target ?? 0,
    waterLogged: waterHabit?.logs[0]?.value ?? 0,
    nutrition: status,
    mealCount: todayMeals.length,
    localFoods: getFoodsByRegion("usa").length,
    totalFoods: getAllFoods().length,
  };
}

export function searchLocalFoods(query: string) {
  return searchFoods(query);
}

export function getFoodDetails(foodId: string) {
  return getFoodById(foodId) ?? null;
}

export function getSubstitutes(foodId: string) {
  return findFoodSubstitutes(foodId);
}

export function getPortionSuggestion(foodId: string, targetCalories: number) {
  const food = getFoodById(foodId);
  if (!food) return null;
  return suggestPortion(food, targetCalories);
}

export function calculateSwapPortion(
  originalFoodId: string,
  substituteFoodId: string,
  originalPortionGrams: number,
) {
  const original = getFoodById(originalFoodId);
  const substitute = getFoodById(substituteFoodId);
  if (!original || !substitute) return null;
  return calculatePortionSwap(original, substitute, originalPortionGrams);
}

export function getMacroTargets(goal: string): NutritionTarget {
  const targets: Record<string, NutritionTarget> = {
    LOSE_FAT: { calories: 1800, protein: 120, carbs: 180, fat: 60 },
    GAIN_MUSCLE: { calories: 2500, protein: 140, carbs: 300, fat: 70 },
    MAINTAIN: { calories: 2200, protein: 100, carbs: 250, fat: 65 },
    endurance: { calories: 2400, protein: 100, carbs: 320, fat: 60 },
    general_fitness: { calories: 2200, protein: 110, carbs: 260, fat: 65 },
  };
  return targets[goal] ?? targets.general_fitness;
}

function startOfDay() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
