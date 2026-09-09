"use client";

import { useState, useEffect, useCallback } from "react";
import { COACH_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dumbbell,
  Utensils,
  Plus,
  Search,
  Loader2,
  Users,
  Eye,
  Pencil,
  Archive,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import {
  listCoachExercisePlansAction,
  listCoachNutritionPlansAction,
  createExercisePlanAction,
  createNutritionPlanAction,
  getExercisePlanAction,
  getNutritionPlanAction,
  updateExercisePlanAction,
  updateNutritionPlanAction,
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
  exercises: { id: string; name: string; muscleGroup: string | null; dayOfWeek: number | null; order: number; sets: number | null; reps: number | null; durationMinutes: number | null }[];
  clientProfile: { user: { id: string; name: string; email: string } };
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
  meals: { id: string; name: string; mealType: string; order: number }[];
  clientProfile: { user: { id: string; name: string; email: string } };
};

const MUSCLE_GROUPS = ["CHEST", "BACK", "LEGS", "GLUTES", "SHOULDERS", "ARMS", "CORE", "MOBILITY", "CARDIO"];
const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ExerciseItem = {
  name: string;
  muscleGroup: string;
  dayOfWeek: number;
  order: number;
  sets: number;
  reps: number;
  durationMinutes: number;
  restSeconds: number;
  instructions: string;
};

type MealItem = {
  name: string;
  mealType: string;
  timeOfDay: string;
  order: number;
  instructions: string;
};

export default function CoachPlansPage() {
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("exercise");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<"exercise" | "nutrition">("exercise");
  const [creating, setCreating] = useState(false);

  // Create form state
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [clientId, setClientId] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [dailyCalories, setDailyCalories] = useState("");
  const [dailyProtein, setDailyProtein] = useState("");
  const [dailyCarbs, setDailyCarbs] = useState("");
  const [dailyFat, setDailyFat] = useState("");
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { name: "", muscleGroup: "CHEST", dayOfWeek: 1, order: 0, sets: 3, reps: 10, durationMinutes: 0, restSeconds: 60, instructions: "" },
  ]);
  const [meals, setMeals] = useState<MealItem[]>([
    { name: "", mealType: "BREAKFAST", timeOfDay: "08:00", order: 0, instructions: "" },
  ]);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const [exResult, nutResult] = await Promise.all([
        listCoachExercisePlansAction({ limit: 100 }),
        listCoachNutritionPlansAction({ limit: 100 }),
      ]);
      if (exResult.success && exResult.data) setExercisePlans(exResult.data.plans as unknown as ExercisePlan[]);
      if (nutResult.success && nutResult.data) setNutritionPlans(nutResult.data.plans as unknown as NutritionPlan[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const filteredExercisePlans = exercisePlans.filter((p) =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientProfile.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredNutritionPlans = nutritionPlans.filter((p) =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientProfile.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function resetForm() {
    setPlanName("");
    setPlanDescription("");
    setPlanGoal("");
    setClientId("");
    setCoachNotes("");
    setDailyCalories("");
    setDailyProtein("");
    setDailyCarbs("");
    setDailyFat("");
    setExercises([{ name: "", muscleGroup: "CHEST", dayOfWeek: 1, order: 0, sets: 3, reps: 10, durationMinutes: 0, restSeconds: 60, instructions: "" }]);
    setMeals([{ name: "", mealType: "BREAKFAST", timeOfDay: "08:00", order: 0, instructions: "" }]);
  }

  async function handleCreate() {
    if (!planName || !clientId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      if (createType === "exercise") {
        const validExercises = exercises.filter((e) => e.name);
        if (validExercises.length === 0) {
          toast.error("Add at least one exercise");
          return;
        }
        const result = await createExercisePlanAction({
          clientProfileId: clientId,
          name: planName,
          description: planDescription || undefined,
          goal: planGoal || undefined,
          coachNotes: coachNotes || undefined,
          exercises: validExercises.map((e, i) => ({ ...e, order: i })),
        });
        if (result.success) {
          toast.success("Exercise plan created!");
          setShowCreate(false);
          resetForm();
          loadPlans();
        } else {
          toast.error(result.error?.message ?? "Failed to create");
        }
      } else {
        const validMeals = meals.filter((m) => m.name);
        if (validMeals.length === 0) {
          toast.error("Add at least one meal");
          return;
        }
        const result = await createNutritionPlanAction({
          clientProfileId: clientId,
          name: planName,
          description: planDescription || undefined,
          goal: planGoal || undefined,
          coachNotes: coachNotes || undefined,
          dailyCalories: dailyCalories ? Number(dailyCalories) : undefined,
          dailyProtein: dailyProtein ? Number(dailyProtein) : undefined,
          dailyCarbs: dailyCarbs ? Number(dailyCarbs) : undefined,
          dailyFat: dailyFat ? Number(dailyFat) : undefined,
          meals: validMeals.map((m, i) => ({ ...m, order: i })),
        });
        if (result.success) {
          toast.success("Nutrition plan created!");
          setShowCreate(false);
          resetForm();
          loadPlans();
        } else {
          toast.error(result.error?.message ?? "Failed to create");
        }
      }
    } finally {
      setCreating(false);
    }
  }

  function addExercise() {
    setExercises([...exercises, { name: "", muscleGroup: "CHEST", dayOfWeek: 1, order: exercises.length, sets: 3, reps: 10, durationMinutes: 0, restSeconds: 60, instructions: "" }]);
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index));
  }

  function updateExercise(index: number, field: keyof ExerciseItem, value: string | number) {
    const updated = [...exercises];
    (updated[index] as any)[field] = value;
    setExercises(updated);
  }

  function addMeal() {
    setMeals([...meals, { name: "", mealType: "LUNCH", timeOfDay: "12:00", order: meals.length, instructions: "" }]);
  }

  function removeMeal(index: number) {
    setMeals(meals.filter((_, i) => i !== index));
  }

  function updateMeal(index: number, field: keyof MealItem, value: string | number) {
    const updated = [...meals];
    (updated[index] as any)[field] = value;
    setMeals(updated);
  }

  return (
    <DashboardLayout
      title="Plans"
      navItems={[...COACH_NAV]}
      userName=""
      userRole="Coach"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Client Plans</h2>
            <p className="mt-1 text-muted-foreground">
              Create and manage personalized plans for your clients.
            </p>
          </div>
          <Button onClick={() => { resetForm(); setShowCreate(true); }}>
            <Plus className="mr-2 size-4" />
            Create Plan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Dumbbell className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{exercisePlans.length}</p>
                  <p className="text-xs text-muted-foreground">Exercise Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <Utensils className="size-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nutritionPlans.length}</p>
                  <p className="text-xs text-muted-foreground">Nutrition Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Users className="size-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set([...exercisePlans.map((p) => p.clientProfile.user.id), ...nutritionPlans.map((p) => p.clientProfile.user.id)]).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Clients with Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Plans</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="exercise">
                  Exercise ({filteredExercisePlans.length})
                </TabsTrigger>
                <TabsTrigger value="nutrition">
                  Nutrition ({filteredNutritionPlans.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="exercise" className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                  </div>
                ) : filteredExercisePlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                    <Dumbbell className="mb-3 size-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium">No exercise plans</p>
                    <p className="mt-1 text-xs text-muted-foreground">Create your first exercise plan for a client.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredExercisePlans.map((plan) => (
                      <div key={plan.id} className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/30">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Dumbbell className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {plan.clientProfile.user.name} · {plan.exercises.length} exercises
                          </p>
                        </div>
                        <Badge variant={plan.status === "ACTIVE" ? "default" : "secondary"}>
                          {plan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="nutrition" className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                  </div>
                ) : filteredNutritionPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                    <Utensils className="mb-3 size-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium">No nutrition plans</p>
                    <p className="mt-1 text-xs text-muted-foreground">Create your first nutrition plan for a client.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNutritionPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/30">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                          <Utensils className="size-5 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {plan.clientProfile.user.name} · {plan.meals.length} meals
                            {plan.dailyCalories && ` · ${plan.dailyCalories} cal`}
                          </p>
                        </div>
                        <Badge variant={plan.status === "ACTIVE" ? "default" : "secondary"}>
                          {plan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create {createType === "exercise" ? "Exercise" : "Nutrition"} Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={createType === "exercise" ? "default" : "outline"}
                size="sm"
                onClick={() => setCreateType("exercise")}
              >
                <Dumbbell className="mr-2 size-4" /> Exercise
              </Button>
              <Button
                variant={createType === "nutrition" ? "default" : "outline"}
                size="sm"
                onClick={() => setCreateType("nutrition")}
              >
                <Utensils className="mr-2 size-4" /> Nutrition
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-id">Client Profile ID *</Label>
              <Input
                id="client-id"
                placeholder="Paste client profile ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name *</Label>
              <Input
                id="plan-name"
                placeholder="e.g., 8-Week Strength Program"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-goal">Goal</Label>
              <Input
                id="plan-goal"
                placeholder="e.g., Build lean muscle"
                value={planGoal}
                onChange={(e) => setPlanGoal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-desc">Description</Label>
              <Textarea
                id="plan-desc"
                placeholder="Describe the plan..."
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-notes">Coach Notes</Label>
              <Textarea
                id="coach-notes"
                placeholder="Notes for the client..."
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Exercise Plan Items */}
            {createType === "exercise" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button size="sm" variant="outline" onClick={addExercise}>
                    <Plus className="mr-1 size-3" /> Add
                  </Button>
                </div>
                {exercises.map((ex, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Exercise {i + 1}</span>
                      {exercises.length > 1 && (
                        <Button size="icon" variant="ghost" className="size-6" onClick={() => removeExercise(i)}>
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Exercise name"
                      value={ex.name}
                      onChange={(e) => updateExercise(i, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={ex.muscleGroup ?? "CHEST"} onValueChange={(v) => v && updateExercise(i, "muscleGroup", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MUSCLE_GROUPS.map((mg) => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={String(ex.dayOfWeek)} onValueChange={(v) => updateExercise(i, "dayOfWeek", Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DAY_NAMES.map((d, idx) => <SelectItem key={idx} value={String(idx)}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Sets</Label>
                        <Input type="number" value={ex.sets} onChange={(e) => updateExercise(i, "sets", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Reps</Label>
                        <Input type="number" value={ex.reps} onChange={(e) => updateExercise(i, "reps", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Rest (s)</Label>
                        <Input type="number" value={ex.restSeconds} onChange={(e) => updateExercise(i, "restSeconds", Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nutrition Plan Items */}
            {createType === "nutrition" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Daily Calories</Label>
                    <Input type="number" placeholder="2000" value={dailyCalories} onChange={(e) => setDailyCalories(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Protein (g)</Label>
                    <Input type="number" placeholder="150" value={dailyProtein} onChange={(e) => setDailyProtein(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Carbs (g)</Label>
                    <Input type="number" placeholder="200" value={dailyCarbs} onChange={(e) => setDailyCarbs(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fat (g)</Label>
                    <Input type="number" placeholder="70" value={dailyFat} onChange={(e) => setDailyFat(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Meals</Label>
                    <Button size="sm" variant="outline" onClick={addMeal}>
                      <Plus className="mr-1 size-3" /> Add
                    </Button>
                  </div>
                  {meals.map((meal, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Meal {i + 1}</span>
                        {meals.length > 1 && (
                          <Button size="icon" variant="ghost" className="size-6" onClick={() => removeMeal(i)}>
                            <Trash2 className="size-3" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Meal name"
                        value={meal.name}
                        onChange={(e) => updateMeal(i, "name", e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={meal.mealType ?? "BREAKFAST"} onValueChange={(v) => v && updateMeal(i, "mealType", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {MEAL_TYPES.map((mt) => <SelectItem key={mt} value={mt}>{mt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={meal.timeOfDay}
                          onChange={(e) => updateMeal(i, "timeOfDay", e.target.value)}
                        />
                      </div>
                      <Textarea
                        placeholder="Instructions / foods..."
                        value={meal.instructions}
                        onChange={(e) => updateMeal(i, "instructions", e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !planName || !clientId}>
              {creating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
