import { describe, it, expect } from "vitest";
import {
  getAllFoods,
  getFoodsByRegion,
  getFoodsByCategory,
  searchFoods,
  getFoodById,
} from "@/server/services/fitness-engine/nutrition-data";

describe("nutrition-data", () => {
  it("returns all foods", () => {
    const foods = getAllFoods();
    expect(foods.length).toBeGreaterThan(0);
  });

  it("each food has required fields", () => {
    const foods = getAllFoods();
    for (const food of foods) {
      expect(food.id).toBeTruthy();
      expect(food.name).toBeTruthy();
      expect(food.per100g).toHaveProperty("calories");
      expect(food.per100g).toHaveProperty("protein");
      expect(food.per100g).toHaveProperty("carbs");
      expect(food.per100g).toHaveProperty("fat");
      expect(food.commonPortions.length).toBeGreaterThan(0);
    }
  });

  it("filters by region", () => {
    const usa = getFoodsByRegion("usa");
    expect(usa.length).toBeGreaterThan(0);
    for (const food of usa) {
      expect(food.region).toBe("usa");
    }
  });

  it("filters by category", () => {
    const proteins = getFoodsByCategory("protein");
    expect(proteins.length).toBeGreaterThan(0);
    for (const food of proteins) {
      expect(food.category).toBe("protein");
    }
  });

  it("searches foods by name", () => {
    const results = searchFoods("chicken");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((f) => f.name.toLowerCase().includes("chicken"))).toBe(true);
  });

  it("searches foods by tag", () => {
    const results = searchFoods("protein");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for no match", () => {
    const results = searchFoods("xyznonexistent");
    expect(results).toEqual([]);
  });

  it("gets food by id", () => {
    const food = getFoodById("chicken_breast");
    expect(food).toBeDefined();
    expect(food!.name).toBe("Chicken Breast");
  });

  it("returns undefined for unknown id", () => {
    const food = getFoodById("nonexistent");
    expect(food).toBeUndefined();
  });
});
