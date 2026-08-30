import type { FoodItem } from "./nutrition-data";
import { getAllFoods } from "./nutrition-data";

export type FoodSubstitution = {
  originalFood: string;
  substituteFood: string;
  substituteId: string;
  reason: string;
  nutritionalSimilarity: number;
};

function calculateSimilarity(a: FoodItem, b: FoodItem): number {
  if (a.per100g.calories === 0 && b.per100g.calories === 0) return 1;

  const maxCal = Math.max(a.per100g.calories, b.per100g.calories, 1);
  const maxProtein = Math.max(a.per100g.protein, b.per100g.protein, 0.1);
  const maxCarbs = Math.max(a.per100g.carbs, b.per100g.carbs, 0.1);
  const maxFat = Math.max(a.per100g.fat, b.per100g.fat, 0.1);

  const calScore = 1 - Math.abs(a.per100g.calories - b.per100g.calories) / maxCal;
  const protScore = 1 - Math.abs(a.per100g.protein - b.per100g.protein) / maxProtein;
  const carbScore = 1 - Math.abs(a.per100g.carbs - b.per100g.carbs) / maxCarbs;
  const fatScore = 1 - Math.abs(a.per100g.fat - b.per100g.fat) / maxFat;

  return calScore * 0.3 + protScore * 0.35 + carbScore * 0.2 + fatScore * 0.15;
}

function buildReason(
  original: FoodItem,
  substitute: FoodItem,
  similarity: number,
): string {
  const reasons: string[] = [];

  if (original.category === substitute.category) {
    reasons.push(`same category (${original.category})`);
  }

  if (Math.abs(original.per100g.protein - substitute.per100g.protein) < 3) {
    reasons.push("similar protein content");
  }

  if (Math.abs(original.per100g.calories - substitute.per100g.calories) < 30) {
    reasons.push("similar calorie count");
  }

  if (substitute.region === "usa") {
    reasons.push("locally available");
  }

  if (reasons.length === 0) {
    return `Best nutritional match available (${Math.round(similarity * 100)}% similar)`;
  }

  return reasons.join(", ");
}

export function findFoodSubstitutes(
  originalFoodId: string,
  availableFoodIds?: string[],
  limit: number = 3,
): FoodSubstitution[] {
  const allFoods = getAllFoods();
  const original = allFoods.find((f) => f.id === originalFoodId);
  if (!original) return [];

  const candidates = availableFoodIds
    ? allFoods.filter((f) => f.id !== originalFoodId && availableFoodIds.includes(f.id))
    : allFoods.filter((f) => f.id !== originalFoodId);

  const scored = candidates
    .map((candidate) => ({
      candidate,
      similarity: calculateSimilarity(original, candidate),
    }))
    .filter((s) => s.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored.map(({ candidate, similarity }) => ({
    originalFood: original.name,
    substituteFood: candidate.name,
    substituteId: candidate.id,
    reason: buildReason(original, candidate, similarity),
    nutritionalSimilarity: Math.round(similarity * 100),
  }));
}

export function calculatePortionSwap(
  originalFood: FoodItem,
  substituteFood: FoodItem,
  originalPortionGrams: number,
): { substituteGrams: number; note: string } {
  const originalCalories =
    (originalFood.per100g.calories * originalPortionGrams) / 100;

  if (substituteFood.per100g.calories === 0) {
    return {
      substituteGrams: originalPortionGrams,
      note: "Substitute has zero calories; portion matched by weight.",
    };
  }

  const substituteGrams = Math.round(
    (originalCalories / substituteFood.per100g.calories) * 100,
  );

  const calorieDiff = Math.abs(originalCalories - (substituteFood.per100g.calories * substituteGrams) / 100);
  const note =
    calorieDiff < 10
      ? "Portions are calorie-equivalent."
      : `Approximate calorie match (${Math.round(originalCalories)} vs ${Math.round((substituteFood.per100g.calories * substituteGrams) / 100)} kcal).`;

  return { substituteGrams, note };
}
