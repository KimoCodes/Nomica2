"use client";

import { useState } from "react";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Apple,
  Droplets,
  Calculator,
  Utensils,
  Dumbbell,
  Salad,
  Beef,
  Wheat,
} from "lucide-react";

type NutritionClientProps = {
  userName: string | null;
  userWeight: number | null;
};

const MEAL_GUIDELINES = [
  {
    meal: "Breakfast",
    time: "7:00 - 9:00 AM",
    icon: Apple,
    description: "Start your day with protein and complex carbs.",
    examples: ["Oatmeal with protein powder & berries", "Eggs & avocado toast", "Greek yogurt parfait with nuts"],
  },
  {
    meal: "Mid-Morning Snack",
    time: "10:00 - 11:00 AM",
    icon: Salad,
    description: "Keep energy stable with a light snack.",
    examples: ["Apple with almond butter", "Protein shake", "Handful of mixed nuts"],
  },
  {
    meal: "Lunch",
    time: "12:00 - 2:00 PM",
    icon: Utensils,
    description: "Balanced meal with lean protein, veggies, and carbs.",
    examples: ["Chicken breast with rice & broccoli", "Salmon salad with quinoa", "Turkey wrap with veggies"],
  },
  {
    meal: "Afternoon Snack",
    time: "3:00 - 4:00 PM",
    icon: Beef,
    description: "Fuel up before your workout.",
    examples: ["Rice cakes with peanut butter", "Cottage cheese with fruit", "Protein bar"],
  },
  {
    meal: "Dinner",
    time: "6:00 - 8:00 PM",
    icon: Wheat,
    description: "Recovery meal with protein and healthy fats.",
    examples: ["Lean steak with sweet potato", "Fish tacos with avocado", "Pasta with chicken & veggies"],
  },
];

const SUPPLEMENTS = [
  { name: "Creatine Monohydrate", dose: "5g daily", timing: "Any time", benefit: "Strength & muscle recovery" },
  { name: "Whey Protein", dose: "20-30g", timing: "Post-workout", benefit: "Muscle protein synthesis" },
  { name: "Omega-3 Fish Oil", dose: "2-3g", timing: "With meals", benefit: "Joint & heart health" },
  { name: "Vitamin D3", dose: "2000-4000 IU", timing: "Morning", benefit: "Bone health & immunity" },
  { name: "Magnesium", dose: "200-400mg", timing: "Before bed", benefit: "Sleep & recovery" },
];

export function NutritionClient({
  userName,
  userWeight,
}: NutritionClientProps) {
  const [weight, setWeight] = useState(userWeight?.toString() ?? "");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  const weightNum = parseFloat(weight) || 0;
  const weightInKg = unit === "lbs" ? weightNum / 2.205 : weightNum;

  const macros =
    weightInKg > 0
      ? {
          protein: Math.round(weightInKg * 2),
          carbs: Math.round(weightInKg * 4),
          fats: Math.round(weightInKg * 0.8),
          calories: Math.round(weightInKg * 2 * 4 + weightInKg * 4 * 4 + weightInKg * 0.8 * 9),
        }
      : null;

  return (
    <DashboardLayout
      title="Nutrition"
      navItems={[...CLIENT_NAV]}
      userName={userName ?? undefined}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Meal Plans & Performance Fuel
          </h2>
          <p className="mt-1 text-muted-foreground">
            Nutrition guidelines and macro calculations to support your training.
          </p>
        </div>

        {/* Macro Calculator */}
        <Card className="overflow-hidden">
          <div className="border-b border-border/50 bg-primary/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calculator className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Macro Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-calculated from your body weight
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Body Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Enter weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex rounded-xl border border-border/50">
                      <button
                        onClick={() => setUnit("kg")}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          unit === "kg"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        kg
                      </button>
                      <button
                        onClick={() => setUnit("lbs")}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          unit === "lbs"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                </div>

                {macros && (
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="mb-3 text-sm font-medium">
                      Daily Targets ({weightInKg.toFixed(1)} kg body weight)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-card p-3 text-center">
                        <p className="text-2xl font-bold text-primary">
                          {macros.protein}g
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Protein (2g/kg)
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-3 text-center">
                        <p className="text-2xl font-bold text-success">
                          {macros.carbs}g
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Carbs (4g/kg)
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-3 text-center">
                        <p className="text-2xl font-bold text-warning">
                          {macros.fats}g
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fats (0.8g/kg)
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-3 text-center">
                        <p className="text-2xl font-bold">
                          {macros.calories}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Calories
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Guidelines
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Dumbbell className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <strong className="text-foreground">Protein:</strong> 2g
                      per kg body weight for muscle repair and growth
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wheat className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>
                      <strong className="text-foreground">Carbs:</strong> 4g per
                      kg body weight for energy and performance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Beef className="mt-0.5 size-4 shrink-0 text-warning" />
                    <span>
                      <strong className="text-foreground">Fats:</strong> 0.8g per
                      kg body weight for hormones and recovery
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Droplets className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    <span>
                      <strong className="text-foreground">Water:</strong> Aim for
                      2-3 liters daily, more on training days
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plan */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Sample Meal Plan</h3>
          <div className="space-y-3">
            {MEAL_GUIDELINES.map((meal, index) => (
              <Card
                key={meal.meal}
                className={`animate-slide-up stagger-${index + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <meal.icon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">{meal.meal}</h4>
                        <Badge variant="outline" className="font-normal text-xs">
                          {meal.time}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {meal.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {meal.examples.map((ex) => (
                          <span
                            key={ex}
                            className="rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Supplements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Recommended Supplements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Supplement</th>
                    <th className="pb-3 font-medium">Dose</th>
                    <th className="pb-3 font-medium">Timing</th>
                    <th className="pb-3 font-medium">Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {SUPPLEMENTS.map((sup) => (
                    <tr
                      key={sup.name}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 font-medium">{sup.name}</td>
                      <td className="py-3 text-muted-foreground">{sup.dose}</td>
                      <td className="py-3 text-muted-foreground">{sup.timing}</td>
                      <td className="py-3 text-muted-foreground">{sup.benefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
