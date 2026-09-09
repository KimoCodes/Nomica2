"use client";

import { useState, useEffect, useCallback } from "react";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dumbbell,
  Utensils,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  getMyActiveExercisePlanAction,
  getMyActiveNutritionPlanAction,
  logPlanProgressAction,
} from "@/actions/plan.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type ExercisePlan = {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  coachNotes: string | null;
  exercises: {
    id: string;
    name: string;
    muscleGroup: string | null;
    dayOfWeek: number | null;
    order: number;
    sets: number | null;
    reps: number | null;
    durationMinutes: number | null;
    restSeconds: number | null;
    intensity: string | null;
    instructions: string | null;
    notes: string | null;
  }[];
  coachProfile: { user: { name: string | null } };
  progress: { completed: boolean; completionPercentage: number | null; date: Date }[];
};

type NutritionPlan = {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  status: string;
  dailyCalories: number | null;
  dailyProtein: number | null;
  dailyCarbs: number | null;
  dailyFat: number | null;
  dailyWaterMl: number | null;
  coachNotes: string | null;
  meals: {
    id: string;
    name: string;
    mealType: string;
    timeOfDay: string | null;
    order: number;
    foods: Record<string, unknown> | null;
    instructions: string | null;
    notes: string | null;
  }[];
  coachProfile: { user: { name: string | null } };
  progress: { completed: boolean; adherenceScore: number | null; date: Date }[];
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
  OTHER: "Other",
};

