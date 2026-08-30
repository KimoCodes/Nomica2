import { describe, it, expect } from "vitest";
import {
  logMeal,
  calculateDailyTotals,
  assessNutritionStatus,
  suggestPortion,
} from "@/server/services/fitness-engine/meal-logging";
import type { NutritionTarget } from "@/server/services/fitness-engine/meal-logging";
import type { MealEntry } from "@/server/services/fitness-engine/nutrition-data";
import { getFoodById } from "@/server/services/fitness-engine/nutrition-data";

function makeMeal(foodId: string, grams: number): MealEntry {
  const food = getFoodById(foodId)!;
  const factor = grams / 100;
  return {
    foodId,
    foodName: food.name,
    portionGrams: grams,
    calories: Math.round(food.per100g.calories * factor),
    protein: Math.round(food.per100g.protein * factor * 10) / 10,
    carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
    fat: Math.round(food.per100g.fat * factor * 10) / 10,
  };
}

describe("logMeal", () => {
  it("logs a valid meal", () => {
    const result = logMeal("chicken_breast", 170);
    expect(result).not.toBeNull();
    expect(result!.foodName).toBe("Chicken Breast");
    expect(result!.portionGrams).toBe(170);
    expect(result!.calories).toBeGreaterThan(0);
  });

  it("returns null for invalid food", () => {
    const result = logMeal("nonexistent", 100);
    expect(result).toBeNull();
  });

  it("calculates correct macros for eggs", () => {
    const result = logMeal("egg", 100);
    expect(result).not.toBeNull();
    expect(result!.calories).toBe(155);
    expect(result!.protein).toBe(12.6);
  });
});

describe("calculateDailyTotals", () => {
  it("returns zeros for empty meals", () => {
    const result = calculateDailyTotals([]);
    expect(result).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it("sums macros correctly", () => {
    const meals = [makeMeal("chicken_breast", 170), makeMeal("egg", 100)];
    const result = calculateDailyTotals(meals);
    expect(result.calories).toBeGreaterThan(0);
    expect(result.protein).toBeGreaterThan(0);
  });
});

describe("assessNutritionStatus", () => {
  it("shows full remaining when no meals logged", () => {
    const targets: NutritionTarget = { calories: 2000, protein: 100, carbs: 250, fat: 65 };
    const result = assessNutritionStatus([], targets);
    expect(result.remaining.calories).toBe(2000);
    expect(result.remaining.protein).toBe(100);
  });

  it("reduces remaining as meals are logged", () => {
    const targets: NutritionTarget = { calories: 2000, protein: 100, carbs: 250, fat: 65 };
    const meals = [makeMeal("chicken_breast", 170)];
    const result = assessNutritionStatus(meals, targets);
    expect(result.remaining.calories).toBeLessThan(2000);
    expect(result.actual.calories).toBeGreaterThan(0);
  });

  it("caps remaining at zero", () => {
    const targets: NutritionTarget = { calories: 100, protein: 5, carbs: 10, fat: 3 };
    const meals = [makeMeal("beef_lean", 200)];
    const result = assessNutritionStatus(meals, targets);
    expect(result.remaining.calories).toBe(0);
    expect(result.remaining.protein).toBe(0);
  });

  it("calculates adherence ratios", () => {
    const targets: NutritionTarget = { calories: 2000, protein: 100, carbs: 250, fat: 65 };
    const result = assessNutritionStatus([], targets);
    expect(result.adherence.calories).toBe(0);
  });
});

describe("suggestPortion", () => {
  it("suggests portion for target calories", () => {
    const food = getFoodById("chicken_breast")!;
    const result = suggestPortion(food, 300);
    expect(result).not.toBeNull();
    expect(result!.grams).toBeGreaterThan(0);
  });

  it("returns a suggestion for olive oil", () => {
    const food = getFoodById("olive_oil")!;
    const result = suggestPortion(food, 100);
    expect(result).not.toBeNull();
  });
});
