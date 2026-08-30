"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Utensils } from "lucide-react";
import { toast } from "sonner";

type FoodItem = {
  id: string;
  name: string;
  category: string;
  region: string;
  per100g: { calories: number; protein: number; carbs: number; fat: number };
  commonPortions: { label: string; grams: number }[];
  tags: string[];
};

type MealLogInput = {
  foodId: string;
  portionGrams: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "OTHER";
};

export function FoodSearchLogger() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionGrams, setPortionGrams] = useState("");
  const [mealType, setMealType] = useState<MealLogInput["mealType"]>("LUNCH");
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchFoods = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/client/nutrition?action=search&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.foods ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const loadToday = useCallback(async () => {
    try {
      const res = await fetch("/api/client/nutrition?action=today");
      const data = await res.json();
      setTotals(data.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } catch {
      // ignore
    }
  }, []);

  const logFood = async () => {
    if (!selectedFood || !portionGrams) return;
    setLoading(true);
    try {
      const res = await fetch("/api/client/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: selectedFood.id,
          portionGrams: parseInt(portionGrams, 10),
          mealType,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to log meal. Please try again.");
        return;
      }
      toast.success(`Logged ${selectedFood.name} (${portionGrams}g)`);
      setSelectedFood(null);
      setPortionGrams("");
      await loadToday();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryColors: Record<string, string> = {
    protein: "bg-red-500/10 text-red-500",
    carb: "bg-blue-500/10 text-blue-500",
    vegetable: "bg-green-500/10 text-green-500",
    fruit: "bg-purple-500/10 text-purple-500",
    dairy: "bg-yellow-500/10 text-yellow-500",
    fat: "bg-orange-500/10 text-orange-500",
    legume: "bg-teal-500/10 text-teal-500",
    grain: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="size-4" aria-hidden="true" />
            Search Local Foods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search foods (e.g., beans, chicken, avocado)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchFoods()}
              aria-label="Search foods"
            />
            <Button onClick={searchFoods} disabled={searching}>
              {searching ? "..." : "Search"}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 max-h-64 overflow-y-auto">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setPortionGrams(food.commonPortions[0]?.grams.toString() ?? "100");
                  }}
                  aria-label={`Select ${food.name}, ${food.per100g.calories} calories per 100g`}
                  className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all hover:bg-accent/30 ${
                    selectedFood?.id === food.id ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.per100g.calories} cal/100g
                    </p>
                  </div>
                  <Badge variant="secondary" className={categoryColors[food.category] ?? ""}>
                    {food.category}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFood && (
        <Card aria-live="polite">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Utensils className="size-4" aria-hidden="true" />
                Log {selectedFood.name}
              </span>
              <button onClick={() => setSelectedFood(null)} aria-label="Close food log">
                <X className="size-4 text-muted-foreground" aria-hidden="true" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="portion-grams" className="text-xs font-medium text-muted-foreground">Portion (g)</label>
                <Input
                  id="portion-grams"
                  type="number"
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="meal-type" className="text-xs font-medium text-muted-foreground">Meal</label>
                <select
                  id="meal-type"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealLogInput["mealType"])}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snack</option>
                </select>
              </div>
            </div>

            {selectedFood.commonPortions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedFood.commonPortions.map((p) => (
                  <button
                    key={p.grams}
                    onClick={() => setPortionGrams(p.grams.toString())}
                    className="rounded-full bg-muted/50 px-2 py-0.5 text-xs hover:bg-muted"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-muted/30 p-3 text-xs">
              <p className="font-medium">Estimated macros for {portionGrams || 0}g:</p>
              <p>
                {Math.round((selectedFood.per100g.calories * parseInt(portionGrams || "0", 10)) / 100)} cal
                {" · "}
                {Math.round((selectedFood.per100g.protein * parseInt(portionGrams || "0", 10)) / 100 * 10) / 10}g protein
                {" · "}
                {Math.round((selectedFood.per100g.carbs * parseInt(portionGrams || "0", 10)) / 100 * 10) / 10}g carbs
                {" · "}
                {Math.round((selectedFood.per100g.fat * parseInt(portionGrams || "0", 10)) / 100 * 10) / 10}g fat
              </p>
            </div>

            <Button onClick={logFood} disabled={loading || !portionGrams} className="w-full">
              {loading ? "Logging..." : "Log Meal"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Today&apos;s Nutrition</CardTitle>
          <button onClick={loadToday} className="text-xs text-primary hover:underline" aria-label="Refresh nutrition totals">
            Refresh
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4" aria-live="polite" aria-label="Daily nutrition totals">
            <div className="rounded-xl bg-muted/30 p-3">
              <p className="text-xl font-bold">{totals.calories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <p className="text-xl font-bold">{totals.protein}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <p className="text-xl font-bold">{totals.carbs}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <p className="text-xl font-bold">{totals.fat}g</p>
              <p className="text-xs text-muted-foreground">Fat</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