export default function MyPlanPage() {
  const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingProgress, setLoggingProgress] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const [exResult, nutResult] = await Promise.all([
        getMyActiveExercisePlanAction(),
        getMyActiveNutritionPlanAction(),
      ]);

      if (exResult.success) setExercisePlan(exResult.data as ExercisePlan | null);
      if (nutResult.success) setNutritionPlan(nutResult.data as NutritionPlan | null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  async function handleLogExerciseProgress(planId: string) {
    setLoggingProgress(planId);
    try {
      const result = await logPlanProgressAction({
        exercisePlanId: planId,
        completed: true,
        completionPercentage: 100,
      });
      if (result.success) {
        toast.success("Progress logged!");
        loadPlans();
      } else {
        toast.error(result.error?.message ?? "Failed to log progress");
      }
    } finally {
      setLoggingProgress(null);
    }
  }

  async function handleLogNutritionProgress(planId: string) {
    setLoggingProgress(planId);
    try {
      const result = await logPlanProgressAction({
        nutritionPlanId: planId,
        completed: true,
        adherenceScore: 100,
      });
      if (result.success) {
        toast.success("Progress logged!");
        loadPlans();
      } else {
        toast.error(result.error?.message ?? "Failed to log progress");
      }
    } finally {
      setLoggingProgress(null);
    }
  }

  const today = new Date().getDay();
  const todayExercises = exercisePlan?.exercises.filter((ex) => ex.dayOfWeek === today) ?? [];
  const groupedExercises = exercisePlan?.exercises.reduce((acc, ex) => {
    const day = ex.dayOfWeek ?? 0;
    if (!acc[day]) acc[day] = [];
    acc[day].push(ex);
    return acc;
  }, {} as Record<number, typeof exercisePlan.exercises>) ?? {};

  return (
    <DashboardLayout
      title="My Plan"
      navItems={[...CLIENT_NAV]}
      userName=""
      userRole="Client"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Plan</h2>
          <p className="mt-1 text-muted-foreground">
            Your personalized exercise and nutrition plans from your coach.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : !exercisePlan && !nutritionPlan ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Dumbbell className="mb-4 size-12 text-muted-foreground/30" />
              <p className="text-lg font-medium">No plan assigned yet</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Your coach will create personalized exercise and nutrition plans for you.
                Once assigned, they&apos;ll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="exercise">
            <TabsList>
              {exercisePlan && (
                <TabsTrigger value="exercise" className="gap-2">
                  <Dumbbell className="size-4" />
                  Exercise Plan
                </TabsTrigger>
              )}
              {nutritionPlan && (
                <TabsTrigger value="nutrition" className="gap-2">
                  <Utensils className="size-4" />
                  Nutrition Plan
                </TabsTrigger>
              )}
            </TabsList>

            {/* Exercise Plan */}
            {exercisePlan && (
              <TabsContent value="exercise" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{exercisePlan.name}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          by {exercisePlan.coachProfile.user.name}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {exercisePlan.description && (
                      <p className="text-sm text-muted-foreground">{exercisePlan.description}</p>
                    )}
                    {exercisePlan.goal && (
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="size-4 text-primary" />
                        <span className="font-medium">Goal:</span> {exercisePlan.goal}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {exercisePlan.startDate && (
                        <span>Starts {new Date(exercisePlan.startDate).toLocaleDateString()}</span>
                      )}
                      {exercisePlan.endDate && (
                        <span>Ends {new Date(exercisePlan.endDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    {exercisePlan.coachNotes && (
                      <div className="rounded-lg bg-primary/5 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Coach Notes</p>
                        <p className="text-sm">{exercisePlan.coachNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Today's Workout */}
                {todayExercises.length > 0 && (
                  <Card className="border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Dumbbell className="size-4 text-primary" />
                        Today&apos;s Workout ({DAY_NAMES[today]})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {todayExercises.map((ex) => (
                        <div key={ex.id} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{ex.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ex.sets && ex.reps && `${ex.sets} sets × ${ex.reps} reps`}
                              {ex.durationMinutes && !ex.sets && `${ex.durationMinutes} min`}
                              {ex.restSeconds && ` · ${ex.restSeconds}s rest`}
                            </p>
                          </div>
                          {ex.intensity && (
                            <Badge variant="outline" className="text-xs">
                              {ex.intensity}
                            </Badge>
                          )}
                        </div>
                      ))}
                      <Button
                        className="w-full mt-2"
                        onClick={() => handleLogExerciseProgress(exercisePlan.id)}
                        disabled={loggingProgress === exercisePlan.id}
                      >
                        {loggingProgress === exercisePlan.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 size-4" />
                        )}
                        Mark as Completed
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Weekly Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(groupedExercises)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([day, exercises]) => (
                        <div key={day}>
                          <p className="mb-2 text-sm font-medium text-muted-foreground">
                            {DAY_NAMES[Number(day)]}
                          </p>
                          <div className="space-y-2">
                            {exercises.map((ex) => (
                              <div key={ex.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">{ex.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {ex.sets && ex.reps && `${ex.sets} × ${ex.reps}`}
                                    {ex.durationMinutes && !ex.sets && `${ex.durationMinutes} min`}
                                    {ex.muscleGroup && ` · ${ex.muscleGroup}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                {/* Progress */}
                {exercisePlan.progress.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {exercisePlan.progress.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                            <span className="text-sm">
                              {new Date(p.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                            <Badge variant={p.completed ? "default" : "secondary"}>
                              {p.completed ? "Completed" : "In Progress"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* Nutrition Plan */}
            {nutritionPlan && (
              <TabsContent value="nutrition" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{nutritionPlan.name}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          by {nutritionPlan.coachProfile.user.name}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {nutritionPlan.description && (
                      <p className="text-sm text-muted-foreground">{nutritionPlan.description}</p>
                    )}
                    {nutritionPlan.goal && (
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="size-4 text-primary" />
                        <span className="font-medium">Goal:</span> {nutritionPlan.goal}
                      </div>
                    )}

                    {/* Macro Targets */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {nutritionPlan.dailyCalories && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-lg font-bold">{nutritionPlan.dailyCalories}</p>
                          <p className="text-xs text-muted-foreground">Calories</p>
                        </div>
                      )}
                      {nutritionPlan.dailyProtein && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-lg font-bold">{nutritionPlan.dailyProtein}g</p>
                          <p className="text-xs text-muted-foreground">Protein</p>
                        </div>
                      )}
                      {nutritionPlan.dailyCarbs && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-lg font-bold">{nutritionPlan.dailyCarbs}g</p>
                          <p className="text-xs text-muted-foreground">Carbs</p>
                        </div>
                      )}
                      {nutritionPlan.dailyFat && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-lg font-bold">{nutritionPlan.dailyFat}g</p>
                          <p className="text-xs text-muted-foreground">Fat</p>
                        </div>
                      )}
                    </div>

                    {nutritionPlan.coachNotes && (
                      <div className="rounded-lg bg-primary/5 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Coach Notes</p>
                        <p className="text-sm">{nutritionPlan.coachNotes}</p>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleLogNutritionProgress(nutritionPlan.id)}
                      disabled={loggingProgress === nutritionPlan.id}
                    >
                      {loggingProgress === nutritionPlan.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 size-4" />
                      )}
                      Log Today&apos;s Adherence
                    </Button>
                  </CardContent>
                </Card>

                {/* Meals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Daily Meals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {nutritionPlan.meals.map((meal) => (
                      <div key={meal.id} className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{MEAL_TYPE_LABELS[meal.mealType] ?? meal.mealType}</Badge>
                          {meal.timeOfDay && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" /> {meal.timeOfDay}
                            </span>
                          )}
                        </div>
                        <p className="font-medium">{meal.name}</p>
                        {meal.instructions && (
                          <p className="mt-1 text-sm text-muted-foreground">{meal.instructions}</p>
                        )}
                        {meal.foods && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {Object.entries(meal.foods as Record<string, string>).map(([key, val]) => (
                              <p key={key}>• {key}: {val}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Progress */}
                {nutritionPlan.progress.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {nutritionPlan.progress.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                            <span className="text-sm">
                              {new Date(p.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                            <Badge variant={p.completed ? "default" : "secondary"}>
                              {p.completed ? "Adhered" : "Partial"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
