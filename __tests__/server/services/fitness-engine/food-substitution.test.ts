import { describe, it, expect } from "vitest";
import {
  findFoodSubstitutes,
  calculatePortionSwap,
} from "@/server/services/fitness-engine/food-substitution";
import { getFoodById } from "@/server/services/fitness-engine/nutrition-data";

describe("findFoodSubstitutes", () => {
  it("returns substitutes for a valid food", () => {
    const result = findFoodSubstitutes("chicken_breast");
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("returns empty for unknown food", () => {
    const result = findFoodSubstitutes("nonexistent");
    expect(result).toEqual([]);
  });

  it("does not include the original food", () => {
    const result = findFoodSubstitutes("chicken_breast");
    for (const sub of result) {
      expect(sub.substituteId).not.toBe("chicken_breast");
    }
  });

  it("respects limit parameter", () => {
    const result = findFoodSubstitutes("chicken_breast", undefined, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("filters by available foods", () => {
    const result = findFoodSubstitutes("chicken_breast", ["lentils", "egg"]);
    expect(result.length).toBeLessThanOrEqual(2);
    for (const sub of result) {
      expect(["lentils", "egg"]).toContain(sub.substituteId);
    }
  });

  it("substitutes have nutritional similarity", () => {
    const result = findFoodSubstitutes("chicken_breast");
    for (const sub of result) {
      expect(sub.nutritionalSimilarity).toBeGreaterThan(30);
      expect(sub.nutritionalSimilarity).toBeLessThanOrEqual(100);
    }
  });

  it("substitutes have reason", () => {
    const result = findFoodSubstitutes("beef_lean");
    for (const sub of result) {
      expect(sub.reason).toBeTruthy();
    }
  });

  it("finds protein substitutes for beef", () => {
    const result = findFoodSubstitutes("beef_lean");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("calculatePortionSwap", () => {
  it("calculates calorie-equivalent portion", () => {
    const chicken = getFoodById("chicken_breast")!;
    const beef = getFoodById("beef_lean")!;
    const result = calculatePortionSwap(chicken, beef, 170);
    expect(result.substituteGrams).toBeGreaterThan(0);
    expect(result.note).toBeTruthy();
  });

  it("handles low-calorie substitute", () => {
    const chicken = getFoodById("chicken_breast")!;
    const broccoli = getFoodById("broccoli")!;
    const result = calculatePortionSwap(chicken, broccoli, 170);
    expect(result.substituteGrams).toBeGreaterThan(0);
    expect(result.note).toBeTruthy();
  });
});
