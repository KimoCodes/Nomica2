import type { FoodItem, MealEntry, DailyNutrition } from "./nutrition-data";
import { getFoodById } from "./nutrition-data";

export type NutritionTarget = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NutritionStatus = {
  targets: NutritionTarget;
  actual: { calories: number; protein: number; carbs: number; fat: number };
  remaining: { calories: number; protein: number; carbs: number; fat: number };
  adherence: { calories: number; protein: number; carbs: number; fat: number };
};

function calculateMacros(
  food: FoodItem,
  portionGrams: number,
): { calories: number; protein: number; carbs: number; fat: number } {
  const factor = portionGrams / 100;
  return {
    calories: Math.round(food.per100g.calories * factor),
    protein: Math.round(food.per100g.protein * factor * 10) / 10,
    carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
    fat: Math.round(food.per100g.fat * factor * 10) / 10,
  };
}

export function logMeal(
  foodId: string,
  portionGrams: number,
): MealEntry | null {
  const food = getFoodById(foodId);
  if (!food) return null;

  const macros = calculateMacros(food, portionGrams);

  return {
    foodId: food.id,
    foodName: food.name,
    portionGrams,
    ...macros,
  };
}

export function calculateDailyTotals(
  meals: MealEntry[],
): DailyNutrition["totals"] {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: Math.round((totals.protein + meal.protein) * 10) / 10,
      carbs: Math.round((totals.carbs + meal.carbs) * 10) / 10,
      fat: Math.round((totals.fat + meal.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function assessNutritionStatus(
  meals: MealEntry[],
  targets: NutritionTarget,
): NutritionStatus {
  const actual = calculateDailyTotals(meals);

  const remaining = {
    calories: Math.max(targets.calories - actual.calories, 0),
    protein: Math.max(targets.protein - actual.protein, 0),
    carbs: Math.max(targets.carbs - actual.carbs, 0),
    fat: Math.max(targets.fat - actual.fat, 0),
  };

  const adherence = {
    calories: targets.calories > 0 ? Math.min(actual.calories / targets.calories, 1.5) : 0,
    protein: targets.protein > 0 ? Math.min(actual.protein / targets.protein, 1.5) : 0,
    carbs: targets.carbs > 0 ? Math.min(actual.carbs / targets.carbs, 1.5) : 0,
    fat: targets.fat > 0 ? Math.min(actual.fat / targets.fat, 1.5) : 0,
  };

  return { targets, actual, remaining, adherence };
}

export function suggestPortion(
  food: FoodItem,
  targetCalories: number,
): { grams: number; label: string } | null {
  if (food.per100g.calories === 0) return null;

  const grams = Math.round((targetCalories / food.per100g.calories) * 100);

  if (food.commonPortions.length > 0) {
    const closest = food.commonPortions.reduce((best, p) => {
      const diff = Math.abs(p.grams - grams);
      const bestDiff = Math.abs(best.grams - grams);
      return diff < bestDiff ? p : best;
    });

    if (Math.abs(closest.grams - grams) < grams * 0.3) {
      return { grams: closest.grams, label: closest.label };
    }
  }

  return { grams, label: `${grams}g` };
}
