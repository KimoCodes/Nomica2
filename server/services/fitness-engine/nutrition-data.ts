export type FoodItem = {
  id: string;
  name: string;
  category: "protein" | "carb" | "vegetable" | "fruit" | "dairy" | "fat" | "legume" | "grain";
  region: "usa" | "global";
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  commonPortions: { label: string; grams: number }[];
  tags: string[];
};

export type MealEntry = {
  foodId: string;
  foodName: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyNutrition = {
  date: string;
  meals: MealEntry[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
};

const FOODS: FoodItem[] = [
  {
    id: "chicken_breast",
    name: "Chicken Breast",
    category: "protein",
    region: "usa",
    per100g: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0 },
    commonPortions: [
      { label: "1 breast", grams: 170 },
      { label: "1 serving", grams: 120 },
    ],
    tags: ["lean protein", "versatile"],
  },
  {
    id: "chicken_thigh",
    name: "Chicken Thigh",
    category: "protein",
    region: "usa",
    per100g: { calories: 209, protein: 26.0, carbs: 0, fat: 10.9, fiber: 0 },
    commonPortions: [
      { label: "1 thigh", grams: 100 },
      { label: "1 serving", grams: 120 },
    ],
    tags: ["protein", "flavor"],
  },
  {
    id: "beef_lean",
    name: "Beef (Lean Ground)",
    category: "protein",
    region: "usa",
    per100g: { calories: 250, protein: 26.1, carbs: 0, fat: 15.0, fiber: 0 },
    commonPortions: [
      { label: "1 patty", grams: 113 },
      { label: "1 serving", grams: 120 },
    ],
    tags: ["protein", "iron", "B12"],
  },
  {
    id: "salmon",
    name: "Salmon",
    category: "protein",
    region: "usa",
    per100g: { calories: 208, protein: 20.4, carbs: 0, fat: 13.4, fiber: 0 },
    commonPortions: [
      { label: "1 fillet", grams: 170 },
      { label: "1 serving", grams: 120 },
    ],
    tags: ["omega-3", "protein", "healthy fat"],
  },
  {
    id: "egg",
    name: "Egg",
    category: "protein",
    region: "usa",
    per100g: { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0 },
    commonPortions: [
      { label: "1 large", grams: 50 },
      { label: "2 large", grams: 100 },
    ],
    tags: ["protein", "versatile", "affordable"],
  },
  {
    id: "greek_yogurt",
    name: "Greek Yogurt (Plain)",
    category: "dairy",
    region: "usa",
    per100g: { calories: 59, protein: 10.0, carbs: 3.6, fat: 0.7, fiber: 0 },
    commonPortions: [
      { label: "1 cup", grams: 245 },
      { label: "1 small container", grams: 150 },
    ],
    tags: ["protein", "probiotics", "calcium"],
  },
  {
    id: "milk",
    name: "Milk (Whole)",
    category: "dairy",
    region: "usa",
    per100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
    commonPortions: [
      { label: "1 glass", grams: 250 },
      { label: "1 cup", grams: 240 },
    ],
    tags: ["calcium", "protein", "drink"],
  },
  {
    id: "cottage_cheese",
    name: "Cottage Cheese",
    category: "dairy",
    region: "usa",
    per100g: { calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0 },
    commonPortions: [
      { label: "1 cup", grams: 226 },
      { label: "1/2 cup", grams: 113 },
    ],
    tags: ["protein", "casein", "slow-digesting"],
  },
  {
    id: "brown_rice",
    name: "Brown Rice",
    category: "grain",
    region: "usa",
    per100g: { calories: 112, protein: 2.3, carbs: 23.5, fat: 0.8, fiber: 1.8 },
    commonPortions: [
      { label: "1 cup cooked", grams: 195 },
      { label: "1 bowl", grams: 200 },
    ],
    tags: ["fiber", "complex carb"],
  },
  {
    id: "white_rice",
    name: "White Rice",
    category: "grain",
    region: "usa",
    per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
    commonPortions: [
      { label: "1 cup cooked", grams: 158 },
      { label: "1 bowl", grams: 200 },
    ],
    tags: ["energy", "staple"],
  },
  {
    id: "oatmeal",
    name: "Oatmeal",
    category: "grain",
    region: "usa",
    per100g: { calories: 68, protein: 2.4, carbs: 12.0, fat: 1.4, fiber: 1.7 },
    commonPortions: [
      { label: "1 cup cooked", grams: 234 },
      { label: "1/2 cup dry", grams: 40 },
    ],
    tags: ["fiber", "complex carb", "breakfast"],
  },
  {
    id: "sweet_potato",
    name: "Sweet Potato",
    category: "carb",
    region: "usa",
    per100g: { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0 },
    commonPortions: [
      { label: "1 medium", grams: 130 },
      { label: "1 cup mashed", grams: 200 },
    ],
    tags: ["complex carb", "vitamin A", "fiber"],
  },
  {
    id: "beans",
    name: "Black Beans",
    category: "legume",
    region: "usa",
    per100g: { calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7 },
    commonPortions: [
      { label: "1 cup cooked", grams: 170 },
      { label: "1 can (drained)", grams: 250 },
    ],
    tags: ["protein", "fiber", "affordable"],
  },
  {
    id: "lentils",
    name: "Lentils",
    category: "legume",
    region: "usa",
    per100g: { calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9 },
    commonPortions: [
      { label: "1 cup cooked", grams: 198 },
      { label: "1/2 cup", grams: 99 },
    ],
    tags: ["protein", "fiber", "iron"],
  },
  {
    id: "broccoli",
    name: "Broccoli",
    category: "vegetable",
    region: "usa",
    per100g: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6 },
    commonPortions: [
      { label: "1 cup chopped", grams: 91 },
      { label: "1 cup cooked", grams: 156 },
    ],
    tags: ["vitamin C", "vitamin K", "fiber"],
  },
  {
    id: "spinach",
    name: "Spinach",
    category: "vegetable",
    region: "usa",
    per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    commonPortions: [
      { label: "1 cup raw", grams: 30 },
      { label: "1 cup cooked", grams: 180 },
    ],
    tags: ["iron", "vitamin K", "leafy green"],
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "fruit",
    region: "usa",
    per100g: { calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7 },
    commonPortions: [
      { label: "1 medium", grams: 150 },
      { label: "1/2 avocado", grams: 75 },
    ],
    tags: ["healthy fat", "potassium", "fiber"],
  },
  {
    id: "banana",
    name: "Banana",
    category: "fruit",
    region: "usa",
    per100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
    commonPortions: [
      { label: "1 medium", grams: 120 },
      { label: "1 large", grams: 150 },
    ],
    tags: ["potassium", "quick energy", "snack"],
  },
  {
    id: "apple",
    name: "Apple",
    category: "fruit",
    region: "usa",
    per100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
    commonPortions: [
      { label: "1 medium", grams: 180 },
      { label: "1 large", grams: 220 },
    ],
    tags: ["fiber", "vitamin C", "snack"],
  },
  {
    id: "blueberries",
    name: "Blueberries",
    category: "fruit",
    region: "usa",
    per100g: { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 },
    commonPortions: [
      { label: "1 cup", grams: 148 },
      { label: "1 pint", grams: 300 },
    ],
    tags: ["antioxidants", "vitamin C", "brain health"],
  },
  {
    id: "almonds",
    name: "Almonds",
    category: "fat",
    region: "usa",
    per100g: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 },
    commonPortions: [
      { label: "1 handful", grams: 28 },
      { label: "1 cup", grams: 143 },
    ],
    tags: ["protein", "healthy fat", "snack"],
  },
  {
    id: "peanut_butter",
    name: "Peanut Butter",
    category: "fat",
    region: "usa",
    per100g: { calories: 588, protein: 25.1, carbs: 20.0, fat: 50.4, fiber: 6.0 },
    commonPortions: [
      { label: "1 tablespoon", grams: 16 },
      { label: "2 tablespoons", grams: 32 },
    ],
    tags: ["protein", "healthy fat", "spread"],
  },
  {
    id: "olive_oil",
    name: "Olive Oil",
    category: "fat",
    region: "usa",
    per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    commonPortions: [
      { label: "1 tablespoon", grams: 14 },
      { label: "1 teaspoon", grams: 5 },
    ],
    tags: ["healthy fat", "cooking"],
  },
  {
    id: "tuna",
    name: "Tuna (Canned)",
    category: "protein",
    region: "usa",
    per100g: { calories: 128, protein: 25.5, carbs: 0, fat: 2.5, fiber: 0 },
    commonPortions: [
      { label: "1 can", grams: 142 },
      { label: "1 serving", grams: 85 },
    ],
    tags: ["lean protein", "omega-3", "affordable"],
  },
];

export function getAllFoods(): FoodItem[] {
  return [...FOODS];
}

export function getFoodsByRegion(region: FoodItem["region"]): FoodItem[] {
  return FOODS.filter((f) => f.region === region);
}

export function getFoodsByCategory(category: FoodItem["category"]): FoodItem[] {
  return FOODS.filter((f) => f.category === category);
}

export function searchFoods(query: string): FoodItem[] {
  const q = query.toLowerCase();
  return FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

export function getFoodById(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id);
}
